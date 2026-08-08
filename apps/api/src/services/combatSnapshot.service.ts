/**
 * Sprint 22 — Living Combat Phase I. O único ponto da API que agrega
 * itens equipados + efeitos de Gema ativos e monta um `CombatSnapshotDTO`
 * real (packages/shared/src/combat/combatSnapshot.ts) — usado tanto por
 * `/api/character` (routes/character.ts) quanto por `BossCombatSystem`
 * (systems/BossCombatSystem.ts). "Nunca duas versões": antes desta
 * Sprint, `character.ts` fazia esse laço inline e `BossCombatSystem`
 * usava um modelo simples paralelo (`getCombatAttributes()` +
 * `CRITICAL_HIT_CHANCE` fixo) — os dois convergem aqui.
 */
import {
  buildCombatSnapshot,
  resolveActiveGemEffects,
  resolveActiveGemBehaviors,
  EXAMPLE_GEM_DEFINITION_REGISTRY,
  EXAMPLE_GEM_EFFECT_REGISTRY,
  EXAMPLE_GEM_BEHAVIOR_REGISTRY,
} from "@streamrpg/shared";
import type { ActiveGemEffect, ActiveGemBehavior, CombatSnapshotDTO, EquippedItem } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { getEquippedItems } from "./drop.service.js";
import { getSocketGemTypes } from "./gem.service.js";

/**
 * Agrega o Effect Resolver (packages/shared, puro) através de TODOS os
 * itens equipados — só consulta `gems` (getSocketGemTypes) pra itens
 * que já têm ao menos um Socket `filled`. "Nunca persistir bônus.
 * Sempre recalcular."
 */
export function resolveAllActiveGemEffectsForEquippedItems(equipped: readonly EquippedItem[]): ActiveGemEffect[] {
  const all: ActiveGemEffect[] = [];
  for (const item of equipped) {
    if (!item.sockets || !item.sockets.sockets.some((s) => s.state === "filled")) continue;
    // `gems.socketed_item_id` referencia `items.id` (item.item_id),
    // NUNCA `character_items.id` (item.character_item_id) — mesma
    // distinção já documentada em `getSocketGemDisplayNames`/
    // `getSocketGemEffectDescriptions` (Sprint 20/21).
    const socketGemTypes = getSocketGemTypes(item.item_id);
    all.push(...resolveActiveGemEffects(item.sockets, socketGemTypes, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY));
  }
  return all;
}

/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 3: mesmo padrão de
 * `resolveAllActiveGemEffectsForEquippedItems`, agora pro Behavior
 * Resolver — reusado tanto por `/api/character` quanto por
 * `BossCombatSystem` (Fase 8), nunca duplicado.
 */
export function resolveAllActiveGemBehaviorsForEquippedItems(equipped: readonly EquippedItem[]): ActiveGemBehavior[] {
  const all: ActiveGemBehavior[] = [];
  for (const item of equipped) {
    if (!item.sockets || !item.sockets.sockets.some((s) => s.state === "filled")) continue;
    const socketGemTypes = getSocketGemTypes(item.item_id);
    all.push(...resolveActiveGemBehaviors(item.sockets, socketGemTypes, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY));
  }
  return all;
}

/**
 * `null` quando o personagem não existe — mesmo padrão de
 * `CharacterRepository.getCombatAttributes()` (o modelo que este
 * substitui em BossCombatSystem).
 */
export function getCombatSnapshotForCharacter(characterId: string): CombatSnapshotDTO | null {
  const row = getDb().prepare("SELECT xp FROM characters WHERE id = ?").get(characterId) as { xp: number } | undefined;
  if (!row) return null;

  const equipped = getEquippedItems(characterId);
  const activeGemEffects = resolveAllActiveGemEffectsForEquippedItems(equipped);
  const activeGemBehaviors = resolveAllActiveGemBehaviorsForEquippedItems(equipped);
  return buildCombatSnapshot(characterId, row.xp, equipped, activeGemEffects, activeGemBehaviors);
}
