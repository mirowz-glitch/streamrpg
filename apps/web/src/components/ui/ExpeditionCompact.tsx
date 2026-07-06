import type { ExpeditionCompact as ExpeditionCompactData } from "@streamrpg/shared";
import { STATUS_ICON, STATUS_LABEL } from "../../lib/expedition";
import { pickExpeditionNarrative } from "../../lib/expeditionNarratives";
import { ProgressBar } from "./ProgressBar";

// Sprint Expedition System + Sprint Encounter System, Etapa 8 — versão
// compacta para o Overlay: 📍 região · encontro atual (ícone + texto,
// mais narrativo que só o rótulo de estado) · barra de progresso.
// Mesma linguagem visual do resto do overlay (barra estilo XpBar/
// BossCard), em vez de blocos ASCII literais. Quando ainda não há
// Encounter (raro, só no instante de criação), cai de volta no rótulo
// de estado genérico.
//
// Sprint Living Expeditions (MVP) — uma segunda linha, sorteada de novo
// a cada poll do Overlay (5s), com uma narrativa curta do estado atual —
// o "flicker" ambiente, complementar ao Encounter estável acima.
export function ExpeditionCompact({ expedition }: { expedition: ExpeditionCompactData }) {
  const narrative = pickExpeditionNarrative(expedition.status);

  return (
    <div className="expedition-compact">
      <span className="expedition-compact-region">📍 {expedition.region_name}</span>
      <span className="expedition-compact-status">
        {expedition.encounter ? (
          <>
            {expedition.encounter.icon} {expedition.encounter.text}
          </>
        ) : (
          <>
            {STATUS_ICON[expedition.status]} {STATUS_LABEL[expedition.status]}
          </>
        )}
      </span>
      {narrative ? <span className="expedition-compact-narrative">"{narrative}"</span> : null}
      <ProgressBar percent={expedition.progress_percent} variant="expedition-compact" />
    </div>
  );
}
