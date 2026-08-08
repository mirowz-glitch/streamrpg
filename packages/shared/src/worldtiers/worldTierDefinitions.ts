import type { CombinedRuntimeConfig, DungeonRuntimeConfig } from "../worldencounter/types.js";
import { NEUTRAL_DUNGEON_RUNTIME_CONFIG } from "../worldencounter/types.js";

// Vertical Slice — World Tiers & Endgame Scaling Phase I — módulo
// isolado de propósito (irmão de expeditions/expeditionModifiers.ts,
// mesmo padrão: dados + funções puras, nenhuma Layer/Manager/Wrapper
// novo). "Nenhum bioma ou Dungeon deve conter lógica específica para um
// Tier" — World Tier é uma propriedade da SESSÃO (adventure/types.ts:
// AdventureSession.worldTier), nunca do conteúdo em si; qualquer
// bioma/Dungeon/Boss já existente pode ser jogado em qualquer Tier sem
// precisar saber disso.
//
// Fase 1 — "Cada Tier conterá apenas dados": os 5 campos do exemplo do
// briefing. Fase 6 — "Apenas valores iniciais": mesma % em todos os 5
// eixos por Tier (WT2 +15%, WT3 +35%, WT4 +60%) — não é uma exigência
// arquitetural (cada campo já é livre pra divergir no futuro, ver
// "Crescimento Futuro"), só a distribuição mais simples possível pra
// esta Sprint, exatamente como sugerido.
export interface WorldTierDefinition {
  id: string;
  name: string;
  enemyLifeMultiplier: number;
  enemyDamageMultiplier: number;
  rewardMultiplier: number;
  lootMultiplier: number;
  xpMultiplier: number;
}

export const WORLD_TIER_DEFINITIONS: WorldTierDefinition[] = [
  {
    id: "WT1",
    name: "Mundo Nível 1",
    enemyLifeMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    rewardMultiplier: 1.0,
    lootMultiplier: 1.0,
    xpMultiplier: 1.0,
  },
  {
    id: "WT2",
    name: "Mundo Nível 2",
    enemyLifeMultiplier: 1.15,
    enemyDamageMultiplier: 1.15,
    rewardMultiplier: 1.15,
    lootMultiplier: 1.15,
    xpMultiplier: 1.15,
  },
  {
    id: "WT3",
    name: "Mundo Nível 3",
    enemyLifeMultiplier: 1.35,
    enemyDamageMultiplier: 1.35,
    rewardMultiplier: 1.35,
    lootMultiplier: 1.35,
    xpMultiplier: 1.35,
  },
  {
    id: "WT4",
    name: "Mundo Nível 4",
    enemyLifeMultiplier: 1.6,
    enemyDamageMultiplier: 1.6,
    rewardMultiplier: 1.6,
    lootMultiplier: 1.6,
    xpMultiplier: 1.6,
  },
];

export function getWorldTierDefinition(id: string | undefined): WorldTierDefinition | undefined {
  if (!id) return undefined;
  return WORLD_TIER_DEFINITIONS.find((tier) => tier.id === id);
}

// Requisito arquitetural — "World Tier -> WorldTierResolver ->
// WorldRuntimeConfig." Único formato intermediário (nunca exposto a
// Combat/Encounter/Recovery/Rewards — só combineRuntimeConfigs() abaixo
// o consome). `undefined`/id desconhecido = Tier neutro (mesmo
// princípio de "dado que falta, nunca lógica que falta" já usado em
// todo o projeto — nunca lança erro).
export interface WorldRuntimeConfig {
  enemyLifeMultiplier: number;
  enemyDamageMultiplier: number;
  rewardMultiplier: number;
  lootMultiplier: number;
  xpMultiplier: number;
}

const NEUTRAL_WORLD_RUNTIME_CONFIG: WorldRuntimeConfig = {
  enemyLifeMultiplier: 1,
  enemyDamageMultiplier: 1,
  rewardMultiplier: 1,
  lootMultiplier: 1,
  xpMultiplier: 1,
};

