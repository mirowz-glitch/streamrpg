// Economy Core Phase I — infraestrutura genérica de recursos e
// transações (ResourceId, Resource Ledger, Transaction Layer, eventos
// econômicos). Reutilizável por Ouro, Materiais, Reputação, Essências,
// Tokens e futuros recursos, sem nenhum caso especial por recurso.
//
// Uso básico:
//
//   import { ResourceLedger, requestCredit } from "@streamrpg/shared";
//   const ledger = new ResourceLedger();
//   const { transaction, event } = requestCredit(
//     ledger,
//     { resourceId: "gold", amount: 50, origin: "loot:region-1", destination: "character:abc" },
//     Date.now(),
//   );
export * from "./types.js";
export * from "./ledger.js";
export * from "./transactionLayer.js";
export * from "./events.js";
export * from "./persistence.js";
export * from "./saleValue.js";
