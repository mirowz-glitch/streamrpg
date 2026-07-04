import { RegionGallery } from "../ui/RegionGallery";
import { ExpeditionPanel } from "../ui/ExpeditionPanel";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

interface NorthGateBuildingProps {
  enabled: boolean;
}

// Sprint Capital City — reaproveita RegionGallery (World Simulation) e
// ExpeditionPanel (Expedition System); nenhuma região é "trancada" hoje
// (nenhum mecanismo de bloqueio existe ainda — Kingdom Prestige System,
// Etapa 8, deixou isso preparado para o futuro), então todas aparecem
// como desbloqueadas, o que é honesto com o estado real do jogo. Sprint
// NPCs Vivos — Sargento Roth apresenta o prédio.
export function NorthGateBuilding({ enabled }: NorthGateBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🚪 Portão Norte</h2>
      <NpcIntro npc={NPCS.guarda} />
      <p className="hint">A saída da Capital para o mundo — regiões desbloqueadas e sua expedição atual.</p>
      <ExpeditionPanel enabled={enabled} />
      <h3 className="identity-subtitle">Regiões desbloqueadas</h3>
      <RegionGallery />
    </section>
  );
}
