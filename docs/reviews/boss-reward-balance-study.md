# Boss Reward Balance Study

**Status: 🟠 Estudo de simulação — nenhuma produção alterada.** Nenhum
arquivo real foi tocado (`BossRewardSystem`, schema e Combat Model
permanecem exatamente como estavam). Reaproveita integralmente os dados
já medidos em `docs/reviews/boss-gameplay-validation.md` — nenhum cenário
novo foi gerado.

---

## 1. Dados reaproveitados (harness anterior, sem alteração)

| Personagem | Level | Equipamento | Dano/tick | ticksPresent |
|---|---|---|---|---|
| Fraco | 3 | nenhum | 1 | 1 |
| Médio | 15 | espada comum | 75 | 1 |
| Forte | 25 | espada lendária | 1250 | 1 |

Boss derrotado no mesmo tick em que os três participaram (dano total
1326 num Boss de 500 HP). `ticksPresent` idêntico para os três — o Boss
gameplay validation não variou tempo de presença, só dano — por isso
"Participação" é constante em todos os modelos abaixo, nunca uma
variável de saída.

---

## 2. Modelos simulados

Fórmula de simulação (não implementada em código, só calculada aqui):

```
share_i = pesoPresença × (ticksPresent_i / ΣticksPresent) + pesoDano × (dano_i / Σdano)
XP_i = piso(200 × share_i)          [200 = XP_BUDGET_PER_BOSS, já existente]
```

| Personagem | A (100/0, atual) | B (90/10) | C (80/20) | D (70/30) | E (50/50) |
|---|---|---|---|---|---|
| Fraco | 66 | 60 | 53 | 46 | 33 |
| Médio | 66 | 61 | 55 | 50 | 38 |
| Forte | 66 | 78 | 91 | 103 | 127 |
| **Razão forte/fraco** | **1,00×** | **1,30×** | **1,72×** | **2,24×** | **3,85×** |

**Gold:** não simulado — Boss não concede Gold em nenhum modelo (decisão
já fechada no capítulo 6 da Bible, "Gold fica fora do MVP"). Não é uma
lacuna deste estudo, é a mesma regra em todos os cinco modelos.

