import { spawnEnemy, killEnemy } from "../src/enemy/instance.js";
import { getEnemyTemplate } from "../src/enemy/templates.js";
import { generateLootForKilledEnemy } from "../src/enemy/lootIntegration.js";
import { getUniqueRelicIdsForBoss, UNIQUE_RELIC_DEFINITIONS } from "../src/dungeon/uniqueRelicDefinitions.js";
import { getLootTable } from "../src/lootgen/lootTables.js";
import { buildAnimationsForTick } from "../src/animation/handlers.js";
import { Inventory } from "../src/inventory/inventory.js";
import type { PresentationEvent } from "../src/presentation/types.js";

// Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — Smoke
// Test (curto, sem sessões longas): derrota diretamente (spawnEnemy +
// killEnemy + generateLootForKilledEnemy, sem precisar de uma sessão
// inteira) cada um dos 4 Bosses com relíquia declarada, confirmando que
// a relíquia aparece no loot pelo menos uma vez em poucas tentativas
// (bias de raridade bem alto), que o "HUD" (buildAnimationsForTick)
// reconhece automaticamente, e que os dados batem (Loot Table/nome/
// raridade).
const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: Unique Dungeon Relics & Boss Loot Phase I");
lines.push("");
let allPassed = true;
function check(name: string, passed: boolean) {
  lines.push(`- [${passed ? "OK" : "FALHOU"}] ${name}`);
  if (!passed) allPassed = false;
}

lines.push("## Dados — 4 relíquias, uma por Boss existente");
for (const relic of UNIQUE_RELIC_DEFINITIONS) {
  const lootTable = getLootTable(relic.lootIdentity);
  const bossTemplate = getEnemyTemplate(relic.bossId);
  check(`"${relic.name}" (${relic.id}) tem Loot Table real ("${relic.lootIdentity}")`, !!lootTable);
  check(`"${relic.name}" referencia um Boss (Enemy Template) real ("${relic.bossId}")`, !!bossTemplate);
  check(`Boss "${relic.bossId}" declara esta relíquia de volta (BOSS_UNIQUE_RELICS)`, getUniqueRelicIdsForBoss(relic.bossId).includes(relic.id));
}
lines.push("");

lines.push("## Loot Integration — derrotar cada Boss, confirmar a relíquia no resultado");
for (const relic of UNIQUE_RELIC_DEFINITIONS) {
  const template = getEnemyTemplate(relic.bossId)!;
  const level = Math.round((template.levelRange.min + template.levelRange.max) / 2);

  let foundRelic = false;
  let foundEvents: PresentationEvent[] = [];
  let foundRelicItem: ReturnType<typeof generateLootForKilledEnemy>["generatedItems"][number] | undefined;
  for (let seed = 0; seed < 20 && !foundRelic; seed++) {
    const instance = spawnEnemy(template, seed, level, { variant: "miniboss" });
    const killResult = killEnemy(instance, template, seed * 1000);
    const loot = generateLootForKilledEnemy(killResult, instance, seed);
    const relicItem = loot.generatedItems.find((item) => item.rarity === "unique");
    if (relicItem) {
      foundRelic = true;
      foundRelicItem = relicItem;
      foundEvents = [
        { kind: "FinalBossDefeated", enemyTemplateId: relic.bossId, enemyName: template.name, xpAmount: 100, goldAmount: 50, tickIndex: 0, timestamp: 0 },
        { kind: "LootDropped", instanceId: "smoke-relic", baseItemId: relicItem.baseItemId, rarity: relicItem.rarity, powerScore: relicItem.powerScore, regionId: "smoke", stored: true, tickIndex: 0, timestamp: 0 },
      ];
    }
  }

  check(`"${relic.name}": derrotar "${relic.bossId}" produz a relíquia (unique) em até 20 tentativas`, foundRelic);

  if (foundRelic && foundRelicItem) {
    // Verifica inventário: o mesmo caminho que adventureLoop.ts (intocado)
    // já usa pra qualquer item de loot — a relíquia não é um objeto
    // especial, é um ItemGenGeneratedItem normal, então addItem() já
    // funciona sem nenhuma mudança no Inventory.
    const inventory = new Inventory("smoke-relic-inventory", 30);
    const addResult = inventory.addItem(`smoke-${relic.id}`, foundRelicItem);
    check(`"${relic.name}" entra no Inventory normalmente (addItem)`, addResult.success);

    const animations = buildAnimationsForTick(foundEvents, [], 0);
    const defeatedAnimation = animations.find((a) => a.type === "final-boss-defeated");
    const payload = defeatedAnimation?.payload as { relicName?: string; relicRarity?: string } | undefined;
    check(
      `HUD (animação "final-boss-defeated") reconhece a relíquia automaticamente: "${payload?.relicName}" (${payload?.relicRarity})`,
      payload?.relicName === relic.name && payload?.relicRarity === relic.rarity,
    );
  }
}
lines.push("");

lines.push("## Boss sem relíquia declarada — nenhum efeito colateral");
{
  const template = getEnemyTemplate("wolf-alpha")!;
  const instance = spawnEnemy(template, 1, 5, { variant: "miniboss" });
  const killResult = killEnemy(instance, template, 1000);
  const loot = generateLootForKilledEnemy(killResult, instance, 1);
  check("wolf-alpha (sem relíquia declarada) nunca gera um item 'unique' garantido extra", !loot.generatedItems.some((item) => item.rarity === "unique"));
}
lines.push("");

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);
console.log(lines.join("\n"));
if (!allPassed) process.exit(1);
