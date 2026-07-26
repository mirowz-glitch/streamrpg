import { getEffectiveModWeight } from "./weights.js";
import { pickWeighted, type ItemGenRandom } from "./rng.js";
import type { ItemGenBaseItem, ItemGenModDefinition, ItemGenModTier, ItemGenRarityId } from "./types.js";

// Affix Selection Redesign — Prototype Phase I.
//
// Esta Sprint isola a ÚNICA parte do Item Generator que 3 Sprints de
// auditoria (Equipment Progression Audit/Repair, Item Generation Design
// Review, Item Generation Redesign Validation) já identificaram como o
// gargalo estrutural: o MÉTODO de escolha de tier dentro de rollMod()
// (generator.ts) — nunca os afixos, tiers, thresholds ou pesos em si
// (esses continuam sendo os MESMOS dados de entrada, intocados).
//
// `AffixSelectionStrategy` é a fronteira: o restante do Item Generator
// (generator.ts) só conhece esta interface, nunca uma estratégia
// concreta — troca de estratégia é decidida de fora (ver
// `setDefaultAffixSelectionStrategy`/`options.strategy` em
// generator.ts), sem generator.ts precisar de nenhum `if (strategy === ...)`.
export interface ModRollState {
  committedGroups: Set<string>;
  blockedGroups: Set<string>;
}

export interface AffixSelectionStrategy {
  readonly id: string;

  // Escolhe até `count` mods distintos e compatíveis entre si (grupo
  // único + sem exclusão) — MESMA assinatura/contrato que
  // rollDistinctMods() já tinha antes desta Sprint. Nenhuma das duas
  // estratégias desta Sprint muda este método (o Pool de Afixos não foi
  // diagnosticado como o gargalo pelas Sprints anteriores — só o Tier
  // Roll foi); ele é parte da interface para que uma Sprint FUTURA possa
  // experimentar aqui também, sem precisar mudar a interface de novo.
  pickMods(
    rng: ItemGenRandom,
    eligiblePool: readonly ItemGenModDefinition[],
    count: number,
    base: ItemGenBaseItem,
    rarity: ItemGenRarityId,
    state: ModRollState,
    modTagWeightMultipliers: Partial<Record<string, number>> | undefined,
  ): ItemGenModDefinition[];

  // Escolhe UM tier entre os já elegíveis por `minItemLevel <= itemLevel`
  // (a filtragem de elegibilidade continua em generator.ts, igual antes —
  // a estratégia só decide ENTRE os já elegíveis, nunca amplia/reduz
  // quem é elegível). `eligibleTiers` nunca vem vazio (generator.ts só
  // chama a estratégia quando há ao menos 1 tier elegível).
  pickTier(rng: ItemGenRandom, eligibleTiers: readonly ItemGenModTier[], itemLevel: number): ItemGenModTier;
}

function isModCompatibleWithState(mod: ItemGenModDefinition, state: ModRollState): boolean {
  if (state.committedGroups.has(mod.group)) return false;
  if (state.blockedGroups.has(mod.group)) return false;
  if (mod.excludesGroups.some((group) => state.committedGroups.has(group))) return false;
  return true;
}

function commitMod(mod: ItemGenModDefinition, state: ModRollState): void {
  state.committedGroups.add(mod.group);
  for (const group of mod.excludesGroups) state.blockedGroups.add(group);
}

// Extraído de generator.ts SEM nenhuma mudança de comportamento —
// mesma ordem de chamadas de `rng()`, mesmo resultado pra mesma seed.
// Reaproveitado por AMBAS as estratégias desta Sprint (o Pool de Afixos
// não é a variável experimental aqui).
function pickModsShared(
  rng: ItemGenRandom,
  eligiblePool: readonly ItemGenModDefinition[],
  count: number,
  base: ItemGenBaseItem,
  rarity: ItemGenRarityId,
  state: ModRollState,
  modTagWeightMultipliers: Partial<Record<string, number>> | undefined,
): ItemGenModDefinition[] {
  const picked: ItemGenModDefinition[] = [];
  while (picked.length < count) {
    const candidates = eligiblePool
      .filter((mod) => isModCompatibleWithState(mod, state))
      .map((mod) => ({ mod, weight: getEffectiveModWeight(mod, base, rarity, modTagWeightMultipliers) }))
      .filter((candidate) => candidate.weight > 0);
    if (candidates.length === 0) break;

    const choice = pickWeighted(rng, candidates).mod;
    picked.push(choice);
    commitMod(choice, state);
  }
  return picked;
}

