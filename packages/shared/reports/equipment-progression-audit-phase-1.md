# Equipment Progression Audit — Player Power Curve (Phase I)

Sprint exclusivamente de diagnóstico. Nenhum código de gameplay foi alterado — apenas um novo script de auditoria (`scripts/runEquipmentProgressionAudit.ts`) foi criado, reaproveitando as mesmas primitivas que o Simulador já usa por baixo (`createAdventureSession`/`advanceDungeonTick`/`equipStarterKit`/`calculateFinalStats`), sem tocar em `packages/shared/src/simulation/` (protegido nesta Sprint, ao contrário de todas as anteriores). Combat Engine, Loot Generator, Item Generator, World Generation e RuntimeConfig também não foram tocados.

**Pergunta central**: *o jogador está ficando forte na velocidade que o mundo espera?* Resposta curta: **não, a partir de ~15-20 minutos de jogo (2ª região em diante) o equipamento praticamente para de evoluir, mesmo com o mundo continuando a escalar** — e a Seção 9 (Final Decision) justifica por quê isso, e não o combate isoladamente, é o gargalo dominante.

---

## 1. Metodologia

- **Campanha única, N=300**, jornada natural (mesma convenção de todas as auditorias anteriores: cada seed corre até 7200s simulados ou até a morte do personagem, `bosque-sussurrante` → progressão natural de região, classe `warrior`, kit inicial via `equipStarterKit`).
- Em vez de chamar `runSimulatedAdventure()` (protegido, e que nunca expôs a Timeline bruta — só contadores agregados), o script replica a MESMA sequência de setup do Simulador chamando diretamente `createAdventureSession()`/`advanceDungeonTick()` — as mesmas primitivas de baixo nível que todo smoke test deste projeto já usa. Nenhuma linha de `simulation/` foi lida para além da consulta de referência já registrada na Sprint anterior.
- A cada tick: eventos `LootDropped`/`ItemEquipped` são capturados integralmente (região, nível, raridade, Power Score, slot, `previousPowerScore` — já existente no evento, sem instrumentação nova) e `calculateFinalStats()` (função pura, somente leitura) é amostrada para obter Power Score/Vida Máxima/Armadura/DPS-proxy a cada tick.
- **DPS-proxy** = `(physicalDamage + spellDamage) × attackSpeed` — proxy simples, não é o Combat Engine real, só para comparação relativa entre pontos da jornada.
- Após a primeira execução (Fases 1-3/5-8), a especificação da própria Sprint (Fase 4: "Power Score/DPS/Defesa/Vida") revelou uma lacuna — o script só agregava Power Score por nível. Isso foi fechado com uma segunda passada (mesmos 300 seeds, determinístico): adicionado `averageMaximumLife`/`averageArmor`/`averageEstimatedDps` por nível, e um novo agrupamento por **entrada de região** (Fase 4b) — sem alterar a metodologia da Fase 1-3/5-8, só completando a Fase 4.
- **Root Cause Correlation (adendo)**: para o "lado do Mundo", foi usada a MESMA fórmula de densidade já validada e usada nas 2 auditorias de calibração anteriores — `Densidade = (soma de stats base + growth × (nível de entrada − 1)) ÷ nível de entrada` — aplicada aos Enemy Templates reais (`src/enemy/templates.ts`, somente leitura) no nível médio de entrada de cada região **medido empiricamente por esta própria auditoria** (Fase 4b), não um valor assumido. Os valores recalculados bateram exatamente com os já publicados no relatório de calibração anterior para `frost-king` (5.15), `corrupted-bishop` (5.32), `ancient-dragon` (6.19), `dark-knight` (6.2) e `boss` (9.73) — confirma que a fórmula e os níveis de entrada assumidos por aquela Sprint continuam válidos hoje.

---

## 2. Timeline Completa (Fase 1)

Três jornadas de exemplo (de 300), ilustrando o padrão que se repete na maioria das execuções:

| Seed | Destino | Upgrades registrados |
| --- | --- | --- |
| 1 | morre em Litoral Quebrado | 7 upgrades, TODOS em `bosque-sussurrante`/`pantano-podre` (primeiros ~1078s = 18 min) — nenhum upgrade daí até a morte |
| 99992 | morre em Picos Congelados | 5 upgrades, TODOS em `bosque-sussurrante`/`pantano-podre` (primeiros 748s = 12,5 min) |
| 199983 | morre em Picos Congelados | 2 upgrades (um deles +527%, arco raro cedo), ambos em `bosque-sussurrante`/`pantano-podre` (até 990s = 16,5 min) |

