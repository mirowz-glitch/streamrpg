import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { __testing } from "./useAdventureSession.js";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sprint 22 — Living Combat Phase I: fixture mínima de CombatSnapshotDTO
// pros testes que passam um RealCharacterSnapshot completo — os valores
// numéricos não importam pra estes testes (cobrem persistência de
// singleton/XP/ouro, não o Combat Snapshot em si, já coberto em
// packages/shared/src/adventure/realCombatSnapshot.test.ts).
const fakeCombatSnapshot = {
  attack: 0,
  defense: 0,
  life: 0,
  mana: 0,
  critical: 0,
  attackSpeed: 0,
  magic: 0,
  powerScore: 0,
  itemScore: 0,
  derivedStats: { accuracy: 0, movementSpeed: 0, lifeLeech: 0, resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 } },
  // Sprint 23 — Sockets & Gems Phase II: campo novo obrigatório em
  // CombatSnapshotDTO, sem comportamentos ativos nesta fixture.
  activeBehaviors: [],
};

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
    const singleton = __testing.buildSingleton({ level: 3, xp: 50, gold: 200, combatSnapshot: fakeCombatSnapshot });
    assert.equal(singleton.isDemoSession, false);
    assert.equal(singleton.lastSynced.gold, 200);
    assert.ok(singleton.lastSynced.xp > 50, "deve incluir o XP acumulado de níveis anteriores, não só o XP-no-nível");
    assert.equal(singleton.session.statistics.goldFound, 200);
  });
});

