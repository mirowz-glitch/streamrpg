# Kingdom Integration Phase I — Implementação (Sprint 8, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. Twitch/Kick/YouTube/Discord (ou qualquer provedor futuro) passam a ser anexos formais de um Reino — nunca sua identidade, nunca um requisito. `KingdomIntegration` chega ao formato completo pedido nesta Sprint (id/kingdom_id/provider/external_id/display_name/status/connected_at/metadata), substituindo a versão mínima construída incidentalmente em World Autonomy Phase I (Sprint 7, Fase 6).

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Esta Sprint reconfirma — sem descobrir nada novo — a classificação já produzida em detalhe pela auditoria de World Autonomy Phase I (`docs/design/world-autonomy-phase1-implementation.md` Seção 1.1), que já cobria `streamer_channels`/`twitch_id`/`channel_id`/`viewer_sessions`/Kingdom Prestige por canal/`channel_rankings` (leaderboard por canal). Nenhuma referência nova a `broadcaster` foi encontrada em todo o projeto. Classificação reafirmada:

| Achado | Categoria |
|---|---|
| `kingdom-prestige.service.ts` (6 cargos, Hall da Fama, `channel_rankings`) | **legado** — não tocado |
| `channel.service.ts`, `routes/overlay.ts`, `routes/ranking.ts` | **integração** — Overlay é feature de streamer, correto ficar Twitch-específico |
| `engine/types.ts`'s `channelId` em ~15 arquivos (fisicamente `streamer_channels.id`) | **persistência/legado** — renomeação para `kingdomId` continua fora de escopo (D7) |
| `playerPresenceProvider`/`twitchPresenceProvider` (World Autonomy) | **gameplay/integração** — já resolvido, Systems usam só `PlayerPresence` |
| `kingdom_integrations` (Sprint 7, versão mínima) | **persistência** — substituída nesta Sprint pela versão completa |

### 1.2 KingdomIntegration completo (Fase 2)

A versão de Sprint 7 (`provider: "twitch" | "kick" | "youtube"`, só `external_channel_id`) já violava o espírito desta Sprint por ter um enum fechado. Reescrita para o formato pedido:

```
KingdomIntegration
  id
  kingdom_id
  provider           — string livre, nunca union fechada
  external_id
  display_name
  status             — 'connected' | 'disconnected'
  connected_at
  metadata           — objeto livre (JSON), opcional
```

`provider` é deliberadamente `string`, não `"twitch" | "kick" | "youtube"` — testado explicitamente (Seção 7) conectando um provider inventado ("um-provedor-que-nao-existe-ainda") sem qualquer alteração de schema/tipo necessária.

### 1.3 Desconectar nunca apaga (mesma filosofia de Housing/Real Estate)

