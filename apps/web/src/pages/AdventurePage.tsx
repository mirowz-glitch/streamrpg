import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { registerIdleBlockChecker, useAdventureSession } from "../hooks/useAdventureSession";
import { useAnimationController } from "../hooks/useAnimationController";
import { AppNav } from "../components/ui/AppNav";
import { OfflineSummaryBanner } from "../components/ui/OfflineSummaryBanner";
import { SessionSafetyBanner } from "../components/hud/SessionSafetyBanner";
import { LeaveSessionModal } from "../components/hud/LeaveSessionModal";
import { LootRejectedFeedback } from "../components/hud/LootRejectedFeedback";
import { HealthBar } from "../components/hud/HealthBar";
import { RegionPanel } from "../components/hud/RegionPanel";
import { EncounterPanel } from "../components/hud/EncounterPanel";
import { SessionStatusBadge } from "../components/hud/SessionStatusBadge";
import { SessionOverlay } from "../components/hud/SessionOverlay";
import { LootPopup } from "../components/hud/LootPopup";
import { EquipmentPopup } from "../components/hud/EquipmentPopup";
import { FloatingNumbers } from "../components/hud/FloatingNumbers";
import { EventFeed } from "../components/hud/EventFeed";
import { CharacterStage } from "../components/hud/CharacterStage";
import { EnemyStage } from "../components/hud/EnemyStage";
import { XpBar } from "../components/hud/XpBar";
import { LevelUpBanner } from "../components/hud/LevelUpBanner";
import { PermanentStatsBar } from "../components/hud/PermanentStatsBar";
import { ProgressionCelebration } from "../components/hud/ProgressionCelebration";
import { SessionHistoryPanel } from "../components/hud/SessionHistoryPanel";
import { SessionSummaryPanel } from "../components/hud/SessionSummaryPanel";
import { RecoveryBadge } from "../components/hud/RecoveryBadge";
import { ObjectiveCard } from "../components/hud/ObjectiveCard";
import { ObjectiveCompletedBanner } from "../components/hud/ObjectiveCompletedBanner";
import { RegionUnlockBanner } from "../components/hud/RegionUnlockBanner";
import { EliteMiniBossBanner } from "../components/hud/EliteMiniBossBanner";
import { WorldEventBanner } from "../components/hud/WorldEventBanner";
import { WorldEventPanel } from "../components/hud/WorldEventPanel";
import { ExpeditionCard } from "../components/hud/ExpeditionCard";
import { ExpeditionCheckpointBanner } from "../components/hud/ExpeditionCheckpointBanner";
import { FactionCard } from "../components/hud/FactionCard";
import { FactionRankUpBanner } from "../components/hud/FactionRankUpBanner";
import { FinalBossBanner } from "../components/hud/FinalBossBanner";
import { DungeonCompletedBanner } from "../components/hud/DungeonCompletedBanner";

