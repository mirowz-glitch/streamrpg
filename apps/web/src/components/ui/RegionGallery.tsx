import { memo } from "react";
import { REGIONS } from "../../lib/regions";

// Sprint World Simulation, Parte 4 — identidade das regiões já existentes
// no World Design (docs/world-design/regions.md). Nenhuma região nova,
// nenhum dado alterado; só transcrito para a tela.
//
// Sprint Performance Optimization — sem props, conteúdo 100% estático;
// memo evita recriar esta lista toda vez que a página que a contém
// (Mundo/Portão Norte) re-renderiza por outro motivo (ex: o relógio
// atualizando a cada segundo).
export const RegionGallery = memo(function RegionGallery() {
  return (
    <div className="region-grid">
      {REGIONS.map((region) => (
        <div key={region.id} className="region-card">
          <strong className="region-name">{region.name}</strong>
          <span className="region-difficulty">{region.difficulty}</span>
          <p className="region-description">"{region.description}"</p>
          <span className="region-theme">{region.theme}</span>
        </div>
      ))}
    </div>
  );
});
