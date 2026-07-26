import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { __testing } from "./useAdventureSession.js";

// Adventure Session Persistence — RC1 Blocker Fix: estes testes cobrem
// só a garantia que importa pro bug B1 (não o motor de combate, já
// coberto em packages/shared) — o singleton de módulo NÃO deve ser
// recriado enquanto existir, simulando o que acontece quando
// AdventurePage desmonta/remonta numa troca de rota normal. Não usam
// React (sem renderer instalado neste projeto) — testam a mesma lógica
// que os hooks consomem, sem precisar montar componentes.
describe("useAdventureSession — persistência entre remontagens", () => {
  beforeEach(() => {
    __testing.resetSingleton();
  });

  test("singleton começa nulo antes de qualquer inicialização (estado de uma AdventurePage nunca montada)", () => {
    assert.equal(__testing.getSingleton(), null);
  });

  test("ensureSingletonInit cria o singleton uma vez; chamadas seguintes reusam a MESMA referência (equivalente a remontar AdventurePage sem perder progresso)", async () => {
    await __testing.ensureSingletonInit();
    const first = __testing.getSingleton();
    assert.notEqual(first, null);

    // Simula uma 2a montagem de AdventurePage (troca de rota e volta):
    // nenhuma nova sessão deve ser criada.
    await __testing.ensureSingletonInit();
    const second = __testing.getSingleton();
    assert.equal(second, first, "esperava a MESMA referência de sessão após uma 2a chamada — recriar aqui reproduziria o bug B1");
  });

  test("chamadas concorrentes de ensureSingletonInit (StrictMode monta/desmonta/monta) não criam duas sessões", async () => {
    const [, singleton] = await Promise.all([__testing.ensureSingletonInit(), __testing.ensureSingletonInit()]);
    void singleton;
    const a = __testing.getSingleton();
    await __testing.ensureSingletonInit();
    const b = __testing.getSingleton();
    assert.equal(a, b, "chamadas concorrentes devem convergir pra uma única sessão, nunca duas");
  });

  test("mutar session/timeline do singleton é visível em getSingleton() (mesma referência, sem cópia) — é assim que progresso de Dungeon sobrevive a navegação", async () => {
    await __testing.ensureSingletonInit();
    const singleton = __testing.getSingleton();
    assert.notEqual(singleton, null);
    singleton!.lastSynced.xp = 12345;
    assert.equal(__testing.getSingleton()!.lastSynced.xp, 12345);
  });

  test("resetSingleton() (equivalente a um F5 real, onde o módulo JS é recarregado do zero) volta o estado a null", async () => {
    await __testing.ensureSingletonInit();
    assert.notEqual(__testing.getSingleton(), null);
    __testing.resetSingleton();
    assert.equal(__testing.getSingleton(), null, "reload deve continuar reiniciando a sessão — só navegação interna deve preservar");
  });

  test("buildSingleton(null) (sessão demo, sem personagem real) marca isDemoSession corretamente", () => {
    const singleton = __testing.buildSingleton(null);
    assert.equal(singleton.isDemoSession, true);
    assert.equal(singleton.lastSynced.xp, 0);
    assert.equal(singleton.lastSynced.gold, 0);
  });

  test("buildSingleton(real) reconstrói o XP acumulado e o ouro a partir do personagem persistido, não reinicia do zero", () => {
    const singleton = __testing.buildSingleton({ level: 3, xp: 50, gold: 200 });
    assert.equal(singleton.isDemoSession, false);
    assert.equal(singleton.lastSynced.gold, 200);
    assert.ok(singleton.lastSynced.xp > 50, "deve incluir o XP acumulado de níveis anteriores, não só o XP-no-nível");
    assert.equal(singleton.session.statistics.goldFound, 200);
  });
});
