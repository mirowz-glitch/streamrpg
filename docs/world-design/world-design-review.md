# World Design — Review de Consolidação (Sprint 2)

**Status: 🟠 Rascunho de revisão.** Não é capítulo da Bible, não altera
nenhum documento existente (Bible, technical-design, ou os 10 documentos
de `docs/world-design/`). Este documento só audita — trata cada um dos 10
documentos como se tivesse sido escrito por uma pessoa diferente, sem
assumir que qualquer um deles está correto.

Base: os 10 documentos criados na Sprint 1 (`regions.md`, `cities.md`,
`roads.md`, `random-events.md`, `exploration.md`,
`environmental-mechanics.md`, `world-events.md`, `npc-design.md`,
`lore-ambiental.md`, `future-expansion.md`) + `README.md`, relidos por
completo para esta auditoria.

---

## 1. Resumo executivo

A biblioteca é estruturalmente consistente na forma (todo documento segue
o mesmo padrão de seções, todo documento tem uma "Nota de honestidade"
final) e majoritariamente consistente no conteúdo — mas existe **uma
duplicação real e concreta** entre `random-events.md` e `world-events.md`
(dois eventos com o mesmo nome, "Escassez" e "Colheita", em escopos
diferentes, sem regra explícita de como se relacionam), **uma contradição
literal** entre a regra "todo caminho passa pela Capital" (`roads.md`) e a
exceção que a quebra (`exploration.md`), e **uma dependência oculta
crítica**: praticamente todo o conceito de "identidade mecânica por
região" (o traço central de `regions.md`, `environmental-mechanics.md`,
`exploration.md`) depende de um sistema de Build/Equipamento-com-
comportamento que **nunca foi escrito em nenhum arquivo** — ele existe só
na conversa da Sprint de Gameplay anterior, nunca commitado. Isso é o
maior risco estrutural da biblioteca inteira: metade do World Design
pressupõe um documento de Gameplay que não existe fisicamente no repo.

Nenhuma contradição encontrada é grave o bastante para invalidar o
trabalho — todas são do tipo "esquecimento de sincronização entre
documentos escritos em sequência", exatamente o que este Sprint 2 existe
para capturar antes que o volume cresça mais.

---

## 2. Mapa de dependências

### Árvore de dependência (por documento)

```
README.md
  └─ aponta para todos os 10, não depende de nenhum

regions.md
  ├─ depende de: roads.md (grafo), environmental-mechanics.md (traços),
  │              future-expansion.md (Fortaleza/Boss variante),
  │              [Gameplay Sprint 1 — NÃO É ARQUIVO, só conversa]
  └─ dependido por: cities.md, roads.md, random-events.md, exploration.md,
                     environmental-mechanics.md, npc-design.md,
                     lore-ambiental.md, future-expansion.md
     (é o documento mais referenciado de toda a biblioteca)

cities.md
  ├─ depende de: roads.md (grafo), lore-ambiental.md (ganchos narrativos),
  │              game-design-bible/10-economy.md (nota de honestidade)
  └─ dependido por: roads.md, npc-design.md, random-events.md (rotas)

roads.md
  ├─ depende de: regions.md (grafo inteiro é sobre essas regiões)
  └─ dependido por: exploration.md, random-events.md, cities.md,
                     lore-ambiental.md

random-events.md
  ├─ depende de: regions.md, roads.md, environmental-mechanics.md,
  │              world-events.md (Lua vermelha), exploration.md (Portal)
  └─ dependido por: exploration.md, npc-design.md, world-events.md
     (nota: dependência CIRCULAR leve com world-events.md — ver
     Contradições, item 1)

exploration.md
  ├─ depende de: roads.md, regions.md, random-events.md, npc-design.md,
  │              lore-ambiental.md, game-design-bible cap. 6/8,
  │              memória (hipótese de Legado, não é arquivo)
  └─ dependido por: npc-design.md, lore-ambiental.md, future-expansion.md

environmental-mechanics.md
  ├─ depende de: regions.md, future-expansion.md (Lava),
  │              game-design-bible cap. 6 (fórmula de dano, posicionamento)
  └─ dependido por: regions.md (referência cruzada), random-events.md,
                     world-events.md (Corrupção)

world-events.md
  ├─ depende de: random-events.md (distinção de escopo),
  │              environmental-mechanics.md (Corrupção),
  │              lore-ambiental.md (premissa central),
  │              game-design-bible cap. 6/9/13
  └─ dependido por: future-expansion.md
     (ver Contradições, item 1 — dependência circular com random-events.md)

npc-design.md
  ├─ depende de: world-events.md, exploration.md, lore-ambiental.md,
  │              cities.md, random-events.md, game-design-bible cap. 11
  └─ dependido por: lore-ambiental.md (referências cruzadas de NPC)

lore-ambiental.md
  ├─ depende de: npc-design.md, exploration.md, roads.md,
  │              random-events.md, [premissa narrativa — só conversa]
  └─ dependido por: future-expansion.md

future-expansion.md
  ├─ depende de: TODOS os outros 9 + game-design-bible cap. 6/8/10/11/12
  └─ dependido por: nenhum (é o documento terminal, não deveria ser
                     referenciado por nada mais recente que ele)
```

