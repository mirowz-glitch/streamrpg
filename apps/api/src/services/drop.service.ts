import { randomUUID } from "node:crypto";
import {
  EquipmentLockError,
  normalizeItemRarity,
  appendItemHistoryEvent,
  createDefaultQuality,
  createItemHistory,
  createSocketConfiguration,
  deriveItemLegacyFromHistory,
  deriveLegacyEvents,
  deriveLegacySummary,
  derivePotentialFromSeed,
  deriveSocketCountFromSeed,
  isBaseEligibleForUncertainty,
  EXAMPLE_BASE_TRANSFORMATION_POOL,
  recordKingdomVisit,
  type DamageType,
  type InventoryItem,
  type ItemAffix,
  type ItemCraftState,
  type ItemHistory,
  type ItemLegacy,
  type ItemPotential,
  type ItemQuality,
  type ItemRarity,
  type ItemSlot,
  type LegacyEvent,
  type LegacySummary,
  type SocketConfiguration,
  type MythicOrigin,
  type BaseIdentitySummary,
  BASE_IDENTITY_REGISTRY,
  getBaseIdentitySummary,
} from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";
import { getCitizen } from "./citizen.service.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { deriveItemMythicOrigin } from "./mythicDiscovery.service.js";
import { getSocketGemDisplayNames, getSocketGemEffectDescriptions } from "./gem.service.js";

// Sprint 11 — Persistent Items + Affixes: os campos persistidos que
// `mapInventoryRow`/`getEquippedItems` agora leem de volta —
// `affixes`/`potential`/`quality`/`history` viajam como TEXT JSON no
// banco (mesmo padrão de `houses.history`), desserializados aqui, no
// único lugar que já converte uma linha crua em tipo de domínio.
// `??` cobre linhas do catálogo fixo pré-Sprint 11 (`affixes`/`quality`
// têm DEFAULT no schema, mas `potential`/`history`/`item_level`/`seed`
// continuam NULL para todo item anterior a esta migração).
function parsePersistedItemFields(row: Record<string, unknown>): {
  item_level: number | null;
  seed: number | null;
  affixes: ItemAffix[];
  potential: ItemPotential | null;
  quality: ItemQuality;
  craft_state: ItemCraftState;
  history: ItemHistory | null;
  legacy: ItemLegacy | null;
  legacyEvents: LegacyEvent[];
  legacySummary: LegacySummary | null;
  sockets: SocketConfiguration | null;
  uncertaintyEligible: boolean;
  mythicOrigin: MythicOrigin | null;
  baseIdentity: BaseIdentitySummary | null;
  socketGems: Record<string, string> | null;
  socketGemEffects: Record<string, string> | null;
} {
  const history = row.history ? (JSON.parse(row.history as string) as ItemHistory) : null;
  const sockets = row.sockets ? (JSON.parse(row.sockets as string) as SocketConfiguration) : null;
  // Sprint 14 — Legendary Items + Legacy System, Fase 8: derivado no
  // MESMO ponto que já desserializa `history` — `deriveItemLegacyFromHistory`/
  // `deriveLegacyEvents`/`deriveLegacySummary` são todas puras
  // (packages/shared), nenhuma escrita, nenhuma query extra.
  const createdAtIso = history?.events[0]?.at ?? new Date().toISOString();
  const nowIso = new Date().toISOString();
  const legacy = history ? deriveItemLegacyFromHistory(history, createdAtIso, nowIso) : null;
  const legacyEvents = history ? deriveLegacyEvents(history) : [];
  const legacySummary = history ? deriveLegacySummary(row.name as string, history, legacyEvents, legacy!.ageInDays) : null;

  return {
    item_level: (row.item_level as number | null | undefined) ?? null,
    seed: (row.seed as number | null | undefined) ?? null,
    affixes: row.affixes ? (JSON.parse(row.affixes as string) as ItemAffix[]) : [],
    potential: row.potential ? (JSON.parse(row.potential as string) as ItemPotential) : null,
    quality: row.quality ? (JSON.parse(row.quality as string) as ItemQuality) : createDefaultQuality(),
    craft_state: ((row.craft_state as ItemCraftState | null | undefined) ?? "open") as ItemCraftState,
    history,
    legacy,
    legacyEvents,
    legacySummary,
    sockets,
    // Sprint 16 — Economy Foundation, Fase 9 (UI mínima): "Este Item
    // pode revelar um destino desconhecido" ou "Nada acontece..." —
    // deriva da MESMA infraestrutura que `applySphereToItem("uncertainty")`
    // usa pra validar elegibilidade (transformation/), nunca uma
    // segunda regra. `false` pra item sem `base_item_id` (catálogo
    // fixo pré-Sprint 11).
    uncertaintyEligible: row.base_item_id ? isBaseEligibleForUncertainty(row.base_item_id as string, EXAMPLE_BASE_TRANSFORMATION_POOL) : false,
    // Sprint 18 — Mythic Foundation, Fase 6/10: "Origem" derivada do
    // History real, nunca uma coluna nova. `history.events.some(...)`
    // é um filtro puro barato ANTES de chamar `deriveItemMythicOrigin`
    // (que consulta `mythic_discoveries`) — evita 1 query por item pra
    // a esmagadora maioria dos itens, que nunca foram um Mítico.
    mythicOrigin: history && history.events.some((evt) => evt.event === "mythic_revealed") ? deriveItemMythicOrigin(history.events) : history ? { isMythic: false, mythicId: null, displayName: null, isFirstDiscovery: false } : null,
    // Sprint 19 — Base Identity, Fase 10: "Base: X / Tier N / Potential:
    // Y" — derivado puro (nenhuma query extra), `null` só quando o item
    // não tem `base_item_id` (catálogo fixo) ou a Base ainda não tem
    // BaseIdentity registrada (nunca inventa identidade).
    baseIdentity: row.base_item_id ? (getBaseIdentitySummary(BASE_IDENTITY_REGISTRY, row.base_item_id as string) ?? null) : null,
    // Sprint 20 — Sockets & Gemas Phase I, Fase 10: nome de Gema por
    // Socket, só consultado quando existe ao menos um Socket `filled`
    // (mesmo princípio de custo de `mythicOrigin`) — `row.item_id` é
    // `items.id`, a mesma coluna que `gems.socketed_item_id` referencia
    // (não `ci.id`/character_item_id).
    socketGems: sockets && sockets.sockets.some((s) => s.state === "filled") ? getSocketGemDisplayNames(row.item_id as number) : null,
    // Sprint 21 — Gem Effects Phase I, Fase 8: descrição do efeito por
    // Socket, mesmo princípio de custo de `socketGems` — só consulta
    // quando há Socket `filled`.
    socketGemEffects: sockets && sockets.sockets.some((s) => s.state === "filled") ? getSocketGemEffectDescriptions(row.item_id as number) : null,
  };
}

