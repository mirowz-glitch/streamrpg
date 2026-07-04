# Gameplay × Combat Model × World Design — Review de Consolidação (Sprint 3)

**Status: 🟠 Rascunho de revisão.** Não é capítulo da Bible, não altera
Technical Design, não implementa nada. Audita `docs/gameplay-design/`
(README + 8 capítulos), `docs/combat-model/` (README + 2 documentos) e
`docs/world-design/` (README + 10 documentos + `world-design-review.md`
da Sprint 2), tratando os três conjuntos como se tivessem sido escritos
por equipes diferentes.

---

## 1. Resumo executivo

Os três conjuntos formam, na maior parte, um único design coerente — a
contradição que motivou o Combat Model (Minas Abandonadas exigindo dano
mágico que não existia) foi genuinamente resolvida em termos de
**matemática**. Mas o próprio processo de resolver essa contradição abriu
uma nova, menor: o Combat Model formalizou só 3 dos 5 atributos que o
Gameplay Design havia proposto (ATQ virou `Equipamento_ATQ(tipo)`, DEF
virou `Resistência(tipo)` — **redefinido, não só renomeado** — e Critical
ficou inalterado), mas **VEL manteve seu papel à parte (frequência de
ação, correto) e SUS/UTI nunca foram matematicamente incorporados em
nenhuma fórmula.** Druida tem "alto SUS" como identidade (Gameplay ch.06),
mas não existe equação nenhuma, em nenhum dos três diretórios, que diga o
que SUS faz numericamente.

Mais sério ainda: o Boss **real, já implementado** (Sprint B3, ver
`docs/technical-design/boss-system.md`) usa uma fórmula temporária fixa
por tick, **sem crítico, sem Equipamentos, sem Classe** — ou seja, nem a
fórmula original do capítulo 6 da Bible está em produção, quanto mais a
fórmula canônica estendida por este Combat Model. Isso não é uma
contradição entre os documentos novos — é a confirmação de que os três
diretórios são, hoje, 100% design, sem nenhuma linha de código
implementando qualquer parte deles.

**Veredito adiantado (detalhado na seção 10):** existe uma contradição
estrutural real e pequena o bastante para valer a pena corrigir agora,
antes de qualquer implementação contínua.

---

## 2. Fluxo completo

```
Personagem → Classe → Equipamentos → Atributos → Combat Model → Build →
Região → Exploração → Evento → Dungeon → Boss → Recompensa → Progressão
```

| Ligação | Existe hoje? | Observação |
|---|---|---|
| Personagem → Classe | ❌ **Marcado explicitamente**: `Character` (Bible cap. 3) tem `level, xp, gold, total_minutes` — nenhum campo `class`. Classes (cap. 4) é Placeholder. |
| Classe → Equipamentos | 🟡 Parcial | 4 arquétipos definidos em `docs/gameplay-design/06-classes-skills.md`, mas o Escudo que Combat Model exige para Bloqueio não existe como slot (Bible cap. 3 confirma só 6 slots: `weapon, armor, helmet, boots, amulet, ring`) |
| Equipamentos → Atributos | 🟡 Parcial | ATQ/DEF físicos já existem em código (`packages/shared/src/items.ts`); **arma mágica (cajado/grimório) é proposta, não existe no schema** — ❌ marcado explicitamente em `docs/combat-model/canonical-formula.md`, seção "Como equipamentos entram na conta" |
| Atributos → Combat Model | 🔴 **Contradição real, ver seção 4, item C1/C2** | SUS e UTI (Gameplay cap. 01) não aparecem em nenhuma fórmula do Combat Model |
| Combat Model → Build | ✅ Conceitualmente ligado | Build (cap. 04) descreve recursos otimizados (loot/hora, acesso, valor social) que não são, em si, termos matemáticos do Combat Model — ligação mais narrativa que numérica, mas não contraditória |
| Build → Região | ✅ **A ligação mais bem resolvida de toda a cadeia** | `docs/combat-model/monsters-and-regions.md` deu valores concretos de Resistência por região, resolvendo a lacuna que o Gameplay Design (cap. 07) só descrevia |
| Região → Exploração | ✅ Bem ligado | `regions.md` ↔ `exploration.md`, referências cruzadas consistentes |
| Exploração → Evento | ✅ Bem ligado | Portal Instável usado corretamente nos dois documentos |
| Evento → Dungeon | ❌ **Marcado explicitamente, herdado da Sprint 2** | Nenhuma Dungeon curada/finita foi desenhada — só "áreas de mapa escondidas" |
| Dungeon → Boss | ❌ Não avaliável | Depende do elo anterior, que não existe |
| Boss → Recompensa | 🟡 Parcial, deliberado | Bible cap. 6: XP sempre proporcional, item só em vitória — real e implementado. Mas usa `Classe_mult = 1` fixo (placeholder documentado), não consome nada do Combat Model ainda — **correto pela ordem do Roadmap** (Classes precisa sair de Placeholder primeiro), não é um bug |
| Recompensa → Progressão | ✅ Real, implementado | `CharacterRepository.applyXP()`, Sprint B4, já testado via harness |

