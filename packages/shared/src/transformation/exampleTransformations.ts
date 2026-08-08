/**
 * Sprint 17 — Esfera da Incerteza 2.0, Fase 4/5/6/9. "Somente
 * infraestrutura... nenhum conteúdo definitivo... nada balanceado"
 * continua valendo — os registros abaixo só provam que o pipeline
 * completo (Base -> Esfera -> um dos 5 Outcomes, sempre) funciona de
 * ponta a ponta. Mesmo padrão de dado estático já usado por
 * `ITEM_GEN_BASE_ITEMS`/`ENEMY_TEMPLATES`/`LOOT_TABLES` — nenhuma
 * tabela nova no banco.
 *
 * Fase 5 — exemplo literal do brief: a Base "ring" ganha um resultado
 * `mythic_reveal` ("Anel do Primeiro Rei") com peso 1 em 100.000
 * (0,001%) — o restante do pool cobre os outros 4 Outcomes possíveis.
 * Este Item Mítico NUNCA aparece em nenhuma outra fonte (Boss/Dungeon/
 * Evento) — `exclusiveSource: "uncertainty"` é a marca dessa garantia
 * (Fase 6), embora nenhum sistema de drop real ainda leia este campo
 * (infraestrutura, não integração).
 */
import type { BaseTransformation, BaseTransformationPoolRegistry } from "./types.js";

export const EXAMPLE_BASE_TRANSFORMATIONS: readonly BaseTransformation[] = [
  // --- sword: downgrade garantido (piso incondicional) + upgrade exclusivo ---
  {
    id: "sword-worn-down",
    baseItemId: "sword",
    outcome: "downgrade",
    revealedName: "Espada Gasta",
    revealedRarity: "common",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "sword-of-the-king",
    baseItemId: "sword",
    outcome: "upgrade",
    revealedName: "Espada do Rei",
    revealedRarity: "legendary",
    enabled: true,
    conditions: [],
    exclusiveSource: "uncertainty",
  },

  // --- staff: downgrade garantido + reveal condicional ---
  {
    id: "staff-cracked",
    baseItemId: "staff",
    outcome: "downgrade",
    revealedName: "Cajado Rachado",
    revealedRarity: "common",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "staff-of-the-lost-arcane",
    baseItemId: "staff",
    outcome: "reveal",
    revealedName: "Cajado do Arcano Perdido",
    revealedRarity: "epic",
    enabled: true,
    conditions: [{ kind: "min_item_level", value: 10 }],
    exclusiveSource: "uncertainty",
  },

  // --- ring: os 5 Outcomes representados, incluindo o Mítico da Fase 5 ---
  {
    id: "ring-tarnished",
    baseItemId: "ring",
    outcome: "downgrade",
    revealedName: "Anel Manchado",
    revealedRarity: "common",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "ring-reshaped",
    baseItemId: "ring",
    outcome: "mutation",
    revealedName: "Anel Retorcido",
    revealedRarity: "rare",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "ring-of-forgotten-oaths",
    baseItemId: "ring",
    outcome: "upgrade",
    revealedName: "Anel dos Juramentos Esquecidos",
    revealedRarity: "epic",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "ring-of-the-first-king",
    baseItemId: "ring",
    outcome: "mythic_reveal",
    revealedName: "Anel do Primeiro Rei",
    revealedRarity: "legendary",
    enabled: true,
    conditions: [],
    exclusiveSource: "uncertainty",
  },

  // --- Sprint 18, Fase 8: "Anel Antigo" — 3 exemplos QA da cadeia
  // narrativa literal do brief (Anel Antigo -> Anel Retorcido -> Anel
  // Consagrado -> Anel do Primeiro Rei). Base NOVA ("ancient-ring"),
  // aditiva — não reaproveita nem altera a Base "ring" acima (Sprint
  // 17), então nenhum teste ou pool existente muda de comportamento.
  // Cada uso da Esfera continua sendo um roll independente (nunca um
  // pipeline de estágios obrigatórios) — a "cadeia" é só a narrativa
  // que os 3 nomes sugerem, não uma máquina de estados real.
  {
    id: "ancient-ring-twisted",
    baseItemId: "ancient-ring",
    outcome: "mutation",
    revealedName: "Anel Retorcido",
    revealedRarity: "rare",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "ancient-ring-consecrated",
    baseItemId: "ancient-ring",
    outcome: "upgrade",
    revealedName: "Anel Consagrado",
    revealedRarity: "epic",
    enabled: true,
    conditions: [],
    exclusiveSource: null,
  },
  {
    id: "ancient-ring-of-the-first-king",
    baseItemId: "ancient-ring",
    outcome: "mythic_reveal",
    revealedName: "Anel do Primeiro Rei",
    revealedRarity: "legendary",
    enabled: true,
    conditions: [],
    exclusiveSource: "uncertainty",
  },
];

/**
 * "Nem toda Base pode utilizar a Esfera da Incerteza" — só as 3 Bases
 * abaixo aparecem aqui; qualquer outra (`axe`, `helmet`, `amulet`...)
 * fica de fora do registro de propósito, o sinal de "não elegível" que
 * `isBaseEligibleForUncertainty()` (resolver.ts) lê.
 *
 * `pool` (Fase 9) só rotula a raridade do resultado, agrupamento pra
 * balanceamento futuro — nunca lido pelo resolver.
 */
export const EXAMPLE_BASE_TRANSFORMATION_POOL: BaseTransformationPoolRegistry = {
  sword: {
    baseItemId: "sword",
    enabled: true,
    weights: [
      { transformationId: "sword-worn-down", pool: "common", weight: 60 },
      { transformationId: "sword-of-the-king", pool: "legendary", weight: 10 },
    ],
  },
  staff: {
    baseItemId: "staff",
    enabled: true,
    weights: [
      { transformationId: "staff-cracked", pool: "common", weight: 70 },
      { transformationId: "staff-of-the-lost-arcane", pool: "epic", weight: 20 },
    ],
  },
  // Fase 5 — pesos somando 100.000 de propósito, pra representar
  // 0,001% (1 em 100.000) com precisão exata pro Mítico.
  ring: {
    baseItemId: "ring",
    enabled: true,
    weights: [
      { transformationId: "ring-tarnished", pool: "common", weight: 40_000 },
      { transformationId: "ring-reshaped", pool: "rare", weight: 30_000 },
      { transformationId: "ring-of-forgotten-oaths", pool: "epic", weight: 29_999 },
      { transformationId: "ring-of-the-first-king", pool: "mythic", weight: 1 },
    ],
  },
  // Sprint 18, Fase 8 — mesma precisão de 0,001% (1 em 100.000) da
  // Sprint 17 pro Mítico, só pra provar que o pipeline funciona
  // ponta-a-ponta com uma segunda Base independente; "sem
  // balanceamento final" continua valendo (QA apenas).
  "ancient-ring": {
    baseItemId: "ancient-ring",
    enabled: true,
    weights: [
      { transformationId: "ancient-ring-twisted", pool: "rare", weight: 50_000 },
      { transformationId: "ancient-ring-consecrated", pool: "epic", weight: 49_999 },
      { transformationId: "ancient-ring-of-the-first-king", pool: "mythic", weight: 1 },
    ],
  },
};
