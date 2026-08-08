import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, getSessionResult } from "./session.js";
import { advanceAdventure } from "./adventureLoop.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { advanceAdventureWithObjectives } from "../objectives/objectiveLayer.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { listMapDefinitions, getMapDefinition } from "../worldmap/mapRegistry.js";

// Sprint 31 — Map Integration Phase I. Fase 8: "Adventure usando Map" /
// "Enemy Pool" / "Dungeon Context" / "Compatibilidade" — a Sprint que
// fecha o ciclo iniciado na Sprint 25 (World Regions -> ... -> Sprint
// 30 World Maps) fazendo o Adventure/Dungeon REALMENTE consumir
// Map/Enemy Pool pela primeira vez, sem alterar nenhum número.

function strongHero(suffix = "1") {
  const build = new CharacterBuild(`hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hero-${suffix}`, 30);
  const equipment = new Equipment(`hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`session-${suffix}`, character, regionId, seed, 0);
}

describe("Adventure escolhe Map (Fase 2)", () => {
  it("createAdventureSession() deriva currentMapId a partir do regionId — Map.id === regionId nesta Fase", () => {
    const session = freshSession("fortaleza-sombria", 7, "map-1");
    assert.equal(session.currentMapId, "fortaleza-sombria");
    assert.equal(session.currentRegion, "fortaleza-sombria");
  });

  it("currentMapId cai de volta pro próprio valor recebido quando não existe Mapa pra essa região (hub/id desconhecido) — nunca undefined", () => {
    const session = freshSession("porto-do-amanhecer", 3, "map-2");
    assert.equal(session.currentMapId, "porto-do-amanhecer");
  });

  it("getSessionResult() expõe mapId (== session.currentMapId) além de region — nada foi removido, só adicionado", () => {
    const session = freshSession("pantano-podre", 5, "map-3");
    const result = getSessionResult(session);
    assert.equal(result.mapId, "pantano-podre");
    assert.equal(result.region, "pantano-podre");
  });

  it("todos os 9 Mapas reais produzem uma sessão válida (currentMapId === currentRegion === map.id)", () => {
    for (const map of listMapDefinitions()) {
      const session = freshSession(map.regionId, 11, `map-all-${map.id}`);
      assert.equal(session.currentMapId, map.id);
      assert.equal(session.currentRegion, map.regionId);
    }
  });
});

describe("Enemy Pool real (Fase 3) — generateEncounter() nunca produz um monstro fora de Map.enemyPool", () => {
  it("para os 9 Mapas reais, 200 seeds cada, todo enemyTemplateId de todo grupo gerado está em Map.enemyPool", () => {
    for (const map of listMapDefinitions()) {
      const pool = new Set(map.enemyPool);
      for (let seed = 1; seed <= 200; seed++) {
        const result = generateEncounter(map.regionId, 20, seed * 97);
        for (const group of result.groups) {
          assert.ok(
            pool.has(group.enemyTemplateId),
            `generateEncounter("${map.regionId}", seed=${seed}) produziu "${group.enemyTemplateId}" fora do enemyPool do Mapa "${map.id}"`,
          );
        }
      }
    }
  });

  it("compatibilidade: Skeleton continua aparecendo em minas-abandonadas (achado da auditoria — o gate nunca removeu o comportamento real pré-Sprint 31)", () => {
    const map = getMapDefinition("minas-abandonadas")!;
    let sawSkeleton = false;
    for (let seed = 1; seed <= 500 && !sawSkeleton; seed++) {
      const result = generateEncounter("minas-abandonadas", 15, seed * 31);
      if (result.groups.some((g) => g.enemyTemplateId === "skeleton")) sawSkeleton = true;
    }
    assert.ok(sawSkeleton, "Skeleton nunca apareceu em 500 seeds em minas-abandonadas — o gate pode ter regredido o comportamento real");
    assert.ok(map.enemyPool.includes("skeleton"));
  });
});

describe("Dungeon recebe contexto de Map (Fase 5) — de graça, via a mesma AdventureSession", () => {
  it("advanceDungeonTick() opera sobre a mesma sessão — currentMapId sempre reflete currentRegion, mesmo quando a Progressão Automática de Região troca os dois no meio de uma Dungeon", () => {
    const session = freshSession("ruinas-esquecidas", 42, "dungeon-1");
    const timeline = createAdventureTimeline(session.sessionId);
    advanceDungeonTick(session, timeline, { currentTime: 1000 });
    // Achado real da auditoria (Fase 7): objectives/objectiveLayer.ts
    // (Progressão Automática de Região) é o ÚNICO outro mutador real de
    // `session.currentRegion` além de createAdventureSession() — o
    // personagem forte deste fixture (nível 20) atravessa o gate de
    // desbloqueio já na 1ª tick, então `currentRegion` PODE mudar aqui.
    // A invariante real nunca é "nunca muda" — é "currentMapId nunca
    // desincroniza de currentRegion".
    assert.equal(session.currentMapId, getMapDefinition(session.currentRegion)?.id ?? session.currentRegion);
    assert.equal(getSessionResult(session).mapId, session.currentMapId);
  });
});

describe("Progressão Automática de Região (achado da auditoria) — currentMapId nunca desincroniza", () => {
  it("advanceAdventureWithObjectives() desbloqueia a próxima região automaticamente (personagem forte) e currentMapId acompanha", () => {
    const session = freshSession("bosque-sussurrante", 9, "unlock-1");
    const timeline = createAdventureTimeline(session.sessionId);
    const before = session.currentRegion;

    let regionChanged = false;
    for (let tick = 0; tick < 30 && !regionChanged; tick++) {
      advanceAdventureWithObjectives(session, timeline, { currentTime: 1000 * (tick + 1) });
      if (session.currentRegion !== before) regionChanged = true;
    }

    assert.ok(regionChanged, "a Progressão Automática de Região nunca disparou em 30 ticks — teste não está exercitando o achado real");
    assert.notEqual(session.currentRegion, before);
    assert.equal(session.currentMapId, getMapDefinition(session.currentRegion)?.id ?? session.currentRegion);
  });
});

describe("Compatibilidade (Fase 7) — nada que já funcionava parou de funcionar", () => {
  it("um tick completo de Adventure continua resolvendo um encontro inteiro (personagem forte vence)", () => {
    const session = freshSession("bosque-sussurrante", 1, "compat-1");
    const tickResult = advanceAdventure(session, { currentTime: 1000 });
    assert.equal(tickResult.encounterGenerated, true);
    assert.ok(tickResult.enemiesEncountered > 0);
    assert.equal(tickResult.characterAlive, true);
    assert.equal(session.currentEncounter, null);
  });
});
