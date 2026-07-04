/**
 * SQLiteCharacterRepository — M-007
 *
 * Implementação concreta do CharacterRepository usando SQLite.
 *
 * Esta classe é a única que conhece o banco de dados no contexto
 * dos sistemas de jogo. Todo acesso a dados de personagem pelos
 * sistemas deve passar por aqui — nunca por getDb() direto.
 *
 * O XPSystem e outros sistemas dependem da interface CharacterRepository
 * definida em engine/types.ts — nunca desta classe diretamente.
 * Isso permite trocar a implementação (ex: PostgreSQL, Redis cache)
 * sem alterar nenhum sistema de jogo.
 *
 * MÉTODOS IMPLEMENTADOS:
 * - findById(): leitura — usado pelo XPSystem em modo shadow (M-006/M-007)
 * - applyXP(): escrita — usado pelo XPSystem e WelcomeRewardSystem (M-008)
 * - addMinutesWatched(): escrita — implementado mas não usado até M-008+
 * - hasReceivedWelcomeReward(): leitura — usado pelo WelcomeRewardSystem (M-008)
 * - markWelcomeRewardGranted(): escrita — usado pelo WelcomeRewardSystem (M-008)
 *
 * NÃO conhece:
 * - EventBus, GameEngine, GameClock
 * - Frontend, Twitch ou Railway
 * - Nenhum sistema de jogo (XPSystem, DropSystem, etc.)
 */
import { getDb, nowUnix } from "../config/database.js";
import { getProgress, getCombatAttributes as computeCombatAttributes } from "@streamrpg/shared";
import type { DamageType, ItemRarity, ItemSlot } from "@streamrpg/shared";
import type {
  CharacterRepository,
  CharacterSnapshot,
  CombatAttributesSnapshot,
  XPResult,
} from "../engine/types.js";

export class SQLiteCharacterRepository implements CharacterRepository {
  /**
   * Busca um personagem pelo ID.
   * Retorna null se não encontrado.
   *
   * Usado pelo XPSystem em modo shadow para obter o display_name
   * antes de logar o XP que seria concedido.
   */
  async findById(id: string): Promise<CharacterSnapshot | null> {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, display_name, level, xp, gold, sus_base
         FROM characters
         WHERE id = ?`,
      )
      .get(id) as {
        id: string;
        display_name: string;
        level: number;
        xp: number;
        gold: number;
        sus_base: number;
      } | undefined;
    if (!row) return null;
    return {
      id: row.id,
      displayName: row.display_name,
      level: row.level,
      totalXp: row.xp,
      gold: row.gold,
      susBase: row.sus_base,
    };
  }

  /**
   * Aplica XP a um personagem e retorna o resultado da operação.
   *
   * Calcula o novo nível automaticamente usando getProgress() do shared.
   * Atualiza xp, level e last_ping_at no banco atomicamente.
   */
  async applyXP(
    characterId: string,
    amount: number,
    timestamp: number,
  ): Promise<XPResult> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000); // converte ms para unix seconds
    const current = db
      .prepare("SELECT xp, level FROM characters WHERE id = ?")
      .get(characterId) as { xp: number; level: number } | undefined;
    if (!current) {
      throw new Error(`CharacterRepository: character ${characterId} not found`);
    }
    const oldLevel = current.level;
    const newTotalXp = current.xp + amount;
    const progress = getProgress(newTotalXp);
    const newLevel = progress.level;
    db.prepare(
      `UPDATE characters
       SET xp = ?, level = ?, last_ping_at = ?, updated_at = ?
       WHERE id = ?`,
    ).run(newTotalXp, newLevel, now, now, characterId);
    return {
      characterId,
      xpGained: amount,
      newTotalXp,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel,
    };
  }

  /**
   * Incrementa o total de minutos assistidos de um personagem.
   *
   * ATENÇÃO: este método NÃO é chamado ainda — está preparado para M-008+
   */
  async addMinutesWatched(
    characterId: string,
    minutes: number,
  ): Promise<void> {
    getDb()
      .prepare(
        `UPDATE characters
         SET total_minutes = total_minutes + ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(minutes, nowUnix(), characterId);
  }

