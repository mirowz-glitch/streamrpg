/**
 * Sprint 14 — Legendary Items + Legacy System.
 *
 * Filosofia obrigatória: "O melhor item do servidor não é
 * necessariamente o mais forte. É aquele que possui a melhor
 * história." Nenhum campo aqui concede vantagem de combate — só
 * classifica e resume o que `ItemHistory` (history.ts, Sprint 10/11)
 * já registra de verdade.
 *
 * Este módulo NUNCA duplica `ItemHistoryEvent`/`ItemHistory` — só
 * enriquece a leitura deles. `LegacyEvent` é uma projeção classificada
 * de `ItemHistoryEvent` (mesmo dado, mais contexto de exibição);
 * `LegacyType` reaproveita `ItemHistoryEventType` inteiro (nunca um
 * vocabulário paralelo).
 */
import type { ItemHistory, ItemHistoryEvent, ItemHistoryEventType } from "./history.js";

/** Reaproveita o vocabulário de eventos já existente — nunca duplicado. */
export type LegacyType = ItemHistoryEventType;

/** A que "eixo" do Legado um evento pertence (Fase 4/5/6 do brief). */
export type LegacyCategory = "creation" | "ownership" | "combat" | "economy" | "kingdom" | "craft";

/** O quão notável um evento é — usado pra decidir o que aparece num resumo/destaque. */
export type LegacyImportance = "minor" | "notable" | "major" | "legendary";

/**
 * Se um evento é digno de aparecer em superfícies públicas (Activity
 * Feed, futuro Hall da Fama) ou só no histórico privado do próprio
 * item. Museu/Hall da Fama/NPC Historiador são explicitamente FORA de
 * escopo desta Sprint — este campo só marca a intenção, nada ainda lê
 * `visibility === "public"` pra publicar em lugar nenhum.
 */
export type LegacyVisibility = "private" | "public";

export interface LegacyEvent {
  type: LegacyType;
  category: LegacyCategory;
  importance: LegacyImportance;
  visibility: LegacyVisibility;
  characterId: string | null;
  detail: string | null;
  at: string;
}

/**
 * Classificação BASE por tipo de evento — data-driven (mesmo princípio
 * de "não hardcodar" já usado por `DEFAULT_SPHERE_DROP_TABLE`,
 * spheredrop/): a importância/categoria de um evento nunca é decidida
 * num `if` espalhado pelo código, sempre lida desta tabela.
 */
const LEGACY_CLASSIFICATION: Record<LegacyType, { category: LegacyCategory; importance: LegacyImportance; visibility: LegacyVisibility }> = {
  created: { category: "creation", importance: "minor", visibility: "private" },
  owner_changed: { category: "ownership", importance: "notable", visibility: "private" },
  boss_defeated_with: { category: "combat", importance: "notable", visibility: "public" },
  player_killed_with: { category: "combat", importance: "notable", visibility: "public" },
  kingdom_visited: { category: "kingdom", importance: "minor", visibility: "private" },
  war_won: { category: "kingdom", importance: "major", visibility: "public" },
  sphere_applied: { category: "craft", importance: "minor", visibility: "private" },
  sealed: { category: "craft", importance: "major", visibility: "public" },
  upgraded: { category: "craft", importance: "minor", visibility: "private" },
  sold: { category: "economy", importance: "notable", visibility: "private" },
  salvaged: { category: "economy", importance: "minor", visibility: "private" },
  // Sprint 16/17 — Esfera da Incerteza: `uncertainty_used` é discreto
  // (mesmo peso de `sphere_applied` — usar a Esfera não é notável por
  // si só, o resultado é que importa). Os 5 resultados possíveis
  // (Sprint 17, "a Esfera nunca falha") são classificados por
  // severidade: `downgraded` é privado (nada a comemorar); `transformation`
  // é notável mas ainda privado (identidade mudou, mas não é
  // necessariamente uma vitória); `upgraded`/`revealed` já eram
  // públicos (Blacksmith/Sprint 16); `mythic_revealed` é o evento mais
  // raro de todo o Legacy hoje — sempre `legendary` desde a primeira
  // ocorrência (nunca depende de `promote()` pra chegar lá, é raro o
  // bastante pra já nascer no teto).
  uncertainty_used: { category: "craft", importance: "minor", visibility: "private" },
  downgraded: { category: "craft", importance: "minor", visibility: "private" },
  transformation: { category: "craft", importance: "notable", visibility: "private" },
  revealed: { category: "craft", importance: "notable", visibility: "public" },
  // Sprint 18 — Mythic Foundation, Fase 6: confirma que `mythic_revealed`
  // já estava corretamente classificado desde a Sprint 17 (nenhuma
  // mudança necessária aqui). "first_discovery" — a segunda parte da
  // Fase 6 — NÃO é um `ItemHistoryEventType` novo: é um fato GLOBAL
  // (quem foi o primeiro do SERVIDOR), nunca por-item, então não cabe
  // neste tipo (`LegacyType = ItemHistoryEventType`, propositalmente
  // sem vocabulário paralelo). Ver `mythic/mythicLegacy.ts` —
  // `deriveMythicOrigin()` deriva `isFirstDiscovery` comparando este
  // MESMO evento contra `MythicDiscoveryRegistry` (mythic/discovery.ts),
  // nunca duplicando o dado aqui.
  mythic_revealed: { category: "craft", importance: "legendary", visibility: "public" },
};

