import type { ExpeditionApproach } from "@streamrpg/shared";

// Sprint Expedition Discovery Phase IV (Knowledge Rewards) — camada
// central, sem estado, sem persistência, sem backend/tabela/sistema
// novo: "quanto conhecimento vale a pena revelar para este contexto?".
// Nunca inventa uma conexão, nunca gera texto — só decide QUANTOS dos
// candidatos REAIS (já ordenados por prioridade por quem chama, via
// KnowledgeLinks/DiscoveryChains/CreatureEcology) são revelados.
// Nenhum componente decide isso sozinho.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// código, procurando `.slice(0,1)`/`.slice(0,2)`/`[0]`/`first`/
// `pickFirst` ou equivalente já duplicados:
// - lib/expeditionConsequences.ts (Expedition Consequences Phase I)
//   já tinha exatamente esta lógica (`pickWithApproach`, cap 1/2) —
//   MOVIDA pra cá e generalizada (cap 1/3, o "até 3 conexões reais"
//   desta Sprint) em vez de duplicada num segundo arquivo. Removida
//   de expeditionConsequences.ts; CreatureReader.tsx (único
//   consumidor) agora importa daqui.
// - lib/discoveryChains.ts: `getBookDiscoveryChain`/`getItemDiscoveryChain`/
//   `getRegionDiscoveryChain`/`getMuseumDiscoveryChain` cada um parava
//   no primeiro match real (`.find(...)` + `return`, ou `events[0]`
//   literal) mesmo quando `getBookRelated`/`getItemRelated`/
//   `getRegionKnowledge`/`getMonumentRelatedEvents` já retornavam MAIS
//   de uma conexão real. Cada um ganhou uma versão "*Candidates" que
//   expõe TODOS os matches reais, na mesma ordem de prioridade de
//   sempre — a função singular de cada um continua `candidates[0] ??
//   null`, o mesmo valor de antes desta Sprint (zero regressão).
// - lib/creatureEcology.ts (Creature Ecology): já tinha o mesmo padrão
//   "*Candidates" desde Expedition Consequences Phase I — reaproveitado
//   tal como está, nenhuma mudança.
// - lib/knowledgeLinks.ts's `getNpcCitedPeople`/`getNpcSubjects`: já
//   retornam a lista REAL completa, sem nenhum corte artificial (nunca
//   usaram `.slice`/`[0]`) — auditados e confirmados: nada a revelar a
//   mais aqui, já mostram tudo que existe. Considerado, não esquecido.
export const CONTINUE_CAP = 1;
export const INVESTIGATE_CAP = 3;

// Pura: mesma entrada, mesma saída, sempre. `approach = null` ou
// "continue" mantêm exatamente 1 (o comportamento de sempre, antes de
// qualquer Sprint de Approach existir); "investigate" revela até 3 —
// nunca mais candidatos do que realmente existem (o `.slice` nunca
// inventa um item além do array real).
export function pickKnowledge<T>(candidates: readonly T[], approach: ExpeditionApproach | null): T[] {
  const cap = approach === "investigate" ? INVESTIGATE_CAP : CONTINUE_CAP;
  return candidates.slice(0, cap);
}
