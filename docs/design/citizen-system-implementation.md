# Citizen System — Implementação (Sprint 3, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. Este documento substitui as previsões conceituais de `citizen-system.md` por fatos — o que foi de fato construído nesta Sprint específica (a ligação permanente Character↔Kingdom nascendo como cidadão de primeira classe; nenhuma casa, guilda, imposto, guerra ou consequência de troca de Reino).

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Auditoria dedicada de todo lugar onde "pertencimento" ainda depende de `viewer`/`viewer_session`/`streamer`/`streamer_channel`/`channel`/`presence`/`prestige`/`raid`/`session`/`audience`/`followers`:

| Ocorrência | Classificação |
|---|---|
| `kingdom-prestige.service.ts` — 6 `computeX()` leem `viewer_sessions`/`channel_rankings`; comentário do próprio arquivo diz "'Membro' de um Reino é definido por ter ao menos uma linha em viewer_sessions ou channel_rankings" | **Modelo antigo, permanece intocado nesta Sprint** — mesma decisão já tomada em `kingdom-domain-implementation.md` Seção 8; Hall da Fama/6 cargos continuam funcionando exatamente como antes, lendo a fonte de dado antiga. Reconciliar (fazer Prestige ler `citizens` em vez de `viewer_sessions`) é trabalho de uma Sprint futura, não pedido nesta. |
| `identity.service.ts` — subquery residual sobre `viewer_sessions.first_ping_at` para achar "primeiro a chegar" | **Permanece** — mesma classificação de `world-foundation-4.0.md` Seção 2.6, não tocado por nenhuma Sprint até agora. |
| `characters.primary_channel_id` (referencia `streamer_channels`) | **Permanece** — não usado por nenhum código novo desta Sprint; decisão de se/quando ele passa a apontar para `kingdoms.id` é do Citizen System *seguinte* (ver Seção 10). |
| `sessions`/`middleware/auth.ts` | Infraestrutura, já agnóstica desde Identity Core — nenhuma mudança necessária. |
| Todo código **novo** desta Sprint (`citizen.service.ts`, `routes/citizen.ts`) | Nunca importa/consulta `viewer_sessions`, `channel_rankings`, `streamer_channels` ou qualquer campo `channelId`/`StreamerId` — fala exclusivamente `character_id`/`kingdom_id`. |

Nenhuma nova dependência de audiência foi introduzida.

### 1.2 O domínio Citizen (Fase 2)

```
Citizen
  id                     — identificador estável
  character_id           — UNIQUE: um personagem só tem uma linha aqui
  kingdom_id             — o Reino ao qual pertence agora
  joined_at              — quando esta residência começou (reinicia ao trocar)
  status                 — 'active' | 'left'
  rank                   — 'residente' | 'cidadao' | 'veterano' | 'lenda'
                            (só 'residente' é atribuído nesta Sprint)
  is_founder, is_leader  — nunca colunas — sempre derivados comparando
                            characters.profile_id com
                            kingdoms.founder_profile_id/leader_profile_id
  notes                  — livre, não usado nesta Sprint
  last_activity          — atualizado a cada join/leave
```

Esta Sprint implementa apenas o **Estágio 2 (Residente)** dos cinco estágios documentados em `citizen-system.md` (Visitante → Residente → Cidadão → Veterano → Lenda): entrar num Reino cria/atualiza uma linha com `rank = 'residente'`. A progressão para Cidadão/Veterano/Lenda (métricas de tempo + contribuição real) é **deliberadamente não implementada** — mapeada para uma Sprint futura, per a mesma disciplina de "sem implementar funcionalidades futuras" já seguida em Kingdom Domain.

### 1.3 Um personagem, um Reino por vez (Fase 7)

