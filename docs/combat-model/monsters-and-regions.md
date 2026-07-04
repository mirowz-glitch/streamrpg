# Monstros e Regiões no Modelo Canônico

**Status: 🟠 Rascunho.** Não é capítulo da Bible, não altera
`docs/world-design/regions.md` nem `docs/gameplay-design/07-regions-interface.md`
— resolve, num documento novo, a contradição que aquele capítulo já havia
exposto explicitamente.

## O princípio: monstros são combatentes com o mesmo stat block

Nenhum sistema separado para monstros — um monstro tem exatamente os
mesmos campos que um personagem (`ATQ_físico`, `ATQ_mágico`,
`Resistência_físico`, `Resistência_mágico`, `Penetração`, `HP`, `VEL`).
Isso é a mesma decisão de "uma única fórmula, sempre"
(`docs/gameplay-design/03-combat.md`) aplicada de forma simétrica —
combate nunca é "jogador contra uma regra diferente", é sempre a mesma
fórmula, dos dois lados.

## Resolvendo a contradição de Minas Abandonadas

`docs/gameplay-design/07-regions-interface.md` registrou a lacuna: "Minas
Abandonadas favorece dano mágico contra defesa física alta" sem nenhum
atributo capaz de expressar isso. Com o modelo canônico
(`canonical-formula.md`), a região agora tem um stat block real possível:

| Monstro (Minas Abandonadas) | Resistência (físico) | Resistência (mágico) | Leitura |
|---|---|---|---|
| Constructo de pedra | Alta (ex.: 60) | Baixa (ex.: 10) | Guerreiro/Caçador (dano físico) mitigados fortemente; Druida/Xamã (dano mágico) passam quase tudo |
| Morto-vivo de mineiro | Média (ex.: 30) | Média (ex.: 30) | Neutro — nenhuma build é claramente favorecida contra este inimigo específico |

A região, como um todo, favorece dano mágico **porque o inimigo mais
recorrente dela (constructo) tem esse perfil** — não por uma regra
especial da região em si. Isso é uma virada importante: "traço mecânico
de região" (World Design) deixa de ser uma afirmação solta e passa a ser
uma **consequência calculável** do stat block dos monstros que a região
contém.

## Tabela revisada: região → perfil de resistência dominante

Atualiza, sem substituir, a tabela de
`docs/gameplay-design/07-regions-interface.md` — agora com valores
concretos de Resistência em vez de só "atributo mais relevante":

| Região | Resistência (físico) dominante | Resistência (mágico) dominante | Build favorecida (confirmada pelo stat block) |
|---|---|---|---|
| Bosque Sussurrante | Baixa | Baixa | Qualquer — a região desafia por VEL/alcance (arqueiros inimigos), não por resistência |
| Pântano Podre | Baixa | Baixa | Druida (o desafio aqui é Veneno contínuo, fora da fórmula de combate por golpe, não resistência) |
| Colinas Áridas | Média | Baixa | Físico ainda funciona — desafio é tático (flanco), não de resistência |
| Minas Abandonadas | **Alta** | **Baixa** | Mágico (Druida/Xamã) — confirmado pelo stat block, não mais hipótese |
| Picos Congelados | Média | Média | Neutro em resistência — desafio é VEL (lentidão ambiental) |
| Deserto de Vidro | Baixa | **Alta** | Físico passa melhor que mágico aqui — **inverso** de Minas Abandonadas, adiciona variedade real entre as duas regiões de dificuldade alta |
| Ruínas Esquecidas | Média | Alta | Físico com penetração, ou UTI para lidar com invocações — mistura, não um único tipo dominante |
| Fortaleza Sombria | Alta | Alta | Nenhum tipo isolado domina — build equilibrada, consistente com o que `regions.md` já descrevia |

**Achado novo desta Sprint:** Deserto de Vidro, que antes só tinha
"favorece resistência mágica do personagem" (mitigar Corrupção) descrito
em `world-events.md`/`environmental-mechanics.md`, agora ganha também um
perfil de **resistência do monstro** oposto ao de Minas Abandonadas — as
duas regiões de dificuldade alta deixam de ser "mais do mesmo" e passam a
recompensar builds opostas, o que não estava garantido antes deste
documento.

**Achado adicional (Sprint 4):** Deserto de Vidro puxa em duas direções
ao mesmo tempo, e isso é bom, não um erro — sobreviver à Corrupção
favorece Resistência mágica/SUS altos (Druida/Xamã), mas causar dano de
verdade contra os monstros da região (Resistência física baixa) favorece
ATQ físico (Guerreiro/Caçador). Nenhuma classe isolada faz as duas coisas
bem — é a primeira região onde sobrevivência e dano puxam para classes
diferentes, o que recompensa naturalmente um grupo misto em vez de uma
única build "correta". Consistente com a regra de Grupo já registrada em
`docs/gameplay-design/02-groups.md` ("trindade é otimização, nunca
obrigação").

## Como isso se conecta a Boss (capítulo 6, sem reabri-lo)

O MVP de Boss usa multiplicador de Classe fixo em `1` e não distingue
tipo de dano (documentado como placeholder no Technical Design). Este
modelo não exige que Boss mude — só descreve o que aconteceria **se**,
no futuro, um Boss específico ganhasse um perfil de resistência
(ex.: um Boss "blindado" com `Resistência(físico)` alta, recompensando
grupos com presença mágica). Isso é visão pós-MVP, não uma proposta de
mudança agora.

## Nota de honestidade

Os valores de Resistência nas tabelas acima (60, 10, 30, etc.) são
ilustrativos, não calibrados — mesmo padrão de honestidade já usado nos
tiers de Escala de Boss ("números de exemplo, não calibrados", capítulo
6). A contribuição real deste documento é a **estrutura** (todo monstro
tem resistência física e mágica separadas, toda região tem um perfil
resultante disso), não os números específicos.
