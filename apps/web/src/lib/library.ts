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
];
