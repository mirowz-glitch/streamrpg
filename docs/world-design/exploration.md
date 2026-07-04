# Exploration — Rascunho de World Design

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Formaliza a estrutura de
descoberta já esboçada na sessão anterior de World Design (três categorias:
conveniência, conteúdo, social/narrativa) com exemplos concretos amarrados
às regiões de [regions.md](regions.md).

Regra permanente herdada: toda descoberta feita por um personagem de um
canal fica **permanente para aquele Kingdom inteiro** (não por personagem
individual) — reforça identidade coletiva de canal, coerente com o modelo
de Kingdom = instância por canal já assumido nestes rascunhos.

---

## Categoria 1 — Descoberta de conveniência

Recompensa exploração completa com economia de tempo futura. Uma vez
encontrada, fica disponível para sempre naquele Kingdom.

- **Trilha do Contrabandista** (ver [roads.md](roads.md)): atalho entre
  Bosque Sussurrante e Colinas Áridas, só descoberto ao completar um
  número suficiente de expedições no Bosque.
- **Teleporte da Palafita:** um círculo ritual esquecido no fundo do
  Pântano Podre, ligando diretamente à Vila do Bosque — conecta duas
  Vilas regionais sem passar pela Capital, quebrando o funil normal do
  grafo (ver ressalva de fricção em [roads.md](roads.md)).
- **Ponte Reconstruída:** se uma Ponte cair (evento de mundo vivo, ver
  [random-events.md](random-events.md)), reconstruí-la via Quest (fora
  do escopo deste rascunho, capítulo 7 ainda placeholder) é, em si, uma
  descoberta de conveniência permanente.

## Categoria 2 — Descoberta de conteúdo

Recompensa exploração com mais jogo, não mais item.

- **Caverna da Maré Baixa** (Litoral Quebrado): só visível/acessível
  durante maré baixa (ver [environmental-mechanics.md](environmental-mechanics.md))
  — uma dungeon secreta condicionada a horário, não a progressão.
- **Câmara Selada** (Minas Abandonadas): bloqueada por um Desmoronamento
  específico — só acessível depois de uma rota alternativa ser
  descoberta dentro da própria região.
- **Boss Escondido — "O Guardião sem Nome"** (Ruínas Esquecidas): variante
  rara de encontro, só aparece se o grupo completar a região sem acionar
  nenhuma Armadilha (condição de "execução limpa") — recompensa
  habilidade de exploração cuidadosa, não força bruta. **Nota: isto é uma
  ideia de conteúdo, não uma decisão do capítulo 6 (Bosses) da Bible, que
  já está fechado — qualquer variante de Boss precisaria passar pelo
  mesmo processo bloco-a-bloco antes de virar decisão real.**
- **Portal Instável** (evento aleatório recorrente, ver
  [random-events.md](random-events.md)): quando descoberto pela primeira
  vez, revela a existência de uma sala secreta fixa nas Ruínas Esquecidas
  — depois disso, a sala fica conhecida (mapa atualizado), mas o Portal
  em si continua sendo temporário a cada expedição futura.

## Categoria 3 — Descoberta social/narrativa

Recompensa exploração com algo que vira assunto — conecta com a hipótese
de Legado (Character Legacy) já registrada em memória, sem promovê-la.

- **A Mercadora do Navio Fantasma** (Litoral Quebrado): NPC raro que só
  aparece durante tempestade (ver [npc-design.md](npc-design.md)), vende
  itens que não existem em nenhum outro lugar do continente.
- **O Eremita das Colinas** (Colinas Áridas): NPC secreto, só aparece
  depois que o Kingdom completa a região um número mínimo de vezes —
  conta um fragmento da história ambiental do mundo (ver
  [lore-ambiental.md](lore-ambiental.md)), sem exigir diálogo longo.
- **Mercador Exclusivo da Fortaleza:** só acessível depois que o Kingdom
  derrota a elite única da Fortaleza Sombria pela primeira vez — o
  "prêmio de ter chegado lá primeiro" é social (todo personagem daquele
  canal ganha acesso), não um item pessoal intransferível.

---

## Tabela-resumo

| Descoberta | Categoria | Região | Permanente por |
|---|---|---|---|
| Trilha do Contrabandista | Conveniência | Bosque ↔ Colinas | Kingdom |
| Teleporte da Palafita | Conveniência | Pântano ↔ Vila do Bosque | Kingdom |
| Ponte Reconstruída | Conveniência | (depende do evento) | Kingdom |
| Caverna da Maré Baixa | Conteúdo | Litoral Quebrado | Kingdom (conhecimento do horário) |
| Câmara Selada | Conteúdo | Minas Abandonadas | Kingdom |
| Guardião sem Nome | Conteúdo (hipótese) | Ruínas Esquecidas | Kingdom |
| Sala Secreta do Portal | Conteúdo | Ruínas Esquecidas | Kingdom |
| Mercadora do Navio Fantasma | Social/narrativa | Litoral Quebrado | Nenhuma (sempre condicional ao evento) |
| Eremita das Colinas | Social/narrativa | Colinas Áridas | Kingdom |
| Mercador Exclusivo da Fortaleza | Social/narrativa | Fortaleza Sombria | Kingdom |

---

## Perguntas em aberto (não respondidas aqui)

- Como o jogo comunica "isto foi descoberto" sem exigir uma UI dedicada
  (o próprio documento de World Design original já apontou o débito de
  UI-001 existente em Progressão — qualquer notificação de descoberta
  herda o mesmo problema até ele ser resolvido)?
- "Permanente por Kingdom" implica em um novo tipo de estado persistente
  por canal — isso é exatamente o tipo de decisão que Kingdoms (capítulo
  8, placeholder) precisa resolver, incluindo a pergunta de sharding já
  registrada lá. Não decidido aqui.

## Nota de honestidade

Toda a Categoria 2 (conteúdo) pressupõe uma noção de "condição de
progresso da região" (nº de expedições completas, execução limpa) que não
existe em nenhum sistema hoje — é hipótese de design, não algo com dado
de sustentação.
