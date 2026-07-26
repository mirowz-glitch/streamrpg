import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateItem } from "../src/itemgen/generator.js";
import { getBaseItem } from "../src/itemgen/baseItems.js";
import { calculateCharacterStats } from "../src/equipment/stats.js";
import type { ItemGenGeneratedItem } from "../src/itemgen/types.js";
import type { Equipment } from "../src/equipment/equipment.js";
import type { EquipmentSlotState } from "../src/equipment/types.js";

// Equipment Decision Model — Design Review Phase I — Sprint
// exclusivamente investigativa. NENHUM arquivo de src/ é alterado.
// `tryAutoEquip()` (adventure/autoEquip.ts, lido mas nunca importado
// pra execução real aqui) compara `item.powerScore` (itemgen/
// powerScore.ts: soma bruta de baseDamage/baseDefense + TODOS os
// valores de mod rolados, sem normalização por tipo) — este script
// reconstrói essa MESMA fórmula (não a importa, porque ela é 1 linha
// dentro de generator.ts, não exportada) e testa alternativas, usando
// SEMPRE generateItem() real (intocado) como fonte dos itens.
//
// `realStatContribution()` abaixo reaproveita `calculateCharacterStats()`
// (equipment/stats.ts, intocado) via um Equipment "fake" de 1 slot só —
// a MESMA função que o jogo usa pra agregar stats reais de combate a
// partir de um item, não uma reimplementação paralela.

function fakeEquipmentWithOneItem(item: ItemGenGeneratedItem, slotId: string): Equipment {
  const slots: EquipmentSlotState[] = [{ slotId, instanceId: "debug", item }];
  return { items: slots } as unknown as Equipment;
}

interface RealStats {
  attack: number;
  spellDamage: number;
  critical: number;
  accuracy: number;
  attackSpeed: number;
  lifeLeech: number;
  life: number;
  defense: number;
  powerScore: number;
}

function realStatContribution(item: ItemGenGeneratedItem, slotId: string): RealStats {
  const stats = calculateCharacterStats(fakeEquipmentWithOneItem(item, slotId));
  return {
    attack: stats.attack,
    spellDamage: stats.spellDamage,
    critical: stats.critical,
    accuracy: stats.accuracy,
    attackSpeed: stats.attackSpeed,
    lifeLeech: stats.lifeLeech,
    life: stats.life,
    defense: stats.defense,
    powerScore: stats.powerScore,
  };
}

// FASE 4 — 5 comparadores experimentais (nenhum implementado em
// produção). Todos recebem os RealStats de dois itens candidatos pro
// MESMO slot e devolvem true se `candidate` deveria substituir
// `current` (0 = slot vazio).
type Comparator = (candidate: RealStats, current: RealStats | null) => boolean;

// A) Atual — exatamente tryAutoEquip(): compara item.powerScore bruto.
const currentComparator: Comparator = (candidate, current) => candidate.powerScore > (current?.powerScore ?? 0);

// B) DPS-aware — dano combinado x (1 + attackSpeed), o MESMO
// `estimateDps()` já usado nas 4 auditorias anteriores desta série,
// aplicado à contribuição do item isolado (proxy direcional: DPS real
// depende do build inteiro, não só de um item — mas o objetivo aqui é
// comparar dois CANDIDATOS pro mesmo slot, onde essa simplificação é
// justa pros dois lados).
function dpsProxy(s: RealStats): number {
  return (s.attack + s.spellDamage) * (1 + s.attackSpeed / 100);
}
const dpsComparator: Comparator = (candidate, current) => dpsProxy(candidate) > dpsProxy(current ?? ({ attack: 0, spellDamage: 0, attackSpeed: 0 } as RealStats));

// C) Sobrevivência — vida + defesa (peso maior pra defesa, cada ponto
// de armadura reduz dano recebido proporcionalmente mais que 1 ponto
// de vida bruta num modelo de mitigação percentual simples).
function survivalProxy(s: RealStats): number {
  return s.life + s.defense * 2;
}
const survivalComparator: Comparator = (candidate, current) => survivalProxy(candidate) > survivalProxy(current ?? ({ life: 0, defense: 0 } as RealStats));

