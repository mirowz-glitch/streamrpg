/**
 * ExpeditionSystem — Sprint Expedition System (Sprint Encounter System
 * adicionou geração de Encounters).
 *
 * Reage a session.started (cria a primeira expedição de um personagem)
 * e world.tick (avança expedições de quem está presente). Responsabilidade
 * única: representar "o que o personagem está fazendo agora" — nunca
 * concede XP, Gold, Drop, nem calcula dano. Um Encounter (categoria +
 * ícone + texto) é só narrativa curta, nunca recompensa — "Combatendo"
 * continua sendo um rótulo de estado, não uma luta real contra stats de
 * monstro. Combat Model (docs/combat-model/canonical-formula.md)
 * continua intocado.
 *
 * Modelo de viagem: toda expedição é uma ida-e-volta a partir do hub
 * (Porto do Amanhecer, já documentado em World Design como o ponto de
 * partida de todo personagem nunca "sem base"). O destino é sorteado
 * entre todas as outras regiões do grafo já existente
 * (packages/shared/src/regions.ts, refletindo docs/world-design/roads.md)
 * — nunca uma região inventada. O tempo de viagem (Explorando/Retornando)
 * escala com a distância real no grafo (BFS) até o destino.
 *
 * Sequência de estados fixa (Etapa 3 da Sprint Expedition System):
 * preparing → exploring → combating → resting → returning → completed.
 * Ao concluir, uma nova expedição começa automaticamente do mesmo hub.
 *
 * Categorias de Encounter (Etapa 3 desta Sprint) — consolidação das 8
 * categorias já existentes em docs/world-design/random-events.md (A-H):
 * natureza (🌲, categorias B/H), combate (⚔, categoria C), descoberta
 * (🎁, categoria D), descanso (🏕, estado já existente), misterio (🧙,
 * categoria E), comercio (💰, categoria F/A), clima (🌧, categoria B),
 * ruinas (🏛, eventos específicos de Ruínas Esquecidas nas categorias
 * C/D/E). Cada estado só sorteia entre categorias compatíveis (Etapa 4)
 * — "Combatendo" nunca gera um Encounter de Comércio, por exemplo.
 */
import { allRegionIds, shortestPathLength, STARTING_REGION_ID } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  EncounterSnapshot,
  ExpeditionCompletedEvent,
  ExpeditionEncounterEvent,
  ExpeditionRepository,
  ExpeditionSnapshot,
  ExpeditionStartedEvent,
  ExpeditionStateChangedEvent,
  ExpeditionStatus,
  RandomProvider,
  SessionStartedEvent,
  WorldTickEvent,
} from "../engine/types.js";

// Ilustrativo, não calibrado — mesma convenção de todo valor numérico
// não validado por playtest neste projeto (Tiers de Boss, pesos de
// raridade). Ticks de world.tick (60s cada).
const FIXED_DURATION_TICKS: Record<Exclude<ExpeditionStatus, "exploring" | "returning" | "completed">, number> = {
  preparing: 1,
  combating: 2,
  resting: 1,
};

const STATE_ORDER: ExpeditionStatus[] = ["preparing", "exploring", "combating", "resting", "returning", "completed"];

function travelTicks(originId: string, destinationId: string): number {
  return Math.max(1, shortestPathLength(originId, destinationId));
}

function stateDurations(originId: string, destinationId: string): Record<ExpeditionStatus, number> {
  const travel = travelTicks(originId, destinationId);
  return {
    preparing: FIXED_DURATION_TICKS.preparing,
    exploring: travel,
    combating: FIXED_DURATION_TICKS.combating,
    resting: FIXED_DURATION_TICKS.resting,
    returning: travel,
    completed: 0,
  };
}

function totalEstimatedTicks(originId: string, destinationId: string): number {
  const durations = stateDurations(originId, destinationId);
  return STATE_ORDER.filter((s) => s !== "completed").reduce((sum, s) => sum + durations[s], 0);
}

