// Sprint Library System — infraestrutura da Biblioteca da Capital.
// Puramente estático (mesmo padrão de NPCS/REGIONS): nenhum dado vem do
// backend, nenhuma escrita, nenhuma sincronização. Esta Sprint não
// escreve Lore — os 5 livros abaixo são só placeholder ("Livro em
// desenvolvimento..."), prontos para receber conteúdo real numa Sprint
// futura sem precisar mudar esta estrutura.
export type BookCategory =
  | "historia"
  | "lendas"
  | "regioes"
  | "criaturas"
  | "personagens"
  | "religioes"
  | "cartas"
  | "diarios"
  | "reinos"
  | "misterios";

export interface BookCategoryDefinition {
  slug: BookCategory;
  label: string;
  icon: string;
}

// Etapa "Categorias" — só a estrutura das 10 categorias, mesmo que hoje
// nem todas tenham um livro no catálogo ainda.
export const BOOK_CATEGORIES: BookCategoryDefinition[] = [
  { slug: "historia", label: "História", icon: "📜" },
  { slug: "lendas", label: "Lendas", icon: "🐉" },
  { slug: "regioes", label: "Regiões", icon: "🗺️" },
  { slug: "criaturas", label: "Criaturas", icon: "🐾" },
  { slug: "personagens", label: "Personagens", icon: "🧑" },
  { slug: "religioes", label: "Religiões", icon: "⛩️" },
  { slug: "cartas", label: "Cartas", icon: "✉️" },
  { slug: "diarios", label: "Diários", icon: "📓" },
  { slug: "reinos", label: "Reinos", icon: "🏰" },
  { slug: "misterios", label: "Mistérios", icon: "🔮" },
];

// Etapa "Desbloqueio" — "Bloqueado/Conhecido/Lido" é só um estado aceito
// pela interface. Nenhuma lógica de desbloqueio real existe ainda (nem
// depende de XP/Identity/Kingdom Prestige) — cada livro só declara seu
// estado atual no catálogo, como um placeholder para quando essa lógica
// existir.
export type BookStatus = "bloqueado" | "conhecido" | "lido";

export interface BookDefinition {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  description: string;
  // Markdown simples: só **negrito**, *itálico* e parágrafos (\n\n).
  // Nada além disso nesta Sprint.
  pages: string[];
  locked: boolean;
  unlockCondition: string;
  status: BookStatus;
}

const PLACEHOLDER_PAGES = [
  "**Este livro ainda está sendo escrito.**\n\nEm breve, a história completa estará disponível para todos os aventureiros do Reino.",
  "*Livro em desenvolvimento...*\n\nVolte para a Biblioteca em outra ocasião.",
  "**Fim da amostra.**\n\nAs próximas páginas ainda não foram reveladas.",
];

