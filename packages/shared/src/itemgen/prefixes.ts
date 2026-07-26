import type { ItemGenModDefinition } from "./types.js";

// Item Generator Phase I/II — banco de Prefixos. Cada registro traz
// id/grupo/peso/tiers/tags/requiredTags/exclusões — nada disso é
// decidido em código (requisito 9). Valores ilustrativos, não
// calibrados (mesma convenção de CRITICAL_HIT_CHANCE em
// packages/shared/src/items.ts).
//
// Phase II (Affix System):
// - `requiredTags` substitui o antigo `allowedSlots`: em vez de listar
//   slots, cada mod exige que o Base Item tenha certas tags (ver
//   baseItems.ts). Ex.: Cruel (Physical Damage) exige "physical" — só
//   armas físicas (Sword/Axe/Dagger/Mace) têm essa tag; Staff/Wand
//   (conjuradores) não, então Cruel nunca rola neles.
// - `tiers[].weight` é o peso do tier entre os elegíveis pelo Item Level
//   (T1, o melhor, é sempre o mais raro — 2/8/18/72 no exemplo da
//   Sprint).
// - `baseItemWeights`/`rarityWeights` ajustam a frequência do mod por
//   tipo de equipamento/raridade (ver weights.ts).
// - "Healthy"/"Vigorous"/"Massive" são 3 mods DIFERENTES que
//   compartilham o group "life" — o item nunca pode ter dois ao mesmo
//   tempo, mesmo sendo ids diferentes (o requisito de "mod groups" pede
//   exatamente isso).
//
// Adicionar um novo Prefixo = inserir um novo registro nesta lista.
// Nenhuma outra parte do gerador (generator.ts) precisa mudar.
//
// Equipment Progression Repair Phase II — Fase 3 (Loot Value
// Improvement): `tiers[].weight` era 2/8/18/72 pra TODO mod de 4 tiers
// — como `rollMod()` (generator.ts) só filtra tiers elegíveis pelo Item
// Level e sorteia entre eles por peso, o tier T4 (sempre elegível
// desde o nível 1) ganhava a rolagem ~72% das vezes mesmo quando T1-T3
// já estavam elegíveis (Item Level bem mais alto) — ou seja, o valor
// esperado de um afixo mal crescia com a profundidade da região, só
// com sorte. A auditoria anterior mediu 0% de aproveitamento de loot a
// partir da 3ª região em 300 campanhas — sintoma direto disso. Pesos
// rebalanceados pra 4/16/30/50 (mesma proporção pra todos os mods de
// 4 tiers, T4 ainda o mais comum, mas não mais 72% do tempo) e 28/72
// pros mods de 2 tiers (Vida) — sem alterar nenhuma faixa de valor
// (min/max), sem adicionar afixo novo, sem mexer em raridade/
// quantidade de drop.
export const ITEM_GEN_PREFIXES: ItemGenModDefinition[] = [
  {
    id: "prefix_cruel",
    type: "prefix",
    group: "physical_damage",
    name: "Cruel",
    statLabel: "Physical Damage",
    weight: 100,
    tags: ["damage", "physical"],
    requiredTags: ["physical"],
    excludesGroups: [],
    // Machado: peso por Base Item do exemplo da Sprint ("Physical
    // Damage peso 120"). Spell Damage não precisa de um override "peso
    // 0" pro Machado porque a tag "physical" do Machado já nunca inclui
    // "spell" — ver prefix_mystic.baseItemWeights pra esse mesmo exemplo
    // espelhado do lado do Spell Damage.
    baseItemWeights: { axe: 120 },
    tiers: [
      { tier: 1, minItemLevel: 60, min: 80, max: 100, weight: 4 },
      { tier: 2, minItemLevel: 40, min: 60, max: 79, weight: 16 },
      { tier: 3, minItemLevel: 20, min: 40, max: 59, weight: 30 },
      { tier: 4, minItemLevel: 1, min: 20, max: 39, weight: 50 },
    ],
  },
  {
    id: "prefix_heavy",
    type: "prefix",
    group: "strength",
    name: "Heavy",
    statLabel: "Strength",
    weight: 90,
    tags: ["attribute", "strength"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 25, max: 30, weight: 4 },
      { tier: 2, minItemLevel: 30, min: 15, max: 24, weight: 16 },
      { tier: 3, minItemLevel: 10, min: 8, max: 14, weight: 30 },
      { tier: 4, minItemLevel: 1, min: 3, max: 7, weight: 50 },
    ],
  },
  {
    id: "prefix_healthy",
    type: "prefix",
    group: "life",
    name: "Healthy",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 10, min: 20, max: 24, weight: 28 },
      { tier: 2, minItemLevel: 1, min: 10, max: 19, weight: 72 },
    ],
  },
  {
    id: "prefix_vigorous",
    type: "prefix",
    group: "life",
    name: "Vigorous",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 40, min: 50, max: 59, weight: 28 },
      { tier: 2, minItemLevel: 20, min: 30, max: 49, weight: 72 },
    ],
  },
  {
    id: "prefix_massive",
    type: "prefix",
    group: "life",
    name: "Massive",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 65, min: 90, max: 110, weight: 28 },
      { tier: 2, minItemLevel: 50, min: 70, max: 89, weight: 72 },
    ],
  },
  {
    id: "prefix_swift",
    type: "prefix",
    group: "attack_speed",
    name: "Swift",
    statLabel: "Attack Speed",
    weight: 80,
    tags: ["speed", "attack_speed"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 15, max: 18, weight: 4 },
      { tier: 2, minItemLevel: 30, min: 10, max: 14, weight: 16 },
      { tier: 3, minItemLevel: 10, min: 5, max: 9, weight: 30 },
      { tier: 4, minItemLevel: 1, min: 1, max: 4, weight: 50 },
    ],
  },
  {
    id: "prefix_mystic",
    type: "prefix",
    group: "spell_damage",
    name: "Mystic",
    statLabel: "Spell Damage",
    weight: 80,
    tags: ["damage", "spell"],
    // Único mod que exige "spell" — só Staff/Wand têm essa tag
    // (baseItems.ts), então Mystic nunca rola em Sword/Axe/Bow/
    // Dagger/Mace. Este é o exemplo literal da Sprint: "nunca Spell
    // Damage porque a tag não permite".
    requiredTags: ["spell"],
    excludesGroups: [],
    // Mesmo exemplo da Sprint ("Spell Damage peso 0" no Machado),
    // espelhado aqui — redundante com a exclusão por tag acima (Machado
    // não tem "spell"), mas deixado explícito porque o requisito pede o
    // peso por Base Item como mecanismo próprio, testável mesmo sem
    // depender da exclusão por tag.
    baseItemWeights: { axe: 0, staff: 130, wand: 110 },
    rarityWeights: { unique: 1.4 },
    tiers: [
      { tier: 1, minItemLevel: 55, min: 70, max: 90, weight: 4 },
      { tier: 2, minItemLevel: 35, min: 45, max: 69, weight: 16 },
      { tier: 3, minItemLevel: 15, min: 25, max: 44, weight: 30 },
      { tier: 4, minItemLevel: 1, min: 10, max: 24, weight: 50 },
    ],
  },
];
