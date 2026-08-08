/**
 * Sprint 19 — Base Identity. "Hoje Espada/Machado/Arco/Anel são apenas
 * nomes... após esta Sprint, cada Base terá uma personalidade própria."
 *
 * Este módulo NUNCA duplica `ItemGenBaseItem` (itemgen/types.ts) — é
 * uma camada de identidade que se soma a ele, referenciando o mesmo
 * `id` (ex.: "sword", "ring"). `itemgen/` continua sendo a ÚNICA fonte
 * de dados neutros de geração (dano/defesa/velocidade/tags de
 * elegibilidade de afixo) — nada aqui é lido por
 * `generator.ts`/`isModEligibleForBase`, e nada aqui altera o pipeline
 * de Craft/Sockets/Gemas/Esferas.
 *
 * "Infraestrutura apenas" continua valendo: `implicitMods` existe como
 * dado mas NUNCA é aplicado a um item real nesta Sprint (Fase 4).
 */
import type { ItemGenCategory } from "../itemgen/types.js";

/**
 * Fase 5 — vocabulário de Tags de IDENTIDADE, deliberadamente
 * SEPARADO das `tags` de elegibilidade de afixo já existentes em
 * `ItemGenBaseItem.tags` (ex.: "melee"/"spell"/"physical" continuam
 * sendo lidas por `isModEligibleForBase`, nunca por este módulo).
 * `BaseIdentityTag` é uma segunda camada — "essas Tags serão usadas
 * futuramente por Craft/Sockets/Gemas/Boss/NPC/Mercado" — nenhum
 * sistema real ainda lê isto.
 */
export type BaseIdentityTag = "physical" | "caster" | "tank" | "speed" | "bleed" | "critical" | "fire" | "ice" | "lightning" | "summoner";

/**
 * Fase 6 — "Potential da BASE, não do item" (nunca confundir com
 * `ItemPotential`, itemization/types.ts, que é uma propriedade rolada
 * de UMA instância de item já existente). Base Potential é uma
 * característica FIXA da Base em si — "Espada Curta" é sempre Medium,
 * nunca varia por instância.
 */
export type BaseIdentityPotential = "low" | "medium" | "high" | "exceptional";

/** Fase 7 — separado de `ItemRarity` por completo; nunca lido por nenhuma regra de raridade existente. */
export type BaseIdentityTier = 1 | 2 | 3 | 4 | 5;

/**
 * Fase 4 — Implicit Modifier. Só a DESCRIÇÃO de um mod implícito que
 * uma Base poderia ter — "não aplicar ainda" (brief explícito): nenhum
 * item real ganha este bônus, nenhum Power Score é recalculado por
 * causa dele. `statLabel`/`value`/`unit` bastam pra descrever
 * "+8% velocidade" sem reaproveitar `ItemGenModDefinition` (que é o
 * pipeline de rolagem real de prefixo/sufixo — implicit mods nunca
 * rolam, são fixos por design de PoE-like).
 */
export interface BaseImplicitModifier {
  statLabel: string;
  value: number;
  unit: "percent" | "flat";
}

/** Fase 8 — tudo opcional, "poderá possuir". Nenhum campo obrigatório além do que já existe em BaseIdentity. */
export interface BaseLore {
  origin?: string;
  civilization?: string;
  era?: string;
}

/**
 * Fase 2 — campos mínimos pedidos pelo brief. `id` referencia
 * `ItemGenBaseItem.id` (mesmo catálogo, `itemgen/baseItems.ts`) — nunca
 * um id paralelo. `weaponClass`/`armorClass` são deliberadamente mais
 * granulares que `category` (`ItemGenCategory`, só 3 valores): hoje,
 * com só 1 Base por família de arma/armadura, cada `weaponClass`/
 * `armorClass` coincide com o próprio `id` — a separação existe pra
 * quando Bases futuras (ex.: "Espada Longa", "Espada Imperial")
 * puderem compartilhar a MESMA classe sem serem a mesma Base.
 */
export interface BaseIdentity {
  id: string;
  displayName: string;
  category: ItemGenCategory;
  weaponClass: string | null;
  armorClass: string | null;
  requiredLevel: number;
  implicitMods: BaseImplicitModifier[];
  description: string;
  tags: BaseIdentityTag[];
  enabled: boolean;
  /** Fase 6 — Potential da Base, não do item (ver `BaseIdentityPotential`). */
  potential: BaseIdentityPotential;
  /** Fase 7 — Tier da Base, separado de raridade (ver `BaseIdentityTier`). */
  tier: BaseIdentityTier;
  /** Fase 8 — tudo opcional. */
  lore: BaseLore;
}

/** Fase 3 — todas as Bases do jogo, chaveadas por id. Nada hardcoded fora daqui. */
export type BaseIdentityRegistry = Record<string, BaseIdentity>;

/**
 * Fase 10 — UI: "adicionar apenas uma linha... nada além". Resumo
 * mínimo pra resposta de Item (`PersistedItemFields.baseIdentity`,
 * types.ts) — deliberadamente NÃO expõe `implicitMods`/`tags`/`lore`
 * (infraestrutura ainda não consumida por nenhuma UI real nesta
 * Sprint), só o que a linha "Base: X · Tier N · Potential: Y" precisa.
 */
export interface BaseIdentitySummary {
  displayName: string;
  tier: BaseIdentityTier;
  potential: BaseIdentityPotential;
}
