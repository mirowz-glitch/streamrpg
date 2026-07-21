import type { CombatAnimation } from "@streamrpg/shared";

interface FloatingNumbersProps {
  active: CombatAnimation[];
}

interface FloatingNumberPayload {
  value: number;
  target: "character" | "enemy";
}

// Requisito 8 — um `kind` de exibição por AnimationType de floating
// number; "critical"/"miss" já têm rótulo pronto mesmo nunca sendo
// produzidos nesta fase (Presentation Layer não emite esses
// FloatingNumberEvent.kind ainda — ver animation/types.ts).
const FLOATING_ANIMATION_TYPES = [
  "floating-number-damage",
  "floating-number-critical",
  "floating-number-miss",
  "floating-number-heal",
  "floating-number-lifeLeech",
] as const;

const LABEL: Record<(typeof FLOATING_ANIMATION_TYPES)[number], string> = {
  "floating-number-damage": "Dano",
  "floating-number-critical": "Crítico!",
  "floating-number-miss": "Errou",
  "floating-number-heal": "Cura",
  "floating-number-lifeLeech": "Roubo de Vida",
};

// Combat Feel & Animation System Phase I — requisito 8: "Integrar com
// o componente existente. Adicionar: subida suave, fade, escala."
// Cada número agora é dirigido por uma animação real do Animation
// Controller (duração/id vêm do preset, requisito 10) — a animação CSS
// (`hud-floating-number-rise`, styles.css) usa a MESMA duração do
// preset via `--duration`, nunca um valor hardcoded no componente.
export function FloatingNumbers({ active }: FloatingNumbersProps) {
  const numbers = active.filter((animation): animation is CombatAnimation & { type: (typeof FLOATING_ANIMATION_TYPES)[number] } =>
    (FLOATING_ANIMATION_TYPES as readonly string[]).includes(animation.type),
  );

  if (numbers.length === 0) return null;

  return (
    <div className="hud-floating-numbers">
      {numbers.map((animation) => {
        const payload = animation.payload as unknown as FloatingNumberPayload;
        return (
          <span
            key={animation.id}
            className={`hud-floating-number hud-floating-number-${animation.type} hud-floating-number-${payload.target}`}
            style={{ animationDuration: `${animation.duration}ms` }}
          >
            {LABEL[animation.type]} {payload.value > 0 ? payload.value.toFixed(0) : ""}
          </span>
        );
      })}
    </div>
  );
}