// Cada estado só sorteia entre as categorias compatíveis com ele
// (Etapa 4) — nenhuma delas aparece fora do estado listado.
const ENCOUNTERS_BY_STATE: Record<Exclude<ExpeditionStatus, "completed">, EncounterSnapshot[]> = {
  preparing: [
    { category: "comercio", icon: "💰", text: "Organizando suprimentos para a viagem" },
    { category: "natureza", icon: "🌲", text: "Revisando o mapa da rota" },
    { category: "comercio", icon: "💰", text: "Últimas compras antes de partir" },
  ],
  exploring: [
    { category: "natureza", icon: "🌲", text: "Encontrou uma trilha pouco batida" },
    { category: "natureza", icon: "🌲", text: "Um bando de aves cruza o céu" },
    { category: "clima", icon: "🌧", text: "Uma chuva fina começa a cair" },
    { category: "clima", icon: "🌧", text: "Névoa densa reduz a visão" },
    { category: "descoberta", icon: "🎁", text: "Uma bolsa de viajante esquecida no chão" },
    { category: "descoberta", icon: "🎁", text: "Um veio de minério exposto brilha na parede" },
    { category: "misterio", icon: "🧙", text: "Um eco espectral ressoa pelas pedras" },
    { category: "comercio", icon: "💰", text: "Uma caravana comercial passa ao longe" },
  ],
  combating: [
    { category: "combate", icon: "⚔", text: "Lobos cercaram o grupo" },
    { category: "combate", icon: "⚔", text: "Uma emboscada surpreende os viajantes" },
    { category: "combate", icon: "⚔", text: "Bandidos bloqueiam a passagem" },
    { category: "combate", icon: "⚔", text: "Um predador solitário ataca pelas sombras" },
    { category: "combate", icon: "⚔", text: "Uma horda de criaturas menores se aproxima" },
  ],
  resting: [
    { category: "descanso", icon: "🏕", text: "Acampamento montado em local seguro" },
    { category: "descanso", icon: "🏕", text: "Fogueira acesa para a noite" },
    { category: "comercio", icon: "💰", text: "Um mercador itinerante cruza o acampamento" },
    { category: "misterio", icon: "🧙", text: "Uma visão rápida do passado surge e desaparece" },
  ],
  returning: [
    { category: "natureza", icon: "🌲", text: "Voltando pela estrada conhecida" },
    { category: "clima", icon: "🌧", text: "O vento muda de direção no caminho de volta" },
    { category: "natureza", icon: "🌲", text: "Últimos passos da jornada de volta" },
  ],
};

// Encounters de Ruínas só aparecem quando o destino é uma região com
// ruínas de verdade (regions.md) — nunca fora de contexto.
const RUINS_LIKE_REGIONS = new Set(["ruinas-esquecidas", "fortaleza-sombria"]);
const RUINS_ENCOUNTERS: EncounterSnapshot[] = [
  { category: "ruinas", icon: "🏛", text: "Colunas quebradas erguem-se entre a vegetação" },
  { category: "ruinas", icon: "🏛", text: "Um vigia de pedra antigo permanece imóvel" },
  { category: "ruinas", icon: "🏛", text: "Inscrições antigas cobrem as paredes" },
];

function pickEncounter(
  status: ExpeditionStatus,
  destinationRegionId: string,
  random: RandomProvider,
): EncounterSnapshot | null {
  if (status === "completed") return null;

  if ((status === "exploring" || status === "combating") && RUINS_LIKE_REGIONS.has(destinationRegionId) && random.next() < 0.4) {
    const idx = Math.floor(random.next() * RUINS_ENCOUNTERS.length);
    return RUINS_ENCOUNTERS[idx];
  }

  const pool = ENCOUNTERS_BY_STATE[status];
  const idx = Math.floor(random.next() * pool.length);
  return pool[idx];
}

function pickDestination(originId: string, random: RandomProvider): string {
  const candidates = allRegionIds().filter((id) => id !== originId);
  const idx = Math.floor(random.next() * candidates.length);
  return candidates[idx];
}

export class ExpeditionSystem {
  constructor(
    private repo: ExpeditionRepository,
    private randomProvider: RandomProvider,
  ) {}