// Etapa "Dados" — 5 livros, só texto placeholder, nenhuma Lore
// definitiva. Categorias variadas só para provar que o filtro funciona.
export const BOOKS: BookDefinition[] = [
  {
    id: "cronicas-do-primeiro-amanhecer",
    title: "Crônicas do Primeiro Amanhecer",
    author: "Autor desconhecido",
    category: "historia",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "lido",
  },
  {
    id: "lendas-do-bosque-sussurrante",
    title: "Lendas do Bosque Sussurrante",
    author: "Autor desconhecido",
    category: "lendas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "conhecido",
  },
  {
    id: "bestiario-das-terras-selvagens",
    title: "Bestiário das Terras Selvagens",
    author: "Autor desconhecido",
    category: "criaturas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "conhecido",
  },
  {
    id: "cartas-perdidas-de-um-aventureiro",
    title: "Cartas Perdidas de um Aventureiro",
    author: "Autor desconhecido",
    category: "cartas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
  },
  {
    id: "misterios-da-fortaleza-sombria",
    title: "Mistérios da Fortaleza Sombria",
    author: "Autor desconhecido",
    category: "misterios",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
  },

  // Sprint Wolves Ecosystem (Phase I) — primeiro livro do catálogo com
  // páginas reais (não PLACEHOLDER_PAGES), escrito por Yannick como
  // registro de campo sobre os Lobos do Bosque Sussurrante.
  {
    id: "tratado-da-matilha",
    title: "Tratado da Matilha",
    author: "Yannick, o Erudito",
    category: "criaturas",
    description: "Um registro de campo sobre os Lobos do Bosque Sussurrante — e o que os torna diferentes de qualquer outra besta do Reino.",
    pages: [
      "**Tratado da Matilha**\n\nDedico este registro a todo caçador que já confundiu um lobo comum com um Lobo Alfa — e viveu para admitir o erro.\n\nOs Lobos Cinzentos do Bosque Sussurrante não são uma criatura só. São uma estrutura inteira, com hierarquia, território e memória própria. Passei anos catalogando rastros antes de entender isso.",
      "**I. O Alfa**\n\nO Lobo Alfa lidera não pela força bruta, mas pela ausência dela — raramente precisa lutar, porque raramente alguém o desafia duas vezes. Seu uivo, dizem os caçadores, é mais grave e mais longo que o de qualquer outro membro da matilha, e é ouvido, na maioria das caçadas, uma única vez.\n\nBorin já comentou comigo que o couro de um Alfa é quase impossível de conseguir sem rasgos — o animal não se entrega fácil, nem depois de morto. A Presa do Alfa, quando encontrada, é tratada por caçadores experientes quase como uma relíquia — não pelo valor de venda, mas pelo que representa.",
      "**II. A Loba Prateada**\n\nAo lado do Alfa, uma segunda figura: uma loba de pelagem clara que caça sozinha, longe da matilha, sempre retornando antes do amanhecer. Não é subordinada — é, pelo que observei, uma parceira que escolheu operar de forma independente. Sua pelagem, mesmo curtida, mantém um brilho estranho sob luar.",
      "**III. Os Filhotes**\n\nUm filhote separado da matilha é um dos poucos lobos que se aproxima de humanos sem hostilidade. Um mercador me contou que um o seguiu por dois dias inteiros, sem nunca se aproximar o suficiente para ser tocado. Greta jura guardar uma presa de lobo há anos — provavelmente de um filhote, pelo tamanho que ela descreve.",
      "**IV. As Variantes Regionais**\n\nNem todo lobo do Reino é do Bosque. Nas Colinas Áridas, a escassez de presas força os lobos a caçar sozinhos — a terra ali não sustenta uma matilha inteira. No Pântano Podre, encontrei relatos de um lobo que atravessa água parada como se fosse chão firme. E nos Picos Congelados, caçadores juram que existe um lobo cujas presas parecem refletir a luz da lua, como gelo puro.",
      "**V. A Matilha Faminta**\n\nQuando a caça escasseia, a matilha muda de comportamento — cerca em silêncio absoluto, sem o uivo de aviso que normalmente precede um ataque. É o encontro mais perigoso de todos, precisamente porque não avisa.\n\nIdris jura já ter visto o mesmo lobo marcado em duas regiões diferentes, no mesmo dia. Não tenho como confirmar. Mas também não tenho como negar.",
      "**Nota final**\n\nHá uma noite, há anos, em que nenhum lobo uivou no Bosque Sussurrante inteiro. Ninguém soube dizer por quê. Continuo catalogando rastros, na esperança de que, um dia, essa página também tenha uma resposta.",
    ],
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "lido",
  },

  // Sprint Ravens Ecosystem (Phase I) — segundo livro do catálogo com
  // páginas reais, sobre os Corvos do Reino. Autor deliberadamente
  // desconhecido — o livro nunca confirma se os corvos entendem os
  // humanos, e não seria coerente atribuí-lo a um estudioso que afirma
  // ter certeza de algo.
  {
    id: "os-corvos-do-reino",
    title: "Os Corvos do Reino",
    author: "Autor desconhecido",
    category: "misterios",
    description: "Um registro incompleto sobre os corvos que observam o Reino de longe — sem nunca dizer se realmente entendem o que veem.",
    pages: [
      "**Os Corvos do Reino**\n\nNão sei quem começou este registro antes de mim. As primeiras páginas já estavam escritas quando cheguei a ele. Vou continuar do jeito que encontrei: sem conclusões, só observações.",
      "**I. Em Toda Parte**\n\nHá corvos em quase todas as regiões do Reino — perto de estradas, sobre expedições, entre ruínas, acima da neve. Ninguém os caça. Ninguém os alimenta. Eles simplesmente estão lá, como parte da paisagem, não como parte da caça.",
      "**II. O Corvo das Ruínas**\n\nNas Ruínas Esquecidas, um corvo foi visto dias inteiros sobre a mesma lápide vazia, sem se mover. Perguntei ao Curador do Museu o que ele achava disso. Ele preferiu não responder.",
      "**III. O Corvo das Montanhas**\n\nExploradores dos Picos Congelados contam sobre bandos que os seguem até o topo de uma escalada inteira, sem nunca pousar. Uma pena recolhida lá em cima nunca murchou, mesmo anos depois.",
      "**IV. O Corvo do Bosque**\n\nHá quem diga que os corvos sabem, antes de qualquer caçador, onde uma matilha de lobos vai atacar — e que somem por completo pouco antes do ataque acontecer. Um caçador jura que os corvos somem primeiro justamente quando é o Lobo Alfa quem lidera a caçada. Não encontrei uma única testemunha disposta a jurar isso com certeza total.",
      "**V. O Corvo Mensageiro**\n\nUm viajante experiente me contou que confiou uma mensagem de verdade a um corvo, uma única vez, e que ela chegou. Não tentou de novo. Quando perguntei por quê, só disse: 'Não quis testar a sorte duas vezes.'",
      "**VI. O Corvo Ancião**\n\nHá relatos, espalhados por anos e regiões diferentes, do mesmo corvo — sempre sozinho, sempre observando o mesmo aventureiro à distância. Não há como confirmar se é o mesmo animal. Também não há como negar.",
      "**VII. A Pergunta que Ninguém Responde**\n\nOs corvos entendem o que dizemos? Alguns juram que sim. Outros riem da pergunta. Não encontrei nada, em anos reunindo estes relatos, que resolvesse isso de um jeito ou de outro — e talvez seja assim mesmo que deva ficar.",
      "**Nota final**\n\nSe alguém continuar este registro depois de mim, peço só uma coisa: não force uma resposta que os corvos nunca quiseram dar.",
    ],
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "conhecido",
  },

  // Sprint Ancient Ruins Ecosystem (Phase I) — terceiro livro do
  // catálogo com páginas reais. Diário de um explorador anônimo:
  // observa, registra, nunca conclui.
  {
    id: "as-ruinas-esquecidas-do-reino",
    title: "As Ruínas Esquecidas do Reino",
    author: "Um Explorador Anônimo",
    category: "diarios",
    description: "O diário de um explorador que percorreu doze sítios de ruínas espalhados pelo Reino — sem nunca concluir o que encontrou.",
    pages: [
      "**As Ruínas Esquecidas do Reino**\n\nComecei este diário sem saber quantas ruínas encontraria. Termino sem saber quantas ainda existem. Isso, sozinho, já deveria bastar como aviso a quem ler o que vem a seguir.",
      "**I. A Coluna Partida do Horizonte**\n\nNa Planície Dourada, encontrei uma única coluna de pé — o resto, nada. Nenhuma fundação, nenhum entulho, nenhuma outra pedra que indicasse ter havido algo maior ali. A sombra dela, registrei três vezes, nunca apontou pro sol. Não sei o que fazer com essa informação. Só sei que é verdade.",
      "**II. O Portão Sem Muro**\n\nAtravessei o Portão Sem Muro, nas Colinas Áridas, mais vezes do que consigo contar. Do outro lado, sempre o mesmo lugar de onde saí. Não registrei diferença nenhuma, em nenhuma tentativa.",
      "**III. A Escadaria que Termina na Pedra**\n\nNas Minas Abandonadas, encontrei degraus que sobem e terminam numa parede sólida. Um mineiro me garantiu ter ouvido passos do outro lado. Não ouvi nada, nas três noites que passei ali. Isso não significa que ele estava errado.",
      "**IV. A Estátua Sem Rosto**\n\nNas Ruínas Esquecidas propriamente ditas, uma estátua ajoelhada, com todo detalhe possível — exceto o rosto, completamente liso. Tentei imaginar uma explicação. Desisti antes de terminar de imaginar.",
      "**V. O Poço Completamente Seco**\n\nNo Deserto de Vidro, um poço fundo demais. Joguei uma pedra. O som do impacto chegou tarde demais para o que a física deveria permitir. Joguei outra pedra, só para verificar. O resultado foi o mesmo.",
      "**VI. Os Símbolos do Penhasco**\n\nNos Picos Congelados, uma parede inteira de símbolos que nenhum estudioso reconheceu. Fiz um esboço na primeira visita. Na segunda, o esboço não batia mais com a parede. Não sei dizer se os símbolos mudaram ou se fui eu quem desenhou errado da primeira vez.",
      "**VII. O Acampamento Antigo**\n\nNo Bosque Sussurrante, círculos de fogueira apagados todos ao mesmo tempo, a julgar pelas marcas. Um grupo inteiro parece ter desaparecido numa única noite. Não há corpos. Não há rastro de saída. Só o acampamento, intacto, esperando por gente que não voltou.",
      "**VIII. A Máscara Enterrada**\n\nNo Pântano Podre, uma máscara de pedra, meio submersa na lama. Voltei três anos depois de registrá-la pela primeira vez. Estava exatamente na mesma posição, nem um centímetro mais afundada.",
      "**IX. A Torre Sem Entrada**\n\nNo Litoral Quebrado, uma torre alta demais para ter sido erguida sem andaimes — e nenhuma porta, nenhuma janela, em lugar nenhum. Dei três voltas completas ao redor dela. Não encontrei sequer uma rachadura.",
      "**X. A Arena Afundada e o Portal da Fronteira**\n\nNas Colinas Áridas, uma arena de arquibancadas de pedra, funda demais para o solo ao redor. Na Fortaleza Sombria, dois blocos erguidos e um terceiro caído — que nenhum grupo, por mais forte, conseguiu mover um centímetro. Registro os dois juntos porque, de algum jeito que não sei explicar, parecem pertencer à mesma história.",
      "**XI. A Câmara das Vozes**\n\nDe volta às Ruínas Esquecidas: uma câmara circular, acústica impossivelmente perfeita. Gritei o mesmo nome duas vezes. Os ecos que voltaram não foram iguais.",
      "**Nota final**\n\nDoze sítios. Doze mistérios sem resposta. Não escrevo este diário para explicar as Ruínas do Reino — não tenho essa capacidade, e duvido que alguém tenha. Escrevo só para registrar que estive lá, vi o que vi, e saí com mais perguntas do que entrei.",
    ],
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "conhecido",
  },

  // Sprint Kingdom Folk (Phase I) — quarto livro do catálogo com
  // páginas reais. Narrado por um velho viajante, sobre a gente comum
  // que sustenta o Reino sem nunca aparecer numa crônica de herói.
  {
    id: "a-vida-no-reino",
    title: "A Vida no Reino",
    author: "Um Velho Viajante",
    category: "personagens",
    description: "Um relato sobre o povo comum do Reino — lenhadores, pescadores, oleiros, pastores — contado por quem passou a vida inteira de passagem por suas vilas.",
    pages: [
      "**A Vida no Reino**\n\nAndei estrada afora tempo demais pra contar as crônicas dos grandes feitos. Prefiro contar o que vi de verdade: gente comum, vivendo vidas comuns, sustentando um Reino que raramente repara nelas.",
      "**I. Quem Corta e Quem Queima**\n\nNo Bosque Sussurrante, conheci um lenhador que conta os anéis de cada árvore antes de derrubar, como se pedisse licença. Perto dali, um carvoeiro vigia o forno por noites inteiras, sem dormir, com o mesmo cuidado de quem cuida de um filho doente.",
      "**II. Quem Tira do Rio e da Terra**\n\nUma pescadora do Litoral Quebrado me contou sobre um peixe grande que já devolveu três vezes. Um lavrador da Planície Dourada reza pra chuva na mesma data, todo ano, desde que herdou a terra do pai. Nenhum dos dois pediria uma canção sobre isso. Escrevo mesmo assim.",
      "**III. Quem Constrói**\n\nUm pedreiro guarda a primeira pedra que assentou sozinho numa prateleira em casa. Uma carpinteira construiu a própria casa do alicerce ao telhado, sozinha, sem esperar ajuda de ninguém. O Reino tem mais fundação nas mãos dessas pessoas do que em qualquer trono.",
      "**IV. Quem Cura e Quem Acompanha**\n\nUma curandeira nunca cobrou remédio de criança. Uma parteira nunca errou a data de um parto, em toda a carreira. Não sei se são exagero ou verdade. Sei que contam essas histórias com o mesmo orgulho de qualquer herói que já ouvi crônica sobre.",
      "**V. Quem Viaja Sem Nunca Ser Lembrado**\n\nUma mensageira jura nunca ter se perdido em vinte anos de estrada. Um guia de caravana conhece o Reino inteiro de cor, sem precisar de mapa. Andei ao lado de gente assim mais vezes do que ao lado de qualquer nome que vira lenda.",
      "**VI. Quem Sustenta a Noite**\n\nUm guarda-noturno não dorme direito nem nas folgas. Um sineiro criou, sozinho, um jeito diferente de tocar o sino pra cada aviso, e a vila inteira já reconhece sem precisar perguntar. Ninguém escreve música sobre eles. Deveria.",
      "**VII. Quem Faz Rir e Quem Faz Lembrar**\n\nUm palhaço de feira guarda como conquista a única vez que fez o Guarda Roth soltar uma risada. Um contador de histórias ambulante nunca repete a mesma história do mesmo jeito duas vezes — talvez porque, pra ele, cada plateia mereça uma versão só sua.",
      "**VIII. Quem Começa com Quase Nada**\n\nQuase todo aventureiro que já cruzei estrada começou do mesmo jeito: um par de luvas rasgadas, encontradas ou herdadas, e nenhuma certeza do que vinha depois. Ouvi um ferreiro dizer que já viu gente lutar pior equipada — e gente morrer melhor equipada. Nunca soube se isso era conforto ou aviso. Talvez as duas coisas, ao mesmo tempo.",
      "**IX. Os Pequenos Marcos que Todo Mundo Conhece**\n\nNinguém escreve crônica sobre a Fonte da praça, mas todo morador sabe onde fica, e a maioria já bebeu dela pelo menos uma vez. O mesmo vale pro barril vazio encostado num canto, pra árvore velha que ninguém lembra de ter plantado, pro poço da Vila do Bosque que ninguém mede o fundo, e pro Sino da Torre, cujo toque todo mundo reconhece sem nunca ter aprendido formalmente o que cada badalada significa. Esses lugares não têm crônica. Têm rotina — e talvez seja isso que os torne permanentes.",
      "**X. O que Sustenta o Peso Todo Dia**\n\nA Primeira Ponte e a Torre do Portão Norte são as duas obras mais antigas que ainda sustentam o peso de gente atravessando, todos os dias, sem parar pra pensar em quem construiu ou por quê. Um carroceiro me disse que confia mais na Ponte do que em qualquer decreto real. Um guarda me disse, sobre a Torre, que ela 'não precisa de ninguém, só continua de pé'. Talvez seja esse o segredo das duas: continuar de pé, dia após dia, sem exigir reconhecimento por isso.",
      "**Nota final**\n\nNão escrevi este livro por nenhum deles ter feito algo extraordinário, no sentido que as crônicas costumam exigir. Escrevi porque, juntos, sustentam tudo que faz o Reino parecer um lugar de verdade — e isso, pra mim, sempre foi extraordinário o bastante.",
    ],
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "conhecido",
  },
];
