# Equipment Progression Investigation — Final Conclusions

Documento de fechamento de uma série de 8 Sprints investigativas sobre por que a progressão de equipamentos "trava" durante campanhas completas. Consolida hipóteses levantadas, refutadas e confirmadas, o que foi de fato implementado, o impacto medido de cada mudança, e as questões que permanecem em aberto — a partir daqui, esta é a referência oficial para qualquer alteração futura no sistema de equipamentos, para não repetir investigação já feita.

**Conclusão central, em uma frase**: o Item Generator, os thresholds, os pesos, o algoritmo de seleção de afixo, a origem do Item Level e a fórmula de comparação do Auto Equip foram todos investigados e nenhum deles é, isoladamente, a causa raiz — a causa raiz é uma propriedade **matemática** do modelo de decisão em si ("só substitui se for estritamente melhor"), que qualquer fórmula de comparação testada reproduz igualmente. Não é mais uma pergunta de engenharia. É uma pergunta de design.

---

## 1. Linha do Tempo — Hipóteses

| # | Sprint | Hipótese testada | Resultado |
| --- | --- | --- | --- |
| 1 | Equipment Progression Audit (Phase I) | Existe um problema real de progressão travada? | **Confirmado** — Dead Loot ~95%, platôs de centenas de segundos, Elmo/Peitoral nunca evoluíam |
| 2 | Equipment Progression Repair (Phase II) | Peso de `baseDefense` no Power Score e ausência de Elmo/Peitoral/Amuleto nas Loot Tables iniciais explicam o platô desses 3 slots? | **Confirmado e corrigido** — Elmo 0→30, Peitoral 0→146 upgrades em 300 campanhas |
| 3 | Item Generation Design Review (Phase I) | O algoritmo de geração consegue sustentar upgrades em campanhas longas? | **Refutado** — não consegue; causa raiz identificada: `MAX_LEVEL=30` (Combat Engine) vs. banco de afixos desenhado pra escala 60-65 (Item Generator) — 44% do conteúdo estruturalmente inacessível |
| 4 | Item Generation Redesign Validation | Reescalar `minItemLevel` sozinho resolve? | **Refutado** — efeito real mas pequeno (+1-3%); a causa é a COMBINAÇÃO threshold+peso, nunca testada isoladamente |
| 5 | Affix Selection Prototype (Phase I) | Um algoritmo de seleção de tier diferente (ponderado por progresso, não peso estático) resolve? | **Refutado** — Dead Loot e Power Score praticamente idênticos ao atual; triangula a MESMA causa raiz da Sprint 3 por um método independente |
| 6 | Item Level Progression Model (Architecture Phase I) | Player Level é a variável certa pra dirigir Item Level? | **Refutado** — Region (ordem real de progressão) alcança 100% dos tiers de afixo na última região, contra 45% do Player Level |
| 7 | Region-Anchored Item Level (Implementation) + Loot Table Normalization | Implementar Region-Anchored Item Level resolve, na prática? | **Implementado com sucesso arquitetural** (uma fonte de verdade, Loot Tables sem duplicação) — mas efeito de campanha quase nulo, por 2 causas novas: `derived.powerScore` (nível do personagem) domina o Power Score total; e o próprio "running maximum" do Auto Equip (Sprint 8) consome a maior parte do ganho |
| 8 | Equipment Decision Model (Design Review) | O comparador do Auto Equip rejeita upgrades legítimos? | **Parcialmente confirmado** — 0,85% de falsos negativos reais (Força inflando Power Score sem contribuir pra combate; Critical/Attack Speed/Life Leech subvalorizados) — mas TODAS as 5 fórmulas testadas (incluindo 4 alternativas) colapsam pro MESMO running-maximum a partir da 3ª região. A fórmula não é o gargalo — o mecanismo "só substitui se estritamente melhor" é. |
| 9 | Long-Term Equipment Progression (Design Experiment, este documento) | O modelo "substituir apenas se for melhor" é adequado pra dezenas de horas de progressão? | **Estudo de design — ver Seção 4.** Não é mais uma pergunta técnica. |

---

## 2. O Que Foi Implementado (mudanças reais em produção, nesta série)

