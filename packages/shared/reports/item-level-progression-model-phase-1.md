# Item Level Progression Model — Architecture (Phase I)

Sprint exclusivamente investigativa. **Nenhum arquivo de produção foi alterado** — nem `resolveGroupLevel()` (worldencounter/generator.ts), nem `rollItemLevel()` (lootgen/generator.ts), nem nenhuma Loot Table/Encounter Table/Combat Engine/RuntimeConfig. O script novo (`scripts/itemLevelProgressionModelComparison.ts`) calcula, por conta própria, o Item Level candidato de cada modelo, e alimenta a `generateItem()` real e intocada — nenhuma mutação em memória sequer foi necessária, porque Item Level já é um simples parâmetro numérico do gerador.

**Pergunta central**: *Qual variável deve controlar o Item Level do StreamRPG?* Resposta, com os dados desta Sprint: **Região (por posição de progressão real, não pelo `levelRange` bruto já cadastrado) — não Player Level.** Player Level, a variável usada hoje, está estruturalmente incapaz de acessar mais de 45% do banco de afixos do jogo, mesmo na última região; um modelo orientado por Região acessa 100%.

---

## 1. Dependências Atuais do Item Level (Fase 1)

Cadeia completa, hoje:

```
playerLevel (nunca > MAX_LEVEL=30, xp.ts)
   │
   ▼ resolveGroupLevel() — worldencounter/generator.ts
   │   raw = playerLevel ± levelVariance(2)
   │   clamp(raw, max(regionMin,entryMin,templateMin), min(regionMax,entryMax,templateMax))
   ▼
monsterLevel  ── usado por: stats de combate do inimigo, XP concedido (fora do escopo desta Sprint)
   │
   ▼ rollItemLevel() — lootgen/generator.ts
   │   raw = monsterLevel ± table.itemLevelVariance
   │   clamp(raw, table.minLevel, table.maxLevel)
   ▼
itemLevel  ── ÚNICA entrada usada por generateItem() pra decidir Tier Eligibility
```

**Achado 1** — `resolveGroupLevel()` já recebe a faixa de nível da REGIÃO (`table.levelRange`) como um dos 3 limites do `clamp`, mas essa faixa nunca é o limite ativo na prática: como `playerLevel` nunca excede 30, o `raw` quase nunca se aproxima do teto real da região (que em várias regiões passa de 30 — ver Achado 2). O clamp de região existe no código, mas nunca é a restrição que realmente importa.

**Achado 2** — `ENCOUNTER_TABLES.levelRange.max` (9 regiões com combate) já ultrapassa `MAX_LEVEL=30` em 5 delas: colinas-aridas (45), litoral-quebrado (38), deserto-de-vidro (42), fortaleza-sombria (**80**) — ou seja, o próprio design de região JÁ assume personagens/loot acima de 30, mas o personagem nunca chega lá.

**Achado 3 (inconsistência de dados pré-existente, não introduzida por esta Sprint)** — os valores de `levelRange.max` não são monotônicos com a ordem real de progressão: colinas-aridas (1º anel, alcançada por volta do nível 15) declara max=45, MAIOR que minas-abandonadas (2º anel, alcançada depois, nível ~17), que declara max=25. Um modelo "Região pura" que apenas lesse esses valores brutos herdaria essa inconsistência (ver Seção 3, Modelo B).

---

## 2. Mapa de Influência do Item Level (Fase 2)

| Onde | Item Level influencia? | Como |
| --- | --- | --- |
| Geração (Tier Eligibility, `generator.ts`) | **Sim — a ÚNICA influência real** | `eligibleTiers = mod.tiers.filter(t => t.minItemLevel <= itemLevel)` |
| Afixos (quais mods entram) | **Não** | Pool de mods elegíveis vem só de `requiredTags`/`base.tags` — Item Level não filtra QUAIS mods, só QUAL TIER de um mod já escolhido |
| Raridade (`common/magic/rare/unique`) | **Não** | Rarity Roll usa só `dropWeight`/`rarityWeightMultipliers` (Loot Table) — Item Level nunca entra nessa fórmula |
| Power Score | **Indireto** | Só via Tier Roll — tier melhor (minItemLevel mais alto) tende a ter `min`/`max` de valor maior |
| Drops (chance/quantidade) | **Não** | `dropChance`/`quantityOptions` (Loot Table) não dependem de Item Level |
| Equipamentos (Auto Equip) | **Indireto** | Só via Power Score, que só muda via Tier Roll |

**Conclusão da Fase 2**: Item Level tem exatamente UM efeito funcional no jogo inteiro — decidir quais tiers de afixo estão elegíveis. Qualquer modelo alternativo só precisa produzir um número melhor pra alimentar esse ÚNICO ponto de decisão; não há nenhum outro sistema (raridade, drop, combate) que precise mudar junto.

---

## 3. Modelos Simulados (Fase 3/4)

Nenhum modelo altera `resolveGroupLevel()`/`monsterLevel` (combate/XP intocados) — cada modelo é só uma fórmula alternativa pra calcular o número que alimenta `rollItemLevel()`/`generateItem()`, testada isoladamente via Monte Carlo (N=6.000/região, mesmo padrão de seed das Sprints anteriores).

