import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import { calculateSaleValue } from "../economy/saleValue.js";
import { getBaseItem } from "../itemgen/baseItems.js";
import { normalizeItemRarity } from "../itemgen/rarityMapping.js";
import { xpForLevel } from "../xp.js";
import type { OfflineCatchUpInput, OfflineSummary } from "./types.js";

// Mesmo valor de IDLE_TICK_INTERVAL_MS (apps/web/src/hooks/
// useAdventureSession.ts) — a projeção offline avança no mesmo ritmo
// que o IdleDriver real usaria se a aba estivesse aberta.
export const OFFLINE_TICK_INTERVAL_MS = 2500;
// Cap deliberado (Fase 4 do brief não pede "infinito"): 4h de ausência
// já rendem uma projeção generosa sem custo de CPU relevante (~5.760
// ticks, mesma ordem de grandeza que o Simulador já roda pra Balance).
export const MAX_OFFLINE_MS = 4 * 60 * 60 * 1000;

const OFFLINE_CHARACTER_ID = "offline-catchup";
// Mesma Classe fixa que o resto do jogo usa até Classes existir de
// verdade (DEMO_CLASS_ID em useAdventureSession.ts, DEFAULT_CLASS_ID no
// Simulador) — nenhuma suposição nova.
const OFFLINE_CLASS_ID = "warrior";
const OFFLINE_INVENTORY_CAPACITY = 24;

function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
  return total;
}

/**
 * Projeta o que um personagem real teria feito durante `input.elapsedMs`
 * de ausência, usando o MESMO Adventure Loop da Aventura ao vivo
 * (advanceAdventureWithPresentation) — nunca uma fórmula estatística
 * paralela. Simplificação documentada (ver Fase 7 do relatório de
 * entrega): o personagem projetado usa o kit inicial (equipStarterKit),
 * não o equipamento real já equipado — mesma simplificação que
 * useAdventureSession.ts já assume ao (re)hidratar uma sessão a partir
 * do personagem real (nenhuma lacuna nova).
 *
 * Itens encontrados durante a ausência são vendidos automaticamente
 * (nunca entram no Inventário real) — "vendeu automaticamente lixo",
 * exatamente o comportamento pedido pelo brief desta Fase.
 */
export function computeOfflineCatchUp(input: OfflineCatchUpInput): OfflineSummary {
  const cappedElapsedMs = Math.max(0, Math.min(input.elapsedMs, MAX_OFFLINE_MS));
  const ticks = Math.floor(cappedElapsedMs / OFFLINE_TICK_INTERVAL_MS);

  const build = new CharacterBuild(OFFLINE_CHARACTER_ID, OFFLINE_CLASS_ID, 0);
  build.addExperience(cumulativeXpForLevel(input.characterLevel) + input.characterXp);

  const inventory = new Inventory(OFFLINE_CHARACTER_ID, OFFLINE_INVENTORY_CAPACITY);
  const equipment = new Equipment(OFFLINE_CHARACTER_ID);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, OFFLINE_CLASS_ID, input.seed);

  const session = createAdventureSession(`${OFFLINE_CHARACTER_ID}-session`, character, input.regionId, input.seed, Date.now());
  const timeline = createAdventureTimeline(session.sessionId);

  const startingXp = build.experience;
  let enemiesKilled = 0;
  let itemsFound = 0;
  let itemsAutoSold = 0;
  let goldFromAutoSold = 0;
  let ticksSimulated = 0;

  for (let i = 0; i < ticks; i++) {
    if (session.character.currentLife <= 0) break;
    const { tickResult } = advanceAdventureWithPresentation(session, timeline, { autoEquip: true });
    ticksSimulated++;
    enemiesKilled += tickResult.enemiesKilledThisTick;

    for (const drop of tickResult.lootDrops) {
      if (!drop.stored) continue;
      itemsFound++;
      const minLevel = getBaseItem(drop.baseItemId)?.requirements?.level ?? 1;
      goldFromAutoSold += calculateSaleValue({ rarity: normalizeItemRarity(drop.rarity), min_level: minLevel });
      itemsAutoSold++;
    }
  }

  return {
    elapsedMs: cappedElapsedMs,
    ticksSimulated,
    enemiesKilled,
    itemsFound,
    itemsAutoSold,
    goldFromAutoSold,
    xpGained: Math.max(0, build.experience - startingXp),
    leveledUp: build.level > input.characterLevel,
    finalLevel: build.level,
    characterSurvived: session.character.currentLife > 0,
  };
}
