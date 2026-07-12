// Sprint Living Knowledge — pequenas integrações que expõem conexões já
// existentes entre catálogos (Bestiário, Biblioteca, Itens, NPCs,
// Regiões, Histórias dos Viajantes, Ruínas). Nenhum conteúdo novo: só
// funções puras de leitura sobre os dados que já existem, usadas pelos
// readers/páginas já existentes (nenhum componente/sistema novo).
//
// Sprint Discovery Graph (Phase I) — mais referências cruzadas, mesma
// regra: nenhum dado novo, só funções puras reaproveitando o que já
// existe. Onde não havia campo estruturado pra ligar dois catálogos
// (rumores sem id/tema, item↔profissão sem catálogo de itens
// acessível do apps/web), usa `findMentions` — busca de substring
// contra nomes já conhecidos, nunca uma lista nova hardcoded de temas.
import { CREATURES, getRegionName, type CreatureDefinition } from "./bestiary";
import { BOOKS, type BookDefinition } from "./library";
import { TRAVELLER_STORIES, type TravellerStory } from "./travellerStories";
import { NPCS, type NpcDefinition } from "./npcs";
import { ANCIENT_RUIN_SITES } from "./ruins";
import { TAVERN_RUMORS } from "./tavern";
import { NPC_DIALOGUE, flattenDialogue } from "./npcDialogue";
import { KINGDOM_PROFESSIONS } from "./folk";
import { MUSEUM_ENTRIES } from "./museum";
import { GREAT_TRAGEDIES, GREAT_VICTORIES, MEMORIALS, REMEMBERED_COMMONERS } from "./memories";

// Utilitário genérico e reutilizável: dado um texto e uma lista de
// candidatos com nome, devolve os candidatos cujo nome aparece como
// substring no texto (case-insensitive), nunca o próprio item quando
// `excludeId` bate. Usado em todo lugar onde os dois catálogos não têm
// um campo estruturado em comum (id, categoria, região) — só o texto.
function findMentions<T extends { id: string; name: string }>(text: string, candidates: T[], excludeId?: string): T[] {
  const haystack = text.toLowerCase();
  return candidates.filter((c) => c.id !== excludeId && c.name.length > 3 && haystack.includes(c.name.toLowerCase()));
}

// `NPCS` é um objeto literal tipado por chave conhecida (ferreiro,
// mercador, ...), não um Record<string, NpcDefinition> — as conexões
// do Bestiário guardam a chave como string solta, por isso a busca
// aqui precisa passar por `Object.values` em vez de indexar direto.
function findNpc(npcKey: string): NpcDefinition | undefined {
  return Object.values(NPCS).find((npc) => npc.key === npcKey);
}

// items.service.ts (nomes reais dos itens) vive em apps/api, outro
// pacote — não pode ser importado por apps/web. Mapa local só com os
// slugs realmente referenciados pelas conexões do Bestiário, com os
// mesmos nomes já cunhados nas Sprints que criaram esses itens.
const ITEM_NAMES: Record<string, string> = {
  "amuleto-guardiao-ruinas": "Amuleto do Guardião das Ruínas",
  "botas-cacador-feras": "Botas de Caçador de Feras",
  "botas-de-pelagem-seca": "Botas de Pelagem Seca",
  "botas-forjadas-minas-abandonadas": "Botas Forjadas nas Minas Abandonadas",
  "botas-picos-congelados": "Botas dos Picos Congelados",
  "capacete-penas-corvo": "Capacete com Penas de Corvo",
  "colar-conchas": "Colar de Conchas",
  "colar-dentes-lobo": "Colar de Dentes de Lobo",
  "coleira-do-filhote-perdido": "Coleira do Filhote Perdido",
  "elmo-de-presas-de-gelo": "Elmo de Presas de Gelo",
  "elmo-guardiao-ruinas": "Elmo do Guardião das Ruínas",
  "elmo-picos-congelados": "Elmo dos Picos Congelados",
  "espada-curva-picos-congelados": "Espada Curva dos Picos Congelados",
  "foice-deserto-vidro": "Foice do Deserto de Vidro",
  "garras-de-matilha": "Garras de Matilha",
  "lamina-forjada-minas-abandonadas": "Lâmina Forjada nas Minas Abandonadas",
  "lanca-fortaleza-sombria": "Lança da Fortaleza Sombria",
  "luvas-cacador-feras": "Luvas de Caçador de Feras",
  "luvas-deserto-vidro": "Luvas do Deserto de Vidro",
  "luvas-forjadas-minas-abandonadas": "Luvas Forjadas nas Minas Abandonadas",
  "luvas-guardiao-ruinas": "Luvas do Guardião das Ruínas",
  "manto-da-loba-prateada": "Manto da Loba Prateada",
  "manto-de-pelagem-encharcada": "Manto de Pelagem Encharcada",
  "presa-do-alfa": "Presa do Alfa",
};

export interface RelatedMention {
  label: string;
  value: string;
}

