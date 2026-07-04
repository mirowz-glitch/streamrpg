// Sprint Bestiary System — infraestrutura do Bestiário, reutilizando a
// mesma arquitetura da Biblioteca (catálogo estático, sem backend, sem
// banco, sem escrita). Puramente apresentação: nenhuma criatura aqui é
// Lore definitiva — cada uma é só um placeholder, pronto para receber
// texto real numa Sprint futura sem precisar mudar esta estrutura.
import { REGIONS } from "./regions";

export type CreatureType =
  | "besta"
  | "morto-vivo"
  | "elemental"
  | "humanoide"
  | "dragao"
  | "espirito"
  | "aberracao"
  | "construto";

export interface CreatureTypeDefinition {
  slug: CreatureType;
  label: string;
  icon: string;
}

// Etapa "Categorias" — só a estrutura dos 8 tipos, mesmo que hoje nem
// todos tenham uma criatura no catálogo ainda.
export const CREATURE_TYPES: CreatureTypeDefinition[] = [
  { slug: "besta", label: "Besta", icon: "🐺" },
  { slug: "morto-vivo", label: "Morto-vivo", icon: "💀" },
  { slug: "elemental", label: "Elemental", icon: "🔥" },
  { slug: "humanoide", label: "Humanoide", icon: "🗡️" },
  { slug: "dragao", label: "Dragão", icon: "🐉" },
  { slug: "espirito", label: "Espírito", icon: "👻" },
  { slug: "aberracao", label: "Aberração", icon: "👁️" },
  { slug: "construto", label: "Constructo", icon: "⚙️" },
];

export type DangerLevel = "baixa" | "media" | "alta" | "letal";

export const DANGER_LABEL: Record<DangerLevel, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  letal: "Letal",
};

// Etapa "Locked / Seen / Studied" — só um estado aceito pela interface,
// igual à Biblioteca: nenhuma lógica de desbloqueio real ainda.
export type CreatureStatus = "bloqueado" | "visto" | "estudado";

export interface CreatureDefinition {
  id: string;
  name: string;
  type: CreatureType;
  habitat: string;
  regionId: string;
  dangerLevel: DangerLevel;
  icon: string;
  description: string;
  // Markdown simples (mesmo `renderMarkdownLite` da Biblioteca): só
  // **negrito**, *itálico* e parágrafos. Nada além disso nesta Sprint.
  pages: string[];
  locked: boolean;
  unlockCondition: string;
  status: CreatureStatus;
}

export function getRegionName(regionId: string): string {
  return REGIONS.find((region) => region.id === regionId)?.name ?? regionId;
}

const PLACEHOLDER_PAGES = [
  "**Esta criatura ainda está sendo estudada.**\n\nOs eruditos da Capital continuam reunindo relatos de quem a encontrou.",
  "*Registro em desenvolvimento...*\n\nVolte ao Bestiário em outra ocasião.",
  "**Fim do registro conhecido.**\n\nO restante do comportamento desta criatura ainda não foi documentado.",
];

// Etapa "Dados" — 5 criaturas, só texto placeholder, nenhuma Lore
// definitiva. Tipos/regiões/periculosidades variados só para provar que
// os filtros funcionam.
export const CREATURES: CreatureDefinition[] = [
  {
    id: "lobos-cinzentos",
    name: "Lobos Cinzentos",
    type: "besta",
    habitat: "Florestas densas e sombrias",
    regionId: "bosque-sussurrante",
    dangerLevel: "baixa",
    icon: "🐺",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "estudado",
  },
  {
    id: "espectros-da-neblina",
    name: "Espectros da Neblina",
    type: "espirito",
    habitat: "Pântanos e ruínas alagadas",
    regionId: "pantano-podre",
    dangerLevel: "media",
    icon: "👻",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "visto",
  },
  {
    id: "golens-de-pedra-antiga",
    name: "Golens de Pedra Antiga",
    type: "construto",
    habitat: "Galerias e minas abandonadas",
    regionId: "minas-abandonadas",
    dangerLevel: "alta",
    icon: "⚙️",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Disponível desde o início",
    status: "visto",
  },
  {
    id: "serpente-das-areias-de-vidro",
    name: "Serpente das Areias de Vidro",
    type: "aberracao",
    habitat: "Dunas vítreas e cegantes",
    regionId: "deserto-de-vidro",
    dangerLevel: "alta",
    icon: "👁️",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
  },
  {
    id: "o-sussurro-sem-nome",
    name: "O Sussurro Sem Nome",
    type: "aberracao",
    habitat: "Salões esquecidos da fortaleza",
    regionId: "fortaleza-sombria",
    dangerLevel: "letal",
    icon: "🔮",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
  },
];
