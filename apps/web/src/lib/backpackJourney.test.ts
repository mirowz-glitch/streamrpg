import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { HudState, PresentationEvent } from "@streamrpg/shared";
import { buildLastJourneySummary } from "./backpackJourney.js";

// Backpack Experience Phase I — Fase 3 ("Última Jornada"). Confirma:
// (a) sempre abre com a região atual, (b) conta itens da janela sem
// inventar detalhe, (c) só menciona raridade quando há algo acima de
// "common" (nunca "Um deles era Comum" — não é notável), (d) menciona
// o último item auto-equipado (correlação LootDropped+ItemEquipped do
// MESMO tick, igual a backpackFinds.ts), (e) fallback honesto quando
// não há loot nenhum na janela.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function event(tickIndex: number, fields: DistributiveOmit<PresentationEvent, "tickIndex" | "timestamp">): PresentationEvent {
  return { tickIndex, timestamp: tickIndex * 1000, ...fields };
}

function buildHudState(recentEvents: PresentationEvent[], regionName = "Bosque Sussurrante"): HudState {
  return {
    currentLife: 100,
    maximumLife: 100,
    region: { id: "bosque-sussurrante", name: regionName, recommendedLevelRange: { min: 1, max: 14 }, difficulty: "Baixa", biome: null },
    encounter: { state: "sem-encontro", enemiesTotal: 0, enemiesAlive: 0, enemiesDefeated: 0, variant: "normal", auraColor: null, auraIcon: null },
    recentLoot: null,
    recentEquip: null,
    lastDamageTaken: null,
    lastDamageDealt: null,
    sessionStatus: "explorando",
    elapsedTime: 0,
    statistics: {
      encountersCompleted: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      itemsFound: 0,
      itemsEquipped: 0,
      goldFound: 0,
      elapsedTime: 0,
    },
    recentEvents,
    xpProgress: { level: 1, xp: 0, xp_to_next: 100, percent: 0 },
    recentLevelUp: null,
    bestItemFound: null,
    newBestItemEvent: null,
    newDamageRecordEvent: null,
    sessionSummary: null,
    sessionHistory: { encountersCompleted: 0, encountersStarted: 0, survivalRate: 100, averageDps: 0, damagePerEncounter: 0, itemsPerEncounter: 0 },
    recentRecovery: null,
    currentObjective: { id: "obj-1", name: "Primeira Caçada", description: "Derrote 5 inimigos", progress: 0, target: 5, percent: 0 },
    recentObjectiveCompleted: null,
    recentRegionUnlock: null,
    recentEliteEncounter: null,
    recentMiniBossEncounter: null,
    recentEliteDefeated: null,
    recentMiniBossDefeated: null,
    recentWorldEvent: null,
    expedition: null,
    faction: null,
  };
}

describe("buildLastJourneySummary", () => {
  test("sempre abre com a região atual", () => {
    const lines = buildLastJourneySummary(buildHudState([], "Pântano Podre"));
    assert.equal(lines[0], "Você retornou de Pântano Podre.");
  });

  test("janela sem nenhum loot: fallback honesto, nunca inventa uma jornada com itens", () => {
    const lines = buildLastJourneySummary(buildHudState([]));
    assert.equal(lines.length, 2);
    assert.equal(lines[1], "Nenhum item novo ainda nesta jornada.");
  });

  test("conta o total de itens encontrados na janela", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "a", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
      event(2, { kind: "LootDropped", instanceId: "i2", baseItemId: "b", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
    ];
    const lines = buildLastJourneySummary(buildHudState(events));
    assert.ok(lines.includes("Encontrou 2 itens."));
  });

  test("não menciona raridade quando tudo encontrado foi comum", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "a", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
    ];
    const lines = buildLastJourneySummary(buildHudState(events));
    assert.ok(!lines.some((line) => line.startsWith("Um deles era")), "raridade comum não é notável, não deveria gerar frase");
  });

  test("menciona a MAIOR raridade encontrada na janela quando acima de comum", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "a", rarity: "magic", powerScore: 1, regionId: "r", stored: true }),
      event(2, { kind: "LootDropped", instanceId: "i2", baseItemId: "b", rarity: "unique", powerScore: 1, regionId: "r", stored: true }),
      event(3, { kind: "LootDropped", instanceId: "i3", baseItemId: "c", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
    ];
    const lines = buildLastJourneySummary(buildHudState(events));
    const rarityLine = lines.find((line) => line.startsWith("Um deles era"));
    assert.ok(rarityLine, "esperava uma linha de raridade");
    assert.match(rarityLine!, /Único/i);
  });

  test("menciona o item auto-equipado (mesmo tick de LootDropped+ItemEquipped)", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, regionId: "r", stored: true }),
      event(1, { kind: "ItemEquipped", slotId: "weapon", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, previousPowerScore: 3 }),
    ];
    const lines = buildLastJourneySummary(buildHudState(events));
    assert.ok(lines.some((line) => line.startsWith("Equipou automaticamente")));
  });

  test("um ItemEquipped de tick diferente do LootDropped não é mencionado como auto-equipado", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, regionId: "r", stored: true }),
      event(9, { kind: "ItemEquipped", slotId: "weapon", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, previousPowerScore: 3 }),
    ];
    const lines = buildLastJourneySummary(buildHudState(events));
    assert.ok(!lines.some((line) => line.startsWith("Equipou automaticamente")));
  });
});
