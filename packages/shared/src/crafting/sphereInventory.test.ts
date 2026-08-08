import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createEmptySphereInventory, getStackQuantity, hasSphere, addToStack, consumeFromStack } from "./sphereInventory.js";

describe("createEmptySphereInventory", () => {
  test("nasce sem nenhuma Esfera", () => {
    const inventory = createEmptySphereInventory("char-1");
    assert.equal(inventory.characterId, "char-1");
    assert.deepEqual(inventory.stacks, []);
  });
});

describe("addToStack", () => {
  test("cria uma pilha nova quando a Esfera ainda não existe", () => {
    const inventory = createEmptySphereInventory("char-1");
    const updated = addToStack(inventory, "fortune", 3);
    assert.equal(getStackQuantity(updated, "fortune"), 3);
  });

  test("soma na pilha existente em vez de duplicar", () => {
    let inventory = createEmptySphereInventory("char-1");
    inventory = addToStack(inventory, "fortune", 2);
    inventory = addToStack(inventory, "fortune", 3);
    assert.equal(getStackQuantity(inventory, "fortune"), 5);
    assert.equal(inventory.stacks.length, 1);
  });

  test("amount <= 0 não altera o inventário", () => {
    const inventory = createEmptySphereInventory("char-1");
    const updated = addToStack(inventory, "curse", 0);
    assert.deepEqual(updated, inventory);
  });

  test("nunca muta o inventário recebido (devolve um objeto novo)", () => {
    const inventory = createEmptySphereInventory("char-1");
    addToStack(inventory, "fortune", 1);
    assert.deepEqual(inventory.stacks, []);
  });
});

describe("hasSphere / getStackQuantity", () => {
  test("hasSphere é false pra uma Esfera nunca adicionada", () => {
    const inventory = createEmptySphereInventory("char-1");
    assert.equal(hasSphere(inventory, "ascension"), false);
    assert.equal(getStackQuantity(inventory, "ascension"), 0);
  });
});

describe("consumeFromStack", () => {
  test("consome 1 unidade, mantendo a pilha se sobrar quantidade", () => {
    const inventory = addToStack(createEmptySphereInventory("char-1"), "lapidation", 3);
    const result = consumeFromStack(inventory, "lapidation");
    assert.equal(result.consumed, true);
    assert.equal(getStackQuantity(result.inventory, "lapidation"), 2);
  });

  test("remove a pilha inteira quando a última unidade é consumida", () => {
    const inventory = addToStack(createEmptySphereInventory("char-1"), "purification", 1);
    const result = consumeFromStack(inventory, "purification");
    assert.equal(result.consumed, true);
    assert.equal(hasSphere(result.inventory, "purification"), false);
    assert.equal(result.inventory.stacks.length, 0);
  });

  test("consumed: false e inventário intacto quando o personagem não possui a Esfera", () => {
    const inventory = createEmptySphereInventory("char-1");
    const result = consumeFromStack(inventory, "curse");
    assert.equal(result.consumed, false);
    assert.deepEqual(result.inventory, inventory);
  });
});
