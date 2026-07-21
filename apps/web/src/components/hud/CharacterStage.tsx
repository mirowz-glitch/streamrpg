import type { CombatAnimation } from "@streamrpg/shared";

interface CharacterStageProps {
  active: CombatAnimation[];
}

// Combat Feel & Animation System Phase I — requisito 4: "flash
// vermelho, pequeno recuo, redução momentânea de opacidade. Sem
// alterar HP." Este componente nunca lê vida/dano — só aplica uma
// classe CSS por animação ativa (`character-hit`/`character-death`);
// o efeito visual em si (deslocamento/opacidade) é 100% CSS
// (styles.css), nunca calculado aqui.
export function CharacterStage({ active }: CharacterStageProps) {
  const isHit = active.some((animation) => animation.type === "character-hit");
  const isDead = active.some((animation) => animation.type === "character-death");

  return (
    <div className={`hud-combatant-stage hud-character-stage${isHit ? " hud-character-stage-hit" : ""}${isDead ? " hud-character-stage-dead" : ""}`}>
      <span className="hud-combatant-icon">🧍</span>
      <span className="hud-combatant-label">Você</span>
    </div>
  );
}
