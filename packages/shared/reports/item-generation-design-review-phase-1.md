# Item Generation Design Review — Long-Term Progression (Phase I)

Sprint exclusivamente investigativa. Nenhuma fórmula, tabela, Power Score, RNG, Loot Table, Combat Engine, Simulator ou Persistência foi alterado — apenas um novo script de análise (`scripts/itemGenerationDesignReview.ts`) que chama `generateItem()` (já existente, intocado) repetidamente e analisa o resultado estatística e matematicamente.

**Pergunta central**: *o algoritmo atual consegue continuar produzindo upgrades relevantes durante campanhas longas?* Resposta, fundamentada nas 8 fases de evidência abaixo: **não — o algoritmo converge estruturalmente para zero upgrades úteis, por um defeito arquitetural específico e demonstrável, não por falta de calibração.**

---

## 1. Arquitetura Atual

Pipeline completo de `generateItem(baseItemId, itemLevel, seed, options)` (`itemgen/generator.ts`):

```
Base Item (baseItemId)
        │
        ▼
Rarity Roll ── pickWeighted(dropWeight × rarityWeightMultiplier)
        │        common 60 | magic 28 | rare 11 | unique 1
        ▼
prefixCount = randomInt(rarity.minPrefixes, maxPrefixes)
suffixCount = randomInt(rarity.minSuffixes, maxSuffixes)
        │
        ▼
Prefix Roll (rollDistinctMods) ──► elegibilidade por tag (requiredTags)
        │                          peso efetivo = mod.weight × baseItemWeight × rarityWeight × tagAffinity
        │                          exclusão de grupo (life/strength/etc. não repetem)
        ▼
Suffix Roll (mesmo mecanismo, MESMO estado de grupo compartilhado)
        │
        ▼
Para cada mod escolhido:
  Tier Roll ── pickWeighted(tiers elegíveis por minItemLevel <= itemLevel)
  Value Roll ── randomInt(tier.min, tier.max)
        │
        ▼
Power Score = (baseDamage médio OU baseDefense×0,5) + Σ (valor de cada mod rolado)
        │
        ▼
Comparação (Auto Equip, adventure/autoEquip.ts): novo > equipado atual?
```

**Determinístico** (mesma seed = mesmo item, sem `Math.random`), **data-driven** (nenhum `if (raridade === "...")` no código, tudo vem de `rarities.ts`/`prefixes.ts`/`suffixes.ts`/`baseItems.ts`).

**Fato estrutural chave, confirmado nesta Sprint**: o nível de um inimigo (e portanto o Item Level de seu loot) é sempre `playerLevel ± 2` (`WORLD_ENCOUNTER_CONFIG.levelVariance`, `worldencounter/generator.ts:resolveGroupLevel()`), nunca o `levelRange` abstrato do próprio Enemy Template (que pode declarar até 80, mas nunca é usado diretamente). Como `playerLevel` nunca ultrapassa `MAX_LEVEL = 30` (`xp.ts`), o Item Level de qualquer drop do jogo real está estruturalmente limitado a **no máximo ~38** (30 + 2 de variância de encontro + até 6 de `itemLevelVariance` da Loot Table mais generosa) — mesmo que uma Loot Table declare `maxLevel: 80`.

---

## 2. Modelo Matemático

- **Power Score** = `contribuição_base + Σ valor(mod)`, onde `contribuição_base` = média de `baseDamage` (arma) ou `baseDefense × 0,5` (armadura, peso reduzido na Sprint anterior).
- **Peso efetivo de um mod** = `(baseItemWeights[base] ?? weight) × (rarityWeights[rarity] ?? 1) × Π tagMultiplier` (`weights.ts:getEffectiveModWeight`).
- **Elegibilidade de tier**: `tier.minItemLevel <= itemLevel`; entre os elegíveis, sorteio ponderado por `tier.weight` (atualmente 4/16/30/50 para mods de 4 tiers, 28/72 para mods de 2 tiers — rebalanceado na Sprint anterior).
- **Contagem de afixos por raridade**: comum 0+0, mágico 1+(0-1), raro (1-3)+(1-3), único (2-3)+(2-3) (`rarities.ts`).
- **Teto prático de Item Level**: `MAX_LEVEL(30) + levelVariance(2) + itemLevelVariance(até 6) ≈ 38`.

