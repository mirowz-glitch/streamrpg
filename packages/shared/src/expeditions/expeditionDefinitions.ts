import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import type { ExpeditionDefinition } from "./types.js";

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 1: uma definição por região com Encounter Table real (as
// mesmas 6 já usadas por worldencounter/encounterTables.ts/biomes.ts —
// nenhuma região nova inventada). `expectedEncounters`/`checkpointCount`
// crescem com a dificuldade da região (mesma progressão de poder já
// usada pelos Enemy Templates/Encounter Tables) — valores ilustrativos,
// não calibrados (mesma convenção de sempre), verificados empiricamente
// pelo Simulador (requisito 9/10) antes da entrega.
export const EXPEDITION_DEFINITIONS: ExpeditionDefinition[] = [
  {
    id: "bosque-antigo",
    name: "Bosque Antigo",
    description: "Uma travessia guiada pelas trilhas mais antigas do Bosque Sussurrante.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante"],
    expectedEncounters: 12,
    expectedSeconds: 264,
    checkpointCount: 3,
    reward: { xpAmount: 200, goldAmount: 50 },
    difficulty: "Baixa",
  },
  {
    id: "travessia-do-pantano",
    name: "Travessia do Pântano",
    description: "Atravessar o Pântano Podre de ponta a ponta, sem se perder na neblina.",
    startBiome: "pantano-podre",
    allowedBiomes: ["pantano-podre"],
    expectedEncounters: 14,
    expectedSeconds: 308,
    checkpointCount: 3,
    reward: { xpAmount: 260, goldAmount: 60 },
    difficulty: "Baixa",
  },
  {
    id: "rota-das-colinas",
    name: "Rota das Colinas",
    description: "Uma rota comercial perigosa através das Colinas Áridas.",
    startBiome: "colinas-aridas",
    allowedBiomes: ["colinas-aridas"],
    expectedEncounters: 18,
    expectedSeconds: 396,
    checkpointCount: 3,
    reward: { xpAmount: 450, goldAmount: 120 },
    difficulty: "Média",
  },
  {
    id: "descida-as-minas",
    name: "Descida às Minas",
    description: "Descer fundo nas Minas Abandonadas, entre os construtos de pedra.",
    startBiome: "minas-abandonadas",
    allowedBiomes: ["minas-abandonadas"],
    expectedEncounters: 16,
    expectedSeconds: 352,
    checkpointCount: 3,
    reward: { xpAmount: 400, goldAmount: 100 },
    difficulty: "Média",
  },
  {
    id: "exploracao-das-ruinas",
    name: "Exploração das Ruínas",
    description: "Uma expedição longa pelas Ruínas Esquecidas, em busca do que restou do passado.",
    startBiome: "ruinas-esquecidas",
    allowedBiomes: ["ruinas-esquecidas"],
    expectedEncounters: 20,
    expectedSeconds: 440,
    checkpointCount: 4,
    reward: { xpAmount: 600, goldAmount: 160 },
    difficulty: "Alta",
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 1: "Dungeon deve ser apenas uma ExpeditionDefinition" — a primeira
  // Dungeon completa, atravessando os 6 biomas conhecidos (Bosque
  // Sussurrante -> Colinas Áridas -> Pântano Podre -> Minas Abandonadas
  // -> Ruínas Esquecidas -> Fortaleza Sombria, mesma ORDEM de
  // BIOME_PROGRESSION, worldencounter/biomes.ts) via a MESMA travessia
  // automática por nível que já existe (Region Unlock, Objective
  // System — intocado, só reaproveitado). `expectedEncounters` bem
  // maior que qualquer Expedição regional isolada (soma aproximada dos
  // 6 biomas) — calibrado empiricamente via Simulador (requisito 10)
  // pra terminar POUCO depois do Chefe Final normalmente aparecer
  // (Ruínas Esquecidas, penúltimo bioma). `guaranteedLootTableId`
  // finalmente LÊ o Future Hook preparado desde a Sprint de Expedições
  // (expeditions/types.ts: ExpeditionReward.guaranteedLootTableId,
  // nunca lido por nenhuma lógica real até agora) — aponta pra
  // "final-boss-relic" (lootgen/lootTables.ts), mas quem efetivamente
  // concede o item é dungeon/dungeonController.ts (na derrota do Chefe,
  // não na conclusão da Expedição — ver nota lá).
  {
    id: "queda-da-fortaleza-sombria",
    name: "Queda da Fortaleza Sombria",
    description:
      "A primeira Dungeon completa do reino: atravesse todos os biomas conhecidos até enfrentar o Guardião Esquecido, o Chefe Final que guarda o caminho para a Fortaleza Sombria.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas", "pantano-podre", "minas-abandonadas", "ruinas-esquecidas", "fortaleza-sombria"],
    // Calibrado empiricamente via Simulador (requisito 10, várias
    // iterações): a 1ª tentativa (80 encontros) completava o
    // ORÇAMENTO da Expedição ENQUANTO o personagem ainda estava preso
    // em bosque-sussurrante (nível ~10) — Region Unlock (nível-driven,
    // intocado) simplesmente não anda rápido o bastante pra travessia
    // completa nesse número de encontros. Medido: alcançar Ruínas
    // Esquecidas (onde o Chefe Final vive) exige ~150-160 encontros
    // reais desde o nível 1. `expectedEncounters: 220` dá folga
    // suficiente pra chegar lá, encontrar o Guardião Esquecido
    // (variantChances.miniBoss recalibrado pra 0.08 em Ruínas
    // Esquecidas) e concluir a Expedição LOGO DEPOIS de derrotá-lo —
    // nunca exigindo que o personagem sobreviva até Fortaleza Sombria
    // (cujo EnemyTemplate "boss" é calibrado pra um nível muito mais
    // alto, ver worldencounter/encounterTables.ts).
    expectedEncounters: 220,
    expectedSeconds: 4840,
    // Balance, Pacing & Player Experience Phase I — Fase 3 (Dungeon):
    // "distância entre checkpoints." Diagnóstico (before-dungeon-report.md,
    // 100 execuções): 68% de taxa de morte na Dungeon inteira, a grande
    // maioria (49% das 100 execuções) morrendo ainda dentro de
    // bosque-sussurrante — a jornada de ~150-160 encontros até Ruínas
    // Esquecidas (ver nota acima) é longa demais pro espaçamento de
    // ~5.5 encontros/checkpoint (39 checkpoints) segurar a taxa de
    // morte. Apertado pra ~4 encontros/checkpoint (mesmo patamar de
    // "rota-das-colinas" 18/4=4.5 e "exploracao-das-ruinas" 20/5=4) —
    // dobra a quantidade de curas de checkpoint (Recovery Layer
    // reaproveitada, CHECKPOINT_RECOVERY_MULTIPLIER intocado) ao longo
    // da MESMA jornada de 220 encontros, sem alterar nenhuma lógica.
    // Não reduzido `expectedEncounters` abaixo do alvo de 40-70 desta
    // Sprint: medido que alcançar Ruínas Esquecidas exige ~150-160
    // encontros reais a partir do nível 1 (Region Unlock, nível-driven,
    // fora do escopo desta Sprint) — comprimir a jornada pra 40-70
    // encontros exigiria pular biomas inteiros da "primeira Dungeon
    // completa do reino" (contradizendo sua própria definição) ou
    // alterar o ritmo de nivelamento (Character Build/Combat Engine,
    // ambos protegidos nesta Sprint). Mantido 220 com justificativa
    // técnica explícita, conforme permitido pelo briefing ("não manter
    // 220 apenas por consistência... adotar o valor mais adequado").
    checkpointCount: 54,
    // Fase 3 (Boss): "loot; XP" — únicos ganchos ainda editáveis pra
    // recompensa do Chefe nesta Sprint (FINAL_BOSS_XP_REWARD/GOLD_REWARD
    // em dungeon/dungeonController.ts foram congelados). Aumentado
    // (1500->2200 XP, 400->600 ouro) em resposta direta à recomendação
    // automática "recompensa desproporcional ao risco" (Chefe com taxa
    // de vitória de 0% na linha de base).
    reward: { xpAmount: 2200, goldAmount: 600, guaranteedLootTableId: "final-boss-relic" },
    difficulty: "Lendária",
  },
];

export function getExpeditionDefinition(id: string): ExpeditionDefinition | undefined {
  return EXPEDITION_DEFINITIONS.find((definition) => definition.id === id);
}

// Requisito 1/2 — "sem intervenção da UI": seleciona automaticamente
// entre as definições cujo `startBiome` é a região atual do jogador —
// mesmo princípio de selectObjectiveId() (Objective System), nunca
// Math.random. `null` quando não há nenhuma definição pra esta região
// (região sem Expedição ainda — dado que falta, não lógica que falta).
export function selectExpeditionDefinitionId(seed: number, currentRegionId: string): string | null {
  const candidates = EXPEDITION_DEFINITIONS.filter((definition) => definition.startBiome === currentRegionId);
  if (candidates.length === 0) return null;
  const rng = createSeededRandom(seed);
  const index = randomInt(rng, 0, candidates.length - 1);
  return candidates[index].id;
}