---

## 3. Dependências (por documento)

### Gameplay Design

| Documento | Depende de | Dependido por | Conceito compartilhado | Conceito repetido | Conceito contraditório |
|---|---|---|---|---|---|
| 01-characters-attributes | items.ts (código real) | 02, 03, 04, 05, 06, 07, 08 | ATQ/DEF/VEL/SUS/UTI | — | DEF, mais tarde redefinido por Combat Model como Resistência (ver seção 4) |
| 02-groups | Bible cap. 1/6 | 06, cities.md (Guilda) | Trindade opcional | — | — |
| 03-combat | Bible cap. 6 | Combat Model inteiro | "Uma única fórmula, sempre" | — | — |
| 04-builds | 01 | 07 | Recursos otimizados | — | — |
| 05-equipment | items.ts, Bible cap. 3 | Combat Model (Bloqueio, tipos de dano) | Slots, comportamento | SLOT_DEFENSE_WEIGHT (também citado em Combat Model) | Propõe Escudo (não existe) e Botas→VEL (contradiz o schema atual, onde Botas contribui pra DEF) |
| 06-classes-skills | 01, Bible cap. 4 | 07, 08 | Guerreiro/Druida/Caçador/Xamã | — | Promete "bônus de crítico via UTI" — Combat Model diz Critical é inalterado (ver C2) |
| 07-regions-interface | 01, 04, 06, world-design/regions.md | Combat Model (monsters-and-regions.md o resolve) | Traço mecânico × build | — | — (a lacuna que registrou foi resolvida, não contradita) |
| 08-boss-interface | Bible cap. 6, boss-system.md | — (terminal) | Fórmula de dano de Boss | — | — |

### Combat Model

| Documento | Depende de | Dependido por | Conceito compartilhado | Conceito repetido | Conceito contraditório |
|---|---|---|---|---|---|
| canonical-formula | Bible cap. 6, Gameplay 01/05 | monsters-and-regions | Físico/mágico, Resistência, Penetração, Bloqueio | — | Redefine DEF como Resistência sem atualizar Gameplay 01; declara Critical imutável, contradizendo a promessa de UTI em Gameplay 06 |
| monsters-and-regions | canonical-formula, world-design/regions.md, Gameplay 07 | — (terminal) | Stat block único p/ personagem e monstro | — | — |

### World Design

(Já auditado na Sprint 2 — `world-design-review.md` continua válido e não
é reaberto aqui. Só a interseção nova com Gameplay/Combat Model é
adicionada.)

| Documento | Nova dependência (desta Sprint) |
|---|---|
| regions.md | Agora também depende de `combat-model/monsters-and-regions.md` para os valores de Resistência por região — antes só tinha "traço mecânico" em prosa |
| environmental-mechanics.md | O traço "Vento" (hipótese não validada) agora **contradiz diretamente** o Combat Model (ver C3) — antes só não tinha validação, agora é matematicamente impossível como descrito |

---

## 4. Contradições encontradas

### C1 — DEF (Gameplay cap. 01) e Resistência (Combat Model) não são a mesma coisa, mas ninguém disse isso 🔴

`docs/gameplay-design/01-characters-attributes.md` define `DEF` como um
valor único, derivado de `Base(level) + Equipamento.defense +
Classe.def_bonus`, no mesmo espírito de `defense` plano que já existe em
`packages/shared/src/items.ts`. `docs/combat-model/canonical-formula.md`
substitui esse espaço por **dois** valores percentuais
(`Resistência(físico)`, `Resistência(mágico)`, 0-100%). Nenhum dos dois
documentos referencia essa mudança — Gameplay cap. 01 continua, hoje,
afirmando uma fórmula de DEF que o Combat Model já tornou obsoleta.

### C2 — UTI promete afetar Crítico; Combat Model declara Crítico imutável 🔴

`docs/gameplay-design/06-classes-skills.md`: "Guerreiro: pequeno bônus de
crítico (via UTI)". `docs/combat-model/canonical-formula.md`: "Critical —
inalterado... este documento não propõe mudar isso." As duas frases não
podem ser verdadeiras ao mesmo tempo — se UTI é capaz de alterar a chance
de crítico, Critical não é mais o valor fixo que o capítulo 6 (Boss)
decidiu; se Critical é realmente imutável, a promessa de UTI em Gameplay
cap. 06 está errada.

