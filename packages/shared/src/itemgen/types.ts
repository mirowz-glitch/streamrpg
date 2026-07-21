// Item Generator Phase I — tipos isolados de propósito.
//
// O projeto já tem `ItemRarity`/`ItemSlot`/`DamageType` (types.ts) e
// `RARITY_WEIGHTS`/`pickRarity()` (xp.ts), usados HOJE por
// DropSystem/InventoryPage/EquipmentSlots — o modelo simples de 5
// raridades fixas (common/uncommon/rare/epic/legendary), sem prefixo,
// sem sufixo, sem tier. Esta Sprint não toca nenhum deles.
//
// O Item Generator é um sistema PARALELO, estilo Path of Exile
// (prefixo/sufixo/tier/item level), pensado para substituir o modelo
// simples só numa fase futura de Drops/Boss Loot/Craft — por isso todo
// nome público aqui usa o prefixo `ItemGen` e nada é reexportado com o
// mesmo nome de um tipo já existente.

export type ItemGenCategory = "weapon" | "armor" | "accessory";

export type ItemGenSlot =
  | "weapon"
  | "helmet"
  | "chest"
  | "gloves"
  | "boots"
  | "ring"
  | "amulet"
  | "belt";

export interface ItemGenRequirements {
  level?: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
}

// Base Item — passo 1 do pipeline. Só dados neutros (slot/dano
// base/defesa base/velocidade base/requisitos), NUNCA atributo mágico
// (requisito 1 da Sprint).
//
// Phase II (Affix System) — `tags` é o que o gerador usa pra saber quais
// mods podem rolar num Base Item (ex.: Sword tem "physical", Staff tem
// "spell" — Physical Damage exige "physical", Spell Damage exige
// "spell", então nunca se misturam). Puramente descritivo, sem relação
// com `ItemGenSlot`/`ItemGenCategory` (que continuam existindo pra
// equipar/organizar; tags são só pro Affix System decidir elegibilidade).
export interface ItemGenBaseItem {
  id: string;
  name: string;
  category: ItemGenCategory;
  slot: ItemGenSlot;
  tags: string[];
  baseDamage?: { min: number; max: number };
  baseDefense?: number;
  baseAttackSpeed?: number;
  requirements?: ItemGenRequirements;
}

export type ItemGenRarityId = "common" | "magic" | "rare" | "unique";

// Rarity — passo 3 do pipeline. Cada raridade só define quantidade
// min/max de prefixos e sufixos, cor e peso de drop — nenhuma lógica
// hardcoded lê o nome da raridade, só esses números (requisito 2/9).
export interface ItemGenRarityDefinition {
  id: ItemGenRarityId;
  label: string;
  color: string;
  minPrefixes: number;
  maxPrefixes: number;
  minSuffixes: number;
  maxSuffixes: number;
  dropWeight: number;
}

export type ItemGenModType = "prefix" | "suffix";

// Um tier de um mod — passo 5 do pipeline. `minItemLevel` é o Item
// Level mínimo pra esse tier poder ser sorteado; nenhum número solto no
// gerador, tudo vem daqui (requisito 5).
//
// Phase II — `weight` é o peso do tier ENTRE os tiers já elegíveis pelo
// Item Level ("peso por Item Level" do requisito): T1 (melhor) deve
// pesar bem menos que T4 (pior), pra loot parecer natural (ex.: 2/8/18/72
// no exemplo da Sprint) em vez de sortear qualquer tier desbloqueado com
// a mesma chance.
export interface ItemGenModTier {
  tier: number;
  minItemLevel: number;
  min: number;
  max: number;
  weight: number;
}

