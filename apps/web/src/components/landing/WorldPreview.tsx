import { RegionGallery } from "../ui/RegionGallery";
import { REGIONS } from "../../lib/regions";

const WORLD_HIGHLIGHTS = [
  { icon: "🗺️", label: `${REGIONS.length} Regiões` },
  { icon: "🐉", label: "Bosses" },
  { icon: "🎒", label: "Expedições" },
  { icon: "🧑‍🌾", label: "NPCs" },
  { icon: "👑", label: "Reino" },
  { icon: "🏰", label: "Cidade" },
];

// Sprint Landing Page 2.0 — "Mostrar o Mundo". `REGIONS.length` (não um
// "11" fixo) e `RegionGallery` (Sprint World Simulation) reaproveitados
// tal como já existem — nenhum dado inventado, nenhuma região nova.
export function WorldPreview() {
  return (
    <div>
      <div className="world-highlights">
        {WORLD_HIGHLIGHTS.map((item) => (
          <div key={item.label} className="world-highlight">
            <span className="world-highlight-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <RegionGallery />
    </div>
  );
}