### Observações sobre o mapa

- **`regions.md` é o centro de gravidade real da biblioteca** — 8 dos
  outros 9 documentos dependem dele diretamente. Qualquer mudança nas 10
  regiões (nome, traço mecânico, nível recomendado) propaga para quase
  tudo. Isso não é um problema por si só, mas significa que `regions.md`
  deveria ser o **primeiro** a estabilizar antes de qualquer promoção
  parcial para a Bible — promover outro documento sem `regions.md` sólido
  é construir sobre areia.
- **Dependência circular leve:** `random-events.md` cita `world-events.md`
  (Lua vermelha) e `world-events.md` cita `random-events.md` (distinção de
  escopo). Não é um problema de lógica (são conceitos legitimamente
  relacionados), mas nenhum dos dois pode ser lido isoladamente sem o
  outro — o que enfraquece a alegação de que são categorias
  independentes.
- **Dependência externa não-documentada, a mais séria encontrada:**
  `regions.md` (traço mecânico de cada região), `environmental-mechanics.md`
  ("favorece builds X, penaliza builds Y") e `exploration.md` (builds
  citadas indiretamente) pressupõem, sem nunca dizer isso explicitamente,
  que existe um sistema de Equipamento-com-comportamento e Builds
  diferenciadas. Esse sistema **foi desenhado em profundidade numa Sprint
  de Gameplay anterior, mas nunca foi salvo em nenhum arquivo do repo** —
  só existe no histórico de conversa. Ou seja: um terço da biblioteca de
  World Design depende de um documento de Gameplay que, do ponto de vista
  do repositório, não existe.
- **Conceito isolado (não referenciado por nada):** a seção "Pergunta em
  aberto explícita" no topo de `world-events.md` (evento de escopo Global
  com significado de jogo) não é citada por nenhum outro documento, apesar
  de ser, possivelmente, a descoberta arquitetural mais importante de toda
  a Sprint 1. Vale elevar isso de rodapé de um documento para algo mais
  visível.

---

## 3. Contradições encontradas

### 3.1 — "Escassez" e "Colheita" existem em dois escopos diferentes com o mesmo nome (🔴 mais sério)

