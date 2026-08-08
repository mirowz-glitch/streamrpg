/**
 * Sprint 10 — Itemization 2.0 (infra prep only, sem lógica completa,
 * sem UI, sem tabela nova). Ver Fase 1 do relatório de entrega
 * (docs/design/itemization2-phase1-implementation.md) para a auditoria
 * completa.
 *
 * IMPORTANTE — o que este módulo NÃO faz: não substitui `itemgen/`.
 * Prefixo/Sufixo/Tier procedurais estilo PoE2 JÁ EXISTEM e funcionam de
 * verdade (`ItemGenModDefinition`/`ItemGenModTier`/`ItemGenRolledMod`,
 * `itemgen/types.ts`, com weights/tags/exclusão de grupo/continuous
 * scaling já implementados em Sprints anteriores). As Fases 4/5 do
 * brief pedem para "preparar" essa infra — a auditoria encontrou que
 * ela já existe; os aliases abaixo só dão a esses tipos o NOME que o
 * brief usa, sem duplicar nenhum campo.
 */
import type { ItemGenModDefinition, ItemGenRolledMod } from "../itemgen/types.js";

// --- Aliases documentados (Fase 2/4/5) — apontam pro que já existe ---

/** Um afixo já rolado num item — já existe como `ItemGenRolledMod`. */
export type ItemAffix = ItemGenRolledMod;
/** Um afixo do tipo prefixo — mesmo `ItemGenRolledMod`, filtrar por `type === "prefix"`. */
export type ItemPrefix = ItemGenRolledMod;
/** Um afixo do tipo sufixo — mesmo `ItemGenRolledMod`, filtrar por `type === "suffix"`. */
export type ItemSuffix = ItemGenRolledMod;
/** A DEFINIÇÃO de um afixo (antes de rolar) — já existe como `ItemGenModDefinition`. */
export type ItemModifier = ItemGenModDefinition;

// --- Conceitos genuinamente novos desta Sprint (não existiam antes) ---

/**
 * Estágio do ciclo de vida de um item (Fase 3). Hoje só os dois
 * primeiros existem de verdade no pipeline real
 * (`itemgen/generator.ts`: Base Item -> Generated Item). Crafted/
 * Legendary/Historical são os estágios que Sprints futuras de
 * Crafting/Esferas vão produzir — nenhum código real transiciona um
 * item entre eles ainda.
 */
export type ItemStage = "base" | "generated" | "crafted" | "legendary" | "historical";

/**
 * Tier do ITEM inteiro — não confundir com `ItemGenModTier.tier`
 * (`itemgen/types.ts`), que é o tier de UM afixo específico. Ainda não
 * calculado por nenhum sistema real; pensado como um resumo derivado
 * (ex.: função da soma dos tiers dos afixos rolados) — a fórmula fica
 * para a Sprint que implementar de verdade.
 */
export type ItemTier = 1 | 2 | 3 | 4 | 5;

/**
 * Potencial de um item (Fase 8) — o teto até onde ESTA instância
 * específica pode evoluir via craft, sorteado no nascimento do item.
 * Distinto de `AffixValueEnvelope` (itemgen/continuousScaling.ts), que
 * já define o teto por Item Level para TODOS os itens daquele nível —
 * Potential é por INSTÂNCIA, dentro da faixa que o Envelope já
 * permite (nunca a ultrapassa).
 */
export interface ItemPotential {
  /** 0-1: fração do teto do Envelope que este item pode alcançar via craft. */
  ceilingFraction: number;
  /** ISO timestamp — sorteado no nascimento do item, nunca recalculado depois. */
  rolledAt: string;
}

/**
 * Qualidade (Fase 9) — deliberadamente separada de raridade e separada
 * de afixos (mesmo princípio de Path of Exile: Quality escala um
 * atributo BASE do item, nunca adiciona/remove um afixo, nunca muda a
 * raridade).
 */
export interface ItemQuality {
  /** 0-20 — mesma faixa de referência que Path of Exile usa; não calibrado. */
  value: number;
  /** Qual atributo BASE a Qualidade escala (ex.: "baseDamage", "baseDefense"). */
  scalesAttribute: string;
}

/**
 * Estado de craft (Fase 2/7) — se o item ainda aceita intervenção
 * (Esferas, reroll, reforja) ou já foi selado (Esfera da Maldição,
 * ver spheres.ts). `"open"` é o estado de todo item hoje — nenhum
 * item real tem este campo ainda.
 */
export type ItemCraftState = "open" | "sealed";

