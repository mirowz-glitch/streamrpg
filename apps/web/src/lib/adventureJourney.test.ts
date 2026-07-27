import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { HudState, PresentationEvent } from "@streamrpg/shared";
import { buildJourneySummary } from "./adventureJourney.js";

// Living World Phase II — Fase 2 ("Jornada Atual"): confirma que o
// resumo (a) sempre abre com a região atual, (b) agrega abates da
// janela recente numa única frase (nunca uma por encontro), (c) só
// menciona o melhor item da janela, (d) menciona Boss/Mini-Boss/Level
// Up/Checkpoint quando presentes na janela, (e) nunca inventa uma
// frase sobre algo que não está em `recentEvents`, (f) tem um
// fallback honesto quando a janela está vazia.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function event(tickIndex: number, fields: DistributiveOmit<PresentationEvent, "tickIndex" | "timestamp">): PresentationEvent {
  return { tickIndex, timestamp: tickIndex * 1000, ...fields };
}

function buildHudState(recentEvents: PresentationEvent[], regionName = "Bosque Sussurrante"): HudState {
  const base: HudState = {
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
  return base;
}

describe("buildJourneySummary", () => {
  test("janela vazia: só a frase de abertura + o fallback tranquilo, nunca inventa atividade", () => {
    const lines = buildJourneySummary(buildHudState([], "Bosque Sussurrante"));
    assert.equal(lines.length, 2);
    assert.equal(lines[0], "Sua jornada continua em Bosque Sussurrante.");
    assert.match(lines[1], /tranquila/);
  });

  test("agrega abates de múltiplos EncounterFinished numa única frase, nunca uma por encontro", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "EncounterFinished", enemiesKilled: 2 }),
      event(2, { kind: "EncounterFinished", enemiesKilled: 4 }),
    ];
    const lines = buildJourneySummary(buildHudState(events));
    const killLines = lines.filter((line) => line.includes("Derrotou") && line.includes("inimigos"));
    assert.equal(killLines.length, 1, "esperava uma única frase agregada de abates, não uma por encontro");
    assert.equal(killLines[0], "Derrotou 6 inimigos.");
  });

  test("menciona o melhor item da janela (maior powerScore), não todos os itens encontrados", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "iron-sword", rarity: "common", powerScore: 5, regionId: "r", stored: true }),
      event(2, { kind: "LootDropped", instanceId: "i2", baseItemId: "iron-sword", rarity: "rare", powerScore: 40, regionId: "r", stored: true }),
    ];
    const lines = buildJourneySummary(buildHudState(events));
    const lootLines = lines.filter((line) => line.startsWith("Encontrou"));
    assert.equal(lootLines.length, 1, "esperava uma única menção de loot, a do maior powerScore");
  });

  test("menciona Chefe Final derrotado quando presente na janela", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "FinalBossDefeated", enemyTemplateId: "b1", enemyName: "Rei Sombrio", xpAmount: 100, goldAmount: 50 }),
    ];
    const lines = buildJourneySummary(buildHudState(events));
    assert.ok(lines.some((line) => line === "Derrotou o Chefe Rei Sombrio!"));
  });

  test("Chefe Final tem prioridade sobre Mini-Boss quando ambos aparecem na janela", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "MiniBossDefeated", enemyTemplateId: "mb1", enemyName: "Bruxa", xpBonus: 50 }),
      event(2, { kind: "FinalBossDefeated", enemyTemplateId: "b1", enemyName: "Rei Sombrio", xpAmount: 100, goldAmount: 50 }),
    ];
    const lines = buildJourneySummary(buildHudState(events));
    assert.ok(lines.some((line) => line.includes("Chefe Rei Sombrio")));
    assert.ok(!lines.some((line) => line.includes("Mini-Boss")), "não deveria mencionar o Mini-Boss quando o Chefe Final também está na janela");
  });

  test("menciona Level Up quando presente na janela", () => {
    const events: PresentationEvent[] = [event(1, { kind: "LevelUp", level: 7, previousLevel: 6 })];
    const lines = buildJourneySummary(buildHudState(events));
    assert.ok(lines.some((line) => line === "Alcançou o nível 7."));
  });

  test("menciona checkpoint quando presente na janela, sem expor a fração X/Y", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "ExpeditionCheckpointReached", expeditionId: "e1", checkpointIndex: 3, checkpointsTotal: 10, recoveryAmount: 8 }),
    ];
    const lines = buildJourneySummary(buildHudState(events));
    assert.ok(lines.some((line) => line === "Chegou a um novo checkpoint da expedição."));
  });

  test("sempre abre com a região atual", () => {
    const lines = buildJourneySummary(buildHudState([], "Pântano Podre"));
    assert.equal(lines[0], "Sua jornada continua em Pântano Podre.");
  });
});
