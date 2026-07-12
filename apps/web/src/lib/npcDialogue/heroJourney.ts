// Sprint Hero Journey Phase I — camada centralizada, sem estado próprio,
// sem persistência: responde "qual lembrança da jornada faz sentido
// reaparecer agora?". Mesmo contrato exato de foreshadowing.ts/
// livingConsequences.ts (memoryKey por regra, marcada por quem chama —
// NpcIntro/LibraryBuilding/MuseumBuilding — assim que exibida, nunca
// aqui) e mesmo HabitContext compartilhado.
//
// Diferença deliberada das outras três camadas:
// - Recognition: "eu vejo quem você é" — persistente, reavaliada toda
//   visita, some se o estado mudar.
// - Living Consequences: "eu percebi o que você fez" — uma ação
//   específica e recente.
// - Foreshadowing: "o que você ainda não viu" — olha pra frente.
// - Hero Journey: "eu lembro de quem você era" — olha pra trás, compara
//   passado com presente. Por isso NUNCA usa um único sinal (nível OU
//   Boss OU regiões sozinhos) — cada regra combina um sinal de TEMPO
//   (totalMinutes, proxy real de "muito tempo se passou" — nenhum
//   histórico datado existe no jogo) com um sinal de EVOLUÇÃO real
//   (equipmentTier/characterStage/regionsDiscovered/booksRead/
//   museumEntriesViewed/hasCompletedFirstExpedition), exatamente o
//   exemplo do brief ("muito tempo desde a primeira arma + equipamento
//   atual muito melhor → Borin comenta a evolução").
//
// Auditoria feita antes de escrever qualquer regra: cada NPC abaixo já
// tem Recognition/Habit/Foreshadow/Consequence própria (recognition.ts/
// foreshadowing.ts/livingConsequences.ts) — os limiares aqui são
// deliberadamente MAIS altos que os das camadas irmãs (ex.: Idris já
// reage a regionsDiscovered>=6 em Living Consequences; Hero Journey só
// entra em cena depois, em >=8), pra nunca competir pela mesma
// observação e pra reforçar "raramente, parece especial".
import { hasRemembered } from "../playerMemory";
import type { HabitContext } from "./recognition";

// Ilustrativo, não calibrado por playtest — mesma convenção de todo
// número não validado neste projeto (Tiers de Boss, Evolution Score).
const LONG_PLAYTIME_MINUTES = 120;

interface HeroJourneyRule {
  memoryKey: string;
  when: (ctx: HabitContext) => boolean;
  line: string;
}