// Exportada para reaproveitamento em xp.service.ts (Sprint Player
// Feedback Bridge) — o mesmo mapeamento de linha, sem duplicar a lógica.
export function mapInventoryRow(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as number,
    item_id: row.item_id as number,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    rarity: row.rarity as InventoryItem["rarity"],
    slot: row.slot as ItemSlot,
    min_level: row.min_level as number,
    is_equipped: Boolean(row.is_equipped),
    equipped_slot: (row.equipped_slot as ItemSlot | null) ?? null,
    obtained_at: new Date((row.obtained_at as number) * 1000).toISOString(),
    // Sprint Equipment Experience — colunas já existentes no banco desde
    // a Sprint Character Attributes Schema, agora expostas pela API.
    damage_type: (row.damage_type as DamageType | undefined) ?? "physical",
    uti_bonus: (row.uti_bonus as number | undefined) ?? 0,
    // Blacksmith Phase I — coluna já existente (Item Generator), agora
    // exposta pela API.
    power_score: (row.power_score as number | null | undefined) ?? null,
    upgrade_level: (row.upgrade_level as number | undefined) ?? 0,
    ...parsePersistedItemFields(row),
  };
}

export function listInventory(characterId: string): InventoryItem[] {
  const rows = getDb()
    .prepare(
      `SELECT ci.id, ci.item_id, ci.obtained_at, i.slug, i.name, i.description, i.rarity, i.slot, i.min_level,
              i.damage_type, i.uti_bonus, i.power_score, i.upgrade_level,
              i.item_level, i.seed, i.affixes, i.potential, i.quality, i.craft_state, i.history, i.sockets, i.base_item_id,
              CASE WHEN e.character_item_id IS NOT NULL THEN 1 ELSE 0 END AS is_equipped,
              e.slot AS equipped_slot
       FROM character_items ci
       JOIN items i ON i.id = ci.item_id
       LEFT JOIN equipped_items e ON e.character_item_id = ci.id
       WHERE ci.character_id = ?
       ORDER BY ci.obtained_at DESC`,
    )
    .all(characterId) as Record<string, unknown>[];

  return rows.map(mapInventoryRow);
}

