import type { EnemyInstance } from "../enemy/types.js";

// World Encounter System Phase I — tipos isolados de propósito.
//
// Nota de nomenclatura: `EncounterCategory`/`EncounterSummary`/
// `EncounterStats` já existem em ../types.ts — são os encontros
// NARRATIVOS de expedição (texto de sabor, sem combate), um sistema
// completamente diferente e intocado por esta Sprint. "Encounter"
// aqui significa "encontro de combate" (Region -> Encounter Table ->
// Encounter Generator -> Enemy Template -> Spawn Enemy -> World
// Encounter) — por isso todo tipo novo é prefixado com o contexto
// completo (`EncounterTable*`, `WorldEncounter`) pra nunca se
// confundir com o sistema narrativo.

// Requisito 6 — Future Hooks: aceitos por tipagem, nunca lidos por
// nenhuma lógica real desta Sprint. Elite Packs/Rare Packs/Boss
// Packs/Events/Ambushes/Shrines/Season Mechanics/Map Modifiers —
// nenhum implementado.
export interface EncounterFutureFlags {
  elitePackEligible?: boolean;
  rarePackEligible?: boolean;
  bossPackEligible?: boolean;
  eventEligible?: boolean;
  ambushEligible?: boolean;
  shrineEligible?: boolean;
  seasonMechanicEligible?: boolean;
  mapModifierEligible?: boolean;
}

// Requisito 1 — uma linha por Enemy Template dentro da Encounter
// Table de uma região. `enemyTemplateId` reaproveita o mesmo `id` de
// EnemyTemplate (Enemy System, packages/shared/src/enemy/templates.ts)
// — nunca duplicado.
export interface EncounterTableEntry {
  enemyTemplateId: string;
  weight: number;
  minimumLevel: number;
  maximumLevel: number;
  minimumGroup: number;
  maximumGroup: number;
  futureFlags: EncounterFutureFlags;
}