| Modelo | Fórmula | O que representa |
| --- | --- | --- |
| **A — Player Level (atual)** | `clamp(playerLevel ± 2, MAX_LEVEL, regionRange)` | Baseline — reproduz exatamente `resolveGroupLevel()` |
| **B — Region (pura)** | `randomInt(region.levelRange.min, region.levelRange.max)` | Usa a MESMA tabela já existente (`ENCOUNTER_TABLES`), decoupled de playerLevel |
| **C — Region Floor** | Ladder monotônica 1→65 pela ORDEM real de progressão (não pelo `levelRange` bruto) | Corrige o Achado 3 (inconsistência de dados) sem inventar dado novo — só reordena pela sequência real |
| **D — Player Level + Region Clamp (híbrido do briefing)** | `clamp(playerLevel ± 2, regionRange)`, SEM re-clampar por `MAX_LEVEL` depois | Testa se "só ajustar o clamp" (sem tocar a variável em si) resolveria algo |

---

## 4. Comparação (Fase 5)

### Cobertura do banco de afixos na ÚLTIMA região (Fortaleza Sombria) — pergunta central respondida diretamente

| Modelo | Thresholds distintos alcançados | Melhor tier alcançado | Cobertura |
| --- | --- | --- | --- |
| A — Player Level (atual) | 5 de 11 | 30 | **45,5%** |
| B — Region (pura) | 11 de 11 | 65 | **100%** |
| C — Region Floor | 11 de 11 | 65 | **100%** |
| D — Player Level + Region Clamp | 5 de 11 | 30 | **45,5%** |

**D é estatisticamente idêntico a A** (mesmo Item Level médio, mesmo Power Score, mesma cobertura, em toda região) — confirma matematicamente que o clamp de região JÁ EXISTE no código hoje e NÃO é o problema; o problema é que `playerLevel` nunca gera um valor grande o bastante para o clamp de região chegar a importar. "Ajustar o clamp" sozinho (a hipótese mais barata) está descartada com os dados desta própria Sprint.

### Power Score de Arma por região (média / p90)

| Região | A (atual) | B (Region) | C (Region Floor) |
| --- | --- | --- | --- |
| Bosque Sussurrante | 20,4 / 47 | 20,6 / 47 | 19,9 / 46 |
| Colinas Áridas | 23,4 / 55 | 26,8 / 67 | 23,8 / 59 |
| Picos Congelados | 27,0 / 68 | 27,5 / 70 | 28,5 / 71 |
| Deserto de Vidro | 27,6 / 69 | 28,2 / 73 | 32,0 / 89 |
| Fortaleza Sombria | **28,7 / 73** | 34,8 / 96 | **37,9 / 104** |

**A curva do modelo atual efetivamente para de crescer a partir da região ~5** (28,7 na última região vs 27,0 quatro regiões antes — 6% de crescimento em 4 regiões). **Region Floor cresce +32% em média / +42% no p90 sobre o atual na última região**, e continua crescendo região a região até o fim (ver Seção 5, Item Level médio).

### Item Level médio por região (evidência da causa raiz)

| Região | A (atual) | C (Region Floor) |
| --- | --- | --- |
| Bosque Sussurrante | 1,6 | 2,3 |
| Picos Congelados | 20,6 | 33,1 |
| Deserto de Vidro | 28,6 | 48,9 |
| Fortaleza Sombria | **30,0 (teto)** | **64,6** |

O modelo atual literalmente **para de crescer** (30,0 = `MAX_LEVEL`, um teto artificial); Region Floor continua crescendo linearmente até o teto de design real do banco de afixos (65).

### Probabilidade de upgrade "bate o recorde anterior" (Monte Carlo isolado)

Colapsa para próximo de 0% em TODOS os 4 modelos a partir da 2ª-3ª região — **isso é esperado e não é um contra-argumento**: é o mesmo efeito de "estatística de recordes" (Rényi, já documentado nas Sprints anteriores), matematicamente inevitável em qualquer sistema onde o "melhor já visto" só cresce. A métrica que importa para saber se a progressão é sustentável não é "qual a chance de bater o recorde imediatamente anterior" (sempre cai, em qualquer modelo) — é **"o teto de valores possíveis continua subindo região a região?"** — e é exatamente aí que os modelos divergem: sob A, o teto para de subir (Item Level trava em 30); sob B/C, o teto continua subindo até o fim do jogo.

---

## 5. Resposta à Pergunta Central

**Item Level deve representar o ESTÁGIO DO MUNDO, não o nível do personagem.**

