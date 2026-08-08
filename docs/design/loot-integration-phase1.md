# Loot Integration — Phase I (Sprint 29)

**Status:** ✅ Primeira integração real. `MonsterLootTable` (Sprint 28) e `MonsterLootSignature` (Sprint 27) agora influenciam de verdade o que `generateMonsterLoot()`/`generateLoot()` produzem para todo kill real (Adventure e Dungeon, que compartilham o mesmo motor). `MonsterArchetype` continua sendo o bias primário — nada foi substituído, só complementado.

## 1. Como a integração muda o farm

Antes desta Sprint, `MonsterLootTable.allowedBases`/`blockedBases` (Sprint 28) eram só dado declarado — nunca influenciavam um drop real. Agora, todo kill passa por um gate real: `rollBaseItemId()` (`lootgen/generator.ts`) interseca o universo real da Loot Table do monstro com o universo declarado no Monster Loot Table. Um Goblin não pode mais, na prática, produzir um Cajado — porque o Item Generator nunca recebe esse candidato na lista, não porque a chance dele seja baixa. Farm deixa de ser "onde a sorte é maior" e passa a ser "onde o item que eu quero é sequer possível".

## 2. Como a integração muda as rotas

`regionId` (já recebido por `generateLootForKilledEnemy()` desde a Sprint "Region-Anchored Item Level") agora também alimenta um multiplicador leve de Bioma (`worldregion/baseAffinity.ts`, Sprint 25) sobre o peso de Base — nunca um gate, só um viés adicional (`REGION_BLEND_FACTOR = 0.2`). Isso significa que a MESMA Base permitida por um monstro pode aparecer com frequência ligeiramente diferente dependendo de ONDE ele é morto — reforçando (nunca criando do zero) o motivo de visitar regiões específicas por um recurso específico, complementando a escolha "qual monstro" com "onde matar esse monstro".

## 3. Como a integração muda o mercado

`MonsterLootSignature.preferredBases`/`preferredAffixes` (Sprint 27) agora influenciam o peso relativo dentro do universo já filtrado pelo gate — um viés leve (`SIGNATURE_BLEND_FACTOR = 0.3`) por cima do Archetype, nunca por cima do gate. Isso significa que dois monstros do MESMO Archetype (ex.: Esqueleto e Bispo Corrompido, ambos "undead") agora produzem itens perceptivelmente diferentes na prática — o mercado passa a distinguir genuinamente "loot de Esqueleto" de "loot de Clero Corrompido", em vez de os dois serem estatisticamente idênticos por trás da mesma etiqueta de Archetype.

## 4. Como a integração muda a escassez e o valor dos itens

A verificação empírica desta Sprint (Fase 8, ver Seção "Testes") confirmou que, para os 22 monstros reais, a interseção entre a Loot Table real (Sprint 13) e o Monster Loot Table (Sprint 28) NUNCA é vazia — toda restrição nova é genuína, nenhum monstro perdeu acidentalmente a capacidade de dropar. Isso significa que a escassez introduzida é sempre estrutural (por design, auditada) e nunca acidental (por bug de dado) — a mesma garantia de qualidade que já protegia o resto do pipeline de itens desde a Sprint "Nenhum item procedural poderá perder informação ao ser salvo" (Itemization 2.0 Fase 2).

## 5. O que já existia (não recriado nesta Sprint)

- **`MonsterArchetype.lootBias`** (`lootidentity/archetypes.ts`) — continua a ÚNICA fonte PRIMÁRIA de bias; `bias.baseItemAffinity`/`bias.affixAffinity` (via `resolveLootBias()`) são sempre a BASE do blend, nunca substituídos.
- **`LootTable.allowedBaseItems`** (`lootgen/lootTables.ts`, real, por monstro desde a Sprint 13) — continua a única fonte do universo BRUTO de Bases; `MonsterLootTable` só pode estreitá-lo (interseção), nunca alargá-lo.
- **`getRegionItemLevelAnchor(regionId)`** — Item Level continua vindo inteiramente daqui; a integração desta Sprint não toca nada relacionado a nível, só peso de Base.

## 6. O que esta Sprint deliberadamente NÃO faz

Balanceamento definitivo dos fatores de blend (`0.2`/`0.3` são valores iniciais documentados, não calibrados por simulação), drop rates finais, World Events, Raids, Temporadas, economia dinâmica, NPCs, Leilão. Esferas/Gemas/Materiais permanecem SEM integração real — auditoria desta Sprint (Fase 1) confirmou que nenhuma das três tem hoje um mecanismo de drop por-morte-de-monstro real e independente (Esferas são sorteadas por FONTE de combate — adventure/dungeon/boss —, nunca por `monsterId`; Gemas nascem como sockets vazios, preenchidos depois via `gem.service.ts`; Materiais vêm só de Salvage) — gap documentado explicitamente, não silenciado, pra uma Sprint futura de integração de Esfera/Gema/Material decidir COMO conectar `MonsterLootTable.allowedSpheres`/`allowedGems`/`allowedMaterials` a um mecanismo real que ainda não existe hoje. `MonsterLootTable.specialDrops` ganhou uma rolagem pura e determinística (`rollSpecialDropForMonster()`), mas seu resultado ainda não é lido por nenhum caminho real de concessão de item — "nenhum item novo" continua literal.

---

*Referências: `docs/design/loot-tables-phase1.md` (Monster Loot Table, Sprint 28), `docs/design/monster-loot-identity-phase1.md` (Monster Loot Signature, Sprint 27), `docs/design/world-loot-system-phase1.md` (World Region/Biome, Sprint 25), `packages/shared/src/lootidentity/generator.ts` (ponto único de integração real desta Sprint).*
