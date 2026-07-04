# 02. Grupo / Equipe

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Recupera e formaliza a
Missão 3 da Sprint de Gameplay original (só existia em conversa) — o
próprio review de World Design citou "Sistema de Grupo" como algo que
`npc-design.md` e `cities.md` já assumem existir (Guildmestre Verrik,
sede da Guilda) sem nenhum documento definir como funciona de fato.

## Por que grupo não pode ser "todos os presentes numa party só"

Progressão pertence ao Character, nunca à sessão/canal (Princípio 1 da
Bible, capítulo 2) — isso já elimina a opção de um grupo obrigatório do
qual sair impede progresso. Grupo aqui é uma **camada adicional**, nunca
uma substituição do ganho de XP individual que já existe (`XPSystemV2`,
capítulo 5 da Bible).

## Tamanho e formação

- **Tamanho:** 3-4 personagens — pequeno o bastante pra parecer pessoal,
  grande o bastante pra ter papéis diferentes.
- **Formação:** automática, por ciclo de expedição (ver
  `docs/world-design/roads.md` para o conceito de expedição em si) —
  nunca convite manual. O sistema compõe grupos a partir de quem está
  presente naquele momento (`SessionManager`, já existente), não exige
  recrutamento.
- **Troca:** livre — grupos são temporários, recompostos a cada nova
  expedição. Ninguém é "expulso"; grupos simplesmente deixam de existir
  ao fim do ciclo e um novo se forma.
- **Preferência declarada (não convite):** um personagem pode declarar
  preferência de papel (ex.: "prefiro suporte"), influenciando a
  composição automática, mas nunca escolhendo manualmente quem entra —
  isso elimina fricção social por completo.

## A regra central: trindade é otimização, nunca obrigação

Contra o problema clássico de MMO ("sempre precisa de um sacerdote"):
conteúdo básico precisa ser vencível por **qualquer** composição — mais
devagar, mais arriscado sem uma composição balanceada, mas nunca
bloqueado sem ela. Só conteúdo opcional de dificuldade alta deveria
recompensar de verdade uma composição ideal.

**Como isso se conecta ao capítulo 6 (Bosses), sem contradizê-lo:** o MVP
de Boss já decidiu **não ter Tank/Healer nem aggro** — isso é MVP, não
uma objeção a este capítulo. A regra "trindade é otimização" aqui descrita
é uma visão **pós-MVP**, para quando Classes com papéis distintos (ver
capítulo 06) existirem de fato. Não reabre o capítulo 6.

## Como o grupo se relaciona com dificuldade

Proposta: dificuldade de um encontro (fora de Boss) se ajusta ao poder
agregado do grupo que se formou, não é fixa — um grupo de 4 personagens
todos ofensivos ainda consegue avançar, só que mais devagar/arriscado que
um grupo balanceado. Isso é o mecanismo concreto que torna "trindade
opcional" verdadeiro, em vez de só uma frase de intenção.

## Interface com Boss (capítulo 6)

Boss já é, por definição, um evento de canal inteiro (todo personagem com
presença ativa participa, `docs/game-design-bible/06-bosses.md`,
Participação) — não usa o Grupo de 3-4 aqui descrito, é uma escala
diferente (canal inteiro vs. expedição pequena). Os dois sistemas
coexistem sem conflito: Grupo é a unidade de exploração cotidiana, Boss é
o evento coletivo do canal. Nenhuma mudança proposta aqui afeta como Boss
já mede participação.

## Nota de honestidade

"Dificuldade se ajusta ao poder agregado do grupo" é a peça mais
especulativa deste capítulo — não existe hoje nenhum mecanismo de
dificuldade dinâmica em nenhum System real, e calibrar isso corretamente
(sem tornar grupos fracos frustrantes, nem grupos fortes triviais) é um
problema de balanceamento que só playtest resolve, não design no papel.
