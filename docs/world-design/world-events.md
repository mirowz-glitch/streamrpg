# World Events — Rascunho de World Design

**Status: 🟠 Rascunho.** Não é capítulo da Bible — território natural do
capítulo 9 (Seasons), hoje placeholder. Diferença fundamental em relação a
[random-events.md](random-events.md): aqueles são **locais** (por canal/
Kingdom, acontecem dentro de uma expedição); estes são **globais/cross-
Kingdom** ou, no mínimo, de escala muito maior que um único evento de
expedição — a mesma distinção de escopo Global/World/Character/Session já
formalizada no capítulo 13 (Eventos) da Bible.

**Pergunta em aberto explícita, não resolvida aqui:** o capítulo 13 hoje só
tem um exemplo real de escopo Global (`world.tick`, um snapshot técnico, não
uma regra de jogo). Um evento de mundo com significado de **jogo** e escopo
Global seria o primeiro do tipo — isso é uma mudança de categoria real, não
só mais um evento, e precisaria ser confrontado com os Princípios
permanentes antes de qualquer implementação real. Registrado aqui como
risco arquitetural, não decidido.

---

## Guerra Regional

- **O que é:** uma região entra em conflito prolongado — mais inimigos,
  mais agressivos, loot maior, por um período extenso (dias, não minutos
  como os eventos locais).
- **Escala:** pode ser por Kingdom (uma guerra na sua Última Coroa) ou,
  em versão mais rara, atravessar vários Kingdoms simultaneamente (World
  Event de verdade) — a segunda opção é a que abre a pergarunta
  arquitetural acima.
- **Gatilho:** tempo (aleatório, como os Modifiers de Boss) ou consequência
  (fuga repetida de Boss numa região específica).
- **Efeito:** temporário, reversível — a região volta ao normal ao fim.

## Estações

- **O que é:** o continente inteiro passa por um ciclo (ex.: Verão →
  Outono → Inverno → Primavera), cada uma alterando levemente aparência e
  disponibilidade de recurso em várias regiões ao mesmo tempo (ex.: Inverno
  aumenta a severidade de Picos Congelados e reduz a Colheita da Planície
  Dourada).
- **Escala:** Global por natureza — todo Kingdom vive a mesma estação ao
  mesmo tempo, é o candidato mais natural pra um verdadeiro evento Global
  de jogo (mesma ressalva arquitetural do topo do documento).
- **Conexão:** Modifiers de Boss (capítulo 6 da Bible) já são citados como
  "crescendo organicamente em temporadas futuras" — Estações são o
  mecanismo mais óbvio pra isso acontecer.

## Migração de Monstros

- **O que é:** criaturas normalmente restritas a uma região aparecem
  temporariamente em outra (ex.: lobos gigantes de Picos Congelados
  descendo até o Bosque Sussurrante).
- **Escala:** por Kingdom, tipicamente — não precisa ser Global.
- **Efeito:** cria variedade temporária sem redesenhar a região, e dá um
  motivo concreto pra revisitar uma região "resolvida" há tempos.

## Lua Vermelha

- **O que é:** evento noturno raro, aumenta agressividade e recompensa de
  todas as regiões simultaneamente por uma única noite.
- **Escala:** Global (todo Kingdom vive a mesma Lua Vermelha na mesma
  janela de tempo real) — outro candidato de verdadeiro World Event.
