import { getRegionName, getBaseItem, getEquipmentSlotDefinition, ITEM_GEN_RARITIES, type PresentationEvent } from "@streamrpg/shared";

interface EventFeedProps {
  events: PresentationEvent[];
}

// Fase 2/6: mesmo lookup já usado por LootPopup — raridade também
// aparecia crua ("magic"/"common") no feed de eventos.
function rarityLabel(rarity: string): string {
  return ITEM_GEN_RARITIES.find((entry) => entry.id === rarity)?.label ?? rarity;
}

// HUD & Gameplay UI Phase I — requisito 5: consome os Presentation
// Events diretamente (já vêm prontos em HudState.recentEvents,
// deriveHudState() só fatia a Adventure Timeline) — "nunca reconstruir
// eventos": este componente nunca decide o que aconteceu, só formata
// pra exibição o que já está no evento.
// Living Character Phase I — exportado pra que adventureDiary.ts
// (apps/web/src/lib) reaproveite a MESMA formatação de texto pra um
// subconjunto de eventos, em vez de reimplementar frases equivalentes
// — nenhuma lógica de "o que aconteceu" duplicada, só um filtro
// diferente por cima da mesma fonte.
export function describeEvent(event: PresentationEvent): string {
  switch (event.kind) {
    // Vertical Slice — Commercial Readiness & First Playable Experience
    // Phase I — Fase 2: era o único caso deste arquivo que mostrava
    // `regionId` cru em vez de `getRegionName(...)` — todos os outros
    // (RegionUnlocked/RegionEntered/EliteEncounter/MiniBossEncounter)
    // já seguiam esse padrão; inconsistência corrigida.
    case "EncounterStarted":
      return `Encontro iniciado em ${getRegionName(event.regionId)} (${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"})`;
    case "AttackStarted":
      return `Combate contra ${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"}`;
    case "AttackHit":
      return `${event.damageDealt.toFixed(0)} de dano causado, ${event.damageTaken.toFixed(0)} sofrido`;
    case "CriticalHit":
      return "Golpe crítico!";
    case "Miss":
      return "Ataque errou";
    case "EnemyKilled":
      return `${event.count} inimigo${event.count === 1 ? "" : "s"} derrotado${event.count === 1 ? "" : "s"}`;
    // Fase 2/6: nome/slot vinham como ids brutos em inglês ("boots",
    // "slot belt") — mesmo achado do LootPopup/EquipmentPopup, mesma
    // correção (getBaseItem/getEquipmentSlotDefinition).
    case "LootDropped":
      return `Item encontrado: ${getBaseItem(event.baseItemId)?.name ?? event.baseItemId} (${rarityLabel(event.rarity)})`;
    case "ItemEquipped":
      return `Equipado: ${getBaseItem(event.baseItemId)?.name ?? event.baseItemId} no slot ${getEquipmentSlotDefinition(event.slotId)?.label ?? event.slotId}`;
    case "EncounterFinished":
      return `Encontro concluído (${event.enemiesKilled} derrotado${event.enemiesKilled === 1 ? "" : "s"})`;
    case "CharacterDied":
      return "Seu personagem morreu";
    case "LevelUp":
      return `Nível ${event.level} alcançado!`;
    case "RecoveryApplied":
      return `Recuperação: +${event.lifeHealed.toFixed(0)} HP`;
    case "ObjectiveCompleted":
      return `Objetivo concluído: ${event.objectiveName} (+${event.xpBonus} XP)`;
    case "RegionUnlocked":
      return `Nova região desbloqueada: ${getRegionName(event.newRegionId)}`;
    case "RegionEntered":
      return `Entrando em ${getRegionName(event.regionId)}`;
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: "feed" —
    // mesmo padrão de todos os outros casos, só formata o que o próprio
    // evento já carrega.
    case "EliteEncounter":
      return `Elite avistado: ${event.enemyName} em ${getRegionName(event.regionId)}`;
    case "MiniBossEncounter":
      return `Mini-Boss avistado: ${event.enemyName} em ${getRegionName(event.regionId)}`;
    case "EliteDefeated":
      return `Elite derrotado: ${event.enemyName} (+${event.xpBonus} XP)`;
    case "MiniBossDefeated":
      return `Mini-Boss derrotado: ${event.enemyName} (+${event.xpBonus} XP)`;
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 7: "feed" — mesmo padrão de todos os outros casos.
    case "WorldEventStarted":
      return `Evento encontrado: ${event.name}`;
    case "WorldEventCompleted":
      return `Evento concluído: ${event.name}`;
    case "TreasureOpened":
      return `Tesouro aberto: ${event.itemCount} item${event.itemCount === 1 ? "" : "ns"}${event.goldAmount > 0 ? ` + ${event.goldAmount} ouro` : ""}`;
    case "MerchantFound":
      return `Mercador encontrado: +${event.goldAmount} ouro`;
    // Fase 2/3 (Gameplay Feedback): a rolagem do Santuário pode conceder
    // 0 em tudo — mostrar "+0 HP, +0 XP, +0 ouro" depois de "Evento
    // encontrado: Altar Antigo" lê como um anticlímax (achado da
    // auditoria hands-on desta Sprint). Mesmo dado real, só a frase
    // muda quando não há nada a conceder.
    case "ShrineBlessing":
      if (event.recoveryAmount <= 0 && event.xpAmount <= 0 && event.goldAmount <= 0) {
        return "Bênção recebida: o santuário permanece em silêncio desta vez";
      }
      return `Bênção recebida: +${event.recoveryAmount.toFixed(0)} HP, +${event.xpAmount} XP, +${event.goldAmount} ouro`;
    case "DiscoveryMade":
      return `Descoberta feita: +${event.xpAmount} XP`;
    case "AmbushTriggered":
      return `Emboscada! ${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"}`;
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 8: "feed" — mesmo padrão de todos os outros casos.
    case "ExpeditionStarted":
      return `Expedição iniciada: ${event.name}`;
    case "ExpeditionCheckpointReached":
      return `Checkpoint ${event.checkpointIndex}/${event.checkpointsTotal} atingido (+${event.recoveryAmount.toFixed(0)} HP)`;
    case "ExpeditionCompleted":
      return `Expedição concluída: ${event.name} (+${event.xpAmount} XP, +${event.goldAmount} ouro)`;
    case "ExpeditionFailed":
      return `Expedição falhou: ${event.name}`;
    // Factions, Reputation & World Consequences Phase I — requisito 6:
    // "feed" — mesmo padrão de todos os outros casos.
    case "ReputationChanged":
      return `Reputação com ${event.factionName}: +${event.delta} (total: ${event.newReputation})`;
    case "ReputationRankUp":
      return `${event.factionName} agora te vê como: ${event.rankName}`;
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 9: "feed" — mesmo padrão de todos os outros casos.
    case "FinalBossEncounter":
      return `Chefe Final avistado: ${event.enemyName}`;
    case "FinalBossDefeated":
      return `Chefe Final derrotado: ${event.enemyName} (+${event.xpAmount} XP, +${event.goldAmount} ouro)`;
    case "DungeonCompleted":
      return `Dungeon concluída: ${event.name} (Chefe Final: ${event.bossName})`;
    default:
      return event satisfies never;
  }
}

export function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) {
    return <p className="hud-event-feed-empty">Nenhum evento ainda.</p>;
  }

  return (
    <ul className="hud-event-feed">
      {[...events].reverse().map((event, index) => (
        <li key={`${event.tickIndex}-${index}`} className={`hud-event-feed-item hud-event-feed-item-${event.kind}`}>
          {describeEvent(event)}
        </li>
      ))}
    </ul>
  );
}