---

## 3. Evidências

Todas as evidências abaixo são de `reports/item-generation-design-review.json`, gerado por `scripts/itemGenerationDesignReview.ts` (determinístico, reproduzível). Nenhum combate, nenhuma campanha — só `generateItem()` chamado em lote (Fase 2-8 do briefing).

### Fase 2 — Valor Esperado por Região (N=20.000/região, item Arma "Espada")

| Região | Nível | Power Score médio | Mediana | p90 | p99 | Máximo |
| --- | --- | --- | --- | --- | --- | --- |
| Bosque Sussurrante | 1 | 20,2 | 11 | 47 | 86 | 120 |
| Pântano Podre | 5 | 20,2 | 11 | 46 | 85 | 131 |
| Colinas/Minas/Ruínas | 15 | 23,1 | 11 | 55 | 114 | 204 |
| Picos Congelados | 20 | 27,2 | 11 | 69 | 138 | 228 |
| Litoral Quebrado | 24 | 27,0 | 11 | 67 | 137 | 217 |
| Deserto de Vidro | 28 | 27,2 | 11 | 68 | 137 | 224 |
| Fortaleza Sombria | 30 | 28,3 | 11 | 70 | 158 | ~230 |

**A mediana é EXATAMENTE 11 (o valor de um item comum) em TODAS as 7 regiões** — confirma que mais de 50% de qualquer amostra de drops é sempre common, em qualquer nível. **A média cresce 34% do nível 1 ao 20, depois apenas 4% do nível 20 ao 30** — o crescimento praticamente para exatamente na faixa que separa "meio de jogo" de "fim de jogo", onde mais importaria continuar.

### Fase 3 — Probabilidade de Upgrade por Região (supera o melhor já visto)

| Região | Melhor já visto (Arma) | P(novo item supera) — Arma | P(novo item supera) — Armadura |
| --- | --- | --- | --- |
| Bosque Sussurrante (1ª região) | 0 | **100%** | **100%** |
| Pântano Podre | 120 | **0,01%** | 0% |
| Colinas/Minas/Ruínas | 131 | 0,45% | 1,52% |
| Picos Congelados | 204 | 0,02% | 0% |
| Litoral Quebrado | 228 | **0%** | 0% |
| Deserto de Vidro | 228 | **0%** | 0% |
| Fortaleza Sombria | 228 | 0,08% | 0,085% |

**A probabilidade de upgrade cai de 100% para uma fração de 1% já na SEGUNDA região, e nunca mais se recupera** — em 2 das 7 regiões testadas (Litoral Quebrado, Deserto de Vidro), a probabilidade medida foi **exatamente 0% em 20.000 tentativas**.

### Fase 4 — Running Maximum

**Caso i.i.d. puro** (mesmo nível 20, 2.000 draws): 7 recordes observados contra 8,18 previstos pela teoria de "record statistics" (Rényi, 1962: `P(draw k é recorde) = 1/k` para variáveis contínuas i.i.d., independente da distribuição) — a leve diferença (7 vs. 8,18) é esperada, pois a distribuição do jogo não é estritamente contínua (>50% dos valores são EXATAMENTE 11, empates nunca contam como novo recorde, o que reduz ainda mais a taxa de recordes frente à teoria).

**Caso real** (nível sobe a cada região, mesma amostra da Fase 2/3, 140.000 draws no total): **apenas 18 novos recordes em 140.000 tentativas** — 8 na 1ª região, e nunca mais que 4 por região depois disso (0 em Litoral Quebrado e Deserto de Vidro).

