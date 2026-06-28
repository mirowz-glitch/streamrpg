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

export interface ItemCatalogEntry {
  id: number;
  slug: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  min_level: number;
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
}

export interface EquippedItem {
  slot: ItemSlot;
  character_item_id: number;
  name: string;
  rarity: ItemRarity;
}

export interface RankingEntry {
  position: number;
  character_id: string;
  display_name: string;
  level: number;
  xp: number;
  total_minutes: number;
  avatar_url: string | null;
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
}

export interface OverlayResponse {
  channel: string;
  viewers: OverlayViewer[];
  total: number;
  updated_at: string;
}

export interface StreamerDashboard {
  channel: StreamerChannel;
  active_viewers: number;
  total_viewers: number;
  overlay_url: string;
  ranking_preview: RankingEntry[];
}
