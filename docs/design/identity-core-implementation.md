# Identity Core — Implementação (Sprint 1, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. Este documento substitui as previsões conceituais de `identity-core.md` por fatos — o que foi de fato construído.

## 1. Arquitetura

### 1.1 O novo modelo

```
Person (profiles)
   ↓
Accounts[] (accounts — Vínculos de Autenticação)
   ↓
Character (characters — hoje 1:1 com Person, ver Seção 6)
   ↓
Kingdom (streamer_channels/character.primary_channel_id — nome físico
          não muda nesta Sprint, ver Seção 6)
   ↓
World (packages/shared — regiões/biomas, já 100% agnóstico)
```

`profiles` passa a representar uma **Pessoa** pura — nunca mais uma identidade Twitch. `accounts` é o **Vínculo de Autenticação** novo (docs/design/identity-core.md Seção 2): uma Pessoa pode ter zero, um, ou vários vínculos (`provider` ∈ `twitch | google | discord | kick | youtube | email`), nunca o inverso. Nesta Sprint, só `"twitch"` é populado de verdade — os outros cinco existem como valor válido da coluna, arquitetura pronta, zero OAuth novo implementado.

### 1.2 Player Session vs. World Session

**Player Session** — `middleware/auth.ts`'s mecanismo de sessão (cookie HTTP-only + tabela `sessions` + resolução via `profileId`) já era, antes desta Sprint, inteiramente agnóstico de provedor. Ele ganhou um nome formal: `export type PlayerSession = AuthContext` — um alias, não um tipo novo, para não quebrar nenhum import existente. É a sessão de "este jogador está autenticado agora".

**World Session** — não é um objeto de runtime novo, é uma distinção conceitual que já existia implicitamente e que este documento agora nomeia: o Reino/Mundo (hoje `streamer_channels`, os dados de Boss, Kingdom Prestige, Economy, Chronicles) persiste inteiramente no banco, independente de qualquer `PlayerSession` existir. Um Reino sem nenhum jogador logado continua tendo tesouro, cargos, Crônica — nada disso é limpo quando a última sessão expira. Construir uma classe `WorldSession` de verdade sem nenhuma feature real que a consuma (Housing/Treasury ainda não existem — são Sprints futuras per `new-roadmap.md`) seria inventar abstração sem uso, o que este projeto explicitamente evita (D7 — arquitetura incremental). A separação real e testável hoje é: **Player Session vive em `sessions` (efêmera); World Session é, na prática, todo o resto do schema (persistente).**

### 1.3 Providers nunca donos do personagem (Fase 8)

`AuthProvider` (`packages/shared/src/types.ts`) formaliza os seis provedores como valor de dado, nunca como identidade estrutural. Nenhum `character`/`profile` guarda uma referência rígida a "Twitch" — a única coluna que ainda existe (`profiles.twitch_id`) é legado, não mais `NOT NULL`, e todo código novo deveria preferir `accounts` para resolver identidade.

### 1.4 Engine desacoplada da Twitch (Fase 9)

**Achado real desta auditoria**: a Engine (`apps/api/src/engine/`) já era, por contrato de tipos, agnóstica — `engine/types.ts` já documentava explicitamente, desde antes desta Sprint, "nenhum tipo aqui depende de Twitch". A exceção real e já registrada (`docs/game-design-bible/02-principles.md`, princípio 3) era de **implementação**, não de tipo: três Systems (`XPSystemV2`, `WelcomeRewardSystem`, `BossSpawnSystem`) importavam `isChannelLive()` de `services/twitch.service.ts` **diretamente**.

Corrigido por inversão de dependência: nova interface `PresenceProvider` (`engine/types.ts`) com um único método `isLive(contextId): Promise<boolean>`. Os três Systems agora recebem um `PresenceProvider` no construtor em vez de importar Twitch. `services/presence.service.ts` exporta `twitchPresenceProvider` — a única implementação real hoje, delegando para a mesma `isChannelLive()` de sempre (zero mudança de comportamento). `server.ts` é o único lugar que decide qual Provider usar.

**Prova concreta**: `XPSystemV2.test.ts` (novo) testa `checkLiveStatusPerChannel` com um `PresenceProvider` falso, sem nenhuma chamada de rede — antes desta Sprint, isso não era possível sem mockar um `fetch` global contra a API da Twitch.

### 1.5 Eventos (Fase 10)

