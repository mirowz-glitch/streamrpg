import { getEnemyTemplate } from "../enemy/templates.js";
import { deriveExpeditionProgress } from "../expeditions/expeditionProgress.js";
import type { AdventureSession } from "../adventure/types.js";
import type { AdventureTimeline } from "../presentation/types.js";
import { getFinalBossTemplateId } from "./dungeonDefinitions.js";
import type { DungeonBossProgress } from "./types.js";

// Requisito 8 — HUD ("BOSS FINAL"): reusa a derivação pura já feita
// pelo Expedition Controller (expeditionProgress.ts: expeditionId +
// startTickIndex da Expedição ATIVA) — nunca recalcula fronteira duas
// vezes. `null` sempre que não há Expedição ativa, ou a Expedição ativa
// não tem Chefe Final designado (a maioria das Expedições, ver
// dungeonDefinitions.ts) — "apenas quando aplicável" (requisito 8).
export function deriveDungeonBossProgress(session: AdventureSession, timeline: AdventureTimeline): DungeonBossProgress | null {
  const expeditionSnapshot = deriveExpeditionProgress(session, timeline);
  if (!expeditionSnapshot) return null;

  const bossTemplateId = getFinalBossTemplateId(expeditionSnapshot.expeditionId);
  if (!bossTemplateId) return null;

  const template = getEnemyTemplate(bossTemplateId);
  if (!template) return null;

  const eventsSinceStart = timeline.events.filter((event) => event.tickIndex >= expeditionSnapshot.startTickIndex);
  const encountered = eventsSinceStart.some((event) => event.kind === "FinalBossEncounter" && event.enemyTemplateId === bossTemplateId);
  const defeated = eventsSinceStart.some((event) => event.kind === "FinalBossDefeated" && event.enemyTemplateId === bossTemplateId);

  // Barra de vida: só enquanto o combate contra ELE MESMO está
  // literalmente em andamento agora — mesma limitação estrutural de
  // HudEncounterInfo (hud/deriveHudState.ts): `session.currentEncounter`
  // some assim que o encontro se resolve (vitória ou derrota), então
  // `healthPercent` cai pra `null` na tick seguinte (nunca inventado).
  let healthPercent: number | null = null;
  if (session.currentEncounter && session.currentEncounter.variant === "miniboss") {
    const bossEnemy = session.currentEncounter.enemies.find((enemy) => enemy.templateId === bossTemplateId);
    if (bossEnemy) {
      healthPercent = bossEnemy.maximumLife > 0 ? Math.max(0, Math.min(100, (bossEnemy.currentLife / bossEnemy.maximumLife) * 100)) : 0;
    }
  }

  return {
    enemyTemplateId: bossTemplateId,
    bossName: template.name,
    encountered,
    defeated,
    healthPercent,
  };
}
