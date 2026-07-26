import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { advanceDungeonTick } from "../src/dungeon/dungeonController.js";
import { getExpeditionDefinition } from "../src/expeditions/expeditionDefinitions.js";
import { xpForLevel } from "../src/xp.js";
import type { PresentationEvent } from "../src/presentation/types.js";

// Vertical Slice — Progression Economy & Reward Curve Phase I — Smoke
// Test (curto, sem sessões longas): início do jogo, uma Dungeon
// intermediária (Fortaleza Congelada), uma Dungeon avançada (Covil do
// Dragão) e um Boss que de fato vence (Queda da Fortaleza Sombria) —
// confirma que a progressão continua coerente após os ajustes desta
// Sprint (Fase 3).
const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: Progression Economy & Reward Curve Phase I");
lines.push("");
let allPassed = true;
function check(name: string, passed: boolean) {
  lines.push(`- [${passed ? "OK" : "FALHOU"}] ${name}`);
  if (!passed) allPassed = false;
}

function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
  return total;
}

function freshSession(suffix: string, regionId: string, startingLevel: number | undefined) {
  const build = new CharacterBuild(`smoke-${suffix}`, "warrior", 0);
  const inventory = new Inventory(`smoke-${suffix}`, 30);
  const equipment = new Equipment(`smoke-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", 1);
  if (startingLevel) character.characterBuild.addExperience(cumulativeXpForLevel(startingLevel));
  const session = createAdventureSession(`smoke-session-${suffix}`, character, regionId, 1, 0);
  const timeline = createAdventureTimeline(session.sessionId);
  return { session, timeline };
}

lines.push("## Início do jogo (bosque-sussurrante, nível 1)");
{
  const { session, timeline } = freshSession("start", "bosque-sussurrante", undefined);
  let ticks = 0;
  let sawXp = false;
  let sawGold = false;
  while (ticks < 10 && session.character.currentLife > 0) {
    ticks++;
    advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
    if (session.character.characterBuild.experience > 0) sawXp = true;
    if (session.statistics.goldFound > 0) sawGold = true;
  }
  check("personagem recém-criado avança ticks sem exceção", true);
  check("ganha XP normalmente no início do jogo", sawXp);
}
lines.push("");

lines.push("## Dungeon intermediária — Fortaleza Congelada (nível 25)");
{
  const { session, timeline } = freshSession("intermediate", "picos-congelados", 25);
  let ticks = 0;
  let started = false;
  try {
    while (ticks < 30 && session.character.currentLife > 0) {
      ticks++;
      const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
      if (events.some((e) => e.kind === "ExpeditionStarted")) started = true;
    }
    check("Fortaleza Congelada inicia automaticamente ao entrar no bioma", started);
    check("nenhuma exceção lançada mesmo quando a Dungeon não é completada (achado da auditoria)", true);
  } catch (error) {
    check(`nenhuma exceção lançada (${error instanceof Error ? error.message : error})`, false);
  }
}
lines.push("");

lines.push("## Dungeon avançada — Covil do Dragão (nível 30)");
{
  const { session, timeline } = freshSession("advanced", "deserto-de-vidro", 30);
  let ticks = 0;
  let started = false;
  try {
    while (ticks < 30 && session.character.currentLife > 0) {
      ticks++;
      const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
      if (events.some((e) => e.kind === "ExpeditionStarted")) started = true;
    }
    check("Covil do Dragão inicia automaticamente ao entrar no bioma", started);
    check("nenhuma exceção lançada mesmo quando a Dungeon não é completada (achado da auditoria)", true);
  } catch (error) {
    check(`nenhuma exceção lançada (${error instanceof Error ? error.message : error})`, false);
  }
}
lines.push("");

lines.push("## Boss vencível — Queda da Fortaleza Sombria (confirma valores ajustados na Fase 3)");
{
  const definition = getExpeditionDefinition("queda-da-fortaleza-sombria")!;
  check(`reward.xpAmount reflete o ajuste desta Sprint (1500, era 2200)`, definition.reward.xpAmount === 1500);
  check(`reward.goldAmount reflete o ajuste desta Sprint (400, era 600)`, definition.reward.goldAmount === 400);

  const { session, timeline } = freshSession("boss", "bosque-sussurrante", undefined);
  let ticks = 0;
  let completedEvent: PresentationEvent | undefined;
  let dungeonCompletedEvent: PresentationEvent | undefined;
  while (ticks < 600 && session.character.currentLife > 0 && !completedEvent) {
    ticks++;
    const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
    completedEvent = events.find((e) => e.kind === "ExpeditionCompleted");
    dungeonCompletedEvent = events.find((e) => e.kind === "DungeonCompleted") ?? dungeonCompletedEvent;
  }
  check("a Dungeon completa dentro de um número razoável de ticks (mesmo perfil já validado)", !!completedEvent);
  if (completedEvent && completedEvent.kind === "ExpeditionCompleted") {
    check(`XP concedido na conclusão bate com o valor ajustado (${completedEvent.xpAmount})`, completedEvent.xpAmount === 1500);
    check(`Ouro concedido na conclusão bate com o valor ajustado (${completedEvent.goldAmount})`, completedEvent.goldAmount === 400);
  }
  check("o Chefe Final foi encontrado e derrotado ao menos uma vez nesta sessão (DungeonCompleted)", !!dungeonCompletedEvent);
}
lines.push("");

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);
console.log(lines.join("\n"));
if (!allPassed) process.exit(1);
