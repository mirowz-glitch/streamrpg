import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { TRAVELLER_STORIES } from "../../lib/travellerStories";
import { StoryShelf } from "../travellerHouse/StoryShelf";
import { StoryReader } from "../travellerHouse/StoryReader";
import { CodexLayout } from "../codex/CodexLayout";

// Sprint Traveller Stories (MVP) — infraestrutura da Casa dos
// Viajantes, mesma arquitetura de Biblioteca/Bestiário/Museu/Taverna.
// Catálogo estático (`TRAVELLER_STORIES`), nenhuma leitura/escrita no
// backend. Idris apresenta o lugar; "História Aleatória" é só um atalho
// que seleciona uma entrada aleatória do mesmo catálogo — nenhum estado
// novo além do já usado para a seleção normal.
export function TravellerHouseBuilding() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedStory = TRAVELLER_STORIES.find((story) => story.id === selectedId) ?? null;

  const handleRandomStory = () => {
    const random = TRAVELLER_STORIES[Math.floor(Math.random() * TRAVELLER_STORIES.length)];
    setSelectedId(random.id);
  };

  return (
    <section className="city-building-screen">
      <h2>📜 Casa dos Viajantes</h2>
      <NpcIntro npc={NPCS.viajante} />
      <p className="hint">Histórias contadas por gente comum. Ninguém sabe se são verdade.</p>

      <button type="button" className="traveller-random-btn" onClick={handleRandomStory}>
        🎲 História Aleatória
      </button>

      <CodexLayout
        sidebar={<StoryShelf stories={TRAVELLER_STORIES} selectedId={selectedId} onSelect={setSelectedId} />}
        reader={<StoryReader key={selectedStory?.id ?? "empty"} story={selectedStory} />}
      />
    </section>
  );
}