const HERO_JOURNEY_RULES: Record<string, HeroJourneyRule[]> = {
  // Borin — exemplo exato do brief: muito tempo + equipamento atual
  // muito melhor que o inicial (equipmentTier "strong", o tier mais alto
  // já existente em playerFacts.ts).
  ferreiro: [
    {
      memoryKey: "hero_journey_ferreiro_luvas_rasgadas",
      when: (ctx) => ctx.equipmentTier === "strong" && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Ainda lembro quando você apareceu usando aquelas Luvas Rasgadas.",
    },
  ],
  // Greta — exemplo exato do brief: estágio de evolução avançado
  // (lib/characterPresence.ts, já combina 6 sinais reais sozinho) +
  // muito tempo — nunca conflita com a Consequence dela (bossesDefeated
  // >=1), sinal completamente diferente.
  taverneira: [
    {
      memoryKey: "hero_journey_greta_nao_e_mais_o_mesmo",
      when: (ctx) => (ctx.characterStage === "heroi" || ctx.characterStage === "lenda") && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Você já não parece o mesmo aventureiro.",
    },
  ],
  // Idris — exemplo exato do brief: bem mais regiões que a Consequence
  // dele (>=8 aqui, >=6 lá) + muito tempo — só acende depois que a
  // Consequence já foi consumida.
  viajante: [
    {
      memoryKey: "hero_journey_idris_historias_de_viagem",
      when: (ctx) => ctx.regionsDiscovered >= 8 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Já ouvi histórias das suas viagens.",
    },
  ],
  // Miriam — exemplo exato do brief: bem mais leitura que o Habit dela
  // (>=6 aqui, >=3 lá) + muito tempo.
  bibliotecaria: [
    {
      memoryKey: "hero_journey_miriam_muito_tempo_entre_livros",
      when: (ctx) => ctx.booksRead >= 6 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Você passou muito tempo entre estes livros.",
    },
  ],
  // Alaric — exemplo exato do brief: já é um visitante recorrente
  // (mesma flag que o Habit dele usa) + volume real de registros
  // abertos (Collection Insights) + muito tempo — mais raro que o
  // Habit, que só olha a flag isolada.
  curador: [
    {
      memoryKey: "hero_journey_alaric_poucos_voltam_tanto",
      when: (ctx) => hasRemembered("museum_return_recorded") && ctx.museumEntriesViewed >= 5 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Poucos visitantes voltam tantas vezes quanto você.",
    },
  ],
  // Roth — exemplo exato do brief: primeira expedição concluída (dado
  // real e permanente, hasCompletedFirstExpedition) + muito tempo —
  // sinal diferente da Consequence dele (hasKingdomRole).
  guarda: [
    {
      memoryKey: "hero_journey_roth_rostos_conhecidos",
      when: (ctx) => ctx.hasCompletedFirstExpedition && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "É bom ver rostos conhecidos voltando aos portões.",
    },
  ],
};

export interface HeroJourneyResult {
  line: string;
  memoryKey: string;
}

// Pura na leitura, mesmo contrato de getHabitLine/getForeshadowLine/
// getConsequenceLine.
export function getHeroJourneyLine(npcKey: string, ctx: HabitContext): HeroJourneyResult | null {
  const rules = HERO_JOURNEY_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}

// Lembranças ligadas a um LUGAR, não a um NPC específico — segunda
// metade do brief ("algumas lembranças relacionadas a lugares").
// Renderizadas direto no Building (mesmo padrão de WorldPresenceLine/
// Collection Insight), nunca dentro do NpcIntro.
export type HeroJourneyPlace = "biblioteca" | "museu";

export interface HeroJourneyPlaceContext {
  totalMinutes: number;
  // Biblioteca — só faz sentido dizer "você demorou pra descobrir este
  // lugar" exatamente na visita em que o lugar é descoberto (senão soa
  // fora de contexto meses depois); por isso este sinal, e não uma
  // contagem de visitas.
  isFirstVisitToPlace?: boolean;
  // Museu — reaproveita a mesma contagem de Collection Insights
  // (museumEntriesViewed), limiar mais baixo que o do Alaric acima
  // (progressão: o lugar comenta primeiro, a pessoa comenta depois).
  museumEntriesViewed?: number;
}

interface HeroJourneyPlaceRule {
  memoryKey: string;
  when: (ctx: HeroJourneyPlaceContext) => boolean;
  line: string;
}

const HERO_JOURNEY_PLACE_RULES: Record<HeroJourneyPlace, HeroJourneyPlaceRule[]> = {
  biblioteca: [
    {
      memoryKey: "hero_journey_place_biblioteca_descoberta_tardia",
      when: (ctx) => !!ctx.isFirstVisitToPlace && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Você demorou para descobrir este lugar.",
    },
  ],
  museu: [
    {
      memoryKey: "hero_journey_place_museu_conhece_tudo",
      when: (ctx) => (ctx.museumEntriesViewed ?? 0) >= 3,
      line: "Hoje você anda por aqui como quem já conhece tudo.",
    },
  ],
};

export function getHeroJourneyPlaceLine(place: HeroJourneyPlace, ctx: HeroJourneyPlaceContext): HeroJourneyResult | null {
  const rules = HERO_JOURNEY_PLACE_RULES[place] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}
