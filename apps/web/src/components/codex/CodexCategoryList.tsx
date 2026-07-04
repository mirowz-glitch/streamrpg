import type { CodexCategoryOption } from "../../lib/codex";
import { CodexFilter } from "./CodexFilter";

interface CodexCategoryListProps<TSlug extends string> {
  categories: CodexCategoryOption<TSlug>[];
  selected: TSlug | null;
  onSelect: (slug: TSlug | null) => void;
  allLabel?: string;
}

// Sprint Codex Framework — especialização do CodexFilter para o filtro
// principal de categoria/ala/tipo (ícone + label). Era BookCategory/
// CreatureFilter(metade)/MuseumCategory — mesmo `.book-category-filter`
// de sempre, agora um só componente para os três.
export function CodexCategoryList<TSlug extends string>({
  categories,
  selected,
  onSelect,
  allLabel = "Todas",
}: CodexCategoryListProps<TSlug>) {
  return (
    <div className="book-category-filter">
      <CodexFilter
        allLabel={allLabel}
        selected={selected}
        onSelect={(value) => onSelect(value as TSlug | null)}
        options={categories.map((category) => ({
          value: category.slug,
          label: category.icon ? `${category.icon} ${category.label}` : category.label,
        }))}
      />
    </div>
  );
}
