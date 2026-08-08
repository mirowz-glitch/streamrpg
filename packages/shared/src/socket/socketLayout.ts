/**
 * Sprint 20 — Sockets & Gemas Phase I, Fase 3: SocketLayout. "Cada
 * Base poderá possuir mínimo/máximo de sockets, chance de nascer com
 * cada quantidade. Nada fixo, nada hardcoded."
 *
 * Achado da Fase 1 (auditoria): a distribuição REAL de sockets hoje
 * (`deriveSocketCountFromSeed`, sockets.ts, Sprint 15) é uniforme
 * 0-6 para TODA Base, sem nenhuma configuração por Base — exatamente
 * o gap que esta Fase preenche. Este módulo é deliberadamente
 * infraestrutura pura: `resolveSocketCountFromLayout()` existe e é
 * testável, mas NUNCA é chamada pelo pipeline real de geração
 * (`itemgen/generator.ts`/`drop.service.ts`) nesta Sprint — calibrar a
 * distribuição real seria "Balanceamento", explicitamente restrito
 * ("NÃO implementar: Balanceamento"). `deriveSocketCountFromSeed`
 * continua sendo a única função que a geração real usa.
 */
import type { BaseIdentityTier } from "../baseIdentity/types.js";

/** Uma quantidade possível de Sockets + o peso dela dentro do pool da Base. */
export interface SocketCountWeight {
  count: number;
  weight: number;
}

/** O layout de Sockets de UMA Base — min/max só documentam os extremos já implícitos em `weights`, nunca uma segunda fonte de verdade. */
export interface SocketLayout {
  baseId: string;
  minSockets: number;
  maxSockets: number;
  weights: SocketCountWeight[];
}

export type SocketLayoutRegistry = Record<string, SocketLayout>;

export function getSocketLayout(registry: SocketLayoutRegistry, baseId: string): SocketLayout | undefined {
  return registry[baseId];
}

/**
 * Resolve uma contagem de Sockets a partir de um `roll` em [0, 1) e do
 * layout de uma Base — mesmo padrão de `resolveUncertaintyOutcome`
 * (transformation/resolver.ts, Sprint 17): pesos relativos, nunca
 * chance absoluta isolada. Devolve `minSockets` se o layout não tiver
 * nenhum peso configurado (nunca lança — configuração degenerada cai
 * pro piso, não é um erro de runtime).
 */
export function resolveSocketCountFromLayout(layout: SocketLayout, roll: number): number {
  const totalWeight = layout.weights.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight <= 0) return layout.minSockets;

  let cursor = roll * totalWeight;
  for (const w of layout.weights) {
    if (cursor < w.weight) return w.count;
    cursor -= w.weight;
  }
  return layout.weights[layout.weights.length - 1]!.count;
}

/**
 * Exemplo de referência (Fase 12 pede cobertura, não conteúdo
 * definitivo): Bases de Tier mais alto (Sprint 19, `baseIdentity/`)
 * tendem a um teto de Sockets mais alto — mesma lógica honesta de
 * "ler o dado já real" usada pra derivar Tier/Potential na Sprint 19,
 * nunca um número arbitrário solto. `BaseIdentityTier` é só o TIPO
 * reaproveitado aqui pra documentar a relação — este módulo não lê o
 * BaseIdentityRegistry de verdade (evita acoplar `socket/` a
 * `baseIdentity/` em runtime; a Sprint que decidir wire de verdade
 * decide isso).
 */
export function exampleMaxSocketsForTier(tier: BaseIdentityTier): number {
  return Math.min(6, tier + 1);
}
