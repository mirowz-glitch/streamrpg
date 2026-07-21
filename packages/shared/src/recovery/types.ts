// Recovery & Adventure Flow Phase I — tipos isolados de propósito. A
// Recovery Layer "nunca conhece regras de combate" (requisito 3): ela
// só lê PresentationEvent/AdventureSession já produzidos pela camada
// de baixo (Presentation Layer, intocada) e decide QUANTO curar,
// nunca COMO o combate funciona.

// Requisito 2 — os 4 tipos de recuperação preparados; só
// "percent-of-max-life" tem lógica real nesta Sprint (ver
// recoveryLayer.ts). Os outros 3 existem como union members — mesmo
// princípio de "Future Hooks" já usado em EnemyFutureFlags/
// AdventureFutureHooks/EncounterFutureFlags: aceitos por tipagem,
// nunca produzidos de verdade ainda.
export type RecoveryStrategyType = "percent-of-max-life" | "fixed" | "level-based" | "rarity-based";

// Requisito 9 — Configuração: nenhum número mágico espalhado, tudo
// centralizado em config.ts. Cada campo é opcional porque só o
// strategy realmente ATIVO (`type`) precisa do seu próprio parâmetro —
// os outros 3 ficam documentados, prontos pro dia em que ganharem
// lógica real (poções/fogueiras/fontes/habilidades, requisito 10),
// sem exigir uma nova mudança de shape.
export interface RecoveryConfig {
  type: RecoveryStrategyType;
  // "percent-of-max-life" (implementado): fração (0-1) da vida máxima
  // recuperada a cada encontro concluído com sucesso.
  percentOfMaxLife?: number;
  // "fixed" (preparado, não implementado nesta Sprint): quantidade fixa
  // de vida por encontro concluído.
  fixedAmount?: number;
  // "level-based" (preparado, não implementado nesta Sprint): vida
  // recuperada por nível do personagem.
  perLevelAmount?: number;
  // "rarity-based" (preparado, não implementado nesta Sprint): não há
  // nenhuma fonte real de cura por raridade ainda (nenhum item/poção
  // existe) — quando existir, este campo mapeia raridade -> multiplicador.
  rarityMultipliers?: Partial<Record<string, number>>;
}

// Requisito 1 — "motivo" da recuperação: só "encounter-finished" é real
// nesta Sprint (a única condição implementada: encontro concluído com
// sucesso, personagem vivo). Union preparada pro dia em que descanso/
// fogueira/consumível também concederem cura (requisito 10).
export type RecoveryReason = "encounter-finished" | "rest" | "consumable" | "ability";

// Resultado de uma tentativa de aplicar recuperação num tick — "nunca
// null por acidente": `lifeHealed` é sempre >= 0; 0 significa "nenhuma
// recuperação aconteceu nesta tick" (ex.: encontro não concluído,
// personagem já com vida cheia, ou personagem morto).
export interface RecoveryResult {
  applied: boolean;
  reason: RecoveryReason;
  lifeBefore: number;
  lifeHealed: number;
  lifeAfter: number;
  tickIndex: number;
}
