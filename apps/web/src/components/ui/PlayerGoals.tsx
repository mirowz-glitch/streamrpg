import { useEffect, useState } from "react";
import type { CharacterResponse, IdentityProfile, WorldStateResponse } from "@streamrpg/shared";
import { api } from "../../lib/api";
import { buildPlayerGoalsContext, getPlayerGoals } from "../../lib/playerGoals";
import type { CharacterKingdomRole } from "../../hooks/useKingdomRole";
import { feedbackClassName, resolveFeedback } from "../../lib/uiFeedback";

interface PlayerGoalsProps {
  character: CharacterResponse | null;
  identity: IdentityProfile | null;
  kingdomRoles?: CharacterKingdomRole[];
}

// Sprint Player Motivation Phase I ("Natural Goals") — bloco discreto,
// sem checklist, sem progresso, sem recompensa: só o texto de 1-2
// sugestões, no mesmo estilo visual já usado pelos avisos de onboarding
// (.guide-bubble), reaproveitado aqui em vez de criar uma caixa nova.
// `character`/`identity` chegam por prop (CharacterPage já os busca);
// só o evento atual do Reino (worldState.current_event) é buscado aqui
// — mesmo endpoint que CityPage/WorldPage já usam, só mais um
// consumidor, nenhuma API nova.
export function PlayerGoals({ character, identity, kingdomRoles }: PlayerGoalsProps) {
  const [worldState, setWorldState] = useState<WorldStateResponse | null>(null);

  useEffect(() => {
    void api
      .get<WorldStateResponse>("/api/world/state")
      .then(setWorldState)
      .catch(() => undefined);
  }, []);

  if (!character || !identity) return null;

  const ctx = buildPlayerGoalsContext(character, identity, worldState !== null, kingdomRoles ?? []);
  const goals = getPlayerGoals(ctx);

  // Sprint Reactive UI (World Feedback Phase I) — quando existe alguma
  // meta sugerida, o bloco ganha prioridade visual — nunca um dado
  // novo, só uma tradução visual de um sinal que já existia como texto.
  const feedbackCls = feedbackClassName(resolveFeedback(goals.length > 0, "attention"));

  if (goals.length === 0) return null;

  return (
    <div className={`player-goals${feedbackCls ? ` ${feedbackCls}` : ""}`}>
      {goals.map((goal) => (
        <p key={goal} className="guide-bubble">
          <span className="guide-bubble-icon" aria-hidden="true">
            🧭
          </span>
          {goal}
        </p>
      ))}
    </div>
  );
}
