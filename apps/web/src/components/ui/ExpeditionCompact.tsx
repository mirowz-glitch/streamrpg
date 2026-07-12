import type { ExpeditionCompact as ExpeditionCompactData } from "@streamrpg/shared";
import { STATUS_ICON, STATUS_LABEL } from "../../lib/expedition";
import { pickExpeditionNarrative } from "../../lib/expeditionNarratives";
import { getExpeditionEvolutionLine } from "../../lib/expeditionEvolution";
import { getExpeditionJourneyLine } from "../../lib/expeditionJourney";
import { getRegionIdentityLine } from "../../lib/regionIdentity";
import { getExpeditionDecisionHint } from "../../lib/expeditionDecisionHints";
import { getExpeditionConsequenceLine } from "../../lib/expeditionConsequences";
import { buildExpeditionMomentContext, getExpeditionMoment } from "../../lib/expeditionMoments";
import { EXPEDITION_HIGHLIGHT_PRIORITY, getSingleHighlight } from "../../lib/liveReadiness";
import { feedbackClassName } from "../../lib/uiFeedback";
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
//
// Sprint Combat Feel Phase I — mesmo destaque de combate do
// ExpeditionPanel (Personagem), reaproveitado aqui: Overlay e a vitrine
// da Landing Page (CharacterPreview) usam este mesmo componente, então
// o mesmo CSS já cobre os três lugares sem duplicar nada.
interface ExpeditionCompactProps {
  expedition: ExpeditionCompactData;
  // Sprint Gameplay Phase I (Expedition Specializations) — sempre
  // pré-calculada por quem chama (mesmo padrão de specializationLine em
  // ExpeditionPanel); nenhum call-site real hoje tem os dados do PRÓPRIO
  // jogador logado (Overlay mostra OUTRO jogador, Landing usa dado
  // fabricado) — por isso opcional, e nenhum deles passa valor real
  // ainda. Fica pronta pro dia em que existir uma vitrine da própria
  // expedição usando este componente.
  specializationLine?: string | null;
}

export function ExpeditionCompact({ expedition, specializationLine }: ExpeditionCompactProps) {
  const narrative = pickExpeditionNarrative(expedition.status);
  // Sprint Expedition Evolution Phase I — determinístico, complementar
  // ao "flicker" aleatório de `narrative` acima (mesmo espírito do
  // ExpeditionPanel). Automaticamente também cobre Overlay e
  // CharacterPreview (Landing Page), que reaproveitam este componente.
  const evolutionLine = getExpeditionEvolutionLine({
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    encounterCategory: expedition.encounter?.category,
  });
  // Sprint Expedition Journey Phase II — mesmo eixo contínuo do
  // ExpeditionPanel, aqui também cobrindo Overlay e CharacterPreview.
  const journeyLine = getExpeditionJourneyLine({ progressPercent: expedition.progress_percent });
  // Sprint Regional Expedition Identity Phase I — mesma assinatura fixa
  // por região, aqui usando `region_name` (único campo de região
  // disponível em ExpeditionCompact).
  const regionIdentityLine = getRegionIdentityLine(expedition.region_name);
  // Sprint Expedition Decisions Phase I — mesma função central usada
  // por ExpeditionPanel; automaticamente cobre Overlay e Landing
  // Preview (CharacterPreview), que reaproveitam este componente.
  const decisionHint = getExpeditionDecisionHint({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category,
  });
  // Sprint Expedition Consequences Phase I — aqui usa `expedition.approach`
  // (dado real do backend, Phase III), diferente do ExpeditionPanel que
  // usa o estado local otimista: este componente nunca teve os botões
  // de escolha (Overlay mostra o personagem de OUTRO jogador), então a
  // única fonte possível é a persistida no servidor.
  const consequenceLine = getExpeditionConsequenceLine(expedition.approach);
  // Sprint Live Experience Phase I (Expedition Events) — micro
  // acontecimento pontual, determinístico (nunca narrativa ambiente
  // como `narrative` acima); automaticamente cobre Overlay e Landing
  // Preview (CharacterPreview), que reaproveitam este componente.
  const momentLine = getExpeditionMoment(buildExpeditionMomentContext(expedition));
  const isCombating = expedition.status === "combating";

  // Sprint Live Readiness Phase I (First 5 Minutes) — mesma arbitragem
  // do ExpeditionPanel (lib/liveReadiness.ts), adaptada: ExpeditionCompact
  // nunca teve um destaque próprio pra Approach (não tem badge/borda de
  // acento como o Panel), então quando "approach" vence, o destaque cai
  // no próprio rótulo de Estado — nunca fica sem nenhum elemento
  // chamando atenção.
  const expeditionHighlightKey = getSingleHighlight(EXPEDITION_HIGHLIGHT_PRIORITY, {
    approach: expedition.approach !== null,
    evolution: evolutionLine !== null,
    journey: journeyLine !== null,
    specialization: specializationLine !== null && specializationLine !== undefined,
    regionIdentity: regionIdentityLine !== null,
    consequence: consequenceLine !== null,
  });
  const feedbackCls = feedbackClassName("highlight");
  const narrativeCls = (key: typeof expeditionHighlightKey) => (key === expeditionHighlightKey ? ` ${feedbackCls}` : "");

  return (
    <div
      className={`expedition-compact${isCombating ? " expedition-compact-combat" : ""}`}
      key={expedition.status}
    >
      <span className="expedition-compact-region">📍 {expedition.region_name}</span>
      <span className={`expedition-compact-status${narrativeCls("approach")}`}>
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
      {narrative ? <span className="expedition-compact-narrative">{narrative}</span> : null}
      <span className={`expedition-compact-narrative${narrativeCls("evolution")}`}>{evolutionLine}</span>
      <span className={`expedition-compact-narrative${narrativeCls("journey")}`}>{journeyLine}</span>
      {regionIdentityLine ? (
        <span className={`expedition-compact-narrative${narrativeCls("regionIdentity")}`}>{regionIdentityLine}</span>
      ) : null}
      {decisionHint ? <span className="expedition-compact-narrative">{decisionHint}</span> : null}
      {consequenceLine ? (
        <span className={`expedition-compact-narrative${narrativeCls("consequence")}`}>{consequenceLine}</span>
      ) : null}
      {specializationLine ? (
        <span className={`expedition-compact-narrative${narrativeCls("specialization")}`}>{specializationLine}</span>
      ) : null}
      <span className="expedition-compact-narrative">{momentLine}</span>
      <ProgressBar percent={expedition.progress_percent} variant="expedition-compact" />
    </div>
  );
}
