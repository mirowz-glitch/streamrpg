// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: "um
// MODIFICADOR opcional pra um encontro (não um Template novo)". Um
// único registro de dados — nenhuma lógica aqui, só os números que
// generator.ts/spawn.ts aplicam a um Enemy Template normal já
// existente (ver enemy/instance.ts/combatant.ts, que aplicam
// `lifeMultiplier`/`damageMultiplier` no lugar exato onde HP/dano já
// são calculados).
//
// `auraColor`/`auraIcon` são só metadados visuais (requisito 1: "aura
// visual") — nenhuma regra de jogo lê isso, só a UI (ver
// components/hud/EliteBanner.tsx).
export interface EliteModifierDefinition {
  id: "elite";
  namePrefix: string;
  lifeMultiplier: number;
  damageMultiplier: number;
  xpMultiplier: number;
  // Requisito 4 — "loot especial": multiplicador ADICIONAL de raridade
  // (rare/unique), aplicado por cima do bias normal do monstro sorteado
  // (ver enemy/lootIntegration.ts) — "apenas pesos", nunca o Loot
  // Generator em si.
  lootRarityMultiplier: number;
  auraColor: string;
  auraIcon: string;
}

// Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos usada em todo o resto do projeto) —
// verificados empiricamente pelo Simulador (requisito 8/9) antes da
// entrega, não só assumidos.
//
// Balance, Pacing & Player Experience Phase I — Fase 3 (Elites):
// "modificadores." Diagnóstico (before-adventures-report.md, 1000
// execuções) mediu 100% de taxa de vitória contra Elite (988/988) nas
// regiões iniciais — candidato a "Elite trivial", automaticamente
// sinalizado. Multiplicadores aumentados (2.2->3.0 vida, 1.6->2.2
// dano). Um primeiro ajuste pra 2.6/1.9 não moveu a taxa de vitória
// (permaneceu 100% numa amostra de 200 execuções) — a escala de poder
// do personagem nos primeiros níveis (Character Build/Combat Engine,
// ambos fora do escopo desta Sprint) supera facilmente multiplicadores
// moderados. Levado a um valor mais agressivo sem tornar o Elite
// impossível nas regiões mais difíceis, onde a vitória já era saudável
// (88% em Colinas Áridas, before-expeditions-report.md) — verificado
// via nova rodada do Simulador antes da entrega; se persistir 100%,
// documentado como limite estrutural não resolvido nesta Sprint (ver
// "Recomendações" da entrega final).
export const ELITE_MODIFIER: EliteModifierDefinition = {
  id: "elite",
  namePrefix: "Elite",
  lifeMultiplier: 3.0,
  damageMultiplier: 2.2,
  xpMultiplier: 3,
  lootRarityMultiplier: 2,
  auraColor: "#ff8c1a",
  auraIcon: "✦",
};

// Requisito 1/2 — "XP maior" pra Elite/Mini-Boss: multiplicador sobre
// o mesmo xpRewardForKill() já usado por todo abate comum (xp.ts,
// nunca duplicado) — lido pela extensão aditiva de
// presentationLayer.ts. Mini-Boss vale mais que Elite (Enemy Template
// próprio, sempre mais forte que um Elite genérico do mesmo bioma).
export const VARIANT_XP_MULTIPLIERS: Record<"elite" | "miniboss", number> = {
  elite: ELITE_MODIFIER.xpMultiplier,
  miniboss: 6,
};

// Requisito 7 — "aura visual (metadados)" pro Mini-Boss também (o
// requisito 1 só cita Elite explicitamente, mas o mesmo padrão de dado
// puramente visual se aplica) — lido só pela HUD/UI, nenhuma regra de
// jogo consome isto.
export const MINIBOSS_AURA = { color: "#ffd700", icon: "👑" };
