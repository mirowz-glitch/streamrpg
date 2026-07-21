import type { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import type { WorldEncounter, EncounterVariant } from "../worldencounter/types.js";

// Adventure Loop Phase I — tipos isolados de propósito. Conecta TODOS
// os sistemas anteriores sem alterar nenhum deles — só consome as
// classes/funções públicas já existentes.

// Requisito 1 — "Character" no diagrama de arquitetura é o pacote
// completo já existente (Character Build + Inventory + Equipment),
// nunca uma abstração nova duplicando dado. `criticalMultiplier` e
// `currentLife` são o mesmo gap já resolvido em Combat Engine/Enemy
// System — não existem em FinalStats, então viajam junto aqui, não
// dentro de nenhum dos três sistemas (não alterados).
export interface AdventureCharacter {
  characterBuild: CharacterBuild;
  inventory: Inventory;
  equipment: Equipment;
  criticalMultiplier: number;
  currentLife: number;
}

// Requisito 3 — Adventure Statistics: tudo centralizado num objeto só,
// nunca contadores espalhados pelo código. `goldFound` fica sempre 0
// nesta fase — LootResult.currencies é sempre `[]` (Loot Generator
// Phase I: "ainda não implementar moedas"), então não existe dado real
// de ouro pra contar ainda.
export interface AdventureStatistics {
  encountersCompleted: number;
  enemiesKilled: number;
  damageDealt: number;
  damageTaken: number;
  itemsFound: number;
  itemsEquipped: number;
  goldFound: number;
  elapsedTime: number;
}

// Requisito 6 — Future Hooks: aceitos por tipagem, nunca lidos por
// nenhuma lógica real desta Sprint. Quests/Achievements/Events/World
// Bosses/NPCs/Shops/Shrines/Season Mechanics — nenhum implementado.
export interface AdventureFutureHooks {
  activeQuestIds?: string[];
  unlockedAchievementIds?: string[];
  activeEventIds?: string[];
  worldBossEncounterId?: string;
  nearbyNpcIds?: string[];
  shopIds?: string[];
  shrineIds?: string[];
  seasonId?: string;
}

// Requisito 1 — AdventureSession: sessionId/character/currentRegion/
// currentEncounter/statistics/seed/startTime/futureHooks, "nenhuma
// lógica de UI". `currentEncounter` fica `null` sempre que não há
// nenhum encontro em andamento (nunca há um antes do primeiro tick, e
// volta a `null` depois de um encontro totalmente resolvido); só
// permanece preenchido quando o personagem morre no meio de um
// encontro (útil pro Session Result mostrar onde a aventura parou).
export interface AdventureSession {
  sessionId: string;
  character: AdventureCharacter;
  currentRegion: string;
  currentEncounter: WorldEncounter | null;
  statistics: AdventureStatistics;
  seed: number;
  startTime: number;
  futureHooks: AdventureFutureHooks;
}

// Engine Observability & Event Derivation Phase I — fato bruto de UM
// item gerado pelo Loot Generator nesta tick, independente de ter
// entrado ou não no Inventory (`stored`). Existe pra que a Presentation
// Layer possa observar "o engine gerou este item" sem precisar
// comparar o Inventory antes/depois (a causa raiz identificada pela
// Engine Audit Phase I: quando o Inventory está cheio, `addItem()`
// falha e o item silenciosamente deixa de existir pra quem só observa
// o Inventory).
export interface LootDropRecord {
  instanceId: string;
  baseItemId: string;
  rarity: string;
  powerScore: number;
  stored: boolean;
}

// Requisito 2 — resumo do que aconteceu numa única chamada de
// advanceAdventure(), pra quem chama (testes/smoke/futura camada de
// integração) saber o que mudou sem precisar comparar o snapshot
// inteiro da sessão antes/depois.
//
// Engine Observability & Event Derivation Phase I — `lootDrops`/
// `encounterVariant`/`variantEnemyTemplateId`/`variantEnemyDefeated`
// são fatos do engine capturados ANTES de qualquer tentativa de
// `inventory.addItem()`/de `session.currentEncounter` ser zerado (ver
// adventureLoop.ts) — nenhum depende de diff de Inventory/Equipment.
// `encounterVariant`/`variantEnemyTemplateId` ficam preenchidos sempre
// que o encontro resolvido nesta tick não é "normal" (vitória OU
// derrota); `variantEnemyDefeated` só é true na vitória.
export interface AdventureTickResult {
  encounterGenerated: boolean;
  enemiesEncountered: number;
  enemiesKilledThisTick: number;
  itemsFoundThisTick: number;
  itemsEquippedThisTick: number;
  characterAlive: boolean;
  lootDrops: LootDropRecord[];
  encounterVariant: EncounterVariant;
  variantEnemyTemplateId: string | null;
  variantEnemyDefeated: boolean;
}

// Requisito 5 — Session Result: "nenhuma dependência de interface", só
// dados.
export interface AdventureSessionResult {
  sessionId: string;
  characterId: string;
  region: string;
  statistics: AdventureStatistics;
  finalLevel: number;
  currentLife: number;
  maximumLife: number;
  alive: boolean;
  seed: number;
}
