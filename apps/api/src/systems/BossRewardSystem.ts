/**
 * BossRewardSystem — Sprint B4 (Recompensas)
 *
 * Reage a boss.defeated e boss.escaped. Responsabilidade única: distribuir
 * XP (sempre) e item (só em vitória) entre quem participou da luta,
 * proporcional a ticksPresent (capítulo 6, blocos Recompensas/Escala).
 *
 * XP_BUDGET_PER_BOSS e ITEM_SLOTS_PER_BOSS são placeholders explícitos —
 * cada um representa "o orçamento desta luta" hoje como um número fixo. A
 * B5 (Escala) vai substituir esse número por um valor por tier; a função
 * de distribuição correspondente (distributeXpBudget / drawItemWinners)
 * não muda quando isso acontecer — só o valor passado a ela. Por isso as
 * constantes vivem isoladas no topo do arquivo e nunca são embutidas
 * dentro das funções.
 *
 * XP é contínuo (divide fracionalmente) e item é discreto (não divide) —
 * por isso o mesmo princípio ("budget proporcional à participação") toma
 * duas formas: distributeXpBudget divide o budget, drawItemWinners sorteia
 * vencedores sem reposição para preencher o budget de vagas. Só quem
 * ganha uma vaga rola a raridade do item — a chance de "ganhar algo" já
 * foi decidida pelo sorteio, o DROP_CHANCE do DropSystem não se aplica
 * aqui.
 *
 * O roll de raridade aqui usa um rng independente por vencedor (nunca
 * reaproveitado de um gate, porque não existe gate) — diferente do
 * DropSystem, o loot de Boss não herda o bug do rng compartilhado (ver
 * DropSystem.ts) e tem chance real de sortear qualquer raridade.
 *
 * Persistência mínima: boss_rewards guarda só o resultado final por
 * personagem (xp concedido, item concedido ou null, outcome) — nenhum
 * log de tentativa, nenhum histórico de sorteio.
 *
 * Idempotência: hasRewarded() garante que o mesmo Boss nunca gera
 * recompensa duas vezes para o mesmo personagem, mesmo se boss.defeated/
 * boss.escaped for entregue mais de uma vez.
 *
 * Fora do escopo desta Sprint, por decisão explícita: budget por tier
 * (B5), Modifiers, qualquer suposição de que Boss é o único tipo de
 * evento do Reino (ver docs/technical-design/boss-system.md).
 */
import { pickRarity } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossDefeatedEvent,
  BossEscapedEvent,
  BossParticipationRepository,
  BossParticipationSnapshot,
  BossRewardRepository,
  CharacterRepository,
  DropGrantedEvent,
  ItemRepository,
  LevelUpEvent,
  RandomProvider,
  XPGrantedEvent,
} from "../engine/types.js";

// Placeholder — B5 substitui por um budget por tier. A distribuição
// proporcional (distributeXpBudget) não muda.
const XP_BUDGET_PER_BOSS = 200;

// Placeholder — B5 substitui por vagas por tier. O sorteio ponderado
// (drawItemWinners) não muda.
const ITEM_SLOTS_PER_BOSS = 3;

/**
 * Divide um budget fixo de XP entre participantes, proporcional a
 * ticksPresent. Função pura, testável isoladamente — recebe o budget
 * como parâmetro para que trocar o valor (B5) nunca exija tocar aqui.
 */
function distributeXpBudget(
  budget: number,
  participants: BossParticipationSnapshot[],
): Map<string, number> {
  const totalTicks = participants.reduce((sum, p) => sum + p.ticksPresent, 0);
  const shares = new Map<string, number>();
  if (totalTicks === 0) return shares;

  for (const p of participants) {
    shares.set(p.characterId, Math.floor((budget * p.ticksPresent) / totalTicks));
  }
  return shares;
}

/**
 * Sorteia `slots` vencedores entre os participantes, peso proporcional a
 * ticksPresent, sem reposição (um personagem não pode ganhar duas vagas
 * do mesmo Boss). Se houver menos participantes elegíveis que `slots`,
 * algumas vagas simplesmente não são preenchidas.
 */