Padrão confirmado pela amostra completa (Seção 4): em nenhuma das 3 jornadas de exemplo há um único upgrade de equipamento depois da 2ª região — e isso não é coincidência de amostra pequena, é a média de toda a população (ver Fase 5/6 abaixo).

---

## 3. Curva de Poder

### 3a. Player Power por nível (Fase 4 — corrigida)

| Nível | Power Score | Vida Máxima | Armadura | DPS-proxy |
| --- | --- | --- | --- | --- |
| 1 | 330 | 148 | 69,5 | 112 |
| 5 | 474 | 231 | 80,5 | 254 |
| 15 | 714 | 393 | 108 | 438 |
| 20 | 825 | 471 | 122 | 517 |
| 24 | 931 | 538 | 133 | 600 |
| 28 | 1023 | 600 | 144 | 627 |
| 30 | 1070 | 632 | 149 | 748 |

Vida (4,3x) e DPS-proxy (6,7x) crescem de forma saudável do nível 1 ao 30. **Armadura cresce só 2,15x no mesmo intervalo** — o suspeito óbvio: os dois slots de armadura mais pesados (Elmo/Peitoral) nunca recebem um único upgrade em toda a campanha (ver Fase 3), então o crescimento de Armadura vem quase inteiramente do build/nível, não do equipamento.

### 3b. Player Power vs. World Power por região (adendo — Root Cause Correlation)

| Região | Nível médio de entrada | Power Score do jogador | Densidade do Mini-Boss/Chefe da região | Densidade do inimigo comum |
| --- | --- | --- | --- | --- |
| Bosque Sussurrante | 1 | 324 | 21,0 (Lobo Alfa) | 9,7 |
| Pântano Podre | 5 | 467 | 6,68 (Bruxa do Charco) | 3,04 |
| Colinas Áridas / Minas Abandonadas / Ruínas Esquecidas | 15 | ~715 | 8,4 / 7,5 / 4,4 | 5,5 / 5,4 / 2,4 |
| Picos Congelados | 20 | 826 | 5,15 (Rei Gélido) | 3,66 |
| Litoral Quebrado | 24 | 930 | 5,32 (Bispo Corrompido) | 2,98 |
| Deserto de Vidro | 28 | 1023 | 6,19 (Dragão Ancião) | 3,29 |
| Fortaleza Sombria | 30 | 1070 | **9,73** (Chefe Final) | 6,20 (Cavaleiro Negro) |

**Taxa de crescimento por transição** (região N ÷ região N−1):

| Transição | Player Power Score | Densidade do Chefe/Mini-Boss da região |
| --- | --- | --- |
| Bosque → Pântano | 1,44x | 0,32x (mundo "recua" — nível baixo infla densidade por design da fórmula) |
| Pântano → Ruínas/Colinas/Minas | 1,53x | 0,66x |
| Ruínas → Picos Congelados | 1,16x | 1,18x (mundo levemente à frente) |
| Picos → Litoral Quebrado | 1,13x | 1,03x (equilibrado) |
| Litoral → Deserto de Vidro | 1,10x | 1,16x (mundo à frente) |
| **Deserto → Fortaleza Sombria** | **1,05x** | **1,57x** |

**Existe um ponto onde a curva do mundo ultrapassa a do jogador de forma abrupta?** Sim — **exatamente na transição Deserto de Vidro → Fortaleza Sombria**: a densidade do Chefe Final salta 57% em relação ao Chefe anterior, enquanto o Power Score do jogador no mesmo intervalo cresce só 4,6% — o maior descompasso do jogo, por uma margem grande. Nas demais transições (Picos/Litoral/Deserto) o descompasso é pequeno (±5-15 pontos percentuais) — nada que explique, sozinho, uma mortalidade regional tão alta quanto a observada em Picos Congelados (ver Seção 5/6).

---

## 4. Estatísticas

### Fase 2 — Frequência de Upgrade

| Métrica | Valor |
| --- | --- |
| Upgrades totais (300 jornadas) | 1.361 |
| Média de upgrades por jornada | 4,54 |
| Gap médio entre upgrades | 672s (11,2 min) |
| Gap mediano | 198s (3,3 min) |
| Gap p75 / p90 / p99 | 484s / 2.640s / 3.608s |
| Maior gap único observado | 4.554s (75,9 min) |
| Maior gap médio POR jornada | 2.410s (40,2 min) |
| Maior gap mediano por jornada | 2.596s (43,3 min) |

O gap mediano (3,3 min) parece saudável isoladamente — mas o "maior gap por jornada" médio é de 40 minutos: **toda jornada individual tem, em algum ponto, um deserto de ~40 minutos sem nenhum upgrade**, geralmente a partir da 2ª/3ª região (ver Fase 1/5/6).

