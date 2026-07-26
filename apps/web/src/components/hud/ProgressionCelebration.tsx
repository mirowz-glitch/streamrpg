import { getBaseItem, ITEM_GEN_RARITIES, type HudState } from "@streamrpg/shared";

interface ProgressionCelebrationProps {
  hudState: HudState;
}

// Player Feedback & Retention — Vertical Slice Phase I — Fase 2/7:
// nome/raridade apareciam crus ("dagger"/"rare") — mesmo achado já
// corrigido em LootPopup/EventFeed/EquipmentPopup, só nunca tinha sido
// aplicado aqui.
function rarityLabel(rarity: string): string {
  return ITEM_GEN_RARITIES.find((entry) => entry.id === rarity)?.label ?? rarity;
}

// Progression & Player Retention Phase I — requisito 6: melhor item e
// recorde de dano batidos nesta tick (HudState.newBestItemEvent/
// newDamageRecordEvent, puramente derivados da Adventure Timeline —
// nunca uma nova consulta ao Inventory/Equipment/Combat Engine). O
// Level Up já tem sua própria celebração via Animation Controller
// (LevelUpBanner); estes dois aparecem/desaparecem junto com o
// HudState recomputado a cada tick, sem timer próprio.
export function ProgressionCelebration({ hudState }: ProgressionCelebrationProps) {
  const { newBestItemEvent, newDamageRecordEvent } = hudState;
  if (!newBestItemEvent && !newDamageRecordEvent) return null;

  return (
    <div className="hud-progression-celebration">
      {newBestItemEvent ? (
        <span className="hud-progression-celebration-item">
          🏆 Novo melhor item: {getBaseItem(newBestItemEvent.baseItemId)?.name ?? newBestItemEvent.baseItemId} (
          {rarityLabel(newBestItemEvent.rarity)}, Power Score {newBestItemEvent.powerScore})
        </span>
      ) : null}
      {newDamageRecordEvent ? (
        <span className="hud-progression-celebration-item">🔥 Novo recorde de dano: {newDamageRecordEvent.damageDealt.toFixed(0)}</span>
      ) : null}
    </div>
  );
}