`citizens.character_id` é `UNIQUE`. Entrar num Reino diferente do atual **atualiza a mesma linha** (troca `kingdom_id`, reinicia `joined_at` e `rank`) em vez de criar uma segunda — implementando literalmente "trocar de Reino é permitido... reinicia o relógio de cidadania" (`citizen-system.md` Seção 4), sem a parte de preservar histórico completo multi-Reino (fora de escopo, per Fase 7 do brief: "apenas troca, nada mais"). Sair (`leaveKingdom`) marca `status = 'left'` sem apagar a linha nem implementar qualquer penalidade.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `apps/api/src/config/schema.ts` | Nova tabela `citizens` (aditiva, nenhuma tabela antiga tocada) |
| `apps/api/src/services/citizen.service.ts` (novo) | `joinKingdom`/`leaveKingdom`/`getCitizen`/`listCitizens`/`listKingdomCitizens` |
| `apps/api/src/services/citizen.service.test.ts` (novo) | 9 testes |
| `apps/api/src/routes/citizen.ts` (novo) | `POST /api/kingdom/join`, `POST /api/kingdom/leave`, `GET /api/citizen`, `GET /api/kingdom/:id/citizens` |
| `apps/api/src/server.ts` | Registra `citizenRoutes` |
| `apps/web/src/pages/KingdomsPage.tsx` | Entrar/Sair do Reino + lista de cidadãos no detalhe |
| `apps/web/styles.css` | `.citizen-membership`/`.citizen-list` |
| `packages/shared/src/types.ts` | `Citizen`, `CitizenRank`, `CitizenStatus` |

*(Arquivos de Identity Core/Kingdom Domain que ainda aparecem em `git diff` — `account.service.ts`, `presence.service.ts`, `kingdom.service.ts`, etc. — pertencem a Sprints anteriores, ainda não commitados; não são desta Sprint.)*

## 3. Modelo do Citizen

Ver Seção 1.2. Decisão central: `is_founder`/`is_leader` **nunca são colunas persistidas** — são sempre calculados no momento da leitura (join com `kingdoms`), para nunca ficarem desatualizados se a liderança de um Reino mudar de mãos numa Sprint futura (Kingdom Wars, Eleição, etc.). `character_display_name` também é derivado (join com `characters`), só para permitir uma lista de cidadãos legível na UI mínima desta Sprint — não é um campo "de negócio" do domínio Citizen.

## 4. Banco de Dados

Nenhuma migração `ALTER TABLE` — `citizens` é inteiramente nova (`CREATE TABLE IF NOT EXISTS`), criada automaticamente no boot. `kingdoms`/`streamer_channels`/demais tabelas não foram tocadas.

## 5. Serviços

**`citizen.service.ts`**: `joinKingdom(characterId, kingdomId)` (rejeita Reino inexistente, rejeita reentrar no mesmo Reino já ativo, troca de Reino atualiza a mesma linha), `leaveKingdom(characterId)` (rejeita se não é cidadão de nada, marca `status='left'`), `getCitizen(characterId)` (cidadania ativa ou `null`), `listCitizens()` (todos os cidadãos ativos, qualquer Reino), `listKingdomCitizens(kingdomId)` (cidadãos ativos de um Reino específico, mais antigos primeiro). Nenhuma regra política/econômica/de guerra.

## 6. Rotas

`POST /api/kingdom/join` (autenticado, body `{kingdom_id}`), `POST /api/kingdom/leave` (autenticado), `GET /api/citizen` (autenticado, cidadania do jogador atual), `GET /api/kingdom/:id/citizens` (pública). Confirmado sem colisão com `routes/kingdom.ts` (`/api/kingdom/:channel/me`, sufixo literal diferente) nem `routes/kingdoms.ts` (`/api/kingdom/:slug`, 2 segmentos vs. `/api/kingdom/:id/citizens`, 3 segmentos com sufixo `/citizens` nunca igual a `/me`).

## 7. Interface Mínima

Em `KingdomsPage.tsx`: tela de lista mostra "Você pertence ao Reino X" / "Você ainda não pertence a nenhum Reino"; tela de detalhe mostra "Entrar no Reino" ou "Sair do Reino" (conforme pertencimento atual) + lista simples de cidadãos (`character_display_name`, 👑 se fundador). Nenhum mapa, nenhuma casa, nenhum ranking — exatamente como pedido.

## 8. Testes

