import type { PresentationEvent } from "@streamrpg/shared";
import { getBaseItem, getRegionName } from "@streamrpg/shared";
import { rarityLabel } from "./adventureLiveState";

// Backpack Experience Phase I — Fase 2 ("Encontrados Recentemente").
// Fase 1 (Auditoria) achou que `InventoryItem` (a lista persistida que
// InventoryPage já busca via GET /api/items) NÃO carrega região nem
// "foi equipado automaticamente" — nenhuma das duas sobrevive à
// fronteira de persistência (apps/api/src/services/drop.service.ts).
// A única fonte honesta pros 5 campos pedidos pelo brief é o MESMO
// Estado Global que Living Character/World já consomem: `LootDropped`
// carrega `regionId` real, e um `ItemEquipped` do MESMO tickIndex
// prova que o AutoEquip disparou — nenhum dado inventado, só uma
// leitura diferente do que já existe.
type LootDroppedEvent = Extract<PresentationEvent, { kind: "LootDropped" }>;

export interface RecentFind {
  instanceId: string;
  name: string;
  rarity: string;
  rarityLabel: string;
  regionName: string;
  timestamp: number;
  autoEquipped: boolean;
}

export function buildRecentFinds(events: readonly PresentationEvent[], limit = 5): RecentFind[] {
  const loots = events.filter((event): event is LootDroppedEvent => event.kind === "LootDropped");

  return loots
    .slice(-limit)
    .reverse()
    .map((event) => {
      const autoEquipped = events.some(
        (candidate) =>
          candidate.kind === "ItemEquipped" && candidate.tickIndex === event.tickIndex && candidate.baseItemId === event.baseItemId,
      );
      return {
        instanceId: event.instanceId,
        name: getBaseItem(event.baseItemId)?.name ?? event.baseItemId,
        rarity: event.rarity,
        rarityLabel: rarityLabel(event.rarity),
        regionName: getRegionName(event.regionId),
        timestamp: event.timestamp,
        autoEquipped,
      };
    });
}
