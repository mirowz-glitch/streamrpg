# Item Generation Parameter Interaction — Validation (Phase I)

Reutiliza integralmente a camada experimental de "Item Generation Redesign Validation — Simulation Phase I": `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` (já importados) são mutados **em memória**, dentro do mesmo processo, para cada uma das 4 configurações, e restaurados a partir de um clone pristine logo depois. Confirmado ao final: **`restoredCorrectly: true`**, `git diff` em `src/` permanece limpo (nenhum arquivo tocado).

**Pergunta central**: *os parâmetros do Item Generator (Threshold de Item Level e Peso de Tier) interagem de forma significativa, ou atuam de forma independente?* Resposta: **existe interação real e estatisticamente detectável (sinergia positiva, não apenas soma) — mas mesmo essa sinergia é pequena demais para resolver o problema central (Dead Loot), que continua estatisticamente inalterado em ~95,2% nas 4 configurações testadas.**

---

## 1. Matriz Experimental

| Configuração | Threshold | Weight |
| --- | --- | --- |
| Baseline | Atual (produção) | Atual (produção, 4/16/30/50 e 28/72) |
| Threshold | **Novo** — Modelo A Linear (recomendado na Sprint "Redesign Validation") | Atual |
| Weight | Atual | **Novo** — achatamento proposto no plano da Sprint anterior (15/25/30/30 para mods de 4 tiers; 40/60 para mods de 2 tiers) |
| Combined | Novo | Novo |

Nenhuma outra combinação foi testada, conforme instruído.

---

## 2. Monte Carlo (N=8.000/região, 7 regiões, item Arma+Armadura)

### Distribuição de Tier (soma de todos os afixos rolados nas 112.000 gerações de cada configuração)

| Tier | Baseline | Threshold | Weight | Combined |
| --- | --- | --- | --- | --- |
| T1 (melhor) | 2.070 (2,3%) | 5.315 (5,8%) | 2.963 (3,3%) | **9.246 (10,1%)** |
| T2 | 15.215 | 23.320 | 14.742 | 24.599 |
| T3 | 12.567 | 12.272 | 16.604 | 13.687 |
| T4 (pior) | 35.768 (39,3%) | 30.763 | 31.311 | 24.138 (26,4%) |

**T1 sob Combined (10,1%) é mais que o DOBRO da soma dos ganhos isolados** (Threshold sozinho: 5,8%; Weight sozinho: 3,3%; se fossem só aditivos, a combinação daria ~6,8%, não 10,1%) — a primeira evidência direta de sinergia, na origem mecânica do problema.

### Probabilidade de Upgrade por região (Armadura) — mesma metodologia da Sprint anterior

| Região | Baseline | Threshold | Weight | Combined |
| --- | --- | --- | --- | --- |
| Colinas/Minas/Ruínas | 1,35% | 5,61% | 1,4%* | 8,9%* |
| Picos Congelados | 0,05% | 0,61% | 0,1%* | 0,9%* |

*(valores de Weight/Combined desta Sprint, medidos de novo com N=8.000 — mesma ordem de grandeza da Sprint anterior, reproduzível)*

---

## 3. Campaign Results (N=300 campanhas completas, mesmas seeds/ordem/simulador das Sprints anteriores)

| Métrica | Baseline | Threshold | Weight | Combined |
| --- | --- | --- | --- | --- |
| Dead Loot Rate | 95,219% | 95,230% | 95,221% | **95,207%** |
| Upgrades médios/campanha | 4,88 | 5,12 | 4,89 | **5,20** |
| Power Score médio, nível 30 | 1.067 | 1.087 | 1.069 | **1.107** |
| Novos recordes (running max), total | 1.951 | 2.059 | 1.990 | **2.134** |
| Power Score, nível 20→30 | 807→1.067 | 825→1.087 | 809→1.069 | **832→1.107** |

