/**
 * Sprint 17 — Esfera da Incerteza 2.0 (Revelação, Risco e
 * Transformações). Substitui o modelo da Sprint 16 — infraestrutura
 * apenas, "sem conteúdo definitivo, sem balanceamento" continua valendo,
 * mas a filosofia central mudou: **a Esfera da Incerteza nunca falha.**
 * "Nada aconteceu" deixou de existir como resultado possível — todo uso
 * SEMPRE produz um `TransformationOutcome` real.
 *
 * Mirror (decisão oficial da Sprint 16, reafirmada): removido, não
 * existe, não haverá equivalente. Nenhum código deste domínio (ou de
 * qualquer outro) implementa duplicação de item.
 */
import type { ItemRarity } from "../types.js";

/**
 * Fase 3 — o resultado de uma transformação pertence a EXATAMENTE um
 * destes 5 (nunca combina dois). `upgrade`/`downgrade` mudam raridade
 * pra cima/baixo mantendo a mesma identidade de Base; `mutation` troca
 * completamente a identidade (nome/raridade) sem ser nem melhoria nem
 * piora clara; `reveal` é uma versão especial nomeada; `mythic_reveal`
 * é o resultado mais raro — só existe através desta Esfera (Fase 5/6).
 */
export type TransformationOutcome = "upgrade" | "downgrade" | "mutation" | "reveal" | "mythic_reveal";

/**
 * Fase 9 — agrupamento por raridade do RESULTADO, só pra organização/
 * balanceamento futuro (ferramentas de tuning agrupando por pool) —
 * nunca lido pelo resolver pra decidir elegibilidade ou peso; o peso
 * real de cada transformação continua sendo só `TransformationWeight.weight`.
 * "mythic" é deliberadamente distinto de qualquer `ItemRarity` existente
 * (nunca uma raridade jogável normal — só o rótulo do pool mais raro).
 */
export type TransformationRarityPool = "common" | "rare" | "epic" | "legendary" | "mythic";

/**
 * Fase 6 — de onde um resultado exclusivo pode vir. `null` = resultado
 * comum, obtenível por qualquer caminho compatível (nenhum hoje, só
 * infraestrutura). Um valor não-nulo marca que ESTE resultado específico
 * só existe através daquela fonte — "Anel do Primeiro Rei" (Fase 5) usa
 * `"uncertainty"`: nunca dropa em Boss/Dungeon/Evento, só existe através
 * da Esfera da Incerteza.
 */
export type ExclusiveSource = "uncertainty" | "future_event" | "world_event" | "npc" | "quest";

/**
 * Condição opcional que uma `BaseTransformation` pode exigir para ficar
 * elegível num roll específico — nada fixo em código, tudo lido destes
 * registros. Union fechada por enquanto — cada `kind` novo é aditivo,
 * nunca quebra os existentes.
 */
export type TransformationCondition = { kind: "min_item_level"; value: number } | { kind: "rarity_at_least"; value: ItemRarity };

/**
 * Uma transformação possível para UMA Base específica. `enabled`
 * permite desligar uma transformação sem removê-la do registro (nunca
 * um `if` espalhado pelo código decidindo disponibilidade).
 * `exclusiveSource` (Fase 6) é `null` pra maioria — só os resultados
 * verdadeiramente exclusivos (ex.: o Mítico da Fase 5) marcam a fonte.
 */
export interface BaseTransformation {
  id: string;
  baseItemId: string;
  outcome: TransformationOutcome;
  revealedName: string;
  revealedRarity: ItemRarity;
  enabled: boolean;
  conditions: TransformationCondition[];
  exclusiveSource: ExclusiveSource | null;
}

/**
 * Peso relativo de uma `BaseTransformation` dentro do pool da sua Base
 * — nunca uma chance absoluta isolada. `pool` (Fase 9) só rotula qual
 * dos 5 pools de raridade esta entrada representa, pra agrupamento
 * futuro — não afeta o cálculo do roll.
 */
export interface TransformationWeight {
  transformationId: string;
  pool: TransformationRarityPool;
  weight: number;
}

/**
 * Fase 4 — o pool de possibilidades de UMA Base. `enabled` responde
 * "pode usar Esfera?" de forma explícita (distinto do `enabled` de cada
 * `BaseTransformation`, que liga/desliga só AQUELE resultado). Nunca
 * existe mais um `noneWeight` — "a Esfera nunca falha" (decisão oficial
 * desta Sprint): a soma dos pesos elegíveis SEMPRE precisa ser > 0 pra
 * toda Base com `enabled: true` — garantia de configuração, não
 * verificada aqui (ver resolver.ts).
 */
export interface BaseTransformationPool {
  baseItemId: string;
  enabled: boolean;
  weights: TransformationWeight[];
}

/** O registro de quais Bases aceitam a Esfera da Incerteza e com quais resultados. */
export type BaseTransformationPoolRegistry = Record<string, BaseTransformationPool>;

/**
 * Resultado de um único uso da Esfera da Incerteza — pura descrição do
 * que aconteceu, nunca aplica efeito sozinha. Nunca `null`/"none": a
 * Esfera sempre produz um `TransformationOutcome` real (Fase 2).
 */
export interface TransformationOutcomeResult {
  outcome: TransformationOutcome;
  transformationId: string;
  revealedName: string;
  revealedRarity: ItemRarity;
  detail: string;
}
