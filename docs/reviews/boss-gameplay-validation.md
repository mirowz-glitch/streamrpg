# Boss Gameplay Validation

**Status: ✅ Validado, com um achado importante para a próxima fase.**
Nenhum arquivo de produção foi alterado nesta Sprint — só harness e
medição. O Combat Model produz diferenças reais de gameplay no **dano**,
mas a **recompensa individual** continua inteiramente desacoplada do
dano, por decisão já fechada em outra Sprint (capítulo 6 da Bible).

---

## 1. Harness comparativo

Mesmo Boss (tier 1, 500 HP), mesmo `RandomProvider` (fixo, nunca rola
crítico — isola level/equipamento/resistência como única variável),
mesmo instante — só o personagem muda entre execuções. Validado com
cross-check: o Cenário C rodado pela função pura (`calculateCanonicalDamage`)
e o mesmo cenário rodado de verdade através do `EventBus` produziram
exatamente `180` nos dois casos.

---

## 2. Cenários A-D

| Cenário | Level | Equipamento | ATQ | Tipo | Dano/tick | Ticks p/ derrotar Boss sozinho |
|---|---|---|---|---|---|---|
| A — sem equipamento | 10 | nenhum | 0 | físico (irrelevante) | **1** | 500 |
| B — arma comum física | 10 | espada comum | 5 | físico | **50** | 10 |
| C — arma rara física | 10 | lâmina rara | 18 | físico | **180** | 3 |
| D — arma mágica (comum) | 10 | cajado comum | 5 | mágico | **50** | 10 |

## Cenário E — level muda, mesma arma rara física (ATQ 18)

| Level | Dano/tick |
|---|---|
| 10 | 180 |
| 20 | 360 |

## Cenário F — mesmo personagem (level 10, ATQ físico 18), resistência do alvo muda

| Resistência física do alvo | Dano |
|---|---|
| 0% | 180 |
| 30% | 126 |
| 50% | 90 |
| 90% | 18 |

Resistência **mágica** de 90% no alvo contra o mesmo ataque **físico**:
dano continua `180` — nenhuma redução, confirmando que resistência do
tipo errado não interfere.

---

## 3. Proporcionalidade

| Pergunta | Resposta | Evidência |
|---|---|---|
| Equipamento melhor sempre gera dano maior? | **Sim** | B→C: ATQ 5→18 (3,6×), dano 50→180 (3,6×) — proporção exata preservada |
| Level maior sempre aumenta contribuição? | **Sim** | E: level 10→20 (2×), dano 180→360 (2×) — proporção exata |
| Resistência interfere apenas quando deveria? | **Sim** | F: 0/30/50/90% de resistência física reduzem exatamente 0/30/50/90% do dano físico |
| Ataques físicos ignoram resistência mágica? | **Sim** | F: resistência mágica 90% não muda o dano de um ataque físico (180 = 180) |
| Ataques mágicos ignoram resistência física? | **Sim** | Verificação adicional: ataque mágico (dano base 180) contra 90% de resistência física do alvo continua em 180 |

**Nenhuma violação de proporcionalidade encontrada.**

---

## 4. Economia — equipamento realmente importa?

Comparando o mesmo personagem (level 10) nos quatro cenários A-D:

- **Sem arma → arma comum:** 1 → 50 de dano/tick — **50×**.
- **Arma comum → arma rara:** 50 → 180 — **3,6×**.
- **Sozinho, ticks para derrotar o Boss:** 500 (sem arma) → 10 (comum) → 3 (rara).

**Resposta direta:** sim, um jogador equipado contribui muitíssimo mais
para o **combate** (dano, velocidade de derrota) do que um mal equipado —
a diferença não é pequena demais. Medindo com honestidade: o salto de
"nenhuma arma" para "qualquer arma" (50×) é desproporcionalmente maior do
que o salto entre raridades de arma (3,6×) — o primeiro degrau é o mais
extremo da escala inteira. Isso não é ajustado nesta Sprint (não era o
pedido), só medido e registrado como ponto de atenção para um futuro
balanceamento.

**Achado mais importante desta Sprint, não previsto no roteiro original:**
equipamento e level importam **muito** para o dano, mas hoje **não
importam nada** para a recompensa individual. `BossRewardSystem` (Sprint
B4, não tocado por nenhuma das Sprints seguintes) distribui XP e a
loteria de item proporcionalmente a `ticksPresent` — presença medida em
ticks — nunca a dano causado. Confirmado empiricamente na Etapa 5 abaixo:
três personagens com dano de 1, 75 e 1250 por tick, presentes o mesmo
número de ticks, receberam **exatamente o mesmo XP**. Isto não é um bug
desta Sprint nem das anteriores — é uma decisão já fechada no capítulo 6
da Bible ("Métrica: presença + dano como bônus... presença é a base") —
mas o "dano como bônus" da métrica de participação nunca foi implementado
em código (`BossParticipationRepository` só grava `ticksPresent`, sem
nenhum campo de dano acumulado, confirmado desde o Technical Design da
Sprint B2). Ou seja: o Combat Model agora afeta o **resultado coletivo**
do combate (o grupo derrota o Boss mais rápido com equipamento melhor),
mas ainda não afeta a **recompensa individual** de quem contribuiu mais.