/**
 * O PRIMEIRO evento de cada tipo (Fase 3: "Primeira venda", "Primeira
 * Esfera", "Primeiro Boss"...) sobe um degrau de importância acima da
 * classificação base — nunca inventa um tipo de evento novo, só marca
 * que aquela ocorrência específica é a estreia. `boss_defeated_with`/
 * `sealed`/`sold` saem de "notable"/"major" pra "legendary"/"major"+1
 * na primeira vez; os demais tipos sobem um degrau também, com teto em
 * "legendary".
 */
const IMPORTANCE_ORDER: LegacyImportance[] = ["minor", "notable", "major", "legendary"];

function promote(importance: LegacyImportance): LegacyImportance {
  const idx = IMPORTANCE_ORDER.indexOf(importance);
  return IMPORTANCE_ORDER[Math.min(idx + 1, IMPORTANCE_ORDER.length - 1)]!;
}

// Sprint 17 — Esfera da Incerteza 2.0, achado real da Fase 11
// (Compatibilidade): itens já persistidos em Sprints anteriores podem
// ter eventos gravados com um tipo que o vocabulário atual não conhece
// mais (ex.: "failed_reveal", removido oficialmente nesta Sprint —
// Fase 2). `history.events` é append-only e NUNCA reescrito
// retroativamente — a leitura precisa continuar funcionando pra
// qualquer string antiga que já exista no banco, mesmo depois do
// vocabulário evoluir. Fallback neutro (nunca lança, nunca inventa
// notabilidade que o dado não sustenta).
const UNKNOWN_EVENT_CLASSIFICATION: { category: LegacyCategory; importance: LegacyImportance; visibility: LegacyVisibility } = {
  category: "craft",
  importance: "minor",
  visibility: "private",
};

/**
 * Deriva a lista completa de `LegacyEvent` a partir do `ItemHistory`
 * real — pura, sem I/O, mesmo princípio de todo derivador do projeto
 * (`deriveHudState`, `deriveWorldPresence`, `deriveItemLegacyFromHistory`
 * acima). A primeira ocorrência de cada `type` ganha `importance`
 * promovida (Fase 3 — "primeira X" é sempre mais notável que a N-ésima).
 */
export function deriveLegacyEvents(history: ItemHistory): LegacyEvent[] {
  const seenTypes = new Set<LegacyType>();
  return history.events.map((evt: ItemHistoryEvent) => {
    const base = LEGACY_CLASSIFICATION[evt.event] ?? UNKNOWN_EVENT_CLASSIFICATION;
    const isFirstOfType = !seenTypes.has(evt.event);
    seenTypes.add(evt.event);
    return {
      type: evt.event,
      category: base.category,
      importance: isFirstOfType ? promote(base.importance) : base.importance,
      visibility: base.visibility,
      characterId: evt.characterId,
      detail: evt.detail,
      at: evt.at,
    };
  });
}

/**
 * Fase 7 — Título automático, SOMENTE infraestrutura, "nenhum título
 * definitivo" (brief explícito). Reivindicações globais ("o PRIMEIRO
 * Dragão do servidor") exigiriam um índice cruzando o histórico de
 * TODOS os itens — fora de escopo desta Sprint (é exatamente o tipo de
 * consulta que o futuro Hall da Fama/Museu do Reino vai precisar).
 * Esta função só cobre o que o histórico do PRÓPRIO item já garante,
 * sem depender de nenhum outro item: hoje, o único caso — um item
 * selado pela Esfera da Maldição é sempre notável, não importa o
 * resto. Devolve `null` em todo outro caso — nunca inventa uma
 * história que o histórico não sustenta.
 */
export function deriveAutomaticTitle(itemName: string, history: ItemHistory): string | null {
  const sealed = history.events.some((evt) => evt.event === "sealed");
  if (sealed) return `${itemName} Selado(a)`;
  return null;
}

/** Fase 8 — o terceiro campo que toda resposta de Item passa a carregar. */
export interface LegacySummary {
  title: string | null;
  /** Uma frase curta e pronta pra exibição — nunca fabricada, sempre derivada do histórico real. */
  headline: string;
  /** Eventos públicos de maior importância, mais recentes primeiro, sem cauda longa. */
  highlights: LegacyEvent[];
}

const MAX_HIGHLIGHTS = 5;

/**
 * Resumo pronto pra UI — combina título (Fase 7) + os eventos mais
 * notáveis (Fase 9: "Mostrar: História. Quantidade de donos. Chefes
 * mortos. Esferas usadas. Idade. Nada além disso."). `headline` nunca
 * inventa números que `ItemLegacy` não sustenta — só formata o que já
 * foi derivado.
 */
export function deriveLegacySummary(itemName: string, history: ItemHistory, events: LegacyEvent[], ageInDays: number): LegacySummary {
  const title = deriveAutomaticTitle(itemName, history);
  const highlights = events
    .filter((e) => e.visibility === "public" && (e.importance === "major" || e.importance === "legendary"))
    .slice()
    .reverse()
    .slice(0, MAX_HIGHLIGHTS);

  const headline =
    ageInDays <= 0
      ? `${itemName} — recém-encontrado(a).`
      : `${itemName} — ${ageInDays} dia${ageInDays === 1 ? "" : "s"} de história, ${history.ownerCount} dono${history.ownerCount === 1 ? "" : "s"}.`;

  return { title, headline, highlights };
}
