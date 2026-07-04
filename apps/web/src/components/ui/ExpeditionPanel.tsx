import { memo } from "react";
import { useExpedition } from "../../hooks/useExpedition";
import { formatRemaining, STATUS_ICON, STATUS_LABEL } from "../../lib/expedition";
import { StatsRow } from "./StatsRow";
import { ProgressBar } from "./ProgressBar";

interface ExpeditionPanelProps {
  enabled: boolean;
}

// Sprint Expedition System + Sprint Encounter System (Etapa 7 — seção
// "Aventura Atual"). Mostra estado, último encontro, tempo e região,
// mais destino/progresso/trilha já construídos na Sprint anterior — uma
// única seção, não duplicada, para não repetir "Estado"/"Região" em dois
// painéis diferentes da mesma tela.
//
// Sprint Performance Optimization — memo evita re-renderizar este painel
// (e seu polling próprio via useExpedition) quando o Perfil re-renderiza
// por outro motivo (ex: cooldown do ping).
export const ExpeditionPanel = memo(function ExpeditionPanel({ enabled }: ExpeditionPanelProps) {
  const { expedition } = useExpedition(enabled);

  if (!expedition) return null;

  const arrived = expedition.status === "combating" || expedition.status === "resting" || expedition.status === "returning";

  return (
    <section className="expedition-panel">
      <h2>Aventura Atual</h2>
      <div className="expedition-trail">
        <span className={!arrived ? "expedition-trail-active" : "expedition-trail-visited"}>
          {expedition.origin_region_name}
        </span>
        <span className="expedition-trail-arrow">→</span>
        <span className={arrived ? "expedition-trail-active" : ""}>{expedition.destination_region_name}</span>
      </div>

      <StatsRow
        items={[
          { label: "Região atual", value: expedition.current_region_name },
          { label: "Destino", value: expedition.destination_region_name },
          {
            label: "Estado",
            value: `${STATUS_ICON[expedition.status]} ${STATUS_LABEL[expedition.status]}`,
            highlight: true,
          },
          { label: "Tempo estimado", value: formatRemaining(expedition.estimated_seconds_remaining) },
        ]}
      />

      <ProgressBar percent={expedition.progress_percent} variant="expedition" />
      <div className="expedition-progress-percent">{expedition.progress_percent}% da expedição concluído</div>

      {expedition.encounter ? (
        <p className="expedition-current-event">
          <span className="expedition-encounter-icon">{expedition.encounter.icon}</span> {expedition.encounter.text}
        </p>
      ) : null}
    </section>
  );
});
