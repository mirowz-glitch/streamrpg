/**
 * FirstItemQuestSystem — Sprint First 120 Seconds
 *
 * Concede o item inicial ("Luvas Rasgadas") já equipado, e a missão
 * "equipar seu primeiro item" (+XP), na primeira vez que o personagem é
 * visto pelo SessionManager — mesmo formato do WelcomeRewardSystem
 * (M-008), reage a session.started, não a world.tick.
 *
 * Ao contrário do WelcomeRewardSystem, não depende de isChannelLive():
 * o item inicial é parte de quem o personagem É, não uma recompensa por
 * assistir uma live. Reivindicação atômica (markFirstItemQuestCompleted)
 * antes de conceder, mesmo motivo documentado no WelcomeRewardSystem —
 * fecha a janela de corrida entre duas sessões quase simultâneas do
 * mesmo personagem novo.
 *
 * source: "quest" no xp.granted garante que o DropSystem (que só rola o
 * pool comum quando source === "tick") nunca reage a esta concessão —
 * nenhuma alteração necessária no DropSystem em si.
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  CharacterRepository,
  ItemRepository,
  LevelUpEvent,
  SessionStartedEvent,
  XPGrantedEvent,
} from "../engine/types.js";
import { equipItem } from "../services/drop.service.js";

const FIRST_ITEM_SLUG = "luvas-rasgadas";
// Mesma ordem de grandeza do Welcome Reward (XP_PER_PING) — ilustrativo,
// não calibrado, mesma convenção de todo valor numérico não validado por
// playtest neste projeto.
const FIRST_ITEM_QUEST_XP = 10;

export class FirstItemQuestSystem {
  constructor(
    private characterRepo: CharacterRepository,
    private itemRepo: ItemRepository,
  ) {}

  register(bus: EventBus): () => void {
    return bus.subscribe("session.started", async (event) => {
      const { characterId, timestamp } = event as SessionStartedEvent;
      try {
        const alreadyCompleted = await this.characterRepo.hasCompletedFirstItemQuest(characterId);
        if (alreadyCompleted) return;

        const item = await this.itemRepo.findBySlug(FIRST_ITEM_SLUG);
        if (!item) {
          console.error(`[FirstItemQuestSystem] Item "${FIRST_ITEM_SLUG}" não encontrado — catálogo ainda não semeado?`);
          return;
        }

        // Reivindicação atômica antes de conceder — mesma ordem do
        // WelcomeRewardSystem, mesmo motivo (ver header do arquivo).
        const claimed = await this.characterRepo.markFirstItemQuestCompleted(characterId, timestamp);
        if (!claimed) return;

        const granted = await this.itemRepo.grantToCharacter(characterId, item.id);
        equipItem(characterId, granted.characterItemId);

        const result = await this.characterRepo.applyXP(characterId, FIRST_ITEM_QUEST_XP, timestamp);

        console.log(
          `[FirstItemQuestSystem] Character: ${characterId} | Item: ${item.name} (equipado) | +${FIRST_ITEM_QUEST_XP} XP`,
        );

        const xpGranted: XPGrantedEvent = {
          type: "xp.granted",
          characterId,
          amount: FIRST_ITEM_QUEST_XP,
          newTotalXp: result.newTotalXp,
          newLevel: result.newLevel,
          leveledUp: result.leveledUp,
          source: "quest",
          timestamp,
        };
        bus.emit(xpGranted);

        if (result.leveledUp) {
          const levelUp: LevelUpEvent = {
            type: "level.up",
            characterId,
            oldLevel: result.oldLevel,
            newLevel: result.newLevel,
            timestamp,
          };
          bus.emit(levelUp);
        }
      } catch (err) {
        console.error(`[FirstItemQuestSystem] Erro personagem ${characterId}:`, err);
      }
    });
  }
}
