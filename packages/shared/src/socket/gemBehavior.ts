/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 2. Segunda camada de
 * catálogo de uma Gema, deliberadamente separada de `GemEffect`
 * (Sprint 21):
 *
 *   GemEffect   → QUANTO aumenta (um número: +5% Ataque, +30 Vida).
 *   GemBehavior → COMO muda o jogo (um comportamento: ataques
 *                 causam fogo, chance de congelar, regeneração).
 *
 * Uma `GemDefinition` pode referenciar os dois ao mesmo tempo — não são
 * mutuamente exclusivos, nem um substitui o outro. "Itens continuam
 * sendo a maior fonte de poder. Gemas especializam. Não substituem.
 * Cada Gema deve mudar o estilo de jogo, não apenas aumentar números."
 */

/**
 * Fase 4 — os 6 comportamentos de exemplo pedidos pelo brief, nada
 * além. Cada `kind` é consumido em um ponto diferente do combate (ver
 * `docs/design/sockets-gems-phase2-build-system.md`, Fase 6/7/8):
 * - `onHitBonusFireDamage` (Rubi): dano adicional aditivo por acerto.
 * - `chanceToChill` (Safira): chance de reduzir o contra-ataque inimigo.
 * - `regenPerTick` (Esmeralda): vida extra na cura de fim de encontro.
 * - `manaPerTick` (Topázio): mana regenerada — hoje só derivado/exibido,
 *   nenhum sistema gasta mana ainda (mesma honestidade de sempre: nunca
 *   inventar um consumo que o jogo não tem).
 * - `bonusCriticalChance` (Ônix): pontos percentuais extras de crítico.
 * - `bonusResistance` (Ametista): redução percentual do dano recebido.
 */
export type GemBehaviorKind = "onHitBonusFireDamage" | "chanceToChill" | "regenPerTick" | "manaPerTick" | "bonusCriticalChance" | "bonusResistance";

/**
 * `magnitude` — o significado depende de `kind`, documentado por
 * comentário ao lado de cada exemplo em `gemBehaviorRegistry.ts`
 * (dano aditivo, percentual de chance, vida/mana flat, ou pontos
 * percentuais). `description` é texto pronto pra exibição (Fase 10),
 * nunca recalculado a partir de `kind`/`magnitude`.
 */
export interface GemBehavior {
  id: string;
  kind: GemBehaviorKind;
  magnitude: number;
  enabled: boolean;
  description: string;
}

/** Todos os Comportamentos do jogo, chaveados por id. Nada hardcoded fora daqui. */
export type GemBehaviorRegistry = Record<string, GemBehavior>;