// Vertical Slice — Persistent Player Experience Phase I — a Aventura
// (packages/shared: Item Generator, protegido/intocado nesta Sprint)
// gera itens por `baseItemId` procedural (rarity/slot num vocabulário
// próprio, ver itemgen/) — diferente do catálogo fixo que este serviço
// já gerenciava. Em vez de um catálogo paralelo (proibido: "não criar
// novos sistemas"), cada item encontrado vira uma linha NOVA nesta
// MESMA tabela `items` (slug único por instância, já que cada rolagem
// procedural é única) — dali em diante é um item de catálogo comum,
// gerenciado pelos MESMOS equipItem/listInventory/unequipItem de
// sempre, nenhuma lógica de equipar/desequipar nova.
export interface AdventureLootInput {
  baseItemId: string;
  name: string;
  rarity: string;
  slot: string;
  powerScore: number;
  // Sprint 11 — Persistent Items + Affixes: os campos que o Item
  // Generator (packages/shared/itemgen) já produzia, mas que este
  // input nunca carregava até esta Sprint (a causa raiz achada na
  // Fase 1: `POST /api/items/loot` só enviava baseItemId/name/rarity/
  // slot/powerScore). Opcionais porque continuam existindo consumidores
  // que não têm esse dado em mãos (ex.: item inicial do First Item
  // Quest, gerado fora do Item Generator) — quando ausentes, o item
  // nasce com afixos vazios/potencial nulo, nunca um erro.
  itemLevel?: number;
  seed?: number;
  prefixes?: ItemAffix[];
  suffixes?: ItemAffix[];
}