// Prefixo/Sufixo — passo 4 do pipeline (requisito 3/4). `group` impede
// que dois mods do mesmo grupo (ex.: dois mods de "Life") sejam
// sorteados juntos no mesmo item — Phase II tornou essa checagem GLOBAL
// (prefixo x prefixo, sufixo x sufixo E prefixo x sufixo), não mais só
// dentro do mesmo tipo.
//
// Phase II (Affix System):
// - `requiredTags` substitui o antigo `allowedSlots: ItemGenSlot[] |
//   "any"` do Phase I — em vez de restringir por slot de equipamento,
//   restringe pelas tags do Base Item (mais flexível: cobre "arma
//   física" vs "arma de conjuração" dentro do mesmo slot "weapon", algo
//   que slot sozinho não conseguia expressar). `[]` = qualquer item
//   serve (equivalente ao antigo "any").
// - `excludesGroups` é o bloqueio entre afixos incompatíveis pedido na
//   Sprint: se um mod já rolado pertence a um desses grupos (ou se ele
//   mesmo bloqueia o grupo deste mod), este mod nunca é sorteado junto
//   — checagem bidirecional, basta declarar de um dos dois lados.
// - `baseItemWeights` é o peso por tipo de equipamento do requisito
//   (ex.: Machado Physical Damage peso 120, Spell Damage peso 0) — um
//   valor ausente aqui cai de volta pro `weight` base.
// - `rarityWeights` é o peso por raridade do requisito — um
//   MULTIPLICADOR sobre o peso já resolvido (base ou por Base Item),
//   não um valor absoluto; ausente = 1 (neutro).
export interface ItemGenModDefinition {
  id: string;
  type: ItemGenModType;
  group: string;
  name: string;
  statLabel: string;
  weight: number;
  tags: string[];
  requiredTags: string[];
  excludesGroups: string[];
  baseItemWeights?: Partial<Record<string, number>>;
  rarityWeights?: Partial<Record<ItemGenRarityId, number>>;
  tiers: ItemGenModTier[];
}

// Grupo de mods — passo 4/9 do pipeline. Registro central de todo
// `group` usado por algum prefixo/sufixo, só pra existir uma lista
// autoritativa (evita typo tipo "life" vs "Life" em mods diferentes) —
// generator.ts nunca lê isto pra decidir nada, quem lê é o teste de
// integridade dos dados (generator.test.ts).
export interface ItemGenModGroup {
  id: string;
  label: string;
}

// Um mod já rolado (tier escolhido + valor sorteado dentro da faixa) —
// passo 6 do pipeline.
export interface ItemGenRolledMod {
  modId: string;
  type: ItemGenModType;
  group: string;
  name: string;
  statLabel: string;
  tags: string[];
  tier: number;
  value: number;
}

// Item final — passo 9 do pipeline (Final Item). `seed` fica guardado
// no próprio item: a mesma seed sempre reconstrói o mesmo resultado
// (requisito 8), útil pra sincronização/replay/auditoria de mercado.
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 6: `sourceVariant`
// é extensão puramente aditiva (opcional, ausente em todo item comum —
// nenhum comportamento existente muda). É o único sinal PRECISO (não
// heurística) de que um item veio de um Elite/Mini-Boss — ver
// enemy/lootIntegration.ts (quem marca) e presentationLayer.ts (quem lê,
// pra emitir EliteDefeated/MiniBossDefeated — ver nota lá sobre por que
// esse sinal, e não outro, foi escolhido).
export interface ItemGenGeneratedItem {
  seed: number;
  baseItemId: string;
  itemLevel: number;
  rarity: ItemGenRarityId;
  prefixes: ItemGenRolledMod[];
  suffixes: ItemGenRolledMod[];
  powerScore: number;
  sourceVariant?: "elite" | "miniboss";
  // Requisito 6 — mesmo princípio de `sourceVariant`: qual
  // `EnemyTemplate.id` dropou este item, só quando `sourceVariant`
  // está presente (Elite sorteia um Enemy Template aleatório do pool
  // da região — sem isso, essa identidade se perderia, já que
  // `sourceVariant` sozinho não diz QUAL Elite).
  sourceEnemyTemplateId?: string;
}
