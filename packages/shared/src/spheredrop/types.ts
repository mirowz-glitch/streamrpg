/**
 * Sprint 13 — Sphere Economy Phase I (World Distribution). Novo
 * domínio: COMO uma Esfera entra no mundo (drop), distinto de
 * `crafting/` (Sprint 12, COMO uma Esfera já possuída é usada) e de
 * `itemization/spheres.ts` (Sprint 10, O QUE cada Esfera é —
 * `SphereType.rarity` já cobre o conceito de "Tier" que o brief pede;
 * este módulo reusa, nunca duplica).
 *
 * "Não hardcodar taxas... criar uma infraestrutura configurável" — toda
 * taxa vive em dados (`sphereDropTable.ts`), nunca em código de
 * negócio; `rollSphereDrop()` só lê a tabela, nunca decide um número.
 */
import type { SphereTypeId } from "../itemization/spheres.js";

/**
 * As fontes de drop de Esferas. As 4 originais (Sprint 13): "World Boss"
 * nunca passa pelo Adventure Loop (packages/shared), é concedido direto
 * por `apps/api/src/systems/BossRewardSystem.ts`; as outras 3 nascem do
 * mesmo per-kill loop de `adventure/adventureLoop.ts`, diferenciadas
 * pelo contexto do encontro (variant + `AdvanceAdventureOptions.inDungeon`).
 *
 * Sprint 24 — Economy Foundation II: `world_event`/`future_raid`
 * adicionadas como infraestrutura (Fase 3, "cada uma independente") —
 * nenhum ponto real de emissão as chama ainda (nenhum World Event ou
 * Raid concede Esfera hoje), por isso suas entradas em
 * `DEFAULT_SPHERE_DROP_TABLE` ficam inertes (`dropChance: 0`,
 * `weights: []`) até uma Sprint futura decidir integrá-las — mesmo
 * princípio de "omissão real, nunca `if` no código" já usado pelas 4
 * fontes originais.
 */
export type SphereSource = "adventure" | "dungeon" | "boss" | "world_boss" | "world_event" | "future_raid";

/**
 * Peso relativo de UMA Esfera dentro do pool de uma fonte — nunca uma
 * probabilidade absoluta.
 *
 * Sprint 24 — Fase 5: campos de gating opcionais, infraestrutura
 * apenas ("Não balancear ainda. Criar apenas infraestrutura. Nada
 * hardcoded."). Nenhum destes campos é lido por `rollSphereDrop()`
 * ainda — todas as entradas reais de `DEFAULT_SPHERE_DROP_TABLE`
 * continuam sem nenhum deles definido, então o comportamento de drop
 * de hoje não muda em nada só por estes campos existirem no tipo. Uma
 * Sprint futura de balanceamento decide COMO (e SE) aplicar cada um.
 */
export interface SphereWeight {
  sphereId: SphereTypeId;
  weight: number;
  /** Nível mínimo do personagem/item para esta Esfera ser elegível nesta fonte. */
  minimumLevel?: number;
  /** Id de região/zona mínima exigida (mesmo vocabulário de `biomes.ts`). */
  minimumZone?: string;
  /** Tier mínimo de Boss (mesmo campo de `bosses.tier`) para fontes `boss`/`world_boss`. */
  minimumBossTier?: number;
  /** Marca uma entrada como exclusiva de uma temporada futura ainda sem sistema — nunca lido hoje. */
  futureSeason?: string;
}

/**
 * O pool completo de uma fonte: `dropChance` decide SE alguma Esfera
 * cai nesta oportunidade (kill/defeat); `weights` decide QUAL, dado que
 * caiu. Um `sphereId` ausente de `weights` (ou com `weight: 0`) nunca
 * pode ser sorteado por esta fonte — é assim que "Adventure nunca
 * dropa Maldição/Ascensão" (Fase 3) é garantido: omissão de dado, não
 * um `if` no código.
 */
export interface SpherePool {
  source: SphereSource;
  dropChance: number;
  weights: SphereWeight[];
}

/** A tabela completa — uma entrada por fonte. Configurável por design (Fase "Não hardcodar taxas"). */
export type SphereTable = Record<SphereSource, SpherePool>;

/** Resultado de UMA rolagem — `sphereId: null` é o caso comum (nada caiu). */
export interface SphereDropResult {
  source: SphereSource;
  sphereId: SphereTypeId | null;
}
