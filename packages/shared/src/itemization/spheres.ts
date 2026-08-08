/**
 * Sprint 10 — Esferas (Fase 7). Infraestrutura apenas — nenhuma lógica
 * de aplicação real, nenhum consumidor de produção. Modelo inspirado
 * nas Orbs de Path of Exile, adaptado ao vocabulário do StreamRPG.
 */
import type { ItemCraftState } from "./types.js";

// Sprint 16 — Economy Foundation: "uncertainty" adicionada — mesmo
// vocabulário de posse/consumo (character_spheres, GET /api/items/
// spheres), mas efeito fundamentalmente diferente das outras 5 (nunca
// determinística — ver transformation/, packages/shared/src). Nunca
// usar o nome "Chance" (decisão oficial do brief: Mirror não existe,
// e esta Esfera não é um equivalente a nenhuma Orb específica de
// nenhum outro jogo, só inspirada na LÓGICA econômica).
export type SphereTypeId = "fortune" | "purification" | "lapidation" | "ascension" | "curse" | "uncertainty";

export type SphereTarget = "affix" | "quality" | "potential" | "craft_state" | "whole_item";

export type SphereRestriction =
  | "none"
  | "requires_open_craft_state"
  | "requires_rarity_at_least_rare"
  | "requires_no_existing_affixes";

export type SphereRarity = "common" | "uncommon" | "rare" | "very_rare";

/** Efeito ainda sem implementação — só o CONTRATO que uma função real precisaria satisfazer. */
export interface SphereEffect {
  description: string;
  target: SphereTarget;
}

export interface SphereType {
  id: SphereTypeId;
  name: string;
  description: string;
  effect: SphereEffect;
  restrictions: SphereRestriction[];
  /** Só um peso de escassez de drop/preço, nunca poder — mesmo espírito de `ItemGenRarityDefinition.dropWeight`. */
  rarity: SphereRarity;
}

/**
 * As 5 Esferas previstas pelo brief — dados apenas. Nenhuma tem lógica
 * de aplicação real ainda ("Fase 7: Somente a infraestrutura. Nenhuma
 * lógica completa.").
 */
export const SPHERE_DEFINITIONS: readonly SphereType[] = [
  {
    id: "fortune",
    name: "Esfera da Fortuna",
    description: "Rerola o valor de um afixo existente, dentro da faixa do seu tier atual.",
    effect: { description: "Reroll de valor, mesmo tier.", target: "affix" },
    restrictions: ["requires_open_craft_state"],
    rarity: "common",
  },
  {
    id: "purification",
    name: "Esfera da Purificação",
    description: "Remove um afixo existente do item.",
    effect: { description: "Remove um afixo.", target: "affix" },
    restrictions: ["requires_open_craft_state"],
    rarity: "uncommon",
  },
  {
    id: "lapidation",
    name: "Esfera da Lapidação",
    description: "Aumenta a Qualidade do item, até o limite do seu Potencial.",
    effect: { description: "Incrementa Quality, respeitando Potential.", target: "quality" },
    restrictions: ["requires_open_craft_state"],
    rarity: "uncommon",
  },
  {
    id: "ascension",
    name: "Esfera da Ascensão",
    description: "Adiciona um novo afixo (prefixo ou sufixo), respeitando os limites de raridade do item.",
    effect: { description: "Adiciona um afixo novo.", target: "affix" },
    restrictions: ["requires_open_craft_state", "requires_rarity_at_least_rare"],
    rarity: "rare",
  },
  {
    id: "curse",
    name: "Esfera da Maldição",
    description:
      "Sela o item permanentemente. Depois disso: não aceita novas Esferas, não aceita reroll, não aceita reforja, não aceita alteração. Continua podendo: equipar, vender, dropar, herdar, ganhar Legado.",
    effect: { description: "Transiciona craftState 'open' -> 'sealed'. Terminal — sem volta.", target: "craft_state" },
    restrictions: ["requires_open_craft_state"],
    rarity: "very_rare",
  },
  {
    id: "uncertainty",
    name: "Esfera da Incerteza",
    description:
      "Nunca melhora um item diretamente — oferece apenas uma possibilidade. O resultado depende inteiramente da Base: pode não acontecer nada, ou revelar uma versão especial/mítica. Nem toda Base aceita esta Esfera.",
    effect: { description: "Rola uma transformação data-driven (transformation/); pode não fazer nada.", target: "whole_item" },
    restrictions: ["requires_open_craft_state"],
    rarity: "rare",
  },
];