// D) Atributo dominante — olha só pro stat com a MAIOR diferença
// absoluta entre candidato e atual (o "melhor argumento a favor" de
// qualquer um dos dois lados), ignora todo o resto.
const STAT_KEYS: (keyof RealStats)[] = ["attack", "spellDamage", "critical", "accuracy", "attackSpeed", "lifeLeech", "life", "defense"];
const dominantComparator: Comparator = (candidate, current) => {
  const zero: RealStats = { attack: 0, spellDamage: 0, critical: 0, accuracy: 0, attackSpeed: 0, lifeLeech: 0, life: 0, defense: 0, powerScore: 0 };
  const base = current ?? zero;
  let bestKey: keyof RealStats = "powerScore";
  let bestDelta = -Infinity;
  for (const key of STAT_KEYS) {
    const delta = Math.abs(candidate[key] - base[key]);
    if (delta > bestDelta) {
      bestDelta = delta;
      bestKey = key;
    }
  }
  return candidate[bestKey] > base[bestKey];
};

// E) Ponderado — pesos ILUSTRATIVOS (mesma convenção de todo o resto
// do Item Generator: não calibrados), refletindo só a ORDEM DE
// GRANDEZA de impacto real por ponto (1 Critical Strike Chance ou 1
// Attack Speed valem muito mais, por ponto, que 1 de Vida/Defesa — ver
// Seção 2 do relatório) — não uma fórmula de balanceamento final.
const WEIGHTS: Record<keyof Omit<RealStats, "powerScore">, number> = {
  attack: 1,
  spellDamage: 1,
  critical: 15,
  accuracy: 0.3,
  attackSpeed: 15,
  lifeLeech: 20,
  life: 1,
  defense: 1.5,
};
function weightedProxy(s: RealStats): number {
  let total = 0;
  for (const [key, weight] of Object.entries(WEIGHTS) as [keyof typeof WEIGHTS, number][]) total += s[key] * weight;
  return total;
}
const EMPTY_STATS: RealStats = { attack: 0, spellDamage: 0, critical: 0, accuracy: 0, attackSpeed: 0, lifeLeech: 0, life: 0, defense: 0, powerScore: 0 };
const weightedComparator: Comparator = (candidate, current) => weightedProxy(candidate) > weightedProxy(current ?? EMPTY_STATS);

const COMPARATORS: { id: string; fn: Comparator }[] = [
  { id: "current_powerScore", fn: currentComparator },
  { id: "dps_aware", fn: dpsComparator },
  { id: "survival", fn: survivalComparator },
  { id: "dominant_attribute", fn: dominantComparator },
  { id: "weighted_composite", fn: weightedComparator },
];

// ---------- FASE 3/6 — milhares de comparações reais, por slot ----------
const SLOT_BASE_ITEMS: { slotId: string; baseItemId: string }[] = [
  { slotId: "weapon", baseItemId: "sword" },
  { slotId: "helmet", baseItemId: "helmet" },
  { slotId: "chest", baseItemId: "chest" },
  { slotId: "gloves", baseItemId: "gloves" },
  { slotId: "boots", baseItemId: "boots" },
  { slotId: "ring1", baseItemId: "ring" },
  { slotId: "amulet", baseItemId: "amulet" },
  { slotId: "belt", baseItemId: "belt" },
];

const N_PAIRS_PER_SLOT = 4000;
// Item Level realista: 1-65, mesma escala do Region-Anchored Item
// Level (Sprint anterior) — sorteado por par, não fixo, pra cobrir a
// faixa inteira que o jogo real produz.
function randomItemLevel(seed: number): number {
  // LCG simples só pra escolher o Item Level de teste — não é o RNG
  // do Item Generator (esse é sempre criado dentro de generateItem()).
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return 1 + Math.floor((x - Math.floor(x)) * 65);
}

