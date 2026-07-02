/**
 * DropSystem — Sprint D4 (escrita real) / E4 (fonte exclusiva) / fix do
 * xp.granted.source (pré-B4)
 *
 * Reage a xp.granted e concede o item de verdade via ItemRepository,
 * emitindo drop.granted.
 *
 * Desde a Sprint E4, esta é a única fonte de concessão de drops — o
 * caminho legado (rollDrop() dentro de applyPing()) foi removido.
 * DROP_CHANCE, pickRarity() e a reutilização do mesmo rng entre o
 * gate de chance e a seleção de raridade (bug já documentado)
 * permanecem exatamente como estavam — correção de raridade é uma
 * decisão separada, pendente para a Sprint de economia. drop_log
 * não é escrito por este caminho e, com o legado removido, não é
 * mais escrito por nenhum caminho — órfão até uma decisão futura
 * sobre reativá-lo ou removê-lo.
 *
 * Só reage a xp.granted quando source === "tick". Sem essa checagem,
 * qualquer concessão de XP (inclusive Welcome Reward e, futuramente,
 * recompensa de participação de Boss) acionava um segundo drop do pool
 * comum por cima da recompensa própria daquele caminho — bug real, já
 * em produção via WelcomeRewardSystem, encontrado durante o design
 * técnico do Boss (capítulo 6) e corrigido aqui, isoladamente, antes da
 * Sprint B4 depender desse contrato.
 *
 * Dependências: apenas ItemRepository e RandomProvider, injetados no
 * construtor. Nenhum getDb() direto, nenhuma consulta a banco fora
 * do que o ItemRepository já expõe.
 */
import { DROP_CHANCE, pickRarity } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  DropGrantedEvent,
  ItemRepository,
  RandomProvider,
  XPGrantedEvent,
} from "../engine/types.js";

export class DropSystem {
  constructor(
    private itemRepo: ItemRepository,
    private randomProvider: RandomProvider,
  ) {}

  register(bus: EventBus): () => void {
    const itemRepo = this.itemRepo;
    const randomProvider = this.randomProvider;

    return bus.subscribe("xp.granted", async (event) => {
      const { characterId, newLevel, timestamp, source } = event as XPGrantedEvent;

      if (source !== "tick") {
        // Welcome Reward e recompensa de Boss têm sua própria lógica de
        // item (Boss) ou não concedem item nenhum (Welcome) — nenhuma
        // delas deve acionar o drop do pool comum por cima.
        return;
      }

      try {
        const rng = randomProvider.next();

        if (rng > DROP_CHANCE) {
          // Rolagem não passou no gate de chance, nada a fazer.
          return;
        }

        // Reaproveita o mesmo rng para a raridade — efeito colateral
        // já documentado (ver header do arquivo), não corrigido aqui.
        const rarity = pickRarity(rng);

        const eligibleItem = await itemRepo.findEligible(rarity, newLevel);

        if (!eligibleItem) {
          console.log(`[DropSystem] Character: ${characterId} | Rarity: ${rarity} | No eligible item found`);
          return;
        }

        await itemRepo.grantToCharacter(characterId, eligibleItem.id);

        console.log(`[DropSystem] Character: ${characterId} | Granted: ${eligibleItem.name} | Rarity: ${rarity} | Slot: ${eligibleItem.slot}`);

        const dropGranted: DropGrantedEvent = {
          type: "drop.granted",
          characterId,
          itemId: eligibleItem.id,
          itemName: eligibleItem.name,
          itemRarity: eligibleItem.rarity,
          itemSlot: eligibleItem.slot,
          timestamp,
        };
        bus.emit(dropGranted);
      } catch (err) {
        console.error(`[DropSystem] Erro personagem ${characterId}:`, err);
      }
    });
  }
}
