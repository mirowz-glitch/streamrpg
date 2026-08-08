/**
 * Sprint 22 — Living Combat Phase I, Fase 7/12. Cobertura do único
 * ponto onde BossCombatSystem mudou de comportamento: attack/critical
 * agora vêm do Combat Snapshot real (combatSnapshot.service.ts), nunca
 * mais de `getCombatAttributes()` + `CRITICAL_HIT_CHANCE` fixo. `level`
 * continua vindo de `getCombatAttributes()` (fora do vocabulário do
 * Snapshot) — a fórmula canônica em si não muda.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../engine/EventBus.js";
import type { BossRepository, BossSnapshot, RandomProvider, WorldTickEvent } from "../engine/types.js";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem } from "../services/drop.service.js";
import { createSocketConfiguration, resolveOffensiveBehaviorModifiers, type SocketConfiguration } from "@streamrpg/shared";
import { getCombatSnapshotForCharacter } from "../services/combatSnapshot.service.js";
import { SQLiteCharacterRepository } from "../infrastructure/SQLiteCharacterRepository.js";
import { createGemForTesting, socketGem } from "../services/gem.service.js";
import { BossCombatSystem, calculateCanonicalDamage } from "./BossCombatSystem.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-bosscombat-${RUN_ID}`;
const CHARACTER_ID = `char-bosscombat-${RUN_ID}`;
const CHANNEL_ID = `channel-bosscombat-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(PROFILE_ID, `twitch-${RUN_ID}`, "BossCombatTester");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(CHARACTER_ID, PROFILE_ID, "Boss Combat Tester", 0);
  const item = grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: "test-weapon",
    name: "Espada de Teste",
    rarity: "epic",
    slot: "weapon",
    powerScore: 30,
  });
  equipItem(CHARACTER_ID, item.id);
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

function fakeBossRepository(boss: BossSnapshot): BossRepository & { lastDamage: number | null } {
  let current = boss;
  return {
    lastDamage: null,
    findById: async () => current,
    findActiveOrAwaiting: async () => current,
    findLastResolved: async () => null,
    create: async () => current,
    activate: async () => current,
    findAwaitingPastDeadline: async () => [],
    findAllActive: async () => [current],
    applyDamage: async function (this: ReturnType<typeof fakeBossRepository>, _bossId: string, amount: number) {
      this.lastDamage = amount;
      current = { ...current, currentHp: Math.max(0, current.currentHp - amount) };
      return current;
    },
    resolve: async (_bossId, status, resolvedAt) => {
      current = { ...current, status, resolvedAt };
      return current;
    },
  } as BossRepository & { lastDamage: number | null };
}

function fixedRandom(value: number): RandomProvider {
  return { next: () => value };
}

function boss(overrides: Partial<BossSnapshot> = {}): BossSnapshot {
  return {
    id: `boss-${RUN_ID}`,
    channelId: CHANNEL_ID,
    status: "active",
    tier: 1,
    maxHp: 100000,
    currentHp: 100000,
    invocationDeadline: 0,
    activatedAt: Date.now(),
    endsAt: null,
    resolvedAt: null,
    ...overrides,
  };
}

function tick(): WorldTickEvent {
  return {
    type: "world.tick",
    tickNumber: 1,
    timestamp: Date.now(),
    sessions: [{ characterId: CHARACTER_ID, channelId: CHANNEL_ID, lastSeenAt: Date.now(), provider: "website" }],
  };
}

describe("BossCombatSystem — Combat Snapshot (Sprint 22)", () => {
  test("o dano aplicado ao Boss é derivado do mesmo Combat Snapshot que /api/character usa (attack real do item equipado)", async () => {
    const bus = new EventBus();
    const repo = fakeBossRepository(boss());
    const system = new BossCombatSystem(repo, new SQLiteCharacterRepository(), fixedRandom(0.99)); // 0.99 nunca é < qualquer % de crítico plausível
    system.register(bus);

    const snapshot = getCombatSnapshotForCharacter(CHARACTER_ID);
    assert.ok(snapshot);
    assert.ok(snapshot!.attack > 0, "attack do Snapshot precisa ser > 0 (item epic equipado)");

    bus.emit(tick());
    // world.tick é async (subscribe registra um handler async) — espera a
    // fila de microtasks drenar antes de checar o resultado.
    await new Promise((resolve) => setImmediate(resolve));

    assert.ok(repo.lastDamage !== null && repo.lastDamage > 0, "Boss precisa ter recebido dano > 0, derivado do Snapshot real");
  });

  test("isCritical lê snapshot.critical/100 — RNG sempre abaixo de 100% força crítico, mesmo sem nenhuma Gema/CRITICAL_HIT_CHANCE fixo", async () => {
    const bus = new EventBus();
    const repo = fakeBossRepository(boss());
    // RNG sempre 0 é sempre < qualquer chance > 0. O personagem de teste
    // não tem Gema de crítico socketada — snapshot.critical vem só da
    // Base do Character Build (characterbuild/derivedAttributes.ts),
    // que é > 0 mesmo sem equipamento, então crítico sempre dispara.
    const system = new BossCombatSystem(repo, new SQLiteCharacterRepository(), fixedRandom(0));
    system.register(bus);

    const repoNeverCrit = fakeBossRepository(boss());
    const systemNeverCrit = new BossCombatSystem(repoNeverCrit, new SQLiteCharacterRepository(), fixedRandom(0.999999));
    systemNeverCrit.register(bus);

    bus.emit(tick());
    await new Promise((resolve) => setImmediate(resolve));

    assert.ok(repo.lastDamage !== null);
    assert.ok(repoNeverCrit.lastDamage !== null);
    // Dano com RNG=0 (sempre crítico) precisa ser estritamente maior que
    // com RNG=0.999999 (nunca crítico) — a única diferença entre os dois
    // é o multiplicador de crítico, nunca um valor fixo de antes.
    assert.ok(repo.lastDamage! > repoNeverCrit.lastDamage!, `esperado crítico(${repo.lastDamage}) > não-crítico(${repoNeverCrit.lastDamage})`);
  });
});

describe("BossCombatSystem — GemBehaviors (Sprint 23 — Sockets & Gems Phase II, Fase 8)", () => {
  test("Rubi (onHitBonusFireDamage) socketado: o dano aplicado ao Boss bate exatamente com calculateCanonicalDamage(...) + bonusFlatDamage do Behavior real", async () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: "test-boots-behavior",
      name: "Botas de Teste (Behavior)",
      rarity: "rare",
      slot: "boots",
      powerScore: 5,
    });
    const config: SocketConfiguration = createSocketConfiguration(1, 999);
    getDb().prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(config), item.item_id);
    equipItem(CHARACTER_ID, item.id);

    // Ruby-1 tem effectId (attack-percent-1) E behaviorId
    // (ruby-fire-proc-1) — "GemEffect e GemBehavior nunca são a mesma
    // coisa", mas socketar a MESMA Gema aciona os dois ao mesmo tempo.
    // Por isso o teste calcula o dano esperado a partir do Snapshot
    // real PÓS-Gema (que já reflete o efeito no attack), nunca de um
    // delta fixo — comparar contra "damage antes + magnitude" seria
    // ingênuo e confundiria efeito com comportamento.
    const gem = createGemForTesting(CHARACTER_ID, "ruby-1", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0]!.id);
    assert.equal(socketed.success, true);

    const snapshot = getCombatSnapshotForCharacter(CHARACTER_ID);
    assert.ok(snapshot);
    assert.equal(snapshot!.activeBehaviors.length, 1);
    assert.equal(snapshot!.activeBehaviors[0]!.behaviorKind, "onHitBonusFireDamage");

    const combat = await new SQLiteCharacterRepository().getCombatAttributes(CHARACTER_ID);
    assert.ok(combat);

    const bus = new EventBus();
    const repo = fakeBossRepository(boss());
    // 0.99 nunca é < 6% de crítico — mesmo isCritical=false usado no
    // cálculo esperado abaixo.
    new BossCombatSystem(repo, new SQLiteCharacterRepository(), fixedRandom(0.99)).register(bus);
    bus.emit(tick());
    await new Promise((resolve) => setImmediate(resolve));
    assert.ok(repo.lastDamage !== null);

    const offensiveModifiers = resolveOffensiveBehaviorModifiers(snapshot!.activeBehaviors, snapshot!.critical);
    const canonical = calculateCanonicalDamage({ level: combat!.level, attackPhysical: snapshot!.attack, attackMagic: snapshot!.magic, isCritical: false });
    const expectedDamage = canonical.damage + offensiveModifiers.bonusFlatDamage;

    assert.equal(repo.lastDamage!, expectedDamage);
    // Prova que o Behavior realmente contribuiu (não é só o efeito de
    // attack) — sem o bonusFlatDamage, o dano seria estritamente menor.
    assert.ok(repo.lastDamage! > canonical.damage);
  });
});
