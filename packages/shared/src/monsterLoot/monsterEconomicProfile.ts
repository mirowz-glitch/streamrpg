import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import type { MonsterEconomicProfile } from "./types.js";

// Fase 5 — Economic Profile: "Cada monstro possui: Gold, Material,
// Equipment, Sphere, Gem. Todos apenas como tendência. Nenhum
// balanceamento." Um perfil por Enemy Template real (22/22). Default
// neutro (1 em tudo); os 5 exemplos literais da Fase 4 (Loot Signature)
// ganham UMA tendência elevada cada, lida diretamente da assinatura
// textual do brief — nunca um número sem lastro:
// - Lobo (wolf/wolf-alpha/frost-wolf): "gemas verdes" -> gemTendency.
// - Esqueleto (skeleton/forgotten-guardian): "espadas/escudos/
//   armaduras" -> equipmentTendency.
// - Cultista (swamp-witch/corrupted-acolyte/corrupted-bishop/
//   fire-cultist): "esferas" -> sphereTendency.
// - Aranha (spider): "materiais" -> materialsTendency.
// - Cavaleiro Negro (dark-knight/boss): "armaduras/espadas" ->
//   equipmentTendency.
//
// Nota honesta: o perfil por MONSTRO pode divergir do perfil da sua
// FACÇÃO (Sprint 26) — ex.: Esqueleto (equipmentTendency) diverge de
// Mortos-Vivos (materialsTendency). Isso é esperado e é o próprio
// motivo desta Sprint existir: "nem todo monstro de uma facção é
// idêntico". Nenhum consumidor real (economy.service.ts/
// drop.service.ts/sphere.service.ts) lê nada disto ainda.
function neutralProfile(id: string): MonsterEconomicProfile {
  return { id, goldTendency: 1, materialsTendency: 1, sphereTendency: 1, gemTendency: 1, equipmentTendency: 1, enabled: true };
}

const GEM_LEANING = new Set(["wolf", "wolf-alpha", "frost-wolf"]);
const EQUIPMENT_LEANING = new Set(["skeleton", "forgotten-guardian", "dark-knight", "boss"]);
const SPHERE_LEANING = new Set(["swamp-witch", "corrupted-acolyte", "corrupted-bishop", "fire-cultist"]);
const MATERIAL_LEANING = new Set(["spider"]);

function buildProfile(templateId: string): MonsterEconomicProfile {
  const base = neutralProfile(templateId);
  if (GEM_LEANING.has(templateId)) return { ...base, gemTendency: 1.5 };
  if (EQUIPMENT_LEANING.has(templateId)) return { ...base, equipmentTendency: 1.5 };
  if (SPHERE_LEANING.has(templateId)) return { ...base, sphereTendency: 1.5 };
  if (MATERIAL_LEANING.has(templateId)) return { ...base, materialsTendency: 1.5 };
  return base;
}

export const MONSTER_ECONOMIC_PROFILES: readonly MonsterEconomicProfile[] = ENEMY_TEMPLATES.map((template) => buildProfile(template.id));

export function getMonsterEconomicProfile(enemyTemplateId: string): MonsterEconomicProfile | undefined {
  return MONSTER_ECONOMIC_PROFILES.find((profile) => profile.id === enemyTemplateId);
}

export function listMonsterEconomicProfiles(): readonly MonsterEconomicProfile[] {
  return MONSTER_ECONOMIC_PROFILES;
}