9 testes novos (`citizen.service.test.ts`): `joinKingdom` (Reino inexistente rejeitado, criação como residente ativo, reentrada no mesmo Reino rejeitada, troca de Reino atualiza a mesma linha), `leaveKingdom` (sem cidadania rejeitado, saída marca `left` e `getCitizen` passa a devolver `null`), `getCitizen`/`listKingdomCitizens`/`listCitizens`. Passaram 100% em todas as execuções. Suíte completa da API rodada 5 vezes: falhas confinadas exclusivamente à dívida SQLITE_BUSY já documentada (`economy.service.test.ts`, `SQLiteCharacterRepository.test.ts`, `blacksmith.service.test.ts` sob concorrência pesada) — nunca `citizen.service.test.ts`/`kingdom.service.test.ts`. Shared 507/507, Web 98/98 inalterados.

## 9. Typecheck / Build

Shared e Web: zero erros. API: mesma baseline de dívida pré-existente exata (EventBus.test.ts/GameEngine.test.ts channelId+Promise<void>, SQLiteBossRepository/SQLiteBossParticipationRepository SQLOutputValue cast, SQLiteCharacterRepository.test.ts TS1308), zero erros novos. Build (`build:web`) limpa.

## 10. Browser Validation

Fluxo completo: Login (fixture com personagem+500 Gold+3 itens) → Adventure (idle rodando, item real equipado) → Inventory (itens da mochila corretos) → City (12 prédios intactos, Sucateiro incluso) → **Kingdoms** ("Você ainda não pertence a nenhum Reino" → clique em "Reino Oficial" → "Entrar no Reino" → "Você pertence a este Reino" + "QA Cidadão" aparece na lista de cidadãos) → **Blacksmith** ("Cinto melhorado por 40 de Ouro. Poder agora: 42.") → **Merchant** ("Adaga vendido por 14 de Ouro.") → **Salvage** ("Adaga desmontado. Recebeu 8 de materials.") → **Adventure** (idle nunca parou — Nível 1→8, 51 encontros, 737 Gold ao voltar). Zero erros de console em todo o fluxo. QA artifacts (script + `apps/api/data/`) removidos, confirmado via `git status --short`.

## 11. Compatibilidade

RC1/Economy/Merchant/Blacksmith/Salvage/Equipment Lock/Living Character/Living World/Backpack/City/Kingdom Domain — todos confirmados funcionando exatamente iguais, com transações reais (não só renderização). Nenhuma regra de negócio em componente React (`KingdomsPage.tsx` só chama `api.get`/`api.post` e renderiza).

## 12. Problemas Encontrados

Um: backticks dentro de um comentário SQL (`leave`) quebraram o template literal do schema, mesma classe de erro já documentada em `kingdom-domain-implementation.md` — corrigido antes de qualquer teste rodar.

## 13. Limitações (o que esta Sprint deliberadamente não fez)

- **Progressão de estágio (Cidadão/Veterano/Lenda) não implementada.** `rank` sempre nasce `'residente'`; as métricas de tempo/contribuição real que moveriam um cidadão adiante são escopo de uma Sprint futura.
- **`kingdom-prestige.service.ts` não foi religado a `citizens`.** Continua lendo `viewer_sessions`/`channel_rankings` exatamente como antes — os 6 cargos de prestígio não sabem que `citizens` existe.
- **Nenhuma consequência de troca de Reino.** Sem impostos, sem penalidade, sem histórico completo preservado por Reino anterior — apenas a troca em si, per Fase 7/DoD do brief.
- **`characters.primary_channel_id` não foi tocado nem redirecionado para `kingdoms.id`.**
- **Nenhuma edição de `rank`/`notes` via API** — os campos existem no domínio mas não há rota que os escreva além do que `joinKingdom` define automaticamente.

## 14. Próximos Passos (Housing Phase I)

Housing (próxima Sprint per `docs/design/new-roadmap.md`) depende de Citizen System: "só Residentes/Cidadãos podem construir" — `getCitizen(characterId)` desta Sprint já expõe exatamente o sinal que Housing precisa consumir (cidadania ativa + `kingdom_id`) sem reinventar a busca. Antes de Housing, valeria decidir se a progressão de estágio (Seção 13) é pré-requisito real (ex.: só Cidadão pode construir, não Residente) ou se Housing pode nascer aceitando qualquer Residente — decisão de game design, não arquitetura.

---

*Referências: `docs/design/citizen-system.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/kingdom-domain-implementation.md`, `docs/design/identity-core-implementation.md`, `docs/design/new-roadmap.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D2/D5/D7 respeitados).*
