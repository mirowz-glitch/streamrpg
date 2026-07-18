import type { WorldEventCategory } from "@streamrpg/shared";
import type { PlayerFacts } from "./playerFacts";
import type { CollectionInsightContext } from "./collectionInsights";
import type { WorldPresenceContext } from "./worldPresence";
import type { CityPlace } from "./cityPlaces";

// Sprint Kingdom Evolution Phase I — camada central, sem estado, sem
// persistência, sem backend/tabela/evento novo: "como o Reino parece
// estar evoluindo?". Nunca humor/clima/NPC/boato/memória/legado/
// reputação/atividade/ambientação física (todas já cobertas por outras
// camadas) — é sempre uma leitura de EVOLUÇÃO ESTRUTURAL, permanente,
// nunca um instante. Cada lugar recebe exatamente 1 frase, sempre não
// nula (dois estágios: "ainda começando" vs "já em crescimento"),
// mesmo espírito de Expedition Evolution/Journey (nunca aleatório,
// sempre função pura do sinal real).
export interface KingdomEvolutionContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  museumEntriesViewed: number;
  playersOnline: number;
  worldEventCategory?: WorldEventCategory;
}

// Reaproveita PlayerFacts + CollectionInsightContext (já calculados por
// CityPage) + WorldPresenceContext (players_online/current_event.category)
// — nenhum dado novo.
export function buildKingdomEvolutionContext(
  facts: PlayerFacts,
  insightCtx?: Partial<Pick<CollectionInsightContext, "booksRead" | "creaturesViewed" | "museumEntriesViewed">>,
  worldPresenceCtx?: WorldPresenceContext,
): KingdomEvolutionContext {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0,
    worldEventCategory: worldPresenceCtx?.eventCategory,
  };
}

const HIGH_POPULATION_THRESHOLD = 5;

// Pura: mesma entrada, mesma saída, sempre. Nenhum componente decide
// sozinho.
export function getKingdomEvolutionLine(place: CityPlace, ctx: KingdomEvolutionContext): string {
  switch (place) {
    case "praca":
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD
        ? "A cidade recebe cada vez mais visitantes."
        : "Aos poucos, mais gente começa a passar pela Capital.";
    case "portao-norte":
      return ctx.facts.regionsDiscovered >= 5
        ? "As estradas parecem mais movimentadas."
        : "Novas rotas começam a se abrir para fora da Capital.";
    case "ferreiro":
      return ctx.facts.bossesDefeated >= 3
        ? "Algumas construções recebem manutenção constante."
        : "Pequenos reparos começam a aparecer pela forja.";
    case "taverna":
      return ctx.facts.totalMinutes >= 300
        ? "O movimento comercial cresce lentamente."
        : "O comércio ainda dá os primeiros passos por aqui.";
    case "biblioteca":
      return ctx.booksRead >= 4
        ? "O acervo do Reino parece crescer a cada semana."
        : "Novos registros começam a ocupar as prateleiras.";
    case "museu":
      return ctx.museumEntriesViewed >= 3
        ? "O Museu recebe cada vez mais peças para preservar."
        : "O acervo do Museu começa a tomar forma.";
    case "guilda":
      return ctx.facts.hasKingdomRole
        ? "A Guilda parece reunir cada vez mais nomes de peso."
        : "A Guilda ainda constrói sua própria história.";
    case "casa-dos-viajantes":
      return ctx.creaturesViewed >= 4
        ? "Cada vez mais relatos chegam de além das muralhas."
        : "Os primeiros relatos de fora começam a chegar.";
    case "arena":
      if (ctx.worldEventCategory === "militar") return "Há sinais de que as defesas do Reino se fortalecem.";
      return ctx.facts.hasFounderTitle
        ? "Há sinais de que o Reino continua se expandindo."
        : "O Reino ainda desenha os primeiros passos da sua expansão.";
  }
}
