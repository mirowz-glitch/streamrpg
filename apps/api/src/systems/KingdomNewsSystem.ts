/**
 * KingdomNewsSystem — Sprint Kingdom News (MVP)
 *
 * "Jornal do Reino": um buffer em memória, separado da Timeline (Sprint
 * World Simulation), populado só observando eventos que já existem no
 * EventBus — mesmo padrão de WorldEventSubscriber (services/world-state
 * .service.ts) e DebugEventSubscriber: read-only, nenhuma regra de jogo,
 * remoção seria inócua para qualquer sistema real.
 *
 * Diferença de propósito para a Timeline: a Timeline é um registro
 * factual objetivo ("X alcançou o nível 5"); o Jornal narra o mesmo tipo
 * de evento em terceira pessoa, com variação de texto (vários templates
 * por evento, sorteados) e, às vezes, a voz de um NPC comentando —
 * nunca inventa um evento que não aconteceu, só varia como ele é
 * contado. Nenhum texto aparece sem um evento real por trás.
 *
 * Nenhuma das duas listas altera a outra: a Timeline continua exatamente
 * como era antes desta Sprint (arquivo não tocado).
 */
import { getRegionName } from "@streamrpg/shared";
import type { KingdomNewsItem } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossActivatedEvent,
  BossDefeatedEvent,
  BossEscapedEvent,
  BossSpawnedEvent,
  DropGrantedEvent,
  EncounterCategory,
  ExpeditionCompletedEvent,
  ExpeditionEncounterEvent,
  IdentityTitleUnlockedEvent,
  KingdomRoleChangedEvent,
  LevelUpEvent,
  SessionStartedEvent,
  XPGrantedEvent,
} from "../engine/types.js";
import { getDb } from "../config/database.js";

const MAX_NEWS = 10;

// Mesmo filtro de categorias "dignas de nota" já usado pela Timeline
// (world-state.service.ts) — cópia local pequena e deliberada, não uma
// exportação nova daquele arquivo, para não alterá-lo nesta Sprint.
const NEWS_WORTHY_CATEGORIES = new Set<EncounterCategory>(["combate", "misterio", "ruinas"]);

let news: KingdomNewsItem[] = [];
let newsSeq = 0;

function resolveDisplayName(characterId: string): string {
  const row = getDb()
    .prepare("SELECT display_name FROM characters WHERE id = ?")
    .get(characterId) as { display_name: string } | undefined;
  return row?.display_name ?? "Um aventureiro";
}

interface NewsTemplate {
  icon: string;
  text: string;
}

function pick(templates: NewsTemplate[]): NewsTemplate {
  return templates[Math.floor(Math.random() * templates.length)];
}