export function getSphereDefinition(id: SphereTypeId): SphereType {
  const found = SPHERE_REGISTRY[id];
  if (!found) throw new Error(`Sphere: tipo desconhecido "${id}"`);
  return found;
}

/**
 * Sprint 24 — Economy Foundation II, Fase 4: "Registrar oficialmente as
 * Esferas existentes" — as 6 já estavam completas em
 * `SPHERE_DEFINITIONS` desde a Sprint 16 (Incerteza incluída); este é
 * só o formato de lookup por chave (mesmo padrão de
 * `GemDefinitionRegistry`/`GemEffectRegistry`/`GemBehaviorRegistry`,
 * Sprints 20/21/23) — nunca uma segunda fonte de dado, `SPHERE_REGISTRY`
 * é DERIVADO de `SPHERE_DEFINITIONS`, nunca escrito à mão em paralelo.
 */
export type SphereRegistry = Record<SphereTypeId, SphereType>;

export const SPHERE_REGISTRY: SphereRegistry = Object.fromEntries(SPHERE_DEFINITIONS.map((sphere) => [sphere.id, sphere])) as SphereRegistry;

/**
 * Estado runtime de uma Esfera na posse de um personagem — ainda sem
 * nenhum inventário/tabela real por trás (fica para a Sprint que
 * implementar Crafting de verdade).
 */
export interface SphereState {
  typeId: SphereTypeId;
  ownedByCharacterId: string;
  quantity: number;
}

/**
 * Garante que um item selado nunca pode receber outra Esfera — a
 * garantia central da Esfera da Maldição. Pura, testável, sem I/O.
 */
export function canApplySphere(itemCraftState: ItemCraftState, sphereId: SphereTypeId): boolean {
  if (itemCraftState === "sealed") return false;
  void sphereId;
  return true;
}

export interface SphereValidationResult {
  ok: boolean;
  reason?: "item-sealed";
}

/**
 * Sprint 11 introduziu esta validação com só a Maldição passando
 * ("Fortuna/Purificação/Lapidação/Ascensão continuam SEM lógica de
 * crafting real"). Sprint 12 (Crafting Phase I) fecha essa lacuna — as
 * 5 Esferas agora têm efeito real (`crafting/sphereCrafting.ts` para as
 * 4 novas, `applySphere()` abaixo para a Maldição) — `validateSphere()`
 * volta a checar só a única regra estrutural que nunca mudou: um item
 * `sealed` nunca aceita NENHUMA Esfera, nem para reroll/purificação/
 * ascensão/lapidação.
 */
export function validateSphere(itemCraftState: ItemCraftState, sphereId: SphereTypeId): SphereValidationResult {
  void sphereId;
  if (!canApplySphere(itemCraftState, sphereId)) return { ok: false, reason: "item-sealed" };
  return { ok: true };
}

export interface SphereApplicationResult {
  success: boolean;
  newCraftState?: ItemCraftState;
  reason?: SphereValidationResult["reason"];
}

/**
 * Transição de `craft_state` da Esfera da Maldição — a ÚNICA das 5
 * Esferas cujo efeito é mudar o estado de craft em si (`target:
 * "craft_state"`, ver `SPHERE_DEFINITIONS` acima). As outras 4 Esferas
 * (Sprint 12, Crafting Phase I) têm efeito real sobre afixos/quality,
 * não sobre craft_state — ver `crafting/sphereCrafting.ts`
 * (`rerollAffixValues`/`removeRandomAffix`/`addRandomAffix`/
 * `increaseQuality`); `apps/api/src/services/sphere.service.ts` chama
 * ESTA função só quando `sphereId === "curse"`.
 */
export function applySphere(itemCraftState: ItemCraftState, sphereId: "curse"): SphereApplicationResult {
  const validation = validateSphere(itemCraftState, sphereId);
  if (!validation.ok) return { success: false, reason: validation.reason };
  return { success: true, newCraftState: "sealed" };
}
