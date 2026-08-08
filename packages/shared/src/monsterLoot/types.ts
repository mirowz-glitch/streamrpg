import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";

// Monster Loot Identity Phase I (Sprint 27) — requisito arquitetural:
// "Facção -> Família -> Monstro -> Assinatura própria" / pipeline
// completo "Mundo -> Região -> Biome -> Facção -> Família -> Monstro ->
// Monster Loot Identity -> Loot Generator -> Item Generator."
//
// ACHADO CENTRAL DA AUDITORIA (Fase 1) — motivo do nome deste módulo:
// `lootidentity/types.ts` JÁ EXPORTA um `MonsterLootIdentity` real,
// desde a Sprint "Monster Loot Identity Phase I" original (que deu
// nome ao próprio diretório `lootidentity/`). Aquele tipo
// (`{ monsterId, archetypeId, lootBiasOverride?, currencyBiasOverride?,
// futureHooks? }`) já é JÁ REAL e JÁ influencia drops de verdade hoje
// via `resolveLootBias()` -> `generateMonsterLoot()` — um propósito e
// um shape completamente diferentes do que este brief pede (que é uma
// ASSINATURA por Monstro/Família/Facção, com 12 campos próprios, ainda
// inerte). Reaproveitar o MESMO NOME criaria uma colisão de export no
// barrel de `packages/shared/src/index.ts` (mesmo problema já evitado
// nas Sprints 25/26 com `DropProfile`) e, pior, confundiria os dois
// conceitos na cabeça de quem ler o código depois.
//
// Decisão: o tipo desta Sprint chama-se `MonsterLootSignature` — o
// próprio termo que o brief usa na Fase 4 ("Loot Signature"/"Cada
// monstro ganha assinatura") — nunca `MonsterLootIdentity`. O conceito
// pedido pelo brief é implementado integralmente (mesmos 12 campos,
// mesma função), só o nome muda pra não colidir com um símbolo real já
// existente. Documentado aqui em vez de escondido — "nunca duplicar,
// documentar o achado" (instrução do usuário).
export interface MonsterLootSignature {
  id: string;
  enemyTemplateId: string;
  familyId: string;
  factionId: string;
  preferredBases: Partial<Record<string, number>>;
  preferredAffixes: Partial<Record<string, number>>;
  preferredMaterials: string[];
  preferredSpheres: Partial<Record<SphereTypeId, number>>;
  preferredGems: Partial<Record<GemCategory, number>>;
  preferredLegendaryChance: number;
  preferredCurrency: string;
  enabled: boolean;
}

// Fase 5 — Economic Profile. Vocabulário DELIBERADAMENTE idêntico ao de
// `enemyFaction/types.ts` (`FactionEconomyProfile`, Sprint 26) — Gold/
// Material/Equipment/Sphere/Gem, mesmos 5 nomes, nunca uma terceira
// nomenclatura para o mesmo conceito de tendência de recurso. Tipo
// próprio (não um alias direto) só porque este é escopado por MONSTRO,
// não por Facção — a distinção arquitetural que esta Sprint inteira
// existe pra criar.
export interface MonsterEconomicProfile {
  id: string;
  goldTendency: number;
  materialsTendency: number;
  sphereTendency: number;
  gemTendency: number;
  equipmentTendency: number;
  enabled: boolean;
}
