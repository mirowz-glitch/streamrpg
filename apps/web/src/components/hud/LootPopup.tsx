import { ITEM_GEN_RARITIES, type CombatAnimation } from "@streamrpg/shared";

interface LootPopupProps {
  active: CombatAnimation[];
}

interface LootDropPayload {
  instanceId: string;
  baseItemId: string;
  rarity: string;
  powerScore: number;
  regionId: string;
}

const LOOT_ANIMATION_TYPES = new Set(["loot-drop-common", "loot-drop-magic", "loot-drop-rare", "loot-drop-unique"]);

// Cor/rótulo de raridade vêm de ITEM_GEN_RARITIES (Item Generator, já
// existente) — nunca um mapa novo/hardcoded.
function rarityDisplay(rarity: string): { label: string; color: string } {
  const found = ITEM_GEN_RARITIES.find((entry) => entry.id === rarity);
  return found ? { label: found.label, color: found.color } : { label: rarity, color: "#9aa0a6" };
}

// Combat Feel & Animation System Phase I — requisito 6/11: o Loot
// Popup não tem mais seu próprio setTimeout (era assim na Sprint
// anterior) — a visibilidade agora é 100% dirigida pelo Animation
// Controller centralizado (useAnimationController, o único timer de
// todo o apps/web). Enquanto existir uma animação "loot-drop-*" ativa,
// o popup aparece; quando o Controller a finaliza (duração do preset
// esgotada), ele some sozinho. Todo o dado exibido (Nome/Raridade/
// Power Score/Origem) vem do PRÓPRIO payload da animação — o mesmo
// dado real que a Presentation Layer colocou no LootDroppedEvent
// original (handlers.ts só copia, nunca inventa).
export function LootPopup({ active }: LootPopupProps) {
  const animation = active.find((entry) => LOOT_ANIMATION_TYPES.has(entry.type));
  if (!animation) return null;

  const loot = animation.payload as unknown as LootDropPayload;
  const rarity = rarityDisplay(loot.rarity);

  return (
    <div className="hud-loot-popup" style={{ borderColor: rarity.color }}>
      <span className="hud-loot-popup-title" style={{ color: rarity.color }}>
        {loot.baseItemId}
      </span>
      <span className="hud-loot-popup-line">{rarity.label}</span>
      <span className="hud-loot-popup-line">Power Score: {loot.powerScore}</span>
      <span className="hud-loot-popup-line">Origem: {loot.regionId}</span>
    </div>
  );
}
