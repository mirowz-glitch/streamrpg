import type { PlayerFacts } from "./playerFacts";
import { buildCollectionInsightContext } from "./collectionInsights";
import { getRecentEvents } from "./personalTimeline";

// Sprint Gameplay Phase I (Expedition Specializations) — camada única e
// central, sem estado, sem persistência, sem backend/migration/tabela/
// scheduler/API/skill tree/classe/stats: "que ESTILO de exploração este
// comportamento recente sugere?". Nunca altera XP/Loot/Gold/Combate/
// Encounter/Tempo — só interpreta sinais reais já existentes e devolve
// NO MÁXIMO uma frase (nunca duas, nunca lista, nunca escolhida pelo
// jogador — sempre derivada).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// regra:
// - Collection Insights (booksRead>=2/6, creaturesViewed>=2/6,
//   regionsDiscovered>=3/8): cada regra abaixo que toca os mesmos
//   contadores usa um patamar ESTRITAMENTE mais alto e SEM combinação
//   (nunca "livros + criatura letal" como Kingdom Reputation, nunca
//   "regiões dominante sobre os outros 3" como Personal Chronicle) —
//   sempre um sinal isolado no próprio topo da escala, nunca reaproveita
//   um combo já usado por outra camada.
// - Legacy (regionsDiscovered===11, booksRead>=6+hasEquippedTitle):
//   nenhuma regra abaixo repete esses combos; Explorador (regiões>=6) e
//   Erudito (livros>=8) são sinais isolados, nunca combinados com
//   hasEquippedTitle/hasFounderTitle.
// - Kingdom Reputation (creaturesViewed>=5+booksRead>=4,
//   totalMinutes>=180+regionsDiscovered>=5): nenhuma regra abaixo
//   reproduz uma combinação de 2 sinais — cada especialização aqui
//   depende de exatamente 1 sinal real, nunca 2 ao mesmo tempo.
// - Personal Chronicle (totalMinutes>=300 isolado, regionsDiscovered
//   dominante sobre livros/criaturas/museu): Veterano exige
//   totalMinutes>=480, estritamente acima do patamar de "jornada longa"
//   já contado por Personal Chronicle. Explorador nunca compara
//   regionsDiscovered contra outros contadores (Personal Chronicle já
//   faz isso) — é só um patamar isolado.
// - ExpeditionApproach (expeditionChoice.ts/expeditionConsequences.ts):
//   já existe o approach da expedição ATUAL (1 valor). Nenhum lugar do
//   projeto guardava um HISTÓRICO de escolhas — Investigador é o
//   primeiro sinal real que precisa disso. Resolvido reaproveitando
//   Personal Timeline (já listado como infraestrutura reutilizável):
//   ExpeditionPanel grava um evento leve `expedition_approach_chosen` a
//   cada escolha (mesmo padrão de recordEvent já usado por
//   CreatureReader/BookReader/MuseumReader), nunca uma tabela ou
//   evento de backend novo — é o mesmo localStorage local de sempre.
// - KnowledgeRewards/PlayerMemory: auditados, não usados aqui —
//   KnowledgeRewards decide QUANTOS candidatos de conhecimento revelar
//   (nada disso existe nesta camada); PlayerMemory é para flags
//   "mostrado uma vez" (Specialization é reavaliada a cada visita, como
//   Legacy/Kingdom Reputation/Personal Chronicle, nunca memory-gated).
// - Dívida técnica: nenhuma encontrada — `buildCollectionInsightContext`
//   (booksRead/creaturesViewed) e `getRecentEvents` (Personal Timeline)
//   já eram os únicos pontos de leitura desses sinais; reaproveitados
//   tal como estão, nenhuma cópia nova.
export type ExpeditionSpecialization = "investigador" | "explorador" | "naturalista" | "erudito" | "veterano";

export interface ExpeditionSpecializationContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  investigateChoices: number;
  continueChoices: number;
}

// PersonalTimeline é uma janela rolante de 20 posições compartilhada por
// TODOS os tipos de evento (mesma limitação já documentada em Personal
// Chronicle) — em uma sessão muito ativa, escolhas de approach antigas
// podem ser descartadas por outros eventos mais recentes. Aceitável
// aqui: Investigador pergunta sobre comportamento RECENTE, nunca
// histórico completo, e a janela é exatamente "recente".
function countRecentApproachChoices(): { investigate: number; continueCount: number } {
  let investigate = 0;
  let continueCount = 0;
  for (const event of getRecentEvents(20)) {
    if (event.kind !== "expedition_approach_chosen") continue;
    if (event.meta?.option === "investigate") investigate++;
    else if (event.meta?.option === "continue") continueCount++;
  }
  return { investigate, continueCount };
}

export function buildExpeditionSpecializationContext(facts: PlayerFacts): ExpeditionSpecializationContext {
  const insightCtx = buildCollectionInsightContext({ regionsDiscovered: facts.regionsDiscovered });
  const { investigate, continueCount } = countRecentApproachChoices();
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    investigateChoices: investigate,
    continueChoices: continueCount,
  };
}

interface SpecializationRule {
  key: ExpeditionSpecialization;
  when: (ctx: ExpeditionSpecializationContext) => boolean;
  line: string;
}

// Ordem = prioridade: a primeira regra que bater decide, nunca duas ao
// mesmo tempo (mesmo padrão de LEGACY_RULES/REPUTATION_RULES/
// CHRONICLE_RULES). Ordem = a mesma sequência de exemplos do próprio
// brief.
const SPECIALIZATION_RULES: SpecializationRule[] = [
  // Investigador — único sinal comportamental real (nunca um contador
  // estático): exige uma amostra mínima (>=3 escolhas recentes) e
  // predominância estrita, nunca um empate.
  {
    key: "investigador",
    when: (ctx) => ctx.investigateChoices >= 3 && ctx.investigateChoices > ctx.continueChoices,
    line: "O grupo parece cada vez mais atento aos detalhes.",
  },
  // Explorador — regiões descobertas, sinal isolado, patamar acima de
  // qualquer tier já usado por Collection Insights/Legacy/Kingdom
  // Reputation/Personal Chronicle.
  {
    key: "explorador",
    when: (ctx) => ctx.facts.regionsDiscovered >= 6,
    line: "O grupo já atravessou boa parte do Reino.",
  },
  // Naturalista — criaturas vistas, sinal isolado, acima do tier máximo
  // de Collection Insights (6).
  {
    key: "naturalista",
    when: (ctx) => ctx.creaturesViewed >= 8,
    line: "Poucas criaturas passam despercebidas.",
  },
  // Erudito — livros lidos, sinal isolado, acima do tier máximo de
  // Collection Insights/Legacy (6).
  {
    key: "erudito",
    when: (ctx) => ctx.booksRead >= 8,
    line: "Conhecimento parece orientar cada jornada.",
  },
  // Veterano — tempo total jogado, sinal isolado, acima do patamar de
  // Personal Chronicle (300).
  {
    key: "veterano",
    when: (ctx) => ctx.facts.totalMinutes >= 480,
    line: "As expedições parecem mais naturais do que antes.",
  },
];

// Pura: mesma entrada, mesma saída, sempre. Nenhum componente decide —
// todos perguntam a esta camada.
export function getExpeditionSpecialization(ctx: ExpeditionSpecializationContext): string | null {
  const rule = SPECIALIZATION_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}
