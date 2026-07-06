// Sprint Living NPCs (MVP) — tipos compartilhados do catálogo de falas.
// Puro conteúdo estático: nenhuma IA, nenhuma chamada externa, nenhuma
// mecânica. Cada NPC (lib/npcs.ts) ganha seu próprio catálogo, dividido
// pelas mesmas 20 categorias — fácil de expandir categoria por
// categoria, ou NPC por NPC, sem mexer nos outros arquivos.
export type NpcDialogueCategory =
  | "boas_vindas"
  | "primeiro_encontro"
  | "novato"
  | "veterano"
  | "nivel_alto"
  | "boss_derrotado"
  | "sem_gold"
  | "muito_gold"
  | "chovendo" // futuro — sem sistema de clima ainda, só conteúdo pronto
  | "noite" // futuro — sem sistema de dia/noite ainda, só conteúdo pronto
  | "primeira_visita"
  | "visitas_repetidas"
  | "aleatorias"
  | "humor"
  | "conselhos"
  | "fofocas"
  | "comentarios_reino"
  | "comentarios_npcs"
  | "raras"
  | "extremamente_raras";

export const NPC_DIALOGUE_CATEGORIES: NpcDialogueCategory[] = [
  "boas_vindas",
  "primeiro_encontro",
  "novato",
  "veterano",
  "nivel_alto",
  "boss_derrotado",
  "sem_gold",
  "muito_gold",
  "chovendo",
  "noite",
  "primeira_visita",
  "visitas_repetidas",
  "aleatorias",
  "humor",
  "conselhos",
  "fofocas",
  "comentarios_reino",
  "comentarios_npcs",
  "raras",
  "extremamente_raras",
];

// 5 falas por categoria × 20 categorias = 100 falas por NPC.
export type NpcDialogueCatalog = Record<NpcDialogueCategory, string[]>;
