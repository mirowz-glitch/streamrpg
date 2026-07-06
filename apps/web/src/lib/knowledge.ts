// Sprint Knowledge System — ponto único de verdade para descoberta,
// desbloqueio e progresso de qualquer catálogo do jogo. Hoje consumido
// por Biblioteca, Bestiário e Museu; amanhã por Quadro de Avisos,
// Relíquias, Grimório, Diário, Cartas e Crônicas. Puramente estrutural:
// nenhuma conexão com XP/Gold/Boss/gameplay real ainda — só tipos e
// funções puras sobre listas.

// ---- Status canônico -----------------------------------------------------

// Os 4 estágios que qualquer conteúdo desbloqueável pode assumir.
// Sistemas com só 3 estágios próprios (Biblioteca, Bestiário, Museu)
// mapeiam seu estágio final para READ — MASTERED fica reservado para
// catálogos futuros que tenham um quarto estágio real (ex.: Grimório).
export enum KnowledgeStatus {
  Locked = "LOCKED",
  Discovered = "DISCOVERED",
  Read = "READ",
  Mastered = "MASTERED",
}

const STATUS_ORDER: Record<KnowledgeStatus, number> = {
  [KnowledgeStatus.Locked]: 0,
  [KnowledgeStatus.Discovered]: 1,
  [KnowledgeStatus.Read]: 2,
  [KnowledgeStatus.Mastered]: 3,
};

// ---- Unlock conditions (somente estrutura, sem lógica) --------------------

// Só os tipos aceitos — nenhuma condição é avaliada nesta Sprint.
export type KnowledgeUnlockCondition =
  | { type: "ReachLevel"; level: number }
  | { type: "VisitRegion"; regionId: string }
  | { type: "DefeatBoss"; bossId: string }
  | { type: "OwnItem"; itemId: string }
  | { type: "CompleteQuest"; questId: string }
  | { type: "WatchMinutes"; minutes: number }
  | { type: "Manual"; description: string }
  | { type: "Future"; description: string };

// ---- Entidades compartilhadas ----------------------------------------------

export type KnowledgeSource =
  | "biblioteca"
  | "bestiario"
  | "museu"
  | "quadro-de-avisos"
  | "reliquias"
  | "grimorio"
  | "diario"
  | "cartas"
  | "cronicas"
  | "casa-dos-viajantes";

export interface KnowledgeCategory<TSlug extends string = string> {
  slug: TSlug;
  label: string;
  icon?: string;
}

// Forma mínima que qualquer catálogo precisa fornecer para participar do
// Knowledge System. `searchText` já decide se o item é "encontrável" pela
// busca — quem monta a entry escolhe `""` para itens cuja identidade some
// quando bloqueados (Bestiário/Museu) ou o texto real quando a identidade
// nunca some (Biblioteca), preservando o comportamento de cada sistema
// sem precisar de um parâmetro extra aqui.
export interface KnowledgeEntry<TCategorySlug extends string = string> {
  id: string;
  source: KnowledgeSource;
  title: string;
  category: TCategorySlug;
  status: KnowledgeStatus;
  searchText: string;
  unlockCondition?: KnowledgeUnlockCondition;
}

// ---- Progresso --------------------------------------------------------

export interface KnowledgeProgress {
  totalEntries: number;
  knownEntries: number;
  readEntries: number;
  masteredEntries: number;
  completionPercentage: number;
}

export function calculateProgress(entries: Array<Pick<KnowledgeEntry, "status">>): KnowledgeProgress {
  const totalEntries = entries.length;
  const knownEntries = entries.filter((e) => STATUS_ORDER[e.status] >= STATUS_ORDER[KnowledgeStatus.Discovered]).length;
  const readEntries = entries.filter((e) => STATUS_ORDER[e.status] >= STATUS_ORDER[KnowledgeStatus.Read]).length;
  const masteredEntries = entries.filter((e) => e.status === KnowledgeStatus.Mastered).length;
  const completionPercentage = totalEntries === 0 ? 0 : Math.round((knownEntries / totalEntries) * 100);
  return { totalEntries, knownEntries, readEntries, masteredEntries, completionPercentage };
}

// ---- Utilitários de estado ----------------------------------------------

export function isUnlocked(entry: Pick<KnowledgeEntry, "status">): boolean {
  return entry.status !== KnowledgeStatus.Locked;
}

// Alias semântico de `isUnlocked` — hoje idêntico (todo catálogo atual só
// tem um portão binário bloqueado/desbloqueado), mas mantido como função
// própria para catálogos futuros onde "poder ler o texto" e "poder abrir
// o item" possam divergir (ex.: um baú que abre antes do conteúdo virar
// legível).
export function canRead(entry: Pick<KnowledgeEntry, "status">): boolean {
  return isUnlocked(entry);
}

export function canOpen(entry: Pick<KnowledgeEntry, "status">): boolean {
  return isUnlocked(entry);
}

const STATUS_LABEL: Record<KnowledgeStatus, string> = {
  [KnowledgeStatus.Locked]: "Bloqueado",
  [KnowledgeStatus.Discovered]: "Descoberto",
  [KnowledgeStatus.Read]: "Lido",
  [KnowledgeStatus.Mastered]: "Dominado",
};

// Label canônico genérico — não usado pela Biblioteca/Bestiário/Museu
// hoje (cada um mantém seu próprio texto exato, ex. "✅ Lido" vs
// "📗 Estudado", para não mudar nada visualmente). Existe para catálogos
// futuros que não tenham um texto próprio ainda.
export function getStatusLabel(status: KnowledgeStatus): string {
  return STATUS_LABEL[status];
}

const STATUS_COLOR: Record<KnowledgeStatus, string> = {
  [KnowledgeStatus.Locked]: "#9aa0a6",
  [KnowledgeStatus.Discovered]: "#4a9eff",
  [KnowledgeStatus.Read]: "#34a853",
  [KnowledgeStatus.Mastered]: "#bf94ff",
};

// Mesma ideia de `getStatusLabel`, para cor — não conectado a nenhum CSS
// existente (as cores de hoje vêm todas de classes fixas por sistema).
export function getStatusColor(status: KnowledgeStatus): string {
  return STATUS_COLOR[status];
}

// ---- Busca, filtro, ordenação e agrupamento ------------------------------

export function searchKnowledge<T extends { searchText: string }>(entries: T[], query: string): T[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return entries;
  return entries.filter((entry) => entry.searchText.toLowerCase().includes(normalized));
}

export interface KnowledgeFilter<T> {
  select: (entry: T) => unknown;
  value: unknown;
}

// Filtro multi-dimensão genérico — substitui as cadeias repetidas de
// `matchesOption(a, ...) && matchesOption(b, ...) && ...` que existiam
// antes desta Sprint em cada catálogo. `value: null` sempre significa
// "sem filtro nesta dimensão".
export function filterKnowledge<T>(entries: T[], filters: Array<KnowledgeFilter<T>>): T[] {
  return entries.filter((entry) => filters.every((f) => f.value === null || f.select(entry) === f.value));
}

export type KnowledgeSortDirection = "asc" | "desc";

export function sortKnowledge<T, K extends keyof T>(
  entries: T[],
  field: K,
  direction: KnowledgeSortDirection = "asc",
): T[] {
  const sorted = [...entries].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
  });
  return direction === "asc" ? sorted : sorted.reverse();
}

export function groupKnowledge<T, K extends string>(entries: T[], keyFn: (entry: T) => K): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  for (const entry of entries) {
    const key = keyFn(entry);
    (groups[key] ??= []).push(entry);
  }
  return groups;
}