Auditados os 17 tipos de `GameEvent` (`engine/types.ts`). Nenhum usa vocabulário "Viewer"/"Channel-como-Twitch" no nome — já eram `session.started` (não `ViewerJoined`), `kingdom.role_changed` (não `ChannelPrestigeChanged`). O campo `channelId`, presente em `ActiveSession`/`SessionStartedEvent`/eventos de Boss/Kingdom, continua existindo com esse nome — renomeá-lo para `kingdomId` é trabalho de schema da Kingdom Domain Sprint (`new-roadmap.md` Item 2), fora do escopo desta Sprint (Identity Core não toca `streamer_channels`).

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `apps/api/src/config/schema.ts` | `profiles.twitch_id` não é mais `NOT NULL`; nova tabela `accounts` |
| `apps/api/src/config/database.ts` | Migração idempotente de rebuild de tabela (`profiles`, drop NOT NULL) |
| `apps/api/src/engine/types.ts` | Nova interface `PresenceProvider` |
| `apps/api/src/services/presence.service.ts` (novo) | `twitchPresenceProvider`, implementação concreta de `PresenceProvider` |
| `apps/api/src/services/account.service.ts` (novo) | `linkAccount`/`findProfileByAccount`/`listAccountsForProfile` |
| `apps/api/src/services/account.service.test.ts` (novo) | 6 testes |
| `apps/api/src/systems/XPSystemV2.ts` | Recebe `PresenceProvider` injetado, não importa Twitch |
| `apps/api/src/systems/XPSystemV2.test.ts` (novo) | 5 testes, `checkLiveStatusPerChannel`/`reduceSessionsToCharacters` exportadas |
| `apps/api/src/systems/WelcomeRewardSystem.ts` | Recebe `PresenceProvider` injetado |
| `apps/api/src/systems/BossSpawnSystem.ts` | Recebe `PresenceProvider` injetado |
| `apps/api/src/middleware/auth.ts` | `export type PlayerSession = AuthContext` (alias, Fase 5) |
| `apps/api/src/routes/auth.ts` | Chama `linkAccount()` aditivamente após resolver o profile |
| `apps/api/src/server.ts` | Instancia `twitchPresenceProvider`, injeta nos 3 Systems |
| `packages/shared/src/types.ts` | `Profile.twitch_id` nullable; novos tipos `AuthProvider`/`Account` |

## 3. Justificativa Técnica

- **`accounts` como tabela nova, não reaproveitamento de `streamer_channels`**: `streamer_channels` é o Reino (domínio de Kingdom, Sprint futura), `accounts` é o Vínculo de Autenticação (domínio de Identity). São dois conceitos diferentes que hoje colidiam parcialmente (`streamer_channels.twitch_id`) — separá-los agora evita que a Kingdom Domain Sprint precise desfazer uma fusão incorreta depois.
- **Migração via rebuild de tabela, não `ALTER COLUMN`**: SQLite não suporta `DROP NOT NULL` diretamente — o rebuild (criar nova, copiar, dropar, renomear) é o padrão documentado do próprio SQLite para esse caso, feito em transação com `foreign_keys` temporariamente desligado (seguro: nenhuma linha filha é tocada, só a definição da tabela pai muda).
- **`PresenceProvider` como interface mínima (um método)**: resolve exatamente a exceção já registrada, sem inventar um sistema de Presence/Platform maior (Sprint futura, se necessário) — D7 (arquitetura incremental).
- **`linkAccount()` chamado aditivamente em `routes/auth.ts`, `profiles.twitch_id` continua sendo escrito**: nenhum caminho de leitura existente quebra; a prova de que a nova arquitetura funciona vem de rodar ao lado da antiga, não de substituí-la de uma vez.

## 4. Testes

