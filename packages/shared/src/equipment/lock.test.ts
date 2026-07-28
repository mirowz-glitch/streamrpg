import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EquipmentLockManager, EquipmentLockError } from "./lock.js";

describe("EquipmentLockManager — acquire/release básico", () => {
  test("tryAcquire funciona quando o item não está travado", () => {
    const lock = new EquipmentLockManager();
    assert.equal(lock.tryAcquire(1, "op-a"), true);
    assert.equal(lock.isLocked(1), true);
  });

  test("tryAcquire falha quando o item já está travado por outro dono", () => {
    const lock = new EquipmentLockManager();
    assert.equal(lock.tryAcquire(1, "op-a"), true);
    assert.equal(lock.tryAcquire(1, "op-b"), false);
  });

  test("release libera o item, permitindo nova aquisição", () => {
    const lock = new EquipmentLockManager();
    lock.tryAcquire(1, "op-a");
    lock.release(1, "op-a");
    assert.equal(lock.isLocked(1), false);
    assert.equal(lock.tryAcquire(1, "op-b"), true);
  });

  test("release não faz nada se o owner não bater (uma operação nunca libera o lock de outra)", () => {
    const lock = new EquipmentLockManager();
    lock.tryAcquire(1, "op-a");
    lock.release(1, "op-b");
    assert.equal(lock.isLocked(1), true);
  });

  test("itens diferentes não interferem entre si", () => {
    const lock = new EquipmentLockManager();
    assert.equal(lock.tryAcquire(1, "op-a"), true);
    assert.equal(lock.tryAcquire(2, "op-b"), true);
  });
});

describe("EquipmentLockManager — expiração de lock obsoleto", () => {
  test("um lock expira sozinho depois do tempo configurado (segurança contra bug de release esquecido)", () => {
    const lock = new EquipmentLockManager(100);
    const t0 = 1_000_000;
    assert.equal(lock.tryAcquire(1, "op-a", t0), true);
    assert.equal(lock.isLocked(1, t0 + 50), true);
    assert.equal(lock.isLocked(1, t0 + 150), false);
    assert.equal(lock.tryAcquire(1, "op-b", t0 + 150), true);
  });
});

describe("EquipmentLockManager — withLock (Fase 2: fluxo completo)", () => {
  test("executa fn e libera o lock automaticamente em caso de sucesso", () => {
    const lock = new EquipmentLockManager();
    const result = lock.withLock(1, "op-a", () => "resultado");
    assert.equal(result, "resultado");
    assert.equal(lock.isLocked(1), false);
  });

  test("libera o lock automaticamente mesmo se fn lançar um erro", () => {
    const lock = new EquipmentLockManager();
    assert.throws(() => {
      lock.withLock(1, "op-a", () => {
        throw new Error("falha simulada dentro da operação");
      });
    });
    assert.equal(lock.isLocked(1), false);
  });

  test("lança EquipmentLockError se o item já está travado por outra operação", () => {
    const lock = new EquipmentLockManager();
    lock.tryAcquire(1, "op-a");
    assert.throws(() => {
      lock.withLock(1, "op-b", () => "nunca deveria rodar");
    }, EquipmentLockError);
    // a operação bloqueada nunca chega a rodar, e o lock original permanece do dono original
    assert.equal(lock.isLocked(1), true);
  });

  test("duas operações concorrentes no MESMO item — a segunda é rejeitada, nunca as duas rodam", () => {
    const lock = new EquipmentLockManager();
    const executed: string[] = [];
    lock.withLock(1, "op-a", () => {
      executed.push("op-a");
      assert.throws(() => {
        lock.withLock(1, "op-b", () => {
          executed.push("op-b");
        });
      }, EquipmentLockError);
    });
    assert.deepEqual(executed, ["op-a"]);
  });
});