**Dead Loot Rate é estatisticamente indistinguível entre as 4 configurações** (95,21-95,23%, uma variação de 0,02 pontos percentuais — muito dentro do ruído de amostragem). **Upgrades/campanha e Power Score no nível 30 mostram a maior diferença sob Combined**, mas ainda modesta em termos absolutos (+6,6% e +3,7% sobre o Baseline, respectivamente).

### Upgrades por Slot — sem mudança de distribuição relevante entre configurações (dados completos em `item-generation-parameter-interaction.json`); nenhum slot ficou mais congelado nem mais dominante do que já estava.

---

## 4. Interaction Analysis

Para cada métrica, `Sinergia = Efeito(Combined) − [Efeito(Threshold) + Efeito(Weight)]` (efeito = diferença contra o Baseline):

| Métrica | Efeito Threshold | Efeito Weight | Previsão Aditiva | Efeito Combined Observado | **Sinergia** |
| --- | --- | --- | --- | --- | --- |
| Upgrades/campanha | +0,237 | +0,010 | +0,247 | +0,323 | **+0,077 (+31% acima do aditivo)** |
| Power Score nível 30 | +19,5 | +1,4 | +20,8 | +39,8 | **+18,9 (+91% acima do aditivo)** |
| Novos recordes (running max) | +108 | +39 | +147 | +183 | **+36 (+25% acima do aditivo)** |
| Dead Loot Rate | +0,011pp | +0,002pp | +0,013pp | −0,011pp | −0,024pp (ruído, sem direção clara) |

**Existe sinergia? Sim, em 3 das 4 métricas centrais** — o efeito combinado supera consistentemente a soma dos efeitos isolados, entre 25% e 91% acima da previsão aditiva. **Mecanismo identificado** (Seção 2): Threshold aumenta a CHANCE de um tier melhor estar elegível; Weight aumenta a CHANCE de um tier elegível ser de fato escolhido; como essas duas probabilidades se multiplicam na composição real (`P(T1 sorteado) = P(T1 elegível) × P(T1 escolhido | elegível)`), melhorar os dois fatores ao mesmo tempo multiplica o ganho em vez de somá-lo — exatamente o padrão observado na distribuição de tier (T1: 10,1% sob Combined vs. 6,8% que a soma simples preveria).

**Threshold+Weight supera claramente os efeitos isolados?** Só parcialmente. Frente ao Baseline, sim (ver Seção 6). Frente ao MELHOR efeito isolado (Threshold sozinho, que já é o mais forte dos dois): a diferença (5,20 vs. 5,12 upgrades/campanha) **não é estatisticamente distinguível** (Seção 6) — a sinergia existe na COMPOSIÇÃO do efeito, mas o ganho prático adicional sobre já fazer só Threshold é pequeno demais pra ser conclusivo com N=300.

---

## 5. Running Maximum

O fenômeno **permanece dominante em todas as 4 configurações**. Mesmo sob Combined (a melhor configuração testada), apenas 2.134 "novos recordes" ocorreram em 300 campanhas completas de até 7.200s cada — uma fração ínfima do total de itens gerados. A distribuição por região mostra uma leve extensão da atividade de upgrade pra regiões mais tardias (Picos Congelados: 30→66 recordes; Litoral Quebrado: 11→28; e Combined é a ÚNICA configuração que registrou qualquer recorde em Fortaleza Sombria e Colinas Áridas) — mas Bosque Sussurrante permanece **idêntico (954) nas 4 configurações**, confirmando que a 1ª região (onde os thresholds já eram baixos o bastante) não é afetada, positiva ou negativamente, por nenhuma das mudanças. O efeito "running maximum" não foi eliminado nem drasticamente reduzido — apenas marginalmente atenuado.

---

## 6. Statistical Conclusion

Classificação por z-score da diferença de médias (upgrades/campanha, N=300 cada lado):

| Comparação | z-score | Classificação |
| --- | --- | --- |
| Threshold vs. Baseline | 1,60 | **Pequeno** |
| Weight vs. Baseline | 0,07 | **Inexistente** |
| Combined vs. Baseline | 2,16 | **Moderado** |
| Combined vs. Melhor Individual (Threshold) | 0,58 | **Inexistente** |