`random-events.md` (#78, #79) define **Escassez regional** e **Colheita**
como eventos **locais**, de curta duração ("Dias"), específicos de uma
Vila/região. `world-events.md` define **Escassez** e **Colheita** como
eventos **globais** (por Kingdom inteiro), a segunda "tipicamente
alinhado com Estações". São nomes idênticos, definições diferentes, e
nenhum dos dois documentos menciona o outro nesse ponto específico —
exatamente o tipo de coisa que aconteceria se duas pessoas diferentes
escrevessem os dois documentos sem se falar. **Não decidido aqui:** se são
o mesmo fenômeno em escalas diferentes (a versão global seria "várias
Escassezes locais acontecendo ao mesmo tempo") ou dois conceitos que
deveriam ter nomes distintos.

### 3.2 — "Todo caminho passa pela Capital" é contradito pela sua própria exceção (🟡)

`roads.md` afirma, em tom de regra: *"Todo caminho passa pela Capital pelo
menos uma vez antes de acessar o segundo anel de regiões — isso é
deliberado."* `exploration.md`, na Categoria 1, descreve o **Teleporte da
Palafita** como algo que *"conecta duas Vilas regionais sem passar pela
Capital, quebrando o funil normal do grafo"* — e cita `roads.md`
diretamente ao fazer isso. O segundo documento já reconhece que quebra o
primeiro, mas o primeiro nunca foi atualizado para dizer "exceto por
descobertas de exploração". Não é uma contradição grave (a exceção é
intencional e documentada), mas a "regra" em `roads.md` está, tecnicamente,
factualmente errada assim que uma única descoberta acontece.

### 3.3 — "Vento" em Colinas Áridas pode competir com o traço mecânico principal da própria região (🟡, já auto-identificado)

`regions.md` define o traço mecânico de Colinas Áridas como "favorece dano
em área/controle de grupo". `environmental-mechanics.md` propõe (como
hipótese explicitamente não validada) que o Vento da mesma região reduza
precisão de ataques à distância — o que **penaliza especificamente** um
subconjunto de builds de área (as que dependem de alcance). O próprio
documento já sinaliza isso como risco ("pode tornar a região confusa"),
mas vale destacar aqui porque é o único caso em que dois documentos
descrevem, para a mesma região, dois efeitos que empurram em direções
opostas.

### 3.4 — Nevasca (evento) e Gelo (mecânica permanente) nunca têm sua relação explicada (🟡)