function format(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

function pushNews(template: NewsTemplate, vars: Record<string, string>, timestamp: number): void {
  newsSeq += 1;
  news.push({ id: `news-${newsSeq}`, icon: template.icon, text: format(template.text, vars), timestamp });
  if (news.length > MAX_NEWS) {
    news = news.slice(-MAX_NEWS);
  }
}

// Cada pool mistura notícia neutra + observação de NPC (nunca um NPC
// falando de algo que não é real: a fala está sempre presa ao mesmo
// evento das outras variações do mesmo pool).
const ARRIVAL_TEMPLATES: NewsTemplate[] = [
  { icon: "🧭", text: "Um novo aventureiro chegou ao Reino." },
  { icon: "🧭", text: "Um novo explorador chegou ao Reino." },
  { icon: "🚪", text: "{nome} atravessou os portões da Capital." },
  { icon: "🧭", text: "Mais um viajante entrou no Reino." },
  { icon: "🚪", text: "As portas da Capital se abriram para {nome}." },
  { icon: "🚪", text: "Sargento Roth acena para mais um recém-chegado." },
  { icon: "🧭", text: "Dizem que {nome} chegou cheio de perguntas sobre o Reino." },
];

const LEVEL_UP_TEMPLATES: NewsTemplate[] = [
  { icon: "⭐", text: "A experiência começa a aparecer." },
  { icon: "⭐", text: "{nome} continua evoluindo." },
  { icon: "⭐", text: "O Reino ganhou mais um aventureiro experiente." },
  { icon: "⭐", text: "{nome} parece mais preparado que ontem." },
  { icon: "⭐", text: "Rumores dizem que {nome} está ficando mais forte." },
  { icon: "📖", text: "Os eruditos anotam mais um avanço de {nome}." },
];

const DROP_TEMPLATES: NewsTemplate[] = [
  { icon: "🎒", text: "Um aventureiro encontrou {item} pelo caminho." },
  { icon: "🎒", text: "{nome} encontrou {item}." },
  { icon: "🎒", text: "Boatos dizem que {item} apareceu nas mãos de {nome}." },
  { icon: "🎒", text: "Mais um achado: {item}, trazido por {nome}." },
  { icon: "🛠", text: "Borin: \"Espero que dessa vez não volte sem usar o que encontrou.\"" },
  { icon: "🎒", text: "{nome} guardou {item} com cuidado." },
];

// Sprint First 120 Seconds — xp.granted com source "quest" é sempre a
// missão "equipar seu primeiro item" (FirstItemQuestSystem), nunca outra
// coisa; por isso ganha seu próprio pool, distinto do XP de tick comum
// (que não gera notícia — seria ruído demais, um por minuto por jogador
// ativo).
const FIRST_ITEM_TEMPLATES: NewsTemplate[] = [
  { icon: "🛠", text: "Borin afirma que nunca viu tantas Luvas Rasgadas sendo usadas." },
  { icon: "🧤", text: "{nome} equipou seu primeiro item — luvas rasgadas, mas suas." },
  { icon: "🧤", text: "Dizem que todo aventureiro novo carrega as mesmas luvas surradas." },
  { icon: "🛠", text: "Borin: \"Ao menos agora consegue machucar um pão.\"" },
];

const BOSS_SPAWNED_TEMPLATES: NewsTemplate[] = [
  { icon: "🐉", text: "Um Boss apareceu no horizonte." },
  { icon: "🐉", text: "Algo grande desperta no Reino." },
  { icon: "🐉", text: "As sentinelas avistaram um Boss se aproximando." },
  { icon: "🐉", text: "O Reino sente uma presença ameaçadora se aproximar." },
];

const BOSS_ACTIVATED_TEMPLATES: NewsTemplate[] = [
  { icon: "⚔", text: "O Boss entrou em combate!" },
  { icon: "⚔", text: "A batalha contra o Boss começou." },
  { icon: "⚔", text: "O Reino se prepara para enfrentar o Boss." },
  { icon: "⚔", text: "Kade: \"Finalmente, um desafio de verdade.\"" },
];

const BOSS_DEFEATED_TEMPLATES: NewsTemplate[] = [
  { icon: "🏆", text: "O Reino derrotou mais um Boss." },
  { icon: "🏆", text: "Vitória! O Boss caiu." },
  { icon: "🏆", text: "Os aventureiros comemoram: o Boss foi derrotado." },
  { icon: "⚔", text: "Kade: \"Treinar também ajuda.\"" },
  { icon: "🏆", text: "Mais uma vitória para as crônicas do Reino." },
];

const BOSS_ESCAPED_TEMPLATES: NewsTemplate[] = [
  { icon: "💨", text: "Boatos dizem que o Boss escapou..." },
  { icon: "💨", text: "O Boss desapareceu sem deixar rastro." },
  { icon: "💨", text: "Ninguém sabe para onde o Boss foi." },
  { icon: "💨", text: "O Reino lambe as feridas depois da fuga do Boss." },
];

const EXPEDITION_COMPLETED_TEMPLATES: NewsTemplate[] = [
  { icon: "🗺️", text: "Mais um grupo retornou das montanhas." },
  { icon: "🗺️", text: "{nome} voltou de uma expedição em {regiao}." },
  { icon: "🗺️", text: "Um aventureiro retornou coberto de poeira da estrada." },
  { icon: "🗺️", text: "{nome} chegou de volta à Capital, são e salvo." },
  { icon: "🚪", text: "Sargento Roth: \"Mais um que voltou inteiro.\"" },
];

const COMBAT_ENCOUNTER_TEMPLATES: NewsTemplate[] = [
  { icon: "❗", text: "Boatos dizem que aventureiros continuam desaparecendo em {regiao}." },
  { icon: "❗", text: "Relatos de emboscadas continuam vindo de {regiao}." },
  { icon: "❗", text: "{nome} enfrentou perigo em {regiao}." },
  { icon: "❗", text: "Histórias sombrias circulam sobre {regiao}." },
];

const TITLE_UNLOCKED_TEMPLATES: NewsTemplate[] = [
  { icon: "👑", text: "{nome} recebeu o título \"{titulo}\"." },
  { icon: "👑", text: "Um novo título ecoa pela Capital: {titulo}." },
  { icon: "👑", text: "{nome} agora é conhecido como {titulo}." },
];

const ROLE_CHANGED_TEMPLATES: NewsTemplate[] = [
  { icon: "🏛️", text: "{nome} tornou-se {cargo} do Reino." },
  { icon: "🏛️", text: "O Reino tem um novo {cargo}: {nome}." },
];

export class KingdomNewsSystem {
  register(bus: EventBus): () => void {
    const unsubs = [
      bus.subscribe("session.started", (event) => {
        const { characterId, timestamp } = event as SessionStartedEvent;
        pushNews(pick(ARRIVAL_TEMPLATES), { nome: resolveDisplayName(characterId) }, timestamp);
      }),
      bus.subscribe("level.up", (event) => {
        const { characterId, timestamp } = event as LevelUpEvent;
        pushNews(pick(LEVEL_UP_TEMPLATES), { nome: resolveDisplayName(characterId) }, timestamp);
      }),
      bus.subscribe("drop.granted", (event) => {
        const { characterId, itemName, timestamp } = event as DropGrantedEvent;
        pushNews(pick(DROP_TEMPLATES), { nome: resolveDisplayName(characterId), item: itemName }, timestamp);
      }),
      bus.subscribe("xp.granted", (event) => {
        const { characterId, source, timestamp } = event as XPGrantedEvent;
        if (source !== "quest") return; // só a missão do primeiro item vira notícia — XP de tick é ruído demais
        pushNews(pick(FIRST_ITEM_TEMPLATES), { nome: resolveDisplayName(characterId) }, timestamp);
      }),
      bus.subscribe("boss.spawned", (event) => {
        const { timestamp } = event as BossSpawnedEvent;
        pushNews(pick(BOSS_SPAWNED_TEMPLATES), {}, timestamp);
      }),
      bus.subscribe("boss.activated", (event) => {
        const { timestamp } = event as BossActivatedEvent;
        pushNews(pick(BOSS_ACTIVATED_TEMPLATES), {}, timestamp);
      }),
      bus.subscribe("boss.defeated", (event) => {
        const { timestamp } = event as BossDefeatedEvent;
        pushNews(pick(BOSS_DEFEATED_TEMPLATES), {}, timestamp);
      }),
      bus.subscribe("boss.escaped", (event) => {
        const { timestamp } = event as BossEscapedEvent;
        pushNews(pick(BOSS_ESCAPED_TEMPLATES), {}, timestamp);
      }),
      bus.subscribe("expedition.completed", (event) => {
        const { characterId, destinationRegionId, timestamp } = event as ExpeditionCompletedEvent;
        pushNews(
          pick(EXPEDITION_COMPLETED_TEMPLATES),
          { nome: resolveDisplayName(characterId), regiao: getRegionName(destinationRegionId) },
          timestamp,
        );
      }),
      // Mesmo filtro de categoria "digna de nota" da Timeline — só
      // combate/mistério/ruínas viram notícia, o resto (natureza, clima,
      // descanso, comércio, descoberta) seria ruído mundano demais para
      // um Jornal de 10 linhas.
      bus.subscribe("expedition.encounter", (event) => {
        const { characterId, regionId, category, timestamp } = event as ExpeditionEncounterEvent;
        if (!NEWS_WORTHY_CATEGORIES.has(category)) return;
        pushNews(
          pick(COMBAT_ENCOUNTER_TEMPLATES),
          { nome: resolveDisplayName(characterId), regiao: getRegionName(regionId) },
          timestamp,
        );
      }),
      bus.subscribe("identity.title_unlocked", (event) => {
        const { characterId, titleName, timestamp } = event as IdentityTitleUnlockedEvent;
        pushNews(pick(TITLE_UNLOCKED_TEMPLATES), { nome: resolveDisplayName(characterId), titulo: titleName }, timestamp);
      }),
      bus.subscribe("kingdom.role_changed", (event) => {
        const { roleName, characterId, timestamp } = event as KingdomRoleChangedEvent;
        pushNews(pick(ROLE_CHANGED_TEMPLATES), { nome: resolveDisplayName(characterId), cargo: roleName }, timestamp);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }
}

export function getKingdomNews(): KingdomNewsItem[] {
  return news;
}