### Fase 3 — Progressão por Slot (1.361 upgrades, 300 jornadas)

| Slot | Upgrades totais | Média por jornada | % do total |
| --- | --- | --- | --- |
| Arma | 645 | 2,15 | 47,4% |
| Botas | 273 | 0,91 | 20,1% |
| Anel 1 | 181 | 0,60 | 13,3% |
| Cinto | 170 | 0,57 | 12,5% |
| Luvas | 49 | 0,16 | 3,6% |
| Anel 2 | 37 | 0,12 | 2,7% |
| Amuleto | 6 | 0,02 | 0,4% |
| **Elmo** | **0** | **0** | **0%** |
| **Peitoral** | **0** | **0** | **0%** |

**Achado mais forte de toda a auditoria**: em 300 campanhas completas (algumas de até 2 horas simuladas), **nenhum Elmo e nenhum Peitoral foi upgradado nem uma única vez**. Não é um problema de drop — ambos aparecem nas Loot Tables de praticamente todas as regiões, com pesos comparáveis a Luvas/Botas. É um problema de **limiar de Power Score**: `calculatePowerScore()` soma `baseDefense` de forma FIXA (não escala com Item Level) — Botas/Luvas partem de 8, Elmo de 12, Peitoral de 24. O kit inicial já equipa a versão "common" desses 4 itens no nível 1. Qualquer drop de Botas/Luvas só precisa somar >0 em afixos para virar upgrade — mas um Peitoral precisa de afixos somando mais de 24 pontos, e isso aparentemente nunca aconteceu em 1.361 eventos observados.

### Fase 5/6 — Qualidade e Uso do Loot por Região

| Região | Drops | Power Score médio do drop | Taxa de uso (equipado no mesmo tick) |
| --- | --- | --- | --- |
| Bosque Sussurrante | 5.758 | 12,1 | **17,3%** |
| Pântano Podre | 16.838 | 15,1 | **2,9%** |
| Minas Abandonadas | 98 | 19,8 | 0% |
| Ruínas Esquecidas | 6.064 | 20,6 | 0% |
| Picos Congelados | 3.314 | 26,1 | 0% |
| Litoral Quebrado | 686 | 25,9 | 0% |
| Colinas Áridas | 216 | 14,3 | 0% |
| Deserto de Vidro | 216 | 21,0 | 0% |
| Fortaleza Sombria | 19 | 30,4 | 0% |

**Dead Loot Rate agregado: 95,5%** (33.209 drops, 1.479 usados) — pior que a auditoria original (~90%). A partir da 3ª região, a taxa de uso é **literalmente 0% em toda a amostra** — nenhum item encontrado em Minas Abandonadas, Ruínas Esquecidas, Picos Congelados, Litoral Quebrado, Colinas Áridas, Deserto de Vidro ou Fortaleza Sombria jamais superou o equipamento já em posse do jogador, em nenhuma das 300 jornadas.

### Fase 7 — Platôs de Poder (≥300s sem crescimento)

Apenas **6 platôs detectados** em 300 jornadas (duração média 319s), todos em `bosque-sussurrante`/`pantano-podre`/`colinas-aridas` — ou seja, a métrica NÃO capturou o "deserto de loot" da Fase 5/6. Motivo: `calculateFinalStats()` (a fonte da amostra) inclui crescimento de nível/build, que sobe a CADA level up mesmo sem nenhum upgrade de equipamento — isso "reseta" o platô artificialmente. A estagnação de EQUIPAMENTO é real (Fase 3/5/6 provam isso direto), mas esta métrica específica mede estagnação de PODER TOTAL, e o crescimento de nível mascara a estagnação de gear. **Achado sobre a métrica em si**, não uma contradição dos outros achados.

### Fase 8 — Correlação no Funil de Picos Congelados

| Coorte | N | Power Score médio na entrada | Upgrades antes da entrada | Slots vazios na entrada |
| --- | --- | --- | --- | --- |
| Morreu em Picos Congelados | 195 | 822,7 | 4,61 | 2,85 |
| Sobreviveu à entrada | 47 | 840,7 | 5,09 | 2,74 |

Diferença entre coortes: **+2,2% de Power Score, +10% de upgrades, -0,11 slots vazios** para quem sobrevive — uma diferença pequena demais para explicar por que 80,6% de quem chega morre ali. Ver Seção 6 (Hipótese Descartada).

---

## 5. Gargalos (ordenados por impacto — sem propor solução ainda)

