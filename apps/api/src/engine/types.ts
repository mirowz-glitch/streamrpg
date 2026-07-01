/**
 * Engine Types — M-003
 *
 * Contratos públicos da Game Engine do StreamRPG.
 *
 * Este arquivo é a fonte da verdade para todos os tipos compartilhados
 * entre os componentes da Engine: GameClock, EventBus, GameEngine,
 * SessionManager, sistemas e repositórios.
 *
 * REGRAS:
 * - Nenhum tipo aqui depende de Twitch, SQLite, Express ou frontend.
 * - Nenhum tipo aqui duplica o que existe em packages/shared/src/types.ts.
 * - packages/shared/src/types.ts contém contratos HTTP/frontend.
 * - Este arquivo contém contratos fundamentais da Engine.
 * - Quando um sistema precisar de um tipo do shared (ex: ItemRarity),
 *   ele importa diretamente do shared — não reexporta daqui.
 *
 * LIMITE DE RESPONSABILIDADE:
 * - Este arquivo deve permanecer restrito aos contratos fundamentais
 *   da Engine: sessões, eventos, repositórios, contexto e providers.
 * - Regras de gameplay, configurações de balanceamento e estruturas
 *   específicas de sistemas individuais NÃO pertencem aqui.
 * - Se este arquivo começar a crescer com esses elementos, eles devem
 *   ser movidos para arquivos próprios:
 *     engine/config.ts      → configurações e regras de jogo
 *     systems/xp/types.ts   → tipos específicos do XPSystem
 *     systems/drop/types.ts → tipos específicos do DropSystem
 *     etc.
 *
 * PRINCÍPIO ARQUITETURAL (registrado após auditoria de escopo):
 * - Eventos de Gameplay (xp.granted, level.up) representam mudanças
 *   de estado do Character e NUNCA carregam contexto de plataforma
 *   (channelId, platform). Progressão pertence ao personagem, nunca
 *   à sessão ou ao canal onde ele estava presente.
 * - Eventos de Platform (session.started) representam presença e
 *   carregam characterId + channelId (e, futuramente, platform).
 * - Eventos de World (boss.activated) representam algo compartilhado
 *   por um contexto (hoje: canal), sem characterId.
 * - DropGrantedEvent ainda não foi revisado sob este princípio —
 *   será tratado junto da implementação do DropSystem, não isoladamente.
 */

// ============================================================
// SESSÃO
// ============================================================

export interface ActiveSession {
  characterId: string;
  channelId: string;
  lastSeenAt: number;
  provider: string;
}

// ============================================================
// EVENTOS DO JOGO
// ============================================================

export interface WorldTickEvent {
  type: "world.tick";
  tickNumber: number;
  timestamp: number;
  sessions: ActiveSession[];
}

export interface SessionStartedEvent {
  type: "session.started";
  characterId: string;
  channelId: string;
  timestamp: number;
}

export interface XPGrantedEvent {
  type: "xp.granted";
  characterId: string;
  amount: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  timestamp: number;
}

export interface DropGrantedEvent {
  type: "drop.granted";
  characterId: string;
  channelId: string;
  itemId: number;
  itemName: string;
  itemRarity: string;
  itemSlot: string;
  timestamp: number;
}

export interface LevelUpEvent {
  type: "level.up";
  characterId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
}

export interface BossActivatedEvent {
  type: "boss.activated";
  channelId: string;
  bossId: string;
  activatedBy: string;
  endsAt: number;
  timestamp: number;
}

export type GameEvent =
  | WorldTickEvent
  | SessionStartedEvent
  | XPGrantedEvent
  | DropGrantedEvent
  | LevelUpEvent
  | BossActivatedEvent;

export type EventOfType<T extends GameEvent["type"]> = Extract
  GameEvent,
  { type: T }
>;

// ============================================================
// CONTRATOS DO EVENTBUS
// ============================================================

export type GameEventHandler<T extends GameEvent = GameEvent> = (
  event: T,
) => void | Promise<void>;

// ============================================================
// CONTRATOS DO GAMECONTEXT
// ============================================================

export interface GameContext {
  getActiveSessions(): ActiveSession[];
}

// ============================================================
// CONTRATOS DOS REPOSITÓRIOS
// ============================================================

export interface CharacterSnapshot {
  id: string;
  displayName: string;
  level: number;
  totalXp: number;
  gold: number;
}

export interface XPResult {
  characterId: string;
  xpGained: number;
  newTotalXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

export interface CharacterRepository {
  findById(id: string): Promise<CharacterSnapshot | null>;
  applyXP(
    characterId: string,
    amount: number,
    timestamp: number,
  ): Promise<XPResult>;
  addMinutesWatched(characterId: string, minutes: number): Promise<void>;
  hasReceivedWelcomeReward(characterId: string): Promise<boolean>;
  markWelcomeRewardGranted(characterId: string, timestamp: number): Promise<void>;
}

export interface ItemSnapshot {
  id: number;
  slug: string;
  name: string;
  rarity: string;
  slot: string;
  minLevel: number;
}

export interface GrantedItem {
  characterItemId: number;
  item: ItemSnapshot;
  obtainedAt: number;
}

export interface ItemRepository {
  findEligible(
    rarity: string,
    characterLevel: number,
  ): Promise<ItemSnapshot | null>;
  grantToCharacter(
    characterId: string,
    itemId: number,
    channelId: string,
  ): Promise<GrantedItem>;
}

// ============================================================
// CONTRATOS DO RANDOMPROVIDER
// ============================================================

export interface RandomProvider {
  next(): number;
}
