/**
 * Sprint 15 — Sockets + Gem System (Foundation).
 *
 * Filosofia obrigatória: "Gemas NÃO são equipamentos. Gemas NÃO são
 * Esferas. Gemas NÃO são consumíveis. Elas são componentes permanentes
 * do Item. Entram. Podem sair. Podem ser substituídas. Nunca alteram a
 * identidade do Item." Nenhum campo aqui concede efeito/bônus — só
 * estrutura e persistência (Fase 6: "Nenhum efeito. Nada além disso").
 *
 * Domínio NOVO, deliberadamente separado de `itemization/` — Sockets
 * são uma propriedade ESTRUTURAL do Item (quantos, que cor/forma, se
 * estão ligados), Gemas são objetos com identidade PRÓPRIA (level/xp/
 * history) que só temporariamente ocupam um Socket. Nenhum dos dois é
 * um Item, uma Esfera ou um Afixo — "nenhuma implementação pode criar
 * um segundo modelo de Item" (brief), e este módulo não cria um.
 *
 * RESTRIÇÃO explícita desta Sprint: não tocar `itemization/history.ts`/
 * `itemization/legacy.ts` — `ItemHistoryEventType`/`LEGACY_CLASSIFICATION`
 * são uniões fechadas que a Sprint 14 tornou exaustivas; adicionar um
 * evento de socket/gema ali violaria "Não alterar: ... Legacy" (brief).
 * Por isso Gemas têm seu PRÓPRIO histórico (`GemHistory` abaixo), nunca
 * misturado ao `ItemHistory` do item que as recebe.
 */

// --- Sockets (Fase 2/4/5) ---

/**
 * Cor do Socket — só um rótulo estrutural nesta Sprint (nenhuma Gema
 * de cor específica existe ainda pra comparar/restringir por cor).
 * Vocabulário estilo Path of Exile (referência de design já citada em
 * Sprints anteriores de itemization/), nunca balanceado aqui.
 */
export type SocketColor = "red" | "green" | "blue" | "white" | "prismatic";

/** Forma do Socket — hoje só um rótulo visual/estrutural, sem regra de encaixe. */
export type SocketShape = "round" | "square" | "hex";

/**
 * Estado de UM Socket. `"disabled"` existe como ponto de extensão
 * futuro (ex.: um item corrompido trava um Socket) — nenhum código
 * real produz `"disabled"` ainda.
 */
export type SocketState = "empty" | "filled" | "disabled";

export interface Socket {
  /** Estável DENTRO do item — não é um id global, só único entre os Sockets de UM SocketConfiguration. */
  id: string;
  color: SocketColor;
  shape: SocketShape;
  state: SocketState;
}

/**
 * Um link entre dois Sockets do MESMO item (Fase 5: "preparar links,
 * sem bônus, sem efeitos, apenas persistência" — hoje nenhum código
 * lê `links` pra conceder efeito algum, só grava/lê de volta).
 */
export interface SocketLink {
  socketIds: [string, string];
}

/**
 * Um grupo de Sockets conectados transitivamente por `SocketLink`s —
 * SEMPRE derivado (`deriveSocketGroups`), nunca persistido em paralelo
 * aos links (evitaria "duplicar persistência", diretriz permanente do
 * brief).
 */
export type SocketGroup = string[];

/** O contrato completo de persistência (Fase 3) — uma coluna JSON por item, mesmo padrão de `affixes`/`potential`. */
export interface SocketConfiguration {
  sockets: Socket[];
  links: SocketLink[];
}

/** Nenhum item pode ter mais que isso (Fase 4: "0 1 2 3 4 5 6 sockets"). */
export const MAX_SOCKETS = 6;

// --- Gemas (Fase 6) ---

/**
 * Vocabulário aberto de propósito — nenhuma Gema real existe ainda
 * ("Nenhuma Gema poderosa será criada" — brief). Uma string, não um
 * union fechado, pelo mesmo motivo que `itemization/spheres.ts`
 * manteve `SphereTypeId` fechado só depois que as 5 Esferas reais
 * existiam; aqui ainda não existe nenhuma.
 */
export type GemType = string;

export type GemTier = 1 | 2 | 3 | 4 | 5;

/** Mesma convenção 0-20 de `ItemQuality` (itemization/types.ts) — nunca a mesma INSTÂNCIA de tipo, só o mesmo range de referência. */
export interface GemQuality {
  value: number;
}

export type GemHistoryEventType = "created" | "socketed" | "unsocketed" | "swapped";

export interface GemHistoryEvent {
  event: GemHistoryEventType;
  characterId: string | null;
  detail: string | null;
  at: string;
}

/** Append-only, nunca apagado (Fase 7) — mesmo princípio de `ItemHistory`, mas um objeto TOTALMENTE separado (ver nota de restrição no topo do arquivo). */
export interface GemHistory {
  events: GemHistoryEvent[];
}

/**
 * Uma Gema — identidade PRÓPRIA, sobrevive a ser removida de um item
 * (Fase 6: "id, tier, quality, history, level, experience. Nada além
 * disso" — `level`/`experience` existem como campos persistidos, mas
 * NENHUM código nesta Sprint concede XP ou lê `level` pra calcular
 * efeito algum, ver restrição "NÃO implementar: efeitos, XP, Level").
 */
export interface Gem {
  id: number;
  characterId: string;
  gemType: GemType;
  tier: GemTier;
  quality: GemQuality;
  level: number;
  experience: number;
  history: GemHistory;
  /** `null` = solta na posse do personagem, nunca socketada ou removida de um item. */
  socketedItemId: number | null;
  /** Qual `Socket.id` (dentro do `SocketConfiguration` do item) — `null` sempre que `socketedItemId` também é `null`. */
  socketedSocketId: string | null;
}
