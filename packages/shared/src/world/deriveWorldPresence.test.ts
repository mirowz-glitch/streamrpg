import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { deriveWorldPresence } from "./deriveWorldPresence.js";

// World Autonomy Phase II (Vision 2.0, Sprint 9) — determinístico: `now`
// é sempre passado explicitamente, nunca lido do relógio real (mesmo
// padrão de derivePresence.test.ts). Nenhum cenário aqui depende de
// Twitch/canal/live/viewer — só o relógio real e regiões ativas.
describe("deriveWorldPresence", () => {
  const regions = ["bosque-sussurrante", "pantano-podre", "picos-congelados"];

  test("dayCount cresce com o tempo, nunca reinicia por restart do servidor", () => {
    const day1 = deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 3), activeRegionIds: [], allRegionIds: regions });
    const day2 = deriveWorldPresence({ now: Date.UTC(2026, 0, 2, 3), activeRegionIds: [], allRegionIds: regions });
    assert.equal(day1.dayCount, 1);
    assert.equal(day2.dayCount, 2);
  });

  test("timeOfDay deriva da hora UTC real", () => {
    assert.equal(deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 3), activeRegionIds: [], allRegionIds: regions }).timeOfDay, "madrugada");
    assert.equal(deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 9), activeRegionIds: [], allRegionIds: regions }).timeOfDay, "manha");
    assert.equal(deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 15), activeRegionIds: [], allRegionIds: regions }).timeOfDay, "tarde");
    assert.equal(deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 21), activeRegionIds: [], allRegionIds: regions }).timeOfDay, "noite");
  });

  test("região com Jogador presente -> active, resto -> dormant", () => {
    const world = deriveWorldPresence({
      now: Date.UTC(2026, 0, 1, 12),
      activeRegionIds: ["pantano-podre"],
      allRegionIds: regions,
    });
    assert.equal(world.regionActivity["pantano-podre"], "active");
    assert.equal(world.regionActivity["bosque-sussurrante"], "dormant");
    assert.equal(world.regionActivity["picos-congelados"], "dormant");
  });

  test("nenhuma região ativa -> todas dormant (mundo continua existindo sem ninguém online)", () => {
    const world = deriveWorldPresence({ now: Date.UTC(2026, 0, 1, 12), activeRegionIds: [], allRegionIds: regions });
    for (const regionId of regions) {
      assert.equal(world.regionActivity[regionId], "dormant");
    }
  });

  test("clima é determinístico: mesma entrada produz sempre a mesma saída", () => {
    const now = Date.UTC(2026, 0, 5, 10);
    const first = deriveWorldPresence({ now, activeRegionIds: [], allRegionIds: regions });
    const second = deriveWorldPresence({ now, activeRegionIds: [], allRegionIds: regions });
    assert.deepEqual(first.weatherByRegion, second.weatherByRegion);
  });

  test("clima é estável dentro do mesmo dia, mesmo com now diferente", () => {
    const morning = deriveWorldPresence({ now: Date.UTC(2026, 0, 5, 1), activeRegionIds: [], allRegionIds: regions });
    const night = deriveWorldPresence({ now: Date.UTC(2026, 0, 5, 23), activeRegionIds: [], allRegionIds: regions });
    assert.deepEqual(morning.weatherByRegion, night.weatherByRegion);
  });

  test("clima muda entre dias diferentes para pelo menos uma região (não travado num valor fixo)", () => {
    const day1 = deriveWorldPresence({ now: Date.UTC(2026, 0, 1), activeRegionIds: [], allRegionIds: regions });
    const day2 = deriveWorldPresence({ now: Date.UTC(2026, 1, 1), activeRegionIds: [], allRegionIds: regions });
    const changed = regions.some((regionId) => day1.weatherByRegion[regionId] !== day2.weatherByRegion[regionId]);
    assert.ok(changed);
  });

  test("nunca depende de Twitch/canal/live — a assinatura da função não aceita esses campos", () => {
    const world = deriveWorldPresence({ now: Date.now(), activeRegionIds: [], allRegionIds: regions });
    assert.ok(["madrugada", "manha", "tarde", "noite"].includes(world.timeOfDay));
  });
});
