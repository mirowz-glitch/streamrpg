import type { CSSProperties } from "react";
import type { CombatAnimation, HudEncounterInfo } from "@streamrpg/shared";

interface EnemyStageProps {
  active: CombatAnimation[];
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/7: opcional
  // de propósito (retrocompatível) — quando presente e `variant !==
  // "normal"`, mostra a aura visual (metadados puros de
  // HudEncounterInfo, ver hud/deriveHudState.ts). Ausente = comporta-se
  // exatamente como antes desta Sprint.
  encounter?: HudEncounterInfo;
}

// Combat Feel & Animation System Phase I — requisito 3: "pequeno
// shake, flash, knockback leve." Boss/Elite (`enemy-boss-hit`/
// `enemy-elite-hit`) e Miss (`enemy-miss`) já têm classe própria
// preparada — hoje é o dia em que passam a ser alcançáveis de verdade
// (ver o `hitType` abaixo, derivado de `encounter.variant`). Nunca lê
// dano/vida — só aplica classe CSS.
export function EnemyStage({ active, encounter }: EnemyStageProps) {
  const variant = encounter?.variant ?? "normal";
  const isCritical = active.some((animation) => animation.type === "enemy-critical-hit");
  const isMiss = active.some((animation) => animation.type === "enemy-miss");
  const isHit = active.some(
    (animation) => animation.type === "enemy-hit" || animation.type === "enemy-critical-hit" || animation.type === "enemy-elite-hit" || animation.type === "enemy-boss-hit",
  );
  const isDead = active.some((animation) => animation.type.startsWith("enemy-death"));

  const classes = ["hud-combatant-stage", "hud-enemy-stage"];
  if (isHit) classes.push(variant === "miniboss" ? "hud-enemy-stage-boss-hit" : variant === "elite" ? "hud-enemy-stage-elite-hit" : "hud-enemy-stage-hit");
  if (isCritical) classes.push("hud-enemy-stage-critical");
  if (isMiss) classes.push("hud-enemy-stage-miss");
  if (isDead) classes.push("hud-enemy-stage-dead");
  if (variant !== "normal") classes.push("hud-enemy-stage-aura");

  const auraStyle = variant !== "normal" && encounter?.auraColor ? ({ "--hud-aura-color": encounter.auraColor } as CSSProperties) : undefined;

  return (
    <div className={classes.join(" ")} style={auraStyle}>
      <span className="hud-combatant-icon">{variant !== "normal" && encounter?.auraIcon ? encounter.auraIcon : "👹"}</span>
      <span className="hud-combatant-label">{variant === "miniboss" ? "Mini-Boss" : variant === "elite" ? "Elite" : "Inimigo"}</span>
    </div>
  );
}
