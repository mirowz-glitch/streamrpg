import { useAdventureSession } from "../hooks/useAdventureSession";
import { useAnimationController } from "../hooks/useAnimationController";
import { AppNav } from "../components/ui/AppNav";
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
// Combat Feel & Animation System Phase I — cada "Avançar" chama
// advanceAdventureWithPresentation() (via useAdventureSession) e
// repassa os eventos/floating numbers do tick pro Animation Controller
// (useAnimationController) — o único lugar que decide COMO isso é
// apresentado (shake/flash/fade/etc). Esta página nunca calcula
// nenhuma animação sozinha, só conecta os dois hooks.
export function AdventurePage() {
  const { hudState, error, advance, restart } = useAdventureSession();
  const { active, playTick, reset } = useAnimationController();
  const isDefeated = hudState.sessionStatus === "derrota";

  function handleAdvance() {
    const outcome = advance(true);
    if (outcome) playTick(outcome.events, outcome.floatingNumbers);
  }

  function handleRestart() {
    restart();
    reset();
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card hud-adventure-page">
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
          <button type="button" onClick={handleAdvance} disabled={isDefeated}>
            Avançar
          </button>
          <button type="button" onClick={handleRestart}>
            Reiniciar
          </button>
        </div>

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