function drawItemWinners(
  slots: number,
  participants: BossParticipationSnapshot[],
  randomProvider: RandomProvider,
): string[] {
  const pool = participants
    .filter((p) => p.ticksPresent > 0)
    .map((p) => ({ characterId: p.characterId, weight: p.ticksPresent }));

  const winners: string[] = [];

  for (let i = 0; i < slots && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let roll = randomProvider.next() * totalWeight;
    let idx = 0;
    while (idx < pool.length - 1 && roll >= pool[idx].weight) {
      roll -= pool[idx].weight;
      idx++;
    }
    winners.push(pool[idx].characterId);
    pool.splice(idx, 1); // sem reposição
  }

  return winners;
}

export class BossRewardSystem {
  constructor(
    private participationRepo: BossParticipationRepository,
    private rewardRepo: BossRewardRepository,
    private characterRepo: CharacterRepository,
    private itemRepo: ItemRepository,
    private randomProvider: RandomProvider,
  ) {}

  register(bus: EventBus): () => void {
    const unsubDefeated = bus.subscribe("boss.defeated", async (event) => {
      const { bossId, timestamp } = event as BossDefeatedEvent;
      await this.handleResolution(bossId, "defeated", timestamp, bus);
    });

    const unsubEscaped = bus.subscribe("boss.escaped", async (event) => {
      const { bossId, timestamp } = event as BossEscapedEvent;
      await this.handleResolution(bossId, "escaped", timestamp, bus);
    });

    return () => {
      unsubDefeated();
      unsubEscaped();
    };
  }

  private async handleResolution(
    bossId: string,
    outcome: "defeated" | "escaped",
    timestamp: number,
    bus: EventBus,
  ): Promise<void> {
    try {
      const participants = await this.participationRepo.listByBoss(bossId);
      if (participants.length === 0) return; // ninguém participou, nada a distribuir

      const xpShares = distributeXpBudget(XP_BUDGET_PER_BOSS, participants);

      // Item só existe em vitória (capítulo 6, bloco Recompensas).
      const itemWinners =
        outcome === "defeated"
          ? new Set(drawItemWinners(ITEM_SLOTS_PER_BOSS, participants, this.randomProvider))
          : new Set<string>();

      for (const participant of participants) {
        const characterId = participant.characterId;
        try {
          const alreadyRewarded = await this.rewardRepo.hasRewarded(bossId, characterId);
          if (alreadyRewarded) continue;

          const xpAmount = xpShares.get(characterId) ?? 0;
          let itemId: number | null = null;

          if (xpAmount > 0) {
            const result = await this.characterRepo.applyXP(characterId, xpAmount, timestamp);

            const xpGranted: XPGrantedEvent = {
              type: "xp.granted",
              characterId,
              amount: xpAmount,
              newTotalXp: result.newTotalXp,
              newLevel: result.newLevel,
              leveledUp: result.leveledUp,
              source: "boss",
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
          }

          if (itemWinners.has(characterId)) {
            const character = await this.characterRepo.findById(characterId);
            if (character) {
              const rarity = pickRarity(this.randomProvider.next());
              const eligibleItem = await this.itemRepo.findEligible(rarity, character.level);

              if (eligibleItem) {
                await this.itemRepo.grantToCharacter(characterId, eligibleItem.id);
                itemId = eligibleItem.id;

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
              } else {
                console.log(`[BossRewardSystem] Character: ${characterId} | Rarity: ${rarity} | No eligible item found (Boss ${bossId})`);
              }
            }
          }

          await this.rewardRepo.recordReward(bossId, characterId, xpAmount, itemId, outcome, timestamp);

          console.log(`[BossRewardSystem] Boss ${bossId} | Character: ${characterId} | XP: ${xpAmount} | Item: ${itemId ?? "none"} | Outcome: ${outcome}`);
        } catch (err) {
          console.error(`[BossRewardSystem] Erro ao recompensar personagem ${characterId} (Boss ${bossId}):`, err);
        }
      }
    } catch (err) {
      console.error(`[BossRewardSystem] Erro ao processar recompensas do Boss ${bossId}:`, err);
    }
  }
}
