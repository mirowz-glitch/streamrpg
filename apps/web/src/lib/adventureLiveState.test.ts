import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { HudState } from "@streamrpg/shared";
import {
  adventureLiveStatusLabel,
  deriveAdventureLiveStatus,
  formatNextTickCountdown,
  formatRelativeTime,
  isAdventureLiveStatusActive,
} from "./adventureLiveState.js";

// Living Character Phase I — testes puros do "ladder" de prioridade que
// decide "o que meu aventureiro está fazendo agora?" (Fase 2). Um
// HudState completo e válido (nunca um cast/`as HudState` parcial) —
// só os campos relevantes pra cada teste mudam via `overrides`, o
// resto fica em valores neutros/realistas. Nenhum destes testes monta
// React — a mesma função pura que o componente chama.
function buildHudState(overrides: Partial<HudState> = {}): HudState {
  const base: HudState = {
    currentLife: 100,
    maximumLife: 100,
    region: { id: "bosque-sussurrante", name: "Bosque Sussurrante", recommendedLevelRange: { min: 1, max: 14 }, difficulty: "Baixa", biome: null },
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
    recentEvents: [],
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
  return { ...base, ...overrides };
}

describe("deriveAdventureLiveStatus — ladder de prioridade (Fase 2)", () => {
  test("!ready sempre vence qualquer outro campo — 'carregando'", () => {
    const hudState = buildHudState({ sessionStatus: "em-combate" });
    assert.equal(deriveAdventureLiveStatus(false, hudState, "running"), "carregando");
  });

  test("sessionStatus 'derrota' vence mesmo com idleStatus 'running' — 'derrotado'", () => {
    const hudState = buildHudState({ sessionStatus: "derrota" });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "derrotado");
  });

  test("idleStatus 'paused' vence combate/dungeon (mas não derrota) — 'pausado'", () => {
    const hudState = buildHudState({
      sessionStatus: "em-combate",
      expedition: {
        expeditionId: "e1",
        name: "Fortaleza Sombria",
        description: "",
        difficulty: "Alta",
        percent: 10,
        checkpointsReached: 0,
        checkpointsTotal: 3,
        encountersCompleted: 0,
        expectedEncounters: 10,
        elitesDefeated: 0,
        miniBossesDefeated: 0,
        worldEventsFound: 0,
        finalBoss: { bossName: "Senhor das Sombras", encountered: true, defeated: false, healthPercent: 50 },
        activeModifiers: [],
        rewardBonusPercent: 0,
        worldTier: null,
      },
    });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "paused"), "pausado");
  });

  test("chefe encontrado e não derrotado vence 'combatendo' genérico — 'lutando-chefe'", () => {
    const hudState = buildHudState({
      sessionStatus: "em-combate",
      expedition: {
        expeditionId: "e1",
        name: "Fortaleza Sombria",
        description: "",
        difficulty: "Alta",
        percent: 90,
        checkpointsReached: 3,
        checkpointsTotal: 3,
        encountersCompleted: 9,
        expectedEncounters: 10,
        elitesDefeated: 1,
        miniBossesDefeated: 0,
        worldEventsFound: 0,
        finalBoss: { bossName: "Senhor das Sombras", encountered: true, defeated: false, healthPercent: 40 },
        activeModifiers: [],
        rewardBonusPercent: 0,
        worldTier: null,
      },
    });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "lutando-chefe");
  });

  test("em combate normal (sem chefe encontrado) — 'combatendo'", () => {
    const hudState = buildHudState({ sessionStatus: "em-combate" });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "combatendo");
  });

  test("dentro de uma expedição com chefe já derrotado, fora de combate — 'dungeon'", () => {
    const hudState = buildHudState({
      sessionStatus: "explorando",
      expedition: {
        expeditionId: "e1",
        name: "Fortaleza Sombria",
        description: "",
        difficulty: "Alta",
        percent: 100,
        checkpointsReached: 3,
        checkpointsTotal: 3,
        encountersCompleted: 10,
        expectedEncounters: 10,
        elitesDefeated: 1,
        miniBossesDefeated: 0,
        worldEventsFound: 0,
        finalBoss: { bossName: "Senhor das Sombras", encountered: true, defeated: true, healthPercent: 0 },
        activeModifiers: [],
        rewardBonusPercent: 0,
        worldTier: null,
      },
    });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "dungeon");
  });

  test("expedição sem chefe final (não é dungeon) e explorando — 'explorando', nunca 'dungeon'", () => {
    const hudState = buildHudState({
      sessionStatus: "explorando",
      expedition: {
        expeditionId: "e2",
        name: "Bosque Antigo",
        description: "",
        difficulty: "Baixa",
        percent: 50,
        checkpointsReached: 1,
        checkpointsTotal: 3,
        encountersCompleted: 5,
        expectedEncounters: 10,
        elitesDefeated: 0,
        miniBossesDefeated: 0,
        worldEventsFound: 0,
        finalBoss: null,
        activeModifiers: [],
        rewardBonusPercent: 0,
        worldTier: null,
      },
    });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "explorando");
  });

  test("nenhuma expedição ativa, sem combate — 'explorando' (padrão)", () => {
    const hudState = buildHudState({ sessionStatus: "explorando", expedition: null });
    assert.equal(deriveAdventureLiveStatus(true, hudState, "running"), "explorando");
  });
});

