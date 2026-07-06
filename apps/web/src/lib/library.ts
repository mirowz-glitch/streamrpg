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
      "**I. O Alfa**\n\nO Lobo Alfa lidera não pela força bruta, mas pela ausência dela — raramente precisa lutar, porque raramente alguém o desafia duas vezes. Seu uivo, dizem os caçadores, é mais grave e mais longo que o de qualquer outro membro da matilha, e é ouvido, na maioria das caçadas, uma única vez.\n\nBorin já comentou comigo que o couro de um Alfa é quase impossível de conseguir sem rasgos — o animal não se entrega fácil, nem depois de morto.",
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
];