- **Tom narrativo:** conecta diretamente com a premissa central ("o Véu
  está se rompendo") — a Lua Vermelha pode ser lida como um sintoma
  visível da decadência do continente, não um evento aleatório sem sentido.

## Corrupção Crescente

- **O que é:** não é um evento pontual, é uma tendência de fundo — regiões
  próximas ao Deserto de Vidro mostram sinais crescentes de Corrupção
  (mecânica ambiental, ver [environmental-mechanics.md](environmental-mechanics.md))
  ao longo do tempo, até serem "contidas" por alguma ação coletiva do
  Kingdom (não decidida — candidato natural pra uma futura Quest ou
  Kingdom Event).
- **Escala:** por Kingdom.
- **Conexão direta com a premissa narrativa central** (ver
  [lore-ambiental.md](lore-ambiental.md)) — é o mecanismo mais explícito
  de tornar "o mundo está se despedaçando" algo jogável, não só ambiental.

## Festival

- **O que é:** evento social na Capital (ou numa Vila), sem combate —
  celebra um marco (aniversário do Kingdom, vitória recente contra Boss,
  fim de uma Guerra Regional).
- **Escala:** por Kingdom.
- **Função:** o oposto funcional da Guerra Regional — existe pra dar um
  motivo de visitar a cidade sem ser puramente utilitário (ferreiro/
  mercador), reforçando "cidade viva" (Missão 4 do documento de Gameplay).

## Invasão

- **O que é:** versão mais severa da Migração de Monstros — uma força
  organizada (não só criaturas soltas) ameaça uma Vila ou a própria
  Capital, exige participação coletiva pra repelir.
- **Escala:** por Kingdom.
- **Risco de design, nomeado com honestidade:** isso é estruturalmente
  muito parecido com Boss (capítulo 6, já fechado) — precisa ficar claro,
  quando desenhado de verdade, por que uma Invasão não é só "outro Boss
  com nome diferente". Hipótese de diferenciação: Invasão ameaça
  **infraestrutura** (a Vila, os serviços), Boss ameaça só **tempo/
  recompensa**. Não decidido, só registrado.

## Caravanas de Temporada

- **O que é:** versão maior e mais rara da Caravana comercial local (ver
  [random-events.md](random-events.md)) — atravessa múltiplas regiões
  numa única jornada, com recompensa cumulativa por escoltar o trecho
  inteiro.
- **Escala:** por Kingdom.

## Escassez

- **O que é:** um recurso específico fica temporariamente raro em todo o
  continente daquele Kingdom (ex.: minério some das Minas por um tempo,
  força os jogadores a explorar Deserto de Vidro atrás de substituto
  arcano).
- **Escala:** por Kingdom.
- **Função:** ferramenta de balanceamento econômico narrativizada — em vez
  de simplesmente "nerfar" um recurso silenciosamente, a Escassez dá um
  motivo de mundo para a mudança.

## Colheita

- **O que é:** pico sazonal de recurso na Planície Dourada, oposto da
  Escassez — abundância temporária, sem risco extra.
- **Escala:** por Kingdom, tipicamente alinhado com Estações.

**Amendment (Sprint Canonical Architecture):** `random-events.md` (#78,
#79) lista "Escassez regional" e "Colheita" com os mesmos nomes, mas
escopo diferente — evento **local**, de uma Vila específica, durando dias,
sem ligação com Estações. Leitura oficial: são dois pares de eventos
distintos que compartilham nome por coincidência temática (ambos sobre
escassez/abundância de recurso), não o mesmo evento em duas escalas. O
par desta página (`world-events.md`) é sempre **por Kingdom inteiro**,
tipicamente alinhado a Estações; o par de `random-events.md` é sempre
**local e independente**. `docs/world-design-review.md` (achado 3.1)
registrou essa duplicação de nome como a inconsistência mais séria
encontrada — esta nota resolve a ambiguidade sem renomear nenhum dos
quatro eventos.

---

## Tabela-resumo (escopo)

| Evento | Escopo típico | Observação |
|---|---|---|
| Guerra Regional | Kingdom (raramente cross-Kingdom) | — |
| Estações | Global | Candidato real a primeiro evento Global de jogo |
| Migração de Monstros | Kingdom | — |
| Lua Vermelha | Global | Candidato real a primeiro evento Global de jogo |
| Corrupção Crescente | Kingdom | Tendência de fundo, não evento pontual |
| Festival | Kingdom | Sem combate |
| Invasão | Kingdom | Precisa se diferenciar de Boss — não resolvido |
| Caravanas de Temporada | Kingdom | Versão maior de evento local já existente |
| Escassez | Kingdom | Ferramenta de balanceamento narrativizada |
| Colheita | Kingdom | Alinhado com Estações |

---

## Nota de honestidade

Dois destes eventos (Estações, Lua Vermelha) são os primeiros candidatos
reais a um evento de escopo Global com significado de jogo — isso é uma
categoria nova, não coberta pelos exemplos existentes no capítulo 13 da
Bible, e merece revisão arquitetural própria antes de qualquer
implementação, não só design de conteúdo. A distinção "Invasão vs. Boss"
também não está resolvida — é um risco de sobreposição conceitual real,
registrado, não escondido.
