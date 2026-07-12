import { RegionGallery } from "../ui/RegionGallery";
import { REGIONS } from "../../lib/regions";
import { feedbackClassName } from "../../lib/uiFeedback";

const WORLD_HIGHLIGHTS = [
  { icon: "🗺️", label: `${REGIONS.length} Regiões` },
  { icon: "🐉", label: "Bosses" },
  { icon: "🎒", label: "Expedições" },
  { icon: "🧑‍🌾", label: "NPCs" },
  { icon: "👑", label: "Reino" },
  { icon: "🏰", label: "Cidade" },
];

interface WorldPreviewProps {
  // Sprint Live Readiness Phase I (First 5 Minutes) — já decidido por
  // LoginPage (lib/liveReadiness.ts); WorldPreview nunca decide
  // sozinho, só aplica a classe no primeiro badge (11 Regiões).
  highlighted?: boolean;
}

// Sprint Landing Page 2.0 — "Mostrar o Mundo". `REGIONS.length` (não um
// "11" fixo) e `RegionGallery` (Sprint World Simulation) reaproveitados
// tal como já existem — nenhum dado inventado, nenhuma região nova.
export function WorldPreview({ highlighted = false }: WorldPreviewProps) {
  const highlightCls = feedbackClassName("softGlow");
  return (
    <div>
      <div className="world-highlights">
        {WORLD_HIGHLIGHTS.map((item, index) => (
          <div
            key={item.label}
            className={`world-highlight${highlighted && index === 0 ? ` ${highlightCls}` : ""}`}
          >
            <span className="world-highlight-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <RegionGallery />
    </div>
  );
}
