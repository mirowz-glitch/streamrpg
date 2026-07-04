import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

// Puramente visual (Etapa "Alquimista": "Tudo visual") — nenhum item
// real, nenhum inventário, só ambientação da bancada do Alquimista.
const ALCHEMY_ITEMS = [
  { icon: "🧪", label: "Poções" },
  { icon: "🧉", label: "Frascos" },
  { icon: "🌿", label: "Ingredientes" },
  { icon: "🍄", label: "Ingredientes" },
  { icon: "⚗️", label: "Frascos" },
  { icon: "🧫", label: "Poções" },
];

// Sprint Capital City — componente próprio, preparado para uma futura
// Sprint de Alquimia/Poções; hoje só apresentação. Sprint NPCs Vivos —
// Zoltar apresenta o prédio + bancada visual.
export function AlchemistBuilding() {
  return (
    <section className="city-building-screen">
      <h2>⚗️ Alquimista</h2>
      <NpcIntro npc={NPCS.alquimista} />
      <div className="alchemist-shelf">
        {ALCHEMY_ITEMS.map((item, i) => (
          <span key={i} className="alchemist-shelf-item" title={item.label}>
            {item.icon}
          </span>
        ))}
      </div>
      <p className="city-building-banner">Ainda estou preparando minhas misturas.</p>
    </section>
  );
}
