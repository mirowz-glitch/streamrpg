import type { FactionEconomyProfile } from "./types.js";

// Fase 5 — Faction Economy. Os 5 exemplos literais do brief (Goblins->
// ouro, Mortos-Vivos->materiais, Cultistas->Esferas, Império->
// equipamentos, Bestas->gemas), peso 1.5 (mesma convenção de afinidade
// "moderada" já usada em `worldregion/baseAffinity.ts` pros 10 Base
// Items sem exemplo literal do brief). As 5 facções restantes
// (Bandidos/Orcs/Demônios/Humanos/Mercenários) ficam com todas as
// tendências neutras (1) — "apenas infraestrutura, nenhum
// balanceamento" também vale pra NÃO inventar tendência sem exemplo no
// brief. Nenhum consumidor real (economy.service.ts/drop.service.ts/
// sphere.service.ts/salvage.service.ts) lê nada disto ainda.
function neutralProfile(id: string): FactionEconomyProfile {
  return { id, goldTendency: 1, materialsTendency: 1, sphereTendency: 1, gemTendency: 1, equipmentTendency: 1, enabled: true };
}

export const FACTION_ECONOMY_PROFILES: readonly FactionEconomyProfile[] = [
  { ...neutralProfile("goblins"), goldTendency: 1.5 },
  { ...neutralProfile("mortos-vivos"), materialsTendency: 1.5 },
  { ...neutralProfile("cultistas"), sphereTendency: 1.5 },
  neutralProfile("bandidos"),
  neutralProfile("orcs"),
  neutralProfile("demonios"),
  { ...neutralProfile("bestas"), gemTendency: 1.5 },
  neutralProfile("humanos"),
  { ...neutralProfile("imperio"), equipmentTendency: 1.5 },
  neutralProfile("mercenarios"),
] as const;

export function getFactionEconomyProfile(id: string): FactionEconomyProfile | undefined {
  return FACTION_ECONOMY_PROFILES.find((profile) => profile.id === id);
}

export function listFactionEconomyProfiles(): readonly FactionEconomyProfile[] {
  return FACTION_ECONOMY_PROFILES;
}
