# Gem Effects — Phase I

**Sprint:** 21 — Gem Effects Phase I (A Primeira Camada de Build)
**Status:** Infraestrutura + 7 efeitos de exemplo. Wireado em `/api/character` (`resolvedStats`/`activeGemEffects`), nunca em `BossCombatSystem` nem no engine de simulação de Adventure (ver Fase 1, achado arquitetural).

## Filosofia

> As Gemas são o primeiro passo da customização. Itens continuam sendo o principal fator de poder. Gemas refinam a Build. Nunca substituem o equipamento.

Uma Gema nunca altera diretamente raridade, Base, Prefixos, Sufixos, Craft, Legacy ou História — ela só concede um modificador adicional, sempre recalculado, nunca persistido. As Gemas continuam sem XP, sem nível, sem qualidade, sem evolução (decisão da Sprint 20, reafirmada aqui).

## Fase 1 — Auditoria: três sistemas de combate, não um

Antes de qualquer código novo, a auditoria encontrou três cálculos de Power Score/Attack/Defense/Critical/Speed/Magic **separados e desconectados** no codebase:

1. **`getCombatAttributes()`** (`packages/shared/src/items.ts`) — o único caminho realmente wireado em `/api/character` (via `SQLiteCharacterRepository.getCombatAttributes`). Modelo simples: deriva `attackPhysical`/`attackMagic`/`resistancePhysical`/`resistanceMagic` só de raridade+slot+damage_type do item equipado. Não tem campo de `critical`/`life`/`mana`/`attackSpeed`/`magic` algum.
2. **`characterbuild/` + `equipment/stats.ts`** (`calculateFinalStats`/`calculateCharacterStats`) — pipeline rico, com os 7 stats que este brief pede (attack/defense/critical/life/mana/attackSpeed/spellDamage). Código real, não morto — mas só é exercitado dentro do engine de simulação client-side de Adventure (`apps/web/src/hooks/useAdventureSession.ts`, via `createAdventureCharacter`/`createAdventureSession`), contra um `Equipment` **local à sessão, montado com um kit inicial fixo — nunca hidratado a partir dos Sockets/Gemas reais do personagem persistido**. Wireado Gem Effects aqui seria estruturalmente correto, mas invisível para o jogador hoje.
3. **`BossCombatSystem.ts`** — usa a constante global `CRITICAL_HIT_CHANCE = 0.05` (5%, igual para todos), reafirmada explicitamente por `docs/combat-model/canonical-formula.md` ("crítico é fixo, nunca modificado por atributo — a mesma razão pela qual UTI perdeu sua cláusula de crítico na Sprint 4 do Combat Model"). Esta Sprint não altera `BossCombatSystem` nem essa constante.

**Decisão**: o Effect Resolver (Fase 5) é wireado no único lugar real, persistido, e sob controle total desta Sprint — `/api/character`. `resolvedStats` é uma camada NOVA, adicional, computada por cima do `combat` snapshot já existente (item 1 acima); `characterbuild`/`equipment`/`BossCombatSystem` continuam intocados.

## Fase 2/3 — GemEffect e GemEffectRegistry

`packages/shared/src/socket/gemEffect.ts` — `GemEffect{id, type, value, scaling, enabled, description}`. `type` é um dos 7 pedidos pelo brief (`attack`/`defense`/`critical`/`life`/`mana`/`attackSpeed`/`magic`). `scaling` é `"percent"` (delta = valor% do stat-base real) ou `"flat"` (delta = valor, direto).

`GemDefinition` (Sprint 20) ganhou um campo novo, opcional: `effectId?: string` — referencia um `GemEffect` por id, nunca embute o efeito. `topaz-1` (categoria `utility`, fora dos 7 tipos) deliberadamente não tem `effectId` — "não inventa um efeito que o brief não pediu".

## Fase 4 — 7 exemplos QA

| id | type | scaling | value | description |
|---|---|---|---|---|
| `attack-percent-1` | attack | percent | 5 | Ataque +5% |
| `defense-percent-1` | defense | percent | 5 | Defesa +5% |
| `critical-flat-1` | critical | flat | 2 | Crítico +2% |
| `life-flat-1` | life | flat | 30 | Vida +30 |
| `mana-flat-1` | mana | flat | 15 | Mana +15 |
| `attackspeed-flat-1` | attackSpeed | flat | 3 | Velocidade de Ataque +3 |
| `magic-flat-1` | magic | flat | 8 | Magia +8 |

