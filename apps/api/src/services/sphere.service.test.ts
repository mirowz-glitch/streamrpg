/**
 * Testes do Sprint 12 — Crafting Phase I (Sphere System). Substitui os
 * testes do Sprint 11 (só Maldição real, as outras 4 recusavam com
 * "sphere-not-implemented") — agora as 5 têm efeito real, e toda
 * aplicação exige posse real (`character_spheres`, nunca mais
 * "qualquer um pode usar"). Mesma ressalva de ambiente já documentada
 * em drop.service.test.ts.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import type { ItemAffix } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot } from "./drop.service.js";
import { applySphereToItem, getSphereQuantity, getSphereInventory, grantSphereForTesting, grantSphereDrop } from "./sphere.service.js";
import { getActivityFeed } from "./activityFeed.service.js";
import { getNotifications } from "./notifications.service.js";
import { SQLiteChronicleRepository } from "../infrastructure/SQLiteChronicleRepository.js";
import { recordMythicDiscoveryIfFirst, deriveItemMythicOrigin } from "./mythicDiscovery.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-sphere-test-${RUN_ID}`;
const CHARACTER_ID = `char-sphere-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-sphere-test-${RUN_ID}`,
    "SphereTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Sphere Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
  db.prepare(`DELETE FROM character_spheres WHERE character_id = ?`).run(CHARACTER_ID);
});

const SAMPLE_PREFIX: ItemAffix = { modId: "prefix_cruel", type: "prefix", group: "physical_damage", name: "Cruel", statLabel: "Physical Damage", tags: ["damage", "physical"], tier: 1, value: 50 };

// "sword" (itemgen/baseItems.ts) tem tags físicas reais — usado como
// baseItemId pra Esfera da Ascensão poder achar afixos elegíveis de
// verdade (findEligibleNewMods depende de um Base Item real).
function grantTestItem(withAffix = true) {
  return grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: "sword",
    name: "Item de Teste pra Esfera",
    rarity: "rare",
    slot: "weapon",
    powerScore: 12,
    itemLevel: 60,
    seed: 12345,
    prefixes: withAffix ? [SAMPLE_PREFIX] : [],
    suffixes: [],
  });
}

describe("sphere.service — posse (Sprint 12: nenhuma Esfera é gratuita)", () => {
  test("rejeita aplicar uma Esfera que o personagem não possui", () => {
    const item = grantTestItem();
    const result = applySphereToItem(CHARACTER_ID, item.id, "curse");
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "sphere-not-owned");
  });

  test("grantSphereForTesting soma quantidade, aplicar consome exatamente 1", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 3);
    assert.equal(getSphereQuantity(CHARACTER_ID, "curse"), 3);

    const item = grantTestItem();
    applySphereToItem(CHARACTER_ID, item.id, "curse");

    assert.equal(getSphereQuantity(CHARACTER_ID, "curse"), 2);
  });

  test("getSphereInventory só lista Esferas com quantidade > 0", () => {
    grantSphereForTesting(CHARACTER_ID, "lapidation", 1);
    const inventory = getSphereInventory(CHARACTER_ID);
    assert.ok(inventory.some((stack) => stack.sphereId === "lapidation" && stack.quantity >= 1));
  });
});

describe("sphere.service — Esfera da Fortuna", () => {
  test("reroleta o valor do afixo existente, sem apagar histórico nem mudar prefixo/tier", () => {
    grantSphereForTesting(CHARACTER_ID, "fortune", 1);
    const item = grantTestItem(true);

    const result = applySphereToItem(CHARACTER_ID, item.id, "fortune");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.item.affixes.length, 1);
    assert.equal(result.item.affixes[0]!.modId, SAMPLE_PREFIX.modId);
    assert.equal(result.item.affixes[0]!.tier, SAMPLE_PREFIX.tier);
    assert.ok(result.item.history);
    assert.equal(result.item.history!.events.length, 2);
    assert.equal(result.item.history!.events[1]!.event, "sphere_applied");
  });

  test("rejeita um item sem nenhum afixo (nada pra rerolar)", () => {
    grantSphereForTesting(CHARACTER_ID, "fortune", 1);
    const item = grantTestItem(false);

    const result = applySphereToItem(CHARACTER_ID, item.id, "fortune");

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "no-affix-to-reroll");
    // não possuía o afixo -> a Esfera também não deveria ter sido consumida
    assert.equal(getSphereQuantity(CHARACTER_ID, "fortune"), 1);
  });
});

describe("sphere.service — Esfera da Purificação", () => {
  test("remove o único afixo, item continua íntegro (0 afixos é válido)", () => {
    grantSphereForTesting(CHARACTER_ID, "purification", 1);
    const item = grantTestItem(true);

    const result = applySphereToItem(CHARACTER_ID, item.id, "purification");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.item.affixes.length, 0);
  });

  test("rejeita um item já sem afixos", () => {
    grantSphereForTesting(CHARACTER_ID, "purification", 1);
    const item = grantTestItem(false);

    const result = applySphereToItem(CHARACTER_ID, item.id, "purification");

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "no-affix-to-remove");
  });
});

describe("sphere.service — Esfera da Ascensão", () => {
  test("adiciona 1 afixo elegível novo a um item 'sword' vazio", () => {
    grantSphereForTesting(CHARACTER_ID, "ascension", 1);
    const item = grantTestItem(false);

    const result = applySphereToItem(CHARACTER_ID, item.id, "ascension");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.item.affixes.length, 1);
  });
});

describe("sphere.service — Esfera da Lapidação", () => {
  test("aumenta Quality.value, nunca toca afixos/potential", () => {
    grantSphereForTesting(CHARACTER_ID, "lapidation", 1);
    const item = grantTestItem(true);

    const result = applySphereToItem(CHARACTER_ID, item.id, "lapidation");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(result.item.quality.value > 0);
    assert.equal(result.item.affixes.length, 1);
    assert.equal(result.item.affixes[0]!.modId, SAMPLE_PREFIX.modId);
  });
});

describe("sphere.service — Esfera da Maldição", () => {
  test("sela um item 'open', gravando craft_state 'sealed' no banco", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 1);
    const item = grantTestItem();

    const result = applySphereToItem(CHARACTER_ID, item.id, "curse");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.item.craft_state, "sealed");

    const row = getDb().prepare(`SELECT craft_state FROM items WHERE id = ?`).get(item.item_id) as { craft_state: string };
    assert.equal(row.craft_state, "sealed");
  });

  test("anexa um evento 'sealed' ao histórico, sem apagar o 'created'", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 1);
    const item = grantTestItem();

    applySphereToItem(CHARACTER_ID, item.id, "curse");

    const row = getDb().prepare(`SELECT history FROM items WHERE id = ?`).get(item.item_id) as { history: string };
    const history = JSON.parse(row.history) as { events: { event: string }[] };
    assert.equal(history.events.length, 2);
    assert.equal(history.events[0]!.event, "created");
    assert.equal(history.events[1]!.event, "sealed");
  });

  test("depois de selado: nenhuma outra Esfera funciona, mesmo possuindo-a", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 1);
    grantSphereForTesting(CHARACTER_ID, "fortune", 1);
    const fortuneBefore = getSphereQuantity(CHARACTER_ID, "fortune");
    const item = grantTestItem(true);
    applySphereToItem(CHARACTER_ID, item.id, "curse");

    const result = applySphereToItem(CHARACTER_ID, item.id, "fortune");

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-sealed");
    // a Esfera não é gasta numa tentativa recusada
    assert.equal(getSphereQuantity(CHARACTER_ID, "fortune"), fortuneBefore);
  });

  test("aplicar a Maldição duas vezes falha na segunda (já está selado)", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 2);
    const item = grantTestItem();
    applySphereToItem(CHARACTER_ID, item.id, "curse");

    const second = applySphereToItem(CHARACTER_ID, item.id, "curse");

    assert.equal(second.success, false);
    if (second.success) return;
    assert.equal(second.reason, "item-sealed");
  });
});

describe("sphere.service — item inexistente", () => {
  test("rejeita aplicar uma Esfera a um character_item_id que não existe", () => {
    grantSphereForTesting(CHARACTER_ID, "curse", 1);
    const result = applySphereToItem(CHARACTER_ID, 999_999_999, "curse");
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");
  });
});

// Sprint 13 — Sphere Economy Phase I, Fase 7/8: grantSphereDrop() é o
// caminho REAL de persistência de uma Esfera encontrada em Adventure/
// Dungeon/Boss/World Boss — distinto de grantSphereForTesting() (Sprint
// 12, QA-only, nunca chamado pelo fluxo real de drop).
describe("sphere.service — grantSphereDrop (Sprint 13: distribuição real)", () => {
  test("soma quantidade em character_spheres (UPSERT), nunca cria uma segunda linha", async () => {
    const before = getSphereQuantity(CHARACTER_ID, "fortune");
    await grantSphereDrop(CHARACTER_ID, "fortune", "adventure");
    await grantSphereDrop(CHARACTER_ID, "fortune", "adventure");
    assert.equal(getSphereQuantity(CHARACTER_ID, "fortune"), before + 2);
  });

  test("Esfera comum (fortune) nunca vira notícia — nenhuma entrada nova no Activity Feed", async () => {
    const feedBefore = getActivityFeed().length;
    await grantSphereDrop(CHARACTER_ID, "fortune", "dungeon");
    assert.equal(getActivityFeed().length, feedBefore);
  });

  test("Esfera rara (curse, very_rare) vira notícia: Activity Feed anônimo + Notification personalizada + Crônica", async () => {
    const feedBefore = getActivityFeed().length;
    await grantSphereDrop(CHARACTER_ID, "curse", "world_boss");

    const feed = getActivityFeed();
    assert.equal(feed.length, feedBefore + 1);
    assert.ok(feed[0]!.text.includes("Esfera da Maldição"));
    // Convenção do Activity Feed neste projeto (verificada em items.ts/
    // housing.service.ts/kingdom.service.ts/realEstate.service.ts):
    // nunca nomeia o personagem — só a Notification é personalizada.
    assert.ok(!feed[0]!.text.includes(CHARACTER_ID));

    const notifications = getNotifications(CHARACTER_ID);
    assert.ok(notifications.some((n) => n.text.includes("Você encontrou")));

    const history = await new SQLiteChronicleRepository().listByCharacter(CHARACTER_ID);
    assert.ok(history.some((entry) => entry.chapterKey === "rare_sphere_drop"));
  });

  test("Esfera rara (ascension, rare) também vira notícia — não só a very_rare", async () => {
    const feedBefore = getActivityFeed().length;
    await grantSphereDrop(CHARACTER_ID, "ascension", "boss");
    assert.equal(getActivityFeed().length, feedBefore + 1);
  });
});

// Sprint 17 — Esfera da Incerteza 2.0: "a Esfera NUNCA falha" —
// substitui inteiramente os testes da Sprint 16 (que cobriam o caso
// "nada aconteceu", removido oficialmente). `grantTestItem()` já usa
// `baseItemId: "sword"` (elegível — ver EXAMPLE_BASE_TRANSFORMATION_POOL,
// transformation/exampleTransformations.ts: downgrade peso 60/upgrade
// peso 10). "não-elegível" usa um baseItemId fora do pool (ex: "axe").
describe("sphere.service — Esfera da Incerteza 2.0 (Sprint 17)", () => {
  function grantIneligibleItem() {
    return grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: "axe",
      name: "Item de Teste Inelegível",
      rarity: "rare",
      slot: "weapon",
      powerScore: 12,
      itemLevel: 60,
      seed: 54321,
    });
  }

  test("rejeita uma Base fora do BaseTransformationPool ('axe') — Esfera não é consumida", () => {
    grantSphereForTesting(CHARACTER_ID, "uncertainty", 1);
    const before = getSphereQuantity(CHARACTER_ID, "uncertainty");
    const item = grantIneligibleItem();

    const result = applySphereToItem(CHARACTER_ID, item.id, "uncertainty");

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "not-eligible");
    assert.equal(getSphereQuantity(CHARACTER_ID, "uncertainty"), before);
  });

  test("sobre uma Base elegível ('sword'): sempre consome 1 Esfera, sempre muda o item, e sempre grava 'uncertainty_used' + exatamente 1 evento de resultado (nunca 'failed_reveal' — esse estado não existe mais)", () => {
    grantSphereForTesting(CHARACTER_ID, "uncertainty", 1);
    const before = getSphereQuantity(CHARACTER_ID, "uncertainty");
    const originalName = "Item de Teste pra Esfera";
    const item = grantTestItem();

    const result = applySphereToItem(CHARACTER_ID, item.id, "uncertainty");

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(getSphereQuantity(CHARACTER_ID, "uncertainty"), before - 1);
    // "O Item SEMPRE muda. Nunca permanece igual" — o nome nunca é o original.
    assert.notEqual(result.item.name, originalName);
    const events = result.item.history!.events;
    assert.equal(events.length, 3); // created + uncertainty_used + evento de resultado
    assert.equal(events[1]!.event, "uncertainty_used");
    assert.ok(["upgraded", "downgraded", "transformation", "revealed", "mythic_revealed"].includes(events[2]!.event));
  });

  // A Esfera nunca falha (Sprint 17, decisão oficial). A cobertura
  // estatística de que AMBOS os outcomes de "sword" (downgrade peso
  // 60/upgrade peso 10) são alcançáveis já está exaustivamente provada
  // em `resolver.test.ts` (packages/shared, puro, sem banco) — aqui só
  // confirmamos, com poucas chamadas reais contra o banco (pra não
  // sobrecarregar a suíte completa com transações sequenciais), que
  // CADA uma sempre muda o item de verdade e sempre grava um dos 5
  // eventos válidos, nunca o estado antigo "failed_reveal"/item intocado.
  test("em várias tentativas reais, o item SEMPRE muda e sempre grava um TransformationOutcome válido — nunca o item original", () => {
    grantSphereForTesting(CHARACTER_ID, "uncertainty", 15);

    for (let i = 0; i < 15; i++) {
      const item = grantTestItem();
      const result = applySphereToItem(CHARACTER_ID, item.id, "uncertainty");
      assert.equal(result.success, true);
      if (!result.success) continue;

      // Nunca "nada aconteceu" — o nome NUNCA é o original.
      assert.notEqual(result.item.name, "Item de Teste pra Esfera");
      const lastEvent = result.item.history!.events.at(-1)!;
      assert.ok(["downgraded", "upgraded"].includes(lastEvent.event)); // únicos 2 outcomes possíveis pra "sword"
      if (lastEvent.event === "downgraded") {
        assert.equal(result.item.name, "Espada Gasta");
        assert.equal(result.item.rarity, "common");
      } else {
        assert.equal(result.item.name, "Espada do Rei");
        assert.equal(result.item.rarity, "legendary");
      }
    }
  });

  test("Fase 5: a Base 'ring' inclui um resultado mythic_reveal extremamente raro (Anel do Primeiro Rei, exclusiveSource 'uncertainty')", () => {
    grantSphereForTesting(CHARACTER_ID, "uncertainty", 1);
    const ringItem = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: "ring",
      name: "Anel de Teste",
      rarity: "common",
      slot: "ring",
      powerScore: 5,
      itemLevel: 1,
      seed: 99999,
    });

    const result = applySphereToItem(CHARACTER_ID, ringItem.id, "uncertainty");

    assert.equal(result.success, true);
    if (!result.success) return;
    // Qualquer resultado é válido (não controlamos o roll aqui) — só confirma que o pipeline aceita "ring".
    assert.ok(["Anel Manchado", "Anel Retorcido", "Anel dos Juramentos Esquecidos", "Anel do Primeiro Rei"].includes(result.item.name));
  });
});

// Sprint 18 — Mythic Foundation. O peso real do outcome `mythic_reveal`
// (1/100.000, Fase 5 da Sprint 17) já é exaustivamente provado
// matematicamente em transformation/resolver.test.ts (packages/shared,
// puro) — forçar esse roll aqui via a API pública seria estatisticamente
// impraticável. Estes testes cobrem a fronteira real (Fase 5/6 desta
// Sprint): a camada de persistência `mythic_discoveries`
// (mythicDiscovery.service.ts) e a derivação de Origem que ela alimenta,
// diretamente — mesmo padrão de "testar o limite real, não re-provar o
// que já é puro" usado em toda esta Sprint.
describe("mythicDiscovery.service (Sprint 18 — Fase 5/6)", () => {
  const MYTHIC_ID = `mythic-test-${RUN_ID}`;

  test("recordMythicDiscoveryIfFirst: a primeira chamada marca isFirstDiscovery, a segunda nunca sobrescreve", () => {
    const first = recordMythicDiscoveryIfFirst(MYTHIC_ID, CHARACTER_ID, "2026-01-01T00:00:00.000Z");
    assert.equal(first.isFirstDiscovery, true);

    const second = recordMythicDiscoveryIfFirst(MYTHIC_ID, CHARACTER_ID, "2026-01-02T00:00:00.000Z");
    assert.equal(second.isFirstDiscovery, false);

    const row = getDb().prepare(`SELECT first_at FROM mythic_discoveries WHERE mythic_id = ?`).get(MYTHIC_ID) as { first_at: string };
    assert.equal(row.first_at, "2026-01-01T00:00:00.000Z"); // nunca sobrescrito pela segunda chamada
  });

  test("deriveItemMythicOrigin: item sem evento mythic_revealed nunca é Mítico", () => {
    const origin = deriveItemMythicOrigin([{ event: "created", characterId: CHARACTER_ID, detail: null, at: "2026-01-01T00:00:00.000Z" }]);
    assert.equal(origin.isMythic, false);
  });

  test("deriveItemMythicOrigin: reconhece 'Anel do Primeiro Rei' e resolve isFirstDiscovery contra o registro real", () => {
    const discoveryMythicId = "ring-of-the-first-king";
    const at = "2026-03-01T00:00:00.000Z";
    recordMythicDiscoveryIfFirst(discoveryMythicId, CHARACTER_ID, at);

    const origin = deriveItemMythicOrigin([
      { event: "created", characterId: CHARACTER_ID, detail: null, at: "2026-02-28T00:00:00.000Z" },
      { event: "mythic_revealed", characterId: CHARACTER_ID, detail: "Anel do Primeiro Rei", at },
    ]);

    assert.equal(origin.isMythic, true);
    assert.equal(origin.mythicId, discoveryMythicId);
    assert.equal(origin.displayName, "Anel do Primeiro Rei");
    assert.equal(origin.isFirstDiscovery, true);
  });
});
