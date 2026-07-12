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
import type { WorldPresenceContext } from "../../lib/worldPresence";

interface ArenaBuildingProps {
  identity: IdentityProfile | null;
  kingdom: ChannelKingdomState | null;
  // Sprint World Cohesion Phase I (Connected World) — primeira vez que
  // a Arena recebe este contexto (já buscado por CityPage); usado só
  // pela camada central, nunca decidido aqui.
  worldPresenceCtx?: WorldPresenceContext;
}

// Sprint Capital City — só leitura. "Maior dano" não tem fonte de dado
// ainda (BossCombatSystem calcula dano por tick mas nunca persiste por
// personagem, só loga) — mostrado honestamente como "em breve", mesma
// convenção do resto da Sprint, em vez de inventar um número. Sprint NPCs
// Vivos — Kade apresenta o prédio.
export function ArenaBuilding({ identity, kingdom, worldPresenceCtx }: ArenaBuildingProps) {
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

  return (
    <section className="city-building-screen">
      <h2>🏟️ Arena</h2>
      <NpcIntro npc={NPCS.mestreArena} />
      <p className="hint">Os feitos de combate contra os Bosses — somente leitura.</p>
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
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
    </section>
  );
}
