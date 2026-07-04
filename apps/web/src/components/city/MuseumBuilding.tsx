import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { MUSEUM_ENTRIES } from "../../lib/museum";
import { MuseumShelf } from "../museum/MuseumShelf";
import { MuseumReader } from "../museum/MuseumReader";
import { CodexLayout } from "../codex/CodexLayout";

// Sprint Kingdom Museum — infraestrutura do Museu do Reino, dentro da
// Cidade, reutilizando a mesma arquitetura da Biblioteca/Bestiário.
// Catálogo estático (`MUSEUM_ENTRIES`), nenhuma leitura/escrita no
// backend. Curador Alaric apresenta o lugar; o catálogo de registros
// aparece abaixo.
export function MuseumBuilding() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const selectedEntry = MUSEUM_ENTRIES.find((entry) => entry.id === selectedEntryId) ?? null;

  return (
    <section className="city-building-screen">
      <h2>🖼️ Museu do Reino</h2>
      <NpcIntro npc={NPCS.curador} />
      <p className="hint">Onde a história da comunidade fica registrada — parte dela, ao menos.</p>

      <CodexLayout
        sidebar={
          <MuseumShelf entries={MUSEUM_ENTRIES} selectedEntryId={selectedEntryId} onSelectEntry={setSelectedEntryId} />
        }
        reader={<MuseumReader key={selectedEntry?.id ?? "empty"} entry={selectedEntry} />}
      />
    </section>
  );
}
