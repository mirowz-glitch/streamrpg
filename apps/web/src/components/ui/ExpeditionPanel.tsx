import { memo, useEffect, useRef, useState } from "react";
import type { ExpeditionResponse } from "@streamrpg/shared";
import { useExpedition } from "../../hooks/useExpedition";
import { formatRemaining, STATUS_ICON, STATUS_LABEL } from "../../lib/expedition";
import { pickExpeditionNarrative } from "../../lib/expeditionNarratives";
import { getExpeditionEvolutionLine } from "../../lib/expeditionEvolution";
import { getExpeditionJourneyLine } from "../../lib/expeditionJourney";
import { getRegionIdentityLine } from "../../lib/regionIdentity";
import { getExpeditionDecisionHint } from "../../lib/expeditionDecisionHints";
import {
  getExpeditionApproachAccentClass,
  getExpeditionApproachIcon,
  getExpeditionApproachLabel,
  getExpeditionChoiceOutcomeIcon,
  getExpeditionChoiceOutcomeLine,
  isExpeditionChoiceAvailable,
  type ExpeditionChoiceOption,
} from "../../lib/expeditionChoice";
import { getExpeditionConsequenceLine } from "../../lib/expeditionConsequences";
import { buildExpeditionMomentContext, getExpeditionMoment } from "../../lib/expeditionMoments";
import { recordEvent } from "../../lib/personalTimeline";
import { EXPEDITION_HIGHLIGHT_PRIORITY, getSingleHighlight } from "../../lib/liveReadiness";
import { feedbackClassName } from "../../lib/uiFeedback";
import { StatsRow } from "./StatsRow";
import { ProgressBar } from "./ProgressBar";
import { GuideBubble } from "../onboarding/GuideBubble";

interface ExpeditionPanelProps {
  enabled: boolean;
  // Sprint Gameplay Phase I (Expedition Specializations) — já calculada
  // pela página (CharacterPage/CityPage, que já têm PlayerFacts prontos
  // pros outros hints); ExpeditionPanel nunca decide, só exibe.
  specializationLine?: string | null;
}

// Sprint Gameplay Feel 02 (poucos segundos de fechamento, antes da
// próxima expedição roubar a atenção da tela).
const CLOSURE_DURATION_MS = 5000;

