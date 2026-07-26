# Item Generation Redesign Validation — Simulation (Phase I)

Sprint exclusivamente de simulação. Nenhuma alteração permanente: `scripts/itemGenerationRedesignValidation.ts` muta `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` **em memória**, dentro do mesmo processo, roda a engine real (`generateItem()`, `advanceDungeonTick()`, todo o Adventure Loop) sem nenhuma cópia/reimplementação, e restaura os valores originais logo depois — confirmado ao final da execução (`restoredCorrectly: true`, comparação byte-a-byte contra um clone tirado antes de qualquer mutação). `git status` permanece limpo em `src/` após rodar o script.

**Pergunta central**: *se os thresholds forem reescalados pro intervalo real do jogo (1-30), a progressão de equipamentos volta a funcionar naturalmente?* Resposta, com os dados desta Sprint: **não — pelo menos não sozinha.** A hipótese da Sprint anterior está PARCIALMENTE refutada: a reescala de thresholds tem um efeito real e mensurável isoladamente (Monte Carlo por região), mas esse efeito **não sobrevive** à dinâmica de campanha completa (running maximum acumulado desde as primeiras regiões) — os 4 modelos testados produzem resultados praticamente idênticos ao atual numa campanha real de N=300.

---

## 1. Metodologia Experimental

- **Camada experimental** (Fase 1): um clone "pristine" de `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` é tirado (`structuredClone`) antes de qualquer mutação. Para cada modelo, os valores de `tiers[].minItemLevel` dos arrays JÁ IMPORTADOS (as MESMAS instâncias que `generateItem()` lê internamente) são sobrescritos em memória a partir desse clone, a simulação roda usando o algoritmo real sem nenhuma modificação, e os valores são restaurados a partir do clone logo depois — validado com uma comparação `JSON.stringify` final.
- **O que foi alterado**: só `minItemLevel` de cada tier (50 valores, 14 mods).
- **O que permaneceu idêntico ao jogo atual**: `weight` de cada tier (a distribuição 4/16/30/50 já calibrada na Sprint "Equipment Progression Repair Phase II" não foi tocada), `min`/`max` de cada tier, Power Score, Loot Tables, Combat Engine, RNG, contagem de prefixos/sufixos por raridade, `MAX_LEVEL`.
- **Fase 3 (Monte Carlo)**: N=8.000 gerações/região (reduzido de 20.000 da Sprint anterior pra caber 5 configurações no mesmo orçamento de tempo — ainda muito acima do necessário pra significância estatística em proporções: erro-padrão de uma proporção com N=8.000 é <0,6pp mesmo no pior caso).
- **Fase 4 (Campanha completa)**: N=300 campanhas, mesmas seeds/mesma metodologia de `runEquipmentProgressionAudit.ts` (as 2 Sprints anteriores), repetida para cada um dos 5 modelos.
- Execução total: 21 segundos (5 modelos × Monte Carlo + 300 campanhas cada).

---

## 2. Modelos Testados

| Modelo | Fórmula | Racional |
| --- | --- | --- |
| **Atual** (baseline) | sem alteração | referência |
| **A — Linear** | `novo = 1 + (antigo-1) × 29/64` | mapeamento direto e uniforme de [1,65] para [1,30] |
| **B — Proporcional** | `antigo <= 20` mantém; `antigo > 20` reescala [20,65]→[20,30] | preserva a densidade já existente nos tiers baixos (já dentro da janela real), só comprime os tiers altos |
| **C — Curva Suave** | `novo = 1 + 29 × ((antigo-1)/64)^0,6` | lei de potência — espalha mais os níveis médios (onde a maior parte da campanha acontece, nível 15-20) em vez de comprimir tudo linearmente |
| **D — Adaptativo** | rank do threshold original interpolado sobre os 7 níveis médios de entrada de região **medidos empiricamente** (1, 5, 15, 20, 24, 28, 30 — da auditoria Phase I anterior) | data-driven, reflete onde os personagens REALMENTE passam o tempo, não uma curva sintética |

Todos os 4 modelos garantem ordem estritamente crescente entre tiers do mesmo mod após arredondamento (nenhuma colisão/inversão de tier).

---

## 3. Comparação Estatística

### Campanha completa (N=300, IC95% aproximado por Teorema Central do Limite)

