// Sprint Kingdom Museum — infraestrutura do Museu do Reino, reutilizando
// a mesma arquitetura da Biblioteca/Bestiário (catálogo estático, sem
// backend, sem banco, sem escrita). Puramente apresentação: nenhum
// registro aqui é Lore definitiva — cada um é só um placeholder, pronto
// para receber texto real numa Sprint futura sem precisar mudar esta
// estrutura.
export type MuseumCategory =
  | "grandes-herois"
  | "grandes-bosses"
  | "grandes-descobertas"
  | "reliquias-historicas"
  | "primeiros-aventureiros"
  | "fundacao-do-reino"
  | "grandes-tragedias"
  | "grandes-conquistas"
  | "monumentos"
  | "misterios";

export interface MuseumCategoryDefinition {
  slug: MuseumCategory;
  label: string;
  icon: string;
}

// Etapa "Alas" — só a estrutura das 10 categorias, mesmo que hoje nem
// todas tenham um registro no catálogo ainda.
export const MUSEUM_CATEGORIES: MuseumCategoryDefinition[] = [
  { slug: "grandes-herois", label: "Grandes Heróis", icon: "🦸" },
  { slug: "grandes-bosses", label: "Grandes Bosses", icon: "🐲" },
  { slug: "grandes-descobertas", label: "Grandes Descobertas", icon: "🔎" },
  { slug: "reliquias-historicas", label: "Relíquias Históricas", icon: "🏺" },
  { slug: "primeiros-aventureiros", label: "Primeiros Aventureiros", icon: "🥇" },
  { slug: "fundacao-do-reino", label: "Fundação do Reino", icon: "🏰" },
  { slug: "grandes-tragedias", label: "Grandes Tragédias", icon: "🕯️" },
  { slug: "grandes-conquistas", label: "Grandes Conquistas", icon: "🏆" },
  { slug: "monumentos", label: "Monumentos", icon: "🗿" },
  { slug: "misterios", label: "Mistérios", icon: "🔮" },
];

// Etapa "Status" — só um estado aceito pela interface, igual à
// Biblioteca/Bestiário: nenhuma lógica de desbloqueio real ainda.
export type MuseumEntryStatus = "bloqueado" | "conhecido" | "registrado";

export const MUSEUM_STATUS_LABEL: Record<MuseumEntryStatus, string> = {
  bloqueado: "🔒 Bloqueado",
  conhecido: "📘 Conhecido",
  registrado: "✅ Registrado",
};

export interface MuseumEntry {
  id: string;
  title: string;
  category: MuseumCategory;
  description: string;
  // Markdown simples (mesmo `renderMarkdownLite` da Biblioteca): só
  // **negrito**, *itálico* e parágrafos. Nada além disso nesta Sprint.
  pages: string[];
  status: MuseumEntryStatus;
  locked: boolean;
  unlockCondition: string;
  icon: string;
  year: string;
  author: string;
}

const PLACEHOLDER_PAGES = [
  "**Este registro ainda está sendo compilado.**\n\nO Curador continua reunindo relatos e evidências antes de fechar a exposição.",
  "*Registro em desenvolvimento...*\n\nVolte ao Museu em outra ocasião.",
  "**Fim do registro conhecido.**\n\nO restante desta história ainda não foi documentado.",
];

// Etapa "Dados" — 5 registros, só texto placeholder, nenhuma Lore
// definitiva. Categorias/anos/status variados só para provar que os
// filtros funcionam.
export const MUSEUM_ENTRIES: MuseumEntry[] = [
  {
    id: "a-fundacao-do-reino",
    title: "A Fundação do Reino",
    category: "fundacao-do-reino",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "registrado",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🏰",
    year: "Ano 1 do Reino",
    author: "Curador Alaric",
  },
  {
    id: "o-primeiro-boss",
    title: "O Primeiro Boss",
    category: "grandes-bosses",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "conhecido",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🐲",
    year: "Ano 3 do Reino",
    author: "Curador Alaric",
  },
  {
    id: "a-ponte-antiga",
    title: "A Ponte Antiga",
    category: "monumentos",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "conhecido",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🗿",
    year: "Desconhecido",
    author: "Curador Alaric",
  },
  {
    id: "o-grande-incendio",
    title: "O Grande Incêndio",
    category: "grandes-tragedias",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "🕯️",
    year: "Desconhecido",
    author: "Curador Alaric",
  },
  {
    id: "o-explorador-desconhecido",
    title: "O Explorador Desconhecido",
    category: "primeiros-aventureiros",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "🥇",
    year: "Desconhecido",
    author: "Curador Alaric",
  },
];