### C3 — Vento (World Design) descreve uma mecânica que o Combat Model tornou impossível 🟡

`docs/world-design/environmental-mechanics.md` propõe (já como hipótese
não validada) que o Vento de Colinas Áridas "reduza precisão de ataques à
distância". `docs/combat-model/canonical-formula.md` decide
explicitamente que precisão/evasão **não existem** como mecânica de
acerto-ou-erro. Antes do Combat Model, Vento era só uma ideia não
testada; agora é uma ideia matematicamente inviável como está escrita —
precisaria ser reformulada (ex.: reduzir ATQ à distância diretamente, não
"precisão") para caber no modelo canônico.

### C4 — Bloqueio depende de um slot que nenhum dos dois documentos confirma existir 🟡

Combat Model constrói um termo inteiro da fórmula (`Bloqueio_aplicável`)
em cima de um Escudo que `docs/gameplay-design/05-equipment.md` já havia
marcado como "não existe como slot no schema atual" — os dois documentos
concordam que não existe, mas isso significa que **1 dos 6 termos da
fórmula canônica não tem, hoje, nenhum caminho real de implementação.**

### C5 — A fórmula canônica é duas camadas mais avançada que o Boss real em produção 🔴 (mais importante para a Etapa 6)

`docs/technical-design/boss-system.md`, Sprint B3 (✅ implementado):
*"fórmula temporária: `DAMAGE_PER_CHARACTER_PER_TICK` fixo por personagem
presente — sem crítico, sem Equipamentos/Classe, que ainda não existem
como valor numérico."* Ou seja: o Boss que roda hoje em produção não usa
nem a fórmula original do capítulo 6 da Bible (`Base × Equipamentos ×
Classe × Critical`), muito menos a fórmula canônica estendida por este
Combat Model (`× Resistência × Penetração × Bloqueio`). Isso não invalida
o design — é a confirmação exata de que estamos falando de três camadas
de design (Bible → Combat Model) sobre uma implementação real ainda mais
simples que a primeira camada.

### C6 — Minas Abandonadas está resolvida na matemática, não nos dados 🟡

O Combat Model resolveu a contradição *conceitual* (dano físico ≠ dano
mágico), mas a resolução depende de uma arma mágica que **não existe no
schema real** (`ItemSlot`/tipos de arma não distinguem físico/mágico
hoje). Um jogador não consegue, com o código atual, montar um personagem
que "use" a resolução — a região ainda recomenda, na prática, uma build
irrealizável.

---

## 5. Lacunas

- **SUS e UTI sem matemática** (ver C2) — a lacuna mais concreta desta
  Sprint.
- **Arma mágica não existe no schema** (ver C6).
- **Escudo não existe no schema** (ver C4).
- **`class` não existe como campo de `Character`** — Classes inteiras
  são conceituais.
- **Dungeon (conteúdo curado, finito, com cooldown) nunca foi desenhada**
  — herdada da Sprint 2, não tocada por esta.
- **"Expedição especial" e "marco de progresso do Kingdom"** — NPCs e
  eventos de World Design referenciam essas ideias sem nenhuma definição
  em nenhum dos três diretórios.
- **Corrupção reduzindo Resistência(mágico) temporariamente** — proposta
  nova do Combat Model, nunca decidida antes, ainda hipótese.
- **Conversão de `SLOT_DEFENSE_WEIGHT` de peso plano para percentual** —
  mudança de unidade proposta, não calibrada, e potencialmente quebra o
  `comparePower()` do frontend se implementada literalmente como descrita.
- **Escassez/Colheita (duplicação já registrada na Sprint 2)** — segue
  sem solução, não tocada por Gameplay/Combat Model.
- **Funil pela Capital vs. Teleporte da Palafita (contradição já
  registrada na Sprint 2)** — idem.

---

## 6. Redundâncias

| Conceito | Onde | Classificação |
|---|---|---|
| DEF (Gameplay) vs. Resistência (Combat Model) | 01 vs. canonical-formula | 🔴 **Perigoso** — não são a mesma coisa, mas parecem ser |
| ATQ único (Gameplay) vs. `Equipamento_ATQ(tipo)` (Combat Model) | 01 vs. canonical-formula | 🟡 Redundante, mas não perigoso — Combat Model só especializa, não contradiz |
| Bio de NPC resumida/completa | cities.md vs. npc-design.md | 🟢 Aceitável — fonte única de verdade clara (npc-design.md) |
| Escassez/Colheita (local vs. global) | random-events.md vs. world-events.md | 🔴 Perigoso — herdado, ainda sem dono declarado |
| `SLOT_DEFENSE_WEIGHT` citado duas vezes com significados diferentes | Gameplay 05 (peso) vs. Combat Model (base de conversão para %) | 🟡 Redundante, precisa de decisão de unidade antes de virar perigoso |

