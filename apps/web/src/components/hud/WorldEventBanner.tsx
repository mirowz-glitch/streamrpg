import type { CombatAnimation } from "@streamrpg/shared";

interface WorldEventBannerProps {
  active: CombatAnimation[];
}

interface WorldEventDiscoveredPayload {
  name: string;
  category: string;
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito 7:
// "banner, aura, animação, feed" — mesmo padrão de LevelUpBanner/
// EliteMiniBossBanner (nenhum setTimeout próprio, visibilidade 100%
// dirigida pelo Animation Controller centralizado). Um ícone por
// categoria (puramente visual, nenhuma regra de jogo lê isso) — mesmo
// princípio de LOOT_ANIMATION_BY_RARITY (animation/handlers.ts),
// escolher a variante certa a partir de um dado real já existente no
// payload, nunca inventar uma categoria nova.
const CATEGORY_ICON: Record<string, string> = {
  treasure: "🎁",
  merchant: "🧳",
  shrine: "✨",
  ambush: "⚔️",
  discovery: "📜",
};

export function WorldEventBanner({ active }: WorldEventBannerProps) {
  const animation = active.find((entry) => entry.type === "world-event-discovered");
  if (!animation) return null;

  const payload = animation.payload as unknown as WorldEventDiscoveredPayload;
  const icon = CATEGORY_ICON[payload.category] ?? "❓";

  return (
    <div className={`hud-world-event-banner hud-world-event-banner-${payload.category}`}>
      <span className="hud-world-event-banner-icon">{icon}</span>
      <span className="hud-world-event-banner-title">{payload.name}</span>
    </div>
  );
}