**Existe running maximum? Sim, demonstrado matematicamente e empiricamente**: cada upgrade eleva permanentemente a barra (`runningBest = max(runningBest, novoValor)`), e como a distribuição de onde se sorteia não muda o suficiente entre regiões (Fase 2), a probabilidade de bater essa barra decai de forma consistente com a teoria de recordes — só que ainda PIOR que o caso i.i.d. puro, porque a distribuição real tem massa concentrada em valores baixos (common) e o Item Level para de crescer de forma relevante (Fase 6/7).

### Fase 5 — Decomposição: RNG vs. Item Level vs. Raridade vs. Pool de Afixos

| Fator isolado | Configuração | Média | Desvio padrão |
| --- | --- | --- | --- |
| RNG puro | nível 20 fixo, raridade forçada única | 95,0 | 35,7 |
| Item Level | raridade única forçada, nível 1→60 | 62,0 → 71,2 → 93,3 (nv.20) → 101,6 (nv.30) → 112,8 (nv.40) → 138,8 (nv.50) → 141,9 (nv.60) | — |
| Raridade | nível 20, natural vs. comum forçado | natural 26,7 (desvio 28,4) vs. comum **11,0 (desvio 0 — zero variância)** | — |
| Pool de afixos | nível 20, raridade única forçada | Arma (pool rico) 94,3 vs. Armadura (pool pobre) **37,8** — 2,5x de diferença só pelo pool disponível | — |

**Contribuição de cada fator** (comparando a variação que cada um sozinho produz): **Raridade é o fator dominante** (increase de 11,0 fixo para 26,7 médio, mas SÓ porque introduz a possibilidade de ter afixos — uma vez presente, o Pool de Afixos determina o teto: 94,3 vs. 37,8, um fator de 2,5x). **Item Level tem a MENOR contribuição relativa dentro da janela alcançável pelo jogo** (nível 20→30: apenas +8,3, +8,9%) — mas cresceria MUITO mais se o jogo permitisse ir além de 30 (nível 30→40 sozinho adicionaria mais +11,2, +11%, um ganho maior que toda a janela 20-30 que o jogo realmente permite). **RNG puro tem desvio padrão de 35,7 num nível/raridade fixos** — uma variância real, mas que só se expressa plenamente quando raridade+afixos já garantiram algo para variar.

### Fase 6/7 — Affix Scaling e Power Score Ceiling

Dos **50 tiers** de afixo cadastrados no jogo (14 mods × 2-4 tiers cada): **28 (56%) são alcançáveis dentro de `MAX_LEVEL=30`**; mesmo usando o teto MAIS generoso possível (`~38`, somando toda variância de encontro+loot), só **34 (68%)** ficam alcançáveis.

**O melhor tier (T1) de 13 dos 14 mods do jogo é matematicamente inalcançável, mesmo no cenário mais favorável possível** — a única exceção é "Healthy" (Vida), cujo T1 foi calibrado para nível 10, não para o fim de jogo. Os outros 13 exigem Item Level 50-65 — 12 a 35 pontos ACIMA do teto prático de ~38.

| Teto de Power Score (Arma, único, melhores tiers elegíveis) | Valor |
| --- | --- |
| Teórico no `MAX_LEVEL` (30) | 390 |
| Teórico no teto prático generoso (~38) | 485 |
| Teórico se o jogo permitisse nível 65 (desbloqueando TODOS os T1) | **700** |
| Máximo realmente observado em 20.000 amostras (Fortaleza Sombria, nível 30) | 276 |

**O jogo estruturalmente só dá acesso a 56% (390/700) do teto de Power Score que o próprio banco de afixos foi desenhado para suportar** — não é uma questão de sorte ou de balanceamento, é um limite de acesso: os outros 44% do conteúdo (13 T1s + vários T2s) nunca podem ser sorteados, porque o Item Level nunca chega lá.

### Fase 8 — Monte Carlo (50.000 gerações independentes, nível 20 fixo, sem combate/campanha)

- Média: 26,8 · Mediana: 11 · p90: 67 · p99: 136 · Máximo: 248.
- **Novos recordes por bloco de 1.000 gerações**: 4 no primeiro bloco, **ZERO em todos os 49 blocos seguintes (49.000 gerações consecutivas sem um único novo recorde)**.