  /**
   * Verifica se o personagem já recebeu a Welcome Reward.
   * Usado pelo WelcomeRewardSystem para garantir concessão única
   * ao longo da vida inteira do personagem, independente de quantas
   * vezes session.started for disparado (ex: reconexões).
   */
  async hasReceivedWelcomeReward(characterId: string): Promise<boolean> {
    const db = getDb();
    const row = db
      .prepare("SELECT first_join_reward_at FROM characters WHERE id = ?")
      .get(characterId) as { first_join_reward_at: number | null } | undefined;
    if (!row) {
      throw new Error(`CharacterRepository: character ${characterId} not found`);
    }
    return row.first_join_reward_at !== null;
  }

  /**
   * Reivindica a Welcome Reward de forma atômica: só grava se
   * first_join_reward_at ainda estiver NULL. O WHERE aqui é a guarda de
   * verdade contra concessão dupla — hasReceivedWelcomeReward() sozinho
   * não fecha a janela entre duas sessões concorrentes do mesmo
   * personagem novo (duas leituras podem ver NULL antes de qualquer
   * escrita). Retorna true só para quem realmente reivindicou agora.
   * Responsabilidade exclusiva do WelcomeRewardSystem — nenhum outro
   * sistema deve escrever nesta coluna.
   */
  async markWelcomeRewardGranted(
    characterId: string,
    timestamp: number,
  ): Promise<boolean> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000);
    const result = db.prepare(
      "UPDATE characters SET first_join_reward_at = ? WHERE id = ? AND first_join_reward_at IS NULL",
    ).run(now, characterId);
    return result.changes > 0;
  }

  /**
   * Sprint Character Attributes Schema — reúne level/susBase do
   * personagem com ATQ/Resistência físico-mágico e UTI derivados dos
   * itens equipados (via getCombatAttributes() do shared, aditiva,
   * getItemPower() original não é tocado). Consulta própria em vez de
   * reaproveitar getEquippedItems() de services/drop.service.ts — um
   * Repository não deve depender de uma Service (direção inversa à
   * arquitetura já estabelecida), mesmo custando uma pequena duplicação
   * de query.
   */
  async getCombatAttributes(characterId: string): Promise<CombatAttributesSnapshot | null> {
    const db = getDb();

    const character = db
      .prepare("SELECT level, sus_base FROM characters WHERE id = ?")
      .get(characterId) as { level: number; sus_base: number } | undefined;
    if (!character) return null;

    const equipped = db
      .prepare(
        `SELECT i.rarity, i.slot, i.damage_type, i.uti_bonus
         FROM equipped_items e
         JOIN character_items ci ON ci.id = e.character_item_id
         JOIN items i ON i.id = ci.item_id
         WHERE e.character_id = ?`,
      )
      .all(characterId) as Array<{
        rarity: string;
        slot: string;
        damage_type: string;
        uti_bonus: number;
      }>;

    let attackPhysical = 0;
    let attackMagic = 0;
    let resistancePhysical = 0;
    let resistanceMagic = 0;
    let utiBonus = 0;

    for (const item of equipped) {
      const combat = computeCombatAttributes(
        item.rarity as ItemRarity,
        item.slot as ItemSlot,
        item.damage_type as DamageType,
      );
      attackPhysical += combat.attackPhysical;
      attackMagic += combat.attackMagic;
      resistancePhysical += combat.resistancePhysical;
      resistanceMagic += combat.resistanceMagic;
      utiBonus += item.uti_bonus;
    }

    return {
      characterId,
      level: character.level,
      attackPhysical,
      attackMagic,
      resistancePhysical,
      resistanceMagic,
      susBase: character.sus_base,
      utiBonus,
    };
  }
}
