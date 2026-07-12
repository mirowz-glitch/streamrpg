import type { CreatureDefinition } from "./bestiary";
import { getCreatureMentions, getBookRelated, getItemRelated, getRegionKnowledge, getMonumentRelatedEvents } from "./knowledgeLinks";

// Sprint Discovery Chains Phase I — camada central, sem estado, sem
// persistência, sem backend: "qual descoberta faz mais sentido o
// jogador procurar agora, com base no que acabou de ver?". NO MÁXIMO
// uma sugestão por tela, nunca lista, nunca Quest/Objetivo/Guia — só
// uma frase que aponta uma direção, sempre derivada de uma conexão
// REAL já existente.
//
// OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer sugestão:
// knowledgeLinks.ts JÁ resolve toda a parte difícil (encontrar a
// conexão real entre dois catálogos) — `getCreatureMentions`,
// `getBookRelated`, `getItemRelated` e `getRegionKnowledge` já são
// consumidos por CreatureReader/BookReader/InventoryPage/RegionGallery
// como uma LISTA factual ("Também citado em: Item: Presa do Alfa").
// `getMonumentRelatedEvents` existe desde a Sprint Discovery Graph
// (Phase I), pronta pra uso, mas nunca foi conectada a nenhum
// componente (comentário original: "MuseumReader já existe e poderia
// ligar isso numa Sprint futura sem mudança de estrutura" — esta é
// essa Sprint). Discovery Chains NÃO duplica nenhuma dessas buscas:
// reaproveita exatamente o mesmo resultado, e só acrescenta uma camada
// de FRASEAMENTO — vira uma única sugestão em prosa, no lugar da lista
// factual, nunca as duas coisas repetindo o mesmo dado com palavras
// diferentes lado a lado. Zero dado novo, zero cruzamento novo: cada
// função abaixo é só `pick primeiro item + frase pronta`.
//
// Critério máximo aplicado a cada linha: "estou só mostrando uma
// conexão que já existe?" — sim, em todas: os valores inseridos nas
// frases (nome da criatura/item/profissão/evento) vêm sempre do
// retorno real de knowledgeLinks.ts, nunca de um texto inventado.
export interface DiscoverySuggestion {
  line: string;
}

// Ao abrir uma criatura — prioridade: Item > Livro > História dos
// Viajantes > Rumor da Taverna (NPC fica de fora: o `value` de NPC já
// vem composto com a nota do próprio NPC, não dá um nome limpo pra
// frase sem reconstruir texto, e "Também citado em" já cobre isso).
const CREATURE_MENTION_PRIORITY = ["Item", "Livro", "História dos Viajantes", "Rumor da Taverna"] as const;

// Sprint Expedition Consequences Phase I — antes só o primeiro match
// (por prioridade) era retornado; agora TODOS os matches reais viram
// uma lista ordenada (mesma prioridade de sempre, nenhum dado novo).
// `getCreatureDiscoveryChain` (abaixo) continua exatamente igual —
// `candidates[0] ?? null` é o mesmo valor que já era retornado antes
// desta Sprint, zero regressão pra quem só chama a versão singular.
// A lista completa existe só pra lib/expeditionConsequences.ts poder
// decidir, com base no Approach, mostrar mais de uma quando fizer
// sentido — esta função nunca decide isso sozinha.
export function getCreatureDiscoveryCandidates(creature: CreatureDefinition): string[] {
  const mentions = getCreatureMentions(creature);
  const candidates: string[] = [];
  for (const label of CREATURE_MENTION_PRIORITY) {
    const found = mentions.find((m) => m.label === label);
    if (!found) continue;
    switch (label) {
      case "Item":
        candidates.push(`Alguns aventureiros procuram ${found.value} depois dessa descoberta.`);
        break;
      case "Livro":
        candidates.push("Talvez valha a pena procurar mais sobre isso na Biblioteca.");
        break;
      case "História dos Viajantes":
        candidates.push("Há viajantes que contam histórias sobre isso.");
        break;
      case "Rumor da Taverna":
        candidates.push("Rumores parecidos ainda circulam pela Taverna.");
        break;
    }
  }
  return candidates;
}

export function getCreatureDiscoveryChain(creature: CreatureDefinition): string | null {
  return getCreatureDiscoveryCandidates(creature)[0] ?? null;
}

