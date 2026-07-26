import type { DungeonModifierDefinition } from "./types.js";
import type { DungeonRuntimeConfig } from "../worldencounter/types.js";
import { NEUTRAL_DUNGEON_RUNTIME_CONFIG } from "../worldencounter/types.js";

// Vertical Slice — Dungeon Modifiers, Variants & Replayability Phase I —
// requisito arquitetural: "reutilizar integralmente a arquitetura
// atual... nenhuma Dungeon deverá conhecer regras específicas." Este
// módulo é irmão de expeditionDefinitions.ts (mesma pasta, mesmo nível
// — não um sistema novo, não uma Layer/Manager/Wrapper), só um segundo
// registro de dados + funções puras de leitura, exatamente como
// dungeon/dungeonDefinitions.ts já é um segundo registro por cima de
// ExpeditionDefinition desde a Sprint anterior.
//
// Fase 1 — "Cada modificador deve possuir APENAS dados: id, nome,
// descrição, categoria, dificuldade, multiplicador de recompensa" +,
// desde a Vertical Slice — Dungeon Modifier Runtime Integration Phase
// I, os 5 campos numéricos opcionais de efeito real (ver
// DungeonModifierDefinition, expeditions/types.ts) — CADA um lido por
// exatamente um sistema (Encounter/Combat/Recovery), nunca uma segunda
// regra de precedência por tipo.
//
// Este é o "ModifierResolver" único do briefing: `resolveExpeditionModifiers()`
// já existia (traduz ids -> definições reais); `resolveDungeonRuntimeConfig()`
// (abaixo) é o passo final — ids -> `DungeonRuntimeConfig`, o ÚNICO
// objeto que Encounter/Combat/Recovery/Rewards/HUD/Simulador realmente
// consomem. Nenhum desses sistemas importa este arquivo nem conhece um
// único id de modificador — só dungeon/dungeonController.ts (o ÚNICO
// ponto de resolução, ver comentário completo lá) chama
// `resolveDungeonRuntimeConfig()` e repassa o resultado adiante via
// `AdvanceAdventureOptions.runtimeConfig` (adventure/adventureLoop.ts),
// o mesmo campo opcional que já atravessa toda a cadeia de wrappers
// existente.
export const DUNGEON_MODIFIER_DEFINITIONS: DungeonModifierDefinition[] = [
  // Inimigos
  {
    id: "increased-vitality",
    name: "Vida Aumentada",
    description: "Os inimigos desta Dungeon têm muito mais vida que o normal.",
    category: "Inimigos",
    difficulty: "Alta",
    rewardMultiplier: 1.2,
    enemyLifeMultiplier: 1.2,
  },
  {
    id: "increased-damage",
    name: "Dano Aumentado",
    description: "Os inimigos desta Dungeon causam muito mais dano que o normal.",
    category: "Inimigos",
    difficulty: "Alta",
    rewardMultiplier: 1.2,
    enemyDamageMultiplier: 1.2,
  },
  {
    id: "elite-density",
    name: "Mais Elites",
    description: "Elites aparecem com frequência muito maior nesta Dungeon.",
    category: "Inimigos",
    difficulty: "Média",
    rewardMultiplier: 1.15,
    eliteChanceMultiplier: 1.15,
  },
  {
    id: "miniboss-surge",
    name: "Mais Mini-Bosses",
    description: "Mini-Bosses aparecem com frequência muito maior nesta Dungeon.",
    category: "Inimigos",
    difficulty: "Muito Alta",
    rewardMultiplier: 1.3,
    miniBossChanceMultiplier: 1.3,
  },
  // Jogador
  {
    id: "reduced-healing",
    name: "Recuperação Reduzida",
    description: "A recuperação de vida entre encontros é significativamente menor nesta Dungeon.",
    category: "Jogador",
    difficulty: "Alta",
    rewardMultiplier: 1.2,
    healingMultiplier: 0.8,
  },
  {
    id: "reduced-gold",
    name: "Ouro Reduzido",
    description: "Esta Dungeon concede menos ouro que o normal.",
    category: "Jogador",
    difficulty: "Baixa",
    rewardMultiplier: 0.85,
  },
  {
    id: "reduced-xp",
    name: "XP Reduzido",
    description: "Esta Dungeon concede menos experiência que o normal.",
    category: "Jogador",
    difficulty: "Baixa",
    rewardMultiplier: 0.85,
  },
  // Ambiente
  {
    id: "fewer-checkpoints",
    name: "Checkpoints Reduzidos",
    description: "Esta Dungeon tem menos pontos de recuperação ao longo do caminho.",
    category: "Ambiente",
    difficulty: "Média",
    rewardMultiplier: 1.15,
  },
  {
    id: "worldevents-disabled",
    name: "Eventos Mundiais Desativados",
    description: "Nenhum Evento Mundial (Tesouro/Mercador/Santuário/Vestígio) ocorre nesta Dungeon.",
    category: "Ambiente",
    difficulty: "Baixa",
    rewardMultiplier: 1.1,
  },
  {
    id: "elite-chance-up",
    name: "Chance Maior de Elite",
    description: "Cada encontro nesta Dungeon tem chance maior de ser um Elite.",
    category: "Ambiente",
    difficulty: "Média",
    rewardMultiplier: 1.1,
    eliteChanceMultiplier: 1.1,
  },
];

