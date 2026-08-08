// Sprint 10 — Itemization 2.0 prep (mudança de visão: Idle MMORPG
// econômico, loot procedural + mercado permanente + crafting baseado
// em Esferas + legado dos itens). APENAS infraestrutura de tipos —
// nenhuma lógica de crafting real, nenhuma UI, nenhuma tabela de
// banco nova. Ver Fase 1 do relatório de entrega
// (docs/design/itemization2-phase1-implementation.md) para a
// auditoria completa do que já existe (itemgen/, equipment/) vs. o
// que este módulo prepara.
//
// Deliberadamente NÃO exportado do barrel principal de @streamrpg/
// shared (packages/shared/src/index.ts) ainda — mesmo princípio já
// usado por guild/ (Sprint 9): evita que qualquer código real importe
// por engano um tipo que ainda não tem nenhuma implementação real por
// trás.
export * from "./types.js";
export * from "./history.js";
export * from "./spheres.js";
export * from "./legacy.js";
