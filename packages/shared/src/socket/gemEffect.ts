/**
 * Sprint 21 — Gem Effects Phase I, Fase 2/4. Primeira utilidade real da
 * Gema — "Itens continuam sendo o principal fator de poder. Gemas
 * refinam a Build. Nunca substituem o equipamento." Camada de
 * CATÁLOGO (o que um EFEITO é), separada de `GemDefinition` (o que uma
 * GEMA é) — uma `GemDefinition` referencia um `GemEffect` por id
 * (Fase 3), nunca embute o efeito diretamente (mesmo princípio de
 * `GemDefinition` referenciar `GemCategory` em vez de reimplementar
 * vocabulário).
 *
 * "Uma Gema nunca altera diretamente: raridade, Base, Prefixos,
 * Sufixos, Craft, Legacy, História" — `GemEffect` nunca toca nenhum
 * desses campos; só concede um modificador de STATUS DERIVADO
 * (Fase 6), sempre recalculado, nunca persistido.
 */

/**
 * Fase 4 — os 7 tipos de exemplo QA pedidos pelo brief, nada além
 * disso ("Nenhum efeito complexo ainda"). Nomeados no vocabulário do
 * Combat Model existente (`docs/combat-model/canonical-formula.md`)
 * sempre que um equivalente direto existe.
 */
export type GemEffectStatType = "attack" | "defense" | "critical" | "life" | "mana" | "attackSpeed" | "magic";

/**
 * "percent": delta = valor% do stat-base correspondente (ex.: Ataque
 * +5% de um Ataque base real). "flat": delta = valor, somado direto,
 * independente de base. A escolha entre os dois, por tipo, é decisão
 * de conteúdo de cada `GemEffect` de exemplo — ver
 * `docs/design/gem-effects-phase1.md`, Fase 1 (auditoria): `critical`/
 * `life`/`mana`/`attackSpeed`/`magic` não têm nenhum stat-base real
 * ainda em `/api/character` (só `attack`/`defense` têm, via o combat
 * snapshot já existente), então um efeito `percent` sobre eles sempre
 * resolveria pra 0 — os exemplos desta Sprint usam `flat` pra esses 5
 * tipos, e `percent` só pra `attack`/`defense`.
 */
export type GemEffectScaling = "percent" | "flat";

/**
 * Fase 2 — campos mínimos pedidos pelo brief. `description` é o texto
 * pronto pra exibição (Fase 8 UI: "Ataque +5%", "Vida +30") — nunca
 * recalculado a partir de `type`/`value`/`scaling`, pra permitir texto
 * mais natural do que uma concatenação automática produziria.
 */
export interface GemEffect {
  id: string;
  type: GemEffectStatType;
  value: number;
  scaling: GemEffectScaling;
  enabled: boolean;
  description: string;
}

/** Fase 3 — todos os Efeitos do jogo, chaveados por id. Nada hardcoded fora daqui. */
export type GemEffectRegistry = Record<string, GemEffect>;
