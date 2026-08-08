# Endgame Map System — Phase I (Sprint 30)

**Status:** ✅ Infraestrutura pura. `MapDefinition`/Map Registry (9/9 regiões jogáveis)/Enemy Pool/Map Economic Profile/Map Affinity existem e tipam corretamente, mas **nenhum consumidor real** (`adventureLoop.ts`, `dungeonController.ts`, `lootidentity/generator.ts`) lê nada deste módulo ainda — "Nenhum mapa influencia gameplay ainda", como o brief exige literalmente.

## 1. O que é um Mapa, hoje

Hoje o jogador escolhe uma **Região fixa** (`worldregion/`, Sprint 25) e a Região determina Bioma, monstros (via `enemy/templates.ts` + `worldencounter/encounterTables.ts`) e uma leve influência de loot (Sprint 29). Essa Sprint introduz o **Mapa** como camada nomeada ACIMA da Região — "Mapa → Região → Biome → Monster Pool → Loot" — mas, na Fase I, **id do Mapa == id da Região, 1:1**. Não existem ainda Mapas alternativos para a mesma Região (isso é Atlas/Rare Maps/Unique Maps, explicitamente fora de escopo). O valor desta Sprint não é gameplay novo — é dar ao conceito "Mapa" um lugar formal e tipado no código, prestes a ser desacoplado da Região 1:1 numa Sprint futura.

## 2. Como o Enemy Pool nasce

`MapDefinition.enemyPool` **não é uma lista nova digitada à mão** — é `ENEMY_TEMPLATES.filter(t => t.region === regionId)`, reaproveitando um campo (`EnemyTemplate.region`) que já existe desde a Sprint original do Enemy System, muito antes deste arco 25-30 começar. Isso garante, por construção, que os 22 Enemy Templates reais se particionam sem sobreposição e sem omissão entre os 9 Mapas — verificado empiricamente no Fase 8 (ver Testes).

## 3. Como a Economia do Mapa se relaciona com o que já existia

`MapEconomicProfile` usa o MESMO vocabulário de 5 categorias já estabelecido em `enemyFaction/types.ts` (Sprint 26) e `monsterLoot/types.ts` (Sprint 27) — Gold/Materials/Sphere/Gem/Equipment, nunca uma terceira nomenclatura para a mesma ideia de tendência de recurso. A diferença deliberada desta Sprint: Sprints 26/27 impunham "no máximo 1 tendência elevada por Facção/Monstro" (nenhuma Facção é boa em tudo); aqui, um Mapa é por definição uma AGREGAÇÃO de várias Famílias/Facções, e os 3 exemplos literais do próprio brief citam 2-3 categorias por Mapa — então a disciplina foi conscientemente relaxada para "até 2 tendências elevadas, nunca as 5":

- **Fortaleza Sombria** — "Armaduras/Anéis" → `equipmentTendency: 1.5`; "Esferas" → `sphereTendency: 1.5`.
- **Bosque Sussurrante** (Floresta) — "Botas/Arcos" → `equipmentTendency: 1.5`; "Gemas" → `gemTendency: 1.5`.
- **Pântano Podre** — "Materiais" → `materialsTendency: 1.5`. "Venenos"/"Craft" (citados no brief) não têm categoria real correspondente entre as 5 existentes — omitidos por honestidade, nunca forçados numa categoria errada.

Os 6 Mapas restantes ficam totalmente neutros (`1` em todas as 5 tendências) — nenhuma especialização foi inventada sem lastro no texto do brief.

## 4. Map Affinity — composição, nunca uma nova fonte de verdade

`mapAffinity.ts` não guarda nenhum número novo. `getMapBaseAffinity()`/`getMapSphereAffinity()`/`getMapGemAffinity()`/`getMapMaterialIds()` resolvem `map.biome` e leem diretamente as tabelas por Bioma já reais da Sprint 25 (`worldregion/baseAffinity.ts`, `sphereAffinity.ts`, `gemAffinity.ts`, `materialTypes.ts`). `getMapMonsterLootSignatures()` resolve `map.enemyPool` e devolve a `MonsterLootSignature` real (Sprint 27) de cada monstro do Pool. Isso espelha exatamente o mesmo padrão arquitetural já validado 3 vezes nesta sequência de Sprints (`factionAffinity.ts` na 26, `monsterAffinity.ts` na 27, a derivação por assinatura na 28) — nunca uma quarta/quinta fonte de verdade paralela.

## 5. "Nenhum órfão" — escopo real

O brief pede "registrar TODOS os mapas existentes, sem órfãos". Das 11 WorldRegions reais (Sprint 25), 2 não têm nenhum conteúdo de combate: `porto-do-amanhecer` (hub social, sem Encounter Table) e `planicie-dourada` (nó de grafo sem Enemy Template/Encounter Table ainda associado). Criar um Mapa pra essas duas exigiria inventar nível/monstros do nada — a interpretação adotada foi "nenhuma Região JOGÁVEL sem Mapa", com as 2 exclusões documentadas explicitamente como decisão de escopo, não como lacuna. `listPlayableRegionsWithoutMap()` é a função de integridade que prova isso — hoje sempre devolve `[]`.

## 6. O que esta Sprint deliberadamente NÃO faz

Por restrição explícita do brief: Map Mods, Corruption, Rare Maps, Unique Maps, Boss próprio por Mapa, Atlas, Temporadas, World Boss, Raids. Nenhum desses existe nem como esqueleto de tipo — ficam para Sprints futuras quando o Mapa deixar de ser 1:1 com a Região. Nenhum arquivo de produção (`adventureLoop.ts`, `dungeonController.ts`, `lootidentity/generator.ts`, `enemy/lootIntegration.ts`) foi importado ou alterado — `worldmap/` só é lido pelos próprios testes desta Sprint.

---

*Referências: `docs/design/world-loot-system-phase1.md` (World Region/Biome, Sprint 25), `docs/design/loot-integration-phase1.md` (Sprint 29, único ponto de integração REAL do pipeline de loot até hoje), `packages/shared/src/worldmap/` (código desta Sprint).*
