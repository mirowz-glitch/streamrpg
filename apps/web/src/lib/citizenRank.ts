import type { CitizenRank } from "@streamrpg/shared";
import { CITIZEN_RANK_LADDER } from "@streamrpg/shared";

/**
 * Sprint Citizen Progression (Vision 2.0, Sprint 4), Fase 7 — rótulo em
 * português de cada estágio (mesma convenção de idioma do resto da UI).
 * Função pura, sem JSX (D3, docs/architecture/decisions.md) — só
 * formatação de texto, nenhuma regra de negócio.
 */
const RANK_LABELS: Record<CitizenRank, string> = {
  visitante: "Visitante",
  residente: "Residente",
  cidadao: "Cidadão",
  veterano: "Veterano",
  lenda: "Lenda",
};

export function citizenRankLabel(rank: CitizenRank): string {
  return RANK_LABELS[rank];
}

export function citizenRankLadder(): Array<{ rank: CitizenRank; label: string }> {
  return CITIZEN_RANK_LADDER.map((rank) => ({ rank, label: citizenRankLabel(rank) }));
}