---

## 7. Coerência do MVP

**Pergunta: um jogador consegue completar o ciclo inteiro do MVP hoje,
apenas com o que está documentado?**

Resposta honesta: **depende de qual MVP.** O MVP que já está **implementado
e funcionando** (Engine: presença → XP/Gold/Level/Drop; Boss: nascimento →
participação → combate simplificado → recompensa) completa um ciclo real
sem depender de nenhum dos três diretórios auditados aqui — porque nenhum
deles foi implementado ainda. Nenhuma região existe em código, nenhuma
classe existe em código, nenhuma resistência existe em código.

O MVP **mais rico que estes três diretórios descrevem** (Personagem com
Classe real, Equipamento com comportamento, Combat Model completo,
explorando Regiões, participando de Eventos, enfrentando Dungeons antes
do Boss) **quebra logo no segundo elo** (Personagem → Classe, campo
inexistente) e tem pelo menos mais quatro quebras confirmadas ao longo da
cadeia (arma mágica, Escudo, Dungeon, SUS/UTI). Isso é esperado — são
documentos de design, não implementação — mas significa que a resposta
correta à pergunta é **não, esse fluxo mais rico não é jogável hoje, e
não deveria ser tratado como se fosse.**

---

## 8. Estado de maturidade

- **Gameplay Design: 🟡** — internamente coerente na maior parte, cita
  código real corretamente (capítulo 05), mas ficou desatualizado em
  relação ao próprio Combat Model que ajudou a gerar (DEF, ver C1).
- **Combat Model: 🟡** — resolve exatamente o problema para o qual foi
  criado (físico vs. mágico), mas deixa 2 de 5 atributos do Gameplay
  Design sem tratamento matemático (SUS/UTI) e um termo inteiro
  (Bloqueio) sem caminho de implementação (Escudo).
- **World Design: 🟡** — inalterado desde a Sprint 2, com uma nova
  observação: o traço "Vento" (já hipótese não validada) agora é
  matematicamente inviável como descrito, não só não testado.

Nenhum dos três está 🔴 — nenhuma contradição encontrada exige redesenhar
uma estrutura inteira, todas são reconciliações pontuais.

---

## 9. Recomendações

Em ordem de alavancagem:

1. Reconciliar DEF (Gameplay 01) com Resistência (Combat Model) — ou
   Gameplay 01 é atualizado para citar Resistência diretamente, ou
   Combat Model explica explicitamente que substitui DEF. Menor esforço,
   remove a contradição mais perigosa (C1).
2. Decidir se UTI afeta Crítico ou não — resolve C2, que hoje é uma
   contradição direta entre dois documentos, não uma ambiguidade.
3. Dar a SUS e UTI pelo menos uma fórmula mínima (mesmo que placeholder,
   como o próprio Boss já faz com `Classe_mult = 1`) — sem isso, Druida e
   Xamã (Gameplay 06) são identidade sem mecânica.
4. Reformular ou remover a hipótese de Vento (World Design) para não
   depender de "precisão" — resolve C3 sem precisar mexer no Combat
   Model.
5. Só depois disso, considerar esta base pronta para começar a orientar
   qualquer implementação real de Classes/Equipamento/Combate.

---

## 10. Veredito final

**Existe uma contradição estrutural que precisa ser resolvida antes de
iniciar implementação contínua — mas ela é pequena, localizada e barata
de corrigir agora.**

Não é uma falha de arquitetura: a arquitetura dos três pilares (Gameplay
define identidade, Combat Model define matemática, World define contexto)
está correta e é exatamente o desenho que deveria existir. O problema é
mais estreito — **dois dos cinco atributos que o Gameplay Design propôs
(SUS e UTI) nunca ganharam uma fórmula real no Combat Model, e o atributo
DEF foi silenciosamente substituído por um modelo diferente
(Resistência) sem nenhum documento reconhecer a mudança.** Enquanto isso
não for resolvido, qualquer implementação de Classes ou Combate herdaria
essa inconsistência diretamente no código — exatamente o tipo de custo que
fica mais caro de corrigir depois de escrito, e mais barato de corrigir
agora, em texto.

A recomendação não é redesenhar nada — é uma reconciliação pontual entre
`docs/gameplay-design/01-characters-attributes.md` e
`docs/combat-model/canonical-formula.md` (itens 1-3 da seção 9). Depois
disso, os três pilares estão prontos para sustentar a próxima fase do
projeto.
