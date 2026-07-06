import { useMemo, useState } from "react";
import { getRegionName } from "@streamrpg/shared";
import type { StoryCategory, TravellerStory } from "../../lib/travellerStories";
import { STORY_CATEGORIES, regionFilterOptions } from "../../lib/travellerStories";
import { filterKnowledge, KnowledgeStatus, searchKnowledge, type KnowledgeEntry } from "../../lib/knowledge";
import { CodexSidebar } from "../codex/CodexSidebar";
import { CodexToolbar } from "../codex/CodexToolbar";
import { CodexCategoryList } from "../codex/CodexCategoryList";
import { CodexCard } from "../codex/CodexCard";

const CATEGORY_LABEL: Record<StoryCategory, string> = Object.fromEntries(
  STORY_CATEGORIES.map((c) => [c.slug, `${c.icon} ${c.label}`]),
) as Record<StoryCategory, string>;

interface StoryKnowledgeEntry extends KnowledgeEntry<string> {
  regionId: string;
}

interface StoryShelfProps {
  stories: TravellerStory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Sprint Traveller Stories (MVP) — painel esquerdo, mesmo papel de
// BookShelf/CreatureCatalog/MuseumShelf/etc., agora sobre os
// componentes genéricos do Codex Framework + Knowledge System. Filtro
// pedido é por REGIÃO (não por categoria) — a categoria vira o "selo"
// de cada card, no lugar do status de bloqueio que os outros catálogos
// usam (aqui nenhuma história é bloqueada).
export function StoryShelf({ stories, selectedId, onSelect }: StoryShelfProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const entries: StoryKnowledgeEntry[] = stories.map((story) => ({
      id: story.id,
      source: "casa-dos-viajantes",
      title: story.title,
      category: story.regionId,
      regionId: story.regionId,
      status: KnowledgeStatus.Discovered,
      searchText: story.title,
    }));

    const matched = filterKnowledge(searchKnowledge(entries, query), [{ select: (e) => e.regionId, value: region }]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return stories.filter((story) => matchedIds.has(story.id));
  }, [stories, query, region]);

  return (
    <CodexSidebar
      toolbar={
        <CodexToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar pelo título...">
          <CodexCategoryList categories={regionFilterOptions()} selected={region} onSelect={setRegion} allLabel="Todas as regiões" />
        </CodexToolbar>
      }
      isEmpty={filtered.length === 0}
      emptyMessage="Nenhuma história encontrada."
    >
      {filtered.map((story) => (
        <CodexCard
          key={story.id}
          icon="📜"
          title={story.title}
          meta={getRegionName(story.regionId)}
          statusLabel={CATEGORY_LABEL[story.category]}
          locked={false}
          selected={story.id === selectedId}
          onSelect={() => onSelect(story.id)}
        />
      ))}
    </CodexSidebar>
  );
}
