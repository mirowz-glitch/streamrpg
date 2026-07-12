import type { CharacterResponse, EquippedItem, IdentityProfile, ItemRarity } from "@streamrpg/shared";
import type { CharacterKingdomRole } from "../hooks/useKingdomRole";
import { isFlagSet } from "./onboarding";
import { FOUNDER_TITLE_SLUGS } from "./identity";

// Sprint Reactive Layer Foundation — única fonte de verdade sobre "o que
// sabemos deste jogador agora", reunindo dados que já existem em hooks
// diferentes (useCharacter/useIdentity/useKingdomRole) num formato
// estável e nomeado. Antes desta Sprint, esse objeto era montado à mão
// dentro de NpcIntro.tsx só para alimentar o Recognition System — sem
// este arquivo, qualquer sistema futuro (Feedback, Timeline) que
// precisasse dos mesmos fatos reconstruiria a mesma lógica de novo.
// Não adiciona nenhum dado novo: só nomeia e centraliza o que já existe.
export type EquipmentTier = "none" | "weak" | "notable" | "strong";

export interface PlayerFacts {
  level: number;
  gold: number;
  totalMinutes: number;
  hasEquippedItem: boolean;
  bossesDefeated: number;
  regionsDiscovered: number;
  hasCompletedFirstExpedition: boolean;
  hasEquippedTitle: boolean;
  hasKingdomRole: boolean;
  isFirstCityVisit: boolean;
  // Sprint Gameplay Presence Phase I — dados reais já existentes
  // (character.equipped[].rarity, identity.titles), nunca calculados no
  // backend, só lidos e classificados aqui, mesmo espírito do resto do
  // arquivo.
  equipmentTier: EquipmentTier;
  hasFounderTitle: boolean;
}

const RARITY_RANK: Record<ItemRarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

function computeEquipmentTier(equipped: EquippedItem[]): EquipmentTier {
  if (equipped.length === 0) return "none";
  const maxRank = Math.max(...equipped.map((item) => RARITY_RANK[item.rarity]));
  if (maxRank <= 0) return "weak";
  if (maxRank <= 2) return "notable";
  return "strong";
}

export function buildPlayerFacts(
  character: CharacterResponse,
  identity: IdentityProfile,
  kingdomRoles: CharacterKingdomRole[],
): PlayerFacts {
  return {
    level: character.level,
    gold: character.gold,
    totalMinutes: character.total_minutes,
    hasEquippedItem: character.equipped.length > 0,
    bossesDefeated: identity.bosses_defeated,
    regionsDiscovered: identity.regions_discovered,
    hasCompletedFirstExpedition: identity.first_expedition_at !== null,
    hasEquippedTitle: identity.equipped_title !== null,
    hasKingdomRole: kingdomRoles.length > 0,
    isFirstCityVisit: !isFlagSet("city_seen"),
    equipmentTier: computeEquipmentTier(character.equipped),
    hasFounderTitle: identity.titles.some((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)),
  };
}
