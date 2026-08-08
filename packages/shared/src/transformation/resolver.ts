/**
 * Sprint 17 — Esfera da Incerteza 2.0. Resolução pura da Esfera —
 * nunca lê banco, nunca decide RNG sozinha (recebe `roll` já sorteado,
 * mesmo princípio de `sphere.service.ts`: entropia real só na fronteira
 * da API, `packages/shared` continua determinístico por entrada — D1).
 *
 * DECISÃO OFICIAL desta Sprint: a Esfera NUNCA falha — não existe mais
 * um caminho de retorno "nada aconteceu" (Sprint 16 tinha `noneWeight`/
 * `type: "none"`; ambos foram removidos). Toda chamada a
 * `resolveUncertaintyOutcome()` sobre uma Base elegível SEMPRE devolve
 * um `TransformationOutcomeResult` real.
 */
import type { ItemRarity } from "../types.js";
import type { BaseTransformation, BaseTransformationPoolRegistry, TransformationCondition, TransformationOutcomeResult } from "./types.js";

const RARITY_ORDER: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

function conditionsMet(conditions: TransformationCondition[], itemRarity: ItemRarity, itemLevel: number): boolean {
  return conditions.every((condition) => {
    if (condition.kind === "min_item_level") return itemLevel >= condition.value;
    if (condition.kind === "rarity_at_least") return RARITY_ORDER.indexOf(itemRarity) >= RARITY_ORDER.indexOf(condition.value);
    return true;
  });
}

/**
 * "Nem toda Base pode utilizar a Esfera da Incerteza" — Base ausente do
 * registro OU com `enabled: false` no seu próprio pool é o sinal de
 * inelegibilidade (Fase 4: "pode usar Esfera?").
 */
export function isBaseEligibleForUncertainty(baseItemId: string, registry: BaseTransformationPoolRegistry): boolean {
  return registry[baseItemId]?.enabled === true;
}

/**
 * Sprint 24 — Economy Foundation II, Fase 4: o brief pede um
 * `uncertaintyOnly=true` num Base Item — esse conceito já existe desde
 * a Sprint 17 como `BaseTransformation.exclusiveSource: "uncertainty"`
 * (mais geral: cobre outras fontes exclusivas futuras também, ex.
 * `world_event`/`npc`/`quest`). Nunca criar um segundo campo booleano
 * paralelo — este predicado só nomeia o caso `"uncertainty"` da mesma
 * forma que o brief pede, sem duplicar o dado.
 */
export function isUncertaintyExclusive(transformation: Pick<BaseTransformation, "exclusiveSource">): boolean {
  return transformation.exclusiveSource === "uncertainty";
}

/**
 * Rola um único uso da Esfera da Incerteza contra uma Base elegível.
 * `roll` é um número em [0, 1) já sorteado pelo chamador (crypto real
 * na API) — esta função só distribui esse número pelos pesos das
 * transformações ELEGÍVEIS (enabled + condições satisfeitas) daquela
 * Base. Nunca chamada para uma Base inelegível (o chamador checa
 * `isBaseEligibleForUncertainty` antes).
 *
 * Lança erro se nenhuma transformação for elegível — isso é sempre um
 * ERRO DE CONFIGURAÇÃO (uma Base com `enabled: true` precisa garantir
 * pelo menos uma transformação incondicional), nunca um resultado
 * válido pro jogador: "a Esfera nunca falha" significa que este roll
 * NUNCA pode devolver nada além de uma transformação real.
 */
export function resolveUncertaintyOutcome(
  baseItemId: string,
  itemRarity: ItemRarity,
  itemLevel: number,
  registry: BaseTransformationPoolRegistry,
  transformations: readonly BaseTransformation[],
  roll: number,
): TransformationOutcomeResult {
  const pool = registry[baseItemId];
  if (!pool || !pool.enabled) {
    throw new Error(`resolveUncertaintyOutcome: Base "${baseItemId}" não é elegível — o chamador deveria ter checado isBaseEligibleForUncertainty() antes.`);
  }

  const eligible = pool.weights
    .map((w) => ({ weight: w.weight, transformation: transformations.find((t) => t.id === w.transformationId) }))
    .filter(
      (entry): entry is { weight: number; transformation: BaseTransformation } =>
        entry.transformation !== undefined && entry.transformation.enabled && conditionsMet(entry.transformation.conditions, itemRarity, itemLevel),
    );

  const totalWeight = eligible.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    throw new Error(
      `resolveUncertaintyOutcome: Base "${baseItemId}" está elegível mas não tem nenhuma transformação disponível pro item atual (nível ${itemLevel}, raridade ${itemRarity}) — erro de configuração do BaseTransformationPool: toda Base elegível precisa garantir pelo menos uma transformação incondicional.`,
    );
  }

  let cursor = roll * totalWeight;
  for (const entry of eligible) {
    if (cursor < entry.weight) {
      const t = entry.transformation;
      return {
        outcome: t.outcome,
        transformationId: t.id,
        revealedName: t.revealedName,
        revealedRarity: t.revealedRarity,
        detail: `${t.revealedName}`,
      };
    }
    cursor -= entry.weight;
  }

  // Segurança contra erro de arredondamento de ponto flutuante — devolve a última elegível em vez de lançar.
  const last = eligible[eligible.length - 1]!.transformation;
  return { outcome: last.outcome, transformationId: last.id, revealedName: last.revealedName, revealedRarity: last.revealedRarity, detail: last.revealedName };
}
