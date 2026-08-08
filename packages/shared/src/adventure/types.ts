import type { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import type { WorldEncounter, EncounterVariant } from "../worldencounter/types.js";
import type { ItemGenRolledMod } from "../itemgen/types.js";
import type { SphereTypeId } from "../itemization/spheres.js";
import type { SphereSource } from "../spheredrop/types.js";
import type { CombatSnapshotDTO } from "../combat/combatSnapshot.js";
import type { MapModifierId } from "../mapmods/types.js";

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
  // Sprint 22 — Living Combat Phase I, Fase 4/5/6: quando um Combat
  // Snapshot real (o MESMO que Character API/Boss consultam) já foi
  // buscado em `/api/character`, `toAdventureCombatant()` (session.ts)
  // o usa em vez de recalcular via `calculateFinalStats(characterBuild,
  // equipment)` (o kit de sessão local, que nunca reflete Sockets/
  // Gemas/afixos reais). `undefined`/`null` = ainda não buscado, ou
  // sessão de demonstração sem personagem persistido — cai no cálculo
  // antigo, nunca quebra.
  realCombatSnapshot?: CombatSnapshotDTO | null;
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
  // Sprint 31 — Map Integration Phase I, Fase 2: "Adventure -> Map ->
  // Region" — Map passa a ser a entrada OFICIAL, `currentRegion`
  // continua existindo e sendo o campo que TODO o resto do engine já lia
  // (Encounter/Loot/Recovery/Faction/Dungeon) — nada foi removido dele,
  // "Nada pode ser perdido" (Fase 4). `currentMapId` é sempre derivado
  // de `currentRegion` em `createAdventureSession()` (Map:Região é 1:1
  // nesta Fase — Sprint 30, worldmap/mapRegistry.ts — `Map.id ===
  // Map.regionId` pras 9 regiões jogáveis reais), nunca um valor
  // independente que possa divergir.
  currentMapId: string;
  currentRegion: string;
  currentEncounter: WorldEncounter | null;
  statistics: AdventureStatistics;
  seed: number;
  startTime: number;
  futureHooks: AdventureFutureHooks;
  // Vertical Slice — World Tiers & Endgame Scaling Phase I — Fase 1/2:
  // a escolha do jogador (id de WorldTierDefinition, ex.: "WT3"), uma
  // propriedade PERSISTENTE da sessão (não um AdvanceAdventureOptions
  // por tick — o jogador não troca de Tier a cada tick). Nunca lida
  // diretamente por nenhum sistema de gameplay (Adventure Loop/Combat/
  // Recovery/Encounter continuam sem saber que World Tiers existem) —
  // só dungeon/dungeonController.ts (o único ponto de resolução) e
  // expeditions/expeditionProgress.ts (pro HUD mostrar o Tier atual)
  // leem este campo. `undefined` = WT1/comportamento neutro.
  worldTier?: string;
  // Sprint 32 — Map Modifiers Phase I, Fase 5: "Adicionar
  // activeMapModifiers. Ainda não aplicam efeito. Apenas existem."
  // Sempre `[]` nesta Fase — não existe nenhuma rolagem/atribuição de
  // Map Modifier ainda (isso é Atlas/Map Device, explicitamente fora de
  // escopo). Tipado como `MapModifierId[]` (mapmods/types.ts) pra já
  // ter o formato certo quando uma Sprint futura precisar preenchê-lo
  // de verdade — mesmo padrão de scaffold já usado por `futureHooks`
  // (Adventure Loop Phase I) e por `worldTier` acima antes de ganhar um
  // resolvedor real.
  activeMapModifiers: MapModifierId[];
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
  // Sprint 11 — Persistent Items + Affixes: os 4 campos que o Item
  // Generator (itemgen/generator.ts) já produz de verdade
  // (ItemGenGeneratedItem.itemLevel/seed/prefixes/suffixes), mas que
  // este record nunca carregava — a causa raiz do achado da Fase 1 de
  // Itemization 2.0 ("o roll de afixos é descartado na persistência").
  // Opcionais (nunca omitidos pelos 3 pontos reais de emissão —
  // adventureLoop.ts/presentationLayer.ts/dungeonController.ts —, mas
  // opcionais no TIPO para não quebrar nenhuma fixture de teste
  // existente que só testa animação/HUD, sem afixo algum).
  itemLevel?: number;
  seed?: number;
  prefixes?: ItemGenRolledMod[];
  suffixes?: ItemGenRolledMod[];
}

// Sprint 13 — Sphere Economy Phase I: mesmo princípio de
// `LootDropRecord` acima (fato bruto do engine, nunca inferido por
// diff) — mas Esferas NUNCA entram no Inventory (Fase 7: "Nunca
// diretamente no inventário de itens"), então não existe um campo
// `stored` aqui — toda `SphereDropRecord` emitida é, por definição, um
// drop real que ainda precisa ser persistido em `character_spheres`
// (apps/api, fora do Engine).
export interface SphereDropRecord {
  sphereId: SphereTypeId;
  source: SphereSource;
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
  sphereDrops: SphereDropRecord[];
  encounterVariant: EncounterVariant;
  variantEnemyTemplateId: string | null;
  variantEnemyDefeated: boolean;
}

// Requisito 5 — Session Result: "nenhuma dependência de interface", só
// dados.
export interface AdventureSessionResult {
  sessionId: string;
  characterId: string;
  // Sprint 31 — Map Integration Phase I, Fase 5: `mapId` exposto aqui
  // (mesmo campo que `session.currentMapId`) é como Dungeon (que reusa
  // esta MESMA sessão via advanceAdventure()/advanceDungeonTick(), sem
  // nenhuma lógica de região/mapa própria — achado da auditoria Fase 1)
  // "recebe contexto de Mapa": de graça, sem nenhum parâmetro novo em
  // nenhuma das funções de Dungeon.
  mapId: string;
  region: string;
  statistics: AdventureStatistics;
  finalLevel: number;
  currentLife: number;
  maximumLife: number;
  alive: boolean;
  seed: number;
}