1. **Elmo/Peitoral congelados desde o minuto 1** (Fase 3) — afeta 100% das jornadas, 100% do tempo de jogo, 2 dos 9 slots do jogo inteiro nunca evoluem.
2. **Loot morto a partir da 3ª região (0% de uso)** (Fase 5/6) — afeta ~85-90% do tempo de jogo de qualquer jornada que passe da 2ª região (a maioria).
3. **Mortalidade de Picos Congelados (80,6% de quem chega) não correlacionada com equipamento** (Fase 8) — afeta a região que mais jogadores alcançam entre as 4 finais (80,7% de chegada), mas não é resolvida por progressão de equipamento.
4. **Descompasso abrupto Mundo vs. Jogador em Fortaleza Sombria** (Seção 3b) — afeta apenas ~3% das jornadas (as que chegam), mas é o único ponto onde a matemática do mundo realmente "ultrapassa" o jogador.
5. **Métrica de platô mascarada pelo crescimento de nível** (Fase 7) — não é um gargalo de jogo, é uma lacuna de observabilidade que sub-relata o problema #2.

---

## 6. Hipóteses

### Confirmadas (Alta confiança)
- **"Elmo/Peitoral nunca evoluem" é real e universal** — 0/1.361 eventos em 300 jornadas completas. Causa provável identificada: `baseDefense` fixo na fórmula de Power Score (8/8/12/24 para Botas/Luvas/Elmo/Peitoral) cria um piso que os afixos desses 2 slots parecem nunca superar. **Confiança: Alta** na correlação (os números batem perfeitamente: quanto maior o `baseDefense`, menos upgrades); **Média** na causa exata (não foi auditada a tabela de valores de afixo em si — item protegido/fora do escopo desta Sprint).
- **Loot desert piora com a profundidade da região, não é uniforme** — 17,3% de uso na região inicial, 2,9% na segunda, 0% em todas as 7 regiões seguintes. **Confiança: Alta** (medido diretamente).
- **Fortaleza Sombria é o único ponto de descompasso abrupto Mundo vs. Jogador** (57% vs. 4,6% de crescimento na transição). **Confiança: Alta** (calculado a partir de dados desta própria auditoria + Enemy Templates estáticos, valores batem com o relatório de calibração anterior).

### Descartada (Alta confiança)
- ~~"Picos Congelados mata por falta de equipamento"~~ — **descartada**. As coortes que morrem vs. sobrevivem à entrada têm Power Score/upgrades/slots vazios quase idênticos (diferença de 2-10%). Se equipamento fosse a causa dominante, a diferença entre coortes seria grande, não marginal. **Confiança: Alta** (N=195 vs. 47, sinal limpo).

### Inconclusivas (Média/Baixa confiança)
- **Picos Congelados provavelmente mata por frequência/exposição a combate, não por gear** — hipótese alternativa mais provável (dado que não é gear), sustentada pelo relatório de calibração anterior (39% dos encontros da região viravam luta contra o inimigo mais forte, ante 5% em regiões saudáveis), mas não remedida nesta Sprint (Combat Engine/Encounter Tables protegidos aqui). **Confiança: Média** — plausível e consistente com dados históricos, mas não re-verificada agora.
- **A causa exata do piso de Power Score em Elmo/Peitoral** (tabela de afixos vs. fórmula de Power Score) seria necessária para uma correção precisa. **Confiança: Baixa/Média** sobre qual dos dois é a causa raiz específica — só a correlação está bem estabelecida.

---

## 7. Plano de Correção (não implementado — menor conjunto possível de alterações)

| # | Alteração proposta | Impacto esperado | Risco | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | Escalar `baseDefense` por Item Level em `calculatePowerScore()` (ex.: `baseDefense × (1 + k×(itemLevel−1))`) **ou** aumentar os tetos de valor dos afixos de defesa nas tiers de Item Level mais altas | Alto — deve destravar Elmo/Peitoral, que hoje nunca evoluem | Baixo — mudança isolada em uma função pura, sem tocar Combat Engine | Ataca a causa correlacionada com maior confiança (Fase 3): o piso fixo de 12/24 é o único fator que distingue Elmo/Peitoral (0 upgrades) de Botas/Luvas (273/49 upgrades), que compartilham o mesmo pool de tags "armor"/"defense" |
| 2 | Adicionar amostragem de "Power Score só-de-equipamento" (excluindo contribuição de nível/build) na Fase 7 do próprio script de auditoria | Nenhum impacto em gameplay — só observabilidade | Nenhum — script de diagnóstico, não gameplay | Corrige a lacuna identificada na Fase 7 (métrica atual mascarada pelo crescimento de nível), necessária para medir o efeito real do item #1 acima numa futura auditoria "depois" |
| 3 | (Próxima Sprint, fora deste escopo) Nova rodada de calibração de `variantChances.elite/miniBoss` especificamente em Picos Congelados | Alto para mortalidade regional — mas não resolve loot desert | Médio — mexe em Combat/Encounter Tables, exige nova simulação completa | Ataca a causa mais provável da mortalidade de Picos Congelados (Fase 8 descartou equipamento; histórico aponta frequência de encontro), mas é uma frente separada do escopo desta Sprint |