Justificativa matemática, com os dados desta Sprint:
1. **Item Level tem exatamente um efeito no jogo** (Seção 2): decidir Tier Eligibility. Não há nenhuma razão estrutural para essa variável estar acoplada ao nível do personagem — ela só precisa ser um número crescente que acompanhe o quão longe o jogador está na campanha.
2. **Player Level está artificialmente limitado a 30** por uma decisão de Combat Engine (calibração de Chefes/regiões, Sprints anteriores) que **não tem nenhuma relação com a escala de 60-65 do banco de afixos** (Item Generation Design Review, Fase 1). Usar Player Level como driver de Item Level importa esse teto de combate para dentro da itemização, sem necessidade.
3. **O clamp de região já existe e já é insuficiente sozinho** (Modelo D = Modelo A, byte a byte) — a variável errada (Player Level) domina o cálculo mesmo com o clamp certo já presente no código.
4. **Region (ou Region Floor) usa dado que já existe** (`ENCOUNTER_TABLES.levelRange`) ou uma derivação simples da ordem de progressão — nenhum dado novo precisa ser inventado, só uma fonte diferente pro número.
5. **Region Floor é superior a Region pura**: resolve a inconsistência já presente nos dados brutos (Achado 3) sem exigir reautoria de `ENCOUNTER_TABLES` — só uma tabela pequena e nova de "ordem de progressão → Item Level alvo", a MENOR mudança possível que ainda corrige o problema de monotonicidade.

**Combinação recomendada**: Region Floor como driver primário, com Player Level mantido como um **modificador secundário de variância** (não removido — um personagem "adiantado" ou "atrasado" em relação à região ainda pode ter uma pequena influência, evitando que dois jogadores no mesmo lugar do mundo tenham Item Level idêntico sempre) — mas a VARIÁVEL QUE CONTROLA a escala geral passa a ser onde o jogador está, não quem ele é.

---

## 6. Menor Redesenho Possível (Fase 6, não implementado nesta Sprint)

**Ponto de mudança único**: `generateLoot()` (`lootgen/generator.ts:136`) hoje chama `rollItemLevel(rng, monsterLevel, table)`. A menor mudança possível é introduzir uma nova fonte pra esse argumento — **não `monsterLevel`** (que continua controlando combate/XP/dificuldade, intocado) — vinda de uma nova função pura, por exemplo `getRegionItemLevelAnchor(regionId): number` (nova tabela pequena, análoga em espírito a `REGION_GRAPH`), consultada só neste ponto.

Isso preserva 100% do Combat Engine (nenhuma stat de inimigo muda), 100% do Item Generator (`generateItem()` continua recebendo só um `itemLevel: number`, sem saber de onde veio), e é uma mudança de UMA linha em UM arquivo (`lootgen/generator.ts`) + uma tabela de dados nova — a mesma categoria de "menor mudança possível, mesma arquitetura preservada" já usada com sucesso nas Sprints "Equipment Progression Repair" e "Affix Selection Redesign".

**Não implementado nesta Sprint** (instrução explícita do briefing: "não alterar ainda") — fica especificado aqui para uma Sprint de implementação futura, que poderá reaproveitar a interface `AffixSelectionStrategy` (Sprint anterior) e este seam de Item Level juntos, se desejado, sem repetir nenhum trabalho de investigação.

---

## 7. Riscos Identificados (para a Sprint de implementação, não desta)

- **Combate**: se Item Level deixar de ser derivado de `monsterLevel`, é preciso confirmar que NENHUM outro sistema hoje assume "Item Level ≈ Player Level" implicitamente (não encontrado nenhum nesta Sprint — Seção 2 já mapeou os únicos consumidores).
- **Personagem adiantado**: um jogador que entra numa região tardia com nível baixo (raro, dado o gate de progressão, mas possível) passaria a encontrar loot num Item Level mais alto que seu próprio nível — precisa de validação de balanceamento numa Sprint futura (fora do escopo "não alterar" desta).
- **Dados de região inconsistentes** (Achado 3): se a Sprint de implementação optar por Region pura (Modelo B) em vez de Region Floor (Modelo C), a inconsistência de `colinas-aridas` (max=45) vs `minas-abandonadas` (max=25) precisaria ser corrigida primeiro — outra razão para preferir Region Floor.

---

## 8. Commercial Impact

Se validada numa Sprint de implementação futura, esta mudança ataca DIRETAMENTE a causa raiz que 3 Sprints independentes (Design Review, Redesign Validation, Affix Selection Prototype) já triangularam: o teto de Power Score alcançável na última região sobe de 28,7 (atual) para até 37,9 (Region Floor) — um salto de +32%, disponível justamente na fase do jogo (fim de campanha) onde a sensação de progressão hoje mais falha. Diferente das 3 Sprints anteriores (que testaram e descartaram correções no MEIO da cadeia — threshold, peso, algoritmo de seleção), esta é a primeira investigação a mexer na ORIGEM do problema — e os números de cobertura de tier (45%→100%) são o sinal mais forte já medido em qualquer uma das 4 Sprints desta série.

---

## Validação

- **Typecheck**: nenhum arquivo de `src/` foi alterado nesta Sprint — não aplicável.
- **Testes**: nenhum executado (instrução explícita: só se código compartilhado mudasse; não mudou).
- **Suíte completa**: não executada (sem alteração de produção).
- **Script de comparação**: `scripts/itemLevelProgressionModelComparison.ts`, execução única (~1,5s), determinística, reproduzível.
- Dados brutos completos em `reports/item-level-progression-model-comparison.json`.
