import type { ExpeditionStatus } from "@streamrpg/shared";

export type SimulationDirection = "left" | "right" | "none";
export type SimulationAnimationState = "walking" | "idle" | "combat" | "returning";

export interface WorldSimulationState {
  x: number;
  y: number;
  // Sprint World Simulation Phase II — mesma fórmula de `x` (Phase I,
  // regra inalterada); campo separado pro renderer usar como destino de
  // uma transição CSS (`left`), em vez de aplicar a posição de uma vez.
  targetX: number;
  speed: number;
  direction: SimulationDirection;
  animationState: SimulationAnimationState;
  status: ExpeditionStatus;
  region: string;
}

interface ExpeditionLike {
  status: ExpeditionStatus;
  progress_percent: number;
  current_region_name: string;
}

const STATUS_TO_ANIMATION: Record<ExpeditionStatus, SimulationAnimationState> = {
  preparing: "idle",
  exploring: "walking",
  combating: "combat",
  resting: "idle",
  returning: "returning",
  completed: "idle",
};

const ANIMATION_TO_DIRECTION: Record<SimulationAnimationState, SimulationDirection> = {
  walking: "right",
  returning: "left",
  combat: "none",
  idle: "none",
};

// y fixo nesta Sprint (grid lógico, sem mapa real ainda).
const FIXED_Y = 0;

// Sprint World Simulation Phase II — "speed = constante" (brief), sem
// unidade calibrada ainda (mesma convenção de todo número ilustrativo
// não validado por playtest neste projeto). O renderer não lê este
// valor hoje (a transição CSS usa uma duração fixa própria); existe só
// pra completar a arquitetura pedida pelo brief.
const SIMULATION_SPEED = 20;

// Pura: mesma entrada, mesma saída, sempre. Sem sprites/animação/canvas —
// só a posição lógica (x/y), direção e estado, prontos pra um renderer
// futuro trocar "●" por sprite sem tocar aqui.
export function buildWorldSimulationState(expedition: ExpeditionLike): WorldSimulationState {
  const animationState = STATUS_TO_ANIMATION[expedition.status];
  return {
    x: expedition.progress_percent,
    y: FIXED_Y,
    targetX: expedition.progress_percent,
    speed: SIMULATION_SPEED,
    direction: ANIMATION_TO_DIRECTION[animationState],
    animationState,
    status: expedition.status,
    region: expedition.current_region_name,
  };
}