describe("adventureLiveStatusLabel", () => {
  test("cobre todos os 7 estados do ladder com um rótulo não-vazio", () => {
    const statuses = ["carregando", "derrotado", "pausado", "lutando-chefe", "combatendo", "dungeon", "explorando"] as const;
    for (const status of statuses) {
      assert.ok(adventureLiveStatusLabel(status).length > 0, `esperava rótulo pra '${status}'`);
    }
  });
});

describe("isAdventureLiveStatusActive", () => {
  test("explorando/combatendo/dungeon/lutando-chefe contam como 'ativo' (driver de fato avançando)", () => {
    assert.equal(isAdventureLiveStatusActive("explorando"), true);
    assert.equal(isAdventureLiveStatusActive("combatendo"), true);
    assert.equal(isAdventureLiveStatusActive("dungeon"), true);
    assert.equal(isAdventureLiveStatusActive("lutando-chefe"), true);
  });

  test("carregando/pausado/derrotado nunca contam como 'ativo'", () => {
    assert.equal(isAdventureLiveStatusActive("carregando"), false);
    assert.equal(isAdventureLiveStatusActive("pausado"), false);
    assert.equal(isAdventureLiveStatusActive("derrotado"), false);
  });
});

describe("formatRelativeTime", () => {
  test("menos de 5s — 'agora'", () => {
    assert.equal(formatRelativeTime(1_000, 1_000), "agora");
    assert.equal(formatRelativeTime(1_000, 5_999), "agora");
  });

  test("entre 5s e 60s — 'há poucos segundos'", () => {
    assert.equal(formatRelativeTime(0, 5_000), "há poucos segundos");
    assert.equal(formatRelativeTime(0, 59_000), "há poucos segundos");
  });

  test("entre 60s e 120s — 'há 1 minuto'", () => {
    assert.equal(formatRelativeTime(0, 60_000), "há 1 minuto");
    assert.equal(formatRelativeTime(0, 119_000), "há 1 minuto");
  });

  test("entre 120s e 300s — 'há alguns minutos'", () => {
    assert.equal(formatRelativeTime(0, 120_000), "há alguns minutos");
    assert.equal(formatRelativeTime(0, 299_000), "há alguns minutos");
  });

  test("300s ou mais — 'recentemente'", () => {
    assert.equal(formatRelativeTime(0, 300_000), "recentemente");
    assert.equal(formatRelativeTime(0, 1_000_000), "recentemente");
  });

  test("nunca fica negativo mesmo se 'now' vier antes do timestamp (relógio inconsistente)", () => {
    assert.equal(formatRelativeTime(10_000, 1_000), "agora");
  });
});

describe("formatNextTickCountdown", () => {
  test("null (pausado/parado) devolve null — nunca um '0s' enganoso", () => {
    assert.equal(formatNextTickCountdown(null), null);
  });

  test("abaixo de 1000ms devolve texto de 'menos de 1s'", () => {
    assert.equal(formatNextTickCountdown(0), "menos de 1s");
    assert.equal(formatNextTickCountdown(999), "menos de 1s");
  });

  test("1000ms ou mais arredonda pra cima em segundos inteiros", () => {
    assert.equal(formatNextTickCountdown(1000), "~1s");
    assert.equal(formatNextTickCountdown(1001), "~2s");
    assert.equal(formatNextTickCountdown(2500), "~3s");
  });
});
