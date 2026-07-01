/**
 * DropSystem — Sprint D3 (Shadow Mode)
 *
 * Reage a xp.granted e reproduz, apenas em log, a mesma decisão que
 * rollDrop() (drop.service.ts) já toma hoje de forma síncrona dentro
 * de applyPing() — sem escrever nada.
 *
 * Objetivo desta Sprint: confirmar que o DropSystem toma exatamente
 * as mesmas decisões do sistema atual antes de qualquer escrita real
 * existir. Nenhum grantToCharacter(), nenhum drop_log, nenhum evento
 * drop.granted emitido — shadow mode é inerentemente seguro, sem
 * necessidade de feature flag, mesmo padrão usado no XPSystem (M-006).
 *
 * Dependências: apenas ItemRepository e RandomProvider, injetados no
 * construtor. Nenhum getDb() direto, nenhuma consulta a banco fora
 * do que o ItemRepository já expõe.
 *
 * Preserva o comportamento atual do sistema de drops, incluindo a
 * reutilização do mesmo rng entre o gate de chance e a seleção de
 * raridade (pickRarity(rng)) — nenhuma correção de raridade nesta
 * Sprint, isso permanece uma decisão separada e pendente.
 */
import { DROP_CHANCE, pickRarity } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
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
      const { characterId, newLevel } = event as XPGrantedEvent;

      try {
        const rng = randomProvider.next();

        if (rng > DROP_CHANCE) {
          // Mesmo comportamento silencioso do rollDrop() atual:
          // rolagem não passou no gate de chance, nada a fazer.
          return;
        }

        // Reaproveita o mesmo rng para a raridade, replicando
        // exatamente o comportamento atual (incluindo o efeito
        // colateral já conhecido dessa reutilização).
        const rarity = pickRarity(rng);

        const eligibleItem = await itemRepo.findEligible(rarity, newLevel);

        if (!eligibleItem) {
          console.log(`[DropSystem] Character: ${characterId} | Rarity: ${rarity} | No eligible item found`);
          return;
        }

        console.log(`[DropSystem] Character: ${characterId} | Would grant: ${eligibleItem.name} | Rarity: ${rarity} | Slot: ${eligibleItem.slot}`);
      } catch (err) {
        console.error(`[DropSystem] Erro personagem ${characterId}:`, err);
      }
    });
  }
}