function dedupe(mentions: RelatedMention[]): RelatedMention[] {
  const seen = new Set<string>();
  return mentions.filter((m) => {
    const key = `${m.label}::${m.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Ao abrir uma criatura — "Também citado em".
export function getCreatureMentions(creature: CreatureDefinition): RelatedMention[] {
  const c = creature.connections;
  if (!c) return [];
  const mentions: RelatedMention[] = [];
  if (c.itemSlug && ITEM_NAMES[c.itemSlug]) mentions.push({ label: "Item", value: ITEM_NAMES[c.itemSlug] });
  if (c.bookId) {
    const book = BOOKS.find((b) => b.id === c.bookId);
    if (book) mentions.push({ label: "Livro", value: book.title });
  }
  if (c.travellerStoryId) {
    const story = TRAVELLER_STORIES.find((s) => s.id === c.travellerStoryId);
    if (story) mentions.push({ label: "História dos Viajantes", value: story.title });
  }
  if (c.rumor) mentions.push({ label: "Rumor da Taverna", value: c.rumor });
  if (c.npcKey) {
    const npc = findNpc(c.npcKey);
    if (npc) mentions.push({ label: "NPC", value: c.npcNote ? `${npc.name} — "${c.npcNote}"` : npc.name });
  }
  return mentions;
}

// Ao abrir um livro — "Relacionados" (criatura / região / NPC).
export function getBookRelated(bookId: string): RelatedMention[] {
  const related: RelatedMention[] = [];
  const creatures = CREATURES.filter((c) => c.connections?.bookId === bookId);
  for (const creature of creatures) {
    related.push({ label: "Criatura", value: creature.name });
    related.push({ label: "Região", value: getRegionName(creature.regionId) });
    if (creature.connections?.npcKey) {
      const npc = findNpc(creature.connections.npcKey);
      if (npc) related.push({ label: "NPC", value: npc.name });
    }
  }
  return dedupe(related);
}

// Ao abrir um item — "Origem" / "Encontrado em" / "Citado por" /
// "Usado por" (NPC / Criatura / Profissão).
export function getItemRelated(itemSlug: string): RelatedMention[] {
  const creature = CREATURES.find((c) => c.connections?.itemSlug === itemSlug);
  if (!creature) return [];
  const mentions: RelatedMention[] = [
    { label: "Origem", value: creature.name },
    { label: "Encontrado em", value: getRegionName(creature.regionId) },
  ];
  if (creature.connections?.npcKey) {
    const npc = findNpc(creature.connections.npcKey);
    if (npc) mentions.push({ label: "Citado por", value: npc.name });
  }
  // "Profissão": nenhum catálogo de itens liga item↔ofício hoje, então
  // usa o mesmo `findMentions` — só aparece quando o nome do item é
  // citado de verdade no texto de alguma profissão (sem inventar
  // relação nenhuma).
  const itemName = ITEM_NAMES[itemSlug];
  if (itemName) {
    const professionHits = KINGDOM_PROFESSIONS.filter((p) =>
      `${p.description} ${p.routine} ${p.curiosity} ${p.relations}`.toLowerCase().includes(itemName.toLowerCase()),
    );
    for (const p of professionHits) mentions.push({ label: "Profissão", value: p.name });
  }
  return mentions;
}

// Ao falar com um NPC — "Últimos assuntos" (criaturas que citam esse
// NPC nas próprias conexões do Bestiário).
export function getNpcSubjects(npcKey: string): string[] {
  return CREATURES.filter((c) => c.connections?.npcKey === npcKey).map((c) => c.name);
}

// Ao abrir uma região — "Histórias" e "Ruínas" (únicos dois catálogos
// já existentes com `regionId` real; rumores/livros/eventos não têm
// esse campo hoje, por isso ficam de fora desta Sprint).
export function getRegionKnowledge(regionId: string): { stories: string[]; ruins: string[] } {
  return {
    stories: TRAVELLER_STORIES.filter((s) => s.regionId === regionId).map((s) => s.title),
    ruins: ANCIENT_RUIN_SITES.filter((r) => r.regionId === regionId).map((r) => r.name),
  };
}

// Sprint Discovery Graph (Phase I) — daqui pra baixo.

// Ao abrir um livro — "Leitura recomendada": outros livros da mesma
// categoria (lib/library.ts BookCategory), nunca o próprio livro.
export function getBookRecommendations(bookId: string, limit = 3): BookDefinition[] {
  const book = BOOKS.find((b) => b.id === bookId);
  if (!book) return [];
  return BOOKS.filter((b) => b.id !== bookId && b.category === book.category).slice(0, limit);
}

// Ao ler um rumor — "Outros rumores semelhantes": rumores que citam
// pelo menos um mesmo nome conhecido (NPC, criatura ou região) que o
// rumor atual. TAVERN_RUMORS é só string[] (sem id/tema) — por isso a
// aproximação é textual, nunca um campo novo no catálogo.
const KNOWN_NAMES = [
  ...Object.values(NPCS).map((n) => ({ id: `npc:${n.key}`, name: n.name.split(",")[0].trim() })),
  ...CREATURES.map((c) => ({ id: `creature:${c.id}`, name: c.name })),
];

export function getSimilarRumors(rumor: string, limit = 3): string[] {
  const mentionedHere = findMentions(rumor, KNOWN_NAMES);
  if (mentionedHere.length === 0) return [];
  const mentionedIds = new Set(mentionedHere.map((m) => m.id));
  return TAVERN_RUMORS.filter((other) => {
    if (other === rumor) return false;
    return findMentions(other, KNOWN_NAMES).some((m) => mentionedIds.has(m.id));
  }).slice(0, limit);
}

// Ao abrir uma História dos Viajantes — "Também aconteceu em": outra
// história da mesma categoria, ocorrida numa região diferente.
export function getRelatedStoriesAcrossRegions(story: TravellerStory, limit = 3): TravellerStory[] {
  return TRAVELLER_STORIES.filter(
    (s) => s.id !== story.id && s.category === story.category && s.regionId !== story.regionId,
  ).slice(0, limit);
}

// Ao falar com um NPC — "Pessoas citadas": outros NPCs mencionados
// pelo nome no próprio catálogo de falas dele (lib/npcDialogue).
const NPC_CANDIDATES = Object.values(NPCS).map((n) => ({ id: n.key, name: n.name.split(",")[0].trim() }));

export function getNpcCitedPeople(npcKey: string): string[] {
  const catalog = NPC_DIALOGUE[npcKey];
  if (!catalog) return [];
  const allLines = flattenDialogue(catalog).join(" ");
  return findMentions(allLines, NPC_CANDIDATES, npcKey).map((n) => n.name);
}

// Ao abrir uma Ruína Antiga — "Eventos ligados": registros do Museu ou
// memórias do Reino que citam o nome da ruína pelo texto. Pronta para
// uso, mas ainda sem tela própria de Ruínas no jogo (Sprint Ancient
// Ruins Ecosystem só criou o conteúdo, nenhuma página) — por isso não
// está conectada a nenhum componente ainda.
export function getRuinLinkedEvents(ruinName: string, limit = 3): string[] {
  const needle = ruinName.toLowerCase();
  const names = [
    ...MUSEUM_ENTRIES.filter((e) => e.pages.some((page) => page.toLowerCase().includes(needle))).map((e) => e.title),
    ...GREAT_TRAGEDIES.filter((t) => t.description.toLowerCase().includes(needle)).map((t) => t.name),
    ...GREAT_VICTORIES.filter((v) => v.description.toLowerCase().includes(needle)).map((v) => v.name),
  ];
  return [...new Set(names)].slice(0, limit);
}

// Ao abrir uma Profissão — "Ofícios relacionados": outras profissões
// citadas no texto de `relations` (não existe catálogo de itens
// acessível do apps/web pra oferecer "ferramentas comuns" de verdade
// sem inventar dado — ver nota no topo do arquivo). Pronta para uso,
// ainda sem tela própria de Profissões (Sprint Kingdom Folk só criou
// o conteúdo).
const PROFESSION_CANDIDATES = KINGDOM_PROFESSIONS.map((p) => ({ id: p.id, name: p.name }));

export function getProfessionRelatedTrades(professionId: string): string[] {
  const profession = KINGDOM_PROFESSIONS.find((p) => p.id === professionId);
  if (!profession) return [];
  return findMentions(profession.relations, PROFESSION_CANDIDATES, professionId).map((p) => p.name);
}

// Ao abrir um Monumento (lib/museum.ts, categoria "monumentos") —
// "Acontecimentos relacionados": tragédias/vitórias citadas no texto
// do próprio registro. Pronta para uso; MuseumReader já existe e
// poderia ligar isso numa Sprint futura sem mudança de estrutura.
export function getMonumentRelatedEvents(monumentId: string, limit = 3): string[] {
  const monument = MUSEUM_ENTRIES.find((m) => m.id === monumentId);
  if (!monument) return [];
  const text = monument.pages.join(" ").toLowerCase();
  const eventNames = [...GREAT_TRAGEDIES.map((t) => t.name), ...GREAT_VICTORIES.map((v) => v.name)];
  return eventNames.filter((name) => text.includes(name.toLowerCase())).slice(0, limit);
}

// Ao abrir um Memorial (lib/memories.ts) — "Pessoas lembradas": nome
// da pessoa comum citada na descrição do memorial. Pronta para uso,
// ainda sem tela própria de Memoriais (Sprint Kingdom Memories só
// criou o conteúdo).
export function getMemorialRememberedPeople(memorialId: string): string[] {
  const memorial = MEMORIALS.find((m) => m.id === memorialId);
  if (!memorial) return [];
  return findMentions(memorial.description, REMEMBERED_COMMONERS).map((p) => p.name);
}
