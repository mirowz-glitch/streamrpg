// Sprint Living NPCs (MVP) — agrega o catálogo de falas de cada NPC sob
// a mesma chave já usada em lib/npcs.ts (NPCS), para que qualquer
// componente possa buscar `NPC_DIALOGUE[npc.key]` sem precisar conhecer
// os arquivos individuais.
import type { NpcDialogueCatalog } from "./types";
import { BORIN_DIALOGUE } from "./borin";
import { TALIA_DIALOGUE } from "./talia";
import { ZOLTAR_DIALOGUE } from "./zoltar";
import { ELENYA_DIALOGUE } from "./elenya";
import { DORWIN_DIALOGUE } from "./dorwin";
import { KADE_DIALOGUE } from "./kade";
import { ROTH_DIALOGUE } from "./roth";
import { GRETA_DIALOGUE } from "./greta";
import { MIRIAM_DIALOGUE } from "./miriam";
import { YANNICK_DIALOGUE } from "./yannick";
import { ALARIC_DIALOGUE } from "./alaric";
import { IDRIS_DIALOGUE } from "./idris";

export const NPC_DIALOGUE: Record<string, NpcDialogueCatalog> = {
  ferreiro: BORIN_DIALOGUE,
  mercador: TALIA_DIALOGUE,
  alquimista: ZOLTAR_DIALOGUE,
  guildmaster: ELENYA_DIALOGUE,
  tesoureiro: DORWIN_DIALOGUE,
  mestreArena: KADE_DIALOGUE,
  guarda: ROTH_DIALOGUE,
  taverneira: GRETA_DIALOGUE,
  bibliotecaria: MIRIAM_DIALOGUE,
  erudito: YANNICK_DIALOGUE,
  curador: ALARIC_DIALOGUE,
  // Sprint Wolves Ecosystem (Phase I) — catálogo parcial (só "fofocas").
  viajante: IDRIS_DIALOGUE,
};

export * from "./types";
export * from "./recognition";
export * from "./foreshadowing";
export * from "./livingConsequences";
export * from "./heroJourney";
export * from "./livingConversations";

// Achata todas as categorias de um NPC num único pool — usado para
// sortear "uma fala qualquer" sem se preocupar com estado do jogador
// (nível, Gold, visitas) ainda não conectado a nenhuma categoria nesta
// Sprint (puramente aditivo: nenhuma mecânica nova).
export function flattenDialogue(catalog: NpcDialogueCatalog): string[] {
  return Object.values(catalog).flat();
}

export function randomLine(catalog: NpcDialogueCatalog): string {
  const all = flattenDialogue(catalog);
  return all[Math.floor(Math.random() * all.length)];
}
