// World Events, Dynamic Encounters & Exploration Phase I — tipos
// isolados de propósito. Prefixados `ExplorationEvent*` (não
// `WorldEvent*`) de propósito: `WorldEventCategory`/
// `CurrentWorldEventResponse` já existem em ../types.ts (Sprint Kingdom
// Events — um evento ambiental diário do Reino inteiro, "nunca concede
// XP/Gold/item, nunca altera gameplay", sistema completamente diferente
// e intocado por esta Sprint). "Eventos do mundo são apenas mais um
// tipo de encontro": este módulo só DEFINE dados — quem decide QUANDO
// um evento acontece é o World Encounter (generator.ts, requisito
// arquitetural "aproveitar o Encounter Generator"), nunca este arquivo.

// Requisito 2 — as 5 categorias iniciais. "Ambush... reutilizar
// Encounter normal": única categoria que gera combate de verdade (os
// outros 4 não têm nenhum inimigo, resolvem instantaneamente com uma
// recompensa direta — ver worldencounter/generator.ts).
export type ExplorationEventCategory = "treasure" | "merchant" | "shrine" | "ambush" | "discovery";

// Requisito 4 — "Recompensas: reutilizar apenas sistemas existentes."
// Todos os campos são opcionais — um evento combina só os que fizer
// sentido pra sua categoria (ex.: Shrine pode ter recoveryAmount +
// xpAmount, sem goldAmount). `lootTableId` referencia um id REAL já
// existente em lootgen/lootTables.ts (ex.: "treasure_chest") — nenhuma
// Loot Table nova criada por este módulo, só reaproveitada via
// generateLoot() (ver presentation/presentationLayer.ts).
export interface ExplorationEventReward {
  goldAmount?: number;
  xpAmount?: number;
  recoveryAmount?: number;
  lootTableId?: string;
}

// Requisito 1 — World Event Definition: id/nome/descrição/biomas
// permitidos/peso/categoria/dificuldade/recompensa/consequência/
// duração, tudo num registro só, "nenhum switch gigante" (nenhuma
// lógica aqui lê `id`/`category` pra decidir comportamento especial —
// worldencounter/generator.ts e presentationLayer.ts só leem os campos
// genéricos abaixo).
//
// `consequence`/`duration` são metadados descritivos desta fase —
// mesmo princípio de Future Hooks já usado em EnemyFutureFlags/
// RecoveryConfig/EncounterFutureFlags: aceitos por tipagem (texto/
// segundos), mas nenhuma lógica real ainda os aplica (eventos sempre
// resolvem na mesma tick em que aparecem, sem estado que dure além
// disso — ver nota em presentation/types.ts sobre por que "surgiu" e
// "concluído" chegam sempre juntos). Reservado pro dia em que um evento
// puder, por exemplo, deixar um efeito temporário na região.
export interface ExplorationEventDefinition {
  id: string;
  name: string;
  description: string;
  allowedBiomes: string[];
  weight: number;
  category: ExplorationEventCategory;
  difficulty: string;
  reward: ExplorationEventReward;
  consequence?: string;
  duration?: number;
}

// Requisito 3 — Distribuição por Bioma: "cada bioma deverá possuir
// pesos próprios... tudo em tabelas." Uma tabela por região, nunca um
// `if (regionId === "...")` em generator.ts.
export interface ExplorationEventTableEntry {
  eventId: string;
  weight: number;
}

// `chance`: fração (0-1) de UM encontro comum desta região virar um
// World Event — o mesmo tipo de "regra de seleção" já usado por
// `EncounterVariantChances` (Elites, Mini-Bosses & Risk/Reward Phase
// I), só que decidido ANTES daquela rolagem (ver worldencounter/
// generator.ts).
export interface ExplorationEventTable {
  regionId: string;
  chance: number;
  entries: ExplorationEventTableEntry[];
}
