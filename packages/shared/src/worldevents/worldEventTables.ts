import type { ExplorationEventTable } from "./types.js";

// World Events, Dynamic Encounters & Exploration Phase I — requisito 3:
// "cada bioma deverá possuir pesos próprios... tudo em tabelas." Uma
// tabela por região (mesmas 6 já usadas por worldencounter/
// encounterTables.ts/biomes.ts) — `chance` decide COM QUE FREQUÊNCIA um
// encontro comum vira um World Event nesta região; `entries` decide
// QUAL evento, entre os elegíveis pro tema do bioma (todo `eventId`
// aqui também lista essa região em `allowedBiomes`, ver
// worldEventDefinitions.ts — verificado por teste, worldEvents.test.ts).
//
// Valores ilustrativos, não calibrados (mesma convenção de sempre) —
// verificados empiricamente pelo Simulador (requisito 8/9) antes da
// entrega. Justificativa dos pesos por bioma (requisito 14):
//
// - Bosque Sussurrante: "Treasure alto, Merchant médio, Shrine médio"
//   (exemplo literal da Sprint) — o bioma inicial, tema de floresta
//   habitada por viajantes/mercadores de passagem.
// - Pântano Podre: "Ambush alto, Shrine baixo" (exemplo literal) —
//   bioma hostil, poucos lugares seguros pra um santuário.
// - Colinas Áridas: tema de bandidos/comércio de passagem (mesmo tema
//   já usado pelos Enemy Templates da região, ver enemy/templates.ts) —
//   Merchant alto, Ambush médio.
// - Minas Abandonadas: tema de ruínas/construtos antigos — Discovery e
//   Treasure médios.
// - Ruínas Esquecidas: "Discovery alto, Treasure alto" (exemplo
//   literal) — o bioma mais rico em vestígios do passado.
// - Fortaleza Sombria: `chance` bem mais baixa que as demais (bioma
//   final, foco no Boss, não em conteúdo exploratório) — quando
//   acontece, majoritariamente Ambush (fortaleza hostil).
export const EXPLORATION_EVENT_TABLES: ExplorationEventTable[] = [
  {
    regionId: "bosque-sussurrante",
    chance: 0.08,
    entries: [
      { eventId: "abandoned-chest", weight: 40 },
      { eventId: "destroyed-cart", weight: 30 },
      { eventId: "lost-merchant", weight: 25 },
      { eventId: "traveler", weight: 15 },
      { eventId: "trade-camp", weight: 10 },
      { eventId: "ancient-altar", weight: 20 },
      { eventId: "sacred-fountain", weight: 10 },
      { eventId: "ambush", weight: 10 },
      { eventId: "hunters", weight: 8 },
      { eventId: "lost-diary", weight: 8 },
    ],
  },
  {
    regionId: "pantano-podre",
    chance: 0.08,
    entries: [
      { eventId: "ambush", weight: 40 },
      { eventId: "hunters", weight: 30 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "lost-merchant", weight: 15 },
      { eventId: "ancient-altar", weight: 8 },
      { eventId: "lost-diary", weight: 10 },
    ],
  },
  {
    regionId: "colinas-aridas",
    chance: 0.07,
    entries: [
      { eventId: "lost-merchant", weight: 30 },
      { eventId: "traveler", weight: 25 },
      { eventId: "trade-camp", weight: 20 },
      { eventId: "destroyed-cart", weight: 15 },
      { eventId: "abandoned-chest", weight: 10 },
      { eventId: "hostile-patrol", weight: 20 },
      { eventId: "ambush", weight: 15 },
      { eventId: "lost-diary", weight: 8 },
    ],
  },
  {
    regionId: "minas-abandonadas",
    chance: 0.07,
    entries: [
      { eventId: "ancient-ruins", weight: 25 },
      { eventId: "monument", weight: 15 },
      { eventId: "lost-diary", weight: 15 },
      { eventId: "forgotten-treasure", weight: 20 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "trade-camp", weight: 10 },
      { eventId: "rune-stone", weight: 10 },
      { eventId: "hostile-patrol", weight: 10 },
    ],
  },
  {
    regionId: "ruinas-esquecidas",
    chance: 0.09,
    entries: [
      { eventId: "ancient-ruins", weight: 35 },
      { eventId: "monument", weight: 20 },
      { eventId: "lost-diary", weight: 15 },
      { eventId: "forgotten-treasure", weight: 30 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "sacred-fountain", weight: 15 },
      { eventId: "rune-stone", weight: 15 },
    ],
  },
  {
    regionId: "fortaleza-sombria",
    chance: 0.04,
    entries: [
      { eventId: "hostile-patrol", weight: 30 },
      { eventId: "forgotten-treasure", weight: 15 },
      { eventId: "rune-stone", weight: 10 },
      { eventId: "monument", weight: 10 },
      { eventId: "ancient-altar", weight: 10 },
    ],
  },
];

export function getExplorationEventTable(regionId: string): ExplorationEventTable | undefined {
  return EXPLORATION_EVENT_TABLES.find((table) => table.regionId === regionId);
}