`random-events.md` #17 (Nevasca) e `environmental-mechanics.md` (Gelo,
traço permanente de Picos Congelados) descrevem fenômenos claramente
relacionados — mas nenhum documento diz se a Nevasca é "o Gelo
temporariamente mais forte" ou um evento independente que soma ao Gelo
já existente. O mesmo padrão se repete com Maré alta inesperada
(`random-events.md` #21) versus a mecânica de Maré (`environmental-mechanics.md`),
e com Tempestade elétrica (#23) versus Corrupção (mecânica do Deserto de
Vidro). Três casos do mesmo problema estrutural: evento temporário e
mecânica permanente da mesma região nunca declaram sua relação.

### 3.5 — NPCs e eventos que referenciam mecânicas nunca definidas (🟡)

- **O Recrutador Itinerante** (`npc-design.md`) oferece acesso a uma
  "expedição especial" — nenhum documento define o que torna uma
  expedição "especial" versus uma expedição normal.
- **Presente do Kingdom** (`random-events.md` #60) é descrito como ligado
  a um "marco de progresso do canal" — nenhum documento define o que
  conta como marco, nem onde esse progresso é rastreado (questão que, na
  prática, pertence ao capítulo 8/Kingdoms da Bible, ainda placeholder).

Nenhum destes é uma contradição no sentido estrito (nada se cancela), mas
são promessas de conteúdo que a biblioteca faz sem ter onde cumpri-las
ainda — vale nomear como "dívida de referência", não como erro.

### 3.6 — Lore não entra em conflito com Bosses, mas também nunca conversa com ele diretamente (checagem pedida explicitamente, resultado: sem contradição, mas sem conexão)

Nenhum elemento de `lore-ambiental.md` contradiz o capítulo 6 (Bosses) da
Bible — mas também nenhum deles menciona Boss diretamente, apesar de
`regions.md` (Fortaleza Sombria) e `future-expansion.md` já cogitarem uma
"variante rara de Boss" como conteúdo futuro. Era esperável que pelo menos
um elemento de lore (ex.: um santuário destruído, um campo de batalha)
insinuasse a origem simbólica do Boss como manifestação da decadência do
mundo — a conexão narrativa existe em `world-events.md` (Corrupção
Crescente) mas não foi replicada em `lore-ambiental.md`. Não é erro, é
oportunidade perdida (ver seção 7).

### 3.7 — World Event que quebra Kingdoms: nenhum quebra, mas dois dependem de uma decisão que Kingdoms ainda não tomou

Estações e Lua Vermelha (`world-events.md`) são desenhados como eventos
de escopo **Global** — mas a própria premissa de trabalho de toda a
biblioteca (ver README.md) é "Kingdom = instância por canal,
independente". Um evento verdadeiramente Global implicaria sincronizar
estado entre milhares de instâncias de Kingdom ao mesmo tempo — algo que
não é uma contradição de design, mas é uma pergunta de arquitetura que
`world-events.md` já nomeia e nenhum outro documento resolve. Registrado
lá; reforçado aqui porque afeta diretamente `future-expansion.md`
("1 ano" já assume esse evento como factível sem repetir a ressalva).

### 3.8 — Expansão futura que quase contradiz o Roadmap, mas se salva por uma frase

`future-expansion.md`, na fase "2 anos", propõe "Invasão como World Event
real" e "Kingdom Events cross-canal" antes de Marketplace/Referral/
MetricsSystem (que, pelo capítulo 12 da Bible, vêm depois de Economia 1.0
na mesma janela de tempo aproximada). O documento não contradiz o
Roadmap porque condiciona explicitamente essas fases a "se a arquitetura
de Kingdoms permitir" — mas é uma condicional frágil, fácil de ler como
promessa se lida rápido. Vale reforçar visualmente essa condicional numa
eventual revisão do próprio `future-expansion.md` (não feita agora, fora
do escopo desta review).

---

## 4. Conceitos duplicados

| Conceito | Onde aparece | Natureza da duplicação |
|---|---|---|
| Escassez / Colheita | `random-events.md` + `world-events.md` | Mesmo nome, escopos diferentes, sem relação declarada (ver 3.1) |
| Bio de NPC (Capitão Reyes, Capataz Munro) | `cities.md` (resumida) + `npc-design.md` (completa) | Duplicação intencional mas sem "fonte única de verdade" declarada — risco de drift se um for editado sem o outro |
| Nevasca/Gelo, Maré (evento)/Maré (mecânica), Tempestade elétrica/Corrupção | `random-events.md` + `environmental-mechanics.md` | Mesmo fenômeno em dois registros (evento pontual vs. traço permanente) sem relação explícita (ver 3.4) |
| "Kingdom = instância por canal" | Citado em `README.md`, `exploration.md`, `future-expansion.md` | Não é bem uma duplicação de conteúdo — é a mesma premissa fundamental **repetida por citação a "sessão anterior de conversa"** em 3+ documentos, nunca escrita como conceito próprio em nenhum arquivo |
| Portal Instável | `random-events.md` (#61) + `exploration.md` (gatilho de sala secreta) | Não é duplicação problemática — é a mesma entidade usada corretamente em dois papéis, mas só quem lê os dois documentos percebe que é a mesma coisa |

---

## 5. Lacunas

Pergunta-guia: se um jogador passasse 200 horas neste mundo, o que ainda
falta?

- **Nenhuma "Dungeon" real foi desenhada ainda.** A distinção Mapa vs.
  Dungeon vs. Boss vs. Evento (já estabelecida na sessão de World Design
  original) prometia conteúdo curado, com início/fim definidos e
  cooldown/limite de tentativas — mas tudo que `exploration.md` produziu
  (Câmara Selada, Caverna da Maré Baixa) é "área de mapa escondida", não
  uma Dungeon com a estrutura própria prometida. É a lacuna mais concreta
  encontrada nesta review.
- **Sem conteúdo de endgame repetível além da Fortaleza Sombria.** Um
  personagem nível 40+ tem exatamente um destino narrativo (a elite única
  da Fortaleza) e um gancho hipotético (Boss escondido nas Ruínas, nunca
  decidido). Depois de resolver os dois, não há nada desenhado para as
  próximas 150 horas.
- **Regiões iniciais (Bosque, Pântano, Colinas, Planície) não têm motivo
  de retorno de longo prazo** além de eventos aleatórios raros e
  Migração de Monstros — uma vez "resolvidas", o incentivo de revisitar
  é fraco. Isso é exatamente o risco "regiões que nunca serão visitadas"
  pedido na Etapa 3, e a resposta honesta é: sim, esse risco é real para
  as quatro regiões de entrada.
- **Guilda existe de nome, não de função.** Aparece em `cities.md` e
  `npc-design.md` como "sede do Sistema de Grupo", mas nenhum documento
  desenvolve o que uma Guilda realmente oferece além de ser um prédio —
  guilda única vs. múltiplas, papel social, qualquer profundidade além de
  matchmaking automático.
- **Craft citado 6+ vezes ("viés em material de craft") sem nenhuma
  receita, sistema ou sink concreto.** Consistente com Economia estar
  "Em discussão" na Bible, mas para "200 horas" ser uma pergunta honesta,
  em algum momento o Craft precisa parar de ser só uma palavra repetida.
- **Nenhum documento aborda o que acontece quando dois personagens do
  mesmo Kingdom "descobrem" a mesma coisa ao mesmo tempo** (condição de
  corrida social, não técnica) — irrelevante hoje, relevante se
  descobertas viradem gatilho de recompensa exclusiva.

---

## 6. Padrões descobertos

- **Toda região segue o mesmo template de 13 campos** (aparência, clima,
  atmosfera, monstros, fauna, vegetação, recursos, nível, dificuldade,
  loot, identidade visual, sensação, traço mecânico) sem exceção — o
  padrão estrutural mais consistente de toda a biblioteca, deveria ser
  preservado em qualquer região futura.
- **Assentamentos abaixo da Capital seguem uma fórmula de escassez
  deliberada:** um mercador especializado, nenhum Banco (exceto Porto
  Salgado), nenhuma Guilda própria (exceto o posto avançado de Porto
  Salgado) — o padrão comunica hierarquia de importância sem precisar
  dizer isso em texto.
- **NPCs regionais seguem consistentemente o arquétipo "veterano
  ferido/aposentado":** Guildmestre Verrik (perdeu o próprio grupo),
  Capitão Reyes (perdeu o navio), Guia Hilde (única sobrevivente), o
  Eremita das Colinas (deixou a Capital por discordância). NPCs da
  Capital (Ferreiro, Mercadora, Curador do Banco, Arauto) não seguem esse
  padrão — são definidos por competência/função, não por perda. Padrão
  emergente, não planejado, mas coerente o bastante para valer a pena
  nomear como convenção: **NPC de fora da Capital carrega uma perda; NPC
  da Capital carrega uma função.**
- **Todo evento/mecânica que existe em escala local tem, ou deveria ter,
  um "espelho" em escala global** — o padrão se confirma (Boss local vs.
  Invasão global cogitada; clima local vs. Estações globais) mas **quebra
  exatamente onde a duplicação da seção 3.1 acontece** — o padrão é bom,
  a execução dele nesses dois casos específicos não declarou a relação.
- **Toda descoberta de exploração é permanente por Kingdom, nunca por
  personagem** — aplicado sem exceção em `exploration.md`, reforçado em
  `npc-design.md` e `lore-ambiental.md`.
- **Toda "Nota de honestidade" de cada documento nomeia pelo menos uma
  hipótese não validada** — prática consistente que vale preservar como
  convenção permanente de qualquer documento de World Design futuro, Bible
  ou não.

---

## 7. Oportunidades

Não são pequenas correções — são mudanças capazes de aumentar a
qualidade/coerência de forma desproporcional ao esforço:

1. **Escrever, como um documento próprio (ainda rascunho, não Bible), a
   premissa "Kingdom = instância por canal do mesmo mundo compartilhado"**
   — hoje ela é a fundação de 3+ documentos e existe apenas como citação
   a uma conversa passada. É a peça de maior alavancagem possível: um
   documento pequeno resolveria a dependência mais repetida do mapa
   inteiro.
2. **Recuperar e escrever em arquivo o sistema de Build/Equipamento-com-
   comportamento** da Sprint de Gameplay anterior — sem ele, o traço
   mecânico de toda região em `regions.md` é uma promessa sem lastro
   escrito.
3. **Uma única "tabela de eventos por escala"** cruzando `random-events.md`
   e `world-events.md`, resolvendo de uma vez a duplicação Escassez/
   Colheita e o padrão "espelho local/global" da seção 6 — mais valioso
   que corrigir os dois nomes isoladamente.
4. **Definir Dungeon como estrutura própria** (não apenas "área
   escondida") — é a lacuna mais concretamente acionável da seção 5, e
   destrava conteúdo de médio prazo sem exigir Kingdoms ou Economia
   resolvidos primeiro.
5. **Uma passagem de lore-ambiental.md que conecte explicitamente ao
   Boss** — atualmente a peça narrativa mais madura da biblioteca não
   toca no sistema mais maduro da Bible; uma frase-âncora ligaria os
   dois sem exigir nenhuma decisão nova.

---

## 8. Documentos quase maduros (🟢)

- **`lore-ambiental.md`** — o único documento que não cria dependência
  mecânica nova nem contradiz nada; puramente narrativo, autocontido,
  risco mínimo de já estar desatualizado por decisões futuras de sistema.
  É o candidato mais forte a, um dia, alimentar diretamente um capítulo
  real da Bible (provavelmente dentro de Kingdoms ou um capítulo próprio
  de Lore) sem precisar esperar nenhum outro documento amadurecer antes.

---

## 9. Documentos experimentais (🔴)

- **`random-events.md`** — precisa da resolução da duplicação com
  `world-events.md` antes de qualquer promoção; nenhuma frequência/
  probabilidade calibrada (autoconfessado no próprio documento).
- **`world-events.md`** — o documento mais frágil da biblioteca: contém
  uma pergunta arquitetural não resolvida (primeiro evento de escopo
  Global com significado de jogo), uma sobreposição conceitual não
  resolvida (Invasão vs. Boss) e a metade da duplicação da seção 3.1.

### 🟡 Precisam de mais trabalho (os 7 restantes)

`regions.md`, `cities.md`, `roads.md`, `exploration.md`,
`environmental-mechanics.md`, `npc-design.md`, `future-expansion.md` — cada
um estruturalmente sólido, mas com pelo menos uma dependência externa não
resolvida (build/equipamento em `regions.md`/`environmental-mechanics.md`;
a contradição do funil em `roads.md`; mecânicas não definidas citadas por
NPCs em `npc-design.md`; dependência total de tudo mais em
`future-expansion.md`, que por natureza nunca deveria amadurecer antes das
peças de que depende).

---

## 10. Próximos passos recomendados

Em ordem de alavancagem, não de facilidade:

1. Resolver a duplicação Escassez/Colheita (seção 3.1) — menor esforço,
   remove a contradição mais concreta encontrada.
2. Escrever o documento de premissa "Kingdom = instância por canal" —
   maior alavancagem, destrava a legibilidade de metade da biblioteca
   para qualquer pessoa que não estava na conversa original.
3. Recuperar o sistema de Build/Equipamento da Sprint de Gameplay anterior
   como arquivo real — sem isso, `regions.md` continua sendo a fundação
   de um andar que não existe.
4. Declarar explicitamente a relação evento-local vs. mecânica-permanente
   nos três casos da seção 3.4 (Nevasca/Gelo, Maré, Tempestade/Corrupção).
5. Só depois disso — considerar qual documento (provavelmente
   `lore-ambiental.md` primeiro) está pronto para começar a migrar,
   gradualmente e bloco a bloco (mesmo processo já usado em Bosses), para
   um capítulo real da Bible.

Nenhum destes passos amplia o escopo do jogo — todos são consolidação do
que já foi escrito.
