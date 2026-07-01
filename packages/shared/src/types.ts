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
 * - Este arquivo contém contratos internos do mundo do jogo.
 * - Quando um sistema precisar de um tipo do shared (ex: ItemRarity),
 *   ele importa diretamente do shared — não reexporta daqui.
 */

// ============================================================
// SESSÃO
// ============================================================

/**
 * Representa um jogador ativo no mundo do jogo neste momento.
 *
 * Uma ActiveSession não sabe como foi detectada — pode ter vindo
 * do frontend, do chat IRC, de uma Extension ou de qualquer
 * PresenceProvider futuro. A Engine e os sistemas só enxergam sessões.
 *
 * provider: identifica a origem da presença para fins de diagnóstico
 * e métricas. Nunca deve ser usado para alterar lógica de jogo.
 */
export interface ActiveSession {
  characterId: string;
  channelId: string;
  lastSeenAt: number;
  provider: string;
}

// ============================================================
// EVENTOS DO JOGO
// ============================================================

/**
 * Emitido pela GameEngine a cada tick do GameClock.
 * É o evento central do jogo — todos os sistemas de gameplay
 * devem processar suas lógicas em resposta a este evento.
 *
 * sessions: lista de sessões ativas no momento do tick.
 * A Engine injeta as sessões no evento para que os sistemas
 * não precisem conhecer o SessionManager diretamente.
 */
export interface WorldTickEvent {
  type: "world.tick";
  tickNumber: number;
  timestamp: number;
  sessions: ActiveSession[];
}

/**
 * Emitido pelo XPSystem após conceder XP a um personagem.
 * Outros sistemas podem reagir a este evento (ex: notificações,
 * conquistas, ranking em tempo real).
 */
export interface XPGrantedEvent {
  type: "xp.granted";
  characterId: string;
  channelId: string;
  amount: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  timestamp: number;
}

/**
 * Emitido pelo DropSystem após conceder um item a um personagem.
 * Outros sistemas podem reagir (ex: notificações, log de eventos,
 * histórico de drops).
 */
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

/**
 * Emitido quando um personagem sobe de nível.
 * Separado do XPGrantedEvent para permitir que sistemas de
 * notificação e conquistas tratem level up como evento distinto.
 */
export interface LevelUpEvent {
  type: "level.up";
  characterId: string;
  channelId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
}

/**
 * Emitido quando um streamer ativa um Boss no canal.
 * Reservado para implementação futura do BossSystem.
 */
export interface BossActivatedEvent {
  type: "boss.activated";
  channelId: string;
  bossId: string;
  activatedBy: string;
  endsAt: number;
  timestamp: number;
}

/**
 * Union type de todos os eventos do jogo.
 *
 * Todo novo evento deve ser adicionado aqui.
 * O EventBus usa este tipo para garantir em tempo de compilação
 * que nenhum handler recebe um evento com estrutura errada.
 *
 * Padrão de nomenclatura: "dominio.acao" em lowercase.
 * Exemplos: "world.tick", "xp.granted", "boss.activated"
 */
export type GameEvent =
  | WorldTickEvent
  | XPGrantedEvent
  | DropGrantedEvent
  | LevelUpEvent
  | BossActivatedEvent;

/**
 * Tipo auxiliar: extrai o tipo de um GameEvent pelo campo "type".
 * Útil para tipagem de handlers no EventBus.
 *
 * Exemplo:
 *   type Handler = EventHandler<"xp.granted">
 *   // equivale a: (event: XPGrantedEvent) => void
 */
export type EventOfType<T extends GameEvent["type"]> = Extract
  GameEvent,
  { type: T }
>;

// ============================================================
// CONTRATOS DO EVENTSBUS
// ============================================================

/**
 * Handler genérico para qualquer evento do jogo.
 */
export type GameEventHandler<T extends GameEvent = GameEvent> = (
  event: T,
) => void | Promise<void>;

// ============================================================
// CONTRATOS DO GAMECONTEXT
// ============================================================

/**
 * Interface que a GameEngine usa para obter o estado do mundo.
 *
 * A Engine nunca conhece SessionManager diretamente —
 * ela depende desta abstração. Isso permite trocar a implementação
 * de detecção de presença sem alterar a Engine.
 */
export interface GameContext {
  getActiveSessions(): ActiveSession[];
}

// ============================================================
// CONTRATOS DOS REPOSITÓRIOS
// ============================================================

/**
 * Dados mínimos de um personagem necessários para os sistemas de jogo.
 * Não é o mesmo que Character do shared — aquele é o contrato HTTP.
 * Este é o contrato interno da Engine.
 */
export interface CharacterSnapshot {
  id: string;
  displayName: string;
  level: number;
  totalXp: number;
  gold: number;
}

/**
 * Resultado de uma operação de concessão de XP.
 * Retornado pelo CharacterRepository após persistir o XP.
 */
export interface XPResult {
  characterId: string;
  xpGained: number;
  newTotalXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
}

/**
 * Contrato do repositório de personagens.
 *
 * Os sistemas de jogo dependem desta interface, nunca da implementação
 * concreta (SQLiteCharacterRepository). Isso permite testes com
 * implementações em memória e troca de banco sem alterar os sistemas.
 */
export interface CharacterRepository {
  findById(id: string): Promise<CharacterSnapshot | null>;
  applyXP(
    characterId: string,
    amount: number,
    timestamp: number,
  ): Promise<XPResult>;
  addMinutesWatched(characterId: string, minutes: number): Promise<void>;
}

/**
 * Dados mínimos de um item para os sistemas de jogo.
 */
export interface ItemSnapshot {
  id: number;
  slug: string;
  name: string;
  rarity: string;
  slot: string;
  minLevel: number;
}

/**
 * Resultado de uma concessão de item a um personagem.
 */
export interface GrantedItem {
  characterItemId: number;
  item: ItemSnapshot;
  obtainedAt: number;
}

/**
 * Contrato do repositório de itens.
 */
export interface ItemRepository {
  findEligible(
    rarity: string,
    characterLevel: number,
  ): Promise<ItemSnapshot | null>;
  grantToCharacter(
    characterId: string,
    itemId: number,
    channelId: string,
    timestamp: number,
  ): Promise<GrantedItem>;
}

// ============================================================
// CONTRATOS DO RANDOMPROVIDER
// ============================================================

/**
 * Abstração sobre aleatoriedade.
 *
 * Todos os sistemas que precisam de números aleatórios recebem
 * um RandomProvider injetado — nunca chamam Math.random() diretamente.
 * Isso garante testes determinísticos e reprodução de bugs.
 */
export interface RandomProvider {
  /** Retorna um número em [0, 1), equivalente a Math.random(). */
  next(): number;
}
