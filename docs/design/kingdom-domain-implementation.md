# Kingdom Domain — Implementação (Sprint 2, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. Este documento substitui as previsões conceituais de `kingdom-domain-2.0.md` por fatos — o que foi de fato construído nesta Sprint específica (o domínio Kingdom nascendo como cidadão de primeira classe; nenhuma política, economia, casas ou guerra).

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Reconfirmada a auditoria completa já registrada em `docs/design/world-foundation-4.0.md` Seção 2 (a mesma pesquisa que sustentou a Sprint "Foundation Refactor"). Nenhuma nova dependência de `viewer`/`streamer`/`channel`/`creator`/`live`/`broadcast`/`raid`/`stream`/`overlay`/`followers`/`audience` foi encontrada além do já documentado — a única ocorrência nova encontrada nesta varredura foi um nome de item cosmético (`"Anel do Raid"`, flavor text de catálogo), sem relação arquitetural.

Classificação (reaproveitada da auditoria anterior, aplicada ao escopo desta Sprint):

| Categoria | Itens |
|---|---|
| **Infraestrutura** (permanece, muda só de contexto) | `sessions`/`middleware/auth.ts` (já agnóstico desde Identity Core) |
| **Modelo antigo** (não tocado nesta Sprint, ver Seção 7) | `streamer_channels`, `viewer_sessions`, `channel_rankings`, `kingdom_roles`, `bosses.channel_id`, `kingdom-prestige.service.ts` |
| **Integração** (permanece, agora explicitamente opcional) | `twitch.service.ts`, `channel.service.ts`, rotas `/api/overlay/*` |

### 1.2 O domínio Kingdom (Fase 2)

```
Kingdom
  id                  — identificador estável
  name                — nome de exibição
  slug                — identificador legível em URL, único
  description         — texto livre
  founder_profile_id  — quem fundou; fato histórico permanente, nunca muda
  leader_profile_id   — quem lidera agora; hoje sempre = founder (liderança
                         plugável é escopo do Citizen System, não aqui)
  status              — 'active' | 'dormant'
  visibility          — 'public' | 'private'
  banner, symbol, motto — campos cosméticos, opcionais
  created_at, updated_at
```

`history` (do brief) é **deliberadamente não implementado** nesta Sprint — mapeia para uma futura tabela de Crônica do Reino (mesmo padrão de `character_chronicles`), fora de escopo per Fase 2 do brief ("sem implementar funcionalidades futuras").

### 1.3 Reino pertence ao World, não a uma plataforma (Fase 7)

Nenhuma coluna, tipo ou rota do domínio Kingdom novo referencia Twitch/Kick/YouTube/Discord. `founder_profile_id`/`leader_profile_id` referenciam `profiles` (a Pessoa, per Identity Core) — nunca `accounts`/`AuthProvider` diretamente. Um Reino fundado por uma Pessoa que só tem vínculo de e-mail (hipoteticamente, quando Login Providers existir) funcionaria exatamente igual a um fundado por uma Pessoa com vínculo Twitch — nenhum código do domínio Kingdom faz essa distinção.

### 1.4 Engine (Fase 5)

**Achado real**: os contratos da Engine (`engine/types.ts`) já eram, desde a Sprint Identity Core, genéricos em tipo (`channelId: string`, nunca um tipo Twitch-específico). O que faltava era o nome conceitual correto. Adicionado `export type KingdomId = string` com um comentário extenso explicando por que o rename físico de `channelId` → `kingdomId` nos ~15 arquivos que já usam esse campo (SessionManager, GameEngine, XPSystemV2, WelcomeRewardSystem, todos os Systems de Boss, ChronicleSystem, IdentitySystem, KingdomPrestigeSystem, KingdomNewsSystem, ExpeditionSystem) **não foi feito nesta Sprint** — é a mesma Sprint que migraria `streamer_channels` para `kingdoms` de verdade, ainda não decidida. O que esta Sprint garante, e que é verificável, é que nenhum código NOVO (o `kingdom.service.ts`, as rotas `/api/kingdom*`) introduz uma dependência nova de `channelId`/`StreamerId`/`ViewerSession` — todo ele nasce falando `kingdomId`/`Kingdom`.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `apps/api/src/config/schema.ts` | Nova tabela `kingdoms` (aditiva, `streamer_channels` intocada) |
| `apps/api/src/engine/types.ts` | `export type KingdomId = string` (documentado, sem rename de campo existente) |
| `apps/api/src/services/kingdom.service.ts` (novo) | `createKingdom`/`getKingdomBySlug`/`getKingdomById`/`listKingdoms`/`slugify` |
| `apps/api/src/services/kingdom.service.test.ts` (novo) | 9 testes |
| `apps/api/src/routes/kingdoms.ts` (novo) | `GET /api/kingdoms`, `GET /api/kingdom/:slug`, `POST /api/kingdom` |
| `apps/api/src/server.ts` | Registra `kingdomDomainRoutes` |
| `apps/web/src/pages/KingdomsPage.tsx` (novo) | Tela mínima: lista + detalhe + formulário de fundação |
| `apps/web/src/lib/router.tsx` | Rota `/app/kingdoms` |
| `apps/web/src/components/ui/AppNav.tsx` | Link "👑 Reinos" |
| `apps/web/styles.css` | `.kingdom-list`/`.kingdom-list-item` |
| `packages/shared/src/types.ts` | `Kingdom`, `KingdomStatus`, `KingdomVisibility` |

*(Arquivos de `apps/api/src/systems/*`/`middleware/auth.ts`/`routes/auth.ts`/`services/account.service.ts`/`services/presence.service.ts` que aparecem em `git diff` pertencem à Sprint Identity Core anterior, ainda não commitados — não são desta Sprint.)*

