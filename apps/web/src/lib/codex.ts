// Sprint Codex Framework — camada compartilhada por Biblioteca,
// Bestiário e Museu (e qualquer catálogo "estilo códice" futuro).
// Puramente utilitário/genérico: nenhum dos três catálogos
// (`lib/library.ts`/`lib/bestiary.ts`/`lib/museum.ts`) foi alterado.
//
// Sprint Knowledge System — busca/filtro/ordenação (`matchesSearch`/
// `matchesOption`/`sortByField`) saíram daqui: viraram `searchKnowledge`/
// `filterKnowledge`/`sortKnowledge` em `lib/knowledge.ts`, o novo ponto
// único de verdade para descoberta/desbloqueio/progresso de catálogos.
// Este arquivo continua só com o que é puramente de apresentação
// (categorias/fatos como *shape*, sem noção de status/busca).

export interface CodexCategoryOption<TSlug extends string = string> {
  slug: TSlug;
  label: string;
  icon?: string;
}

export interface CodexFact {
  label: string;
  value: string;
}

export function findCategory<TSlug extends string>(
  categories: CodexCategoryOption<TSlug>[],
  slug: TSlug,
): CodexCategoryOption<TSlug> | undefined {
  return categories.find((c) => c.slug === slug);
}

// Etapa "Interfaces compartilhadas" — todo catálogo (Biblioteca,
// Bestiário, Museu) já converge para esta forma mínima antes de virar
// props do CodexReader/CodexCard: um ícone, um título, uma linha de
// meta-informação (autor, tipo, categoria+ano) e uma lista de fatos
// rápidos para o Reader.
export interface CodexEntrySummary {
  id: string;
  icon: string;
  title: string;
  meta: string;
  statusLabel: string;
  locked: boolean;
}
