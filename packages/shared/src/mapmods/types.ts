// Sprint 32 — Map Modifiers Phase I. Requisito arquitetural do brief:
// "Mapa -> Map Modifiers -> Monstros -> Loot", uma camada NOVA por CIMA
// de `MapDefinition` (Sprint 30/`worldmap/`) — nunca a substitui, nunca
// duplica seus campos. Filosofia: "Mods pertencem ao mapa. Nunca ao
// jogador. Nunca ao monstro. Nunca ao loot." — por isso este tipo nunca
// referencia `characterId`/`enemyTemplateId`/`itemId`; é sempre uma
// propriedade da INSTÂNCIA do mapa, lida de fora por quem quer que
// precise (nenhum consumidor real ainda).
//
// ACHADO DA AUDITORIA (Fase 1): já existe um sistema de "Modifier" real
// e wired — `expeditions/expeditionModifiers.ts`
// (`DungeonModifierDefinition`/`resolveDungeonRuntimeConfig()`,
// Vertical Slice "Dungeon Modifier Runtime Integration Phase I") — mas
// aquele é escopado por EXPEDIÇÃO (Dungeon), não por Mapa, e já produz
// efeito real em combate/encontro via `DungeonRuntimeConfig`. Nenhum
// campo/nome daqui colide com aquele módulo; nenhum dos dois é lido
// pelo outro. `MapModifier` (este arquivo) é deliberadamente meros
// dados ainda inertes — o oposto do estágio em que
// `DungeonModifierDefinition` já está.
export type MapModifierId = string;

// Fase 2 — 4 categorias, uma por eixo de efeito citado no brief: dano/
// vida do monstro (combat), chance de Elite/Boss mais forte (encounter,
// já que ambos mudam O QUE aparece no encontro, nunca o monstro em si),
// ouro/quantidade de loot/raridade (economy), experiência
// (progression). Nenhuma quinta categoria inventada além do que os 8
// exemplos literais do brief (Fase 4) realmente precisam.
export type MapModifierCategory = "combat" | "encounter" | "economy" | "progression";

// Fase 2 — Tier numérico (1 = mais comum/fraco, 3 = mais raro/forte),
// mesmo estilo já usado por `dangerLevel`/`economyTier`
// (`worldmap/types.ts`, Sprint 30) — nunca uma string livre. Nesta
// Fase, todo mod real (Fase 4) é Tier 1 — "sem balanceamento" (Fase 6)
// significa também não inventar uma progressão de tiers sem lastro no
// brief; Tier 2/3 ficam para uma Sprint futura que precise deles de
// verdade (Rare/Unique Maps).
export type MapModifierTier = 1 | 2 | 3;

// Fase 2 — peso relativo pra uma rolagem PONDERADA futura (mesmo
// conceito de `EncounterPackSizeOption.weight`/`LootTable.weight`, já
// reais em outros módulos) — nenhum código desta Sprint chama
// `pickWeighted()` com isso; existe só pra já ter o campo certo quando
// uma Sprint futura (Atlas/Map Device) precisar sortear Mods.
export type MapModifierWeight = number;

// Fase 2 — MapModifier: "propriedade da instância do mapa". Um único
// efeito nomeado por Mod (`magnitudePercent`, sempre um valor SOMENTE
// descritivo dos 8 exemplos literais do brief — Fase 4 — nunca lido por
// nenhum sistema de combate/loot/economia real ainda, Fase 7).
export interface MapModifier {
  id: MapModifierId;
  name: string;
  category: MapModifierCategory;
  tier: MapModifierTier;
  weight: MapModifierWeight;
  magnitudePercent: number;
  description: string;
  enabled: boolean;
}