---

## 5. Perfil fraco × médio × forte

| Perfil | Level | Equipamento | Dano/tick | Participação (ticksPresent) | XP recebido | Item |
|---|---|---|---|---|---|---|
| Fraco | 3 | nenhum | 1 | 1 | **66** | recebeu (comum) |
| Médio | 15 | espada comum | 75 | 1 | **66** | recebeu (uncommon) |
| Forte | 25 | espada lendária | 1250 | 1 | **66** | não elegível (raridade sorteada exigia nível maior) |

Boss (500 HP) derrotado no mesmo tick em que os três participaram (dano
total 1326 num só tick, com os três presentes).

**Algum perfil domina completamente?** Em dano, sim — o perfil forte
causa 1250× mais dano que o fraco. Em recompensa individual, não — os
três receberam exatamente o mesmo XP, porque a fórmula de recompensa
nunca leu o dano. O "domínio" do personagem forte se manifesta inteiramente
no resultado coletivo (o Boss cai muito mais rápido com ele no grupo),
não numa vantagem pessoal de recompensa sobre os outros dois.

---

## 6. Performance (50 participantes, 10 ticks)

- Tempo por tick: consistentemente **~100-110ms**, sem tendência de
  crescimento ao longo dos 10 ticks (100.3ms no primeiro, 110.7ms no
  último — variação dentro do ruído esperado, não uma curva ascendente).
- Heap: 12,55MB antes → 8,68MB depois (**caiu**, não subiu) — nenhum
  sinal de vazamento de memória nas 10 iterações medidas.
- Boss processado corretamente em todos os ticks: HP caiu de forma
  consistente com o dano total esperado por tick (7276 × 10 = 72.760;
  999.999 − 927.239 = 72.760 — bate exatamente), confirmando que os 50
  personagens foram processados em todos os 10 ticks, sem nenhum sendo
  pulado silenciosamente.

---

## 7. Respostas diretas

**O Combat Model produz diferenças perceptíveis de gameplay?** Sim,
grandes — de 1 a 1250 de dano por tick, dependendo só de level e
equipamento, mantendo proporcionalidade exata em todos os casos testados.

**Equipamentos agora realmente importam?** Sim, para o resultado do
combate (dano, velocidade de derrota). Ainda não importam para a
recompensa individual — ver seção 4.

**Level agora realmente importa?** Sim, de forma estritamente linear e
proporcional (confirmado no Cenário E), pelo mesmo motivo: afeta o dano,
não a recompensa individual.

**O Boss deixou de ser um sistema "igual para todos"?** Em dano e
velocidade de derrota, sim, completamente. Em recompensa individual,
não — continua "igual para todos que participaram o mesmo tempo",
exatamente como o capítulo 6 decidiu para a parte de presença, mas sem o
"dano como bônus" que o mesmo capítulo previu e que nunca foi implementado.

**Existe algum ponto claramente desbalanceado?** Dois, ambos medidos, nenhum
corrigido nesta Sprint (fora do escopo):
1. O salto de "sem arma" para "com qualquer arma" (50×) é
   desproporcionalmente mais extremo que qualquer outro degrau medido.
2. A desconexão entre dano (que hoje varia 1250× entre perfis) e
   recompensa individual (que não varia nada) significa que, do ponto de
   vista de um jogador individual, ainda não existe incentivo de
   recompensa pessoal para se equipar melhor — só um incentivo social
   (ajudar o grupo/canal a derrotar o Boss mais rápido).

---

## Critério de sucesso — checagem final

- ✅ Dois personagens diferentes produzem resultados diferentes (1 a 1250
  de dano, medido).
- ✅ Equipamentos mudam o combate (50× a mais com qualquer arma, 3,6× a
  mais com arma rara vs. comum).
- ✅ Level muda o combate (2× o dano ao dobrar o level, proporção exata).
- 🟡 O Boss responde às escolhas do jogador — no dano/velocidade de
  derrota, sim; na recompensa individual, ainda não (achado documentado,
  não uma regressão).
- ✅ Nenhuma regressão — os oito cenários e a validação cruzada bateram
  com o esperado em 100% dos casos.
