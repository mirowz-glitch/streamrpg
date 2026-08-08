/**
 * Sprint 18 — Mythic Foundation. Esta Sprint NÃO cria mais Esferas, não
 * altera Craft/Socket/Gemas — só formaliza a fundação dos Itens
 * Míticos que a Sprint 17 deixou como gap: `mythic_reveal`
 * (transformation/types.ts) já existe como `TransformationOutcome`,
 * mas nenhum registro central descreve o QUE um Item Mítico É (lore,
 * fonte exclusiva, se pode ser descoberto) — cada `BaseTransformation`
 * com esse outcome só carregava um `revealedName` solto. Este módulo
 * fecha essa lacuna, sem tocar o pipeline de resolução (resolver.ts)
 * nem os dados de exemplo da Sprint 17.
 *
 * Filosofia oficial: Itens Míticos NUNCA droppam — Boss, Dungeon, NPC,
 * Evento, Quest, Craft, nada disso os produz. Eles só se REVELAM,
 * através da Esfera da Incerteza, e sempre nascem de uma Base (nunca
 * do vazio).
 */
import type { ItemRarity } from "../types.js";
import type { ExclusiveSource } from "../transformation/types.js";

/**
 * Fase 2 — descrição central de UM Item Mítico. Campos mínimos, só
 * infraestrutura ("não popular dezenas"). `baseItem` documenta de qual
 * Base este Mítico pode nascer (não substitui `BaseTransformation` —
 * é a ficha de identidade do resultado, não o mecanismo de roll).
 * `discoverable` controla se este Mítico participa do registro de
 * Discovery (Fase 5) — um Mítico pode existir (`enabled: true`) sem
 * ainda estar pronto pra ser o "primeiro descoberto" de ninguém.
 */
export interface MythicDefinition {
  id: string;
  displayName: string;
  baseItem: string;
  lore: string;
  exclusiveSource: ExclusiveSource;
  rarity: ItemRarity;
  enabled: boolean;
  discoverable: boolean;
}

/** Fase 3 — todos os Itens Míticos do jogo, chaveados por id. Nada hardcoded em sphere.service.ts — tudo lido daqui. */
export type MythicRegistry = Record<string, MythicDefinition>;

/**
 * Fase 4 — o que UMA Base declara sobre sua relação com a Esfera da
 * Incerteza e com Itens Míticos. Puramente descritivo — não substitui
 * `BaseTransformationPool` (que já é a fonte real de peso/elegibilidade,
 * transformation/types.ts); este registro é a camada de "o que esta
 * Base É capaz de fazer", consultável sem precisar iterar pesos.
 * `possibleTransformations` referencia `BaseTransformation.id`.
 */
export interface DiscoverableBase {
  baseItemId: string;
  supportsUncertainty: boolean;
  supportsMythic: boolean;
  possibleTransformations: string[];
}

export type DiscoverableBaseRegistry = Record<string, DiscoverableBase>;

/**
 * Fase 5 — Discovery. Registra a PRIMEIRA vez que um Mítico específico
 * foi revelado no servidor: primeiro jogador, primeiro Reino, primeira
 * data. Infraestrutura apenas — "sem ranking, sem UI" (a UI desta
 * Sprint só mostra Origem, Fase 10, nunca quem foi o primeiro).
 * Append-only por construção: uma vez que `mythicId` tem um registro,
 * ele nunca é sobrescrito (ver mythic/discovery.ts).
 */
export interface MythicDiscoveryRecord {
  mythicId: string;
  firstCharacterId: string;
  firstKingdomId: string | null;
  firstAt: string;
  server: string;
}

export type MythicDiscoveryRegistry = Record<string, MythicDiscoveryRecord>;
