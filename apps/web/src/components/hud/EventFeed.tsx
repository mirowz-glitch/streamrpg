import { getRegionName, type PresentationEvent } from "@streamrpg/shared";

interface EventFeedProps {
  events: PresentationEvent[];
}

// HUD & Gameplay UI Phase I — requisito 5: consome os Presentation
// Events diretamente (já vêm prontos em HudState.recentEvents,
// deriveHudState() só fatia a Adventure Timeline) — "nunca reconstruir
// eventos": este componente nunca decide o que aconteceu, só formata
// pra exibição o que já está no evento.
function describeEvent(event: PresentationEvent): string {
  switch (event.kind) {
    case "EncounterStarted":
      return `Encontro iniciado em ${event.regionId} (${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"})`;
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
    case "LootDropped":
      return `Item encontrado: ${event.baseItemId} (${event.rarity})`;
    case "ItemEquipped":
      return `Equipado: ${event.baseItemId} no slot ${event.slotId}`;
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
    case "ShrineBlessing":
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