| Modelo | Dead Loot Rate | Upgrades/campanha (média) | Nível final médio | Power Score máx. observado |
| --- | --- | --- | --- | --- |
| Atual | 95,26% | 4,84 | 19,97 | 1.093 |
| A | 95,27% | 4,90 | 20,36 | 1.142 |
| B | 95,26% | 4,84 | 19,97 | 1.093 |
| C | 95,26% | 4,84 | 19,97 | 1.093 |
| D | 95,32% | 4,86 | 20,41 | 1.142 |

**Modelos B e C produzem resultados BIT-A-BIT IDÊNTICOS ao Atual** em toda a campanha (mesmos totais de upgrade por slot, até o último dígito — ver tabela de slots abaixo) — nenhuma das 300 sementes testadas produziu um único evento diferente. Modelos A e D produzem uma diferença pequena, real, mas modesta (+1,2% a +2,7% em upgrades totais).

### Upgrades por Slot (total em 300 campanhas)

| Slot | Atual | A | B | C | D |
| --- | --- | --- | --- | --- | --- |
| Arma | 605 | **627** | 605 | 605 | **621** |
| Elmo | 30 | 30 | 30 | 30 | 31 |
| Peitoral | 146 | 144 | 146 | 146 | 146 |
| Luvas | 48 | 48 | 48 | 48 | 48 |
| Botas | 247 | 248 | 247 | 247 | 245 |
| Anel 1 | 164 | 159 | 164 | 164 | 155 |
| Anel 2 | 30 | 29 | 30 | 30 | 29 |
| Amuleto | 20 | 19 | 20 | 20 | 19 |
| Cinto | 162 | 165 | 162 | 162 | 165 |

### Curva de Power Score, nível 18-30 (personagem, campanha completa)

| Nível | Atual | A | B | C | D |
| --- | --- | --- | --- | --- | --- |
| 20 | 804 | 814 (+1,2%) | 804 | 804 | 818 (+1,7%) |
| 25 | 929 | 939 (+1,1%) | 929 | 929 | 945 (+1,7%) |
| 30 | 1.059 | 1.079 (+1,9%) | 1.059 | 1.059 | 1.080 (+2,0%) |

**A FORMA da curva (taxa de crescimento) não muda em NENHUM modelo** — só A e D produzem um deslocamento CONSTANTE pequeno (+1-2%), não uma retomada de crescimento acelerado. B e C não produzem NENHUM deslocamento.

### Probabilidade de Upgrade por Região (Monte Carlo isolado, N=8.000/região — mostra um sinal MAIOR que a campanha real)

| Região | Atual (Armadura) | A | B | C | D |
| --- | --- | --- | --- | --- | --- |
| Pântano Podre | 0,00% | 0,31% | 0,00% | 0,00% | 0,31% |
| Colinas/Minas/Ruínas | 1,35% | 5,61% | 1,35% | **9,41%** | 5,24% |
| Picos Congelados | 0,05% | 0,61% | 0,05% | 0,24% | 0,79% |
| Litoral Quebrado | 0,00% | 0,04% | 0,83% | 0,46% | 0,00% |
| Deserto de Vidro | 0,00% | 0,11% | 0,25% | 0,25% | 0,18% |

O Monte Carlo isolado (que reseta o "melhor já visto" a zero pra cada configuração, sem carregar o histórico real de uma campanha) mostra melhoras reais e às vezes grandes em termos RELATIVOS (Modelo C: 1,35%→9,41%, quase 7x, na região Colinas/Minas/Ruínas) — mas essas melhorias **não se traduzem na campanha real** (ver Seção 4).

---

## 4. Modelo Vencedor

**Nenhum dos 4 modelos atinge os Critérios de Aprovação desta Sprint** ("aumento consistente da taxa de upgrades; redução significativa do Dead Loot; crescimento contínuo entre os níveis 20-30") — todos os 4 falham em pelo menos 2 dos 3 critérios centrais, com efeitos entre "zero" (B, C) e "pequeno mas real" (A, D).

Dentre os 4, **o Modelo A (Linear) é o mais indicado para uma PRÓXIMA rodada de experimentação** (não para produção): é a fórmula mais simples (mapeamento direto, sem parâmetros extras como o expoente de C ou os anchors empíricos de D), e é um dos 2 únicos modelos (junto com D) que produziu qualquer efeito mensurável na campanha real. Justificativa técnica de por que nenhum modelo "resolve": ver Seção 5.

---

## 5. Avaliação de Risco (Root Cause do porquê a reescala sozinha não basta)

