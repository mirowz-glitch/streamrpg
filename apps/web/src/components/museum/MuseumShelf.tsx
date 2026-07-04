import { useMemo, useState } from "react";
import type { MuseumCategory as MuseumCategorySlug, MuseumEntry, MuseumEntryStatus } from "../../lib/museum";
import { MUSEUM_CATEGORIES, MUSEUM_STATUS_LABEL } from "../../lib/museum";
import { filterKnowledge, KnowledgeStatus, searchKnowledge, type KnowledgeEntry } from "../../lib/knowledge";
import { CodexSidebar } from "../codex/CodexSidebar";
import { CodexToolbar } from "../codex/CodexToolbar";
import { CodexCategoryList } from "../codex/CodexCategoryList";
import { CodexFilter } from "../codex/CodexFilter";
import { CodexCard } from "../codex/CodexCard";

const STATUS_OPTIONS: MuseumEntryStatus[] = ["bloqueado", "conhecido", "registrado"];

const KNOWLEDGE_STATUS: Record<MuseumEntryStatus, KnowledgeStatus> = {
  bloqueado: KnowledgeStatus.Locked,
  conhecido: KnowledgeStatus.Discovered,
  registrado: KnowledgeStatus.Read,
};

interface MuseumKnowledgeEntry extends KnowledgeEntry<MuseumCategorySlug> {
  domainStatus: MuseumEntryStatus;
  year: string;
}

interface MuseumShelfProps {
  entries: MuseumEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
}

// Sprint Knowledge System — painel esquerdo, agora sem lógica de busca/
// filtro própria: cada registro vira uma `MuseumKnowledgeEntry` (a forma
// mínima do Knowledge System + `domainStatus`/`year`, as duas dimensões
// de filtro que não existem em nenhum outro catálogo). Museu sempre
// escondeu o título de registros bloqueados da busca — por isso
// `searchText` vira `""` quando `locked`, preservando o comportamento
// original sem precisar de um parâmetro especial.
export function MuseumShelf({ entries, selectedEntryId, onSelectEntry }: MuseumShelfProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MuseumCategorySlug | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [status, setStatus] = useState<MuseumEntryStatus | null>(null);

  const years = useMemo(() => Array.from(new Set(entries.map((entry) => entry.year))), [entries]);

  const filtered = useMemo(() => {
    const knowledgeEntries: MuseumKnowledgeEntry[] = entries.map((entry) => ({
      id: entry.id,
      source: "museu",
      title: entry.title,
      category: entry.category,
      status: KNOWLEDGE_STATUS[entry.status],
      domainStatus: entry.status,
      year: entry.year,
      searchText: entry.locked ? "" : entry.title,
    }));

    const matched = filterKnowledge(searchKnowledge(knowledgeEntries, query), [
      { select: (e) => e.category, value: category },
      { select: (e) => e.domainStatus, value: status },
      { select: (e) => e.year, value: year },
    ]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return entries.filter((entry) => matchedIds.has(entry.id));
  }, [entries, query, category, year, status]);

  return (
    <CodexSidebar
      toolbar={
        <CodexToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar pelo título...">
          <CodexCategoryList categories={MUSEUM_CATEGORIES} selected={category} onSelect={setCategory} allLabel="Todas as alas" />
          <div className="creature-filters">
            <div className="creature-filter-row">
              <CodexFilter
                allLabel="Qualquer status"
                selected={status}
                onSelect={(value) => setStatus(value as MuseumEntryStatus | null)}
                options={STATUS_OPTIONS.map((option) => ({ value: option, label: MUSEUM_STATUS_LABEL[option] }))}
              />
            </div>
            <div className="creature-filter-row">
              <CodexFilter
                allLabel="Qualquer ano"
                selected={year}
                onSelect={setYear}
                options={years.map((y) => ({ value: y, label: y }))}
              />
            </div>
          </div>
        </CodexToolbar>
      }
      isEmpty={filtered.length === 0}
      emptyMessage="Nenhum registro encontrado."
    >
      {filtered.map((entry) => {
        const category2 = MUSEUM_CATEGORIES.find((c) => c.slug === entry.category);
        return (
          <CodexCard
            key={entry.id}
            icon={entry.locked ? "❔" : entry.icon}
            title={entry.locked ? "Registro desconhecido" : entry.title}
            meta={`${category2?.icon ?? "🏛️"} ${category2?.label ?? entry.category} · ${entry.year}`}
            statusLabel={MUSEUM_STATUS_LABEL[entry.status]}
            locked={entry.locked}
            selected={entry.id === selectedEntryId}
            onSelect={() => onSelectEntry(entry.id)}
          />
        );
      })}
    </CodexSidebar>
  );
}