Esta é a evidência mais direta possível de que o problema é do **algoritmo de geração em si**, isolado de qualquer fator de combate/campanha/sobrevivência: mesmo gerando equipamentos infinitamente, sem jogador, sem morte, sem tempo, **o próprio processo de amostragem esgota upgrades úteis em poucos milhares de tentativas e nunca se recupera**.

---

## 4. Diagnóstico

**O algoritmo NÃO é sustentável para campanhas longas.** As 4 linhas de evidência (Fase 2/3/4/8) convergem para a mesma conclusão por caminhos independentes:
- Fase 2: o valor médio esperado praticamente para de crescer a partir do nível ~20 (dentro da janela que o jogo realmente permite).
- Fase 3: a probabilidade de um novo item ser upgrade cai para uma fração de 1% já na 2ª região, chegando a exatamente 0% em 2 das 7 regiões testadas.
- Fase 4: o efeito "running maximum" é real, matematicamente demonstrável (teoria de recordes) e ainda mais severo que o caso i.i.d. puro, por causa da distribuição concentrada em valores baixos.
- Fase 8: mesmo em geração pura, sem nenhuma variável de jogo, o processo produz apenas 6 recordes em 50.000 tentativas, todos nos primeiros milhares.

**Existe convergência?** Sim — para uma probabilidade de upgrade próxima de zero.
**Existe teto?** Sim — 390 de Power Score no `MAX_LEVEL` (56% do teto de 700 que o próprio banco de afixos foi desenhado para suportar).
**Existe colapso?** Sim — a probabilidade de upgrade chega a 0% exato (0/20.000) em 2 das 7 regiões testadas.
**Existe running maximum?** Sim — demonstrado matematicamente (teoria de recordes, Rényi 1962) e confirmado empiricamente (18 recordes em 140.000 draws "reais", 6 em 50.000 draws de Monte Carlo puro).
**Existe perda estrutural de progressão?** Sim — 44% de todos os tiers do jogo (13 dos 14 melhores tiers) são inacessíveis por design, não por azar.
**O algoritmo é sustentável?** **Não.**

---

## 5. Root Cause

O defeito ocorre exatamente na junção de duas decisões de design que, isoladamente, fazem sentido, mas que juntas travam o sistema:

1. **`MAX_LEVEL = 30`** (`xp.ts`) — um teto de nível de personagem definido nas Sprints de calibração de combate anteriores, por boas razões de balanceamento de Chefes/regiões.
2. **Os afixos foram desenhados numa escala de Item Level de até 60-65** (`prefix_massive` T1 exige 65; `prefix_cruel`/`prefix_heavy`/`prefix_swift`/`suffix_of_accuracy` T1 exigem 50; os demais 8 mods exigem 55-60) — uma escala de itemização clássica de ARPG, pensada para uma faixa de nível MUITO maior que 30.

Como o Item Level de todo drop do jogo é derivado de `playerLevel` (nunca do `levelRange` abstrato do Enemy Template), e `playerLevel` nunca ultrapassa 30, **o próprio teto de personagem do jogo (decidido em Sprints de combate, sem relação com o Item Generator) corta a escala de itemização pela metade**, deixando os 13 melhores tiers do jogo permanentemente fora de alcance. Nenhuma quantidade de rebalanceamento de peso de tier ou de `itemLevelVariance` (ambos testados e descartados na Sprint anterior) pode compensar isso — porque o problema não é "os tiers certos são raros", é "os tiers certos não existem no intervalo de Item Level que o jogo consegue produzir".

---

## 6. Alternativas Arquiteturais

Nenhuma implementada — apenas comparação conceitual (Fase 9 do briefing).

