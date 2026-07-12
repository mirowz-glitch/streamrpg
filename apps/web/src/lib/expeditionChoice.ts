import type { EncounterCategory, ExpeditionStatus } from "@streamrpg/shared";

// Sprint Gameplay First Phase I — primeira decisão REAL da Expedição.
// Expedition Decision Hints Phase I já tinha identificado exatamente
// este momento (Exploring + categoria Descoberta) como o de maior
// potencial: a frase "Vale a pena parar para investigar, ou é melhor
// seguir em frente?" já perguntava isso, mas ninguém respondia. Agora
// o jogador de fato escolhe.
//
// REQUISITO OBRIGATÓRIO — auditoria antes de implementar:
// - ExpeditionSystem (apps/api) nunca ramifica: STATE_ORDER é fixo e
//   pickEncounter() já sorteou o Encounter no backend antes da tela
//   existir. Fazer esta escolha influenciar de verdade o resultado
//   (drop/XP/duração) exigiria um backend novo — fora de escopo
//   ("no new backend unless absolutely required"). Por isso esta é
//   uma decisão "real ou percebida", como o próprio brief autoriza:
//   100% cliente, sem persistência, sem efeito no Combat Model
//   (docs/combat-model/canonical-formula.md, intocado).
// - lib/expeditionDecisionHints.ts: mantido como está, ainda usado
//   como a linha passiva em ExpeditionCompact (Overlay/Landing/outros
//   espectadores, onde a escolha NÃO é do jogador que está vendo a
//   tela). Esta camada nova só se aplica em ExpeditionPanel, o único
//   lugar onde o personagem exibido é o do próprio jogador — nenhuma
//   lógica de frase duplicada, só um novo eixo (interação) sobre o
//   mesmo gate (status+categoria) já usado por Evolution/Decision
//   Hints.
// - Nenhuma outra combinação de status/categoria virou decisão
//   acionável nesta Fase I, de propósito ("uma decisão excelente vale
//   mais que cinquenta frases").
//
// Sprint Expedition Choice Phase II — Persistent Identity — a mesma
// escolha acima, agora com uma identidade visual (ícone+label+cor)
// que permanece durante TODA a expedição, não só no encontro em que
// foi feita. Reaproveita OUTCOME_ICON como o ícone persistente
// (nenhum mapa de ícone duplicado) — única mudança real é ONDE o
// estado é resetado (ExpeditionPanel: por expedição inteira, não mais
// por encontro/status). Nenhuma disponibilidade nova, nenhum critério
// novo: `isExpeditionChoiceAvailable` continua sendo a única fonte de
// verdade sobre quando os botões aparecem.
export type ExpeditionChoiceOption = "investigate" | "continue";

export interface ExpeditionChoiceContext {
  status: ExpeditionStatus;
  encounterCategory?: EncounterCategory | null;
}

// Mesmo gate real já usado por getExpeditionDecisionHint para esta
// combinação — nunca um critério novo inventado.
export function isExpeditionChoiceAvailable(ctx: ExpeditionChoiceContext): boolean {
  return ctx.status === "exploring" && ctx.encounterCategory === "descoberta";
}

const OUTCOME_LINE: Record<ExpeditionChoiceOption, string> = {
  investigate: "O grupo decide parar e investigar de perto.",
  continue: "O grupo decide não se distrair e seguir em frente.",
};

const OUTCOME_ICON: Record<ExpeditionChoiceOption, string> = {
  investigate: "🔍",
  continue: "🏃",
};

// Puras: mesma entrada, mesma saída, sempre.
export function getExpeditionChoiceOutcomeLine(option: ExpeditionChoiceOption): string {
  return OUTCOME_LINE[option];
}

export function getExpeditionChoiceOutcomeIcon(option: ExpeditionChoiceOption): string {
  return OUTCOME_ICON[option];
}

// Sprint Expedition Choice Phase II — Persistent Identity. Label curto
// e reconhecível ("Exploring • Investigando"), pensado para caber ao
// lado do rótulo de Estado já existente (STATUS_LABEL, lib/expedition.ts).
const APPROACH_LABEL: Record<ExpeditionChoiceOption, string> = {
  investigate: "Investigando",
  continue: "Rota Rápida",
};

// Classe CSS que dá a cor de destaque persistente (accent color) —
// aplicada tanto no texto do badge quanto num contorno sutil do bloco
// da expedição, nunca um banner novo.
const APPROACH_ACCENT_CLASS: Record<ExpeditionChoiceOption, string> = {
  investigate: "expedition-approach-investigate",
  continue: "expedition-approach-continue",
};

export function getExpeditionApproachLabel(option: ExpeditionChoiceOption): string {
  return APPROACH_LABEL[option];
}

// Mesmo ícone já usado pela linha de resultado acima — única fonte de
// verdade, nunca um segundo mapa de ícones por opção.
export function getExpeditionApproachIcon(option: ExpeditionChoiceOption): string {
  return OUTCOME_ICON[option];
}

export function getExpeditionApproachAccentClass(option: ExpeditionChoiceOption): string {
  return APPROACH_ACCENT_CLASS[option];
}
