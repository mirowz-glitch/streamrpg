import type { EquippedItem } from "@streamrpg/shared";
import { EquipmentSlots } from "../ui/EquipmentSlots";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { isFlagSet } from "../../lib/onboarding";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
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
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const BLACKSMITH_DECOR: Record<BuildingStage, string> = {
  "stage-1": "⚔️",
  "stage-2": "⚔️🗡️",
  "stage-3": "🥋",
  "stage-4": "🥋 🛡️",
};
import type { PlayerFacts } from "../../lib/playerFacts";

interface BlacksmithBuildingProps {
  equipped: EquippedItem[];
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Kingdom Evolution Phase I — mesmo PlayerFacts já calculado
  // por CityPage; opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Capital City — reaproveita EquipmentSlots (Sprint Identity &
// Progression) tal como já existe no Perfil; nenhum dado novo, nenhuma
// forja real ainda. Sprint NPCs Vivos — Borin apresenta o prédio.
export function BlacksmithBuilding({ equipped, worldPresenceCtx, playerFacts = null }: BlacksmithBuildingProps) {
  // Sprint First 120 Seconds — Passo 7: fala única do Ferreiro depois que
  // o jogador já viu seu primeiro item (mesma flag client-side que
  // FirstItemCard já usa — nenhuma flag nova). Permanente, não some após
  // a primeira visita: é uma linha de contexto do mundo, não um toast.
  const hasSeenFirstItem = isFlagSet("first_item_announced");
  const environmentalLine = getEnvironmentalLine("ferreiro");
  const worldSimulationLine = getWorldSimulationLine("ferreiro");
  const landmarkIdentityLine = getLandmarkIdentityLine("ferreiro");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (carvão ainda fumegando), reage ao mesmo evento
  // "militar" que World Presence já usa pra "A forja trabalha sem
  // descanso hoje." — eixo diferente (objeto, nunca o humor de Borin).
  const cityAmbientLine = getCityAmbientLine("ferreiro", { worldEventCategory: worldPresenceCtx?.eventCategory });
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("ferreiro");
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Ferreiro + World
  // Presence), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("ferreiro", buildWorldCohesionContext(worldPresenceCtx));
  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a bossesDefeated (PlayerFacts), nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("ferreiro", buildKingdomEvolutionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a equipmentTier), preparada pra sprites
  // futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("ferreiro", buildBuildingProgressionContext(playerFacts))
    : null;
  const buildingStage = playerFacts ? getBuildingStage("ferreiro", buildBuildingProgressionContext(playerFacts)) : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // equipmentTier "strong"), preparado pra sprites/efeitos futuros;
  // nenhum texto novo.
  const reactiveClass = playerFacts ? getReactiveClass("ferreiro", buildReactiveWorldContext(playerFacts)) : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = playerFacts
    ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("ferreiro", buildReactiveWorldContext(playerFacts)) }))
    : null;

  return (
    <section className={`city-building-screen city-building-ferreiro${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>🛠️ Ferreiro</h2>
      {buildingStage ? <p className="building-decor">{BLACKSMITH_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.ferreiro} />
      <p className="hint">Seus equipamentos atuais, prontos para a próxima forja.</p>
      {hasSeenFirstItem ? <p className="hint">"...acho que essas luvas serviram para alguma coisa."</p> : null}
      <EquipmentSlots equipped={equipped} />
      <p className="city-building-banner">Forja disponível em breve.</p>

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 6 linhas
          ambientes; movidas pra depois do equipamento (o conteúdo real
          deste prédio). Nenhuma removida, nenhum dado/lógica alterado —
          só reordenado. */}
      <WorldPresenceLine building="ferreiro" ctx={worldPresenceCtx} />
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
