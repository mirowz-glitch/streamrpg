import { generateEncounter } from "../src/worldencounter/generator.js";
import { spawnWorldEncounter } from "../src/worldencounter/spawn.js";
import { toCombatant } from "../src/enemy/combatant.js";
import { getEnemyTemplate } from "../src/enemy/templates.js";
import { resolveCombinedRuntimeConfig } from "../src/worldtiers/worldTierDefinitions.js";
import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { deriveHudState } from "../src/hud/deriveHudState.js";
import { getExpeditionDefinition } from "../src/expeditions/expeditionDefinitions.js";

// Vertical Slice — World Tiers & Endgame Scaling Phase I — Smoke Test
// (curto, sem sessões longas): a MESMA Dungeon em WT1 vs WT4, medindo
// vida/dano/recompensa/HUD de dois jeitos complementares (mesmo
// princípio já usado nos smoke tests anteriores): geração direta (sem
// depender de uma sessão real resolver o encontro dentro do tick) +
// uma Timeline sintética só pra checar o snapshot que o HUD consome.
const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: World Tiers & Endgame Scaling Phase I");
lines.push("");
let allPassed = true;
function check(name: string, passed: boolean) {
  lines.push(`- [${passed ? "OK" : "FALHOU"}] ${name}`);
  if (!passed) allPassed = false;
}

const EXPEDITION_ID = "descida-as-minas";
const REGION_ID = "minas-abandonadas";

lines.push("## Combat — vida/dano do inimigo, mesma Dungeon em WT1 vs WT4 (sem Dungeon Modifiers)");
{
  const level = 15;
  const seed = 555;
  const recipe = generateEncounter(REGION_ID, level, seed);

  const wt1Config = resolveCombinedRuntimeConfig("WT1");
  const wt4Config = resolveCombinedRuntimeConfig("WT4");
  const wt1 = spawnWorldEncounter(recipe, wt1Config);
  const wt4 = spawnWorldEncounter(recipe, wt4Config);

  const template = getEnemyTemplate(wt1.enemies[0].templateId)!;
  const wt1Damage = toCombatant(wt1.enemies[0], template).finalStats.physicalDamage;
  const wt4Damage = toCombatant(wt4.enemies[0], template).finalStats.physicalDamage;

  check(
    `WT4 tem mais vida de inimigo que WT1 (WT1=${wt1.enemies[0].maximumLife.toFixed(1)}, WT4=${wt4.enemies[0].maximumLife.toFixed(1)}, esperado 1.6x)`,
    Math.abs(wt4.enemies[0].maximumLife - wt1.enemies[0].maximumLife * 1.6) < 1e-6,
  );
  check(
    `WT4 tem mais dano de inimigo que WT1 (WT1=${wt1Damage.toFixed(1)}, WT4=${wt4Damage.toFixed(1)}, esperado 1.6x)`,
    Math.abs(wt4Damage - wt1Damage * 1.6) < 1e-6,
  );
}
lines.push("");

lines.push("## Rewards — recompensa da Dungeon em WT1 vs WT4");
{
  const definition = getExpeditionDefinition(EXPEDITION_ID)!;
  const wt1Config = resolveCombinedRuntimeConfig("WT1");
  const wt4Config = resolveCombinedRuntimeConfig("WT4");
  const wt1Xp = Math.round((definition.reward.xpAmount ?? 0) * wt1Config.xpMultiplier);
  const wt4Xp = Math.round((definition.reward.xpAmount ?? 0) * wt4Config.xpMultiplier);
  check(`WT4 concede mais XP que WT1 na mesma Dungeon (WT1=${wt1Xp}, WT4=${wt4Xp})`, wt4Xp > wt1Xp);
}
lines.push("");

lines.push("## HUD — Tier + bônus refletidos no snapshot (Timeline sintética)");
{
  function hudFor(worldTier: string) {
    const build = new CharacterBuild(`smoke-wt-${worldTier}`, "warrior", 0);
    const inventory = new Inventory(`smoke-wt-${worldTier}`, 30);
    const equipment = new Equipment(`smoke-wt-${worldTier}`);
    const character = createAdventureCharacter(build, inventory, equipment);
    equipStarterKit(character, "warrior", 1);
    const session = createAdventureSession(`smoke-wt-session-${worldTier}`, character, REGION_ID, 1, 0);
    session.worldTier = worldTier;
    const timeline = createAdventureTimeline(session.sessionId);
    timeline.events.push({ kind: "ExpeditionStarted", expeditionId: EXPEDITION_ID, name: "Descida às Minas", regionId: REGION_ID, tickIndex: 0, timestamp: 0 });
    return deriveHudState(session, timeline).expedition;
  }

  const wt1Hud = hudFor("WT1");
  const wt4Hud = hudFor("WT4");

  check(`HUD mostra o World Tier ativo (WT1: "${wt1Hud?.worldTier}")`, wt1Hud?.worldTier === "WT1");
  check(`HUD mostra o World Tier ativo (WT4: "${wt4Hud?.worldTier}")`, wt4Hud?.worldTier === "WT4");
  check(
    `HUD mostra bônus de recompensa maior em WT4 (WT1=+${wt1Hud?.rewardBonusPercent}%, WT4=+${wt4Hud?.rewardBonusPercent}%)`,
    (wt4Hud?.rewardBonusPercent ?? 0) > (wt1Hud?.rewardBonusPercent ?? 0),
  );
}
lines.push("");

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);
console.log(lines.join("\n"));
if (!allPassed) process.exit(1);