Nenhuma destas alterações foi aplicada — são candidatas para a próxima Sprint de implementação, com o menor raio de alteração possível para cada problema identificado.

---

## 8. Commercial Impact

Se um publisher jogar 15-20 minutos (janela típica de avaliação): a experiência ainda parece boa — Bosque Sussurrante/Pântano Podre têm 17,3%/2,9% de uso de loot, upgrades chegam a cada poucos minutos, e a curva de Power Score/Vida/DPS cresce de forma visível e satisfatória (Seção 3a). **O problema não aparece na demo de 15 minutos — aparece depois dela.**

A partir de ~20-25 minutos (3ª região em diante), a progressão de equipamento morre silenciosamente: nenhum item novo importa, 2 dos 9 slots do personagem (visíveis na tela de Personagem/Inventário) ficam com o MESMO ícone/raridade "comum" da primeira sessão de jogo, para sempre. Um jogador que joga além da primeira demonstração vai perceber — mesmo sem saber articular por quê — que "parar de encontrar coisas boas" acontece muito cedo, e que abrir o Elmo/Peitoral no inventário nunca muda. Isso é o tipo de sensação que reviews de Early Access costumam citar como "a progressão trava depois da primeira hora" — precisamente o tipo de crítica que reduz a intenção de compra em análises de pré-lançamento.

Corrigir o item #1 do Plano de Correção (Seção 7) é uma alteração pontual e de baixo risco com potencial de resolver o problema mais universal e mais visível (afeta literalmente 100% das jornadas) identificado por qualquer auditoria deste projeto até agora.

---

## 9. Final Decision

**A) O principal gargalo do jogo atualmente é a progressão de equipamentos.**

Justificativa, exclusivamente com os dados desta auditoria:
- É o ÚNICO gargalo que afeta **100% das 300 jornadas simuladas**, começando de forma consistente entre 12 e 20 minutos de jogo (Fase 1/Seção 2) e persistindo pelo resto de qualquer jornada que ultrapasse a 2ª região — ou seja, pela maior parte do tempo de jogo de qualquer sessão longa.
- A Dead Loot Rate de 95,5% (Fase 6) e o 0% de uso de loot em 7 das 9 regiões do jogo (Fase 5) não têm equivalente em severidade/universalidade em nenhum outro sistema medido nesta auditoria.
- A hipótese concorrente mais forte — "é o combate/Picos Congelados" — foi diretamente testada (Fase 8) e **descartada como causa de equipamento**: as coortes que morrem vs. sobrevivem em Picos Congelados têm perfis de equipamento quase idênticos, o que indica que mesmo uma correção completa de equipamento não resolveria aquela mortalidade específica. Isso reforça, por eliminação, que o problema de equipamento é uma causa **separada e adicional**, não uma consequência do problema de combate.
- O único ponto onde o Mundo genuinamente "ultrapassa" o jogador em termos matemáticos (Seção 3b, Fortaleza Sombria, +57% vs. +4,6%) afeta menos de 3% das jornadas — não é candidato a gargalo "atual" para a experiência da maioria dos jogadores.
- Loot (opção C) foi descartada como resposta isolada porque o loot **está** sendo gerado normalmente (33.209 drops, distribuição de raridade razoável por região — Fase 5) — o problema não é a geração de loot, é a conversão de loot em progressão real de poder, o que aponta especificamente para a fórmula/lógica de comparação de equipamento (Power Score), não para as Loot Tables.

---

## 10. Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`), incluindo após a extensão da Fase 4/4b.
- **Testes**: nenhum arquivo de `src/` foi alterado — só um script novo em `scripts/`. Testes direcionados/suíte completa não executados nesta Sprint (nenhum código de produção mudou; instrução explícita da Sprint era evitar retrabalho desnecessário).
- **Smoke test**: não aplicável — Sprint sem seção de Smoke Test no briefing, e nenhuma mudança de comportamento em runtime foi feita.
- Dados brutos completos em `reports/equipment-progression-audit.json` (N=300, determinístico, reproduzível via `npx tsx scripts/runEquipmentProgressionAudit.ts`).
