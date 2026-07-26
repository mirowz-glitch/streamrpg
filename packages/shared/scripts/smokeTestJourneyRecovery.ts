import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { advanceDungeonTick } from "../src/dungeon/dungeonController.js";
import { xpForLevel } from "../src/xp.js";
import type { PresentationEvent } from "../src/presentation/types.js";

// Vertical Slice — Player Journey Recovery & World Progression Phase I
// — Smoke Test (curto, sem sessões longas): confirma o desbloqueio de
// regiões além de Ruínas Esquecidas, a entrada nas 4 Dungeons, a
// conclusão da Dungeon original e a obtenção de ao menos uma Relíquia
// em condições normais.
const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: Player Journey Recovery & World Progression Phase I");
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

lines.push("## Desbloqueio de regiões além de Ruínas Esquecidas (Fase 1/2)");
{
  const { session, timeline } = freshSession("cascade", "bosque-sussurrante", undefined);
  let ticks = 0;
  const regionsSeen = new Set<string>([session.currentRegion]);
  while (ticks < 400 && session.character.currentLife > 0) {
    ticks++;
    advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
    regionsSeen.add(session.currentRegion);
  }
  check("personagem avança além de ruinas-esquecidas (achado #1 da auditoria corrigido)", regionsSeen.has("picos-congelados") || regionsSeen.has("litoral-quebrado") || regionsSeen.has("deserto-de-vidro") || regionsSeen.has("fortaleza-sombria"));
  check(`regiões visitadas nesta execução: ${[...regionsSeen].join(", ")}`, true);
}
lines.push("");

lines.push("## Entrada nas 4 Dungeons");
{
  const cases: { label: string; regionId: string; startingLevel: number | undefined; expeditionId: string }[] = [
    { label: "Queda da Fortaleza Sombria", regionId: "bosque-sussurrante", startingLevel: undefined, expeditionId: "queda-da-fortaleza-sombria" },
    { label: "Fortaleza Congelada", regionId: "picos-congelados", startingLevel: 25, expeditionId: "fortaleza-congelada" },
    { label: "Catedral Esquecida", regionId: "litoral-quebrado", startingLevel: 28, expeditionId: "catedral-esquecida" },
    { label: "Covil do Dragão", regionId: "deserto-de-vidro", startingLevel: 30, expeditionId: "covil-do-dragao" },
  ];
  for (const { label, regionId, startingLevel, expeditionId } of cases) {
    const { session, timeline } = freshSession(`enter-${expeditionId}`, regionId, startingLevel);
    let started = false;
    for (let ticks = 1; ticks <= 5 && !started; ticks++) {
      const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
      started = events.some((e) => e.kind === "ExpeditionStarted" && e.expeditionId === expeditionId);
    }
    check(`${label} inicia automaticamente ao entrar em ${regionId}`, started);
  }
}
lines.push("");

lines.push("## Conclusão da Dungeon original (Fase 3)");
{
  const { session, timeline } = freshSession("original-complete", "bosque-sussurrante", undefined);
  let ticks = 0;
  let completedEvent: PresentationEvent | undefined;
  let relicFound = false;
  while (ticks < 250 && session.character.currentLife > 0 && !completedEvent) {
    ticks++;
    const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
    completedEvent = events.find((e) => e.kind === "DungeonCompleted");
    if (events.some((e) => e.kind === "LootDropped" && e.rarity === "unique")) relicFound = true;
  }
  check("a Dungeon original completa dentro de um orçamento curto de ticks (nova calibração da Fase 3)", !!completedEvent);
  check("ao menos uma Relíquia (item de raridade unique) foi obtida em condições normais (Fase 5, achado da auditoria)", relicFound);
}
lines.push("");

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);
console.log(lines.join("\n"));
if (!allPassed) process.exit(1);
