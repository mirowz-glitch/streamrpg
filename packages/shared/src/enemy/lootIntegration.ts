import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import { generateMonsterLoot } from "../lootidentity/generator.js";
import { generateLoot } from "../lootgen/generator.js";
import type { LootResult } from "../lootgen/types.js";
import { ELITE_MODIFIER } from "../worldencounter/eliteModifiers.js";
import { getUniqueRelicDefinition, getUniqueRelicIdsForBoss } from "../dungeon/uniqueRelicDefinitions.js";
import { getRegionItemLevelAnchor } from "../regions.js";
import type { EnemyInstance, KillEnemyResult } from "./types.js";

// Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — Fase 3:
// "Adicionar apenas a resolução das relíquias quando o Boss for
// derrotado... sem alterar o algoritmo geral de geração de itens."
// Mesma técnica de FINAL_BOSS_UNIQUE_BIAS (dungeon/dungeonController.ts,
// loot garantido de conclusão de Dungeon) — aqui aplicada ao abate do
// Boss em SI (qualquer encontro com ele, dentro ou fora de uma
// Expedição-Dungeon ativa, já que "Boss deve ser apenas um
// EnemyTemplate" — este ponto de integração não tem acesso à sessão/
// Expedição, só à instância abatida, então nunca poderia checar "há
// uma Dungeon ativa" mesmo se quisesse).
const UNIQUE_RELIC_SEED_OFFSET = 8001;
const UNIQUE_RELIC_RARITY_BIAS = 8;

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 4: "loot
// especial (raridade maior, nível de item maior, ouro adicional)...
// Sem alterar o Loot Generator. Apenas pesos." Ouro só pra Mini-Boss
// (exemplo literal do requisito 4); faixa ilustrativa, não calibrada
// (mesma convenção de sempre). Seed offset (909) só evita correlação
// com qualquer `LootTable.seedOffset` já em uso (1001-3001, ver
// lootgen/lootTables.ts) — não precisa ser "mágico", só distinto.
const MINIBOSS_GOLD_SEED_OFFSET = 909;
const MINIBOSS_GOLD_MIN = 40;
const MINIBOSS_GOLD_MAX = 120;

// Requisito 8 — Integração com Loot Identity/Loot Generator. NUNCA
// chamado por killEnemy() (requisito 5: "nunca gerar loot
// diretamente") — é um passo separado e opcional, acionado
// explicitamente por quem chama depois de matar o inimigo, usando
// exatamente o `lootIdentityId` que killEnemy() já preparou. Assim o
// Enemy System "funciona imediatamente" com Loot Identity/Loot
// Generator sem acoplar a MORTE do inimigo à geração do loot em si
// (quem chama decide quando, ou se, gerar).
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/4: Elite
// reaproveita o `lootIdentityId` do Template sorteado normalmente (não
// tem Loot Identity própria) — só recebe um drop garantido + bônus de
// raridade (eliteModifiers.ts, "apenas pesos", nunca o Loot Generator
// em si). Mini-Boss já tem sua PRÓPRIA Loot Table/Loot Identity
// (dropChance 1.0, rarityMultiplier alto — ver lootgen/lootTables.ts/
// lootidentity/lootIdentities.ts), então só precisa do ouro adicional
// aqui. `sourceVariant` (itemgen/types.ts) marca o(s) item(ns)
// resultante(s) — o único sinal PRECISO (não heurística) de que este
// abate foi de um Elite/Mini-Boss, lido pela extensão aditiva de
// presentationLayer.ts pra emitir EliteEncounter/MiniBossEncounter/
// EliteDefeated/MiniBossDefeated (ver nota lá sobre por que esse sinal
// foi escolhido em vez de tentar observar `session.currentEncounter`,
// que já não existe mais nesse ponto — mesma limitação estrutural
// documentada pra CriticalHit/Miss).
// Region-Anchored Item Level — Implementation Validation Phase I:
// `regionId` (novo parâmetro) substitui `instance.level` como base do
// Item Level do loot (getRegionItemLevelAnchor(), regions.ts) — Monster
// Level (`instance.level`) continua exatamente como antes para TUDO
// mais (stats de combate, XP, futureState) — não é lido nem alterado
// aqui além do que já era (`instance.futureState.variant`).
export function generateLootForKilledEnemy(killResult: KillEnemyResult, instance: EnemyInstance, seed: number, regionId: string): LootResult {
  const variant = instance.futureState.variant;
  const itemLevelAnchor = getRegionItemLevelAnchor(regionId);

  const result =
    variant === "elite"
      ? generateMonsterLoot(killResult.lootIdentityId, itemLevelAnchor, seed, {
          dropChanceOverride: 1,
          minimumQuantity: 1,
          rarityMultiplierBonus: ELITE_MODIFIER.lootRarityMultiplier,
        })
      : generateMonsterLoot(killResult.lootIdentityId, itemLevelAnchor, seed);

  if (!variant) {
    return result;
  }

  const generatedItems = result.generatedItems.map((item) => ({
    ...item,
    sourceVariant: variant,
    sourceEnemyTemplateId: instance.templateId,
  }));

  if (variant !== "miniboss") {
    return { ...result, generatedItems };
  }

  const goldRng = createSeededRandom(seed + MINIBOSS_GOLD_SEED_OFFSET);
  const goldAmount = randomInt(goldRng, MINIBOSS_GOLD_MIN, MINIBOSS_GOLD_MAX);

  // Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — Fase
  // 2/3: "cada Boss poderá declarar uniqueRelics... resolução das
  // relíquias quando o Boss for derrotado." Cada relíquia declarada pra
  // este `templateId` (dungeon/uniqueRelicDefinitions.ts, nunca lido por
  // nenhum outro Enemy Template) vira MAIS um item garantido — a MESMA
  // generateLoot() já usada por todo o resto do projeto, com a MESMA
  // técnica de bias total (`rarityWeightMultipliers.unique`) já usada
  // pelo loot de conclusão de Dungeon. Sem relíquias declaradas pra este
  // Boss (a maioria dos Mini-Bosses/Elites do jogo) = `[]`, nenhum item
  // extra, comportamento idêntico a antes desta Sprint.
  const relicItems = getUniqueRelicIdsForBoss(instance.templateId).flatMap((relicId, index) => {
    const relic = getUniqueRelicDefinition(relicId);
    if (!relic) return [];

    const relicLoot = generateLoot(relic.lootIdentity, itemLevelAnchor, seed + UNIQUE_RELIC_SEED_OFFSET + index, {
      dropChanceOverride: 1,
      minimumQuantity: 1,
      rarityWeightMultipliers: { unique: UNIQUE_RELIC_RARITY_BIAS },
    });
    return relicLoot.generatedItems.map((item) => ({
      ...item,
      sourceVariant: variant,
      sourceEnemyTemplateId: instance.templateId,
    }));
  });

  return {
    ...result,
    generatedItems: [...generatedItems, ...relicItems],
    currencies: [...result.currencies, { type: "gold", amount: goldAmount }],
  };
}