export function getDungeonModifierDefinition(id: string): DungeonModifierDefinition | undefined {
  return DUNGEON_MODIFIER_DEFINITIONS.find((modifier) => modifier.id === id);
}

// Fase 2 — "Toda leitura deve ser genérica": ids desconhecidos/ausentes
// nunca lançam erro, simplesmente não contribuem (dado que falta, nunca
// lógica que falta) — uma ExpeditionDefinition sem `modifiers` (ou com
// lista vazia) sempre resolve pro comportamento de sempre.
export function resolveExpeditionModifiers(modifierIds: readonly string[] | undefined): DungeonModifierDefinition[] {
  if (!modifierIds || modifierIds.length === 0) return [];
  return modifierIds.map((id) => getDungeonModifierDefinition(id)).filter((modifier): modifier is DungeonModifierDefinition => modifier !== undefined);
}

// Fase 3 — "Somente multiplicadores configuráveis": combinação sempre
// multiplicativa (nunca soma), ordem-independente — o jeito genérico
// padrão de empilhar vários multiplicadores sem inventar uma segunda
// regra de precedência.
export function getCombinedRewardMultiplier(modifierIds: readonly string[] | undefined): number {
  return resolveExpeditionModifiers(modifierIds).reduce((product, modifier) => product * modifier.rewardMultiplier, 1);
}

function combineField(modifiers: readonly DungeonModifierDefinition[], field: keyof DungeonModifierDefinition): number {
  return modifiers.reduce((product, modifier) => {
    const value = modifier[field];
    return typeof value === "number" ? product * value : product;
  }, 1);
}

// Vertical Slice — Dungeon Modifier Runtime Integration Phase I — Fase
// 1: "produzir um objeto imutável contendo os multiplicadores ativos
// da Dungeon." O ÚNICO lugar do projeto que traduz ids de modificador
// pros 6 números que Encounter/Combat/Recovery/Rewards/HUD/Simulador
// realmente consomem — combinação SEMPRE multiplicativa por campo
// (mesmo princípio de getCombinedRewardMultiplier), campo ausente numa
// definição = não contribui pra AQUELE eixo (`?? 1` implícito em
// combineField). Sem modificadores (ou nenhum deles com efeito naquele
// campo), cada campo fica exatamente 1 — o objeto inteiro passa a ser
// referencialmente igual a NEUTRAL_DUNGEON_RUNTIME_CONFIG em valor
// (comportamento idêntico a antes desta Sprint).
export function resolveDungeonRuntimeConfig(modifierIds: readonly string[] | undefined): DungeonRuntimeConfig {
  const modifiers = resolveExpeditionModifiers(modifierIds);
  if (modifiers.length === 0) return NEUTRAL_DUNGEON_RUNTIME_CONFIG;

  return {
    enemyLifeMultiplier: combineField(modifiers, "enemyLifeMultiplier"),
    enemyDamageMultiplier: combineField(modifiers, "enemyDamageMultiplier"),
    eliteChanceMultiplier: combineField(modifiers, "eliteChanceMultiplier"),
    miniBossChanceMultiplier: combineField(modifiers, "miniBossChanceMultiplier"),
    healingMultiplier: combineField(modifiers, "healingMultiplier"),
    rewardMultiplier: getCombinedRewardMultiplier(modifierIds),
  };
}
