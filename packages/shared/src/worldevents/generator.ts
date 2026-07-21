import type { ItemGenRandom } from "../itemgen/rng.js";
import { pickWeighted } from "../itemgen/rng.js";
import { getExplorationEventDefinition } from "./worldEventDefinitions.js";
import type { ExplorationEventDefinition, ExplorationEventTable } from "./types.js";

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// arquitetural: "aproveitar o Encounter Generator... eventos do mundo
// são apenas mais um tipo de encontro." Esta função NUNCA é chamada
// diretamente por nada além de worldencounter/generator.ts (o único
// lugar que rola a seed determinística de um tick) — recebe um rng JÁ
// criado (continua o MESMO stream, nunca cria um novo), exatamente como
// `resolveGroupLevel()`/`pickWeighted()` já fazem ali dentro.
//
// Determinístico: mesmo rng (mesmo estado) + mesma tabela sempre
// produzem o mesmo resultado — dois sorteios INDEPENDENTES ("acontece
// um evento?" e "qual evento?"), mesmo princípio de "chance de dropar
// item" x "qual item" do Loot Generator.
export function selectExplorationEvent(rng: ItemGenRandom, table: ExplorationEventTable): ExplorationEventDefinition | null {
  const triggered = rng() < table.chance;
  if (!triggered) return null;

  const entry = pickWeighted(rng, table.entries);
  const definition = getExplorationEventDefinition(entry.eventId);
  if (!definition) {
    throw new Error(`World Events: evento desconhecido "${entry.eventId}" (tabela da região "${table.regionId}")`);
  }
  return definition;
}
