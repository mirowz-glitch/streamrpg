import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import type { ObjectiveDefinition } from "./types.js";

// Requisito 2 — Objetivos Data Driven: uma lista só, nenhum switch
// gigante em lugar nenhum decidindo comportamento por id. Valores de
// `target`/`reward.xpBonus` calibrados empiricamente via o Simulador
// (packages/shared/src/simulation/) contra o requisito 10 ("primeiro
// objetivo concluído em menos de 2 minutos, nenhum objetivo
// impossível") — ver simulation/simulation.test.ts e o relatório
// gerado por scripts/runBalanceSimulation.ts.
export const OBJECTIVE_DEFINITIONS: ObjectiveDefinition[] = [
  {
    id: "kill-5",
    name: "Primeira Caçada",
    description: "Derrote 5 inimigos",
    type: "kill",
    target: 5,
    reward: { xpBonus: 30 },
    soundId: "objective-complete-minor",
  },
  {
    id: "kill-12",
    name: "Caçador Experiente",
    description: "Derrote 12 inimigos",
    type: "kill",
    target: 12,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor",
  },
  {
    id: "survive-5-encounters",
    name: "Persistência",
    description: "Sobreviva a 5 encontros",
    type: "survival",
    target: 5,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor",
  },
  {
    id: "reach-level-2",
    name: "Primeiros Passos",
    description: "Alcance o nível 2",
    type: "level",
    target: 2,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-major",
  },
  {
    id: "reach-level-3",
    name: "Ascensão",
    description: "Alcance o nível 3",
    type: "level",
    target: 3,
    reward: { xpBonus: 70 },
    soundId: "objective-complete-major",
  },
  {
    id: "find-magic-item",
    name: "Tesouro Raro",
    description: "Encontre um item Mágico (ou melhor)",
    type: "loot",
    target: 1,
    targetRarity: "magic",
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor",
  },
  {
    id: "equip-upgrade",
    name: "Equipamento Melhor",
    description: "Equipe um item melhor que o atual",
    type: "equipment",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor",
  },
  // Biomes, Regions & World Progression Phase I — requisito 5:
  // Objetivos Regionais — só elegíveis enquanto o personagem está na
  // região correspondente (`regionId`). "Mate 10 Lobos" (exemplo da
  // Sprint) virou "derrote 10 inimigos no Bosque" — o Presentation
  // Layer não distingue ESPÉCIE de inimigo dentro de um encontro (só
  // contagem, ver presentation/types.ts), então "no Bosque" é o que
  // sobrevive honestamente sem inventar um dado que não existe (mesma
  // limitação documentada em Best Item/Damage Record de outras
  // Sprints).
  {
    id: "bosque-hunt",
    name: "Caçada no Bosque",
    description: "Derrote 10 inimigos no Bosque Sussurrante",
    type: "kill",
    target: 10,
    regionId: "bosque-sussurrante",
    reward: { xpBonus: 70 },
    soundId: "objective-complete-minor",
  },
  {
    id: "pantano-survival",
    name: "Sobrevivência no Pântano",
    description: "Sobreviva a 3 encontros no Pântano Podre",
    type: "survival",
    target: 3,
    regionId: "pantano-podre",
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor",
  },
  {
    id: "ruinas-treasure",
    name: "Tesouro das Ruínas",
    description: "Encontre um item raro (ou melhor) nas Ruínas Esquecidas",
    type: "loot",
    target: 1,
    targetRarity: "rare",
    regionId: "ruinas-esquecidas",
    reward: { xpBonus: 90 },
    soundId: "objective-complete-major",
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 5: exemplos
  // literais da Sprint ("Derrote um Elite"/"Derrote um Mini-Boss"/
  // "Sobreviva após derrotar um Elite"). Sem `regionId` — Elites e
  // Mini-Bosses podem aparecer em qualquer bioma com `variantChances`
  // (ver worldencounter/encounterTables.ts).
  {
    id: "defeat-elite",
    name: "Caçador de Elites",
    description: "Derrote um Elite",
    type: "defeat-elite",
    target: 1,
    reward: { xpBonus: 100 },
    soundId: "objective-complete-major",
  },
  {
    id: "defeat-miniboss",
    name: "Caçador de Mini-Bosses",
    description: "Derrote um Mini-Boss",
    type: "defeat-miniboss",
    target: 1,
    reward: { xpBonus: 150 },
    soundId: "objective-complete-major",
  },
  {
    id: "survive-after-elite",
    name: "Sangue Frio",
    description: "Derrote um Elite e sobreviva a mais 3 encontros",
    type: "survive-after-elite",
    target: 3,
    reward: { xpBonus: 120 },
    soundId: "objective-complete-major",
  },
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 10: exemplos literais da Sprint ("Descubra 3 Monumentos"/"Abra 5
  // Baús"/"Encontre um Mercador"/"Receba uma Bênção"). Sem `regionId` —
  // World Events podem aparecer em qualquer bioma com sua própria
  // ExplorationEventTable (ver worldevents/worldEventTables.ts).
  // "Descubra 3 Monumentos" vira "descubra 3 vestígios" (o Objective
  // System conta a CATEGORIA inteira "discovery", não um evento
  // específico — mesma limitação honesta já documentada pra objetivos
  // regionais de "kill": a granularidade observável é por categoria,
  // não por id individual).
  {
    id: "discover-worldevent",
    name: "Explorador",
    description: "Descubra 3 vestígios do mundo (ruínas, diários, monumentos)",
    type: "discover-worldevent",
    target: 3,
    reward: { xpBonus: 90 },
    soundId: "objective-complete-major",
  },
  {
    id: "open-treasure",
    name: "Caçador de Tesouros",
    description: "Abra 5 baús ou tesouros",
    type: "open-treasure",
    target: 5,
    reward: { xpBonus: 80 },
    soundId: "objective-complete-minor",
  },
  {
    id: "find-merchant",
    name: "Encontro Providencial",
    description: "Encontre um mercador",
    type: "find-merchant",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor",
  },
  {
    id: "receive-blessing",
    name: "Abençoado",
    description: "Receba uma bênção de um santuário",
    type: "receive-blessing",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor",
  },
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 11: exemplos literais da Sprint ("Complete uma
  // Expedição"/"Alcance dois Checkpoints"/"Complete uma Expedição sem
  // morrer"/"Complete uma Expedição encontrando um Evento Mundial").
  // Sem `regionId` — Expedições existem em qualquer bioma com uma
  // Expedition Definition própria (ver expeditions/expeditionDefinitions.ts).
  {
    id: "complete-expedition",
    name: "Expedicionário",
    description: "Complete uma Expedição",
    type: "complete-expedition",
    target: 1,
    reward: { xpBonus: 150 },
    soundId: "objective-complete-major",
  },
  {
    id: "reach-checkpoints",
    name: "Marco a Marco",
    description: "Alcance dois Checkpoints de Expedição",
    type: "reach-checkpoints",
    target: 2,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor",
  },
  {
    id: "complete-expedition-no-death",
    name: "Sem Um Arranhão",
    description: "Complete uma Expedição sem morrer",
    type: "complete-expedition-no-death",
    target: 1,
    reward: { xpBonus: 200 },
    soundId: "objective-complete-major",
  },
  {
    id: "complete-expedition-with-worldevent",
    name: "Rota Ao Vivo",
    description: "Complete uma Expedição encontrando um Evento Mundial",
    type: "complete-expedition-with-worldevent",
    target: 1,
    reward: { xpBonus: 180 },
    soundId: "objective-complete-major",
  },
  // Factions, Reputation & World Consequences Phase I — requisito 9:
  // exemplos literais da Sprint ("alcance Respeitado"/"ajude
  // Mercadores"/"descubra locais das Ruínas"). Sem `regionId` —
  // reputação de facção pode subir em qualquer bioma (ver
  // factionController.ts).
  {
    id: "reach-respected-rank",
    name: "Reputação Crescente",
    description: "Alcance o rank Respeitado em uma facção",
    type: "reach-faction-rank",
    target: 1,
    reward: { xpBonus: 120 },
    soundId: "objective-complete-major",
  },
  {
    id: "help-merchants",
    name: "Amigo dos Mercadores",
    description: "Ganhe reputação com os Mercadores Livres 3 vezes",
    type: "help-merchants",
    target: 3,
    reward: { xpBonus: 70 },
    soundId: "objective-complete-minor",
  },
  {
    id: "discover-ruins",
    name: "Segredos das Ruínas",
    description: "Ganhe reputação com o Culto das Ruínas 2 vezes",
    type: "discover-ruins",
    target: 2,
    reward: { xpBonus: 80 },
    soundId: "objective-complete-minor",
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 6: exemplos literais da Sprint ("Derrote o Guardião Esquecido"/
  // "Complete a Fortaleza Sombria"/"Conclua uma Dungeon"). Sem
  // `regionId` nos dois primeiros — o Chefe Final/a Dungeon existem em
  // qualquer sessão que alcance a Expedição certa (ver dungeon/
  // dungeonDefinitions.ts), exceto "reach-fortaleza-sombria" (abaixo),
  // que É regional de propósito (reaproveita o tipo "survival" já
  // existente, mesmo princípio de "bosque-hunt"/"pantano-survival").
  {
    id: "defeat-final-boss",
    name: "Matador de Guardiões",
    description: "Derrote o Guardião Esquecido",
    type: "defeat-final-boss",
    target: 1,
    reward: { xpBonus: 250 },
    soundId: "objective-complete-major",
  },
  {
    id: "reach-fortaleza-sombria",
    name: "Nas Portas da Fortaleza",
    description: "Complete a Fortaleza Sombria (sobreviva a 3 encontros lá)",
    type: "survival",
    target: 3,
    regionId: "fortaleza-sombria",
    reward: { xpBonus: 200 },
    soundId: "objective-complete-major",
  },
  {
    id: "complete-dungeon",
    name: "Herói da Dungeon",
    description: "Conclua uma Dungeon",
    type: "complete-dungeon",
    target: 1,
    reward: { xpBonus: 400 },
    soundId: "objective-complete-major",
  },
];

// Requisito 10 — "primeiro objetivo concluído em menos de 2 minutos":
// garantido escolhendo sempre o mesmo objetivo de menor alvo (5
// abates, o tipo com o ritmo mais rápido observável) como o PRIMEIRO,
// de forma determinística — nunca deixado ao acaso da seleção
// aleatória usada pros objetivos seguintes.
export const STARTER_OBJECTIVE_ID = "kill-5";

export function getObjectiveDefinition(id: string): ObjectiveDefinition | undefined {
  return OBJECTIVE_DEFINITIONS.find((definition) => definition.id === id);
}

// Requisito 3/5 — "selecionar automaticamente o próximo objetivo, sem
// intervenção da UI": determinístico (seed da sessão + quantos
// objetivos já foram concluídos), nunca Math.random. `completedCount
// === 0` sempre devolve o objetivo inicial garantido (ver acima, sem
// `regionId`, então sempre elegível); depois disso, sorteia entre os
// demais ELEGÍVEIS pra `currentRegionId` (sem regionId OU regionId
// igual à região atual), excluindo o que acabou de ser concluído.
export function selectObjectiveId(
  seed: number,
  completedCount: number,
  previousObjectiveId: string | null,
  currentRegionId: string,
): string {
  if (completedCount === 0) return STARTER_OBJECTIVE_ID;

  const candidates = OBJECTIVE_DEFINITIONS.filter(
    (definition) =>
      definition.id !== previousObjectiveId && (definition.regionId === undefined || definition.regionId === currentRegionId),
  );
  const rng = createSeededRandom(seed + completedCount);
  const index = randomInt(rng, 0, candidates.length - 1);
  return candidates[index].id;
}
