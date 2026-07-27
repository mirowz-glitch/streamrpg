import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { PresentationEvent } from "@streamrpg/shared";
import { buildAdventureDiaryEntries } from "./adventureDiary.js";

// Living World Phase II — Fase 3/4: confirma que o diário (a) filtra
// eventos puramente técnicos, (b) classifica cada entrada na
// prioridade certa (alta/média/normal, lista literal do brief), (c)
// agrega combates comuns consecutivos numa única linha ("eventos
// repetitivos não devem dominar a tela"), (d) mantém ordem "mais
// recente primeiro", (e) respeita o limite pedido, (f) reusa a mesma
// formatação de EventFeed pra tudo que não foi reescrito.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function event(tickIndex: number, fields: DistributiveOmit<PresentationEvent, "tickIndex" | "timestamp">): PresentationEvent {
  return { tickIndex, timestamp: tickIndex * 1000, ...fields };
}

describe("buildAdventureDiaryEntries", () => {
  test("filtra eventos técnicos (AttackStarted/AttackHit/CriticalHit/Miss) — nunca aparecem no diário", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "AttackStarted", enemyCount: 1 }),
      event(1, { kind: "AttackHit", damageDealt: 10, damageTaken: 2 }),
      event(1, { kind: "CriticalHit" }),
      event(1, { kind: "Miss" }),
    ];
    assert.deepEqual(buildAdventureDiaryEntries(events), []);
  });

  test("EncounterFinished com 0 abates não é digno de diário (ex.: evento de mundo sem combate)", () => {
    const events: PresentationEvent[] = [event(1, { kind: "EncounterFinished", enemiesKilled: 0 })];
    assert.deepEqual(buildAdventureDiaryEntries(events), []);
  });

  test("um único EncounterFinished com abates vira uma linha 'normal', sem o texto de agregação", () => {
    const events: PresentationEvent[] = [event(1, { kind: "EncounterFinished", enemiesKilled: 2 })];
    const entries = buildAdventureDiaryEntries(events);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].priority, "normal");
    assert.match(entries[0].text, /Derrotou 2 inimigos\./);
    assert.doesNotMatch(entries[0].text, /combates recentes/);
  });

  test("Fase 4 — combates comuns consecutivos são agregados numa única linha ('eventos repetitivos não devem dominar a tela')", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "EncounterFinished", enemiesKilled: 1 }),
      event(2, { kind: "EncounterFinished", enemiesKilled: 2 }),
      event(3, { kind: "EncounterFinished", enemiesKilled: 1 }),
    ];
    const entries = buildAdventureDiaryEntries(events);
    assert.equal(entries.length, 1, "3 encontros consecutivos devem virar 1 única linha agregada");
    assert.equal(entries[0].priority, "normal");
    assert.match(entries[0].text, /Derrotou 4 inimigos em 3 combates recentes\./);
  });

  test("um evento de prioridade alta no meio de uma sequência de combates quebra a agregação em dois grupos", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "EncounterFinished", enemiesKilled: 1 }),
      event(2, { kind: "EncounterFinished", enemiesKilled: 1 }),
      event(3, { kind: "LevelUp", level: 5, previousLevel: 4 }),
      event(4, { kind: "EncounterFinished", enemiesKilled: 3 }),
    ];
    const entries = buildAdventureDiaryEntries(events);
    // Mais recente primeiro: [combate isolado (tick 4), level up (tick 3), combate agregado (ticks 1-2)]
    assert.equal(entries.length, 3);
    assert.match(entries[0].text, /Derrotou 3 inimigos\./);
    assert.equal(entries[0].priority, "normal");
    assert.match(entries[1].text, /Nível 5/);
    assert.equal(entries[1].priority, "alta");
    assert.match(entries[2].text, /Derrotou 2 inimigos em 2 combates recentes\./);
  });

  test("Fase 4 — classificação de prioridade: Boss/Mini-Boss/Dungeon/Novo Equipamento/Checkpoint/Level Up/Região = alta; loot raro/Elite/Expedição/Evento de Mundo = média; combate comum/loot comum = normal", () => {
    const cases: [PresentationEvent, "alta" | "media" | "normal"][] = [
      [event(1, { kind: "FinalBossDefeated", enemyTemplateId: "boss1", enemyName: "Rei Sombrio", xpAmount: 100, goldAmount: 50 }), "alta"],
      [event(1, { kind: "MiniBossDefeated", enemyTemplateId: "mb1", enemyName: "Bruxa", xpBonus: 50 }), "alta"],
      [
        event(1, { kind: "DungeonCompleted", expeditionId: "e1", name: "Fortaleza", bossName: "Rei Sombrio", encountersCompleted: 20, xpAmount: 100, goldAmount: 50 }),
        "alta",
      ],
      [event(1, { kind: "ItemEquipped", slotId: "weapon", baseItemId: "sword", rarity: "rare", powerScore: 10, previousPowerScore: 5 }), "alta"],
      [event(1, { kind: "ExpeditionCheckpointReached", expeditionId: "e1", checkpointIndex: 1, checkpointsTotal: 3, recoveryAmount: 5 }), "alta"],
      [event(1, { kind: "LevelUp", level: 2, previousLevel: 1 }), "alta"],
      [event(1, { kind: "RegionUnlocked", previousRegionId: "a", newRegionId: "b" }), "alta"],
      [event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "x", rarity: "rare", powerScore: 5, regionId: "r", stored: true }), "media"],
      [event(1, { kind: "LootDropped", instanceId: "i2", baseItemId: "x", rarity: "unique", powerScore: 5, regionId: "r", stored: true }), "media"],
      [event(1, { kind: "EliteDefeated", enemyTemplateId: "e1", enemyName: "Lobo", xpBonus: 10 }), "media"],
      [event(1, { kind: "ExpeditionStarted", expeditionId: "e1", name: "Bosque", regionId: "r" }), "media"],
      [event(1, { kind: "WorldEventStarted", explorationEventId: "we1", name: "Carroça", category: "treasure", regionId: "r" }), "media"],
      [event(1, { kind: "LootDropped", instanceId: "i3", baseItemId: "x", rarity: "common", powerScore: 5, regionId: "r", stored: true }), "normal"],
      [event(1, { kind: "LootDropped", instanceId: "i4", baseItemId: "x", rarity: "magic", powerScore: 5, regionId: "r", stored: true }), "normal"],
    ];
    for (const [singleEvent, expectedPriority] of cases) {
      const entries = buildAdventureDiaryEntries([singleEvent]);
      assert.equal(entries.length, 1, `esperava 1 entrada pra kind=${singleEvent.kind}`);
      assert.equal(entries[0].priority, expectedPriority, `esperava prioridade '${expectedPriority}' pra kind=${singleEvent.kind}`);
    }
  });

  test("ordem é mais recente primeiro", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LevelUp", level: 2, previousLevel: 1 }),
      event(2, { kind: "LevelUp", level: 3, previousLevel: 2 }),
    ];
    const entries = buildAdventureDiaryEntries(events);
    assert.match(entries[0].text, /Nível 3/);
    assert.match(entries[1].text, /Nível 2/);
  });

  test("respeita o limite pedido — 'pequena seção', nunca a timeline inteira", () => {
    const events: PresentationEvent[] = Array.from({ length: 10 }, (_, i) => event(i, { kind: "LevelUp", level: i + 1, previousLevel: i }));
    const entries = buildAdventureDiaryEntries(events, 3);
    assert.equal(entries.length, 3);
    assert.match(entries[0].text, /Nível 10/);
    assert.match(entries[1].text, /Nível 9/);
    assert.match(entries[2].text, /Nível 8/);
  });

  test("lista vazia quando não há nenhum evento digno de diário", () => {
    assert.deepEqual(buildAdventureDiaryEntries([]), []);
  });

  test("ExpeditionCheckpointReached usa a frase reescrita (Fase 1: a versão com fração X/Y e +N HP lia como log técnico)", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "ExpeditionCheckpointReached", expeditionId: "e1", checkpointIndex: 2, checkpointsTotal: 5, recoveryAmount: 10 }),
    ];
    const entries = buildAdventureDiaryEntries(events);
    assert.equal(entries[0].text, "Chegou a um novo checkpoint da jornada.");
  });
});