`disconnectKingdomIntegration()` só muda `status` para `'disconnected'` — a linha permanece, preservando quando foi conectada e a qual canal externo. Reconectar o mesmo provider reusa a mesma linha (`UNIQUE (kingdom_id, provider)`), nunca cria uma segunda.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/types.ts` | `KingdomIntegration`/`KingdomIntegrationStatus` reescritos (provider aberto, +display_name/status/metadata) |
| `apps/api/src/config/schema.ts` | `kingdom_integrations` reescrita (provider sem CHECK, +display_name/status/metadata) |
| `apps/api/src/services/kingdomIntegration.service.ts` | Reescrito: `connect`/`disconnect`/`list`/`get` |
| `apps/api/src/services/kingdomIntegration.service.test.ts` | Reescrito: 11 testes |
| `apps/api/src/routes/kingdomIntegration.ts` (novo) | 4 rotas |
| `apps/api/src/server.ts` | Registra `kingdomIntegrationRoutes` antes de `kingdomDomainRoutes` |
| `apps/web/src/pages/KingdomIntegrationsPage.tsx` (novo) | Lista + Conectar/Desconectar |
| `apps/web/src/lib/api.ts` | +`api.delete()` (faltava, primeiro uso real nesta Sprint) |
| `apps/web/src/lib/router.tsx` | Rota `/app/kingdom-integrations` |
| `apps/web/src/components/ui/AppNav.tsx` | Link "🔌 Integrações" |

## 3. KingdomIntegration

Ver Seção 1.2. `provider` nunca limita valores — provado em teste com "discord" e um provider fictício, ambos funcionando sem qualquer mudança de código.

## 4. Persistência

`kingdom_integrations` inteiramente reescrita (aditiva ao domínio Kingdom, nunca uma coluna nova em `kingdoms`) — `provider TEXT NOT NULL` sem `CHECK`, `display_name`/`status`/`metadata` novos. `UNIQUE (kingdom_id, provider)` continua garantindo no máximo uma linha por (Reino, provedor). `metadata` serializado em JSON numa coluna `TEXT`, igual ao padrão já usado por `houses.history`.

## 5. Serviços

`connectKingdomIntegration(kingdomId, provider, {externalId, displayName, metadata?})` — upsert: cria se não existe, atualiza (incluindo `status` de volta a `'connected'`) se já existe. `disconnectKingdomIntegration(id)` — marca `'disconnected'`, rejeita id inexistente com `{success: false, reason: "not-found"}`, nunca apaga a linha. `listKingdomIntegrations(kingdomId)` — todas as integrações (conectadas e desconectadas), para a UI mostrar status real. `getKingdomIntegration(id)` — busca individual. Nenhuma função lê ou escreve a tabela `kingdoms`.

## 6. Rotas

`POST /api/kingdom/integration` (autenticada, body: kingdom_id/provider/external_id/display_name/metadata?), `DELETE /api/kingdom/integration/:id` (autenticada), `GET /api/kingdom/integrations` (autenticada, resolve o Reino do próprio chamador via cidadania — mesmo padrão de `GET /api/citizen` self vs. `GET /api/kingdom/:id/citizens` explícito), `GET /api/kingdom/:id/integrations` (pública, explícita). `kingdomIntegrationRoutes` registrado **antes** de `kingdomDomainRoutes` em `server.ts` — `GET /api/kingdom/integrations` (2 segmentos, estática) colidiria com `GET /api/kingdom/:slug` (2 segmentos, dinâmica) se a ordem fosse invertida, mesma classe de bug já documentada e evitada em Real Estate Phase I.

## 7. Interface

`KingdomIntegrationsPage.tsx`: lista simples (Provider/Nome/Status/botão Conectar-ou-Desconectar), formulário de "Conectar" com 3 campos (provider/ID externo/nome) — sem OAuth real, mock deliberado de infraestrutura per o brief. Resolve o Reino via `GET /api/kingdom/integrations` (self). Testado conectando Twitch e Kick, desconectando Twitch (status muda para "Desconectado", botão vira "Reconectar", linha nunca some da lista).

## 8. Testes

11 testes novos em `kingdomIntegration.service.test.ts`: conectar (Twitch, provider genérico/Discord/inventado, Kick+YouTube sem privilégio), reconectar atualiza a linha, metadata persistido como objeto, `getKingdomIntegration` null para inexistente, `disconnectKingdomIntegration` (rejeita id inexistente, desconecta sem apagar, reconectar após desconectar reusa a mesma linha). `kingdom.service.test.ts` (pré-existente) passou nas 3 execuções finais, confirmando nenhuma regressão em Kingdom Domain. Shared 515/515. API 169-170/170 em 3 execuções — a única falha restante é `SQLiteCharacterRepository.test.ts` (dívida pré-existente, TS1308, documentada desde antes desta Sprint). Nenhum teste antigo removido.

## 9. Browser Validation

Fluxo (E-mail substituindo Google — mesma justificativa documentada em World Autonomy Phase I, sem credenciais OAuth reais neste ambiente): Login por e-mail → fundou e entrou no Reino Oficial → Integrações: conectou Twitch, conectou Kick (ambos aparecem "Conectado") → desconectou Twitch (vira "Desconectado", linha preservada, "Reconectar" disponível) → Merchant (venda real, 200) → Blacksmith (rejeição correta por saldo insuficiente, não um bug) → Salvage (desmontagem real, +materials) → Housing (construiu Casa) → Mercado Imobiliário (anunciou, listou, cancelou) → Adventure (idle nunca parou, Nível 1→3 durante toda a validação). Zero erros de console em toda a sessão. Nenhuma aba Twitch/Kick real foi aberta — tudo via o formulário mock.

## 10. Compatibilidade

Adventure/Idle, Economy (Merchant/Blacksmith/Salvage), Housing, Real Estate, Citizen, Kingdom — todos confirmados funcionando via transações reais na mesma sessão de validação, com um personagem criado sem nenhum provedor de streaming.

## 11. Problemas Encontrados

**`api.delete()` não existia em `apps/web/src/lib/api.ts`** — só `get`/`post`/`patch` até esta Sprint. Adicionado (`delete: <T,>(path) => request<T>(path, {method: "DELETE"})`), primeiro consumidor real sendo `KingdomIntegrationsPage.tsx`'s botão Desconectar.

**Bug de backtick-em-comentário-SQL reincidiu, corrigido antes de qualquer teste rodar**: o comentário original da tabela `kingdom_integrations` usava `` `provider` `` (com backticks) dentro do template literal de `schema.ts`, quebrando o parse — a 5ª vez que essa classe exata de erro aparece nesta sessão (Kingdom Domain, Citizen System, Housing, e agora aqui). Corrigido removendo os backticks do comentário.

**Arquivos de banco em disco desatualizados (`data/streamrpg.db`, `data/streamrpg-test.db`) causaram `no column named external_id`**: como a tabela usa `CREATE TABLE IF NOT EXISTS`, um banco físico já existente (criado antes desta Sprint reescrever o schema) manteve o formato antigo (`external_channel_id`, sem `display_name`/`status`/`metadata`), quebrando os testes novos até os arquivos serem apagados manualmente (com o servidor de dev parado para liberar o lock do arquivo). Diferente da dívida de migração já documentada (`duplicate column name: power_score`, ainda presente e ainda flaky sob concorrência) — este era um problema de **schema physically stale**, não de corrida entre testes, resolvido apagando `data/*.db*` uma vez.

## 12. Próxima Sprint

Nenhuma indicada explicitamente no brief. Candidatos naturais, per `docs/design/new-roadmap.md`: Kingdom Treasury (item 6, adiado por duas Sprints seguidas) ou o restante de Cross Platform (item 11) — Chat/Notificações/Raids/Recompensas cosméticas, agora que a infraestrutura de integração (`kingdom_integrations`) já existe em formato completo para sustentá-los, quando o usuário decidir avançar além de infraestrutura pura.

---

*Referências: `docs/design/world-foundation-4.0.md`, `docs/design/cross-platform.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/world-autonomy-phase1-implementation.md`, `docs/design/new-roadmap.md`, `docs/architecture/decisions.md` (D1/D2/D5/D7 respeitados).*
