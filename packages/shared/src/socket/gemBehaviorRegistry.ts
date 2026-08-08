/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 3. Único ponto de leitura
 * de `GemBehavior` — mesmo princípio de `gemEffectRegistry.ts`
 * (Sprint 21): funções puras, sem I/O, "nada hardcoded" em nenhum
 * serviço da API.
 */
import type { GemBehavior, GemBehaviorKind, GemBehaviorRegistry } from "./gemBehavior.js";

export function getGemBehavior(registry: GemBehaviorRegistry, behaviorId: string): GemBehavior | undefined {
  return registry[behaviorId];
}

export function listGemBehaviors(registry: GemBehaviorRegistry): GemBehavior[] {
  return Object.values(registry);
}

export function listEnabledGemBehaviors(registry: GemBehaviorRegistry): GemBehavior[] {
  return listGemBehaviors(registry).filter((behavior) => behavior.enabled);
}

export function listGemBehaviorsByKind(registry: GemBehaviorRegistry, kind: GemBehaviorKind): GemBehavior[] {
  return listGemBehaviors(registry).filter((behavior) => behavior.kind === kind);
}

/**
 * Fase 4 — exatamente os 6 comportamentos nomeados pelo brief. "Não
 * adicionar dezenas de Gemas. Criar a infraestrutura definitiva."
 * `magnitude` documentado por linha — cada unidade é a que o ponto de
 * consumo real espera (ver adventureLoop.ts/recoveryLayer.ts/
 * BossCombatSystem.ts, Fase 6/7/8).
 */
export const EXAMPLE_GEM_BEHAVIOR_REGISTRY: GemBehaviorRegistry = {
  // magnitude = dano físico aditivo, somado após variância/crítico,
  // antes da mitigação (atravessa Armor normalmente — nunca bypassa).
  "ruby-fire-proc-1": {
    id: "ruby-fire-proc-1",
    kind: "onHitBonusFireDamage",
    magnitude: 3,
    enabled: true,
    description: "Ataques causam +3 de dano adicional.",
  },
  // magnitude = % de chance (0-100) de reduzir o próximo contra-ataque
  // inimigo pela metade nesta mesma tick.
  "sapphire-chill-1": {
    id: "sapphire-chill-1",
    kind: "chanceToChill",
    magnitude: 10,
    enabled: true,
    description: "10% de chance de congelar o inimigo, reduzindo o contra-ataque pela metade.",
  },
  // magnitude = vida flat somada à cura de fim de encontro (Recovery
  // Layer) sempre que ela já ocorre — nunca um segundo gatilho de cura.
  "emerald-regen-1": {
    id: "emerald-regen-1",
    kind: "regenPerTick",
    magnitude: 4,
    enabled: true,
    description: "Regenera +4 de vida extra ao fim de cada encontro.",
  },
  // magnitude = mana flat — hoje só derivado/exibido (nenhum sistema
  // gasta mana ainda), documentado honestamente, nunca inventa consumo.
  "topaz-mana-1": {
    id: "topaz-mana-1",
    kind: "manaPerTick",
    magnitude: 2,
    enabled: true,
    description: "Regenera 2 de mana por avanço.",
  },
  // magnitude = pontos percentuais extras somados à chance de crítico
  // real (Combat Snapshot), nunca um multiplicador fixo.
  "onyx-crit-1": {
    id: "onyx-crit-1",
    kind: "bonusCriticalChance",
    magnitude: 3,
    enabled: true,
    description: "+3 pontos de chance de crítico.",
  },
  // magnitude = % de redução do dano recebido em combate.
  "amethyst-resist-1": {
    id: "amethyst-resist-1",
    kind: "bonusResistance",
    magnitude: 5,
    enabled: true,
    description: "Reduz o dano recebido em 5%.",
  },
};
