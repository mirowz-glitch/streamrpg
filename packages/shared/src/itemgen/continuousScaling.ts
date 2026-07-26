import { ITEM_GEN_PREFIXES } from "./prefixes.js";
import { ITEM_GEN_SUFFIXES } from "./suffixes.js";
import { randomInt, type ItemGenRandom } from "./rng.js";
import { MAX_LEVEL } from "../xp.js";
import type { ItemGenModTier } from "./types.js";

// Continuous Affix Scaling Phase I — substitui o sistema de tiers com
// degraus rígidos (elegibilidade por `minItemLevel` + sorteio ponderado
// por `tier.weight` entre os tiers elegíveis) por uma curva contínua: o
// valor esperado de QUALQUER afixo cresce suavemente com o Item Level,
// do mínimo do pior tier até o máximo do melhor tier — sem depender de
// limiares.
//
// Root cause que esta Sprint resolve (3 Sprints de investigação
// documentaram isso): 13 dos 14 afixos do jogo tinham o melhor tier
// (T1) exigindo Item Level 50-65 — inalcançável dentro de `MAX_LEVEL`
// (30, xp.ts) mesmo no cenário mais favorável (ver
// reports/item-generation-design-review-phase-1.md). Reescalar só os
// limiares (Redesign Validation) ou só os pesos (Repair Phase II) cada
// um sozinho não bastou; combinar os dois (Parameter Interaction)
// mostrou sinergia real mas ainda insuficiente. Esta Sprint substitui o
// MECANISMO em vez de continuar ajustando parâmetros dele.
export const EFFECTIVE_MAX_ITEM_LEVEL = MAX_LEVEL;

// Ainda existe alguma sorte no valor exato de cada rolagem — mantém a
// "identidade" de loot com variância (não uma tabela puramente
// determinística por nível) — 15% da faixa total do afixo, centrado no
// valor esperado da curva neste Item Level.
const VARIANCE_WINDOW_FRACTION = 0.15;

export interface AffixValueEnvelope {
  globalMin: number;
  globalMax: number;
}

// Fase 6 — "os tiers deixam de controlar o valor absoluto; passam a
// representar apenas qualidade/intervalo/distribuição/identidade do
// afixo": o envelope de valor (mínimo/máximo) é calculado por GRUPO
// (`mod.group`), não por mod individual. "Healthy"/"Vigorous"/"Massive"
// (3 mods diferentes, mesmo group "life") e "of the Bear" (sufixo,
// também "life") continuam sendo 4 registros de dados separados (nomes/
// raridades/tiers próprios preservados, Fase 2 — Compatibilidade), mas
// como só um deles pode ser sorteado por item (exclusão de grupo já
// existente), teriam produzido um salto ARTIFICIAL de valor dependendo
// de qual dos 4 "ganhasse a loteria" de seleção (10-24 contra 70-110),
// independente do Item Level — exatamente o tipo de descontinuidade que
// esta Sprint existe pra eliminar. Agrupar o envelope faz o valor final
// depender só do Item Level, nunca de qual mod-irmão foi escolhido.
const GROUP_ENVELOPES: Map<string, AffixValueEnvelope> = (() => {
  const envelopes = new Map<string, AffixValueEnvelope>();
  for (const mod of [...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES]) {
    const mins = mod.tiers.map((t) => t.min);
    const maxes = mod.tiers.map((t) => t.max);
    const existing = envelopes.get(mod.group);
    envelopes.set(mod.group, {
      globalMin: Math.min(existing?.globalMin ?? Infinity, ...mins),
      globalMax: Math.max(existing?.globalMax ?? -Infinity, ...maxes),
    });
  }
  return envelopes;
})();

export function getAffixEnvelope(group: string): AffixValueEnvelope {
  const envelope = GROUP_ENVELOPES.get(group);
  if (!envelope) {
    throw new Error(`Continuous Affix Scaling: group desconhecido "${group}" (nenhum mod registrado com este group)`);
  }
  return envelope;
}

// Curva suavizada (ease-out quadrático) — Fase 4: comparada contra uma
// curva linear (`t`) e escolhida em vez dela (ver relatório de entrega,
// Seção "Arquitetura", para a comparação completa). Ease-out cresce
// rápido nos primeiros níveis — onde a maioria das campanhas realmente
// acontece (Design Review, Fase 2: crescimento de 34% do nível 1 ao 20,
// contra só 4% do 20 ao 30 no sistema ANTIGO) — sem nunca zerar o
// crescimento entre 20 e 30, ao contrário do sistema de tiers antigo.
function easeOutQuadratic(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// Fórmula documentada (Fase 3): dado um Item Level, o valor ESPERADO de
// um afixo é `globalMin + (globalMax - globalMin) × curva(t)`, onde
// `t = clamp(itemLevel / EFFECTIVE_MAX_ITEM_LEVEL, 0, 1)`. Em
// `itemLevel = 0` o valor esperado é `globalMin`; em
// `itemLevel >= EFFECTIVE_MAX_ITEM_LEVEL` (30) é `globalMax` — o teto de
// cada afixo passa a ser alcançável dentro do próprio `MAX_LEVEL` do
// jogo, sem elevá-lo (`MAX_LEVEL` continua sendo lido de `xp.ts`, nunca
// alterado por esta Sprint).
export function expectedAffixValue(envelope: AffixValueEnvelope, itemLevel: number): number {
  const t = Math.max(0, Math.min(1, itemLevel / EFFECTIVE_MAX_ITEM_LEVEL));
  const curved = easeOutQuadratic(t);
  return envelope.globalMin + (envelope.globalMax - envelope.globalMin) * curved;
}

// Rolagem final: uma janela de variância em torno do valor esperado da
// curva, sempre recortada dentro de [globalMin, globalMax] do afixo —
// preserva a sensação de "sorte" no loot (Fase 2 — Compatibilidade)
// sem nunca produzir um valor fora do intervalo desenhado pro afixo.
export function rollContinuousAffixValue(rng: ItemGenRandom, envelope: AffixValueEnvelope, itemLevel: number): number {
  const expected = expectedAffixValue(envelope, itemLevel);
  const windowRadius = (envelope.globalMax - envelope.globalMin) * VARIANCE_WINDOW_FRACTION;
  const low = Math.max(envelope.globalMin, Math.round(expected - windowRadius));
  const high = Math.min(envelope.globalMax, Math.round(expected + windowRadius));
  return randomInt(rng, low, high);
}

// Fase 6 — rótulo de "qualidade" (nunca mais controla o valor): o tier
// do PRÓPRIO mod (não do group pool) cujo centro `(min+max)/2` está mais
// próximo do valor rolado. "Tier 1 do Healthy" e "Tier 1 do Massive"
// continuam identidades distintas (Fase 2 — Compatibilidade: nomes,
// categorias e a lista de tiers de cada mod em prefixes.ts/suffixes.ts
// não foram alterados) — só deixaram de decidir o valor, passam a
// apenas descrevê-lo.
export function identityTierForValue(tiers: readonly ItemGenModTier[], value: number): number {
  let bestTier = tiers[0].tier;
  let bestDistance = Infinity;
  for (const tier of tiers) {
    const center = (tier.min + tier.max) / 2;
    const distance = Math.abs(value - center);
    if (distance < bestDistance || (distance === bestDistance && tier.tier < bestTier)) {
      bestDistance = distance;
      bestTier = tier.tier;
    }
  }
  return bestTier;
}
