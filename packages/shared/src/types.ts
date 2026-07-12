export interface Profile {
  id: string;
  twitch_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreamerChannel {
  id: string;
  display_name: string;
  twitch_id: string;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
}

export interface Character {
  id: string;
  profile_id: string;
  display_name: string;
  level: number;
  xp: number;
  gold: number;
  total_minutes: number;
  primary_channel_id: string | null;
  last_ping_at: number | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterCombatSummary {
  attack_physical: number;
  attack_magic: number;
  resistance_physical: number;
  resistance_magic: number;
  sus: number;
  uti: number;
}

export interface CharacterResponse {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  xp_to_next: number;
  percent: number;
  gold: number;
  total_minutes: number;
  avatar_url: string | null;
  primary_channel_id: string | null;
  equipped: EquippedItem[];
  // Sprint Equipment Experience — reaproveita CharacterRepository.getCombatAttributes()
  // (já existente desde a Sprint Character Attributes Schema), nenhum cálculo novo.
  combat: CharacterCombatSummary;
  created_at: string;
}

export interface PingResponse {
  xp_gained: number;
  gold_gained: number;
  new_xp: number;
  level: number;
  leveled_up: boolean;
  xp_to_next: number;
  percent: number;
  cooldown_seconds: number;
  drop: DropResult | null;
}

export interface DropResult {
  dropped: boolean;
  item?: InventoryItem;
}

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ItemSlot = "weapon" | "armor" | "helmet" | "boots" | "amulet" | "ring";

// Sprint Character Attributes Schema — infraestrutura para o Combat Model
// (docs/combat-model/canonical-formula.md). Em armas, decide se o ATQ é
// físico ou mágico; nos demais slots, decide se a Resistência concedida é
// física ou mágica. Opcional aqui porque o catálogo hoje é quase todo
// físico por padrão (mesmo default da coluna `items.damage_type` no
// banco) — não precisa ser declarado em toda entrada do catálogo.
export type DamageType = "physical" | "magic";

export interface ItemCatalogEntry {
  id: number;
  slug: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  min_level: number;
  damage_type?: DamageType;
  uti_bonus?: number;
}

export interface InventoryItem {
  id: number;
  item_id: number;
  slug: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  min_level: number;
  is_equipped: boolean;
  equipped_slot: ItemSlot | null;
  obtained_at: string;
  // Sprint Equipment Experience — colunas já existentes desde a Sprint
  // Character Attributes Schema (items.damage_type/uti_bonus), nunca
  // enviadas pela API até agora.
  damage_type: DamageType;
  uti_bonus: number;
}

export interface EquippedItem {
  slot: ItemSlot;
  character_item_id: number;
  name: string;
  rarity: ItemRarity;
  // Sprint Identity & Progression — mesmas colunas já expostas em
  // InventoryItem, agora também na lista de equipados (nenhum dado novo,
  // só reaproveitado aqui para mostrar atributos/bônus no perfil).
  damage_type: DamageType;
  uti_bonus: number;
}

export interface RankingEntry {
  position: number;
  character_id: string;
  display_name: string;
  level: number;
  xp: number;
  total_minutes: number;
  avatar_url: string | null;
  // Sprint Founder Identity & Prestige — título/moldura equipados, só
  // para exibição (nunca afeta posição/XP/ordenação do ranking).
  title_name: string | null;
  frame_tier: FrameTier | null;
  // Sprint Kingdom Prestige System — ícones dos cargos do Reino que este
  // personagem ocupa hoje (Etapa 7). Só populado quando o Ranking está
  // filtrado por canal — cargo é um conceito de Reino, não existe versão
  // "global" (mesmo motivo pelo qual channel pode ser null acima).
  role_icons: string[];
}

export interface RankingResponse {
  channel: string | null;
  entries: RankingEntry[];
  my_position: number | null;
}

export interface OverlayViewer {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  percent: number;
  avatar_url: string | null;
  equipped_weapon: string | null;
  // Sprint Expedition System — resumo compacto, mesmo formato usado no
  // overlay (Etapa 9): região atual + estado + progresso. Null quando o
  // personagem ainda não tem nenhuma expedição.
  expedition: ExpeditionCompact | null;
  // Sprint Founder Identity & Prestige — título equipado, mostrado
  // abaixo do nome (Etapa 4), nunca ocupando muito espaço.
  title_name: string | null;
}

export interface OverlayResponse {
  channel: string;
  viewers: OverlayViewer[];
  total: number;
  updated_at: string;
  // Sprint Kingdom Prestige System, Etapa 5 — só os cargos mais
  // importantes (Guardião + Campeão dos Bosses), nunca os 6, "sem
  // poluir" o overlay. Vazio quando nenhum dos dois tem ocupante ainda.
  hall_of_fame_highlights: KingdomHallOfFameSlot[];
}

// Sprint Boss Experience — leitura pública, mesmo espírito de
// OverlayResponse. "Nome" do Boss não existe em nenhuma coluna do
// schema (docs/reviews/boss-experience-review.md) — tier é o único
// identificador real, nunca um nome inventado.
export interface BossParticipantSummary {
  character_id: string;
  display_name: string;
}

export interface BossRewardSummary {
  character_id: string;
  display_name: string;
  xp_granted: number;
  item_name: string | null;
  item_rarity: string | null;
}

export type BossStatus = "awaiting" | "active" | "defeated" | "escaped";

export interface BossStateSnapshot {
  active: boolean;
  status: BossStatus | null;
  tier: number | null;
  current_hp: number | null;
  max_hp: number | null;
  ends_at: number | null;
  resolved_at: number | null;
  participant_count: number;
  participants: BossParticipantSummary[];
  rewards: BossRewardSummary[] | null;
}

export interface StreamerDashboard {
  channel: StreamerChannel;
  active_viewers: number;
  total_viewers: number;
  overlay_url: string;
  ranking_preview: RankingEntry[];
}

// Sprint World Simulation — contratos HTTP puramente de leitura, mesmo
// espírito de BossStateSnapshot: nenhum campo aqui é inventado, cada um
// mapeia direto para uma leitura real (Engine em memória ou agregado de
// banco) feita em world-state.service.ts.
export interface TimelineEvent {
  id: string;
  text: string;
  timestamp: number;
}

// Sprint Kingdom News (MVP) — mesmo espírito de TimelineEvent (nenhum
// campo inventado, buffer em memória no backend), só com um `icon`
// próprio: a Timeline embute o ícone no texto quando existe, o Jornal
// sempre tem um campo separado (Interface pedida: "horário, ícone,
// texto").
export interface KingdomNewsItem {
  id: string;
  icon: string;
  text: string;
  timestamp: number;
}

export interface WorldPanel {
  server_time: number;
  current_tick: number;
  current_tick_timestamp: number;
  players_online: number;
  bosses_active_now: number;
  last_event: TimelineEvent | null;
}

export interface KingdomState {
  players_active: number;
  bosses_active_now: number;
  bosses_defeated_total: number;
  gold_in_circulation: number;
  // Sprint Expedition System — Exploração deixou de ser um placeholder
  // ("exploration_available: false") assim que expedições reais
  // passaram a existir.
  expeditions_active: number;
}

export interface KingdomStats {
  adventurers_total: number;
  bosses_defeated_total: number;
  items_found_total: number;
}

export interface RegionVisitSummary {
  region_id: string;
  region_name: string;
  visits: number;
}

export type ExpeditionStatus = "preparing" | "exploring" | "combating" | "resting" | "returning" | "completed";

// Sprint Expedition Choice Phase III — Meaningful Consequences. Mesma
// opção binária já existente no cliente (Phase I/II, lib/expeditionChoice.ts),
// agora compartilhada com o backend: ExpeditionSystem usa isto para
// enviesar levemente (3-8 pontos percentuais) a geração de Encounters
// durante "exploring" — nunca uma classe/skill, só uma leve inclinação
// estatística sobre Encounters que já existiam.
export type ExpeditionApproach = "investigate" | "continue";

// Sprint Encounter System — categorias já existentes em
// docs/world-design/random-events.md (consolidadas nas 8 já propostas
// pela própria Sprint), nunca uma taxonomia nova.
export type EncounterCategory =
  | "natureza"
  | "combate"
  | "descoberta"
  | "descanso"
  | "misterio"
  | "comercio"
  | "clima"
  | "ruinas";

export interface EncounterSummary {
  category: EncounterCategory;
  icon: string;
  text: string;
}

export interface ExpeditionCompact {
  region_name: string;
  status: ExpeditionStatus;
  progress_percent: number;
  encounter: EncounterSummary | null;
  // Sprint Expedition Consequences Phase I — mesmo campo já exposto em
  // ExpeditionResponse abaixo, aqui também cobrindo Overlay/Landing
  // Preview (que reaproveitam ExpeditionCompact). Sempre opcional/null:
  // nenhuma expedição antiga quebra, nenhum viewer sem escolha muda de
  // comportamento.
  approach: ExpeditionApproach | null;
}

export interface ExpeditionResponse {
  id: string;
  origin_region_id: string;
  origin_region_name: string;
  destination_region_id: string;
  destination_region_name: string;
  current_region_id: string;
  current_region_name: string;
  status: ExpeditionStatus;
  progress_percent: number;
  encounter: EncounterSummary | null;
  estimated_seconds_remaining: number;
  started_at: string;
  // Sprint Expedition Consequences Phase I — mesma abordagem já
  // persistida no backend (Phase III), agora exposta pro cliente poder
  // reutilizá-la fora do ExpeditionPanel (CreatureReader, BookReader,
  // etc. — nenhum deles tem acesso ao estado local do painel).
  approach: ExpeditionApproach | null;
}

export interface RegionEncounterSummary {
  region_id: string;
  region_name: string;
  count: number;
}

export interface CategoryEncounterSummary {
  category: EncounterCategory;
  icon: string;
  count: number;
}

export interface KingdomEncounterEvent {
  id: string;
  region_name: string;
  encounter: EncounterSummary;
  timestamp: number;
}

export interface EncounterStats {
  recent: KingdomEncounterEvent[];
  most_active_regions: RegionEncounterSummary[];
  most_common_categories: CategoryEncounterSummary[];
}

export interface WorldStateResponse {
  panel: WorldPanel;
  kingdom: KingdomState;
  most_visited_regions: RegionVisitSummary[];
  encounter_stats: EncounterStats;
  stats: KingdomStats;
  timeline: TimelineEvent[];
  idle_flavor: string;
  // Sprint Kingdom News (MVP) — "Jornal do Reino", buffer próprio e
  // separado da Timeline (nunca a mesma lista, nunca os mesmos textos).
  news: KingdomNewsItem[];
  // Sprint Kingdom Events (MVP) — evento ambiental do dia, igual para
  // todo o Reino, nunca afeta gameplay.
  current_event: CurrentWorldEventResponse;
  // Sprint Kingdom Prestige System — só preenchido quando a página Mundo
  // está filtrada por canal (mesmo padrão `?channel=` já usado pelo
  // Ranking). `kingdom`/`stats` acima continuam sendo o agregado GLOBAL
  // de todo o StreamRPG (nome herdado do World Simulation, não deste
  // Reino específico) — `channel_kingdom` é o Reino de um canal só.
  channel_kingdom: ChannelKingdomState | null;
}

// Sprint Founder Identity & Prestige — puramente cosmético (Etapa 1-3).
// Nenhum campo aqui concede XP/Gold/poder.
export type FrameTier = "bronze" | "prata" | "ouro" | "fundador" | "alpha" | "evento";

export interface TitleSummary {
  id: number;
  slug: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface FrameSummary {
  id: number;
  slug: string;
  name: string;
  tier: FrameTier;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface IdentityProfile {
  equipped_title: { id: number; name: string; description: string } | null;
  equipped_frame: { id: number; name: string; tier: FrameTier } | null;
  titles: TitleSummary[];
  frames: FrameSummary[];
  created_at: string;
  first_expedition_at: string | null;
  bosses_defeated: number;
  regions_discovered: number;
}

// Sprint Kingdom Prestige System — identidade coletiva de um canal
// (Reino), nunca do personagem. Diferente de Título/Moldura (Founder
// Identity), um cargo pode trocar de dono — não é um desbloqueio
// permanente. Nenhum campo aqui concede XP/Gold/poder de combate.
export type KingdomRoleSlug =
  | "guardiao"
  | "campeao-bosses"
  | "grande-explorador"
  | "heroi-reino"
  | "membro-antigo"
  | "maior-sequencia";

export interface KingdomRoleDefinition {
  slug: KingdomRoleSlug;
  name: string;
  icon: string;
}

// Catálogo fixo de 6 cargos (Etapa 2). Crescer o catálogo no futuro é só
// adicionar uma linha aqui + um critério de cálculo em
// kingdom-prestige.service.ts, nunca uma migração de schema (mesma
// extensibilidade já obtida para Títulos/Molduras).
export const KINGDOM_ROLE_CATALOG: KingdomRoleDefinition[] = [
  { slug: "guardiao", name: "Guardião do Reino", icon: "👑" },
  { slug: "campeao-bosses", name: "Campeão dos Bosses", icon: "⚔" },
  { slug: "grande-explorador", name: "Grande Explorador", icon: "🗺" },
  { slug: "heroi-reino", name: "Herói do Reino", icon: "⭐" },
  { slug: "membro-antigo", name: "Membro Mais Antigo", icon: "📅" },
  { slug: "maior-sequencia", name: "Maior Sequência", icon: "🔥" },
];

export interface KingdomRoleHolder {
  character_id: string;
  display_name: string;
  avatar_url: string | null;
  held_since: string;
}

export interface KingdomHallOfFameSlot {
  role: KingdomRoleSlug;
  role_name: string;
  icon: string;
  holder: KingdomRoleHolder | null;
}

export interface KingdomPrestigeBreakdown {
  total_xp: number;
  bosses_defeated: number;
  members_count: number;
  total_minutes_watched: number;
  regions_discovered: number;
}

// Fórmula ilustrativa (mesma honestidade de todo número não calibrado do
// projeto): soma ponderada de dados reais, nunca editada manualmente
// (Etapa 1). Pesos podem mudar no futuro sem afetar nenhuma regra de
// jogo — Prestígio nunca alimenta XP/Gold/Combate, só o contrário seria
// verdade (Etapa 8: features futuras consumindo este score).
export interface KingdomPrestige {
  score: number;
  breakdown: KingdomPrestigeBreakdown;
}

export interface KingdomAchievement {
  id: string;
  text: string;
  timestamp: number;
}

export interface ChannelKingdomState {
  channel: string;
  channel_display_name: string;
  prestige: KingdomPrestige;
  hall_of_fame: KingdomHallOfFameSlot[];
  recent_achievements: KingdomAchievement[];
}

// Sprint Kingdom Chronicles (MVP) — o "Livro" permanente de um
// personagem. Ao contrário de TimelineEvent/KingdomNewsItem (buffers em
// memória, perdidos a cada reinício do servidor), cada entrada aqui é
// definitiva — persistida em character_chronicles.
export interface ChronicleEntryResponse {
  id: number;
  icon: string;
  title: string;
  text: string;
  created_at: string;
}

export interface ChronicleResponse {
  entries: ChronicleEntryResponse[];
}

// Sprint Kingdom Events (MVP) — camada puramente ambiental: um evento
// "do dia", igual para todo o Reino, trocado uma vez por dia (nunca
// concede XP/Gold/item, nunca altera gameplay).
export type WorldEventCategory =
  | "clima"
  | "celebracoes"
  | "reino"
  | "militar"
  | "natureza"
  | "cidade"
  | "cultura"
  | "taverna"
  | "misterios";

export interface CurrentWorldEventNpcComment {
  npc_name: string;
  npc_icon: string;
  text: string;
}

export interface CurrentWorldEventResponse {
  name: string;
  icon: string;
  description: string;
  duration_label: string;
  category: WorldEventCategory;
  seconds_remaining: number;
  npc_comment: CurrentWorldEventNpcComment | null;
}
