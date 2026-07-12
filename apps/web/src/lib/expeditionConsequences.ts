import type { ExpeditionApproach } from "@streamrpg/shared";

// Sprint Expedition Consequences Phase I — camada central, sem
// estado, sem persistência, sem backend novo: "dado o Approach
// escolhido, qual pequena consequência faz sentido mostrar?". Nunca
// executa uma decisão (isso já aconteceu — a decisão em si é
// ExpeditionSystem/lib/expeditionChoice.ts, Phase I-III), só responde
// com uma observação. Nenhum componente decide sozinho: todos
// perguntam a esta camada.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha:
// - ExpeditionSystem/expeditionChoice.ts (Phase III) já persistem
//   `approach` no backend e o usam pra enviesar a geração de
//   Encounters — aqui NUNCA se repete essa lógica; esta camada só lê
//   o `approach` já decidido, nunca recalcula nem re-pondera nada.
// - ExpeditionResponse/ExpeditionCompact (packages/shared) agora
//   expõem `approach` (extensão trivial de um campo, não uma API/
//   tabela nova) — é o que permite este arquivo (e quem o consome)
//   funcionar fora do ExpeditionPanel, que antes era o único lugar com
//   acesso à escolha (estado local, Phase II).
// - DiscoveryChains (lib/discoveryChains.ts) e Creature Ecology
//   (lib/creatureEcology.ts): ambos já resolviam a parte difícil
//   (encontrar conexões/tiers reais) e retornavam só o PRIMEIRO match
//   por prioridade. Nesta Sprint, os dois ganharam uma versão
//   "*Candidates" que expõe a lista ORDENADA completa (mesma
//   prioridade de sempre, nenhum dado novo, nenhuma frase nova) — a
//   função singular de cada um continua retornando exatamente
//   `candidates[0] ?? null`, o mesmo valor de antes desta Sprint
//   (zero regressão).
// - Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
//   `pickWithApproach` (cap 1/2) foi MOVIDA e generalizada pra
//   lib/knowledgeRewards.ts (`pickKnowledge`, cap 1/3), pra não ter
//   duas camadas decidindo "quantos candidatos mostrar" em paralelo.
//   Quem antes chamava `pickWithApproach` daqui (CreatureReader.tsx)
//   agora chama `pickKnowledge` de lá.
// - Region Identity, Collection Insights, Item Identity, Knowledge
//   Links: auditados; nenhum deles tem uma lista de múltiplos matches
//   reais da mesma forma que Discovery Chains/Creature Ecology (Region
//   Identity é 1 texto fixo por região; Collection Insights e Item
//   Identity já são regras de prioridade única sem "segunda opção"
//   plausível sem inventar). Deixados de fora desta Fase,
//   deliberadamente — 5 integrações excelentes, não 50 pequenas.
export function getExpeditionConsequenceLine(approach: ExpeditionApproach | null): string | null {
  if (approach === "investigate") return "Seu grupo parece notar mais detalhes ao redor.";
  if (approach === "continue") return "O grupo mantém um ritmo constante sem muitos desvios.";
  return null;
}
