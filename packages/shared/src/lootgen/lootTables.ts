import type { LootTable } from "./types.js";

// Loot Generator Phase I — requisito 1: uma Loot Table por entidade.
// Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE em packages/shared/src/items.ts e dos pesos de
// mod em itemgen/prefixes.ts) — balanceamento real é decisão futura de
// economia, fora do escopo desta Sprint.
//
// Adicionar um novo monstro (ou um novo baú) = inserir um novo registro
// nesta lista. Nenhuma outra parte do Loot Generator
// (lootgen/generator.ts) precisa mudar.
// Gameplay Balance & First Playable Experience Phase I — requisito 5:
// "nos primeiros minutos o jogador encontre upgrades frequentes...
// evitar longos períodos sem recompensa." Antes, a chance efetiva de
// achar QUALQUER item por abate de Wolf/Goblin era dropChance x P(qtd>0)
// = 0.35x0.35=12.25% / 0.4x0.4=16% — quase 1 item a cada 7-8 abates.
// dropChance e a distribuição de quantidade dos dois monstros iniciais
// foram aumentados pra ~1 item a cada 3 abates (dropChance 0.6/0.65 x
// P(qtd>0) 0.6/0.65 ≈ 36%/42%), sem alterar `rarityMultiplier` (a
// distribuição de raridade em si — common predominante, magic
// ocasional — já estava adequada, ver itemgen/rarities.ts).
export const LOOT_TABLES: LootTable[] = [
  {
    // dropChance ligeiramente maior que a do Goblin: o pool de itens do
    // Wolf (dagger/boots/belt, sem arma "pesada" — coerente com um
    // bicho não carregar espada) tem upgrades de menor impacto que o do
    // Goblin (que inclui "sword"), então bosque-sussurrante media uma
    // taxa de morte mensuravelmente maior que pantano-podre na
    // simulação (68% vs 24% em 400 execuções) — compensado aqui com
    // mais frequência de drop, já que mudar QUAIS itens o Wolf largaria
    // extrapolaria "só dados de balanceamento" pra "redesenho de
    // identidade de loot" (fora do escopo desta Sprint).
    // Equipment Progression Repair Phase II — Fase 3/5: "chest" adicionado
    // ao pool (peso baixo, sem tirar espaço dos itens já estabelecidos) —
    // a auditoria anterior mediu que Peitoral nunca aparecia em NENHUMA
    // Loot Table de bosque-sussurrante/pantano-podre (as 2 únicas regiões
    // onde upgrades reais acontecem na prática), então mesmo corrigindo o
    // Power Score (itemgen/powerScore.ts) o slot continuaria congelado por
    // falta de oportunidade de drop, não só de comparação.
    id: "wolf",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 0.7,
    allowedBaseItems: ["dagger", "boots", "belt", "chest"],
    baseItemWeights: { dagger: 40, boots: 35, belt: 25, chest: 15 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1001,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/5: mesmo motivo do
    // Wolf acima — "chest" era ausente de toda pantano-podre também.
    id: "goblin",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 0.65,
    allowedBaseItems: ["dagger", "sword", "ring", "chest"],
    baseItemWeights: { dagger: 35, sword: 35, ring: 30, chest: 15 },
    rarityMultiplier: 1.1,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 35 },
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1002,
  },
  // Biomes, Regions & World Progression Phase I — requisito 3: "Ruínas:
  // Cajados, Anéis" — staff/ring adicionados com peso alto, mace/
  // helmet/chest mantidos com peso menor (variedade, não substituição
  // completa). Nenhuma mudança no Loot Generator, só pesos/allowedBaseItems.
  {
    // Equipment Progression Repair Phase II — Fase 3/4: `itemLevelVariance`
    // aumentado (não é raridade nem quantidade de drop) — a auditoria
    // mostrou 0% de aproveitamento de loot a partir da 3ª região porque o
    // Item Level real dos drops raramente ultrapassava os limiares de tier
    // (ex.: T3 exige Item Level >= 20 em vários mods) mesmo em regiões já
    // de nível 15-40 — uma variância maior dá chance real (não garantida)
    // de cruzar esses limiares mais cedo, sem tocar em drop rate/raridade.
    id: "skeleton",
    weight: 100,
    itemLevelVariance: 6,
    dropChance: 0.45,
    allowedBaseItems: ["mace", "helmet", "chest", "staff", "ring"],
    baseItemWeights: { mace: 15, helmet: 15, chest: 15, staff: 30, ring: 25 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 55 },
      { quantity: 1, weight: 40 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1003,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton acima.
    id: "bandit",
    weight: 100,
    itemLevelVariance: 6,
    dropChance: 0.5,
    allowedBaseItems: ["axe", "bow", "gloves", "amulet"],
    baseItemWeights: { axe: 30, bow: 30, gloves: 20, amulet: 20 },
    rarityMultiplier: 1.3,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 42 },
      { quantity: 2, weight: 8 },
    ],
    seedOffset: 1004,
  },
  {
    // Monster Loot Identity Phase I — "Bandit Captain": um novo monstro
    // (versão elite do Bandit), adicionado só como um registro de dados
    // aqui, exatamente como o cabeçalho deste arquivo promete. Existe
    // principalmente pra dar um exemplo real e testável de "monstro com
    // Rarity Bias próprio, mais forte que o do arquétipo" (ver
    // lootidentity/lootIdentities.ts).
    id: "bandit_captain",
    weight: 100,
    itemLevelVariance: 3,
    dropChance: 0.6,
    allowedBaseItems: ["sword", "axe", "bow", "gloves", "amulet"],
    baseItemWeights: { sword: 30, axe: 25, bow: 25, gloves: 10, amulet: 10 },
    rarityMultiplier: 1.6,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 40 },
      { quantity: 3, weight: 10 },
    ],
    seedOffset: 1005,
  },
  {
    // Baú do tesouro — id "treasure_chest" (não "chest") pra nunca se
    // confundir com o Base Item "chest" (peitoral), que é um id
    // completamente diferente de um registro completamente diferente
    // (ITEM_GEN_BASE_ITEMS).
    id: "treasure_chest",
    weight: 100,
    itemLevelVariance: 1,
    dropChance: 1.0,
    allowedBaseItems: [
      "sword", "axe", "bow", "dagger", "staff", "wand", "mace",
      "helmet", "chest", "gloves", "boots",
      "ring", "amulet", "belt",
    ],
    baseItemWeights: {
      sword: 10, axe: 10, bow: 10, dagger: 10, staff: 10, wand: 10, mace: 10,
      helmet: 10, chest: 10, gloves: 10, boots: 10,
      ring: 10, amulet: 10, belt: 10,
    },
    rarityMultiplier: 1.5,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 25 },
      { quantity: 3, weight: 5 },
    ],
    seedOffset: 2001,
  },
  // Biomes, Regions & World Progression Phase I — requisito 3:
  // "Fortaleza: Armaduras Pesadas" — helmet/chest/gloves/boots com peso
  // bem maior que armas/acessórios, mesma lista de allowedBaseItems de
  // antes (só os pesos mudaram).
  {
    id: "boss",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: [
      "sword", "axe", "bow", "dagger", "staff", "wand", "mace",
      "helmet", "chest", "gloves", "boots",
      "ring", "amulet", "belt",
    ],
    baseItemWeights: {
      sword: 6, axe: 6, bow: 6, dagger: 6, staff: 6, wand: 6, mace: 6,
      helmet: 16, chest: 18, gloves: 14, boots: 14,
      ring: 6, amulet: 6, belt: 4,
    },
    rarityMultiplier: 3.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 2, weight: 20 },
      { quantity: 3, weight: 50 },
      { quantity: 4, weight: 30 },
    ],
    seedOffset: 3001,
  },
  // Requisito 3 — Loot Regional do Bosque Sussurrante: "Arcos, Couro" —
  // Javali/Aranha favorecem bow + peças de armadura (boots/gloves,
  // aproximação de "couro" — Item Generator não tem material como
  // atributo próprio, ver nota em lootidentity/archetypes.ts sobre a
  // mesma limitação).
  {
    // Equipment Progression Repair Phase II — Fase 3/5: "helmet" adicionado
    // — mesmo raciocínio do Wolf/Goblin (Elmo ausente de toda a janela de
    // upgrades reais do jogo).
    id: "boar",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "boots", "belt", "helmet"],
    baseItemWeights: { bow: 45, boots: 35, belt: 20, helmet: 15 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1006,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/5: "amulet" adicionado
    // — era só alcançável via swamp-witch (Mini-Boss, raro); Aranha dá um
    // segundo canal, comum, já na 1ª região.
    id: "spider",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "dagger", "gloves", "amulet"],
    baseItemWeights: { bow: 35, dagger: 35, gloves: 30, amulet: 15 },
    rarityMultiplier: 1.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 },
    ],
    seedOffset: 1007,
  },
  // Requisito 3 — Colinas Áridas continuam favorecendo ouro (tema de
  // saque humano, já refletido no rarityMultiplier do Bandit) — Hiena
  // segue o mesmo espírito de itens ágeis (dagger/bow) do bioma.
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "hyena",
    weight: 100,
    itemLevelVariance: 6,
    dropChance: 0.5,
    allowedBaseItems: ["dagger", "bow", "boots"],
    baseItemWeights: { dagger: 35, bow: 35, boots: 30 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 45 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1008,
  },
  // Requisito 3 — Minas Abandonadas: "material de craft de metal" (doc)
  // vira, em termos de equipamento, viés em armadura pesada (mesmo tema
  // de "constructo de pedra" — chest/helmet/gloves).
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "stone-construct",
    weight: 100,
    itemLevelVariance: 5,
    dropChance: 0.55,
    allowedBaseItems: ["chest", "helmet", "gloves"],
    baseItemWeights: { chest: 40, helmet: 35, gloves: 25 },
    rarityMultiplier: 1.25,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 45 },
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1009,
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/4: uma Loot
  // Table por Mini-Boss, mesma convenção do "boss"/"treasure_chest"
  // (dropChance 1.0, quantityOptions sempre >= 1 — "loot especial"
  // garantido) — rarityMultiplier acima de qualquer inimigo comum da
  // própria região, mas abaixo do Boss final (3.0).
  {
    id: "wolf-alpha",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["dagger", "boots", "belt", "ring"],
    baseItemWeights: { dagger: 30, boots: 25, belt: 20, ring: 25 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4001,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/5: "helmet"
    // adicionado — pantano-podre não tinha nenhuma fonte de Elmo.
    id: "swamp-witch",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["staff", "wand", "amulet", "ring", "helmet"],
    baseItemWeights: { staff: 30, wand: 25, amulet: 25, ring: 20, helmet: 15 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4002,
  },
  {
    id: "ancient-construct",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["chest", "helmet", "gloves", "boots"],
    baseItemWeights: { chest: 30, helmet: 25, gloves: 25, boots: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4003,
  },
  {
    id: "forgotten-guardian",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["mace", "staff", "ring", "chest"],
    baseItemWeights: { mace: 25, staff: 30, ring: 25, chest: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4004,
  },
  {
    id: "dark-knight",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "mace", "chest", "helmet"],
    baseItemWeights: { sword: 30, mace: 25, chest: 25, helmet: 20 },
    rarityMultiplier: 2.2,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 40 },
    ],
    seedOffset: 4005,
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 5: "Loot Table exclusiva... reutiliza o Loot Generator existente."
  // Distinta da tabela "forgotten-guardian" acima (o loot NORMAL de
  // qualquer encontro com o Guardião Esquecido, dentro ou fora de uma
  // Dungeon) — esta é a recompensa ADICIONAL exclusiva de completar o
  // papel de "Chefe Final" de uma Dungeon (ver dungeon/
  // dungeonController.ts), somada por cima do drop normal do abate.
  // `rarityMultiplier` bem mais alto (4.0, o dobro de dark-knight) +
  // `rarityWeightMultipliers.unique` extra aplicado na chamada
  // (dungeonController.ts) — "item único" garantido, não só provável.
  {
    id: "final-boss-relic",
    weight: 100,
    itemLevelVariance: 3,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "mace", "staff", "amulet"],
    baseItemWeights: { sword: 30, mace: 25, staff: 25, amulet: 20 },
    rarityMultiplier: 4.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5001,
  },
  // Vertical Slice — Multi-Dungeon Content & Data Expansion Phase I —
  // uma Loot Table por monstro novo (enemy/templates.ts), mesma
  // convenção de sempre. Mobs regulares espelham o dropChance/formato
  // de outros mobs de bioma tardio (colinas-aridas/minas-abandonadas);
  // os 3 Chefes de Dungeon espelham EXATAMENTE o padrão dos Mini-Bosses
  // já existentes (dropChance 1.0, quantityOptions sempre >= 1,
  // rarityMultiplier acima de qualquer mob comum da própria Dungeon).
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "frost-wolf",
    weight: 100,
    itemLevelVariance: 5,
    dropChance: 0.55,
    allowedBaseItems: ["dagger", "boots", "belt"],
    baseItemWeights: { dagger: 35, boots: 35, belt: 30 },
    rarityMultiplier: 1.3,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 45 },
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1010,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "ice-golem",
    weight: 100,
    itemLevelVariance: 5,
    dropChance: 0.55,
    allowedBaseItems: ["chest", "helmet", "gloves", "boots"],
    baseItemWeights: { chest: 30, helmet: 30, gloves: 20, boots: 20 },
    rarityMultiplier: 1.35,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 45 },
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1011,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "corrupted-acolyte",
    weight: 100,
    itemLevelVariance: 5,
    dropChance: 0.5,
    allowedBaseItems: ["staff", "wand", "amulet", "ring"],
    baseItemWeights: { staff: 30, wand: 25, amulet: 25, ring: 20 },
    rarityMultiplier: 1.4,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 45 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1012,
  },
  {
    // Equipment Progression Repair Phase II — Fase 3/4: mesmo motivo do
    // Skeleton (ver comentário lá).
    id: "fire-cultist",
    weight: 100,
    itemLevelVariance: 5,
    dropChance: 0.5,
    allowedBaseItems: ["sword", "axe", "amulet", "ring"],
    baseItemWeights: { sword: 30, axe: 30, amulet: 20, ring: 20 },
    rarityMultiplier: 1.45,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 45 },
      { quantity: 2, weight: 5 },
    ],
    seedOffset: 1013,
  },
  {
    id: "frost-king",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["mace", "chest", "helmet", "ring"],
    baseItemWeights: { mace: 25, chest: 25, helmet: 25, ring: 25 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4006,
  },
  {
    id: "corrupted-bishop",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["staff", "wand", "amulet", "chest"],
    baseItemWeights: { staff: 30, wand: 25, amulet: 25, chest: 20 },
    rarityMultiplier: 2.0,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 },
    ],
    seedOffset: 4007,
  },
  {
    id: "ancient-dragon",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "axe", "amulet", "ring"],
    baseItemWeights: { sword: 30, axe: 25, amulet: 25, ring: 20 },
    rarityMultiplier: 2.5,
    quantityMultiplier: 1.0,
    quantityOptions: [
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 40 },
    ],
    seedOffset: 4008,
  },
  // Requisito 5 (Fase 5 — Recompensas) — recompensa ADICIONAL exclusiva
  // de completar o papel de "Chefe Final" de cada Dungeon (concedida por
  // dungeon/dungeonController.ts, intocado, exatamente como
  // "final-boss-relic" já fazia pra "queda-da-fortaleza-sombria") —
  // somada por cima do drop normal do abate acima. Mesmo formato: 1
  // item garantido, rarityMultiplier bem mais alto que qualquer tabela
  // regular.
  {
    id: "frost-king-relic",
    weight: 100,
    itemLevelVariance: 3,
    dropChance: 1.0,
    allowedBaseItems: ["mace", "chest", "amulet"],
    baseItemWeights: { mace: 35, chest: 35, amulet: 30 },
    rarityMultiplier: 4.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5002,
  },
  {
    id: "corrupted-bishop-relic",
    weight: 100,
    itemLevelVariance: 3,
    dropChance: 1.0,
    allowedBaseItems: ["staff", "amulet", "ring"],
    baseItemWeights: { staff: 40, amulet: 30, ring: 30 },
    rarityMultiplier: 4.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5003,
  },
  {
    id: "ancient-dragon-relic",
    weight: 100,
    itemLevelVariance: 3,
    dropChance: 1.0,
    allowedBaseItems: ["sword", "amulet", "ring"],
    baseItemWeights: { sword: 40, amulet: 30, ring: 30 },
    rarityMultiplier: 4.5,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5004,
  },
  // Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — Fase 3:
  // "reutilizar integralmente o Loot Generator existente." Uma Loot
  // Table por Relíquia (dungeon/uniqueRelicDefinitions.ts), DISTINTA das
  // "*-relic" acima (recompensa de CONCLUIR a Dungeon, aplicada por
  // dungeon/dungeonController.ts) — estas são a recompensa de derrotar
  // o BOSS especificamente (enemy/lootIntegration.ts), qualquer vez que
  // aconteça. Mesmo formato de sempre: dropChance 1.0, 1 item garantido,
  // rarityMultiplier bem alto (6.0, o mais alto do jogo) — combinado com
  // o `rarityWeightMultipliers.unique` extra aplicado na chamada
  // (lootIntegration.ts, mesma técnica de FINAL_BOSS_UNIQUE_BIAS já
  // usada pra loot de Dungeon), praticamente garante "unique".
  // `minLevel`/`maxLevel` espelham o levelRange do próprio Boss (enemy/
  // templates.ts).
  {
    id: "unique-guardian-seal",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["ring"],
    baseItemWeights: { ring: 100 },
    rarityMultiplier: 6.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 6001,
  },
  {
    id: "unique-frost-crown",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["helmet"],
    baseItemWeights: { helmet: 100 },
    rarityMultiplier: 6.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 6002,
  },
  {
    id: "unique-corrupted-mitre",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["helmet"],
    baseItemWeights: { helmet: 100 },
    rarityMultiplier: 6.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 6003,
  },
  {
    id: "unique-dragon-heart",
    weight: 100,
    itemLevelVariance: 2,
    dropChance: 1.0,
    allowedBaseItems: ["amulet"],
    baseItemWeights: { amulet: 100 },
    rarityMultiplier: 6.0,
    quantityMultiplier: 1.0,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 6004,
  },
];

export function getLootTable(id: string): LootTable | undefined {
  return LOOT_TABLES.find((table) => table.id === id);
}