// Ao abrir um livro — prioridade: Criatura > Região > NPC. Exemplo
// quase literal do brief (Tratado da Matilha → Lobos), usando o nome
// real devolvido por getBookRelated, nunca um texto fixo.
//
// Sprint Expedition Discovery Phase IV (Knowledge Rewards) — mesma
// consolidação já aplicada à Criatura: `getBookRelated` já retorna
// TODAS as menções reais (um livro pode ter mais de uma criatura
// conectada, cada uma contribuindo Criatura/Região/NPC); antes só a
// primeira por prioridade virava frase. Agora todas as combinações
// reais viram candidatos ordenados — `getBookDiscoveryChain` continua
// `candidates[0] ?? null`, mesmo valor de sempre.
export function getBookDiscoveryCandidates(bookId: string): string[] {
  const related = getBookRelated(bookId);
  const candidates: string[] = [];
  for (const mention of related) {
    switch (mention.label) {
      case "Criatura":
        candidates.push(`Talvez agora faça sentido observar ${mention.value} com mais atenção.`);
        break;
      case "Região":
        candidates.push(`Essa história tem raízes em ${mention.value}.`);
        break;
      case "NPC":
        candidates.push(`${mention.value} pode ter mais a dizer sobre isso.`);
        break;
    }
  }
  return candidates;
}

export function getBookDiscoveryChain(bookId: string): string | null {
  return getBookDiscoveryCandidates(bookId)[0] ?? null;
}

// Ao abrir um item — prioridade: Origem (criatura) > Profissão.
//
// Sprint Expedition Discovery Phase IV (Knowledge Rewards) — mesma
// consolidação: `getItemRelated` já pode retornar MAIS de uma
// "Profissão" real (todo ofício cujo texto cita o item, sem limite);
// antes só a primeira virava frase. `getItemDiscoveryChain` continua
// `candidates[0] ?? null`, mesmo valor de sempre.
export function getItemDiscoveryCandidates(itemSlug: string): string[] {
  const related = getItemRelated(itemSlug);
  const candidates: string[] = [];
  const origin = related.find((m) => m.label === "Origem");
  if (origin) candidates.push(`Muitos associam este item a encontros com ${origin.value}.`);
  for (const mention of related.filter((m) => m.label === "Profissão")) {
    candidates.push(`Quem exerce o ofício de ${mention.value} reconheceria uma peça assim.`);
  }
  return candidates;
}

export function getItemDiscoveryChain(itemSlug: string): string | null {
  return getItemDiscoveryCandidates(itemSlug)[0] ?? null;
}

// Ao abrir uma região — prioridade: Histórias > Ruínas.
//
// Sprint Expedition Discovery Phase IV (Knowledge Rewards) — antes só
// o sinal de maior prioridade virava frase (Histórias sempre vencia
// Ruínas quando ambas eram reais). Agora os dois sinais reais viram
// candidatos, na mesma ordem de prioridade de sempre —
// `getRegionDiscoveryChain` continua `candidates[0] ?? null`.
export function getRegionDiscoveryCandidates(regionId: string): string[] {
  const knowledge = getRegionKnowledge(regionId);
  const candidates: string[] = [];
  if (knowledge.stories.length > 0) candidates.push("Há quem conte histórias sobre esta região na Casa dos Viajantes.");
  if (knowledge.ruins.length > 0) candidates.push("Ruínas antigas ainda esperam por quem quiser explorá-las por aqui.");
  return candidates;
}

export function getRegionDiscoveryChain(regionId: string): string | null {
  return getRegionDiscoveryCandidates(regionId)[0] ?? null;
}

// Ao abrir um registro do Museu — só quando é um Monumento com algum
// acontecimento histórico real ligado a ele (getMonumentRelatedEvents,
// pronta desde Discovery Graph Phase I). Registros que não são
// monumentos, ou sem evento ligado, ficam silenciosos — nunca
// inventar uma conexão que não existe.
//
// Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
// `getMonumentRelatedEvents` já retornava até 3 eventos reais
// (limit=3), mas só `events[0]` virava frase. Agora cada evento real
// vira seu próprio candidato — `getMuseumDiscoveryChain` continua
// `candidates[0] ?? null`.
export function getMuseumDiscoveryCandidates(entryId: string): string[] {
  const events = getMonumentRelatedEvents(entryId);
  return events.map((event) => `"${event}" também é lembrado em outros registros do Reino.`);
}

export function getMuseumDiscoveryChain(entryId: string): string | null {
  return getMuseumDiscoveryCandidates(entryId)[0] ?? null;
}
