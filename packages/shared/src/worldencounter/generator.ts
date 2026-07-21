import { createSeededRandom, pickWeighted, randomInt } from "../itemgen/rng.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { getEncounterTable } from "./encounterTables.js";
import { getExplorationEventTable } from "../worldevents/worldEventTables.js";
import { selectExplorationEvent } from "../worldevents/generator.js";
import { WORLD_ENCOUNTER_CONFIG } from "./config.js";
import type { EncounterGroupResult, EncounterResult, EncounterTable, EncounterVariant } from "./types.js";

// Requisito 3 — Level Scaling: o nível de um grupo respeita a
// interseção de 3 faixas — "Faixa da região" (table.levelRange),
// "Faixa do template" (template.levelRange, Enemy System) e o
// "Nível do jogador" (playerLevel, com uma pequena variação
// centralizada em config.ts) — nunca só uma das três.
function resolveGroupLevel(
  rng: ReturnType<typeof createSeededRandom>,
  playerLevel: number,
  regionMin: number,
  regionMax: number,
  entryMin: number,
  entryMax: number,
  templateMin: number,
  templateMax: number,
): number {
  const min = Math.max(regionMin, entryMin, templateMin);
  const max = Math.min(regionMax, entryMax, templateMax);
  if (min > max) {
    throw new Error(
      `World Encounter: faixas de nível incompatíveis (região [${regionMin}-${regionMax}], entry [${entryMin}-${entryMax}], template [${templateMin}-${templateMax}]) não se sobrepõem`,
    );
  }
  const raw = playerLevel + randomInt(rng, -WORLD_ENCOUNTER_CONFIG.levelVariance, WORLD_ENCOUNTER_CONFIG.levelVariance);
  return Math.min(max, Math.max(min, raw));
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 3: a
// "regra de seleção" que decide Normal/Elite/MiniBoss, ANTES de montar
// os grupos. Mesmo `pickWeighted()` já usado pra packSizeOptions/
// entries — nenhum sorteio novo inventado, só mais uma rolagem na
// MESMA técnica.
function rollVariant(rng: ReturnType<typeof createSeededRandom>, table: EncounterTable): EncounterVariant {
  const options = [
    { variant: "normal" as const, weight: Math.max(0, 1 - table.variantChances.elite - table.variantChances.miniBoss) },
    { variant: "elite" as const, weight: table.variantChances.elite },
    { variant: "miniboss" as const, weight: table.variantChances.miniBoss },
  ];
  return pickWeighted(rng, options).variant;
}

// Requisito 4 — Enemy Groups: quantos entries DISTINTOS da tabela
// compõem este encontro (1 slot = só um tipo de inimigo; 2+ slots =
// composição, ex.: "2 Goblins + 1 Bandit"). Algoritmo original,
// intocado — extraído aqui pra função própria só pra World Events
// (categoria "Ambush", requisito 2: "reutilizar Encounter normal")
// conseguir chamar EXATAMENTE o mesmo código, sem duplicar nada.
function buildNormalGroups(rng: ReturnType<typeof createSeededRandom>, table: EncounterTable, playerLevel: number, regionId: string): EncounterGroupResult[] {
  const packSlots = pickWeighted(rng, table.packSizeOptions).slots;

  const groups: EncounterGroupResult[] = [];
  for (let slot = 0; slot < packSlots; slot++) {
    const entry = pickWeighted(rng, table.entries);
    const template = getEnemyTemplate(entry.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${entry.enemyTemplateId}" (região "${regionId}")`);
    }

    const count = randomInt(rng, entry.minimumGroup, entry.maximumGroup);
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      entry.minimumLevel,
      entry.maximumLevel,
      template.levelRange.min,
      template.levelRange.max,
    );

    // Requisito 5 — instanceSeeds já pré-rolados aqui, determinísticos,
    // um por membro do grupo: spawnWorldEncounter() só consome, nunca
    // precisa de RNG própria pra decidir a seed de cada inimigo.
    const instanceSeeds: number[] = [];
    for (let i = 0; i < count; i++) {
      instanceSeeds.push(randomInt(rng, 0, 2_147_483_647));
    }

    groups.push({ enemyTemplateId: entry.enemyTemplateId, level, count, instanceSeeds });
  }

  return groups;
}

