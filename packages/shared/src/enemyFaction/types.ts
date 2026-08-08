import type { BiomeTypeId } from "../worldregion/types.js";

// Enemy Factions Phase I (Sprint 26) — requisito arquitetural do
// brief: "Mundo -> Região -> Biome -> Facção -> Família -> Monstro ->
// Loot -> Item." Módulo prefixado `enemyFaction/` (nunca `factions/`,
// já ocupado pelo sistema de Reputação de Facções — ver Fase 1 desta
// Sprint e o achado documentado abaixo) pra nunca colidir.
//
// ACHADO CENTRAL DA AUDITORIA (Fase 1): duas infraestruturas parciais
// já existiam antes desta Sprint, nenhuma das duas duplicada aqui:
//
// 1. `lootidentity/archetypes.ts` (MonsterArchetype, 8 valores: beast/
//    undead/humanoid/bandit/mage/construct/demon/boss) — JÁ é real e
//    JÁ influencia drops de verdade hoje (`resolveLootBias()` ->
//    `generateMonsterLoot()`, `baseItemAffinity`/`affixAffinity`/
//    `rarityBias`). É a NATUREZA do monstro (o que ele É), um eixo
//    ortogonal à Facção (a que CULTURA/grupo político ele PERTENCE) —
//    um "beast" pode ser um Lobo comum (Facção Bestas) ou, em tese, um
//    monstro de estimação de outra cultura; nesta Sprint, todo Archetype
//    "beast" real mapeia pra Facção "Bestas" (ver enemyFamilies.ts),
//    mas os dois eixos permanecem conceitualmente distintos e nunca são
//    fundidos num tipo só. `archetype.currencyBias`/`futureCraftBias`
//    permanecem inertes exatamente como já estavam — não tocados.
//
// 2. `factions/` (FactionDefinition — Guardiões da Floresta/Mercadores
//    Livres/Culto das Ruínas/Legião Sombria) — sistema de REPUTAÇÃO do
//    jogador com uma facção que controla politicamente uma REGIÃO
//    (recompensa: bônus de XP/ouro). Eixo diferente: "quem manda nesta
//    terra", não "de que cultura é este monstro". As duas coexistem sem
//    conflito — um Cultista (Enemy Faction) pode aparecer tanto em
//    território do Culto das Ruínas quanto do Guardiões da Floresta
//    (ver swamp-witch em enemyFamilies.ts) exatamente porque cultura de
//    monstro e controle político regional nunca precisam coincidir.
//    Nenhum campo desta Sprint referencia `FactionDefinition.id` como
//    chave estrangeira — permanecem sistemas independentes.
//
// Reaproveitados de verdade (Sprint 25, `worldregion/`): `BiomeTypeId`
// (`preferredBiomes`) e o shape de `DropProfile` (mesmo tipo, nunca
// redefinido) — "reutilizar toda infraestrutura existente" também vale
// pra tipos, não só pra dados.

// Fase 2 — EnemyFaction. Campos exatamente como o brief pede.
// `economyProfile` referencia `FactionEconomyProfile.id` (Fase 5);
// `dropProfile` referencia `DropProfile.id` (Fase 6, MESMO tipo de
// worldregion/types.ts). `hostileTo` é infraestrutura pura nesta
// Sprint — ver nota em factionRegistry.ts.
export interface EnemyFaction {
  id: string;
  name: string;
  description: string;
  culture: string;
  economyProfile: string;
  dropProfile: string;
  preferredBiomes: BiomeTypeId[];
  hostileTo: string[];
  enabled: boolean;
}

// Fase 4 — Enemy Family: "Cada família pertence exatamente a uma
// Facção" (Decisão Oficial #2). `templateIds` referencia
// `EnemyTemplate.id` real (enemy/templates.ts) — nunca um monstro
// inventado.
export interface EnemyFamily {
  id: string;
  name: string;
  factionId: string;
  templateIds: string[];
}

// Fase 5 — Faction Economy Profile: tendência de recurso por facção
// (Goblins->ouro, Mortos-Vivos->materiais, Cultistas->Esferas,
// Império->equipamentos, Bestas->gemas — os 5 exemplos literais do
// brief). Todo campo é multiplicador (1 = neutro); nenhum consumidor
// real (economy.service.ts/drop.service.ts/sphere.service.ts) lê nada
// disto ainda. Vocabulário deliberadamente PRÓPRIO (nunca fundido com
// `MonsterArchetype.currencyBias`, que usa `LootCurrencyType` — um
// enum sem "sphere"/"gem"/"equipment"): documentado como candidato de
// unificação futura, nunca implementado nesta Sprint (ver Fase 7).
export interface FactionEconomyProfile {
  id: string;
  goldTendency: number;
  materialsTendency: number;
  sphereTendency: number;
  gemTendency: number;
  equipmentTendency: number;
  enabled: boolean;
}