// Requisito 4 — "Enemy Groups... apenas composição": quantos entries
// DISTINTOS da tabela compõem um único encontro (ex.: 1 slot = "3
// Wolves"; 2 slots = "2 Goblins + 1 Bandit"). Distribuição ponderada,
// mesmo padrão de LootQuantityOption (Loot Generator).
export interface EncounterPackSizeOption {
  slots: number;
  weight: number;
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 3: "tabela de
// chance de aparição... Configurável por bioma." `elite`/`miniBoss` são
// frações de 0 a 1 (ex.: 0.04 = 4%); o restante (1 - elite - miniBoss)
// é sempre "normal" — nenhum terceiro campo redundante.
export interface EncounterVariantChances {
  elite: number;
  miniBoss: number;
}

// Requisito 1/3 — a Encounter Table completa de uma região.
// `levelRange` é a "Faixa da região" do requisito 3 — um clamp
// adicional, POR CIMA da faixa de cada entry e da faixa do próprio
// Enemy Template (ex.: Fortaleza Sombria pode restringir o Boss, que
// no Enemy Template vai de 20 a 80, pra só aparecer entre 60 e 80
// nesta região específica).
//
// Requisito 2 — `miniBossTemplateId`: "exatamente UM Mini-Boss por
// bioma" — uma referência a um `EnemyTemplate.id` real (enemy/
// templates.ts), "apenas um Enemy Template especial", nenhum sistema
// novo. Requisito 3 — `variantChances`: tabela de chance de aparição,
// por região.
export interface EncounterTable {
  regionId: string;
  levelRange: { min: number; max: number };
  packSizeOptions: EncounterPackSizeOption[];
  entries: EncounterTableEntry[];
  variantChances: EncounterVariantChances;
  miniBossTemplateId: string;
}

// Vertical Slice — Dungeon Modifier Runtime Integration Phase I —
// Fase 1: "um único ponto de resolução... Dungeon -> ModifierResolver
// -> RuntimeConfig -> Combat/Recovery/Encounter/Rewards/HUD." Este é o
// FORMATO do objeto resolvido — imutável, só números neutros por
// padrão (1 = "sem efeito") — nunca a lista de ids de modificadores em
// si; nenhum consumidor (generator.ts/spawn.ts/adventureLoop.ts/
// recoveryLayer.ts) precisa saber que "elite-density"/"reduced-healing"
// existem, só ler o campo numérico que já importa pra ele.
//
// Vive aqui (worldencounter/, não em expeditions/ ou dungeon/, onde a
// RESOLUÇÃO de verdade acontece) só pra evitar dependência circular:
// tanto adventure/adventureLoop.ts quanto recovery/recoveryLayer.ts já
// dependem (direta ou transitivamente) deste módulo, nunca o
// contrário — expeditions/expeditionModifiers.ts (que CONSTRÓI este
// objeto a partir dos ids de modificador) importa este tipo daqui,
// nunca o inverso.
export interface DungeonRuntimeConfig {
  enemyLifeMultiplier: number;
  enemyDamageMultiplier: number;
  eliteChanceMultiplier: number;
  miniBossChanceMultiplier: number;
  healingMultiplier: number;
  rewardMultiplier: number;
}

// O "sem Dungeon ativa/sem modificadores" — todo consumidor usa isto
// (via `?? NEUTRAL_DUNGEON_RUNTIME_CONFIG` ou multiplicando por `?? 1`
// campo a campo) como comportamento padrão idêntico a antes desta
// Sprint.
export const NEUTRAL_DUNGEON_RUNTIME_CONFIG: DungeonRuntimeConfig = {
  enemyLifeMultiplier: 1,
  enemyDamageMultiplier: 1,
  eliteChanceMultiplier: 1,
  miniBossChanceMultiplier: 1,
  healingMultiplier: 1,
  rewardMultiplier: 1,
};

// Vertical Slice — World Tiers & Endgame Scaling Phase I — Fase 2:
// "Runtime Final = World Tier + Dungeon Modifiers... nenhum sistema
// conhecerá os dois separadamente." `CombinedRuntimeConfig` é o ÚNICO
// formato que de fato atravessa `AdvanceAdventureOptions.runtimeConfig`
// a partir desta Sprint — estende `DungeonRuntimeConfig` (os 6 campos
// que Combat/Encounter/Recovery já liam) com os 2 campos que só o
// World Tier introduz (`xpMultiplier`/`lootMultiplier`, granularidade
// que os Dungeon Modifiers nunca tiveram — eles só tinham um
// `rewardMultiplier` único pra XP+ouro+reputação juntos). Continua
// vivendo aqui (não em worldtiers/ ou expeditions/, onde a resolução de
// verdade acontece) pelo mesmo motivo de sempre: evitar dependência
// circular — quem CONSTRÓI este objeto (worldtiers/
// worldTierDefinitions.ts: combineRuntimeConfigs()) importa o tipo
// daqui, nunca o inverso.
export interface CombinedRuntimeConfig extends DungeonRuntimeConfig {
  xpMultiplier: number;
  lootMultiplier: number;
}

export const NEUTRAL_COMBINED_RUNTIME_CONFIG: CombinedRuntimeConfig = {
  ...NEUTRAL_DUNGEON_RUNTIME_CONFIG,
  xpMultiplier: 1,
  lootMultiplier: 1,
};

// Requisito 2/5 — resultado de UM grupo dentro de um encontro (ex.: "2
// Goblins nível 8"). `instanceSeeds` já vem pré-rolado
// deterministicamente por generateEncounter() — um por membro do
// grupo — pra spawnWorldEncounter() (requisito 5: "nunca cria
// inimigos diretamente") só precisar consumir, nunca gerar RNG
// própria.
export interface EncounterGroupResult {
  enemyTemplateId: string;
  level: number;
  count: number;
  instanceSeeds: number[];
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/2/3: qual das
// 3 variantes esta "receita" representa. "normal" é o algoritmo
// original, inalterado; "elite" é um Enemy Template normal sorteado do
// pool da região, spawnado sozinho (count=1) com um multiplicador de
// stats (ver eliteModifiers.ts); "miniboss" é `table.miniBossTemplateId`
// spawnado sozinho, sem multiplicador (ele já é forte por ser um
// Template próprio).
export type EncounterVariant = "normal" | "elite" | "miniboss";

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// arquitetural: "eventos do mundo são apenas mais um tipo de
// encontro... aproveitar o Encounter Generator." `explorationEventId`
// (opcional, ausente = comportamento idêntico a antes) identifica QUAL
// worldevents/WorldEventDefinition esta receita representa, quando
// houver uma — ortogonal a `variant`: a categoria "ambush" ainda usa
// `variant` normal (grupos reais, combate de verdade, "reutilizar
// Encounter normal") só que também carrega `explorationEventId`; as outras 4
// categorias (treasure/merchant/shrine/discovery) sempre vêm com
// `groups: []` (zero inimigos — resolvidas por presentationLayer.ts,
// nunca por este módulo, que só GERA a receita).
export interface EncounterResult {
  regionId: string;
  seed: number;
  groups: EncounterGroupResult[];
  variant: EncounterVariant;
  explorationEventId?: string;
}

// Requisito 8 — o artefato final do pipeline (ver arquitetura no
// index.ts): a receita (EncounterResult) já transformada em
// EnemyInstance de verdade, via spawnEnemy() do Enemy System.
export interface WorldEncounter {
  regionId: string;
  seed: number;
  enemies: EnemyInstance[];
  variant: EncounterVariant;
  explorationEventId?: string;
}

// Biomes, Regions & World Progression Phase I — requisito 1: metadados
// de um bioma (ver biomes.ts). `levelRange`/`difficulty` numérica NÃO
// vivem aqui de propósito — sempre lidos de
// getEncounterTable(regionId), nunca duplicados; `difficultyLabel` é
// texto autoral (rico, vindo de docs/world-design/regions.md),
// distinto da classificação automática já existente em
// hud/deriveHudState.ts (classifyDifficulty), que continua servindo
// regiões sem biome metadata.
export interface BiomeVisualTheme {
  color: string;
  icon: string;
}

export interface BiomeDefinition {
  regionId: string;
  order: number;
  climate: string;
  description: string;
  difficultyLabel: string;
  visualTheme: BiomeVisualTheme;
}