| Mudança | Sprint | Impacto medido |
| --- | --- | --- |
| Redução do peso de `baseDefense` no Power Score | Equipment Progression Repair II | Elmo 0→30, Peitoral 0→146 upgrades/300 campanhas |
| `chest`/`helmet`/`amulet` adicionados às Loot Tables iniciais | Equipment Progression Repair II | Mesma medição acima — corrigiu tanto a fórmula quanto a oportunidade de drop |
| `getRegionItemLevelAnchor()` — Item Level passa a vir da região, não do nível do personagem | Region-Anchored Item Level | Item Level bruto sobe substancialmente (ex.: skeleton 10-30 → 19-63); efeito em campanha diluído por `derived.powerScore` + running maximum |
| `LootTable.minLevel`/`maxLevel` removidos (eram 100% duplicados de `EnemyTemplate.levelRange`), substituídos por `itemLevelOffset?` opcional | Loot Table Normalization | Elimina uma segunda fonte de verdade pra progressão; zero tabelas usam o offset hoje (nenhuma exceção genuína existe) |

Nenhuma outra mudança de código foi feita nesta série — Affix Selection Prototype e Equipment Decision Model Review permaneceram investigativas (o protótipo/comparadores alternativos nunca foram promovidos a produção, por não terem se mostrado superiores).

---

## 3. Por Que "Só Substitui Se For Estritamente Melhor" Sempre Converge Pra Zero

Não é uma falha de implementação — é **estatística de recordes** (Rényi, 1962): para uma sequência de variáveis aleatórias i.i.d., a probabilidade do k-ésimo sorteio ser um novo recorde é exatamente `1/k`, independente da distribuição. Cada upgrade aceito eleva permanentemente a barra (`runningBest = max(runningBest, novo)`); a chance do PRÓXIMO sorteio superar essa barra cai estruturalmente, não por azar.

A série toda testou 3 formas diferentes de tentar escapar disso, e as 3 confirmaram a mesma matemática por baixo:
- **Mudar a distribuição de onde se sorteia** (thresholds, pesos, algoritmo de seleção, origem do Item Level) — desloca a distribuição, mas o MECANISMO de comparação continua consumindo qualquer ganho quase tão rápido quanto ele aparece.
- **Mudar a fórmula de comparação** (Sprint 8) — testado com 5 fórmulas, incluindo 3 alternativas mais "corretas" que a atual — todas colapsam pro mesmo padrão.

**A única alavanca nunca testada nesta série é a ESTRUTURA da decisão em si** — não "qual número comparar", mas "o que significa uma decisão de equipar". Essa é a pergunta de design que abre a Seção 4.

---

## 4. Estudo de Design — Modelos Alternativos de Progressão (Fase única desta Sprint, não implementado)

O padrão atual do jogo:

```
Encontrar Item → Comparar (1 número) → Equipar só se estritamente melhor → platô inevitável
```

Isso não é errado — é o modelo mais simples possível, e funciona bem nas primeiras horas (quando quase tudo é upgrade). O problema é estrutural: um único número, comparado estritamente, **sempre** faz o espaço de "upgrades possíveis" encolher com o tempo, não importa quão boa seja a distribuição de onde os itens vêm. Abaixo, os modelos alternativos citados no briefing, cada um atacando essa estrutura de um jeito diferente — não como recomendação de implementação, só como mapa do espaço de design.

### 4.1 Upgrades incrementais (o item que você já tem melhora, em vez de ser substituído)
Em vez de esperar um item MELHOR cair, o jogador investe em melhorar o item que JÁ tem (sockets, encantamento, refinamento). Isso não elimina o running maximum — desloca ONDE ele mora: em vez de "qual é o melhor item que já caiu", vira "quanto investimento já coloquei neste item" — uma barra que o PRÓPRIO JOGADOR controla, não uma que só sobe por sorte externa. Rompe a dependência de RNG puro pra continuar sentindo progresso.

### 4.2 Melhoria parcial (trocar só uma parte, não o item inteiro)
Em vez de "descartar A, equipar B", permitir "usar B pra melhorar UM atributo de A" (ex.: craft/salvage que transfere um mod). Isso quebra a comparação escalar única — a decisão deixa de ser "A ou B" e vira "quais peças de A e B eu quero combinar", o que estatisticamente tem MUITO mais espaço de melhoria do que exigir que um item inteiro supere outro inteiro em todos os aspectos.

### 4.3 Múltiplos critérios (parar de reduzir tudo a 1 número)
O Power Score de hoje colapsa 8-10 stats heterogêneos numa única escala (e a Sprint 8 já mostrou que isso distorce a decisão: Força conta igual a Vida, Critical vale menos do que deveria). Um modelo de múltiplos critérios (ex.: "melhor pra DPS" E "melhor pra sobrevivência" como 2 rankings paralelos, nunca fundidos em 1 só) multiplica o número de "recordes" possíveis — um item pode nunca ser o #1 geral, mas ainda assim ser um upgrade real num critério específico. Isso é, matematicamente, uma forma de particionar o problema de estatística de recordes em várias sequências menores e independentes, cada uma com sua própria chance de bater recorde.