export function resolveWorldRuntimeConfig(worldTierId: string | undefined): WorldRuntimeConfig {
  const tier = getWorldTierDefinition(worldTierId);
  if (!tier) return NEUTRAL_WORLD_RUNTIME_CONFIG;
  return {
    enemyLifeMultiplier: tier.enemyLifeMultiplier,
    enemyDamageMultiplier: tier.enemyDamageMultiplier,
    rewardMultiplier: tier.rewardMultiplier,
    lootMultiplier: tier.lootMultiplier,
    xpMultiplier: tier.xpMultiplier,
  };
}

// Fase 2 — "Runtime Final = World Tier + Dungeon Modifiers... nenhum
// sistema conhecerá os dois separadamente." Único ponto que enxerga
// AMBOS os resolvedores ao mesmo tempo — chamado exclusivamente por
// dungeon/dungeonController.ts, o único lugar do projeto com acesso à
// Dungeon ativa E à sessão (pra ler `session.worldTier`) ao mesmo
// tempo.
//
// Combinação sempre multiplicativa por campo (mesmo princípio de
// getCombinedRewardMultiplier()/combineField() em
// expeditionModifiers.ts — nenhuma segunda regra de precedência):
// `enemyLifeMultiplier`/`enemyDamageMultiplier` combinam dos dois
// lados; `eliteChanceMultiplier`/`miniBossChanceMultiplier`/
// `healingMultiplier` só existem no lado da Dungeon (World Tier nunca
// definiu esses eixos, ver WorldRuntimeConfig acima — repassados
// direto). `xpMultiplier`/`lootMultiplier` são exclusivos do World
// Tier, mas ainda multiplicados pelo `rewardMultiplier` GERAL da
// Dungeon — preserva o comportamento já existente (o multiplicador de
// recompensa de um Dungeon Modifier sempre afetou XP/ouro/reputação
// juntos, nunca só ouro) sem duplicar o efeito quando o Dungeon
// Modifier E o World Tier concedem bônus ao mesmo tempo.
export function combineRuntimeConfigs(dungeonConfig: DungeonRuntimeConfig, worldConfig: WorldRuntimeConfig): CombinedRuntimeConfig {
  return {
    enemyLifeMultiplier: dungeonConfig.enemyLifeMultiplier * worldConfig.enemyLifeMultiplier,
    enemyDamageMultiplier: dungeonConfig.enemyDamageMultiplier * worldConfig.enemyDamageMultiplier,
    eliteChanceMultiplier: dungeonConfig.eliteChanceMultiplier,
    miniBossChanceMultiplier: dungeonConfig.miniBossChanceMultiplier,
    healingMultiplier: dungeonConfig.healingMultiplier,
    rewardMultiplier: dungeonConfig.rewardMultiplier * worldConfig.rewardMultiplier,
    xpMultiplier: dungeonConfig.rewardMultiplier * worldConfig.xpMultiplier,
    lootMultiplier: dungeonConfig.rewardMultiplier * worldConfig.lootMultiplier,
    // Sprint 33 — Map Modifiers Phase II: nem Dungeon Modifiers nem
    // World Tier definem um eixo de raridade próprio — sempre neutro
    // aqui; só `mapmods/mapModifierRuntimeConfig.ts` (aplicado por CIMA
    // deste resultado, em dungeon/dungeonController.ts) multiplica de
    // verdade este campo.
    lootRarityMultiplier: 1,
  };
}

// Atalho pra dungeon/dungeonController.ts: resolve o World Tier sozinho
// e já combina com um DungeonRuntimeConfig previamente resolvido, sem
// precisar importar resolveWorldRuntimeConfig() separadamente em quem
// chama — mesmo princípio de conveniência de getCombinedRewardMultiplier().
export function resolveCombinedRuntimeConfig(worldTierId: string | undefined, dungeonConfig: DungeonRuntimeConfig = NEUTRAL_DUNGEON_RUNTIME_CONFIG): CombinedRuntimeConfig {
  return combineRuntimeConfigs(dungeonConfig, resolveWorldRuntimeConfig(worldTierId));
}
