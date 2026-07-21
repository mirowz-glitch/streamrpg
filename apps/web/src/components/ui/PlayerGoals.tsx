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
  // Sprint Character Page — Adventure Goals Phase I — nunca mais uma
  // lista: exatamente UM objetivo por vez (limit=1). GOAL_RULES agora
  // termina numa regra catch-all (playerGoals.ts), então `goal` nunca
  // fica undefined com character/identity presentes.
  const [goal] = getPlayerGoals(ctx, 1);

  // Sprint Reactive UI (World Feedback Phase I) — mesmo destaque visual
  // de sempre; agora sempre há um objetivo, então a condição é sempre
  // verdadeira, mas a função continua sendo a mesma fonte de verdade.
  const feedbackCls = feedbackClassName(resolveFeedback(true, "attention"));

  if (!goal) return null;

  return (
    <div className={`player-goals${feedbackCls ? ` ${feedbackCls}` : ""}`}>
      <div className="goal-card">
        <span className="goal-card-title">🧭 Objetivo Atual</span>
        <p className="goal-card-text">{goal}</p>
        {/*
          Progress tracking intentionally omitted.

          This area is reserved for future quest progression once backend
          support exists. Sprint Adventure Goals Phase II removed the old
          "Recompensa desconhecida" line (felt like an unfinished
          placeholder) and left this empty, low-key block in its place —
          no fake percentage, no bar, nothing animated, just reserved
          space for whenever real progress data exists.
        */}
        <div className="goal-progress-placeholder" />
      </div>
    </div>
  );
}
