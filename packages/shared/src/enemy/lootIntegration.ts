import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import { generateMonsterLoot } from "../lootidentity/generator.js";
import type { LootResult } from "../lootgen/types.js";
import { ELITE_MODIFIER } from "../worldencounter/eliteModifiers.js";
import type { EnemyInstance, KillEnemyResult } from "./types.js";

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
export function generateLootForKilledEnemy(killResult: KillEnemyResult, instance: EnemyInstance, seed: number): LootResult {
  const variant = instance.futureState.variant;

  const result =
    variant === "elite"
      ? generateMonsterLoot(killResult.lootIdentityId, instance.level, seed, {
          dropChanceOverride: 1,
          minimumQuantity: 1,
          rarityMultiplierBonus: ELITE_MODIFIER.lootRarityMultiplier,
        })
      : generateMonsterLoot(killResult.lootIdentityId, instance.level, seed);

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

  return {
    ...result,
    generatedItems,
    currencies: [...result.currencies, { type: "gold", amount: goldAmount }],
  };
}
