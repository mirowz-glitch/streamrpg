import type { SphereTable } from "./types.js";

/**
 * Sprint 13 — Sphere Economy Phase I. Taxas DEFAULT, não a taxa do
 * Path of Exile 2 (diretriz explícita do brief) — calibradas para um
 * MMORPG Idle PERSISTENTE, não para uma sessão de jogo isolada.
 *
 * A diferença importa porque o Adventure Loop roda continuamente
 * (Idle Driver, ver `useAdventureSession.ts`) — um personagem pode
 * gerar milhares de kills por dia sem nenhuma ação manual. Uma taxa
 * "razoável para uma sessão de RPG" (ex.: 1% por kill) inundaria o
 * servidor em semanas. Por isso `adventure`/`dungeon` usam frações de
 * 1% — o volume de KILLS compensa a taxa baixa; `boss`/`world_boss` são
 * eventos genuinamente raros (Elite/MiniBoss não aparecem a cada tick,
 * World Boss é um evento de Reino inteiro), então podem ter uma taxa
 * por-evento mais alta sem quebrar a escassez agregada do servidor.
 *
 * Nenhum destes números foi validado por simulação nesta Sprint (ao
 * contrário de Enemy Templates/Loot Tables, que passaram por
 * `scripts/runBalanceSimulation.ts` em Sprints anteriores) — são um
 * ponto de partida documentado, não um resultado calibrado. Ver
 * "Próxima Sprint" no relatório de entrega desta Sprint.
 *
 * "Não hardcodar taxas... infraestrutura configurável": esta é a ÚNICA
 * função deste arquivo — dados puros, sem lógica. Ajustar uma taxa é
 * editar um número aqui, nunca tocar `rollSphereDrop()`.
 */
export const DEFAULT_SPHERE_DROP_TABLE: SphereTable = {
  // Fase 3 — Adventure: chance muito pequena, só as 3 Esferas mais
  // "seguras" (nunca desmancham craft_state nem adicionam afixo de
  // graça). Ascensão/Maldição deliberadamente AUSENTES de `weights`
  // (nunca `weight: 0` — omissão real, mais fácil de auditar).
  adventure: {
    source: "adventure",
    dropChance: 0.0008,
    weights: [
      { sphereId: "fortune", weight: 70 },
      { sphereId: "purification", weight: 20 },
      { sphereId: "lapidation", weight: 10 },
    ],
  },
  // Fase 4 — Dungeon: kills normais DENTRO de uma Expedição-Dungeon
  // ativa (ver `AdvanceAdventureOptions.inDungeon`, resolvido por
  // `dungeon/dungeonController.ts`). Chance maior que Adventure aberta,
  // e a primeira fonte que pode gerar Ascensão. Maldição continua
  // ausente.
  dungeon: {
    source: "dungeon",
    dropChance: 0.004,
    weights: [
      { sphereId: "fortune", weight: 55 },
      { sphereId: "purification", weight: 20 },
      { sphereId: "lapidation", weight: 15 },
      { sphereId: "ascension", weight: 10 },
    ],
  },
  // Fase 5 — Boss: Elite/MiniBoss/Chefe Final de Dungeon (qualquer
  // encontro com `encounterVariant !== "normal"`, ver adventureLoop.ts)
  // — eventos já raros por natureza, então uma chance por-evento maior
  // ainda mantém baixo volume agregado. Primeira fonte com Maldição,
  // só que com peso mínimo ("muito raramente", diretriz do brief).
  boss: {
    source: "boss",
    dropChance: 0.02,
    weights: [
      { sphereId: "fortune", weight: 35 },
      { sphereId: "purification", weight: 20 },
      { sphereId: "lapidation", weight: 15 },
      { sphereId: "ascension", weight: 25 },
      { sphereId: "curse", weight: 5 },
    ],
  },
  // Fase 6 — World Boss: concedido fora do Adventure Loop, direto por
  // `apps/api/src/systems/BossRewardSystem.ts` (um evento de Reino
  // inteiro, raríssimo por si só — vitórias reais contra um World Boss
  // não acontecem a cada minuto). É a ÚNICA fonte onde Maldição tem
  // peso comparável às outras — "chance significativa DADO que caiu
  // algo", nunca "cai sempre": `dropChance` continua baixo o bastante
  // pra manter Maldição extremamente rara em termos absolutos de
  // servidor.
  world_boss: {
    source: "world_boss",
    dropChance: 0.1,
    weights: [
      { sphereId: "fortune", weight: 15 },
      { sphereId: "purification", weight: 15 },
      { sphereId: "lapidation", weight: 10 },
      { sphereId: "ascension", weight: 25 },
      { sphereId: "curse", weight: 35 },
    ],
  },
  // Sprint 24 — Economy Foundation II, Fase 3: infraestrutura apenas.
  // Nenhum World Event concede Esfera hoje — `dropChance: 0` +
  // `weights: []` garante que `rollSphereDrop("world_event", ...)`
  // sempre devolve `sphereId: null`, independente de `rng`, o mesmo
  // caminho seguro já coberto por `rollSphereDrop()` quando
  // `pool.weights.length === 0`. Nenhum ponto do jogo chama esta fonte
  // ainda — existe só pra a Sprint de World Events (Fase 9 do
  // `new-roadmap.md`) ter uma tabela pronta pra preencher, nunca pra
  // criar comportamento novo agora.
  world_event: {
    source: "world_event",
    dropChance: 0,
    weights: [],
  },
  // Sprint 24 — Fase 3: mesmo raciocínio de `world_event` — nenhum
  // sistema de Raid existe ainda ("Future Raid" no brief é literal:
  // reservado pro futuro, não implementado nesta Sprint).
  future_raid: {
    source: "future_raid",
    dropChance: 0,
    weights: [],
  },
};