export function grantAdventureLoot(characterId: string, channelId: string | null, loot: AdventureLootInput): InventoryItem {
  const db = getDb();
  const slug = `adventure-${loot.baseItemId}-${randomUUID()}`;
  // Bug fix (World Autonomy Phase II, Sprint 9) — `loot.rarity` chega como
  // a string crua do Item Generator (common/magic/rare/unique,
  // itemgen/rarities.ts), mas `items.rarity` é lido de volta como
  // `ItemRarity` (5 tiers) por todo o sistema econômico. Normaliza aqui,
  // no único ponto de persistência, para que "magic"/"unique" nunca
  // cheguem crus ao banco (ver itemgen/rarityMapping.ts).
  const rarity = normalizeItemRarity(loot.rarity);

  // Sprint 11, Fase 2/3/4/5/6 — "Nenhuma simplificação": afixos gravados
  // exatamente como o Item Generator rolou (prefixes+suffixes
  // concatenados, cada um já carrega `type: "prefix"|"suffix"` — nenhum
  // dado descartado). Potential derivado do MESMO seed do item (sem
  // nova fonte de RNG); Quality/Craft State nascem no valor neutro
  // (0/'open'); History começa com o evento "created".
  const affixes: ItemAffix[] = [...(loot.prefixes ?? []), ...(loot.suffixes ?? [])];
  const nowIso = new Date().toISOString();
  const potential = loot.seed !== undefined ? derivePotentialFromSeed(loot.seed, nowIso) : null;
  const quality = createDefaultQuality();
  // Sprint 15 — Sockets + Gem System (Foundation), Fase 3/4: mesmo
  // princípio de Potential — derivado do MESMO seed do Item Generator
  // (nenhuma nova fonte de aleatoriedade), `null` sem seed (mesmo
  // padrão de `potential`/histórico retroativo nunca inventado).
  const sockets = loot.seed !== undefined ? createSocketConfiguration(deriveSocketCountFromSeed(loot.seed), loot.seed) : null;
  let history = createItemHistory(characterId, characterId, nowIso);
  // Sprint 14 — Legendary Items + Legacy System, Fase 6: Legado do
  // Reino. Se o personagem pertence a um Reino agora, o item nasce já
  // "tendo visitado" esse Reino — o único ponto real de escrita
  // (comparado a instrumentar toda transição de Reino do personagem,
  // fora de escopo desta Sprint: só a origem do item é registrada,
  // nunca o trajeto completo do personagem).
  const citizen = getCitizen(characterId);
  if (citizen) {
    history = recordKingdomVisit(history, citizen.kingdom_id, characterId, nowIso);
  }

  const insert = db
    .prepare(
      `INSERT INTO items (
         slug, name, description, rarity, slot, min_level, base_item_id, power_score,
         item_level, seed, affixes, potential, quality, craft_state, history, sockets
       )
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    )
    .run(
      slug,
      loot.name,
      "",
      rarity,
      loot.slot,
      loot.baseItemId,
      loot.powerScore,
      loot.itemLevel ?? null,
      loot.seed ?? null,
      JSON.stringify(affixes),
      potential ? JSON.stringify(potential) : null,
      JSON.stringify(quality),
      JSON.stringify(history),
      sockets ? JSON.stringify(sockets) : null,
    );
  const itemId = Number(insert.lastInsertRowid);

  const characterItem = db
    .prepare(
      `INSERT INTO character_items (character_id, item_id, obtained_channel_id, obtained_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(characterId, itemId, channelId, nowUnix());
  const characterItemId = Number(characterItem.lastInsertRowid);

  const item = listInventory(characterId).find((i) => i.id === characterItemId);
  if (!item) {
    throw new Error("Failed to grant adventure loot");
  }
  return item;
}

// RC-1 Fase 3 — Integração: mesma regra que tryAutoEquip() já aplica no
// lado do cliente (packages/shared/adventure/autoEquip.ts — "só troca
// se o novo for estritamente maior"), mas comparando contra o item
// REALMENTE equipado nesse slot (equipped_items), não contra a
// Equipment local da sessão (que nunca sabe o que já está equipado de
// verdade — sempre nasce com o kit inicial). Sem esta checagem, o
// AutoEquip do cliente decide "equipar" comparando com um kit inicial
// falso e o servidor aceitava cegamente, substituindo equipamento real
// bom por um drop pior. Só protege o caminho de AutoEquip — o clique
// manual "Equipar" continua livre para equipar qualquer item, mesmo um
// downgrade deliberado.
export function isRealUpgradeForSlot(characterId: string, slot: ItemSlot, newPowerScore: number): boolean {
  const currentlyEquipped = getEquippedItems(characterId).find((equipped) => equipped.slot === slot);
  const currentPowerScore = currentlyEquipped?.power_score ?? 0;
  return newPowerScore > currentPowerScore;
}

// Equipment Locking & Concurrency Phase I — Fase 3: `operationOwner`
// identifica quem está chamando (AutoEquip vs. o clique manual
// "Equipar" do jogador) só para o Equipment Lock — nenhuma regra de
// negócio de equipar muda; o parâmetro é aditivo e opcional.
export function equipItem(
  characterId: string,
  characterItemId: number,
  operationOwner = "equip",
): InventoryItem {
  return equipmentLock.withLock(characterItemId, operationOwner, () => {
    const db = getDb();
    const owned = db
      .prepare(
        `SELECT ci.id, ci.character_id, i.slot, i.min_level, c.level
         FROM character_items ci
         JOIN items i ON i.id = ci.item_id
         JOIN characters c ON c.id = ci.character_id
         WHERE ci.id = ? AND ci.character_id = ?`,
      )
      .get(characterItemId, characterId) as
      | { id: number; character_id: string; slot: ItemSlot; min_level: number; level: number }
      | undefined;

    if (!owned) {
      throw new Error("Item not found in inventory");
    }

    if (owned.level < owned.min_level) {
      throw new Error(`Requires level ${owned.min_level}`);
    }

    // Equipment Locking & Concurrency Phase I — Fase 3: o item
    // ATUALMENTE equipado nesse slot está prestes a ser desequipado por
    // esta troca. Se outra operação crítica (ex.: Blacksmith no meio de
    // um upgrade) já segura o lock desse item, esta troca é rejeitada —
    // mesmo cenário descrito em docs/design/equipment-locking-phase1.md
    // (AutoEquip trocando o item que o Ferreiro está prestes a
    // melhorar).
    const currentOccupant = db
      .prepare(
        `SELECT character_item_id FROM equipped_items WHERE character_id = ? AND slot = ?`,
      )
      .get(characterId, owned.slot) as { character_item_id: number } | undefined;
    if (currentOccupant && equipmentLock.isLocked(currentOccupant.character_item_id)) {
      throw new EquipmentLockError(currentOccupant.character_item_id);
    }

    db.prepare("DELETE FROM equipped_items WHERE character_id = ? AND slot = ?").run(characterId, owned.slot);
    db.prepare(
      `INSERT INTO equipped_items (character_id, slot, character_item_id, equipped_at)
       VALUES (?, ?, ?, ?)`,
    ).run(characterId, owned.slot, characterItemId, nowUnix());

    const item = listInventory(characterId).find((i) => i.id === characterItemId);
    if (!item) {
      throw new Error("Failed to equip item");
    }
    return item;
  });
}

export function unequipItem(characterId: string, slot: ItemSlot): void {
  getDb()
    .prepare("DELETE FROM equipped_items WHERE character_id = ? AND slot = ?")
    .run(characterId, slot);
}

// Merchant Phase I — Fase 3/4/5: remove um item da mochila do jogador —
// mesmo sistema de inventário de sempre (character_items), nenhuma
// tabela/lógica nova. Quem chama isto (merchant.service.ts) já validou
// posse/estado do item antes; esta função só garante, na própria query,
// que o item pertence ao personagem informado (defesa em profundidade,
// nunca confia só na validação de quem chamou). Não apaga a linha de
// `items` (o catálogo procedural) — cada item da Aventura já é uma
// linha única (grantAdventureLoot), removê-la deixaria órfã pra sempre
// qualquer referência futura de auditoria; a linha órfã em `items` é
// dado morto inofensivo, não um bug (ver docs/design/merchant-phase1.md
// "Problemas Encontrados").
export function removeItem(characterId: string, characterItemId: number): void {
  const db = getDb();
  db.prepare("DELETE FROM equipped_items WHERE character_id = ? AND character_item_id = ?").run(
    characterId,
    characterItemId,
  );
  const result = db
    .prepare("DELETE FROM character_items WHERE id = ? AND character_id = ?")
    .run(characterItemId, characterId);
  if (result.changes === 0) {
    throw new Error("Item not found in inventory");
  }
}

export function getEquippedItems(characterId: string) {
  const rows = getDb()
    .prepare(
      `SELECT e.slot, e.character_item_id, i.id AS item_id, i.name, i.rarity, i.damage_type, i.uti_bonus,
              i.min_level, i.power_score, i.upgrade_level,
              i.item_level, i.seed, i.affixes, i.potential, i.quality, i.craft_state, i.history, i.sockets, i.base_item_id
       FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ?`,
    )
    .all(characterId) as Record<string, unknown>[];

  return rows.map((row) => ({
    slot: row.slot as ItemSlot,
    character_item_id: row.character_item_id as number,
    // Sprint 21 — Gem Effects Phase I: `i.id AS item_id` já vinha na
    // query (Sprint 20 já precisava dele internamente pra
    // `parsePersistedItemFields`) — agora também exposto no objeto
    // retornado, pra quem chama `getEquippedItems()` de fora
    // (character.ts) poder consultar `gems.socketed_item_id`.
    item_id: row.item_id as number,
    name: row.name as string,
    rarity: row.rarity as ItemRarity,
    damage_type: row.damage_type as DamageType,
    uti_bonus: row.uti_bonus as number,
    min_level: row.min_level as number,
    power_score: (row.power_score as number | null | undefined) ?? null,
    upgrade_level: row.upgrade_level as number,
    ...parsePersistedItemFields(row),
  }));
}

// Blacksmith Phase I — Fase 6: única função que escreve o novo estado de
// um item melhorado. Nenhuma regra de upgrade vive aqui — quem chama já
// calculou `newPowerScore`/`newUpgradeLevel` (packages/shared, função
// pura). Esta camada só executa a escrita, dentro da transação aberta
// pelo blacksmith.service.ts (mesmo padrão de removeItem/ADR-0001).
export function applyItemUpgrade(
  characterId: string,
  characterItemId: number,
  newPowerScore: number,
  newUpgradeLevel: number,
): void {
  const db = getDb();
  const owned = db
    .prepare(
      `SELECT ci.item_id, i.history FROM character_items ci
       JOIN items i ON i.id = ci.item_id
       WHERE ci.id = ? AND ci.character_id = ?`,
    )
    .get(characterItemId, characterId) as { item_id: number; history: string | null } | undefined;
  if (!owned) {
    throw new Error("Item not found in inventory");
  }
  // Sprint 11, Fase 9 — Blacksmith nunca apaga histórico: append-only,
  // mesmo padrão de `appendItemHistoryEvent` (packages/shared). Item do
  // catálogo fixo pré-Sprint 11 sem `history` ainda (`owned.history ===
  // null`) simplesmente não ganha um evento retroativo — nada a apagar.
  if (owned.history) {
    const history = appendItemHistoryEvent(
      JSON.parse(owned.history) as ItemHistory,
      "upgraded",
      characterId,
      `power_score -> ${newPowerScore}, upgrade_level -> ${newUpgradeLevel}`,
      new Date().toISOString(),
    );
    db.prepare("UPDATE items SET power_score = ?, upgrade_level = ?, history = ? WHERE id = ?").run(
      newPowerScore,
      newUpgradeLevel,
      JSON.stringify(history),
      owned.item_id,
    );
    return;
  }
  db.prepare("UPDATE items SET power_score = ?, upgrade_level = ? WHERE id = ?").run(
    newPowerScore,
    newUpgradeLevel,
    owned.item_id,
  );
}

// Sprint 14 — Legendary Items + Legacy System, Fase 4: quem chama
// `recordItemHistoryEvent()` pro item equipado num slot (ex.: a arma,
// no momento de um Chefe Final derrotado) só tem `characterId`/`slot`
// em mãos, nunca o `item_id` — `getEquippedItems()` devolve o shape
// público da API (sem `item_id`, só `character_item_id`), então esta é
// uma consulta dedicada, pequena, só pro caso de uso de Legacy.
export function findEquippedItemCatalogId(characterId: string, slot: ItemSlot): { itemId: number; history: ItemHistory | null } | null {
  const row = getDb()
    .prepare(
      `SELECT i.id AS item_id, i.history FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ? AND e.slot = ?`,
    )
    .get(characterId, slot) as { item_id: number; history: string | null } | undefined;
  if (!row) return null;
  return { itemId: row.item_id, history: row.history ? (JSON.parse(row.history) as ItemHistory) : null };
}

// Sprint 14 — Legendary Items + Legacy System, Fase 3/5: caminho REAL
// de gravação de um evento de histórico dado o `item_id` (linha do
// catálogo procedural, `items.id` — não `character_item_id`), pra
// reaproveitar em Merchant/Salvage (e qualquer consumidor futuro) sem
// duplicar o mesmo bloco de leitura+append+escrita já usado por
// `applyItemUpgrade`. Sempre append-only, nunca falha silenciosamente
// se `history` for `null` (catálogo fixo pré-Sprint 11) — nesse caso
// não há nada a gravar, e a chamada é um no-op deliberado.
export function recordItemHistoryEvent(
  itemId: number,
  currentHistory: ItemHistory | null,
  eventType: Parameters<typeof appendItemHistoryEvent>[1],
  characterId: string | null,
  detail: string | null,
): void {
  if (!currentHistory) return;
  const history = appendItemHistoryEvent(currentHistory, eventType, characterId, detail, new Date().toISOString());
  getDb().prepare("UPDATE items SET history = ? WHERE id = ?").run(JSON.stringify(history), itemId);
}

export function getEquippedWeaponName(characterId: string): string | null {
  const row = getDb()
    .prepare(
      `SELECT i.name FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ? AND e.slot = 'weapon'`,
    )
    .get(characterId) as { name: string } | undefined;
  return row?.name ?? null;
}