interface FalseNegative {
  slotId: string;
  itemLevel: number;
  currentPowerScore: number;
  candidatePowerScore: number;
  powerScoreDelta: number;
  acceptedBy: string[];
  dominantStatDiffering: string;
}

const falseNegatives: FalseNegative[] = [];
const slotStats: Record<string, { totalPairs: number; acceptedBy: Record<string, number> }> = {};
const runningMaxByComparator: Record<string, { region: string; accepted: number; total: number }[]> = {};

for (const comparator of COMPARATORS) runningMaxByComparator[comparator.id] = [];

for (const { slotId, baseItemId } of SLOT_BASE_ITEMS) {
  slotStats[slotId] = { totalPairs: N_PAIRS_PER_SLOT, acceptedBy: {} };
  for (const c of COMPARATORS) slotStats[slotId].acceptedBy[c.id] = 0;

  for (let i = 0; i < N_PAIRS_PER_SLOT; i++) {
    const itemLevel = randomItemLevel(i * 7 + slotId.length);
    const currentItem = generateItem(baseItemId, itemLevel, i * 1000 + 1);
    const candidateItem = generateItem(baseItemId, itemLevel, i * 1000 + 2);

    const currentStats = realStatContribution(currentItem, slotId);
    const candidateStats = realStatContribution(candidateItem, slotId);

    const acceptedBy: string[] = [];
    for (const comparator of COMPARATORS) {
      const accepted = comparator.fn(candidateStats, currentStats);
      if (accepted) {
        acceptedBy.push(comparator.id);
        slotStats[slotId].acceptedBy[comparator.id]++;
      }
    }

    // FASE 3 — Falso Negativo: o comparador ATUAL rejeita, mas pelo
    // menos 1 alternativa aceitaria.
    if (!acceptedBy.includes("current_powerScore") && acceptedBy.length > 0) {
      const zero: RealStats = { attack: 0, spellDamage: 0, critical: 0, accuracy: 0, attackSpeed: 0, lifeLeech: 0, life: 0, defense: 0, powerScore: 0 };
      let bestKey: keyof RealStats = "powerScore";
      let bestDelta = -Infinity;
      for (const key of STAT_KEYS) {
        const delta = Math.abs(candidateStats[key] - (currentStats[key] ?? zero[key]));
        if (delta > bestDelta) {
          bestDelta = delta;
          bestKey = key;
        }
      }
      falseNegatives.push({
        slotId,
        itemLevel,
        currentPowerScore: currentStats.powerScore,
        candidatePowerScore: candidateStats.powerScore,
        powerScoreDelta: candidateStats.powerScore - currentStats.powerScore,
        acceptedBy,
        dominantStatDiffering: bestKey,
      });
    }
  }
}

// ---------- FASE 5 — Running Maximum do PRÓPRIO comparador ----------
// Mesma metodologia das Sprints anteriores (running max por região),
// mas agora a variável testada é o COMPARADOR, não o gerador: mesma
// sequência de itens gerados (Arma, nível crescente por região), 5
// comparadores diferentes, medindo a taxa de aceitação de cada um.
const REGIONS_FOR_RUNNING_MAX = [
  { region: "bosque-sussurrante", itemLevel: 1 },
  { region: "pantano-podre", itemLevel: 9 },
  { region: "colinas-aridas", itemLevel: 17 },
  { region: "minas-abandonadas", itemLevel: 25 },
  { region: "picos-congelados", itemLevel: 33 },
  { region: "litoral-quebrado", itemLevel: 41 },
  { region: "deserto-de-vidro", itemLevel: 49 },
  { region: "ruinas-esquecidas", itemLevel: 57 },
  { region: "fortaleza-sombria", itemLevel: 65 },
];
const N_SAMPLES_PER_REGION = 3000;

