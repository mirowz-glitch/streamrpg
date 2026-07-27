import type { HudState, IdleDriverStatus, ItemGenRarityId } from "@streamrpg/shared";
import { ITEM_GEN_RARITIES } from "@streamrpg/shared";

// Living Character Phase I — única camada que decide "o que meu
// aventureiro está fazendo agora?" (Visão da Sprint). Pura: mesma
// entrada, mesma saída, sempre — nenhuma leitura de relógio (quem
// chama já resolveu `ready`/`hudState`/`idleStatus` antes). Nenhum
// estado novo é inventado aqui: cada ramo do "ladder" abaixo só existe
// porque um campo real do Estado Global (Global Idle System Sprint) o
// sustenta — ver docs/design/living-character-phase1.md Seção 2.
export type AdventureLiveStatus = "carregando" | "derrotado" | "pausado" | "lutando-chefe" | "combatendo" | "dungeon" | "explorando";

// Prioridade do mais específico pro mais genérico — a MESMA ordem em
// que um jogador leria a situação: primeiro "morreu?", depois
// "pausei?", depois "é o chefe?", etc. Deliberadamente NÃO existe um
// ramo "Descansando": o Estado Global não tem um campo persistente de
// "está descansando agora" (RecoveryApplied é instantâneo, entre
// encontros, não um modo contínuo) — inventar esse estado violaria "a
// interface nunca inventa informação". A recuperação mais recente
// aparece como uma LINHA de informação (ver adventureLiveInfo abaixo),
// nunca como o status principal.
export function deriveAdventureLiveStatus(ready: boolean, hudState: HudState, idleStatus: IdleDriverStatus): AdventureLiveStatus {
  if (!ready) return "carregando";
  if (hudState.sessionStatus === "derrota") return "derrotado";
  if (idleStatus === "paused") return "pausado";

  const finalBoss = hudState.expedition?.finalBoss ?? null;
  if (finalBoss && finalBoss.encountered && !finalBoss.defeated) return "lutando-chefe";
  if (hudState.sessionStatus === "em-combate") return "combatendo";
  if (hudState.expedition && hudState.expedition.finalBoss) return "dungeon";
  return "explorando";
}

const STATUS_LABELS: Record<AdventureLiveStatus, string> = {
  carregando: "Carregando aventura...",
  derrotado: "Derrotado",
  pausado: "Pausado",
  "lutando-chefe": "Lutando contra o Chefe",
  combatendo: "Combatendo",
  dungeon: "Explorando uma Dungeon",
  explorando: "Explorando",
};

export function adventureLiveStatusLabel(status: AdventureLiveStatus): string {
  return STATUS_LABELS[status];
}

// Só os estados em que o IdleDriver global está de fato avançando o
// mundo sozinho — usado pra decidir o indicador pulsante (Fase 5, "vida
// visual") e se vale a pena mostrar uma contagem regressiva (não existe
// "próximo avanço" nem pulso enquanto pausado/derrotado/carregando).
export function isAdventureLiveStatusActive(status: AdventureLiveStatus): boolean {
  return status === "explorando" || status === "combatendo" || status === "dungeon" || status === "lutando-chefe";
}

// Fase 3 — "tempo até o próximo avanço": formata o valor puro de
// `msUntilNextTick` (packages/shared, IdleDriver.msUntilNextTick) pra
// um texto curto. `null` (pausado/parado) devolve `null` — quem chama
// decide não mostrar a linha nesse caso, nunca mostra "0s" enganoso.
export function formatNextTickCountdown(msUntilNextTick: number | null): string | null {
  if (msUntilNextTick === null) return null;
  if (msUntilNextTick < 1000) return "menos de 1s";
  return `~${Math.ceil(msUntilNextTick / 1000)}s`;
}

// Living World Phase II — Fase 5 ("Feedback Temporal"): baldes largos e
// legíveis, nunca um relógio preciso — "nenhum relógio complexo",
// literalmente pedido pelo brief. Pura (recebe `now` explícito, mesmo
// padrão de IdleDriver.shouldTick/AnimationController.tick — nunca lê
// o relógio sozinha), então não precisa de um timer dedicado: é
// recalculada nos re-renders que o próprio tick global já dispara.
export function formatRelativeTime(eventTimestampMs: number, nowMs: number): string {
  const elapsedSeconds = Math.max(0, (nowMs - eventTimestampMs) / 1000);
  if (elapsedSeconds < 5) return "agora";
  if (elapsedSeconds < 60) return "há poucos segundos";
  if (elapsedSeconds < 120) return "há 1 minuto";
  if (elapsedSeconds < 300) return "há alguns minutos";
  return "recentemente";
}

// Centralizado aqui pra não duplicar uma 3ª vez o mesmo lookup que
// EventFeed.tsx já tem (rarityLabel local) — reaproveitado por
// adventureJourney.ts/AdventureLivePanel.tsx.
export function rarityLabel(rarity: ItemGenRarityId | string): string {
  return ITEM_GEN_RARITIES.find((entry) => entry.id === rarity)?.label ?? rarity;
}
