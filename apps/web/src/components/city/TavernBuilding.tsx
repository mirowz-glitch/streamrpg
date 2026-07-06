import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { TavernRumor } from "../tavern/TavernRumor";
import { AdventurerTable } from "../tavern/AdventurerTable";
import { WallNotes } from "../tavern/WallNotes";
import { NightSongs } from "../tavern/NightSongs";

// Sprint Tavern Stories (MVP) — a primeira Taverna viva do StreamRPG.
// Puro conteúdo/apresentação: nenhuma mecânica, nenhuma economia, nenhum
// combate — só os quatro blocos pedidos, cada um seu próprio catálogo
// estático (lib/tavern.ts).
export function TavernBuilding() {
  return (
    <section className="city-building-screen">
      <h2>🍺 Taverna</h2>
      <NpcIntro npc={NPCS.taverneira} />
      <p className="hint">Onde o Reino descansa, conversa e inventa histórias.</p>

      <div className="tavern-grid">
        <TavernRumor />
        <AdventurerTable />
        <WallNotes />
        <NightSongs />
      </div>
    </section>
  );
}
