/**
 * Sprint 18 — Fase 8: "Criar apenas 3 exemplos QA... sem conteúdo
 * definitivo." Liga o `MythicRegistry`/`DiscoverableBaseRegistry`
 * (Fase 2-4) aos dados de exemplo já existentes em
 * transformation/exampleTransformations.ts (Sprint 17 + a Base
 * "ancient-ring" acrescentada nesta Sprint). Nenhuma tabela nova no
 * banco — mesmo padrão estático de `EXAMPLE_BASE_TRANSFORMATIONS`.
 */
import type { DiscoverableBaseRegistry, MythicDefinition, MythicRegistry } from "./types.js";

/**
 * Só 1 Mítico de exemplo — "não popular dezenas" (Fase 2). `baseItem`
 * aponta pra "ancient-ring" (a cadeia literal do brief: Anel Antigo ->
 * Anel Retorcido -> Anel Consagrado -> Anel do Primeiro Rei); o mesmo
 * `revealedName` também existe via a Base "ring" (Sprint 17) — ambos
 * são caminhos válidos pro MESMO Mítico, nunca dois Míticos diferentes
 * com o mesmo nome (a Discovery, Fase 5, é por `mythicId`, não por
 * Base de origem).
 */
export const EXAMPLE_MYTHIC_REGISTRY: MythicRegistry = {
  "ring-of-the-first-king": {
    id: "ring-of-the-first-king",
    displayName: "Anel do Primeiro Rei",
    baseItem: "ancient-ring",
    lore: "Dizem que pertenceu ao primeiro a sentar no trono — ninguém sabe dizer se é verdade, só que o anel sempre aparece onde menos se espera.",
    exclusiveSource: "uncertainty",
    rarity: "legendary",
    enabled: true,
    discoverable: true,
  },
};

/**
 * `possibleTransformations` referencia `BaseTransformation.id`
 * (transformation/exampleTransformations.ts) — nunca duplica os dados
 * da transformação em si, só declara "esta Base pode produzir estes
 * resultados". Inclui as 3 Bases da Sprint 17 (sword/staff/ring, sem
 * alterar nenhuma) + a nova "ancient-ring".
 */
export const EXAMPLE_DISCOVERABLE_BASES: DiscoverableBaseRegistry = {
  sword: {
    baseItemId: "sword",
    supportsUncertainty: true,
    supportsMythic: false,
    possibleTransformations: ["sword-worn-down", "sword-of-the-king"],
  },
  staff: {
    baseItemId: "staff",
    supportsUncertainty: true,
    supportsMythic: false,
    possibleTransformations: ["staff-cracked", "staff-of-the-lost-arcane"],
  },
  ring: {
    baseItemId: "ring",
    supportsUncertainty: true,
    supportsMythic: true,
    possibleTransformations: ["ring-tarnished", "ring-reshaped", "ring-of-forgotten-oaths", "ring-of-the-first-king"],
  },
  "ancient-ring": {
    baseItemId: "ancient-ring",
    supportsUncertainty: true,
    supportsMythic: true,
    possibleTransformations: ["ancient-ring-twisted", "ancient-ring-consecrated", "ancient-ring-of-the-first-king"],
  },
};

export function isMythicDisplayName(displayName: string): boolean {
  return Object.values(EXAMPLE_MYTHIC_REGISTRY).some((def: MythicDefinition) => def.enabled && def.displayName === displayName);
}
