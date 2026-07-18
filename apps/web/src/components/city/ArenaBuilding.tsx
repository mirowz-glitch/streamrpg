import type { ChannelKingdomState, IdentityProfile } from "@streamrpg/shared";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { StatsRow } from "../ui/StatsRow";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui. Estágio 1
// é a "arena vazia" do próprio brief — sem nenhum elemento decorativo.
const ARENA_DECOR: Record<BuildingStage, string> = {
  "stage-1": "",
  "stage-2": "🚩",
  "stage-3": "🚩🚩",
  "stage-4": "🚩🚩 🏆",
};
import type { WorldPresenceContext } from "../../lib/worldPresence";
import type { PlayerFacts } from "../../lib/playerFacts";

interface ArenaBuildingProps {
  identity: IdentityProfile | null;
  kingdom: ChannelKingdomState | null;
  // Sprint World Cohesion Phase I (Connected World) — primeira vez que
  // a Arena recebe este contexto (já buscado por CityPage); usado só
  // pela camada central, nunca decidido aqui.
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Kingdom Evolution Phase I — mesmo PlayerFacts já calculado
  // por CityPage; opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Capital City — só leitura. "Maior dano" não tem fonte de dado
// ainda (BossCombatSystem calcula dano por tick mas nunca persiste por
// personagem, só loga) — mostrado honestamente como "em breve", mesma
// convenção do resto da Sprint, em vez de inventar um número. Sprint NPCs
// Vivos — Kade apresenta o prédio.
export function ArenaBuilding({ identity, kingdom, worldPresenceCtx, playerFacts = null }: ArenaBuildingProps) {
  const environmentalLine = getEnvironmentalLine("arena");
  const worldSimulationLine = getWorldSimulationLine("arena");
  const landmarkIdentityLine = getLandmarkIdentityLine("arena");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (areia revirada), sem sinal reativo disponível
  // aqui (Arena nunca recebeu worldPresenceCtx, mesma limitação já
  // documentada em World Presence).
  const cityAmbientLine = getCityAmbientLine("arena");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("arena");
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Arena + NPC Daily
  // Activities/World Presence), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("arena", buildWorldCohesionContext(worldPresenceCtx));
  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a current_event.category/hasFounderTitle (PlayerFacts),
  // nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("arena", buildKingdomEvolutionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a bossesDefeated), preparada pra sprites
  // futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("arena", buildBuildingProgressionContext(playerFacts))
    : null;
  const buildingStage = playerFacts ? getBuildingStage("arena", buildBuildingProgressionContext(playerFacts)) : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // evento "militar"), preparado pra sprites/efeitos futuros; nenhum
  // texto novo.
  const reactiveClass = playerFacts
    ? getReactiveClass("arena", buildReactiveWorldContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = playerFacts
    ? getWorldVisualClass(
        "building",
        buildWorldVisualContext({ buildingReactiveState: getReactiveState("arena", buildReactiveWorldContext(playerFacts, undefined, worldPresenceCtx)) }),
      )
    : null;

  return (
    <section className={`city-building-screen city-building-arena${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>🏟️ Arena</h2>
      {buildingStage && ARENA_DECOR[buildingStage] ? <p className="building-decor">{ARENA_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.mestreArena} />
      <p className="hint">Os feitos de combate contra os Bosses — somente leitura.</p>
      <StatsRow
        items={[
          { label: "Suas vitórias", value: identity?.bosses_defeated ?? 0, highlight: true },
          {
            label: "Bosses derrotados pelo Reino",
            value: kingdom ? kingdom.prestige.breakdown.bosses_defeated : "—",
          },
          { label: "Maior dano", value: "Em breve" },
        ]}
      />

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 6 linhas
          ambientes; movidas pra depois das estatísticas (o conteúdo real
          deste prédio). Nenhuma removida, nenhum dado/lógica alterado —
          só reordenado. */}
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {kingdomEvolutionLine ? <p className="hint">{kingdomEvolutionLine}</p> : null}
    </section>
  );
}