/**
 * Legado (Fase 2/6, Sprint 10) — resumo compacto derivado do Item
 * History completo (history.ts) para exibição rápida (ex.: "3º dono,
 * sobreviveu a 2 Bosses") sem precisar carregar o log inteiro. Ver
 * `deriveItemLegacyFromHistory()` em history.ts.
 *
 * Sprint 14 — Legendary Items + Legacy System: os 6 campos abaixo de
 * "economia/posse" foram adicionados quando `history.ts` ganhou os
 * eventos reais `"sold"`/`"salvaged"` (o gap documentado na Sprint 11:
 * `removeItem()` só apaga `character_items`, nunca a linha de `items`
 * — o histórico sobrevive à venda/desmontagem). `firstOwner`/
 * `currentOwner` só existem aqui como passthrough de `ItemHistory`
 * (nunca recalculados) — sem troca de item entre personagens (nenhum
 * sistema de trade existe ainda), `currentOwner` sempre == `firstOwner`
 * hoje; o campo já existe pronto pra quando isso mudar.
 */
export interface ItemLegacy {
  ownerCount: number;
  bossesWitnessed: number;
  kingdomsVisited: number;
  ageInDays: number;
  soldCount: number;
  salvagedCount: number;
  /** Maior valor de venda já registrado (ouro) — `null` se nunca foi vendido. */
  highestSalePrice: number | null;
  /** Eventos "sphere_applied" + "sealed" somados — quantas Esferas este item já recebeu. */
  sphereEventsCount: number;
  firstOwnerCharacterId: string;
  currentOwnerCharacterId: string;
}

/**
 * O afixo, do ponto de vista de PERSISTÊNCIA (Fase 4/5) — o formato que
 * uma futura coluna `items.affixes` (JSON) precisaria satisfazer para
 * não perder o que `itemgen/generator.ts` já rola hoje (achado da Fase
 * 1: a tabela `items` real só guarda `rarity`/`power_score`/
 * `upgrade_level`, nunca o array de prefixos/sufixos — ele é
 * descartado no momento da persistência). Idêntico a `ItemGenRolledMod`
 * de propósito, nunca duplica campos — só marca que este é o contrato
 * de PERSISTÊNCIA, distinto do contrato de GERAÇÃO.
 */
export type PersistedItemAffix = ItemGenRolledMod;

// Sprint 11 — Persistent Items + Affixes. `derivePotentialFromSeed()`
// satisfaz "cada item nasce com potencial diferente" (Sprint 10, Fase
// 8) sem introduzir nenhuma nova fonte de RNG/balanceamento: deriva um
// valor determinístico do MESMO seed que o Item Generator já usa
// (`ItemGenGeneratedItem.seed`) — a mesma seed sempre produz o mesmo
// Potential, nenhuma chamada a Math.random. "Sem gameplay" (per o
// brief desta Sprint) porque nada ainda LÊ `ceilingFraction` para
// limitar coisa alguma — é só o dado persistido, pronto para a Sprint
// de Crafting consumir.
const POTENTIAL_MIN_FRACTION = 0.6;
const POTENTIAL_MAX_FRACTION = 1.0;

function stableHashForPotential(seed: number): number {
  // Mesmo espírito de world/deriveWorldPresence.ts (stableHash) — um
  // hash determinístico simples, nunca RNG do jogo (itemgen/rng.ts é
  // reservado para loot/combate, D1).
  let hash = seed | 0;
  hash = (Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) | 0) >>> 0;
  hash = (Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) | 0) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function derivePotentialFromSeed(seed: number, rolledAtIso: string): ItemPotential {
  const normalized = (stableHashForPotential(seed) % 1000) / 1000;
  const ceilingFraction = POTENTIAL_MIN_FRACTION + normalized * (POTENTIAL_MAX_FRACTION - POTENTIAL_MIN_FRACTION);
  return { ceilingFraction: Math.round(ceilingFraction * 1000) / 1000, rolledAt: rolledAtIso };
}

/**
 * Qualidade sempre nasce em 0 (mesmo padrão de Path of Exile: um item
 * encontrado nunca já vem com Qualidade — só craft futuro a eleva).
 * `scalesAttribute` fica `null` até uma Sprint de Crafting decidir qual
 * atributo cada slot escala — nenhuma suposição inventada aqui.
 */
export function createDefaultQuality(): ItemQuality {
  return { value: 0, scalesAttribute: "" };
}

/**
 * Ponto de extensão futuro: um item persistido, quando Crafting/
 * History/Spheres existirem de verdade, precisará de todos estes
 * campos ao lado dos já existentes (rarity/slot/power_score/
 * upgrade_level, hoje em `items`, apps/api/src/config/schema.ts).
 * NÃO é uma tabela nem uma migração — é só o contrato que uma
 * migração futura precisaria cobrir. Nenhum campo aqui é lido ou
 * escrito por nenhum código real ainda.
 */
export interface ItemizationExtension {
  stage: ItemStage;
  tier: ItemTier | null;
  potential: ItemPotential | null;
  quality: ItemQuality | null;
  craftState: ItemCraftState;
  affixes: PersistedItemAffix[];
  legacy: ItemLegacy | null;
}
