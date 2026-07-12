// Sprint Reactive Layer Foundation — registro pessoal e local de "coisas
// que já aconteceram com este jogador" (não confundir com a Timeline
// agregada do Reino em WorldPage/Timeline.tsx, que é dado de todos os
// jogadores, vindo do servidor). Ponto único de escrita: Recognition,
// Feedback e futuros sistemas registram aqui em vez de cada um inventar
// sua própria lista de "últimas coisas". Nenhuma UI lê isto ainda nesta
// Sprint — é fundação pronta, não uma tela nova (mesmo espírito das
// funções já "prontas mas não conectadas" em lib/knowledgeLinks.ts).
import { hasRemembered } from "./playerMemory";

const STORAGE_KEY = "streamrpg_personal_timeline";
const MAX_EVENTS = 20;

export interface PersonalEvent {
  kind: string;
  at: number;
  meta?: Record<string, unknown>;
}

function readAll(): PersonalEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PersonalEvent[]) : [];
  } catch {
    return [];
  }
}

export function recordEvent(kind: string, meta?: Record<string, unknown>): void {
  const events = readAll();
  events.unshift({ kind, at: Date.now(), meta });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}

export function getRecentEvents(limit = MAX_EVENTS): PersonalEvent[] {
  return readAll().slice(0, limit);
}

// Sprint Kingdom Echoes Phase I — transforma marcos já conquistados
// (flags gravadas por Sprints anteriores em lib/playerMemory.ts, via
// CreatureReader/BookReader/MuseumBuilding/TavernBuilding/
// TravellerHouseBuilding/getHabitLine) em pequenos "ecos" anônimos,
// nunca citando o jogador — reaproveita Kingdom News já existente
// (WorldPage) como único palco. Cada eco tem sua própria memoryKey
// (`key`), marcada por quem chama assim que exibido, garantindo no
// máximo uma aparição pra sempre por jogador.
export interface KingdomEchoContext {
  regionsDiscovered: number;
}

interface EchoRule {
  key: string;
  requiresKey?: string;
  when?: (ctx: KingdomEchoContext) => boolean;
  icon: string;
  text: string;
}

const ECHO_RULES: EchoRule[] = [
  {
    key: "echo_bestiary",
    requiresKey: "first_bestiary_entry",
    icon: "🔍",
    text: "Dizem que uma nova espécie foi registrada recentemente no Bestiário do Reino.",
  },
  {
    key: "echo_library",
    requiresKey: "first_book_read",
    icon: "📚",
    text: "Alguns registros novos ainda esperam catalogação na Biblioteca.",
  },
  {
    key: "echo_museum",
    requiresKey: "museum_return_recorded",
    icon: "🖼️",
    text: "O Museu recebeu novas peças para avaliação recentemente.",
  },
  {
    key: "echo_tavern",
    requiresKey: "tavern_regular_recorded",
    icon: "🍺",
    text: "Dizem que um rosto conhecido virou presença constante na Taverna.",
  },
  {
    key: "echo_traveller",
    requiresKey: "traveller_listener_recorded",
    icon: "📜",
    text: "Um viajante comentou ter encontrado sempre alguém disposto a ouvir uma boa história.",
  },
  {
    key: "echo_equipment",
    requiresKey: "habit_equipment_shown",
    icon: "🛠️",
    text: "Comentam que um aventureiro apareceu com equipamento renovado na Capital.",
  },
  {
    key: "echo_regions",
    when: (ctx) => ctx.regionsDiscovered >= 4,
    icon: "🗺️",
    text: "Exploradores andam trazendo relatos de regiões pouco visitadas.",
  },
];

export interface KingdomEchoItem {
  id: string;
  icon: string;
  text: string;
}

// Pura na leitura (hasRemembered só lê) — quem chama decide quando
// marcar `id` como visto, mesmo padrão já usado por getHabitLine.
export function getKingdomEchoes(ctx: KingdomEchoContext): KingdomEchoItem[] {
  const result: KingdomEchoItem[] = [];
  for (const rule of ECHO_RULES) {
    if (hasRemembered(rule.key)) continue;
    const eligible = rule.requiresKey ? hasRemembered(rule.requiresKey) : rule.when ? rule.when(ctx) : false;
    if (eligible) {
      result.push({ id: rule.key, icon: rule.icon, text: rule.text });
    }
  }
  return result;
}