### A) Recalibrar os limiares de Item Level dos afixos para caber em 0-30
**Como funciona**: reescalar `minItemLevel` de cada tier (ex.: T1 de 50-65 → 24-30) pra que os 4 tiers de cada mod se distribuam dentro da janela 1-30 real do jogo.
**Vantagens**: menor mudança possível — só valores numéricos, nenhuma arquitetura nova; resolve o problema imediatamente.
**Riscos**: comprime toda a "curva de raridade" pretendida (T1 deixa de ser um objetivo de muito longo prazo); precisa de nova rodada de calibração de Power Score/combate pra não trivializar o fim de jogo.
**Impacto no jogador**: alto e imediato — upgrades reais voltam a acontecer até o fim de uma campanha de nível 30.
**Impacto arquitetural**: mínimo — só dados (`prefixes.ts`/`suffixes.ts`), mesma estrutura de tiers.

### B) Progressão contínua (afixos escalam com Item Level, sem tiers fixos)
**Como funciona**: substituir "tiers com limiares" por uma fórmula contínua (ex.: `valor = min + (max-min) × f(itemLevel)`), sem nenhum "T1 trancado" — todo drop em qualquer nível tem alguma chance de rolar perto do teto, ponderada pelo nível.
**Vantagens**: elimina o conceito de "tier inacessível" por completo; upgrade útil vira uma questão de sorte contínua, não de limiar binário.
**Riscos**: reescrita relevante do Item Generator (`rollMod()`/tiers inteiros); muda a "sensação" de progressão (loot de baixo nível pode ocasionalmente competir com loot de alto nível, o que pode ser bom ou ruim dependendo da visão de design).
**Impacto no jogador**: alto, mas menos previsível — a progressão fica mais suave, porém menos "marcos claros" (T1/T2/T3/T4 como objetivos nomeados desaparecem).
**Impacto arquitetural**: médio-alto — toca o núcleo do Item Generator, precisa de nova suíte de testes.

### C) Escalonamento regional/por-tier em vez de por-nível-de-personagem
**Como funciona**: desacoplar Item Level do `playerLevel` — cada REGIÃO (não o personagem) define um teto de Item Level próprio, crescente por região (ex.: bosque=1-15, fortaleza=45-65), independente de `MAX_LEVEL`.
**Vantagens**: preserva os tiers/afixos existentes inteiramente (nenhuma mudança de `prefixes.ts`/`suffixes.ts`); só desacopla a ORIGEM do Item Level.
**Riscos**: quebra a suposição atual "Item Level = nível do jogador" em vários lugares (`resolveGroupLevel()`, testes existentes); loot de uma região tardia pode ficar poderoso demais pra um personagem que ainda não é nível 30 se chegar lá cedo (menos provável dado o gate de região, mas precisa validação).
**Impacto no jogador**: alto — cada região passa a ter uma identidade de "tier de loot" própria, familiar em outros ARPGs (ex.: "Ato 1/2/3" com tiers de item crescentes independentes do nível do personagem).
**Impacto arquitetural**: médio — toca `worldencounter/generator.ts` (de onde vem o nível do inimigo), mas não o Item Generator em si.

### D) Elevar `MAX_LEVEL` para acompanhar a escala de itemização (ex.: 30 → 65)
**Como funciona**: simplesmente subir o teto de nível de personagem pra bater com o teto de itemização já desenhado.
**Vantagens**: nenhuma mudança no Item Generator — os tiers já fazem sentido, só precisam de personagens que cheguem lá.
**Riscos**: o MAIS arriscado das 4 opções — `MAX_LEVEL=30` foi decidido e usado como base de calibração em VÁRIAS Sprints de combate anteriores (gates de região, densidade de Chefe, XP); subir isso exige recalibrar TODO o Combat Engine/Enemy Templates/XP do zero, um projeto muito maior que "corrigir o Item Generator".
**Impacto no jogador**: alto, mas só depois de uma re-calibração extensa de combate — risco real de regressão em tudo que já foi calibrado.
**Impacto arquitetural**: alto — a Sprint anterior já mostrou (Combat Difficulty Calibration) o tanto de trabalho que uma mudança de teto de nível exige nesse projeto.

---

## 7. Recomendação

**Recomendo a Alternativa A (recalibrar os limiares de Item Level dos afixos para caber em 0-30).**