`rollMod()` (`itemgen/generator.ts`) executa em 2 estágios sequenciais: **(1)** filtra tiers elegíveis por `minItemLevel <= itemLevel`, **(2)** sorteia PONDERADO por `tier.weight` ENTRE os elegíveis. Os 4 modelos desta Sprint só atacam o estágio (1) — tornam T1/T2 tecnicamente elegíveis em níveis mais baixos — mas o estágio (2) continua com os MESMOS pesos (4/16/30/50, calibrados na Sprint "Equipment Progression Repair Phase II"), onde T4 ainda vence ~50% das rolagens **mesmo quando T1/T2/T3 já estão elegíveis**. Resultado: tornar um tier "alcançável" não o torna "provável" — ele só passa a competir, ainda em desvantagem de peso, contra o tier mais fraco que já dominava antes.

Isso explica exatamente por que os Modelos B e C (que só reescalam thresholds ACIMA de valores já alcançáveis, ou de forma muito concentrada no meio) não mudaram NADA na campanha real: o "running maximum" de uma campanha já é definido nas primeiras regiões (onde os thresholds já eram baixos o bastante, inalterados por B/C) — pela hora em que o personagem chega nas regiões onde B/C fariam diferença, a barra já está alta o bastante (herdada das primeiras regiões) que a pequena chance adicional (ainda pesada contra T4) nunca é suficiente pra superá-la. Isso é o MESMO fenômeno de "running maximum"/"máximo de amostra" já documentado nas 2 Sprints anteriores — confirmado aqui como a causa de por que uma correção de UM SÓ estágio (thresholds OU pesos, nunca os dois) não é suficiente.

**Riscos que permanecem antes de qualquer implementação definitiva**: (1) nenhum dos 4 modelos testados isoladamente resolve o problema — implementar qualquer um sozinho na produção repetiria o mesmo padrão de "mudança correta, efeito insuficiente" já visto 2 vezes (rebalanceamento de peso sozinho, na Sprint anterior; agora reescala de threshold sozinha); (2) a combinação threshold+peso NUNCA foi testada nesta Sprint nem na anterior — é a lacuna real.

---

## 6. Plano de Implementação

**Não implementar nenhum dos 4 modelos isoladamente.** Nenhuma alteração de arquivo é recomendada nesta Sprint.

Plano proposto para a PRÓXIMA Sprint (ainda de simulação, antes de qualquer produção): reexecutar exatamente esta mesma camada experimental (`scripts/itemGenerationRedesignValidation.ts`, sem nenhuma mudança de metodologia), mas testando a combinação **Modelo A (thresholds) + um novo rebalanceamento de peso** (ex.: 4/16/30/50 → algo como 15/25/30/30, achatando a curva de peso pra que tiers recém-desbloqueados tenham chance real de ser sorteados, não só elegibilidade). Arquivos que precisariam mudar SE essa combinação for validada e aprovada:
- `packages/shared/src/itemgen/prefixes.ts` (50 valores de `minItemLevel`, mesmo padrão desta Sprint)
- `packages/shared/src/itemgen/suffixes.ts` (idem)
- Possivelmente os campos `weight` dos mesmos tiers (segunda variável, ainda não testada em conjunto)

Nenhuma mudança de arquivo nesta Sprint em si.

---

## 7. Commercial Impact

Nesta rodada de testes, **a alteração isolada de thresholds não melhora perceptivelmente a sensação de progressão numa campanha completa** — os números de Dead Loot/upgrades por campanha são estatisticamente indistinguíveis do estado atual para 2 dos 4 modelos, e apenas marginalmente diferentes (1-3%) para os outros 2. Um jogador não perceberia diferença prática entre o jogo atual e qualquer um dos 4 modelos testados isoladamente. Isso significa que a melhoria de retenção/sensação de recompensa esperada da recomendação da Sprint anterior **ainda não está disponível** — o problema estrutural (Item Generation Design Review Phase I) continua real e mensurável, mas a correção completa exige a combinação (thresholds + pesos) ainda não testada, adiando o ganho comercial esperado para depois de uma próxima rodada de validação.

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Testes**: nenhum arquivo de `src/` foi alterado — só um script novo em `scripts/`. Nenhum teste executado (instrução explícita: só se código compartilhado mudasse).
- **Suíte completa**: não executada (nenhuma alteração de produção).
- **Validação manual em navegador**: não executada (instrução explícita da Sprint).
- **Confirmação de reversibilidade**: `restoredCorrectly: true` — os arrays `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` ficaram byte-a-byte idênticos ao estado original após a execução completa das 5 configurações.
- Dados brutos completos em `reports/item-generation-redesign-validation.json` (determinístico, reproduzível via `npx tsx scripts/itemGenerationRedesignValidation.ts`).
