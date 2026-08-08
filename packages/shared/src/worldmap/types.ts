import type { BiomeTypeId } from "../worldregion/types.js";

// Endgame Map System Phase I (Sprint 30) — requisito arquitetural do
// brief: "Mapa -> Região -> Biome -> Monster Pool -> Loot", uma camada
// NOVA por CIMA de `WorldRegion` (Sprint 25) — nunca a substitui.
// Pipeline oficial completo: "Mapa -> Região -> Biome -> Enemy Pool ->
// Monster Loot Signature -> Monster Loot Table -> Loot Generator ->
// Item Generator" — os últimos 4 elos já são reais desde a Sprint 29;
// esta Sprint só acrescenta os 3 primeiros, ainda sem nenhuma
// integração ("Nenhum mapa influencia gameplay ainda. Infraestrutura
// apenas.").
//
// ACHADO DA AUDITORIA (Fase 1): `EnemyTemplate.region` (enemy/
// templates.ts, campo real desde a Sprint original do Enemy System) já
// amarra cada um dos 22 Enemy Templates a exatamente UMA região real,
// sem sobreposição — o "Monster Pool" de um Mapa (Fase 4) é, por
// construção, sempre DERIVADO desse campo real, nunca uma lista
// digitada à mão (risco de ficar dessincronizada). `getEncounterTable
// (regionId).levelRange` (worldencounter/encounterTables.ts, Sprint
// original do World Encounter) já fornece o nível mínimo/máximo real de
// cada região — `MapDefinition.minimumLevel`/`maximumLevel` são sempre
// essa mesma faixa, nunca um número novo.
export interface MapDefinition {
  id: string;
  name: string;
  regionId: string;
  biome: BiomeTypeId;
  minimumLevel: number;
  maximumLevel: number;
  enemyPool: string[];
  dangerLevel: number;
  economyTier: number;
  enabled: boolean;
}

// Fase 5 — Economia: vocabulário DELIBERADAMENTE idêntico ao já usado
// por `FactionEconomyProfile` (Sprint 26) e `MonsterEconomicProfile`
// (Sprint 27) — Gold/Material/Sphere/Gem/Equipment, nunca uma quarta
// nomenclatura pro mesmo conceito de tendência de recurso. Tipo próprio
// (nunca um alias direto) porque este é escopado por MAPA, a
// granularidade mais alta de todas — pode legitimamente combinar mais
// de uma tendência elevada ao mesmo tempo (ex.: Fortaleza favorece
// Equipment E Sphere), diferente da disciplina de "só 1" usada nas
// Sprints 26/27 pra Facção/Monstro — um Mapa é, por definição, a soma
// de várias identidades de Facção/Monstro que ele contém.
export interface MapEconomicProfile {
  id: string;
  goldTendency: number;
  materialsTendency: number;
  sphereTendency: number;
  gemTendency: number;
  equipmentTendency: number;
  enabled: boolean;
}