## 3. Modelo de Domínio do Reino

Ver Seção 1.2. Decisão de design central: **fundação (permanente) separada de liderança (transitória)** — mesmo princípio já estabelecido em `kingdom-domain-2.0.md`. Esta Sprint só implementa o caso trivial (founder = leader sempre) porque liderança plugável (Coroa/Eleito/Guilda/Conquista) é, por instrução explícita do brief, escopo de Sprints futuras.

## 4. Migrações Realizadas

Nenhuma migração de `ALTER TABLE` — a tabela `kingdoms` é inteiramente nova (`CREATE TABLE IF NOT EXISTS`), criada automaticamente no boot como qualquer tabela nova deste schema. `streamer_channels`/demais tabelas existentes não foram tocadas.

## 5. Serviços e Rotas Criados

**`kingdom.service.ts`**: `createKingdom(founderProfileId, {name, description?, slug?})` (gera slug automaticamente se omitido, rejeita nome vazio e slug duplicado), `getKingdomBySlug`, `getKingdomById`, `listKingdoms` (só públicos, mais recentes primeiro). Nenhuma lógica política/econômica/de guerra.

**Rotas** (`routes/kingdoms.ts`, registradas como `kingdomDomainRoutes`): `GET /api/kingdoms` (lista pública), `GET /api/kingdom/:slug` (detalhe), `POST /api/kingdom` (autenticado, funda). Nome de arquivo plural (`kingdoms.ts`) deliberadamente distinto do já existente `routes/kingdom.ts` (Kingdom Prestige, rota `/api/kingdom/:channel/me`) — confirmado sem colisão de padrão de URL (2 segmentos vs. 3).

## 6. Testes Adicionados

9 testes novos (`kingdom.service.test.ts`): `slugify` (normalização), `createKingdom` (founder=leader, slug automático, nome vazio rejeitado, slug duplicado rejeitado), `getKingdomBySlug`/`getKingdomById`/`listKingdoms`. Passaram 100% em 3 execuções completas da suíte da API.

**Totais**: API 121 testes (112 + 9 novos), Shared 507/507 (inalterado), Web 98/98 (inalterado). Falhas da suíte completa confinadas exclusivamente à dívida já documentada (`SQLiteCharacterRepository.test.ts`, `economy.service.test.ts` SQLITE_BUSY). Typecheck: shared/web limpos; API na mesma baseline pré-existente exata, zero erros novos. Build limpa.

## 7. Compatibilidade

RC1/Economy/Merchant/Blacksmith/Salvage/Equipment Lock/Living Character/Living World/Backpack — todos confirmados funcionando exatamente iguais via Browser Validation com transações reais (não só renderização). Nenhuma regra de negócio em componente React (`KingdomsPage.tsx` só chama `api.get`/`api.post` e renderiza a resposta). Nenhuma regra movida para `packages/shared` que devesse ficar em `apps/api`, e vice-versa.

## 8. Limitações (o que esta Sprint deliberadamente não fez)

- **`streamer_channels` não foi migrada/renomeada para `kingdoms`.** As duas tabelas coexistem. Kingdom Prestige System, Boss, City, Overlay, Ranking continuam lendo `streamer_channels` exatamente como antes — o novo domínio `Kingdom` é genuinamente paralelo, não uma substituição. Reconciliar os dois (fazer Boss/Prestige/City passarem a falar do `Kingdom` novo) é uma Sprint futura maior, fora do escopo aqui.
- **`channelId` não foi renomeado para `kingdomId` na Engine.** Documentado como `KingdomId` (tipo), não como rename físico — ver Seção 1.4.
- **Liderança é sempre `founder = leader`.** Nenhum modelo de Coroa/Eleição/Guilda/Conquista implementado — isso é Citizen System e Sprints posteriores.
- **Nenhuma edição/exclusão/troca de liderança** — exatamente como o brief pediu ("Nada além disso. Sem editar. Sem excluir. Sem mudar líder.").
- **`GuildBuilding.tsx`/Kingdom Prestige Hall da Fama continuam consumindo o modelo antigo** — não foram religados ao novo `Kingdom`.

## 9. Browser Validation

Fluxo completo: Login (fixture reproduzindo o caminho real) → Adventure (idle rodando) → Inventory → City → **Kingdoms** (estado vazio correto → fundação real: "Reino Oficial"/`reino-oficial` → aparece na lista → detalhe mostra nome/slug/descrição/data/status) → **Merchant** (venda real: "Botas vendido por 32 de Ouro") → **Blacksmith** (melhoria real: "Peitoral melhorado por 80 de Ouro") → **Salvage** (desmontagem real: "Adaga desmontado. Recebeu 8 de materials") → Adventure (idle nunca parou). Zero erros de console em todo o fluxo.

## 10. Próximos Passos para Citizen System

Citizen System (próxima Sprint per `docs/design/new-roadmap.md`) deveria: (a) substituir a definição de pertencimento hoje baseada em `viewer_sessions` (Kingdom Prestige System) por uma derivada de jogo real (expedições/presença/contribuição no Reino novo); (b) decidir se/quando `characters.primary_channel_id` passa a apontar para `kingdoms.id` em vez de `streamer_channels.id`; (c) implementar os 5 estágios de cidadania já documentados em `docs/design/citizen-system.md`. O `kingdom.service.ts` desta Sprint já expõe `getKingdomById`/`getKingdomBySlug` prontos para o Citizen System consumir sem precisar reinventar a busca de Reino.

---

*Referências: `docs/design/world-foundation-4.0.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/citizen-system.md`, `docs/design/new-roadmap.md`, `docs/design/identity-core-implementation.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D2/D5/D7 respeitados).*
