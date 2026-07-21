import type { HudEncounterInfo, HudEncounterState } from "@streamrpg/shared";

interface EncounterPanelProps {
  encounter: HudEncounterInfo;
}

// HUD & Gameplay UI Phase I — requisito 4: quantidade de inimigos/
// derrotados/estado, tudo derivado de HudEncounterInfo (deriveHudState,
// só lê AdventureSession.currentEncounter) — nenhum cálculo aqui, só
// rótulo de exibição pro `state` (que já vem pronto como um dos 3
// valores possíveis).
const STATE_LABEL: Record<HudEncounterState, string> = {
  "sem-encontro": "Explorando",
  "em-combate": "Em combate",
  concluido: "Encontro concluído",
};

export function EncounterPanel({ encounter }: EncounterPanelProps) {
  return (
    <section className="hud-encounter-panel">
      <p className="hud-encounter-state">{STATE_LABEL[encounter.state]}</p>
      {encounter.enemiesTotal > 0 ? (
        <p className="hud-encounter-detail">
          {encounter.enemiesDefeated} / {encounter.enemiesTotal} inimigos derrotados
        </p>
      ) : null}
    </section>
  );
}
