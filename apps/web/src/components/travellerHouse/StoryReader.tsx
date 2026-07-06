import { getRegionName } from "@streamrpg/shared";
import type { TravellerStory } from "../../lib/travellerStories";
import { STORY_CATEGORIES } from "../../lib/travellerStories";
import { CodexReader } from "../codex/CodexReader";

interface StoryReaderProps {
  story: TravellerStory | null;
}

// Sprint Traveller Stories (MVP) — painel direito, sobre o CodexReader
// genérico. Nenhuma história é bloqueada (locked sempre false — "Nunca
// confirmar se a história é verdadeira" é uma escolha de tom no texto,
// não um estado de progresso) — por isso lockedTitle/lockedMessage nunca
// chegam a ser exibidos, só existem porque a interface do CodexReader
// os exige.
export function StoryReader({ story }: StoryReaderProps) {
  const category = story ? STORY_CATEGORIES.find((c) => c.slug === story.category) : undefined;

  return (
    <CodexReader
      isEmpty={!story}
      emptyMessage="Escolha uma história na estante ao lado."
      locked={false}
      lockedTitle=""
      lockedMessage=""
      unlockCondition=""
      icon="📜"
      title={story?.title ?? ""}
      subtitle={story ? getRegionName(story.regionId) : undefined}
      description=""
      facts={
        story
          ? [
              { label: "Categoria", value: category ? `${category.icon} ${category.label}` : story.category },
              { label: "Região", value: getRegionName(story.regionId) },
            ]
          : []
      }
      pages={story ? [story.text] : []}
    />
  );
}
