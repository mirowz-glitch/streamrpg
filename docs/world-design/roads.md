# Roads — Rascunho de World Design

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Define como o grafo de
regiões (ver [regions.md](regions.md)) se conecta fisicamente — a estrutura
de dados subjacente é um grafo desde o dia 1 (decisão já registrada na
sessão anterior de World Design), mesmo que o conteúdo do MVP pareça quase
linear.

---

## Grafo de conexão (MVP)

```
Porto do Amanhecer
        │
        ├── Bosque Sussurrante ───┐
        ├── Pântano Podre         │
        ├── Colinas Áridas        ├──► Última Coroa (Capital)
        └── Planície Dourada ─────┘
                                          │
              ┌───────────────┬──────────┼──────────────┬──────────────┐
              │               │          │              │              │
        Minas Abandonadas  Litoral   Picos Congelados  Deserto de     (ramo
                            Quebrado                    Vidro          futuro)
              │               │          │              │
              └───────┬───────┴──────────┴──────────────┘
                      │
              Ruínas Esquecidas
                      │
              Fortaleza Sombria (endgame)
```

Todo caminho passa pela Capital pelo menos uma vez antes de acessar o
segundo anel de regiões — isso é deliberado (ver "Cruzamentos" abaixo),
não um acidente de desenho.

**Amendment (Sprint Canonical Architecture):** esta regra tem uma exceção
já registrada em `exploration.md` — o Teleporte da Palafita (descoberta
de conveniência, Pântano ↔ Vila do Bosque) quebra o funil da Capital de
propósito. Leitura oficial: "todo caminho passa pela Capital" descreve o
grafo **base**; descobertas de exploração (`exploration.md`) são
exceções permanentes e deliberadas a essa regra, não uma contradição não
resolvida. `docs/world-design-review.md` (achado 3.2) registrou isso como
inconsistência antes desta reconciliação.

---

## Estradas

- **Estrada Real:** liga Porto do Amanhecer → Última Coroa. A única
  estrada pavimentada de verdade do continente — sinaliza visualmente que
  a Capital é o centro do mundo antes mesmo do jogador chegar lá.
- **Estradas regionais:** ligam a Capital a cada Vila (Vila do Bosque,
  Palafita do Junco, Posto das Minas, Refúgio Gélido) — terra batida,
  menos cuidadas que a Estrada Real, refletindo que são secundárias.
- **Rota Marítima:** não é uma estrada terrestre — liga Porto Salgado a
  outros pontos costeiros hipotéticos (fora do MVP, ver
  [future-expansion.md](future-expansion.md)). Dentro do MVP, existe só
  como a ligação Porto Salgado ↔ Última Coroa, por terra normal com um
  trecho ao longo do litoral.

## Atalhos

- **Trilha do Contrabandista** (Bosque Sussurrante ↔ Colinas Áridas):
  liga duas regiões do primeiro anel sem passar pela Capital — só existe
  como **descoberta** (ver [exploration.md](exploration.md)), não
  disponível desde o início. Reforça o valor de explorar cada região por
  completo.
- **Passagem Congelada** (Picos Congelados ↔ Ruínas Esquecidas): atalho
  natural que pula a necessidade de voltar à Capital entre essas duas
  regiões — só utilizável depois que a Nevasca (evento ambiental) libera
  a passagem, criando um atalho condicional ao estado do mundo, não
  permanente por padrão.

## Cruzamentos

- **Cruzamento da Coroa** (na própria Última Coroa): todo grafo do
  segundo anel (Minas, Litoral, Picos, Deserto) só é acessível a partir
  daqui — reforça a Capital como centro literal do mundo, não só do
  jogo. Efeito pretendido: mesmo quem só quer "ir direto pro próximo
  desafio" tem que passar visualmente pelo hub social, reforçando a
  sensação de comunidade viva (documento de Gameplay, Missão 4).
- **Encruzilhada do Litoral:** ponto onde a estrada de Porto Salgado se
  divide entre "voltar pra Capital" e "seguir rota comercial" (gancho
  narrativo para caravanas, ver [random-events.md](random-events.md) e
  [npc-design.md](npc-design.md)).

## Caminhos perigosos

- **Trilha Alta dos Picos:** atalho dentro da própria região Picos
  Congelados que reduz tempo de expedição, mas aumenta a chance de
  encontro com o elemental de gelo mais forte da região — risco/
  recompensa dentro de uma única região, não entre regiões.
- **Vau do Pântano:** travessia direta pelo Pântano Podre, mais curta que
  a trilha normal, mas atravessa a área de maior concentração de
  criaturas venenosas — existe para dar ao jogador uma escolha real
  dentro de uma expedição, não só entre regiões.

## Rotas comerciais

- **Rota do Sal:** liga Porto Salgado à Última Coroa — o comércio real
  (mercador, Missão 9 do documento de Gameplay) flui por aqui: peixe,
  pérolas e madeira de naufrágio saem do Litoral, ferramentas e grãos
  saem da Capital.
- **Rota do Minério:** liga Posto das Minas à Última Coroa — minério e
  gemas brutas saem das Minas, ferramentas de reparo saem da Capital.
- Essas rotas são o que dá sentido físico às Caravanas (ver
  [random-events.md](random-events.md)) — uma Caravana nunca aparece
  fora de uma rota comercial existente, isso seria narrativamente
  incoerente.

## Regiões isoladas

- **Deserto de Vidro:** deliberadamente a região mais isolada do grafo —
  só uma estrada de acesso, sem atalho conhecido, sem rota comercial (não
  há nada ali que mercadores normais quisessem transportar). O isolamento
  é parte da identidade da região (ver [regions.md](regions.md) —
  "algo terrível aconteceu aqui").
- **Fortaleza Sombria:** por definição de convergência (ver
  [regions.md](regions.md)), não tem atalho de entrada — só acessível
  depois de progredir por pelo menos dois ramos do segundo anel.

## Áreas secretas

- Existem, mas não são marcadas no grafo público — ver
  [exploration.md](exploration.md) para a lista completa. Regra geral:
  toda área secreta se conecta a uma região existente por uma única
  entrada oculta, nunca cria uma região nova inteira sem gancho de
  descoberta.

---

## Nota de honestidade

O grafo força passagem pela Capital antes de qualquer conteúdo do segundo
anel — isso é bom para "cidade como centro social" (Missão 4 do documento
de Gameplay), mas é, ao mesmo tempo, um funil obrigatório que pode ser
percebido como fricção se a Capital não tiver conteúdo suficiente para
justificar a parada. Risco real, não resolvido só por este documento.
