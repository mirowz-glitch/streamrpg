import type { DropProfile } from "../worldregion/types.js";
import { listEnemyFactions } from "./factionRegistry.js";
import { getFactionBaseAffinity, getFactionSphereAffinity, getFactionGemAffinity, getFactionMaterialAffinity } from "./factionAffinity.js";

// Fase 2/6 — o `dropProfile` de cada EnemyFaction. Reaproveita
// literalmente o tipo `DropProfile` de `worldregion/types.ts` (Sprint
// 25) — nunca redefinido — só trocando a chave de agregação (bioma de
// região -> afinidade de facção). Mesmo contrato: "Nunca gera Item. Só
// define o perfil"; `rarityWeightMultipliers`/`goldMultiplier` ficam
// neutros (a tendência de ouro já vive em `FactionEconomyProfile`,
// nunca duplicada aqui).
function buildDropProfileForFaction(factionId: string): DropProfile {
  return {
    id: factionId,
    rarityWeightMultipliers: {},
    baseAffinity: getFactionBaseAffinity(factionId),
    sphereAffinity: getFactionSphereAffinity(factionId),
    gemAffinity: getFactionGemAffinity(factionId),
    materialTypes: getFactionMaterialAffinity(factionId),
    goldMultiplier: 1,
    enabled: true,
  };
}

export const FACTION_DROP_PROFILES: readonly DropProfile[] = listEnemyFactions().map((faction) => buildDropProfileForFaction(faction.id));

export function getFactionDropProfile(factionId: string): DropProfile | undefined {
  return FACTION_DROP_PROFILES.find((profile) => profile.id === factionId);
}

export function listFactionDropProfiles(): readonly DropProfile[] {
  return FACTION_DROP_PROFILES;
}
