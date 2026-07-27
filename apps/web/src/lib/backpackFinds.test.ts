import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { PresentationEvent } from "@streamrpg/shared";
import { buildRecentFinds } from "./backpackFinds.js";

// Backpack Experience Phase I — Fase 2 ("Encontrados Recentemente").
// Confirma que (a) só LootDropped vira um "find", (b) a raridade/nome/
// região vêm 1:1 do próprio evento (nunca inventados), (c)
// autoEquipped só é true quando existe um ItemEquipped do MESMO
// tickIndex e baseItemId (nunca um "equipado alguma hora depois"), (d)
// ordem mais-recente-primeiro, (e) respeita o limite.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

function event(tickIndex: number, fields: DistributiveOmit<PresentationEvent, "tickIndex" | "timestamp">): PresentationEvent {
  return { tickIndex, timestamp: tickIndex * 1000, ...fields };
}

describe("buildRecentFinds", () => {
  test("um LootDropped simples vira um find, sem autoEquipped", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "wolf-fang-dagger", rarity: "rare", powerScore: 10, regionId: "bosque-sussurrante", stored: true }),
    ];
    const finds = buildRecentFinds(events);
    assert.equal(finds.length, 1);
    assert.equal(finds[0].instanceId, "i1");
    assert.equal(finds[0].rarity, "rare");
    assert.equal(finds[0].autoEquipped, false);
    assert.equal(finds[0].timestamp, 1000);
  });

  test("resolve o nome da região via getRegionName (nunca o regionId cru)", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "x", rarity: "common", powerScore: 1, regionId: "bosque-sussurrante", stored: true }),
    ];
    const finds = buildRecentFinds(events);
    assert.notEqual(finds[0].regionName, "bosque-sussurrante", "deveria resolver o nome de exibição, não o id cru");
  });

  test("autoEquipped só é true com um ItemEquipped do MESMO tick e MESMO baseItemId", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, regionId: "r", stored: true }),
      event(1, { kind: "ItemEquipped", slotId: "weapon", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, previousPowerScore: 3 }),
    ];
    const finds = buildRecentFinds(events);
    assert.equal(finds[0].autoEquipped, true);
  });

  test("um ItemEquipped de tick DIFERENTE (equipado manualmente depois) não conta como autoEquipped", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, regionId: "r", stored: true }),
      event(5, { kind: "ItemEquipped", slotId: "weapon", baseItemId: "iron-sword", rarity: "magic", powerScore: 8, previousPowerScore: 3 }),
    ];
    const finds = buildRecentFinds(events);
    assert.equal(finds[0].autoEquipped, false, "equipar em outro tick não é a mesma coisa que auto-equipar na hora do drop");
  });

  test("ordem é mais recente primeiro", () => {
    const events: PresentationEvent[] = [
      event(1, { kind: "LootDropped", instanceId: "i1", baseItemId: "a", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
      event(2, { kind: "LootDropped", instanceId: "i2", baseItemId: "b", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
    ];
    const finds = buildRecentFinds(events);
    assert.equal(finds[0].instanceId, "i2");
    assert.equal(finds[1].instanceId, "i1");
  });

  test("respeita o limite pedido", () => {
    const events: PresentationEvent[] = Array.from({ length: 10 }, (_, i) =>
      event(i, { kind: "LootDropped", instanceId: `i${i}`, baseItemId: "x", rarity: "common", powerScore: 1, regionId: "r", stored: true }),
    );
    const finds = buildRecentFinds(events, 3);
    assert.equal(finds.length, 3);
    assert.equal(finds[0].instanceId, "i9");
  });

  test("eventos que não são LootDropped nunca viram um find", () => {
    const events: PresentationEvent[] = [event(1, { kind: "LevelUp", level: 2, previousLevel: 1 })];
    assert.deepEqual(buildRecentFinds(events), []);
  });

  test("lista vazia quando não há nenhum LootDropped na janela", () => {
    assert.deepEqual(buildRecentFinds([]), []);
  });
});