### 4.4 Especialização (build define o que é "melhor", não o jogo)
Se dano físico crítico e dano em área de efeito fossem builds genuinamente diferentes (não uma questão de qual número é maior, mas de QUAL build o jogador escolheu), "melhor item" deixa de ser uma pergunta universal — vira uma pergunta relativa à build. Isso multiplica ainda mais o espaço de "records" possíveis (cada build tem seu próprio running maximum, independente das outras), e dá uma razão pra manter itens que hoje seriam Dead Loot só porque "não são os melhores objetivamente" — eles podem ser os melhores PRA OUTRA BUILD.

### 4.5 Trade-offs (nenhum item deveria ser estritamente melhor em tudo)
Hoje, um item PODE ser estritamente pior em tudo (e por isso é corretamente descartado). Um modelo com trade-offs reais (ex.: +dano/-vida, +velocidade/-precisão) torna a maioria dos itens NÃO COMPARÁVEIS entre si num único eixo — a fronteira de Pareto (não um ranking linear) é o espaço de decisão. Isso não é uma correção de bug, é uma mudança de gênero de decisão: de "A supera B?" pra "o que eu quero abrir mão?". Reduz drasticamente a chance de qualquer item ser objetivamente descartável.

### 4.6 Equipamentos situacionais (o "melhor" depende do contexto, não é fixo)
Se resistência a gelo importar MUITO contra um Chefe específico e pouco no resto do jogo, um jogador tem razão pra manter um item "pior" em geral, mas guardado pra aquele contexto. Isso introduz um terceiro eixo (quando/onde usar), tornando "Dead Loot" uma métrica menos significativa por definição — um item nunca equipado ainda pode ter sido uma decisão CORRETA de guardar, não um upgrade perdido.

### O que os 5 modelos têm em comum
Nenhum deles "conserta" a estatística de recordes com um número melhor — todos ATACAM A PREMISSA de que existe UM único "melhor item" cuja probabilidade de ser superado precisa, estruturalmente, cair pra zero. Ou o jogador controla a barra (4.1/4.2), ou a barra deixa de ser única (4.3/4.4), ou a comparação deixa de ser um ranking linear (4.5/4.6). Qualquer redesenho futuro do sistema de equipamentos deveria escolher entre essas 3 famílias de solução — não entre "qual fórmula de Power Score é mais precisa" (essa pergunta já foi respondida: nenhuma fórmula escalar resolve, Sprint 8).

---

## 5. Questões Ainda em Aberto

- **Qual (se algum) dos 5 modelos da Seção 4 se encaixa na visão de design do jogo?** Esta série de Sprints deliberadamente não decide isso — é uma escolha de design (que tipo de jogo o StreamRPG quer ser: um ARPG de build/especialização? um jogo de investimento incremental em poucos itens? algo mais simples que aceita o platô como parte da experiência?), não uma conclusão que dados de simulação possam entregar sozinhos.
- **O platô é necessariamente um problema?** Esta série assumiu que sim (baseado nas auditorias de Commercial Impact de cada Sprint), mas isso nunca foi validado com jogadores reais — só com simulação. Fica em aberto até playtest.
- **Correção pequena do Power Score (Sprint 8, Recomendação B — excluir Força, escalar Critical/Attack Speed/Life Leech)**: continua uma correção válida e de baixo risco, independente da decisão maior de design acima — pode ser feita a qualquer momento sem esperar a decisão de modelo de progressão.

---

## 6. Recomendação

**Encerrar oficialmente o ciclo de investigação técnica do Item Generator/Loot Tables/Item Level/Auto Equip** — 8 Sprints, 5 métodos independentes, mesma causa raiz confirmada repetidamente. Qualquer Sprint futura nesta área deveria partir DESTE documento, não reabrir hipóteses já refutadas (thresholds, pesos, algoritmo de seleção, origem do Item Level, fórmula de comparação escalar — todos já descartados como causa isolada, com dados).

Próximo passo, se e quando o projeto quiser avançar aqui: uma decisão de design (não uma investigação técnica) sobre qual dos modelos da Seção 4 — ou nenhum — faz sentido pra visão do jogo, idealmente informada por playtest real, não só simulação.

---

## Referências

Relatórios brutos desta série, em ordem: `packages/shared/reports/equipment-progression-audit-{BEFORE,AFTER}.json`, `equipment-progression-repair-phase-2.md`, `item-generation-design-review-phase-1.md`, `item-generation-redesign-validation-phase-1.md`, `affix-selection-prototype-phase-1.md`, `item-level-progression-model-phase-1.md`, `region-anchored-item-level-validation-phase-1.md`, `loot-table-item-level-normalization-phase-1.md`, `equipment-decision-model-review-phase-1.md`.
