export interface Profile {
  id: string;
  twitch_id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  profile_id: string;
  display_name: string;
  level: number;
  xp: number;
  total_minutes: number;
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
  total_minutes: number;
  avatar_url: string | null;
  created_at: string;
}

export interface PingResponse {
  xp_gained: number;
  new_xp: number;
  level: number;
  leveled_up: boolean;
  xp_to_next: number;
  percent: number;
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
}

export interface OverlayResponse {
  viewers: OverlayViewer[];
  total: number;
}