// HUD & Gameplay UI Phase I — Vertical Slice: a primeira tela que
// consome exclusivamente a Presentation Layer/HUD State (motor
// packages/shared já construído nas Sprints anteriores). Roda uma
// Adventure Session inteiramente no navegador (Character Build +
// Inventory + Equipment de demonstração) — nenhuma chamada de API,
// nenhum dado do personagem real do Twitch, nenhuma regra de gameplay
// aqui.
//
// Combat Feel & Animation System Phase I — cada avanço chama
// advanceAdventureWithPresentation() (via useAdventureSession) e
// repassa os eventos/floating numbers do tick pro Animation Controller
// (useAnimationController) — o único lugar que decide COMO isso é
// apresentado (shake/flash/fade/etc). Esta página nunca calcula
// nenhuma animação sozinha, só conecta os dois hooks.
//
// Global Idle System — Architecture Refactor: o IdleDriver e o timer
// que o alimenta não vivem mais aqui — moraram pra `useAdventureSession
// .ts` (escopo de módulo), exatamente pra que trocar de página NUNCA
// interrompa a exploração ("A interface nunca deverá controlar a
// simulação. A interface apenas observa e envia comandos. A simulação
// vive sozinha. Sempre."). Esta página agora só OBSERVA
// (`idleStatus`/`lastTickOutcome`) e ENVIA COMANDOS (`pauseIdle`/
// `resumeIdle`) — nunca mais possui a instância do driver.
// advanceDungeonTick()/Combat/Loot/XP/AutoEquip/Session Persistence —
// tudo intocado; só a localização arquitetural de quem decide "é hora
// de avançar?" mudou.
export function AdventurePage() {
  const {
    hudState,
    error,
    restart,
    ready,
    isDemoSession,
    lootRejectedFeedback,
    idleStatus,
    pauseIdle,
    resumeIdle,
    lastTickOutcome,
    offlineSummary,
    dismissOfflineSummary,
  } = useAdventureSession();
  const { active, playTick, reset } = useAnimationController();
  const isDefeated = hudState.sessionStatus === "derrota";

  // Player Feedback & Retention — Vertical Slice Phase I — Fase 1
  // (Session Safety): "nunca permitir perda silenciosa de progresso".
  // `hasProgress` é a mesma checagem simples usada em toda a Sprint
  // (pelo menos 1 abate real) — não bloqueia a navegação de quem ainda
  // nem começou a jogar, só de quem já tem algo real a perder.
  const hasProgress = hudState.statistics.enemiesKilled > 0;
  const shouldGuardSession = ready && isDemoSession && hasProgress;

  // useBlocker (React Router, data router já em uso neste projeto)
  // intercepta navegação PARA DENTRO do app (cliques nos links de
  // AppNav) — cobre o caso real encontrado no playtest anterior
  // (Personagem/Inventário/Cidade).
  const blocker = useBlocker(({ nextLocation, currentLocation }) => shouldGuardSession && nextLocation.pathname !== currentLocation.pathname);

  // beforeunload cobre o caso complementar que useBlocker não alcança:
  // fechar a aba/janela ou navegar por fora do app (digitar uma nova
  // URL). Só ativo quando há progresso real de demonstração em risco —
  // nunca interfere com quem está numa sessão real (logada) ou ainda
  // não jogou nada.
  useEffect(() => {
    if (!shouldGuardSession) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldGuardSession]);

  // Global Idle System — Architecture Refactor: o tick global chama
  // `advanceDungeonTick()` sozinho (dentro de `runGlobalTick()`, em
  // useAdventureSession.ts) sempre que o IdleDriver global decide que é
  // hora — mesmo com esta página desmontada. `lastTickOutcome` é a
  // única coisa que esta página ainda precisa saber sobre cada tick:
  // repassar os eventos/floating numbers pro Animation Controller local
  // (a apresentação, ao contrário da simulação, é mesmo por-tela — não
  // faz sentido animar um combate na tela de Inventário). `playTick` não
  // é estável (recriada a cada render de useAnimationController), então
  // vive num ref "mais recente" pra este efeito poder depender só de
  // `lastTickOutcome` sem re-disparar em todo re-render.
  const playTickRef = useRef(playTick);
  playTickRef.current = playTick;
  // RC-1 Fase 3 — Integração: `lastTickOutcome` sobrevive à desmontagem
  // desta página (mora no singleton de módulo, mesmo motivo do
  // comentário acima) — sem este guard, remontar (voltar de
  // Personagem/Inventário/Cidade pra Aventura) reproduzia o ÚLTIMO tick
  // já visto antes de sair, disparando de novo banners de Level
  // Up/Chefe Derrotado/Dungeon Concluída fora de contexto. Só o
  // primeiro disparo deste efeito por montagem é descartado — qualquer
  // tick novo que aconteça DEPOIS, com a página já montada, continua
  // tocando normalmente (mesma identidade de objeto nova a cada tick,
  // ver runGlobalTick()).
  const hasSkippedCarriedOverOutcomeRef = useRef(false);
  useEffect(() => {
    if (!hasSkippedCarriedOverOutcomeRef.current) {
      hasSkippedCarriedOverOutcomeRef.current = true;
      return;
    }
    if (lastTickOutcome) playTickRef.current(lastTickOutcome.events, lastTickOutcome.floatingNumbers);
  }, [lastTickOutcome]);

  // `isBlocked` (ex.: Level Up, 2.3s, ainda na tela) precisa do valor
  // MAIS RECENTE de `active`, mas só deve ser registrado uma vez (não a
  // cada render, já que `active` muda a cada ~50ms) — mesmo padrão de
  // ref "mais recente" usado acima.
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    registerIdleBlockChecker(() => activeRef.current.length > 0);
    return () => registerIdleBlockChecker(null);
  }, []);

  function handlePauseToggle() {
    if (idleStatus === "paused") resumeIdle();
    else pauseIdle();
  }

  function handleRestart() {
    restart();
    reset();
  }

  // Vertical Slice — Persistent Player Experience Phase I — Fase 5:
  // a Aventura passou a carregar/gravar o personagem real
  // (useAdventureSession.ts busca GET /api/character e sincroniza cada
  // tick de volta) — o subtítulo de "prévia" da Sprint anterior deixou
  // de ser verdade e foi removido; um breve estado de carregamento
  // evita mostrar nível/itens errados no instante entre montar a
  // página e a resposta de /api/character chegar.
  if (!ready) {
    return (
      <main className="page">
        <AppNav />
        <div className="card hud-adventure-page">
          <div className="hud-header">
            <h1>Aventura</h1>
          </div>
          <p className="hud-adventure-subtitle">Carregando seu personagem...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <OfflineSummaryBanner summary={offlineSummary} onDismiss={dismissOfflineSummary} />
      {blocker.state === "blocked" ? <LeaveSessionModal onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} /> : null}
      <div className="card hud-adventure-page">
        {isDemoSession ? <SessionSafetyBanner /> : null}
        <div className="hud-header">
          <h1>Aventura</h1>
          <SessionStatusBadge status={hudState.sessionStatus} />
        </div>

        <PermanentStatsBar hudState={hudState} />
        <ObjectiveCard objective={hudState.currentObjective} />
        <WorldEventPanel worldEvent={hudState.recentWorldEvent} />
        <ExpeditionCard expedition={hudState.expedition} />
        <FactionCard faction={hudState.faction} />

        <HealthBar currentLife={hudState.currentLife} maximumLife={hudState.maximumLife} />
        <RecoveryBadge recovery={hudState.recentRecovery} />
        <XpBar xpProgress={hudState.xpProgress} />

        <div className="hud-combat-stage-row">
          <CharacterStage active={active} />
          <EnemyStage active={active} encounter={hudState.encounter} />
        </div>

        <div className="hud-panels-row">
          <RegionPanel region={hudState.region} />
          <EncounterPanel encounter={hudState.encounter} />
        </div>

        <SessionOverlay statistics={hudState.statistics} />
        <SessionHistoryPanel history={hudState.sessionHistory} />

        <LootRejectedFeedback entries={lootRejectedFeedback} />

        <div className="hud-popups-row">
          <LootPopup active={active} />
          <EquipmentPopup active={active} />
          <LevelUpBanner active={active} />
          <ObjectiveCompletedBanner active={active} />
          <RegionUnlockBanner active={active} />
          <EliteMiniBossBanner active={active} />
          <WorldEventBanner active={active} />
          <ExpeditionCheckpointBanner active={active} />
          <FactionRankUpBanner active={active} />
          <FinalBossBanner active={active} />
          <DungeonCompletedBanner active={active} />
        </div>

        <ProgressionCelebration hudState={hudState} />

        <FloatingNumbers active={active} />

        <div className="hud-controls">
          {!isDefeated ? (
            <button type="button" onClick={handlePauseToggle}>
              {idleStatus === "paused" ? "Continuar" : "Pausar"}
            </button>
          ) : null}
          <button type="button" onClick={handleRestart}>
            Reiniciar
          </button>
        </div>

        {/* Global Idle System — Architecture Refactor: substitui o
            antigo botão "Avançar" — a exploração acontece sozinha no
            IdleDriver global (useAdventureSession.ts), esta linha só
            comunica o estado atual, nunca exige uma ação do jogador pra
            continuar. */}
        <p className="hint hud-idle-status">
          {isDefeated
            ? "Aventura interrompida — reinicie para continuar."
            : idleStatus === "paused"
              ? "⏸ Pausado — clique em Continuar pra retomar a exploração."
              : "▶ Explorando automaticamente..."}
        </p>

        {error ? <p className="error">{error}</p> : null}
        {isDefeated ? (
          <p className="hud-defeat-message">Seu personagem foi derrotado. Reinicie para tentar de novo.</p>
        ) : null}
        {hudState.sessionSummary ? <SessionSummaryPanel summary={hudState.sessionSummary} /> : null}

        <h2 className="hud-feed-title">Linha do tempo</h2>
        <EventFeed events={hudState.recentEvents} />
      </div>
    </main>
  );
}
