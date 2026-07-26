# Loot Table Item Level Normalization (Phase I)

Continuação direta de "Region-Anchored Item Level — Implementation Validation Phase I". Verificado primeiro (conforme pedido), depois normalizado.

**Pergunta feita**: `minLevel`/`maxLevel` de cada Loot Table são um dado genuíno da criatura, ou apenas repetem a progressão da região?

**Resposta, com dados**: **100% duplicação.** Nas 21 Loot Tables ligadas a um Enemy Template, `minLevel`/`maxLevel` era, em TODOS os 21 casos, uma cópia byte-a-byte de `EnemyTemplate.levelRange` — nunca um dado próprio da tabela de loot. As 10 tabelas "standalone" (relíquias/chests) também espelhavam o range do Boss/Mini-Boss associado. Zero exceções genuínas existiam.

---

## 1. Arquivos Modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/lootgen/types.ts` | `LootTable.minLevel`/`maxLevel` removidos; adicionado `itemLevelOffset?: number` (opcional, default 0) |
| `src/lootgen/generator.ts` | `rollItemLevel()`: `clamp(monsterLevel ± variance, minLevel, maxLevel)` → `max(1, itemLevelAnchor + offset ± variance)`. Parâmetro/comentários renomeados de `monsterLevel` para `itemLevelAnchor` (mesmo já não ser mais nível de monstro desde a Sprint anterior) |
| `src/lootgen/lootTables.ts` | 31 entradas — `minLevel`/`maxLevel` removidos de todas (nenhuma usa `itemLevelOffset`: zero exceções hoje) |
| `src/lootidentity/generator.ts` | Mesma renomeação `monsterLevel` → `itemLevelAnchor` (só nomes/comentários, nenhuma lógica) |
| `src/lootgen/generator.test.ts`, `src/lootidentity/generator.test.ts` | 4 asserções/fixtures atualizadas pra não referenciar os campos removidos |

Nenhum outro arquivo tocado.

---

## 2. Verificação de Duplicação (antes de normalizar)

Cross-referenciado programaticamente (`EnemyTemplate.levelRange` × `LootTable.minLevel/maxLevel`):

| Categoria | Contagem | Resultado |
| --- | --- | --- |
| Tabelas ligadas a um Enemy Template | 21 | **21/21 idênticas** ao `levelRange` do próprio template |
| Tabelas "standalone" (relíquia/chest) | 10 | 8/10 espelham o range do Boss/Mini-Boss associado; `treasure_chest` (1-60) e `final-boss-relic` (20-60) são as únicas sem correspondência 1:1 a uma única criatura — ainda assim, faixas "genéricas" que cobrem boa parte do jogo, não um sinal de design específico |

Nenhuma tabela precisou de `itemLevelOffset` diferente de zero.

---

## 3. Verificação de Funcionamento (pós-normalização)

Instrumentação temporária (removida após a verificação) confirmou, numa campanha real de 300 execuções:

| Monstro | Itens antes (clampado) | Itens depois (sem clamp) |
| --- | --- | --- |
| `skeleton` | 10-30 | **19-63** |
| `corrupted-acolyte` | 24-38 | **36-46** |
| `fire-cultist` | 28-42 | **44-54** |
| `frost-king-relic` | 20-35 | **30-44** |

O Item Level bruto sobe substancialmente para praticamente todo monstro comum, exatamente como projetado — confirma que a normalização funciona e que o clamp antigo estava mesmo neutralizando a maior parte do ganho do Region-Anchored Item Level.

---

## 4. Por Que os Números Agregados da Campanha Continuam Quase Idênticos

Mesmo com o Item Level bruto claramente mais alto (Seção 3), `fase2_upgradeFrequency`/`fase3_slotProgression`/`fase6_deadLoot`/`fase4_powerCurveByLevel` (Dead Loot, upgrades/campanha, Power Score EQUIPADO por nível) saem, de novo, quase idênticos ao "antes" — não por um bug (verificado, Seção 3), mas por **dois fatores estruturais já existentes, não relacionados a este trabalho**:

