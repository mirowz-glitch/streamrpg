import { useState } from "react";
import { TAVERN_RUMORS } from "../../lib/tavern";
import { getSimilarRumors } from "../../lib/knowledgeLinks";
import { pickByTime } from "../../lib/dailyRotation";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

// Sprint Living World (Phase I) — antes sorteado por visita
// (Math.random a cada abertura da Taverna); agora determinístico,
// trocando a cada 6 horas (4 vezes por dia) — "Rumores mudam ao longo
// do dia", igual pra todo jogador, sem nenhum estado novo no backend.
function rumorOfTheMoment(): string {
  return pickByTime(TAVERN_RUMORS, SIX_HOURS_MS);
}

// Sprint Tavern Stories (MVP) — "Rumor do Dia": uma única história em
// destaque. Nada aqui precisa ser verdade — são rumores.
export function TavernRumor() {
  const [rumor] = useState(rumorOfTheMoment);
  // Sprint Discovery Graph (Phase I) — "Outros rumores semelhantes":
  // rumores que citam o mesmo NPC/criatura/região que o de hoje.
  const [similar] = useState(() => getSimilarRumors(rumor));

  return (
    <div className="tavern-block">
      <h3>🗣️ Rumor do Dia</h3>
      <p className="tavern-rumor">"{rumor}"</p>
      {similar.length > 0 ? (
        <div className="tavern-similar-rumors">
          <span>Outros rumores semelhantes:</span>
          <ul>
            {similar.map((r) => (
              <li key={r}>"{r}"</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
