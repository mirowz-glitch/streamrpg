import { memo, useState } from "react";
import { HIDDEN_OBJECTS, type HiddenObjectDefinition } from "../../lib/hiddenObjects";

interface HiddenObjectProps {
  object: HiddenObjectDefinition;
}

// Sprint Hidden Objects (MVP) — cada objeto guarda só quantas vezes foi
// clicado (estado local, nunca persistido — sem backend, sem mecânica).
// Clique avança para o próximo texto da lista; ao esgotar, repete o
// último para sempre.
const HiddenObject = memo(function HiddenObject({ object }: HiddenObjectProps) {
  const [clicks, setClicks] = useState(0);
  const revealed = clicks > 0;
  const textIndex = Math.min(clicks - 1, object.texts.length - 1);

  return (
    <button
      type="button"
      className={`hidden-object${revealed ? " hidden-object-revealed" : ""}`}
      onClick={() => setClicks((c) => c + 1)}
      title={object.description}
    >
      <span className="hidden-object-icon">{object.icon}</span>
      <span className="hidden-object-name">{object.name}</span>
      {revealed ? <span className="hidden-object-text">{object.texts[textIndex]}</span> : null}
    </button>
  );
});

// Sprint Hidden Objects (MVP) — ~25 pontos interativos na Praça Central,
// mesmo catálogo estático de Biblioteca/Bestiário/Museu/Taverna. Nenhuma
// recompensa, nenhum XP, nenhum item — só descoberta.
export function HiddenObjects() {
  return (
    <div className="hidden-objects-grid">
      {HIDDEN_OBJECTS.map((object) => (
        <HiddenObject key={object.key} object={object} />
      ))}
    </div>
  );
}
