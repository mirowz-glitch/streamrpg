import { CREATURES, getRegionName, type CreatureDefinition } from "./bestiary";
import { ANCIENT_RUIN_SITES } from "./ruins";
import { BOOKS } from "./library";
import { getItemRelated } from "./knowledgeLinks";
import type { MuseumEntry } from "./museum";

// Sprint Knowledge Threads Phase I — camada central, sem estado, sem
// persistência, sem backend/tabela/sistema novo: "qual é o próximo
// assunto natural que alguém curioso provavelmente seguiria?". Cada
// função devolve uma lista ORDENADA de candidatos reais (mesmo padrão
// de discoveryChains.ts/knowledgeRewards.ts) — quem chama decide
// quantos mostrar via `pickKnowledge(candidates, approach)`, nunca
// esta camada. Nenhuma frase aqui narra uma ação (isso é World
// Simulation) nem é atribuída a um NPC (isso é Living Conversations) —
// é sempre "para onde ir a seguir", nunca "o que aconteceu".
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha:
// - DiscoveryChains (lib/discoveryChains.ts) JÁ resolve "livro → cita
//   uma criatura", "criatura → cita um item", "item → cita uma
//   profissão", "região → tem histórias/ruínas", "museu → cita um
//   evento" — todas conexões ENTRE CATÁLOGOS DIFERENTES, priorizadas
//   por getBookRelated/getCreatureMentions/getItemRelated/
//   getRegionKnowledge/getMonumentRelatedEvents. Os dois primeiros
//   exemplos do brief ("Livro sobre Lobos → Lobo Alfa", "Lobo Alfa →
//   Presa do Alfa") JÁ SÃO exatamente isso — nenhum código novo
//   necessário, já implementado desde Discovery Chains Phase I /
//   Expedition Discovery Phase IV (Knowledge Rewards). Esta Sprint NÃO
//   duplica essa lógica.
// - O que faltava, confirmado nesta auditoria: conexões ENTRE
//   ENTIDADES DO MESMO TIPO ("o que mais é PARECIDO com isto", não "o
//   que isto MENCIONA") — criatura↔criatura (mesmo habitat/região),
//   região→criaturas nativas, região↔região (mesmas ruínas reais),
//   museu→livro (mesma categoria real). Nenhuma dessas existia em
//   nenhum arquivo antes desta Sprint.
// - Achado extra: `getItemRelated` (knowledgeLinks.ts) já retorna
//   "Citado por" (NPC) quando existe, mas `getItemDiscoveryCandidates`
//   (discoveryChains.ts) só usa "Origem"/"Profissão" — a conexão real
//   com o NPC nunca virava uma sugestão de "próximo assunto". Fechada
//   aqui, sem tocar discoveryChains.ts (eixo diferente: lá é "o que
//   este item menciona", aqui é "quem mais sabe sobre isso").
// - REFACTOR OBRIGATÓRIO — procurado qualquer componente que montasse
//   manualmente uma lista de "relacionados"/"recomendações": os únicos
//   `.map().join()` encontrados (BookReader "Relacionados"/"Leitura
//   recomendada", CreatureReader "Também citado em", StoryReader
//   "Também aconteceu em") já formatam dados 100% centralizados em
//   knowledgeLinks.ts — são apresentação, não decisão. Nenhuma lógica
//   de ESCOLHA de sugestão duplicada fora desta camada/discoveryChains.ts.
// - Museu↔Livro: única categoria real compartilhada entre
//   `MuseumCategory` (lib/museum.ts) e `BookCategory` (lib/library.ts)
//   é "misterios" — mesmo valor literal nos dois catálogos, não uma
//   correspondência textual inventada. Só museu de categoria
//   "misterios" gera esta thread.

export function getCreatureThreadCandidates(creature: CreatureDefinition): string[] {
  return CREATURES.filter((c) => c.id !== creature.id && c.regionId === creature.regionId).map(
    (sibling) => `${sibling.name} também vive nesta região.`,
  );
}

export function getRegionCreatureThreadCandidates(regionId: string): string[] {
  return CREATURES.filter((c) => c.regionId === regionId).map((creature) => `${creature.name} vive apenas nesta região.`);
}

export function getRegionSiblingRuinsThreadCandidates(regionId: string): string[] {
  const hasOwnRuins = ANCIENT_RUIN_SITES.some((r) => r.regionId === regionId);
  if (!hasOwnRuins) return [];
  const otherRegionIds = [...new Set(ANCIENT_RUIN_SITES.filter((r) => r.regionId !== regionId).map((r) => r.regionId))];
  return otherRegionIds.map((id) => `${getRegionName(id)} também guarda vestígios antigos.`);
}

export function getMuseumBookThreadCandidates(entry: MuseumEntry): string[] {
  if (entry.category !== "misterios") return [];
  return BOOKS.filter((b) => b.category === "misterios").map((book) => `${book.title} também trata desse tema.`);
}

export function getItemNpcThreadCandidates(itemSlug: string): string[] {
  return getItemRelated(itemSlug)
    .filter((m) => m.label === "Citado por")
    .map((m) => `${m.value} talvez saiba mais sobre isso.`);
}
