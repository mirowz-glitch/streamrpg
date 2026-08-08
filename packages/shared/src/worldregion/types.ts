import type { ItemGenRarityId } from "../itemgen/types.js";
import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";

// World Loot System Phase I (Sprint 25) — requisito arquitetural do
// brief: "Mundo -> Região -> Biome -> Zona -> Monstro -> Item." Este
// módulo cria as duas camadas que ainda não existiam como conceito
// PRÓPRIO: Região do Mundo (World Region) e Bioma (Biome, um TIPO
// reusável, não um lugar) — nenhuma das duas existe hoje fora do
// `BiomeDefinition` de `worldencounter/biomes.ts`, que (apesar do nome)
// já é metadado de REGIÃO (climate/description/difficultyLabel, um
// registro por `regionId`), não um tipo de bioma reusável entre
// regiões. Ver nota de auditoria completa em `worldRegions.ts`.
//
// Nada aqui é lido por generator.ts/lootIntegration.ts/drop.service.ts
// ainda — "Nunca gera Item. Só define o perfil" (Fase 3 do brief).

// Fase 4 — Biome Registry. Brief lista 8 exemplos (Floresta/Ruínas/
// Montanhas/Pântano/Deserto/Castelo/Cavernas/Campos) e depois, na Fase
// 6, nomeia um 9º ("Templos") pra afinidade da Esfera da Purificação —
// tratado como extensão da mesma lista de exemplos (a própria Fase 4 os
// chama de "Exemplos", nunca de lista fechada), não como uma
// inconsistência a ser escondida. Nenhuma região real usa "temple"
// ainda — tipo inerte, pronto pra uma região futura (mesmo padrão de
// `world_event`/`future_raid` inertes da Sprint 24).
export type BiomeTypeId = "forest" | "ruins" | "mountains" | "swamp" | "desert" | "castle" | "caves" | "plains" | "temple";

export interface BiomeType {
  id: BiomeTypeId;
  name: string;
  description: string;
}

// Fase 2 — World Region. Campos exatamente como o brief pede. `id`
// SEMPRE reaproveita um `regionId` real já existente em `regions.ts`
// (REGION_GRAPH) — nunca uma região inventada, mesma disciplina de
// "nunca inventar dado" já usada em `biomes.ts`. `dropProfile` referencia
// `DropProfile.id` (dropProfile.ts) por id, nunca embutido inline —
// mesmo padrão de referência-por-id de `WorldRegion.biome` ->
// `BiomeType.id`.
export interface WorldRegion {
  id: string;
  name: string;
  biome: BiomeTypeId;
  dangerLevel: number;
  economyTier: number;
  dropProfile: string;
  enabled: boolean;
}

// Fase 3 — Drop Profile. "Define: raridade, bases, esferas, gemas,
// materiais, ouro. Nunca gera Item. Só define o perfil." Todo campo é
// um multiplicador (1 = neutro/sem efeito), nunca uma chance final —
// nenhum consumidor real lê nada disto ainda (ver dropProfile.ts).
// `baseAffinity`/`sphereAffinity` aqui são o efeito AGREGADO por região
// (uma leitura conveniente); a fonte de verdade da afinidade em si é a
// tabela por BIOMA (baseAffinity.ts/sphereAffinity.ts, Fase 5/6) — um
// Drop Profile nunca declara afinidade própria divergente da do seu
// bioma, sempre a herda (ver `buildDropProfileForRegion` em
// dropProfile.ts).
export interface DropProfile {
  id: string;
  rarityWeightMultipliers: Partial<Record<ItemGenRarityId, number>>;
  baseAffinity: Partial<Record<string, number>>;
  sphereAffinity: Partial<Record<SphereTypeId, number>>;
  gemAffinity: Partial<Record<GemCategory, number>>;
  materialTypes: string[];
  goldMultiplier: number;
  enabled: boolean;
}

// Fase 7 — Materiais regionais. "Cada região gera materiais próprios.
// Ainda sem crafting. Apenas infraestrutura." Catálogo de TIPOS de
// material (nome/bioma de origem) — nunca um novo ResourceId: o recurso
// `"materials"` (economy/types.ts) continua sendo um único contador
// escalar; este catálogo é só um vocabulário descritivo por cima dele,
// do mesmo jeito que `itemization/spheres.ts` descreve Esferas sem
// mexer no Ledger.
export interface MaterialType {
  id: string;
  name: string;
  biome: BiomeTypeId;
}
