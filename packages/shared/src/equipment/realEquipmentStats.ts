/**
 * Sprint 22 — Living Combat Phase I. A fonte REAL de `CharacterStats` —
 * irmã de `calculateCharacterStats()` (stats.ts, que lê a classe
 * `Equipment` populada por um kit inicial de sessão), mas lendo direto
 * dos itens PERSISTIDOS de um personagem real (`EquippedItem[]`, já
 * carregando raridade/afixos/Sockets/Gemas/Base Identity — tudo que as
 * Sprints 10-21 já constroem). "Nunca dois cálculos de equipamento":
 * as duas funções convergem no MESMO `applyAffixesToStats`/
 * `STAT_LABEL_BUCKET`/`getItemPower` — a única coisa que muda é DE
 * ONDE os dados vêm, nunca COMO são somados.
 */
import { getItemPower } from "../items.js";
import type { EquippedItem, InventoryItem } from "../types.js";
import type { ActiveGemEffect } from "../socket/gemEffectResolver.js";
import type { GemEffectStatType } from "../socket/gemEffect.js";
import { BASE_IDENTITY_REGISTRY, getBaseIdentity } from "../baseIdentity/index.js";
import { applyAffixesToStats, createEmptyCharacterStats, type NumericStatKey } from "./stats.js";
import type { CharacterStats } from "./types.js";

/**
 * Fase 2 — Implicit Mods (Base Identity, Sprint 19) chegaram como
 * texto em português (`baseIdentities.ts`: "Velocidade de Ataque",
 * "Dano", etc — pensado pra exibição, nunca pra cálculo). Esta é a
 * ÚNICA tradução PT->`NumericStatKey` do projeto — nunca duplicada.
 * Labels fora daqui são ignorados (mesmo princípio de
 * `STAT_LABEL_BUCKET`: "nunca inventa um stat que a Base não pediu").
 * "Velocidade de Conjuração" mapeia pra `attackSpeed` — aproximação
 * documentada: não existe um stat de "cast speed" separado hoje no
 * vocabulário de 7 tipos pedido pelo brief, e `attackSpeed` é o mais
 * próximo semanticamente (velocidade de ação).
 */
const IMPLICIT_MOD_LABEL_TO_STAT: Partial<Record<string, NumericStatKey>> = {
  "Velocidade de Ataque": "attackSpeed",
  "Velocidade de Conjuração": "attackSpeed",
  Dano: "attack",
  "Chance de Acerto Crítico": "critical",
  "Dano de Feitiço": "spellDamage",
  Magia: "spellDamage",
  "Dano Mágico": "spellDamage",
  "Resistência Física": "defense",
  "Velocidade de Movimento": "movementSpeed",
  "Vida Máxima": "life",
};

/**
 * Fase 2 — mapeia o `type` de um `GemEffect` (Sprint 21,
 * `GemEffectStatType`) pro campo de `CharacterStats` que ele alimenta.
 * `magic` cai em `spellDamage` (mesmo destino de "Dano Mágico"/Dano de
 * Feitiço" acima — um único conceito de "dano mágico" em todo o
 * modelo, nunca um `CharacterStats.magic` paralelo).
 */
const GEM_EFFECT_TYPE_TO_STAT: Record<GemEffectStatType, NumericStatKey> = {
  attack: "attack",
  defense: "defense",
  critical: "critical",
  life: "life",
  mana: "mana",
  attackSpeed: "attackSpeed",
  magic: "spellDamage",
};

/**
 * Fase 2 — Combat Resolver, a metade "equipamento real" do pipeline.
 * Recebe os itens equipados (já com afixos/qualidade/craft_state/
 * Sockets/base_item_id — todo o shape de `EquippedItem`, Sprints
 * 10-21) + os efeitos de Gema já resolvidos (Sprint 21's
 * `resolveActiveGemEffects`, chamado por quem tem acesso a `gems`
 * (apps/api) — este módulo nunca faz I/O, só soma).
 *
 * Ordem de aplicação (mesmo princípio de "nunca ordem-dependente" do
 * Resolver de Gemas, Sprint 21): base (raridade+slot+afixos+Implicit
 * Mods) é somada primeiro num `CharacterStats` "flat"; Gemas (percent)
 * sempre leem esse `flat` como base, nunca o resultado já modificado
 * por outra Gema.
 */
export function calculateCharacterStatsFromEquippedItems(items: readonly EquippedItem[], activeGemEffects: readonly ActiveGemEffect[]): CharacterStats {
  const stats = createEmptyCharacterStats();

  for (const item of items) {
    const power = getItemPower(item.rarity, item.slot);
    stats.attack += power.attack;
    stats.defense += power.defense;

    applyAffixesToStats(stats, item.affixes);

    const identity = item.baseIdentity ? getBaseIdentity(BASE_IDENTITY_REGISTRY, findBaseIdOf(item)) : undefined;
    if (identity) {
      for (const mod of identity.implicitMods) {
        const bucket = IMPLICIT_MOD_LABEL_TO_STAT[mod.statLabel];
        if (!bucket) continue;
        const delta = mod.unit === "percent" ? stats[bucket] * (mod.value / 100) : mod.value;
        stats[bucket] += delta;
      }
    }

    stats.powerScore += item.power_score ?? 0;
  }

  // Gemas (Sprint 21) — leem o `stats` já somado por Base+Afixos+Implicit
  // Mods de TODOS os itens (o "flat" desta função), nunca o resultado
  // parcial de outra Gema — mesma garantia de "ordem nunca importa" do
  // `applyGemEffectsToStats` original.
  const flatSnapshot = { ...stats };
  for (const active of activeGemEffects) {
    const bucket = GEM_EFFECT_TYPE_TO_STAT[active.effect.type];
    const delta = active.effect.scaling === "percent" ? flatSnapshot[bucket] * (active.effect.value / 100) : active.effect.value;
    stats[bucket] += delta;
  }

  return stats;
}

// `EquippedItem`/`InventoryItem` não guardam `base_item_id` cru (só o
// `BaseIdentitySummary` já resolvido) — reconstituído aqui a partir do
// `displayName` do resumo (1:1 com `BaseIdentity.displayName`, Sprint
// 19), nunca uma segunda fonte de id. `undefined` (item sem
// baseIdentity, ex. catálogo fixo pré-Sprint 11) é tratado como "sem
// Implicit Mods", nunca um erro.
function findBaseIdOf(item: Pick<EquippedItem | InventoryItem, "baseIdentity">): string {
  if (!item.baseIdentity) return "";
  const match = Object.values(BASE_IDENTITY_REGISTRY).find((def) => def.displayName === item.baseIdentity!.displayName);
  return match?.id ?? "";
}