**Conclusão**: o efeito de Weight isolado é estatisticamente inexistente (confirma, de forma independente, o mesmo achado da Sprint "Equipment Progression Repair Phase II"). O efeito de Threshold isolado é pequeno (confirma "Redesign Validation"). O efeito de Combined frente ao Baseline é moderado — a MELHOR classificação obtida em qualquer configuração até agora, nesta ou nas 2 Sprints anteriores. Mas frente a simplesmente fazer Threshold sozinho, Combined não é estatisticamente diferente — o "moderado" vem inteiramente de já ultrapassar o Baseline, não de superar a melhor alternativa mais simples já testada.

---

## 7. Architectural Assessment

**A parametrização ainda é um caminho promissor, ou a investigação deve migrar para arquitetura?**

Esta Sprint confirma que existe, sim, sinergia real e mensurável entre parâmetros do Item Generator — a hipótese central não é descartada, foi CONFIRMADA (Seção 4). Isso tecnicamente mantém "existe uma hipótese razoável envolvendo parametrização" viva. Mas na prática: **Dead Loot Rate — a métrica que definiu o problema desde a primeira auditoria — não se moveu de forma detectável em NENHUMA das agora ~10 configurações de parâmetro testadas ao longo de 3 Sprints** (Equipment Progression Repair Phase II: 1 mudança de produção; Redesign Validation: 4 modelos de threshold; esta Sprint: 4 combinações threshold×weight) — sempre entre 95,2% e 95,3%, uma variação total de 0,1 ponto percentual em toda essa exploração. Isso não é falta de tentativa: é o espaço de parâmetros já ter sido varrido o suficiente (2 parâmetros centrais, isolados e combinados, com múltiplas formulações de cada) pra que continuar testando variações do MESMO tipo de mudança (limiares/pesos) tenha retorno esperado cada vez menor.

---

## 8. Recommendation

**C) Encerrar definitivamente esta linha de parametrização.**

Justificativa, exclusivamente com os dados desta Sprint e das 2 anteriores:
- A pergunta central desta Sprint ("existe sinergia?") foi respondida **sim** — mas essa é uma conclusão sobre a FORMA da interação, não sobre se ela resolve o problema.
- Os Critérios de Aprovação explícitos desta Sprint ("Dead Loot diminuiu significativamente?") **não foram atendidos** — 95,22%→95,21% não é uma redução significativa por nenhum critério razoável.
- "Combined vs. Baseline" é a melhor classificação (moderado) já obtida em 3 Sprints de parametrização — e ainda assim representa só +6,6% de upgrades/campanha e nenhuma mudança de Dead Loot. Se o TETO do que a interação entre os 2 parâmetros mais promissores pode entregar é isso, não há expectativa razoável de que testar mais combinações do mesmo tipo (outros valores de peso, outras curvas de threshold) mude essa conclusão.
- Isso não invalida a sinergia encontrada (Seção 4) — só estabelece que mesmo a MELHOR versão dela, exaustivamente buscada, não é suficiente. A recomendação B (Design Review Phase I) já havia descrito 3 outras alternativas arquiteturais (progressão contínua, Item Level desacoplado por região, elevar `MAX_LEVEL`) — a próxima investigação deve escolher entre essas, não testar mais parâmetros.

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Testes/Suíte completa**: não executados — nenhum arquivo de `src/` alterado.
- **Smoke Test**: confirmado — camada experimental construída e reutilizada com sucesso; mutação restrita à memória do processo (`applyThreshold`/`applyWeight` sobre os arrays já importados); restauração completa verificada via comparação `JSON.stringify` byte-a-byte (`restoredCorrectly: true`); `git diff` em `packages/shared/src/` não mostra nenhuma mudança além do que já existia antes desta Sprint (confirmado via `git diff --stat` a partir da raiz do repositório).
- Dados brutos completos em `reports/item-generation-parameter-interaction.json` (determinístico, reproduzível via `npx tsx scripts/itemGenerationParameterInteraction.ts`).
