# Mythic Foundation — Phase I

**Sprint:** 18 — Mythic Foundation (Itens Míticos, Bases Secretas e Economia da Descoberta)
**Status:** Infraestrutura apenas — sem conteúdo definitivo, sem balanceamento final.

## Fase 9 — Economia: a única origem de um Item Mítico

Esta é a regra oficial, documentada por exigência explícita do brief desta Sprint (Fase 9). Ela não é uma sugestão de design — é uma restrição arquitetural que qualquer Sistema futuro (Loot, Boss, Dungeon, NPC, Evento, Craft) precisa respeitar por construção.

> **Itens Míticos nunca entram por Drop. Nunca entram por NPC. Nunca entram por Boss. Nunca entram por Evento. Nunca entram por Craft. A única origem é a Esfera da Incerteza.**

### Por que essa restrição existe

Um Item Mítico só tem valor porque é impossível de garantir. Se um Mítico pudesse dropar de um Boss (mesmo que raríssimo), ele deixaria de ser uma revelação e passaria a ser só mais uma entrada de loot table com chance muito baixa — o mesmo tipo de RNG que já existe em qualquer sistema de drop convencional. A Esfera da Incerteza é o único ponto de entrada porque ela já carrega a filosofia correta desde a Sprint 17: **"o jogador deve pensar duas vezes antes de clicar."** Nenhum outro sistema do jogo pede essa decisão consciente — Loot/Boss/Dungeon acontecem *para* o jogador, a Esfera acontece *pela mão* do jogador.

### Verificação (Fase 1 — auditoria desta Sprint)

Confirmado por auditoria de código, não por convenção documental:

| Sistema | Onde vive | Pode gerar Mítico? |
|---|---|---|
| Loot (exploração) | `packages/shared/src/itemgen/generator.ts`, `lootgen/generator.ts` | Não — `ItemRarity` é um union fechado de 5 valores (`common`\|`uncommon`\|`rare`\|`epic`\|`legendary`), sem `"mythic"`. |
| Boss / Dungeon | `packages/shared/src/enemy/lootIntegration.ts`, `dungeon/dungeonController.ts`, `dungeon/uniqueRelicDefinitions.ts` | Não — mesmos geradores acima; relíquias únicas (Sprint World Tier) usam nomes próprios mas ainda são `ItemRarity` normal, nunca um `MythicDefinition`. |
| NPC / Quest | Nenhum sistema de concessão de item por NPC/Quest existe hoje (Museu/NPC Historiador são explicitamente trabalho futuro, fora de escopo). | N/A — não existe o sistema. |
| Craft (Fortuna/Purificação/Ascensão/Lapidação/Maldição) | `apps/api/src/services/sphere.service.ts`, `packages/shared/src/crafting/sphereCrafting.ts` | Não — nenhuma dessas 5 Esferas altera `name`/`rarity` para um valor Mítico; só rerolam/adicionam/removem afixos, qualidade, ou selam o item. |
| Esfera da Incerteza | `sphere.service.ts` (`case "uncertainty"`), via `resolveUncertaintyOutcome` (`transformation/resolver.ts`) | **Sim — a única.** Um outcome `mythic_reveal` só existe dentro de um `BaseTransformationPool`, sempre nascido de uma Base (nunca do vazio, Fase 1 do brief), e sempre com `exclusiveSource: "uncertainty"` marcado no `BaseTransformation` correspondente. |

### Como a restrição é imposta em código, não só em documentação

1. **`MythicDefinition.exclusiveSource`** (`packages/shared/src/mythic/types.ts`) é tipado como `ExclusiveSource` — o mesmo tipo fechado que a Sprint 17 já usava para `BaseTransformation.exclusiveSource`. Um Mítico registrado com `exclusiveSource: "uncertainty"` documenta, no próprio dado, que aquele resultado só existe através da Esfera.
2. **Nenhum outro serviço importa `mythic/`** além de `sphere.service.ts` e `drop.service.ts` (este último só para *ler* a Origem de um item já revelado, nunca para *criar* um). `merchant.service.ts`, `blacksmith.service.ts`, `salvage.service.ts`, `dungeonController.ts`, `lootIntegration.ts` não têm nenhuma dependência do módulo `mythic/` — arquiteturalmente incapazes de produzir um Mítico mesmo que alguém tentasse.
3. **`resolveUncertaintyOutcome`** (transformation/resolver.ts, inalterado desde a Sprint 17) é a única função de todo o codebase que pode devolver um `TransformationOutcomeResult` com `outcome: "mythic_reveal"`.

## Restrições desta Sprint (reafirmadas)

Não implementado (deliberadamente, por instrução explícita do brief): tabela definitiva de Itens Míticos, drops finais, balanceamento final, chance final, NPC Historiador, Museu, Hall da Fama, Conquistas, Eventos.

Não alterado: Economia existente, Sockets, Gemas, Guild, Kingdom, Treasury, Trade Routes, Player Presence, World Presence, Craft existente (as 5 Esferas de Sprint 12), Esferas existentes.

## Ver também

- `docs/design/crafting-phase1-sphere-system.md` — sistema de Esferas (Sprint 12), base sobre a qual a Esfera da Incerteza foi construída (Sprint 16/17).
- Sprint 17 (Esfera da Incerteza 2.0) — decisão "a Esfera nunca falha", `TransformationOutcome`, `BaseTransformationPool`.
- `packages/shared/src/mythic/` — implementação real desta Sprint (`MythicDefinition`, `MythicRegistry`, `DiscoverableBase`, `Discovery`, Hidden Pools).