  register(bus: EventBus): () => void {
    const unsubSession = bus.subscribe("session.started", async (event) => {
      const { characterId, timestamp } = event as SessionStartedEvent;
      try {
        const existing = await this.repo.findActiveByCharacter(characterId);
        if (!existing) {
          await this.startNewExpedition(characterId, timestamp, bus);
        }
      } catch (err) {
        console.error(`[ExpeditionSystem] Erro ao garantir expedição para ${characterId}:`, err);
      }
    });

    const unsubTick = bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      for (const session of sessions) {
        try {
          const existing = await this.repo.findActiveByCharacter(session.characterId);
          if (!existing) {
            await this.startNewExpedition(session.characterId, timestamp, bus);
          } else {
            await this.advance(session.characterId, existing, timestamp, bus);
          }
        } catch (err) {
          console.error(`[ExpeditionSystem] Erro ao processar personagem ${session.characterId}:`, err);
        }
      }
    });

    return () => {
      unsubSession();
      unsubTick();
    };
  }

  private emitEncounter(
    characterId: string,
    expeditionId: string,
    regionId: string,
    encounter: EncounterSnapshot,
    timestamp: number,
    bus: EventBus,
  ): void {
    const encounterEvent: ExpeditionEncounterEvent = {
      type: "expedition.encounter",
      characterId,
      expeditionId,
      regionId,
      category: encounter.category,
      icon: encounter.icon,
      text: encounter.text,
      timestamp,
    };
    bus.emit(encounterEvent);
  }

  private async startNewExpedition(characterId: string, timestamp: number, bus: EventBus): Promise<ExpeditionSnapshot> {
    const destination = pickDestination(STARTING_REGION_ID, this.randomProvider);
    const estimatedTicks = totalEstimatedTicks(STARTING_REGION_ID, destination);
    const expedition = await this.repo.create(characterId, STARTING_REGION_ID, destination, estimatedTicks, timestamp);

    const started: ExpeditionStartedEvent = {
      type: "expedition.started",
      characterId,
      expeditionId: expedition.id,
      originRegionId: STARTING_REGION_ID,
      destinationRegionId: destination,
      timestamp,
    };
    bus.emit(started);

    // Primeiro Encounter já na criação — sem isso, "preparing" ficaria
    // sem nenhuma narrativa até o próximo tick (até 60s de tela vazia).
    const firstEncounter = pickEncounter("preparing", destination, this.randomProvider);
    if (firstEncounter) {
      await this.repo.advance(expedition.id, "preparing", timestamp, 0, firstEncounter, STARTING_REGION_ID);
      this.emitEncounter(characterId, expedition.id, STARTING_REGION_ID, firstEncounter, timestamp, bus);
    }
    return expedition;
  }

  private async advance(
    characterId: string,
    expedition: ExpeditionSnapshot,
    timestamp: number,
    bus: EventBus,
  ): Promise<void> {
    const durations = stateDurations(expedition.originRegionId, expedition.destinationRegionId);
    const nextTicks = expedition.progressTicks + 1;
    const duration = durations[expedition.status];

    if (nextTicks < duration) {
      // Continua no mesmo estado — um único Encounter por estado (Etapa
      // 4: "Preparando → Organizando suprimentos", um-para-um), mantido
      // estável durante toda a duração do estado, não recalculado a
      // cada tick. Só o progresso avança.
      const encounter: EncounterSnapshot | null =
        expedition.currentEncounterCategory && expedition.currentEvent
          ? { category: expedition.currentEncounterCategory, icon: expedition.currentEncounterIcon ?? "", text: expedition.currentEvent }
          : null;
      await this.repo.advance(
        expedition.id,
        expedition.status,
        expedition.statusStartedAt,
        nextTicks,
        encounter,
        expedition.currentRegionId,
      );
      return;
    }

    const currentIndex = STATE_ORDER.indexOf(expedition.status);
    const nextStatus = STATE_ORDER[currentIndex + 1] ?? "completed";

    if (nextStatus === "completed") {
      const completed = await this.repo.complete(expedition.id, timestamp);
      const completedEvent: ExpeditionCompletedEvent = {
        type: "expedition.completed",
        characterId,
        expeditionId: completed.id,
        destinationRegionId: completed.destinationRegionId,
        timestamp,
      };
      bus.emit(completedEvent);

      // Nova expedição sempre parte do hub — o personagem nunca fica
      // "sem destino" enquanto presente (Missão da Sprint Expedition
      // System: "toda progressão precisa acontecer dentro de uma
      // expedição").
      await this.startNewExpedition(characterId, timestamp, bus);
      return;
    }

    // "current_region_id" só muda quando de fato chega a algum lugar:
    // ao entrar em combating (chegou ao destino, exploring terminou) ou
    // ao entrar em completed (chegou de volta ao hub, tratado acima).
    const arrivedRegionId = nextStatus === "combating" ? expedition.destinationRegionId : expedition.currentRegionId;
    const encounter = pickEncounter(nextStatus, expedition.destinationRegionId, this.randomProvider);
    await this.repo.advance(expedition.id, nextStatus, timestamp, 0, encounter, arrivedRegionId);

    if (encounter) {
      this.emitEncounter(characterId, expedition.id, arrivedRegionId, encounter, timestamp, bus);
    }

    const stateChanged: ExpeditionStateChangedEvent = {
      type: "expedition.state_changed",
      characterId,
      expeditionId: expedition.id,
      status: nextStatus,
      currentEvent: encounter?.text ?? null,
      timestamp,
    };
    bus.emit(stateChanged);
  }
}

export function calculateOverallProgress(expedition: ExpeditionSnapshot): number {
  if (expedition.status === "completed") return 100;
  const durations = stateDurations(expedition.originRegionId, expedition.destinationRegionId);
  const total = STATE_ORDER.filter((s) => s !== "completed").reduce((sum, s) => sum + durations[s], 0);
  const currentIndex = STATE_ORDER.indexOf(expedition.status);
  let ticksElapsed = 0;
  for (let i = 0; i < currentIndex; i++) {
    ticksElapsed += durations[STATE_ORDER[i]];
  }
  ticksElapsed += expedition.progressTicks;
  return Math.min(100, Math.round((ticksElapsed / total) * 100));
}

export function estimatedSecondsRemaining(expedition: ExpeditionSnapshot, tickIntervalSeconds = 60): number {
  if (expedition.status === "completed") return 0;
  const durations = stateDurations(expedition.originRegionId, expedition.destinationRegionId);
  const currentIndex = STATE_ORDER.indexOf(expedition.status);
  let ticksRemaining = durations[expedition.status] - expedition.progressTicks;
  for (let i = currentIndex + 1; i < STATE_ORDER.length; i++) {
    ticksRemaining += durations[STATE_ORDER[i]];
  }
  return Math.max(0, ticksRemaining) * tickIntervalSeconds;
}

export { STATE_ORDER };
