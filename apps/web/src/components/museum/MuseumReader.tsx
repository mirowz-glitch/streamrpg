import type { MuseumEntry } from "../../lib/museum";
import { MUSEUM_CATEGORIES } from "../../lib/museum";
import { CodexReader } from "../codex/CodexReader";

interface MuseumReaderProps {
  entry: MuseumEntry | null;
}

// Sprint Codex Framework — painel direito, agora sobre o CodexReader
// genérico. Mesma divergência de Bestiário: título genérico e nenhum
// subtítulo quando bloqueado.
export function MuseumReader({ entry }: MuseumReaderProps) {
  const category = entry ? MUSEUM_CATEGORIES.find((c) => c.slug === entry.category) : undefined;

  return (
    <CodexReader
      isEmpty={!entry}
      emptyMessage="Escolha um registro na estante ao lado."
      locked={entry?.locked ?? false}
      lockedTitle="Registro desconhecido"
      lockedMessage="🔒 Este registro ainda está bloqueado."
      unlockCondition={entry?.unlockCondition ?? ""}
      icon={entry?.icon}
      title={entry?.title ?? ""}
      subtitle={entry ? `Por ${entry.author} · ${entry.year}` : undefined}
      description={entry?.description ?? ""}
      facts={
        entry
          ? [
              { label: "Ala", value: category?.label ?? entry.category },
              { label: "Ano", value: entry.year },
            ]
          : []
      }
      pages={entry?.pages ?? []}
    />
  );
}
