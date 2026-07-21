// Inventory System Phase I — armazenamento de itens gerados pelo Loot
// Generator: Loot Generator -> Generated Item -> Inventory -> Character.
// Só o armazenamento em si — nada de equipar/comparar/craft/mercado/
// vendors/UI final/drag&drop/filtros (fases futuras).
//
// Uso básico:
//
//   import { Inventory } from "@streamrpg/shared";
//   const inventory = new Inventory("char-42", 30);
//   const result = inventory.addItem("drop-001", generatedItem);
//   if (result.success) { ... }
//
// Como aumentar a capacidade sem alterar nenhuma lógica existente:
//
//   inventory.expandCapacity(10); // +10 slots vazios no final
//
// Como adicionar um novo TIPO de item (ex.: consumível/material
// empilhável, requisito 2 "preparar arquitetura para stacks") sem
// alterar a lógica existente: `InventorySlotState.quantity` já existe
// pra isso (types.ts) — um novo tipo de item que não seja
// ItemGenGeneratedItem só precisaria de uma validação própria (nos
// moldes de validation.ts) e reaproveitaria a mesma estrutura de slot;
// addItem()/removeItem()/getItem()/findItem()/findBySlot()/findById()
// não mudam.
export * from "./types.js";
export * from "./validation.js";
export * from "./inventory.js";