`attack`/`defense` usam `percent` porque só eles têm um stat-base real hoje (via `combat`, achado 1 da Fase 1) — um efeito `percent` sobre um stat-base 0 sempre resolveria pra 0, então os outros 5 usam `flat`.

10 `GemDefinition` de exemplo cobrem os 7 tipos: `ruby-1/2/3`→attack, `sapphire-1`→mana, `emerald-1`→life, `onyx-1`→defense, `amethyst-1`→critical, `citrine-1`→attackSpeed (categoria `movement`, mais próxima existente), `opal-1`→magic. `topaz-1` continua sem efeito.

## Fase 5 — Effect Resolver

`packages/shared/src/socket/gemEffectResolver.ts`, puro, sem I/O:
- `resolveGemEffectForGemType(gemDefRegistry, effectRegistry, gemType)` — só resolve quando a Gema E o Efeito estão `enabled`.
- `resolveActiveGemEffects(sockets, socketGemTypes, gemDefRegistry, effectRegistry)` — por item: para cada Socket `filled` com uma Gema conhecida, resolve seu efeito. Nunca altera o `SocketConfiguration`/`Item` recebido.
- `applyGemEffectsToStats(base, activeEffects)` — soma os deltas sobre uma cópia de `base` (nunca muta); `percent` sempre lê o `base` original (nunca o resultado já modificado por outra Gema — a ordem de aplicação não muda o resultado).

## Fase 6/7 — Integração com Character

`GET /api/character` (`getCharacterByProfileId`) agora, a cada chamada (nunca persistido):
1. Para cada item equipado com algum Socket `filled`, busca `gemType` cru por Socket (`gem.service.ts`'s `getSocketGemTypes`, nova) e chama `resolveActiveGemEffects`.
2. Agrega todos os efeitos ativos de todos os itens equipados em `activeGemEffects: CharacterActiveGemEffect[]` (inclui `character_item_id` de origem).
3. Monta `resolvedStats` a partir de uma base `{attack: attack_physical+attack_magic, defense: resistance_physical+resistance_magic, critical: 0, life: 0, mana: 0, attackSpeed: 0, magic: 0}` (a mesma base honesta descrita na Fase 1) e aplica os efeitos ativos via `applyGemEffectsToStats`.

Nenhuma coluna nova, nenhuma escrita — `resolvedStats`/`activeGemEffects` são 100% derivados a cada requisição.

## Fase 8 — UI

`InventoryPage.tsx`'s `renderItemSockets` (Sprint 15/20) ganha um parêntese opcional após o nome da Gema quando ela tem efeito: `💎 Gemas: Rubi III (Ataque +5%)`. Texto puro — sem ícone, animação ou cor novos. Novo campo `PersistedItemFields.socketGemEffects` (`Socket.id` → descrição), mesmo padrão de custo de `socketGems` (só consulta quando existe Socket `filled`).

## Fase 9 — Economia

Reafirmado, sem mudança de regra (Sprint 20 já estabeleceu isso, esta Sprint não abre exceção):

> **Gemas continuam totalmente negociáveis. Sockets pertencem ao Item. Gemas pertencem ao Jogador. Remover uma Gema nunca a destrói.**

Nenhuma Gema com efeito (`effectId` presente) ganhou uma regra de economia diferente das Gemas sem efeito — `tradable`/`unsocketGem`/`unsocketAllGemsForItem` (`gem.service.ts`, intocados nesta Sprint) não distinguem "Gema com efeito" de "Gema decorativa". Um efeito é uma propriedade de LEITURA (Resolver), nunca uma trava de posse/comércio.

## O que isso NÃO habilita ainda

Por restrição explícita do brief: Runewords, Combos de Gemas, Links entre Sockets concedendo efeito, Gemas lendárias/míticas, Gemas que evoluem, Árvore de Gemas, balanceamento definitivo dos 7 valores de exemplo. `SocketCompatibility` (Sprint 20) continua não-enforced — uma Gema `critical` ainda pode ser socketada em qualquer Base.

## Ver também

- `packages/shared/src/socket/` — `gemEffect.ts`/`gemEffectRegistry.ts`/`gemEffectResolver.ts` (novos), `gemDefinition.ts`/`gemRegistry.ts` (Sprint 20, estendidos).
- `docs/design/sockets-gems-phase1.md` — a camada de instância/persistência que esta Sprint reaproveita sem alterar.
- `docs/combat-model/canonical-formula.md` — a razão pela qual Gem Effects nunca tocam `BossCombatSystem`/`CRITICAL_HIT_CHANCE`.
