# Sockets & Gemas — Phase I

**Sprint:** 20 — Sockets & Gemas Phase I (A Primeira Camada de Customização Permanente)
**Status:** Camada de catálogo (SocketLayout/GemDefinition/GemRegistry/SocketCompatibility) é infraestrutura nova, nunca wireada na geração real. Camada de instância (Socket/Gem, persistência, inserir/remover, auto-unsocket em Merchant/Salvage) **já existia e está em produção desde a Sprint 15** — esta Sprint confirma e documenta essa parte, não a reimplementa.

## Fase 1 — o que a auditoria encontrou

Antes de qualquer linha nova, a auditoria desta Sprint (Fase 1) confirmou que o sistema central de Sockets & Gemas já existe por completo desde a Sprint 15:
- `packages/shared/src/socket/types.ts` — `Socket`, `SocketConfiguration`, `Gem`, `GemHistory` já definidos.
- `packages/shared/src/socket/sockets.ts` — `deriveSocketCountFromSeed`, `createSocketConfiguration`, `setSocketState`, `deriveSocketGroups`, `addSocketLink` já implementados.
- `apps/api/src/services/gem.service.ts` — `socketGem`, `unsocketGem`, `unsocketAllGemsForItem`, `listCharacterGems` já implementados, transacionais, protegidos pelo Equipment Lock.
- `apps/api/src/routes/items.ts` — `GET /api/items/gems`, `POST /api/items/gem/socket`, `POST /api/items/gem/unsocket` já expostos.
- `apps/web/src/pages/InventoryPage.tsx` — indicadores visuais de Socket vazio/ocupado/desabilitado (○/●/◐) já renderizados.

O que faltava, e é o trabalho real desta Sprint: uma camada de **catálogo** (o que uma Gema/Layout de Socket É, não o que um personagem específico possui), inexistente até agora — `SocketLayout`, `GemDefinition`, `GemRegistry`, `GemCategory`, `SocketCompatibility` — e a exibição do **nome** da Gema na UI (Fase 10, além dos indicadores já existentes).

## Fase 8 — Persistência (confirmada, não nova)

A suíte `apps/api/src/services/gem.service.test.ts` (pré-existente, Sprint 15) cobre e confirma, rodada nesta Sprint: criação de Gema solta, listagem, inserir em Socket vazio, rejeição de Socket já preenchido, rejeição de item sem Sockets, swap ao socketar uma Gema já socketada em outro item, respeito ao Equipment Lock, remoção de Socket (Gema volta a ficar solta), rejeição de desocketar uma Gema já solta, auto-unsocket em venda (Merchant) e em desmonte (Salvage), e confirmação de que Blacksmith (upgrade) nunca remove uma Gema socketada. 12/12 testes passando. Nenhuma tabela nova foi necessária: `SocketLayout`/`GemDefinition`/`SocketCompatibility` são registries puros de `packages/shared`, sem persistência própria — eles descrevem o catálogo, não o estado de um personagem.

## Fase 9 — Economia

Regras oficiais, exigidas pelo brief (Fase 9), e já garantidas pela implementação existente desde a Sprint 15:

> **As Gemas nunca evoluem. Sempre são negociáveis. Sempre podem ser removidas.**
> **Remover uma Gema nunca a destrói — ela volta para o inventário.**
> **Sockets pertencem ao Item. Gemas pertencem ao Jogador.**

### "Gemas nunca evoluem"

Garantido por construção nesta Sprint: `GemDefinition` (o catálogo novo) não expõe `level`, `experience` ou `quality` — nenhum campo existe para uma Gema evoluir. Um teste dedicado (`socketGemPhase1.test.ts`) afirma isso explicitamente. As colunas `level`/`experience`/`quality` da tabela de instância (Sprint 15) continuam existindo no schema, mas são tratadas como campos mortos por todo código novo — nenhuma função desta Sprint lê ou escreve neles. "Gema Rubi III" é o próprio `id`/`displayName` da definição: o tier já nasce embutido na identidade, nunca é um progresso.

### "Sempre negociáveis / sempre removíveis / nunca destruídas ao remover"

Já implementado e confirmado via `gem.service.ts`:
- `unsocketGem(characterId, gemId)` — remove a Gema do Socket; a Gema não é deletada, apenas seus campos `socketed_item_id`/`socketed_socket_id` são limpos, e ela volta a aparecer em `listCharacterGems` como solta.
- `unsocketAllGemsForItem(itemId, reason: "sold" | "salvaged")` — chamado automaticamente por Merchant e Salvage antes do item sair da posse do personagem, garantindo que nenhuma Gema seja destruída junto com o item.
- `GemDefinition.tradable` (novo campo desta Sprint) é `true` para todas as Gemas de exemplo, refletindo a regra "sempre negociáveis" por padrão — existe apenas para permitir uma exceção futura (ex.: Gema de Quest), nunca para restringir as Gemas de hoje.

### "Sockets pertencem ao Item. Gemas pertencem ao Jogador."

Confirmado pelo próprio modelo de dados existente desde a Sprint 15: `Socket`/`SocketConfiguration` são serializados dentro do registro do item (o Socket não existe fora de um item). Uma `Gem`, ao ser desocketada, continua existindo como linha própria pertencente ao personagem — nunca é apagada nem "pertence" ao item. Isso é o que torna Gemas um mercado permanente e independente do item onde estiveram encaixadas.

## O que isso NÃO habilita ainda

Por restrição explícita do brief, nada abaixo foi implementado nesta Sprint:
- Efeitos reais de Gema (`GemDefinition.effect` é só texto descritivo, nunca lido por cálculo de combate).
- `SocketCompatibility` não é aplicado dentro de `socketGem()` — é infraestrutura consultável (`isGemCompatibleWithBase`), mas o serviço em produção desde a Sprint 15 continua aceitando qualquer Gema em qualquer Socket, para não mudar o comportamento de um consumidor já existente.
- `SocketLayout` não é consultado por `itemgen/generator.ts`/`drop.service.ts` — a contagem real de Sockets de um item novo continua vindo só de `deriveSocketCountFromSeed` (distribuição uniforme 0-6, sem diferenciação por Base). Ligar `SocketLayout` à geração real seria "Balanceamento", restrito nesta Sprint.
- Combinações de Gemas, Gemas lendárias, Sockets coloridos complexos, Links entre Sockets, Craft de Gemas, NPC.

## Ver também

- `packages/shared/src/socket/` — implementação real: `types.ts`/`sockets.ts`/`gemHistory.ts` (Sprint 15, instância), `socketLayout.ts`/`exampleSocketLayouts.ts`/`gemDefinition.ts`/`gemRegistry.ts`/`socketCompatibility.ts` (Sprint 20, catálogo).
- `apps/api/src/services/gem.service.ts` — persistência real, transacional, Equipment Lock (Sprint 15).
- `docs/design/mythic-foundation-phase1.md`, `docs/design/base-identity-phase1.md` — mesmo padrão de "catálogo puro, nunca wireado na geração real" aplicado nas Sprints 18/19.
