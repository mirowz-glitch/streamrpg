import { MAP_DEFINITIONS } from "./mapRegistry.js";
import type { MapEconomicProfile } from "./types.js";

// Fase 5 — Economia: "Cada mapa possui especialização econômica...
// Tudo infraestrutura." Um perfil por Mapa (9/9). Default neutro (1 em
// tudo); os 3 exemplos literais do brief ganham as tendências
// descritas na própria assinatura textual — nunca um número sem
// lastro:
// - Fortaleza (fortaleza-sombria): "Armaduras/Anéis" -> equipment;
//   "Esferas" -> sphere. Único mapa com 2 tendências elevadas — reflexo
//   real do brief citar 2 categorias distintas pra este mapa (diferente
//   da disciplina de "só 1" das Sprints 26/27, que tinham exemplos de 1
//   categoria só).
// - Floresta (bosque-sussurrante): "Botas/Arcos" -> equipment;
//   "Gemas" -> gem.
// - Pântano (pantano-podre): "Materiais" -> materials. "Venenos"/
//   "Craft" não têm categoria real correspondente (nenhuma das 5
//   tendências cobre "sistema de Craft") — omitido por honestidade,
//   nunca forçado numa categoria errada.
//
// Os 6 mapas restantes (sem exemplo literal) ficam totalmente neutros.
// Nenhum consumidor real (economy.service.ts/drop.service.ts/
// sphere.service.ts) lê nada disto ainda.
function neutralProfile(id: string): MapEconomicProfile {
  return { id, goldTendency: 1, materialsTendency: 1, sphereTendency: 1, gemTendency: 1, equipmentTendency: 1, enabled: true };
}

function buildProfile(mapId: string): MapEconomicProfile {
  const base = neutralProfile(mapId);
  if (mapId === "fortaleza-sombria") return { ...base, equipmentTendency: 1.5, sphereTendency: 1.5 };
  if (mapId === "bosque-sussurrante") return { ...base, equipmentTendency: 1.5, gemTendency: 1.5 };
  if (mapId === "pantano-podre") return { ...base, materialsTendency: 1.5 };
  return base;
}

export const MAP_ECONOMIC_PROFILES: readonly MapEconomicProfile[] = MAP_DEFINITIONS.map((map) => buildProfile(map.id));

export function getMapEconomicProfile(mapId: string): MapEconomicProfile | undefined {
  return MAP_ECONOMIC_PROFILES.find((profile) => profile.id === mapId);
}

export function listMapEconomicProfiles(): readonly MapEconomicProfile[] {
  return MAP_ECONOMIC_PROFILES;
}