// Global Idle System — Architecture Refactor: estes testes cobrem a
// Fase 9 da Sprint — a garantia central é que o IdleDriver e o tick
// global agora vivem no MESMO singleton de módulo que a sessão, e por
// isso sobrevivem a QUALQUER coisa que aconteça no lado React (nenhuma
// tela montada, várias montadas, montagens/desmontagens em sequência
// simulando navegação real entre Aventura/Inventário/Personagem/
// Cidade/Mundo). Nenhum destes testes usa React de verdade (sem
// renderer instalado) — `subscribe`/`unsubscribe` simulam exatamente o
// que `useAdventureSession()` faz no mount/unmount de cada tela.
describe("useAdventureSession — Global Idle System (IdleDriver + tick global)", () => {
  beforeEach(() => {
    __testing.resetSingleton();
  });

  afterEach(() => {
    // Essencial: sem isto, o setInterval real criado por
    // ensureIdleDriverStarted() (Fase 8) manteria o processo de teste
    // vivo além do último teste — mesmo cuidado que qualquer outro
    // timer real precisaria neste projeto.
    __testing.resetSingleton();
  });

  test("ensureSingletonInit já sobe o IdleDriver global sozinho (mesmo boot que antes acontecia dentro de AdventurePage)", async () => {
    assert.equal(__testing.getIdleDriverInstance(), null, "antes de qualquer inicialização, nenhum driver deve existir");
    await __testing.ensureSingletonInit();
    assert.notEqual(__testing.getIdleDriverInstance(), null);
    assert.notEqual(__testing.getIdleTickIntervalId(), null);
  });

  test("Fase 8 (Singleton): ensureIdleDriverStarted() chamado de novo com um driver já ativo preserva a MESMA instância, nunca cria uma segunda", async () => {
    await __testing.ensureSingletonInit();
    const first = __testing.getIdleDriverInstance();
    const firstIntervalId = __testing.getIdleTickIntervalId();
    assert.notEqual(first, null);

    // Simula uma 2a tela chamando useAdventureSession() (ex.: Inventário
    // montado enquanto Aventura também existe) — nunca deve substituir o
    // driver ativo.
    __testing.ensureIdleDriverStarted();
    assert.equal(__testing.getIdleDriverInstance(), first, "esperava a MESMA instância de IdleDriver — criar uma segunda violaria a Fase 8");
    assert.equal(__testing.getIdleTickIntervalId(), firstIntervalId, "o setInterval original também deve ser preservado, nunca substituído");
  });

  test("runGlobalTick() avança o mundo (timeline.nextTickIndex incrementa) mesmo sem NENHUM subscriber registrado — a simulação nunca depende de uma tela estar montada", async () => {
    await __testing.ensureSingletonInit();
    assert.equal(__testing.getSubscriberCount(), 0, "nenhuma tela 'montada' neste teste");

    const before = __testing.getSingleton()!.timeline.nextTickIndex;
    __testing.runGlobalTick();
    __testing.runGlobalTick();
    __testing.runGlobalTick();
    const after = __testing.getSingleton()!.timeline.nextTickIndex;

    assert.equal(after, before + 3, "3 ticks devem ter avançado a timeline em 3, independente de qualquer UI observando");
  });

  test("subscribe()/unsubscribe() simulam múltiplas montagens/desmontagens (troca de rota) — getSubscriberCount() reflete o número real de telas 'observando'", () => {
    const listenerAdventure = () => {};
    const listenerInventory = () => {};

    assert.equal(__testing.getSubscriberCount(), 0);
    __testing.subscribe(listenerAdventure);
    assert.equal(__testing.getSubscriberCount(), 1, "Aventura monta");
    __testing.subscribe(listenerInventory);
    assert.equal(__testing.getSubscriberCount(), 2, "Inventário também monta (ex.: duas abas, ou StrictMode)");
    __testing.unsubscribe(listenerAdventure);
    assert.equal(__testing.getSubscriberCount(), 1, "Aventura desmonta ao navegar pra Inventário");
    __testing.unsubscribe(listenerInventory);
    assert.equal(__testing.getSubscriberCount(), 0, "Inventário também desmonta");
  });

  test("notifySubscribers() só chama quem está registrado NO MOMENTO da notificação — um listener já desinscrito nunca é chamado de novo", () => {
    let adventureCalls = 0;
    let inventoryCalls = 0;
    const listenerAdventure = () => {
      adventureCalls++;
    };
    const listenerInventory = () => {
      inventoryCalls++;
    };

    __testing.subscribe(listenerAdventure);
    __testing.subscribe(listenerInventory);
    __testing.notifySubscribers();
    assert.equal(adventureCalls, 1);
    assert.equal(inventoryCalls, 1);

    __testing.unsubscribe(listenerAdventure);
    __testing.notifySubscribers();
    assert.equal(adventureCalls, 1, "Aventura já desmontou, não deve mais ser notificada");
    assert.equal(inventoryCalls, 2);
  });

  test("navegação longa simulada (Aventura -> Inventário -> Personagem -> Cidade -> Mundo -> Aventura) nunca reseta o progresso acumulado da sessão", async () => {
    await __testing.ensureSingletonInit();
    const singleton = __testing.getSingleton()!;
    const startingTickIndex = singleton.timeline.nextTickIndex;

    // Cada `subscribe`/`unsubscribe` simula uma tela montando/desmontando
    // ao navegar; `runGlobalTick()` no meio simula o IdleDriver global
    // continuando a avançar enquanto o jogador está em QUALQUER dessas
    // telas — nenhuma delas possui o driver, então nenhuma delas pode
    // interrompê-lo ao desmontar.
    const screens = ["adventure", "inventory", "character", "city", "world", "adventure"];
    for (const screen of screens) {
      const listener = () => {};
      __testing.subscribe(listener);
      __testing.runGlobalTick();
      __testing.unsubscribe(listener);
      void screen;
    }

    assert.equal(singleton, __testing.getSingleton(), "mesma referência de sessão do início ao fim da navegação — nunca recriada");
    assert.equal(
      __testing.getSingleton()!.timeline.nextTickIndex,
      startingTickIndex + screens.length,
      "todas as 6 ticks devem ter avançado a timeline, mesmo cada uma tendo ocorrido com uma tela diferente 'observando' (ou nenhuma)",
    );
  });

  test("pause()/resume() no IdleDriver global impedem/retomam avanço mesmo chamados por uma tela diferente da que iniciou a sessão", async () => {
    await __testing.ensureSingletonInit();
    const driver = __testing.getIdleDriverInstance()!;

    driver.pause();
    assert.equal(driver.getStatus(), "paused");

    driver.resume();
    assert.equal(driver.getStatus(), "running");
  });

  test("uma sessão derrotada faz runGlobalTick() parar o driver global e nunca mais avançar a timeline, mesmo chamado repetidamente", async () => {
    await __testing.ensureSingletonInit();
    const singleton = __testing.getSingleton()!;

    // Derrota simulada diretamente no estado (mais simples e determinístico
    // que forçar uma derrota real via combate) — o que importa aqui é
    // só o comportamento de runGlobalTick() perante sessionStatus "derrota".
    singleton.session.character.currentLife = 0;

    const before = singleton.timeline.nextTickIndex;
    __testing.runGlobalTick();
    __testing.runGlobalTick();
    const after = singleton.timeline.nextTickIndex;

    assert.equal(after, before, "uma sessão derrotada nunca deve avançar a timeline");
    assert.equal(__testing.getIdleDriverInstance()!.getStatus(), "stopped", "o driver global deve parar sozinho ao detectar derrota");
  });

  test("Fase 6/Restart: reiniciar após derrota reativa o driver global (status volta a 'running')", async () => {
    await __testing.ensureSingletonInit();
    const driver = __testing.getIdleDriverInstance()!;
    driver.stop();
    assert.equal(driver.getStatus(), "stopped");

    driver.start();
    assert.equal(driver.getStatus(), "running", "equivalente ao restart() do hook chamando idleDriverInstance.start()");
  });

  test("fio-terra: o setInterval real criado por ensureIdleDriverStarted() dispara runGlobalTick() sozinho, sem nenhuma chamada manual — prova a integração completa setInterval -> shouldTick -> runGlobalTick", async () => {
    // Sessão plantada diretamente (sem passar pelo fetch real de
    // ensureSingletonInit, que sempre sobe o driver com
    // IDLE_TICK_INTERVAL_MS=2500 — longo demais pra um teste rápido).
    // `ensureIdleDriverStarted(50)` sobe um driver curto só pra este
    // teste conseguir observar o disparo automático em tempo real.
    __testing.setSingletonForTesting(__testing.buildSingleton(null));
    __testing.ensureIdleDriverStarted(50);

    const startingTickIndex = __testing.getSingleton()!.timeline.nextTickIndex;
    await wait(300);
    const afterTickIndex = __testing.getSingleton()!.timeline.nextTickIndex;

    assert.ok(
      afterTickIndex > startingTickIndex,
      `esperava pelo menos 1 tick automático em 300ms com intervalo de 50ms (foi de ${startingTickIndex} pra ${afterTickIndex}) — o polling real precisa disparar runGlobalTick() sozinho, nenhuma chamada manual aqui`,
    );
  });

  test("registerIdleBlockChecker() é respeitado pelo polling automático: um bloqueio sempre ativo impede QUALQUER tick automático, mesmo com o intervalo esgotado várias vezes", async () => {
    __testing.setSingletonForTesting(__testing.buildSingleton(null));
    __testing.ensureIdleDriverStarted(50);
    __testing.registerIdleBlockChecker(() => true);

    const startingTickIndex = __testing.getSingleton()!.timeline.nextTickIndex;
    await wait(300);
    const afterTickIndex = __testing.getSingleton()!.timeline.nextTickIndex;

    assert.equal(afterTickIndex, startingTickIndex, "com o bloqueio sempre ativo (ex.: Level Up ainda na tela), nenhum tick automático deveria ter ocorrido em 300ms mesmo com um intervalo de 50ms");
    __testing.registerIdleBlockChecker(null);
  });
});