for (const comparator of COMPARATORS) {
  let runningBest: RealStats | null = null;
  for (const { region, itemLevel } of REGIONS_FOR_RUNNING_MAX) {
    let accepted = 0;
    for (let i = 0; i < N_SAMPLES_PER_REGION; i++) {
      const item = generateItem("sword", itemLevel, region.length * 1000 + i);
      const stats = realStatContribution(item, "weapon");
      if (comparator.fn(stats, runningBest)) accepted++;
    }
    // Atualiza o runningBest com o MELHOR item já visto nesta região
    // (segundo o PRÓPRIO comparador, pra medir cada um isoladamente).
    for (let i = 0; i < N_SAMPLES_PER_REGION; i++) {
      const item = generateItem("sword", itemLevel, region.length * 1000 + i);
      const stats = realStatContribution(item, "weapon");
      if (comparator.fn(stats, runningBest)) runningBest = stats;
    }
    runningMaxByComparator[comparator.id].push({ region, accepted, total: N_SAMPLES_PER_REGION });
  }
}

// ---------- FASE 7 — Opportunity Cost ----------
// Soma, entre os Falsos Negativos, quanto DPS/Power Score "real" (pelo
// comparador Ponderado, o mais completo) foi perdido por rejeições do
// comparador atual.
let lostPowerScore = 0;
let lostDpsProxy = 0;
let lostCount = 0;
for (const fn of falseNegatives) {
  if (fn.acceptedBy.includes("weighted_composite") || fn.acceptedBy.includes("dps_aware")) {
    lostPowerScore += Math.max(0, -fn.powerScoreDelta) + Math.max(0, fn.powerScoreDelta); // magnitude, não sinal
    lostCount++;
  }
}

// ---------- Agregação por stat dominante (Fase 3, classificação) ----------
const falseNegativesByStat: Record<string, number> = {};
for (const fn of falseNegatives) falseNegativesByStat[fn.dominantStatDiffering] = (falseNegativesByStat[fn.dominantStatDiffering] ?? 0) + 1;

const falseNegativesBySlot: Record<string, number> = {};
for (const fn of falseNegatives) falseNegativesBySlot[fn.slotId] = (falseNegativesBySlot[fn.slotId] ?? 0) + 1;

const report = {
  methodology: {
    pairsPerSlot: N_PAIRS_PER_SLOT,
    slotsTested: SLOT_BASE_ITEMS.map((s) => s.slotId),
    samplesPerRegionForRunningMax: N_SAMPLES_PER_REGION,
  },
  fase6_slotAnalysis: Object.entries(slotStats).map(([slotId, s]) => ({
    slotId,
    totalPairs: s.totalPairs,
    acceptanceRateByComparator: Object.fromEntries(Object.entries(s.acceptedBy).map(([id, count]) => [id, count / s.totalPairs])),
  })),
  fase3_falseNegatives: {
    totalFalseNegatives: falseNegatives.length,
    totalPairsTested: N_PAIRS_PER_SLOT * SLOT_BASE_ITEMS.length,
    falseNegativeRate: falseNegatives.length / (N_PAIRS_PER_SLOT * SLOT_BASE_ITEMS.length),
    byDominantStat: falseNegativesByStat,
    bySlot: falseNegativesBySlot,
    sampleCases: falseNegatives.slice(0, 10),
  },
  fase5_runningMaximum: runningMaxByComparator,
  fase7_opportunityCost: {
    falseNegativesWithRealValue: lostCount,
    totalPowerScoreMagnitudeInvolved: lostPowerScore,
  },
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "equipment-decision-model-review.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "equipment-decision-model-review.json")}`);
console.log(
  JSON.stringify(
    {
      fase3_falseNegatives_summary: {
        totalFalseNegatives: report.fase3_falseNegatives.totalFalseNegatives,
        falseNegativeRate: report.fase3_falseNegatives.falseNegativeRate,
        byDominantStat: report.fase3_falseNegatives.byDominantStat,
        bySlot: report.fase3_falseNegatives.bySlot,
      },
      fase6_slotAnalysis: report.fase6_slotAnalysis,
    },
    null,
    2,
  ),
);