// Pipeline completo (requisitos 1-4):
//
//   Region -> Encounter Table -> Encounter Generator -> Enemy Template
//
// "Retorna: Enemy Templates, Quantidade, Nível" — a RECEITA do
// encontro (EncounterResult), ainda sem nenhum EnemyInstance criado
// (requisito 5: quem cria é spawnWorldEncounter(), em spawn.ts, nunca
// esta função).
//
// Determinístico: mesmo (regionId, playerLevel, seed) sempre produz o
// mesmo EncounterResult, incluindo os `instanceSeeds` de cada grupo —
// nenhuma chamada a Math.random ou Date.now.
//
// Data-driven (requisito 7): nenhum `if (regionId === "...")` — tudo
// vem de ENCOUNTER_TABLES. Adicionar uma região ou um encontro novo é
// só inserir dado em encounterTables.ts.
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito arquitetural:
// "Reutilizar integralmente o World Encounter. Adicionar apenas dados
// e regras de seleção... nenhuma nova camada arquitetural." O ramo
// "normal" abaixo é EXATAMENTE o algoritmo original, sem nenhuma
// mudança de comportamento; "elite"/"miniboss" são dois ramos NOVOS,
// mas ainda dentro desta MESMA função — nenhum wrapper externo.
//
// World Events, Dynamic Encounters & Exploration Phase I — requisito
// arquitetural: "eventos do mundo são apenas mais um tipo de encontro.
// Aproveitar o Encounter Generator... nenhuma nova camada
// arquitetural." A rolagem de World Event acontece PRIMEIRO (antes de
// Normal/Elite/MiniBoss) — se disparar, o resultado nem chega a rolar
// variant: as 4 categorias sem combate (treasure/merchant/shrine/
// discovery) devolvem `groups: []` (zero inimigos — Adventure Loop
// resolve isso sozinho, sem nenhuma mudança nele: um encontro com zero
// inimigos já satisfaz "todos os inimigos morreram" trivialmente, ver
// adventureLoop.ts, nunca alterado); "ambush" é a única categoria que
// continua até `buildNormalGroups()` (mesmo algoritmo de sempre,
// requisito 2: "reutilizar Encounter normal"), só carregando
// `explorationEventId` por cima pra Presentation saber que esta luta é uma
// Emboscada.
export function generateEncounter(regionId: string, playerLevel: number, seed: number): EncounterResult {
  const table = getEncounterTable(regionId);
  if (!table) {
    throw new Error(`World Encounter: região sem Encounter Table "${regionId}"`);
  }

  const rng = createSeededRandom(seed);

  const explorationEventTable = getExplorationEventTable(regionId);
  const explorationEvent = explorationEventTable ? selectExplorationEvent(rng, explorationEventTable) : null;

  if (explorationEvent) {
    if (explorationEvent.category === "ambush") {
      const groups = buildNormalGroups(rng, table, playerLevel, regionId);
      return { regionId, seed, groups, variant: "normal", explorationEventId: explorationEvent.id };
    }
    return { regionId, seed, groups: [], variant: "normal", explorationEventId: explorationEvent.id };
  }

  const variant = rollVariant(rng, table);

  // Requisito 2 — Mini-Boss: "não é um Template novo de sistema, é
  // apenas um Enemy Template especial" — um único grupo de 1, o mesmo
  // pipeline de nível de qualquer outro grupo, só que fixado no
  // template do bioma.
  if (variant === "miniboss") {
    const template = getEnemyTemplate(table.miniBossTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template de Mini-Boss desconhecido "${table.miniBossTemplateId}" (região "${regionId}")`);
    }
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      template.levelRange.min,
      template.levelRange.max,
      template.levelRange.min,
      template.levelRange.max,
    );
    const instanceSeeds = [randomInt(rng, 0, 2_147_483_647)];
    return {
      regionId,
      seed,
      groups: [{ enemyTemplateId: table.miniBossTemplateId, level, count: 1, instanceSeeds }],
      variant,
    };
  }

  // Requisito 1 — Elite: um MODIFICADOR sobre um inimigo normal já
  // existente no pool da região (não um Template novo) — sorteado do
  // mesmo `table.entries`, mas sempre sozinho (count=1, nunca em
  // grupo), pra o multiplicador de stats (aplicado em spawn.ts) valer
  // pra um único inimigo perigoso, não pra um grupo inteiro.
  if (variant === "elite") {
    const entry = pickWeighted(rng, table.entries);
    const template = getEnemyTemplate(entry.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${entry.enemyTemplateId}" (região "${regionId}")`);
    }
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      entry.minimumLevel,
      entry.maximumLevel,
      template.levelRange.min,
      template.levelRange.max,
    );
    const instanceSeeds = [randomInt(rng, 0, 2_147_483_647)];
    return {
      regionId,
      seed,
      groups: [{ enemyTemplateId: entry.enemyTemplateId, level, count: 1, instanceSeeds }],
      variant,
    };
  }

  return { regionId, seed, groups: buildNormalGroups(rng, table, playerLevel, regionId), variant };
}
