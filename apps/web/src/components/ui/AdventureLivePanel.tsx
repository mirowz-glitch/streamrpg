import { memo, useEffect, useRef, useState } from "react";
import { useAdventureSession } from "../../hooks/useAdventureSession";
import {
  adventureLiveStatusLabel,
  deriveAdventureLiveStatus,
  formatNextTickCountdown,
  formatRelativeTime,
  isAdventureLiveStatusActive,
} from "../../lib/adventureLiveState";
import { buildAdventureDiaryEntries } from "../../lib/adventureDiary";
import { buildJourneySummary } from "../../lib/adventureJourney";

const COUNTDOWN_POLL_MS = 750;

// Fase 3 ("tempo até o próximo avanço") + Fase 8 (Performance) — este
// texto precisa de seu PRÓPRIO polling local pra realmente "contar
// regressivamente" (sem ele, `msUntilNextTick` só mudaria uma vez por
// tick real, ~2.5s, e pularia direto de volta ao máximo — nunca
// pareceria vivo). Isolado como componente-folha PRÓPRIO, com sua
// PRÓPRIA assinatura em `useAdventureSession()`, de propósito: assim
// só este texto pequeno re-renderiza a cada 750ms — o resto do painel
// (jornada, diário) nunca é afetado por este polling. Living World
// Phase II — Fase 8 confirma explicitamente: este isolamento continua
// intocado nesta Sprint.
function NextTickCountdown() {
  const { idleStatus, msUntilNextTick } = useAdventureSession();
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (idleStatus !== "running") return;
    const id = window.setInterval(() => forceTick((n) => n + 1), COUNTDOWN_POLL_MS);
    return () => window.clearInterval(id);
  }, [idleStatus]);

  const countdown = formatNextTickCountdown(msUntilNextTick);
  if (!countdown) return null;
  return <span className="adventure-live-countdown">Próximo avanço em {countdown}</span>;
}

// Kinds cujo tick, ao chegar, merece um realce mais forte (dourado) —
// mesma lista de prioridade "alta" do diário (adventureDiary.ts), só
// restrita aos marcos de Chefe/Mini-Boss (Fase 7: "boss iniciado, boss
// derrotado" são exemplos literais do brief).
const BOSS_TIER_KINDS: ReadonlySet<string> = new Set(["FinalBossEncounter", "FinalBossDefeated", "MiniBossEncounter", "MiniBossDefeated"]);

// Living World Phase II — Fase 1 (Auditoria) concluiu que as linhas
// "⚔️ Último combate: N dano causado", "🚩 checkpoint X/Y (Z%)" e "🎁
// Último item encontrado" liam como planilha, não como aventura — a
// mesma informação agora é contada em prosa pelo bloco "Jornada Atual"
// (adventureJourney.ts). Removidas daqui; só o status (badge) e a
// contagem regressiva (utilitária, não narrativa) continuam como
// texto-dado — o resto virou história.
export const AdventureLivePanel = memo(function AdventureLivePanel() {
  const { ready, hudState, idleStatus, pauseIdle, resumeIdle, lastTickOutcome } = useAdventureSession();

  const status = deriveAdventureLiveStatus(ready, hudState, idleStatus);
  const isActive = isAdventureLiveStatusActive(status);

  // Fase 7 (Micro Feedback) — "novo evento chegando", "loot recém
  // encontrado", "boss iniciado/derrotado". Dois níveis de realce, sem
  // animação grande: um pulso roxo padrão (loot/level up/checkpoint) e
  // um pulso dourado mais forte só pra eventos de Chefe/Mini-Boss.
  const previousOutcomeRef = useRef(lastTickOutcome);
  const [flashKind, setFlashKind] = useState<"normal" | "boss" | null>(null);
  useEffect(() => {
    const isNewOutcome = lastTickOutcome !== null && lastTickOutcome !== previousOutcomeRef.current;
    previousOutcomeRef.current = lastTickOutcome;
    if (!isNewOutcome) return;

    const events = lastTickOutcome!.events;
    const isBossTier = events.some((event) => BOSS_TIER_KINDS.has(event.kind));
    const isMeaningful =
      isBossTier ||
      events.some(
        (event) =>
          event.kind === "LootDropped" ||
          event.kind === "LevelUp" ||
          event.kind === "ExpeditionCheckpointReached" ||
          event.kind === "ItemEquipped",
      );
    if (!isMeaningful) return;

    setFlashKind(isBossTier ? "boss" : "normal");
    const id = window.setTimeout(() => setFlashKind(null), isBossTier ? 1800 : 1200);
    return () => window.clearTimeout(id);
  }, [lastTickOutcome]);

  // Fase 7 — "mudança de estado": um realce mais sutil e breve quando o
  // status principal muda (ex.: Explorando -> Combatendo), separado do
  // realce de evento acima (cores diferentes, nunca sobrepostas).
  const previousStatusRef = useRef(status);
  const [statusChanged, setStatusChanged] = useState(false);
  useEffect(() => {
    if (previousStatusRef.current === status) return;
    previousStatusRef.current = status;
    setStatusChanged(true);
    const id = window.setTimeout(() => setStatusChanged(false), 900);
    return () => window.clearTimeout(id);
  }, [status]);

  const journeyLines = buildJourneySummary(hudState);
  const diaryEntries = buildAdventureDiaryEntries(hudState.recentEvents);
  const mostRecentEventTimestamp = hudState.recentEvents.at(-1)?.timestamp ?? null;
  const journeyRelativeTime = mostRecentEventTimestamp !== null ? formatRelativeTime(mostRecentEventTimestamp, Date.now()) : null;

  const panelClassName = [
    "adventure-live-panel",
    isActive ? "adventure-live-panel-active" : "",
    flashKind === "normal" ? "adventure-live-panel-flash" : "",
    flashKind === "boss" ? "adventure-live-panel-flash-boss" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={panelClassName}>
      <div className="adventure-live-header">
        <h2>Em Aventura</h2>
        {isActive ? <span className="adventure-live-dot" aria-hidden="true" /> : null}
      </div>

      <p className={`adventure-live-status${statusChanged ? " adventure-live-status-changed" : ""}`}>
        {adventureLiveStatusLabel(status)}
      </p>

      {ready ? (
        <>
          <div className="adventure-live-journey">
            <h3>
              Jornada Atual
              {journeyRelativeTime ? <span className="adventure-live-relative-time"> · {journeyRelativeTime}</span> : null}
            </h3>
            {journeyLines.map((line, index) => (
              <p key={index} className="adventure-live-journey-line">
                {line}
              </p>
            ))}
            {isActive ? <NextTickCountdown /> : null}
          </div>

          <div className="adventure-live-diary">
            <h3>Diário de bordo</h3>
            {diaryEntries.length > 0 ? (
              <ul className="adventure-live-diary-list">
                {diaryEntries.map((entry, index) => (
                  <li key={index} className={`adventure-live-diary-item adventure-live-diary-item-${entry.priority}`}>
                    {entry.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="adventure-live-diary-empty">A jornada ainda está no começo.</p>
            )}
          </div>

          {status !== "derrotado" ? (
            <button type="button" className="adventure-live-toggle" onClick={idleStatus === "paused" ? resumeIdle : pauseIdle}>
              {idleStatus === "paused" ? "Continuar" : "Pausar"}
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
});
