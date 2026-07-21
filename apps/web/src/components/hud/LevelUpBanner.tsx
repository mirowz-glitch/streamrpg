import type { CombatAnimation } from "@streamrpg/shared";

interface LevelUpBannerProps {
  active: CombatAnimation[];
}

interface LevelUpPayload {
  level: number;
  previousLevel: number;
}

// Progression & Player Retention Phase I — requisito 2: mesmo padrão
// de LootPopup/EquipmentPopup — nenhum setTimeout próprio, a
// visibilidade é 100% dirigida pelo Animation Controller centralizado.
// O dado exibido vem só do payload da própria animação "level-up"
// (handlers.ts), copiado do LevelUpEvent real (Presentation Layer).
export function LevelUpBanner({ active }: LevelUpBannerProps) {
  const animation = active.find((entry) => entry.type === "level-up");
  if (!animation) return null;

  const payload = animation.payload as unknown as LevelUpPayload;

  return (
    <div className="hud-level-up-banner">
      <span className="hud-level-up-banner-title">Nível {payload.level} alcançado!</span>
    </div>
  );
}