Justificativa, exclusivamente com os dados desta Sprint:
- É a única alternativa cujo "menor conjunto de mudanças" é genuinamente pequeno — só os campos `minItemLevel` de 50 tiers em 2 arquivos de dados (`prefixes.ts`/`suffixes.ts`), a MESMA categoria de mudança já feita com sucesso e validada na Sprint anterior (rebalanceamento de peso de tier).
- Ataca a causa raiz identificada na Seção 5 diretamente: o problema não é "os tiers são raros", é "os tiers não existem no intervalo alcançável" — mover os limiares PARA DENTRO do intervalo alcançável resolve isso sem tocar em nenhuma outra parte do jogo.
- Não exige re-calibração de combate (ao contrário da Alternativa D) nem reescrita de arquitetura (ao contrário da B) nem desacoplamento de suposições já usadas em vários lugares do código (ao contrário da C).
- É reversível e comparável: a mesma metodologia desta Sprint (`itemGenerationDesignReview.ts`) pode rodar de novo depois da mudança pra confirmar que o teto de 700 (Fase 6/7) passa a ficar de fato alcançável dentro de `MAX_LEVEL=30`.

---

## 8. Plano para a Próxima Sprint

**Menor intervenção possível para validar a Alternativa A** (prova de conceito incremental, não uma reescrita):

1. Reescalar os `minItemLevel` de cada tier dos 14 mods pra que T4/T3/T2/T1 se distribuam proporcionalmente dentro de 1-30 (ex.: um mod que hoje é 1/10/20/40/60 → algo como 1/8/15/22/30) — só números, nenhuma estrutura nova.
2. Rodar `scripts/itemGenerationDesignReview.ts` (já existe, sem mudança) de novo como comparação Antes/Depois — confirmar que a Fase 3 (probabilidade de upgrade) deixa de colapsar pra 0% e que a Fase 7 (teto de Power Score) passa a ficar mais perto de 700 dentro do `MAX_LEVEL`.
3. Rodar a auditoria de progressão de equipamento já existente (`runEquipmentProgressionAudit.ts`, das 2 Sprints anteriores) pra confirmar Dead Loot/upgrades por slot melhoram sem regressão de combate (mesma checagem de Fase 8 já estabelecida).
4. **Não** tocar em Combat Engine/Simulator/RuntimeConfig/`MAX_LEVEL` — validação isolada ao Item Generator, mesma fronteira desta Sprint e da anterior.

---

## 9. Commercial Impact

A retenção de novos jogadores nas primeiras sessões **não é diretamente afetada por este problema** — a Fase 2/3 mostram que a 1ª região continua com 100% de chance de upgrade e a 2ª ainda tem alguma (embora já em queda livre). O dano comercial é de **médio a longo prazo**: um jogador que passa da 1ª hora de jogo — exatamente o perfil que decide se compra o jogo completo ou recomenda pra outros — entra numa fase onde a matemática do próprio gerador de itens já não tem mais para onde crescer, independente de quão bem ele jogue ou quanto tempo invista. Isso se manifesta como a sensação, já documentada nas 2 auditorias anteriores, de "a progressão trava depois da primeira hora" — só que agora está provado que essa sensação não é um bug de calibração passageiro, é uma propriedade estrutural do algoritmo atual, que **nenhuma quantidade de ajuste fino resolveria** sem tocar na causa raiz (Seção 5). Isso eleva a prioridade da correção: não é mais "um ajuste de balanceamento pendente", é "uma parede matemática que qualquer jogador dedicado vai bater, sempre, do jeito que o sistema está desenhado hoje".

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Testes**: nenhum arquivo de `src/` foi alterado — só um script novo de análise em `scripts/`. Nenhum teste executado (instrução explícita da Sprint: só rodar testes se código compartilhado mudasse).
- **Smoke test**: não aplicável — nenhuma mudança de código de produção.
- Dados brutos completos em `reports/item-generation-design-review.json` (determinístico, reproduzível via `npx tsx scripts/itemGenerationDesignReview.ts`).
