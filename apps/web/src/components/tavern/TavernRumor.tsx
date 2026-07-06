import { useState } from "react";
import { TAVERN_RUMORS } from "../../lib/tavern";

function randomRumor(): string {
  return TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];
}

// Sprint Tavern Stories (MVP) — "Rumor do Dia": uma única história,
// sorteada uma vez por visita (novo sorteio a cada vez que a Taverna é
// aberta). Nada aqui precisa ser verdade — são rumores.
export function TavernRumor() {
  const [rumor] = useState(randomRumor);

  return (
    <div className="tavern-block">
      <h3>🗣️ Rumor do Dia</h3>
      <p className="tavern-rumor">"{rumor}"</p>
    </div>
  );
}
