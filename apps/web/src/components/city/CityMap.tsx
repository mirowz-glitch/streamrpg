import { memo } from "react";
import { feedbackClassName } from "../../lib/uiFeedback";

export type BuildingKey =
  | "arena"
  | "ferreiro"
  | "mercador"
  | "alquimista"
  | "guilda"
  | "banco"
  | "portao-norte"
  | "biblioteca"
  | "bestiario"
  | "museu"
  | "taverna"
  | "casa-dos-viajantes";

interface BuildingDef {
  key: BuildingKey;
  name: string;
  icon: string;
  description: string;
}

// Sprint Capital City — só navegação (Etapa "Centro da Cidade"), nenhuma
// funcionalidade nova por trás de cada prédio ainda. Crescer o mapa no
// futuro é só adicionar uma linha aqui + um componente próprio, mesma
// extensibilidade já usada para os catálogos de Títulos/Molduras/Cargos.
const BUILDINGS: BuildingDef[] = [
  { key: "arena", name: "Arena", icon: "🏟️", description: "Onde os feitos contra os Bosses são lembrados." },
  { key: "ferreiro", name: "Ferreiro", icon: "🛠️", description: "Seu equipamento, sempre à mostra." },
  { key: "mercador", name: "Mercador", icon: "🛒", description: "O comércio do Reino — em construção." },
  { key: "alquimista", name: "Alquimista", icon: "⚗️", description: "Poções e reagentes — em construção." },
  { key: "guilda", name: "Guilda", icon: "🏛️", description: "O Hall da Fama do Reino." },
  { key: "banco", name: "Banco", icon: "🏦", description: "Seu Gold, guardado com segurança." },
  { key: "portao-norte", name: "Portão Norte", icon: "🚪", description: "A saída para o mundo — regiões e expedições." },
  { key: "biblioteca", name: "Biblioteca", icon: "📚", description: "Um códice para cada história do Reino." },
  { key: "bestiario", name: "Bestiário", icon: "🔬", description: "Um registro de cada criatura já avistada." },
  { key: "museu", name: "Museu do Reino", icon: "🖼️", description: "Onde a história da comunidade fica registrada." },
  { key: "taverna", name: "Taverna", icon: "🍺", description: "Onde o Reino descansa, conversa e inventa histórias." },
  { key: "casa-dos-viajantes", name: "Casa dos Viajantes", icon: "📜", description: "Histórias contadas por gente comum. Ninguém sabe se são verdade." },
];

interface CityMapProps {
  onSelect: (key: BuildingKey) => void;
  // Sprint Live Readiness Phase I (First 5 Minutes) — já decidida por
  // CityPage (lib/liveReadiness.ts, getLiveHighlights: World Event/
  // Expedição ativa/Kingdom Memory distribuídos, nunca mais de 3);
  // CityMap nunca decide sozinho, só aplica a mesma classe de destaque
  // já usada pelo evento do Reino ("highlight").
  highlightedBuildings?: readonly BuildingKey[];
}

// Sprint Performance Optimization — `onSelect` (setState do CityPage) é
// uma referência estável; memo evita recriar os 7 cards do mapa a cada
// re-renderização da Praça Central (ex: o relógio a cada segundo).
export const CityMap = memo(function CityMap({ onSelect, highlightedBuildings = [] }: CityMapProps) {
  const highlightCls = feedbackClassName("highlight");
  return (
    <div className="city-map-grid">
      {BUILDINGS.map((building) => {
        const isHighlighted = highlightedBuildings.includes(building.key);
        return (
          <button
            key={building.key}
            type="button"
            className={`city-building-card${isHighlighted ? ` ${highlightCls}` : ""}`}
            onClick={() => onSelect(building.key)}
          >
            <span className="city-building-icon">{building.icon}</span>
            <strong className="city-building-name">{building.name}</strong>
            <span className="city-building-description">{building.description}</span>
          </button>
        );
      })}
    </div>
  );
});