1. **`Power Score` total = `derived.powerScore` (do nível/atributos do personagem) + `equipmentStats.powerScore` (dos itens equipados)** (`characterbuild/finalStats.ts`). `derived.powerScore` cresce só com nível/atributos — nunca com equipamento — e domina boa parte do total exibido nos níveis 20-30. Um ganho real no lado do equipamento fica proporcionalmente menor no número agregado.
2. **O efeito "running maximum"** (documentado nas 3 Sprints anteriores desta série: Equipment Progression Audit, Item Generation Design Review, Affix Selection Prototype) continua valendo aqui: `tryAutoEquip()` só troca se o item novo for ESTRITAMENTE melhor que o já equipado. Regiões tardias (litoral-quebrado, deserto-de-vidro, fortaleza-sombria) são alcançadas por só 52/36/10 de 300 personagens — e destes, a maioria já chega com equipamento decente das regiões anteriores, então mesmo um Item Level bruto muito mais alto nessas regiões raramente supera a barra já estabelecida.

**Onde o efeito REALMENTE aparece**: `fase5_lootQualityByRegion` (qualidade bruta do loot, antes do filtro de "foi equipado?") mostra Power Score médio crescendo de forma consistente por região (10,7 → 15,3 → 22,5 → 27,0 → 27,8 → 30,5 → 42,7 → 44,5) — a normalização melhora o que É GERADO; o gargalo que impede isso de virar equipamento de fato é o mesmo running-maximum já triangulado 3 vezes nesta série, não algo que esta Sprint poderia (ou devesse) resolver.

---

## 5. Segurança de Tipos / Manutenção Futura

- `LootTable.itemLevelOffset?: number` — único ponto de exceção reservado; hoje **nenhuma** das 31 tabelas usa (todas implicitamente 0). Uma futura decisão de design (ex.: "loot de Chefe deve rolar acima do anchor da própria região") tem exatamente um campo pra declarar isso, sem reintroduzir um par min/max duplicado.
- Uma única fonte de verdade agora governa toda a progressão de Item Level: `getRegionItemLevelAnchor(regionId)` (regions.ts). Uma mudança futura na ordem/ritmo de progressão do mundo se propaga automaticamente pra todo o loot do jogo, sem precisar tocar em nenhuma das 31 Loot Tables — exatamente o objetivo desta Sprint.

---

## 6. Validação

- **Typecheck**: `packages/shared` limpo.
- **Testes direcionados**: 4 arquivos de teste atualizados (asserções sobre campos removidos); nenhuma regra de negócio mudou.
- **Suíte completa**: executada 2 vezes nesta Sprint (após o normalize inicial, e de novo após remover a instrumentação de debug) — **434/434 passando nas duas vezes**.
- **Auditoria comparativa**: `scripts/runEquipmentProgressionAudit.ts`, executado com output verificado (não suprimido) — resultados na Seção 4.
- **Verificação de duplicação e de funcionamento**: scripts descartáveis, removidos após uso (Seções 2/3).

---

## 7. Estado Atual desta Série de Sprints

Arquitetura de Item Level: **normalizada e correta** — uma fonte de verdade, sem duplicação, com um seam de exceção pronto pra uso futuro. Efeito no jogador: **ainda não comprovado na campanha agregada**, pelos dois motivos estruturais da Seção 4 — nenhum dos dois é uma falha desta Sprint, mas ambos precisam de uma decisão explícita antes de uma próxima tentativa:
- Se o objetivo é "Dead Loot cair de verdade", o próximo alvo mais provável é o próprio mecanismo de comparação "só troca se for estritamente melhor" (`tryAutoEquip`) combinado com o baixo alcance de regiões tardias — não mais o Item Generator, a Loot Table, ou a origem do Item Level (as 4 Sprints anteriores já eliminaram essas 3 hipóteses).