**Drop (item):** não diferenciado entre modelos, e isso é um achado
honesto do próprio dado reaproveitado, não uma simplificação — com
exatamente 3 vagas de item (`ITEM_SLOTS_PER_BOSS`) e exatamente 3
participantes, todos ganham uma vaga em qualquer modelo (a regra já
existente é "sem reposição, preenche até o menor entre vagas e
participantes"). O peso presença/dano só mudaria **quem** ganha item se
houvesse mais participantes que vagas — este estudo não pode responder
isso sem gerar um cenário novo, o que foi explicitamente proibido.

**Participação (ticksPresent):** idêntica nos cinco modelos — é uma
entrada da fórmula, não uma saída que varia por modelo.

---

## 3. Proporcionalidade da simulação

A razão forte/fraco cresce de 1,00× (Modelo A) até 3,85× (Modelo E) — mas
mesmo no modelo mais extremo testado, a diferença de recompensa (3,85×)
continua ordens de magnitude menor que a diferença de dano real entre os
dois personagens (1250×). Isto é esperado, não um erro: mesmo com 50% do
peso em dano, a metade do peso continua em presença (idêntica para os
três), o que estrutura um piso alto para todos.

---

## 4. Incentivos

**O jogador continua querendo participar mesmo sendo fraco?** Em todos os
cinco modelos, sim — a recompensa do fraco nunca é punitiva (nunca menos
que 33 de 66 possíveis, nunca zero), só proporcionalmente menor conforme
o peso de dano cresce. Não há modelo, dos cinco testados, que desincentive
a simples presença.

**O jogador forte ganha vantagem exagerada?** Não, em nenhum dos cinco —
mesmo no modelo mais extremo (E), o forte recebe 3,85× o fraco, uma fração
pequena da diferença real de contribuição (1250×). Nenhum modelo
aproxima recompensa de proporcionalidade a dano.

**Existe incentivo para montar equipamento melhor?** Só a partir do
Modelo B. O Modelo A (atual) tem incentivo **zero**, medido, não
hipotético: o próprio harness anterior mostrou fraco/médio/forte
recebendo exatamente 66 XP cada, independente do equipamento.

**Existe incentivo para carregar contas secundárias (alts)?** Sim, e mais
forte exatamente nos modelos mais presença-pesados (A, B). Como a parcela
de presença é dividida por participante (`1/N`), qualquer conta adicional
presente — mesmo sem dano relevante — reivindica uma fração cheia dessa
parcela; um jogador controlando várias contas de baixo esforço coleta
várias frações independentes. Modelos mais dano-pesados (D, E) reduzem
esse incentivo naturalmente, porque a parcela de dano de uma conta com
dano desprezível tende a zero — farmar com alts de baixo esforço rende
cada vez menos conforme o peso de dano cresce.

**Algum modelo incentiva comportamento tóxico?** Nenhum incentiva
diretamente exclusão ou disputa pela "última hit" — Boss é dano coletivo,
sem essa competição. O único efeito colateral encontrado: no Modelo A,
qualquer participante adicional (mesmo um espectador AFK) dilui igualmente
a parcela de todos os outros, o que pode gerar frustração silenciosa
("por que aquele parado recebeu o mesmo que eu"). Esse efeito diminui nos
modelos mais dano-pesados, porque um participante de dano desprezível
dilui cada vez menos a parcela de dano dos outros (a parcela de dano dele
próprio já é ~0, então tira ~0 dos demais).

---

## 5. Economia

**Qual modelo cria mais demanda por equipamentos?** E (50/50) — maior
diferenciação de recompensa por gear, sinal mais forte de "vale a pena
melhorar equipamento".

**Qual aumenta o valor do Marketplace?** Também E, pela mesma lógica —
mas com uma ressalva: um sinal de recompensa forte demais também pode
incentivar jogadores já fortes a **guardar** itens raros (composição
crescente de vantagem) em vez de negociá-los, o oposto da filosofia já
registrada no capítulo 11 ("o mercado tem que estar fluindo"). Isso não é
resolvido por este estudo — é uma tensão a observar, não uma conclusão.

**Qual mantém novos jogadores motivados?** O oposto — A e B, os modelos
que preservam quase toda a recompensa para quem só está presente,
independente de gear. Um jogador novo em C, D ou E já sente uma queda
perceptível (53, 46, 33 contra os 66 de um veterano na mesma luta).

**Tensão central deste estudo:** o modelo que melhor serve a economia
(E) é o que menos protege jogadores novos; o modelo que melhor protege
jogadores novos (A) é o que a própria auditoria anterior já provou não
gerar nenhuma demanda por equipamento. Nenhum dos cinco modelos resolve
as duas coisas ao mesmo tempo — essa é a informação mais importante que
este estudo produz, não uma indecisão.

---

## 6. Gráficos

Gráfico de barras (XP por personagem × modelo) mostrado na conversa —
resumo em tabela (seção 2). A trinca formada por Fraco/Médio/Forte
mostra visualmente a mesma curva descrita acima: as três barras partem
niveladas em A e se abrem progressivamente até E, com a barra do Forte
crescendo e as outras duas encolhendo lentamente, nunca colapsando.

---

## 7. Respostas finais

**Qual modelo é recomendado?** **C (80% presença / 20% dano).** É o
primeiro ponto da escala onde o incentivo de equipamento deixa de ser
zero (91 vs. 53, ~1,7×) sem que a queda para o jogador novo seja drástica
(53 ainda é 80% do que ele receberia hoje).

**Qual modelo deve ser descartado?** **A (modelo atual).** Não porque
seja ruim para retenção — é o melhor da lista nesse quesito — mas porque
é o único, dos cinco, com incentivo de equipamento **comprovadamente
zero**, medido, não hipotético. Isso contradiz diretamente o objetivo
econômico já registrado para Marketplace/Economia 1.0.

**Qual modelo maximiza cooperação?** **A.** Por definição — reparte
igualmente entre todos que apareceram, sem exceção, sem gradiente. É o
modelo mais inclusivo desta lista, ao custo de ser economicamente inerte.

**Qual modelo fortalece a economia?** **E.** Maior diferenciação por
gear, sinal mais forte para Marketplace — com a ressalva já registrada
sobre risco de hoarding em vez de fluxo.

**Qual modelo deve entrar no MVP?** **C**, pela mesma razão da
recomendação — é o ponto da escala que introduz o incentivo econômico
que falta hoje sem abandonar a proteção a jogadores novos que os dados
mostram ser real e mensurável.
