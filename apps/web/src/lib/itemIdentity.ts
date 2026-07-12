import { CREATURES } from "./bestiary";
import { REGIONS } from "./regions";
import { BOOKS } from "./library";
import { MUSEUM_ENTRIES } from "./museum";
import { TRAVELLER_STORIES } from "./travellerStories";
import { KINGDOM_PROFESSIONS } from "./folk";
import { NPC_DIALOGUE, flattenDialogue } from "./npcDialogue";

// Sprint Item Identity Phase I — camada central, sem estado, sem
// persistência, sem backend: "o que torna este item especial?". Cada
// item exibe NO MÁXIMO uma observação (nunca várias), decidida por
// prioridade — nunca a descrição do item, sempre um dado real de outro
// catálogo já existente.
//
// Auditoria do catálogo (apps/api/src/services/items.service.ts, lido
// só para mapear — nenhuma linha alterada, é backend): 337 itens, 6
// slots, 5 raridades. Conexões REAIS já existentes mapeadas, por tipo:
// - 23 itens têm `connections.itemSlug` estruturado em lib/bestiary.ts
//   (Sprint Wolves/Ravens/Content Connections) — a fonte mais forte,
//   usada como Tier 1.
// - Vários itens épicos/lendários "temáticos" (conjuntos Picos
//   Congelados/Deserto de Vidro/Minas Abandonadas/Litoral Quebrado/
//   Fortaleza Sombria/Ruínas Esquecidas/Bosque Sussurrante/Colinas
//   Áridas/Pântano Podre/Planície Dourada) têm o nome de uma REGIÃO
//   real (lib/regions.ts) embutido no próprio nome do item — conexão
//   estrutural, não inventada (comparação direta contra REGIONS[].name).
// - "Cavaleiro da Ponte Velha" (5 itens) é uma História dos Viajantes
//   REAL (lib/travellerStories.ts, categoria "ruinas"). "Primeiro
//   Amanhecer" (2 itens) bate com o título real de um livro da
//   Biblioteca ("Crônicas do Primeiro Amanhecer", lib/library.ts).
// - Nenhuma correspondência confiável foi encontrada em Folclore
//   (lib/folklore.ts) nem em Eras Históricas (lib/history.ts) pros
//   nomes "Rei Que Nunca Foi Coroado/Conversava com Pedras",
//   "Explorador Desaparecido", "Comandante Esquecido", "Mensageiro da
//   Fortaleza" ou "Última Coroa" — são flavor text original do
//   catálogo de itens, sem uma entidade nomeada correspondente em
//   nenhum outro catálogo. DELIBERADAMENTE deixados sem observação
//   (silenciosos) em vez de inventar uma relação — exatamente a
//   restrição do brief.
// - Profissões (lib/folk.ts) e falas de NPC (lib/npcDialogue) checadas
//   por menção textual literal do nome do item — mesmo técnica já
//   usada por knowledgeLinks.ts's getItemRelated/getSimilarRumors.
export interface ItemIdentityInput {
  slug: string;
  name: string;
}

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// Nomes de item seguem o padrão "{Tipo} d[oa]s? {Tema}" (ex.: "Lâmina
// do Cavaleiro da Ponte Velha", "Botas do Primeiro Amanhecer") — o
// "Tema" é a parte que pode coincidir com um título real (a História
// dos Viajantes se chama só "O Cavaleiro da Ponte Velha", o livro só
// "Crônicas do Primeiro Amanhecer"; nenhum dos dois contém o nome do
// item inteiro, nem o nome do item contém o título inteiro). Extrai só
// o "Tema", descartando a primeira palavra (o tipo do item) e um
// conectivo "do/da/dos/das" opcional logo depois. Exige 2+ palavras no
// resultado — evita falso positivo de um substantivo comum sozinho
// (ex.: "Amuleto de Pescador" nunca reduz a só "Pescador").
function themeCore(itemName: string): string | null {
  const stripped = itemName.replace(/^\S+\s+(d[oa]s?\s+)?/i, "").trim();
  return stripped.includes(" ") ? stripped : null;
}

// Pura: mesma entrada, mesma saída, sempre. Prioridade fixa — a
// primeira fonte que bater decide, nunca combina duas.
export function getItemIdentityLine(item: ItemIdentityInput): string | null {
  // Tier 1 — conexão estruturada com uma criatura real do Bestiário
  // (lib/bestiary.ts connections.itemSlug). A mais forte: reaproveita a
  // observação de um NPC já escrita (`npcNote`) quando existe.
  const creature = CREATURES.find((c) => c.connections?.itemSlug === item.slug);
  if (creature) {
    return creature.connections?.npcNote ?? `Encontrado junto a criaturas como ${creature.name}.`;
  }

  const core = themeCore(item.name);

  // Tier 2 — citado literalmente numa das falas de algum NPC
  // (lib/npcDialogue/*.ts).
  if (core) {
    for (const catalog of Object.values(NPC_DIALOGUE)) {
      if (includes(flattenDialogue(catalog).join(" "), core)) {
        return "Já foi citado numa conversa entre os moradores da Capital.";
      }
    }
  }

  // Tier 3 — citado numa História dos Viajantes real.
  if (core && TRAVELLER_STORIES.some((s) => includes(s.title, core) || includes(s.text, core))) {
    return "Sua origem é contada numa história dos viajantes.";
  }

  // Tier 3 — título ou página de um livro real da Biblioteca.
  if (core && BOOKS.some((b) => includes(b.title, core) || b.pages.some((p) => includes(p, core)))) {
    return "Citado num livro da Biblioteca.";
  }

  // Tier 3 — título ou página de um registro real do Museu.
  if (core && MUSEUM_ENTRIES.some((e) => includes(e.title, core) || e.pages.some((p) => includes(p, core)))) {
    return "Uma peça parecida está catalogada no Museu.";
  }

  // Tier 4 — o próprio nome do item cita uma região real do Reino
  // (comparação direta, nome completo da região — nunca reduzido).
  const region = REGIONS.find((r) => includes(item.name, r.name));
  if (region) {
    return `Encontrado principalmente em ${region.name}.`;
  }

  // Tier 5 — reconhecido por uma profissão real do Reino.
  const profession = KINGDOM_PROFESSIONS.find((p) =>
    includes(`${p.description} ${p.routine} ${p.curiosity} ${p.relations}`, item.name),
  );
  if (profession) {
    return `Reconhecido por quem exerce o ofício de ${profession.name}.`;
  }

  return null;
}