// World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 3 — Player Session:
// o heartbeat de presença (POST /api/presence/ping) não depende de
// nenhum "canal"/Twitch para existir, ao contrário do antigo usePing()
// (que exige um canal digitado). Sem servidor real rodando neste
// ambiente de teste, `ensureSingletonInit()` sempre resolve `real` como
// `null` (fetchRealCharacter() captura a falha de rede) — por isso estes
// testes chamam `ensurePresenceHeartbeatStarted()` diretamente (exposta
// via __testing), o mesmo padrão já usado para `ensureIdleDriverStarted`.
describe("useAdventureSession — Player Session heartbeat (presença sem canal/Twitch)", () => {
  beforeEach(() => {
    __testing.resetSingleton();
  });

  afterEach(() => {
    __testing.resetSingleton();
  });

  test("ensurePresenceHeartbeatStarted() registra um interval (getPresencePingIntervalId deixa de ser null)", () => {
    assert.equal(__testing.getPresencePingIntervalId(), null);
    __testing.ensurePresenceHeartbeatStarted(1000);
    assert.notEqual(__testing.getPresencePingIntervalId(), null);
  });

  test("chamado de novo com um heartbeat já ativo não substitui o interval existente (mesma proteção de ensureIdleDriverStarted)", () => {
    __testing.ensurePresenceHeartbeatStarted(1000);
    const first = __testing.getPresencePingIntervalId();
    __testing.ensurePresenceHeartbeatStarted(1000);
    const second = __testing.getPresencePingIntervalId();
    assert.equal(first, second);
  });

  test("resetSingleton() (equivalente a um F5 real) limpa o interval do heartbeat de volta a null", () => {
    __testing.ensurePresenceHeartbeatStarted(1000);
    assert.notEqual(__testing.getPresencePingIntervalId(), null);
    __testing.resetSingleton();
    assert.equal(__testing.getPresencePingIntervalId(), null);
  });
});