- **Novos**: 6 (`account.service.test.ts`) + 5 (`XPSystemV2.test.ts`) = 11 testes novos.
- **Shared**: 507/507 ✅ (inalterado — Identity Core não toca `packages/shared/src` além do arquivo de tipos, que não tem teste próprio pois é só interface).
- **Web**: 98/98 ✅ (inalterado).
- **API**: os 11 testes novos passaram 100% em 4 execuções completas da suíte + execuções isoladas. A suíte completa oscilou entre 0-3 falhas por execução, sempre confinadas a `SQLiteCharacterRepository.test.ts` (dívida técnica permanente, documentada desde antes desta Sprint) e `economy.service.test.ts` (família de flakiness SQLITE_BUSY sob carga concorrente de arquivo real, também pré-existente — `economy.service.ts` não foi tocado nesta Sprint).
- **Typecheck**: shared/web limpos. API: exatamente a mesma baseline pré-existente (EventBus.test.ts/GameEngine.test.ts/SQLiteBossRepository.ts/SQLiteBossParticipationRepository.ts/SQLiteCharacterRepository.test.ts) — um erro novo foi introduzido e corrigido no próprio processo (`account.service.ts`'s cast de `.all()`, padrão `as unknown as X[]` já usado em todo o resto do código), zero erros novos remanescentes.
- **Build** (`build:web`): limpo.

## 5. Browser Validation

Fluxo completo: Login (via fixture reproduzindo exatamente o caminho real de `routes/auth.ts`: profile + `linkAccount("twitch", ...)` + sessão) → Adventure (idle rodando) → Inventory → City → **Merchant** (venda real: "Cinto vendido por 7 de Ouro") → **Blacksmith** (melhoria real: "Botas melhorado por 80 de Ouro. Poder agora: 41") → **Salvage** (desmontagem real: "Amuleto desmontado. Recebeu 8 de materials") → Adventure (idle nunca parou). Zero erros de console em todo o fluxo. `accounts` confirmado gravando corretamente: `{"provider":"twitch","provider_user_id":"qa-identity-core-...", ...}`.

## 6. Compatibilidade

RC1 íntegro; Economy Core íntegro; Merchant/Blacksmith/Salvage/Equipment Lock íntegros (confirmado por transação real de cada um, não só renderização); nenhuma regra de negócio em componente React; nenhuma regra da API movida para o Shared que já não estivesse lá. `characters.profile_id` permanece `UNIQUE` (1 Character por Person) — deliberadamente não relaxado nesta Sprint, ver Seção 7.

## 7. Problemas Encontrados

- **A relação Person→Characters[]→"Current Character" do brief é mais ampla do que esta Sprint implementou.** Hoje `characters.profile_id` continua `UNIQUE` (uma Pessoa, um Personagem) — suportar múltiplos personagens por Pessoa é uma feature genuinamente maior (tela de seleção de personagem, "personagem atual" persistido, migração de dados existentes) que não é implicada por nenhum documento de design da era Kingdom até agora (nem `kingdom-domain-2.0.md`, nem `citizen-system.md` mencionam multi-personagem). Relaxar o `UNIQUE` sem essa feature real por trás seria mudança de schema sem consumidor — decisão explícita de não fazer isso nesta Sprint, registrada aqui em vez de feita silenciosamente.
- **Fusão de contas não resolvida** (já nomeada como risco em aberto em `identity-core.md` Seção 7): se um futuro provedor tentar vincular um `(provider, provider_user_id)` que já pertence a outro `profileId`, `linkAccount()` lança (constraint UNIQUE) — comportamento correto de "rejeitar silenciosamente o dado errado", mas nenhuma UX de fusão de conta existe. Fica para a Login Providers Sprint decidir.
- **Auditoria completa de todos os ~150 arquivos que continham a string "channel"/"viewer"/"stream" não foi feita linha a linha** — o escopo real de Identity Core (identidade/sessão/Engine) foi auditado a fundo; grande parte dos resultados do grep bruto eram falsos positivos (texto narrativo de NPC, nomes de componente não relacionados como `ExpeditionCard`/`EventChannel` abstrato). O que pertence genuinamente a Kingdom (`streamer_channels`, `viewer_sessions`, `channel_rankings`, Kingdom Prestige membership) foi identificado e **deliberadamente não tocado** — é trabalho da Kingdom Domain Sprint, per `new-roadmap.md`.

## 8. Próximos Passos

**Login Providers** é a próxima Sprint (já a mesma Sprint 1 combinada em `new-roadmap.md`, mas explicitamente NÃO implementada agora, per a instrução "Não implementar Google/Discord/Kick/YouTube/Twitch OAuth" desta Sprint). Com a arquitetura de `accounts`/`AuthProvider`/`PlayerSession` já pronta, essa Sprint deveria ser mecânica: uma rota de callback por provedor, convergindo todas em `findProfileByAccount()` → `linkAccount()` → `createSession()`, exatamente o mesmo padrão que `routes/auth.ts` já prova funcionar para Twitch.

---

*Referências: `docs/design/identity-core.md`, `docs/design/login-providers.md`, `docs/design/world-foundation-4.0.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/new-roadmap.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D7 respeitado), ADR-0001.*
