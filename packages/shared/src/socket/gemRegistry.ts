/**
 * Sprint 20 — Fase 5: Gem Registry. Único ponto de leitura de
 * `GemDefinition` — mesmo princípio de `mythic/registry.ts` (Sprint 18)
 * e `baseIdentity/registry.ts` (Sprint 19): funções puras, sem I/O,
 * "nada hardcoded" em nenhum serviço da API.
 */
import type { GemCategory, GemDefinition, GemDefinitionRegistry } from "./gemDefinition.js";

export function getGemDefinition(registry: GemDefinitionRegistry, gemId: string): GemDefinition | undefined {
  return registry[gemId];
}

export function listGemDefinitions(registry: GemDefinitionRegistry): GemDefinition[] {
  return Object.values(registry);
}

export function listEnabledGemDefinitions(registry: GemDefinitionRegistry): GemDefinition[] {
  return listGemDefinitions(registry).filter((def) => def.enabled);
}

export function listGemDefinitionsByCategory(registry: GemDefinitionRegistry, category: GemCategory): GemDefinition[] {
  return listGemDefinitions(registry).filter((def) => def.category === category);
}

/**
 * Fase 10 — nome pra exibição na UI. `Gem.gemType` (instância, Sprint
 * 15) é um vocabulário aberto que pode não ter uma `GemDefinition`
 * registrada ainda (ex.: Gemas de QA criadas antes desta Sprint) —
 * cai pro próprio `gemType` cru nesse caso, nunca lança/inventa nome.
 */
export function resolveGemDisplayName(registry: GemDefinitionRegistry, gemType: string): string {
  return registry[gemType]?.displayName ?? gemType;
}

/**
 * Fase 12 — exemplo de referência, "Gema Rubi III" é literalmente o
 * exemplo do brief (Decisão Oficial). Poucas entradas de propósito —
 * mesmo espírito de `EXAMPLE_MYTHIC_REGISTRY` (Sprint 18): "nenhuma
 * Gema poderosa será criada" continua valendo (herdado da restrição
 * original da Sprint 15, reafirmado aqui por "NÃO implementar:
 * Gemas lendárias").
 *
 * Sprint 21 — Gem Effects Phase I, Fase 4: cada Gema agora referencia
 * um `GemEffect` (`effectId`, ver `gemEffect.ts`/`gemEffectRegistry.ts`)
 * sempre que sua `category` corresponde a um dos 7 tipos de exemplo QA
 * desta Sprint. `topaz-1` (categoria `utility`) deliberadamente NÃO
 * ganha `effectId` — `utility` está fora dos 7 tipos pedidos pelo
 * brief, "não inventa um efeito que o brief não pediu". 4 Gemas novas
 * (`onyx-1`/`amethyst-1`/`citrine-1`/`opal-1`) cobrem os 4 tipos que
 * nenhuma Gema da Sprint 20 usava (defense/critical/attackSpeed/magic)
 * — `attackSpeed` usa a categoria `movement` (mais próxima já existente
 * em `GemCategory`; não existe categoria "attackSpeed" dedicada).
 *
 * Sprint 23 — Sockets & Gems Phase II, Fase 3: 6 Gemas (as mesmas 6
 * nomeadas pelo brief) ganham `behaviorId` também — uma SEGUNDA
 * referência, independente de `effectId` (ver gemDefinition.ts).
 * `onyx-1`/`amethyst-1` mantêm seus `effectId` originais (defesa/
 * crítico numéricos, Sprint 21) e ganham comportamentos DIFERENTES
 * (crítico/resistência) — prova viva de "GemEffect e GemBehavior nunca
 * são a mesma coisa", mesmo quando o vocabulário se parece.
 */
export const EXAMPLE_GEM_DEFINITION_REGISTRY: GemDefinitionRegistry = {
  "ruby-1": { id: "ruby-1", displayName: "Rubi I", tier: 1, category: "attack", effect: "Aumenta dano físico.", tags: ["attack", "critical"], tradable: true, enabled: true, effectId: "attack-percent-1", behaviorId: "ruby-fire-proc-1" },
  "ruby-2": { id: "ruby-2", displayName: "Rubi II", tier: 2, category: "attack", effect: "Aumenta dano físico.", tags: ["attack", "critical"], tradable: true, enabled: true, effectId: "attack-percent-1", behaviorId: "ruby-fire-proc-1" },
  "ruby-3": { id: "ruby-3", displayName: "Rubi III", tier: 3, category: "attack", effect: "Aumenta dano físico.", tags: ["attack", "critical"], tradable: true, enabled: true, effectId: "attack-percent-1", behaviorId: "ruby-fire-proc-1" },
  "sapphire-1": { id: "sapphire-1", displayName: "Safira I", tier: 1, category: "mana", effect: "Aumenta reserva de mana.", tags: ["mana", "magic"], tradable: true, enabled: true, effectId: "mana-flat-1", behaviorId: "sapphire-chill-1" },
  "emerald-1": { id: "emerald-1", displayName: "Esmeralda I", tier: 1, category: "life", effect: "Aumenta vida máxima.", tags: ["life", "defense"], tradable: true, enabled: true, effectId: "life-flat-1", behaviorId: "emerald-regen-1" },
  "topaz-1": { id: "topaz-1", displayName: "Topázio I", tier: 1, category: "utility", effect: "Reduz tempo de recuperação.", tags: ["utility", "support"], tradable: true, enabled: true, behaviorId: "topaz-mana-1" },
  "onyx-1": { id: "onyx-1", displayName: "Ônix I", tier: 1, category: "defense", effect: "Aumenta resistência.", tags: ["defense"], tradable: true, enabled: true, effectId: "defense-percent-1", behaviorId: "onyx-crit-1" },
  "amethyst-1": { id: "amethyst-1", displayName: "Ametista I", tier: 1, category: "critical", effect: "Aumenta chance de crítico.", tags: ["critical"], tradable: true, enabled: true, effectId: "critical-flat-1", behaviorId: "amethyst-resist-1" },
  "citrine-1": { id: "citrine-1", displayName: "Citrino I", tier: 1, category: "movement", effect: "Aumenta velocidade de ataque.", tags: ["movement"], tradable: true, enabled: true, effectId: "attackspeed-flat-1" },
  "opal-1": { id: "opal-1", displayName: "Opala I", tier: 1, category: "magic", effect: "Aumenta dano mágico.", tags: ["magic"], tradable: true, enabled: true, effectId: "magic-flat-1" },
};
