import type { BaseAttributes } from "../characterbuild/types.js";

// Enemy System Phase I — tipos isolados de propósito, prefixados
// `Enemy*` pra nunca colidir com nada já existente em packages/shared.

// Requisito 6 — Future Hooks: aceitos por tipagem, nunca lidos por
// nenhuma lógica real desta Sprint. Elite/Champion/Rare/Unique/Boss/
// Season Modifiers/Map Modifiers/Affixes/Nemesis — nenhum implementado.
export interface EnemyFutureFlags {
  eliteEligible?: boolean;
  championEligible?: boolean;
  rareEligible?: boolean;
  uniqueEligible?: boolean;
  isBoss?: boolean;
  seasonModifierEligible?: boolean;
  mapModifierEligible?: boolean;
  nemesisEligible?: boolean;
  affixSlots?: number;
}

// Requisito 1 — Enemy Template: um por TIPO de inimigo (Wolf, Goblin,
// Skeleton...). Nenhuma lógica hardcoded — tudo dado.
//
// - `archetype`: mesmo `id` de MonsterArchetype (Loot Identity,
//   packages/shared/src/lootidentity/archetypes.ts) — reaproveitado,
//   nunca duplicado, pra já nascer integrado com o viés de loot certo.
// - `lootIdentityId`: mesmo `monsterId` de MonsterLootIdentity (Loot
//   Identity, lootIdentities.ts) — é isso que "prepara o Loot
//   Generator" em killEnemy() (requisito 5), sem chamá-lo diretamente.
// - `baseStats`/`growth`: EXATAMENTE o mesmo shape de
//   CharacterClassDefinition.startingAttributes/growthPerLevel
//   (Character Build) — Enemy Stats (requisito 3) reaproveita o
//   agregador do Character Build (computeBaseAttributes/
//   calculateDerivedAttributes) em vez de duplicar a fórmula; ver
//   enemyStats.ts.
// - `criticalMultiplier`: Combat Engine exige isso em todo Combatant
//   (Combat Engine Phase I não tem essa informação em `FinalStats`) —
//   cada Enemy Template já vem com o próprio valor, pronto pra virar
//   um Combatant sem inventar nada na hora (requisito 8, integração
//   com Combat Engine). Opcional — cai no default de
//   `enemyDefaults.ts` quando ausente.
export interface EnemyTemplate {
  id: string;
  name: string;
  region: string;
  levelRange: { min: number; max: number };
  archetype: string;
  lootIdentityId: string;
  baseStats: BaseAttributes;
  growth: BaseAttributes;
  criticalMultiplier?: number;
  futureFlags: EnemyFutureFlags;
}

// Requisito 6 — mesmo princípio do Template, mas por INSTÂNCIA (ex.:
// qual modificador de Elite/Champion ESTA instância específica rolou,
// quando esse sistema existir). Nunca lido por nenhuma lógica real
// desta Sprint.
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: `variant`/
// `statMultipliers` são o dia em que este hook deixa de ser "nunca
// lido" — `variant` é a identidade (lida por lootIntegration.ts pra
// loot especial e pela extensão aditiva de presentationLayer.ts pra
// emitir EliteEncounter/MiniBossEncounter/EliteDefeated/
// MiniBossDefeated), `statMultipliers` são os números de verdade
// (lidos por combatant.ts). `eliteModifiers` (string[]) permanece
// intocado — ainda não lido por nenhuma lógica real, reservado pra
// quando mais de um modificador puder empilhar na mesma instância.
export interface EnemyFutureInstanceState {
  eliteModifiers?: string[];
  variant?: "elite" | "miniboss";
  statMultipliers?: { life?: number; damage?: number };
  affixes?: string[];
  nemesisHistory?: string[];
}

// Requisito 2 — Enemy Instance: uma criatura viva. "Toda instância
// deverá ser independente" — nenhum campo aqui é uma referência
// compartilhada com outra instância (spawnEnemy() sempre cria um
// objeto novo).
//
// `maximumLife`/`currentLife` são um SNAPSHOT tirado no spawn (nunca
// recalculado depois — uma instância já viva não deveria ter sua vida
// máxima mudando sozinha por baixo dela) — diferente dos outros 9
// Enemy Stats (physicalDamage/accuracy/etc.), que NUNCA são guardados
// aqui e são sempre recalculados na hora via o agregador (requisito 3:
// "nunca armazenar atributos duplicados"). Ver enemyStats.ts.
export interface EnemyInstance {
  instanceId: string;
  templateId: string;
  seed: number;
  level: number;
  currentLife: number;
  maximumLife: number;
  alive: boolean;
  spawnTime: number;
  position: { x: number; y: number } | null;
  futureState: EnemyFutureInstanceState;
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: extensão
// aditiva (opcional, default ausente = comportamento idêntico ao de
// antes) — quem decide ESTES valores é o World Encounter (spawn.ts),
// nunca este arquivo; spawnEnemy() só aplica o que recebe.
export interface SpawnEnemyOptions {
  spawnTime?: number;
  position?: { x: number; y: number } | null;
  variant?: "elite" | "miniboss";
  statMultipliers?: { life?: number; damage?: number };
}

// Requisito 5 — Death: killEnemy() "nunca gera loot diretamente" —
// devolve só o `lootIdentityId` (do Template) pronto pra quem chama
// repassar pra generateMonsterLoot() (Loot Identity), sem acoplar o
// Enemy System à geração de loot em si.
export interface KillEnemyResult {
  instance: EnemyInstance;
  deathTime: number;
  lootIdentityId: string;
}
