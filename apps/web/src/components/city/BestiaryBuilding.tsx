import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { CREATURES } from "../../lib/bestiary";
import { CreatureCatalog } from "../bestiary/CreatureCatalog";
import { CreatureReader } from "../bestiary/CreatureReader";
import { CodexLayout } from "../codex/CodexLayout";

// Sprint Bestiary System — infraestrutura do Bestiário, dentro da
// Cidade, reutilizando a mesma arquitetura da Biblioteca. Catálogo
// estático (`CREATURES`), nenhuma leitura/escrita no backend. Erudito
// Yannick apresenta o lugar; o catálogo de criaturas aparece abaixo.
export function BestiaryBuilding() {
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;

  return (
    <section className="city-building-screen">
      <h2>🔬 Bestiário</h2>
      <NpcIntro npc={NPCS.erudito} />
      <p className="hint">Um registro de tudo que já foi visto — e do pouco que já foi entendido.</p>

      <CodexLayout
        sidebar={
          <CreatureCatalog
            creatures={CREATURES}
            selectedCreatureId={selectedCreatureId}
            onSelectCreature={setSelectedCreatureId}
          />
        }
        reader={<CreatureReader key={selectedCreature?.id ?? "empty"} creature={selectedCreature} />}
      />
    </section>
  );
}