// Sprint Expedition System + Sprint Encounter System (Etapa 7 — seção
// "Aventura Atual"). Mostra estado, último encontro, tempo e região,
// mais destino/progresso/trilha já construídos na Sprint anterior — uma
// única seção, não duplicada, para não repetir "Estado"/"Região" em dois
// painéis diferentes da mesma tela.
//
// Sprint Performance Optimization — memo evita re-renderizar este painel
// (e seu polling próprio via useExpedition) quando o Perfil re-renderiza
// por outro motivo (ex: cooldown do ping).
//
// Sprint Gameplay Feel 02 (Expedições precisam ter um começo, meio e
// fim) — auditoria: ExpeditionSystem.advance() (backend) nunca deixa o
// status "completed" ser observável por /api/expedition/current — ao
// concluir, ele já cria a expedição seguinte no mesmo tick (mesma
// função, síncrono), então o próximo poll já chega com um `id` novo e
// status "preparing". A única forma de perceber isso no cliente é
// comparar o `id` entre um poll e o seguinte: quando muda, a expedição
// anterior (guardada aqui, no mesmo dado que a API já mandava) acabou
// de terminar. Nenhum campo novo, nenhum backend novo — só um watermark
// local (mesma técnica já usada em InventoryPage/FirstItemCard/
// FirstLevelBanner) guardando o ÚLTIMO objeto em vez de um id/número.
export const ExpeditionPanel = memo(function ExpeditionPanel({ enabled, specializationLine }: ExpeditionPanelProps) {
  const { expedition, chooseApproach } = useExpedition(enabled);

  const lastExpeditionRef = useRef<ExpeditionResponse | null>(null);
  const [justCompleted, setJustCompleted] = useState<ExpeditionResponse | null>(null);

  // Sprint Expedition Choice Phase II — Persistent Identity: a escolha
  // do jogador agora é a IDENTIDADE da expedição inteira, não mais de
  // um Encounter específico (Fase I resetava por status+encontro; aqui
  // só reseta quando uma expedição NOVA começa — mesmo `expedition.id`
  // que o watermark de `justCompleted` abaixo já usa pra detectar
  // isso). Sem backend, sem estado global (Technical Requirements):
  // puramente local a esta instância de ExpeditionPanel — comparação
  // feita durante o render (padrão oficial do React, "Adjusting state
  // when a prop changes"), evitando um useEffect extra só pra resetar.
  // Hooks precisam ficar ANTES do `if (!expedition) return null;`
  // abaixo, por isso a chave usa optional chaining com fallback vazio.
  const expeditionId = expedition?.id ?? "";
  const [lastExpeditionIdForChoice, setLastExpeditionIdForChoice] = useState(expeditionId);
  const [chosenOption, setChosenOption] = useState<ExpeditionChoiceOption | null>(null);
  if (lastExpeditionIdForChoice !== expeditionId) {
    setLastExpeditionIdForChoice(expeditionId);
    setChosenOption(null);
  }

  useEffect(() => {
    if (!expedition) return;
    const previous = lastExpeditionRef.current;
    if (previous && previous.id !== expedition.id) {
      setJustCompleted(previous);
    }
    lastExpeditionRef.current = expedition;
  }, [expedition]);

  useEffect(() => {
    if (!justCompleted) return;
    const timer = window.setTimeout(() => setJustCompleted(null), CLOSURE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [justCompleted]);

  if (!expedition) return null;

  const arrived = expedition.status === "combating" || expedition.status === "resting" || expedition.status === "returning";
  const isCombating = expedition.status === "combating";
  // Sprint Living Expeditions (MVP) — sorteada de novo a cada render
  // (cada poll do useExpedition já existente), de propósito: é o
  // "flicker" ambiente da narrativa, complementar ao Encounter estável
  // abaixo, não um segundo Encounter.
  const narrative = pickExpeditionNarrative(expedition.status);
  // Sprint Expedition Evolution Phase I — determinístico (mesmo status+
  // progresso+encontro sempre produz a mesma frase), ao contrário do
  // "flicker" aleatório de `narrative` acima. Complementa, nunca
  // substitui Encounter/Narrative.
  const evolutionLine = getExpeditionEvolutionLine({
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    encounterCategory: expedition.encounter?.category,
  });
  // Sprint Expedition Journey Phase II — eixo ortogonal ao status:
  // quão longe estamos da jornada INTEIRA (progress_percent é um arco
  // contínuo de 0 a 100 cobrindo preparing→...→returning, nunca
  // reiniciado por status). Complementa evolutionLine, nunca substitui.
  const journeyLine = getExpeditionJourneyLine({ progressPercent: expedition.progress_percent });
  // Sprint Regional Expedition Identity Phase I — assinatura fixa da
  // região atual (current_region_name, já real e existente), eixo
  // ortogonal a status/progresso — nunca repete a descrição oficial
  // da região (lib/regions.ts, já mostrada em RegionGallery).
  const regionIdentityLine = getRegionIdentityLine(expedition.current_region_name);
  // Sprint Expedition Decisions Phase I — mesmo status+categoria já
  // usados por evolutionLine acima, só reformulados como uma escolha
  // hipotética em vez de uma descrição do momento. Nunca altera
  // gameplay/resultado/drop/XP — só um gatilho mental.
  const decisionHint = getExpeditionDecisionHint({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category,
  });
  // Sprint Gameplay First Phase I — primeira decisão real da
  // Expedição: Exploring + Descoberta é o único momento acionável
  // nesta Fase I (lib/expeditionChoice.ts). Mesmo gate real já usado
  // por decisionHint acima, nunca um critério novo.
  const choiceAvailable = isExpeditionChoiceAvailable({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category,
  });
  // Sprint Expedition Consequences Phase I — mesma identidade local já
  // usada pelo badge acima (chosenOption); persiste a expedição
  // inteira, igual ao badge, nunca reseta por status/encontro.
  const consequenceLine = getExpeditionConsequenceLine(chosenOption);

  // Sprint Live Experience Phase I (Expedition Events) — micro
  // acontecimento pontual, determinístico por status/progresso/
  // categoria/approach (nunca narrativa ambiente, nunca estágio da
  // jornada) — nenhum dado novo, mesmos campos já lidos por Evolution/
  // Journey/Consequences acima.
  const momentLine = getExpeditionMoment(buildExpeditionMomentContext(expedition));

  // Sprint Live Readiness Phase I (First 5 Minutes) — 6 linhas de
  // história soltas, visualmente idênticas, nenhuma mais importante que
  // a outra; agora a camada central decide qual delas vence
  // (lib/liveReadiness.ts). "approach" primeiro de propósito: quando o
  // jogador já escolheu, o badge "Estado" e a borda de acento
  // (`.expedition-approach-*`, já aplicados acima) JÁ SÃO o destaque
  // daquela expedição — vencer aqui significa não aplicar nenhum brilho
  // adicional sobre a mesma expedição, evitando dois estados visuais
  // conflitantes no mesmo bloco.
  const expeditionHighlightKey = getSingleHighlight(EXPEDITION_HIGHLIGHT_PRIORITY, {
    approach: chosenOption !== null,
    evolution: evolutionLine !== null,
    journey: journeyLine !== null,
    specialization: specializationLine !== null && specializationLine !== undefined,
    regionIdentity: regionIdentityLine !== null,
    consequence: consequenceLine !== null,
  });
  const expeditionFeedbackCls = feedbackClassName("highlight");
  const narrativeCls = (key: typeof expeditionHighlightKey) =>
    key === expeditionHighlightKey && key !== "approach" ? ` ${expeditionFeedbackCls}` : "";

  return (
    <section className={`expedition-panel${isCombating ? " expedition-panel-combat" : ""}`}>
      <h2>Aventura Atual</h2>
      <GuideBubble
        flag="expedition_seen"
        message="Seu personagem nunca para: sempre está indo a algum lugar, ou voltando de lá — inclusive combatendo, às vezes."
      />

      {justCompleted ? (
        <p className="expedition-current-event">
          <span className="expedition-encounter-icon">🏁</span> Voltou de {justCompleted.destination_region_name}.
          {justCompleted.encounter ? ` ${justCompleted.encounter.icon} ${justCompleted.encounter.text}` : ""}
        </p>
      ) : null}

      {/* Sprint Combat Feel Phase I — key={expedition.status} força um
          remount deste bloco a cada troca de estado (mesma técnica já
          usada em LibraryBuilding/BookReader), o que sozinho já dispara
          a animação city-arrive (World Immersion Phase I) de novo —
          nenhuma lógica nova, só a transição deixando de ser seca. */}
      <div
        className={`expedition-state-block${chosenOption ? ` ${getExpeditionApproachAccentClass(chosenOption)}` : ""}`}
        key={expedition.status}
      >
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
              // Sprint Expedition Choice Phase II — Persistent Identity:
              // "Explorando • Investigando" enquanto a identidade da
              // expedição estiver ativa (persiste até a expedição
              // acabar, independente do status atual).
              value: chosenOption ? (
                <>
                  {STATUS_ICON[expedition.status]} {STATUS_LABEL[expedition.status]}
                  {" • "}
                  <span className={getExpeditionApproachAccentClass(chosenOption)}>
                    {getExpeditionApproachIcon(chosenOption)} {getExpeditionApproachLabel(chosenOption)}
                  </span>
                </>
              ) : (
                `${STATUS_ICON[expedition.status]} ${STATUS_LABEL[expedition.status]}`
              ),
              highlight: true,
            },
            { label: "Tempo estimado", value: formatRemaining(expedition.estimated_seconds_remaining) },
          ]}
        />

        <ProgressBar percent={expedition.progress_percent} variant="expedition" />
        <div className="expedition-progress-percent">{expedition.progress_percent}% da expedição concluído</div>

        {/* Sprint Combat Feel Phase I — Encounter + narrativa da
            expedição agrupados num único bloco de história (antes eram
            dois <p> soltos, sem nenhum elo visual entre eles). */}
        {expedition.encounter || narrative || evolutionLine ? (
          <div className="expedition-story">
            {expedition.encounter ? (
              <p className="expedition-current-event">
                <span className="expedition-encounter-icon">{expedition.encounter.icon}</span> {expedition.encounter.text}
              </p>
            ) : null}
            {narrative ? <p className="expedition-narrative">{narrative}</p> : null}
            {evolutionLine ? <p className={`expedition-narrative${narrativeCls("evolution")}`}>{evolutionLine}</p> : null}
            <p className={`expedition-narrative${narrativeCls("journey")}`}>{journeyLine}</p>
            {regionIdentityLine ? (
              <p className={`expedition-narrative${narrativeCls("regionIdentity")}`}>{regionIdentityLine}</p>
            ) : null}
            {choiceAvailable ? (
              chosenOption ? (
                <p className="expedition-narrative expedition-choice-outcome">
                  {getExpeditionChoiceOutcomeIcon(chosenOption)} {getExpeditionChoiceOutcomeLine(chosenOption)}
                </p>
              ) : (
                <>
                  {decisionHint ? <p className="expedition-narrative">{decisionHint}</p> : null}
                  <div className="expedition-choice-options">
                    <button
                      type="button"
                      className="expedition-choice-button"
                      onClick={() => {
                        setChosenOption("investigate");
                        chooseApproach("investigate");
                        // Sprint Gameplay Phase I (Expedition Specializations) —
                        // único ponto de escrita real do histórico de escolhas,
                        // mesmo padrão de recordEvent já usado por
                        // CreatureReader/BookReader/MuseumReader.
                        recordEvent("expedition_approach_chosen", { option: "investigate" });
                      }}
                    >
                      🔍 Investigar
                    </button>
                    <button
                      type="button"
                      className="expedition-choice-button"
                      onClick={() => {
                        setChosenOption("continue");
                        chooseApproach("continue");
                        recordEvent("expedition_approach_chosen", { option: "continue" });
                      }}
                    >
                      🏃 Seguir em frente
                    </button>
                  </div>
                </>
              )
            ) : decisionHint ? (
              <p className="expedition-narrative">{decisionHint}</p>
            ) : null}
            {consequenceLine ? <p className={`expedition-narrative${narrativeCls("consequence")}`}>{consequenceLine}</p> : null}
            {specializationLine ? (
              <p className={`expedition-narrative${narrativeCls("specialization")}`}>{specializationLine}</p>
            ) : null}
            <p className="hint">{momentLine}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
});
