import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { citizenRankLabel, citizenRankLadder } from "./citizenRank.js";

describe("citizenRankLabel", () => {
  test("traduz cada estágio para português", () => {
    assert.equal(citizenRankLabel("visitante"), "Visitante");
    assert.equal(citizenRankLabel("residente"), "Residente");
    assert.equal(citizenRankLabel("cidadao"), "Cidadão");
    assert.equal(citizenRankLabel("veterano"), "Veterano");
    assert.equal(citizenRankLabel("lenda"), "Lenda");
  });
});

describe("citizenRankLadder", () => {
  test("devolve os 5 estágios na ordem oficial, visitante primeiro", () => {
    const ladder = citizenRankLadder();
    assert.deepEqual(
      ladder.map((entry) => entry.rank),
      ["visitante", "residente", "cidadao", "veterano", "lenda"],
    );
    assert.equal(ladder[0].label, "Visitante");
    assert.equal(ladder[4].label, "Lenda");
  });
});