// ============================================================
// Baseline — Fase 1 do briefing ("congelar o algoritmo atual como
// referência"). `pickTier` é EXATAMENTE `pickWeighted(rng, eligibleTiers)`,
// o mesmo sorteio ponderado pelo `tier.weight` estático que o jogo usa
// hoje — zero mudança de comportamento, zero mudança de contagem/ordem
// de chamadas de `rng()`. Continua disponível para sempre (Princípio
// Fundamental: "não destruir o atual").
// ============================================================
export const CurrentAffixSelectionStrategy: AffixSelectionStrategy = {
  id: "current",
  pickMods: pickModsShared,
  pickTier(rng, eligibleTiers) {
    return pickWeighted(rng, eligibleTiers);
  },
};

// ============================================================
// Protótipo — Fase 3 do briefing. Usa EXATAMENTE os mesmos afixos,
// tiers, thresholds e pesos (`tier.weight`, `tier.minItemLevel`) já
// cadastrados em prefixes.ts/suffixes.ts como entrada — nenhum dado
// novo é criado. Só o MÉTODO de escolha muda.
//
// Root cause (Item Generation Redesign Validation, Seção 5): reescalar
// `minItemLevel` sozinho (Sprint anterior) só torna um tier melhor
// TECNICAMENTE elegível mais cedo — o sorteio dentro dos elegíveis
// continua usando o MESMO peso estático (4/16/30/50), então o tier
// pior (peso 50) continua vencendo ~50% das rolagens mesmo quando o
// tier melhor (peso 4) já está elegível há muito tempo. "Tornar um
// tier alcançável não o torna provável."
//
// Este protótipo corrige exatamente essa lacuna: pondera cada tier
// elegível por `tier.weight` × (1 + progresso), onde `progresso` mede o
// quão FUNDO o Item Level já avançou além do próprio limiar daquele
// tier, normalizado pelo intervalo de limiares JÁ elegíveis (nunca um
// número novo — só `tier.minItemLevel`/`itemLevel`, ambos já eram
// entrada do pipeline). Um tier recém-desbloqueado (progresso ≈ 0) se
// comporta como hoje; um tier em que o personagem já "cresceu" bem
// além do limiar (progresso → 1) ganha até o dobro do peso original —
// o tier melhor deixa de ficar permanentemente ofuscado pelo tier pior
// assim que o Item Level continua subindo dentro da mesma região de
// elegibilidade.
function computeProgressWeight(tier: ItemGenModTier, itemLevel: number, minThreshold: number, maxThreshold: number): number {
  const span = maxThreshold - minThreshold;
  const progress = span > 0 ? Math.min(1, Math.max(0, (itemLevel - tier.minItemLevel) / span)) : 1;
  return tier.weight * (1 + progress);
}

export const ProgressiveAffixSelectionStrategy: AffixSelectionStrategy = {
  id: "progressive",
  pickMods: pickModsShared,
  pickTier(rng, eligibleTiers, itemLevel) {
    if (eligibleTiers.length === 1) return eligibleTiers[0];

    const thresholds = eligibleTiers.map((tier) => tier.minItemLevel);
    const minThreshold = Math.min(...thresholds);
    const maxThreshold = Math.max(...thresholds);

    const weighted = eligibleTiers.map((tier) => ({
      tier,
      weight: computeProgressWeight(tier, itemLevel, minThreshold, maxThreshold),
    }));
    return pickWeighted(rng, weighted).tier;
  },
};

// ============================================================
// Seam de troca — Fase 2 do briefing: generator.ts SÓ conhece esta
// getter/setter, nunca uma estratégia concreta. Default permanente:
// CurrentAffixSelectionStrategy (Princípio Fundamental: "não destruir o
// atual"). `options.strategy` (GenerateItemOptions, generator.ts)
// sobrepõe por CHAMADA, sem tocar neste default — usado pelo Monte
// Carlo isolado do script de comparação. Este setter/getter (default
// GLOBAL, restaurável) existe só para o caso em que a estratégia precisa
// atravessar chamadas que o próprio Item Generator não controla (Loot
// Generator → Adventure Loop → Dungeon Controller, nenhum dos quais
// aceita ou repassa um parâmetro de estratégia) — mesmo padrão já
// validado na Sprint "Item Generation Redesign Validation"
// (mutar → medir → restaurar), agora para a estratégia em vez dos dados.
let defaultStrategy: AffixSelectionStrategy = CurrentAffixSelectionStrategy;

export function getDefaultAffixSelectionStrategy(): AffixSelectionStrategy {
  return defaultStrategy;
}

export function setDefaultAffixSelectionStrategy(strategy: AffixSelectionStrategy): void {
  defaultStrategy = strategy;
}

export function resetDefaultAffixSelectionStrategy(): void {
  defaultStrategy = CurrentAffixSelectionStrategy;
}
