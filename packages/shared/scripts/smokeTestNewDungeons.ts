import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { advanceDungeonTick } from "../src/dungeon/dungeonController.js";
import { deriveHudState } from "../src/hud/deriveHudState.js";
import { getExpeditionDefinition } from "../src/expeditions/expeditionDefinitions.js";
import { getFinalBossTemplateId } from "../src/dungeon/dungeonDefinitions.js";
import { getLootTable } from "../src/lootgen/lootTables.js";
import { xpForLevel } from "../src/xp.js";
import { generateEncounter } from "../src/worldencounter/generator.js";
import { getEncounterTable } from "../src/worldencounter/encounterTables.js";
import { getCombinedRewardMultiplier, resolveExpeditionModifiers } from "../src/expeditions/expeditionModifiers.js";
import { deriveExpeditionProgress } from "../src/expeditions/expeditionProgress.js";

// Vertical Slice — Multi-Dungeon Content & Data Expansion Phase I —
// Smoke Test (não é simulação de balanceamento, nunca 1000+ execuções):
// entra diretamente em cada uma das 3 novas Dungeons e roda um punhado
// de ticks, confirmando que HUD/Boss/Recompensa/Objetivo resolvem sem
// erro para conteúdo criado inteiramente por dados.
interface SmokeCase {
  expeditionId: string;
  regionId: string;
  seed: number;
  // Nível alvo pra CADA caso, escolhido dentro da faixa da própria
  // região MAS abaixo do gate mínimo da PRÓXIMA região na sequência
  // (BIOME_PROGRESSION) — descoberto empiricamente rodando este mesmo
  // smoke test: um personagem já no nível máximo faz o Region Unlock
  // (regionProgression.ts, intocado) avançar pra região seguinte
  // dentro do próprio tick 1, ANTES do auto-início de Expedição rodar
  // pra região pretendida — um artefato deste harness de teste (que
  // pula direto pro nível alvo), não um bug do jogo.
  targetLevel: number;
}

const CASES: SmokeCase[] = [
  { expeditionId: "fortaleza-congelada", regionId: "picos-congelados", seed: 1001, targetLevel: 22 },
  { expeditionId: "catedral-esquecida", regionId: "litoral-quebrado", seed: 2002, targetLevel: 26 },
  { expeditionId: "covil-do-dragao", regionId: "deserto-de-vidro", seed: 3003, targetLevel: 30 },
];

const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: Multi-Dungeon Content & Data Expansion Phase I");
lines.push("");

let allPassed = true;

for (const testCase of CASES) {
  const definition = getExpeditionDefinition(testCase.expeditionId);
  const bossTemplateId = getFinalBossTemplateId(testCase.expeditionId);
  const lootTable = definition?.reward.guaranteedLootTableId ? getLootTable(definition.reward.guaranteedLootTableId) : undefined;

  lines.push(`## ${definition?.name ?? testCase.expeditionId}`);

  const checks: { name: string; passed: boolean }[] = [];
  checks.push({ name: "ExpeditionDefinition existe", passed: !!definition });
  checks.push({ name: "Boss Template mapeado (dungeonDefinitions.ts)", passed: !!bossTemplateId });
  checks.push({ name: "Loot Table de recompensa existe", passed: !!lootTable });

  const build = new CharacterBuild("smoke", "warrior", 0);
  const inventory = new Inventory("smoke", 30);
  const equipment = new Equipment("smoke");
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", testCase.seed);
  // Pula direto pro nível-alvo do caso (progressão natural até aqui já
  // é validada pelas Sprints de Player Journey/Boss Accessibility — não
  // é o que este smoke test mede). `targetLevel` fica deliberadamente
  // abaixo do gate da PRÓXIMA região (ver comentário em SmokeCase).
  character.characterBuild.addExperience(xpForLevel(testCase.targetLevel));

  const session = createAdventureSession("smoke-session", character, testCase.regionId, testCase.seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  // "Confirmar Boss" — verificado de dois jeitos complementares:
  //
  // 1) Geração direta (generateEncounter, função pura, sem combate):
  // prova que a Encounter Table resolve pro Enemy Template certo quando
  // a variante "miniboss" é sorteada — o que este smoke test realmente
  // precisa provar (conteúdo por dados corretamente conectado), sem
  // depender de o personagem SOBREVIVER até rolar a variante de verdade
  // (isso é uma questão de balanceamento, fora do escopo desta Sprint —
  // "evitar grandes simulações"). ~300 seeds bastam pra ~14% de chance
  // por rolagem (mesma taxa já calibrada de ruinas-esquecidas) acertar
  // ao menos 1 vez com confiança virtual.
  let bossResolvesFromTable = false;
  if (bossTemplateId) {
    const table = getEncounterTable(testCase.regionId);
    const probeLevel = table ? Math.round((table.levelRange.min + table.levelRange.max) / 2) : testCase.targetLevel;
    for (let probeSeed = 0; probeSeed < 300 && !bossResolvesFromTable; probeSeed++) {
      const recipe = generateEncounter(testCase.regionId, probeLevel, testCase.seed * 100_000 + probeSeed);
      if (recipe.variant === "miniboss" && recipe.groups[0]?.enemyTemplateId === bossTemplateId) bossResolvesFromTable = true;
    }
  }

  // 2) Sessão real (advanceDungeonTick): prova que ExpeditionStarted/
  // HUD/loop completo funcionam sem exceção — o Boss sendo avistado
  // aqui é bônus (best effort, best-effort porque depende de
  // sobrevivência), nunca um requisito rígido deste smoke test.
  let expeditionStarted = false;
  let hudResolvedOk = true;
  let errorThrown: string | null = null;

  try {
    let ticks = 0;
    while (ticks < 200 && session.character.currentLife > 0) {
      ticks++;
      const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
      if (events.some((e) => e.kind === "ExpeditionStarted" && e.expeditionId === testCase.expeditionId)) expeditionStarted = true;

      const hud = deriveHudState(session, timeline);
      if (!hud) hudResolvedOk = false;
    }
  } catch (error) {
    errorThrown = error instanceof Error ? error.message : String(error);
  }

  checks.push({ name: "ExpeditionStarted para esta Dungeon (auto-início por bioma)", passed: expeditionStarted });
  checks.push({ name: "Boss resolve corretamente a partir da Encounter Table (geração direta, sem depender de sobrevivência)", passed: bossResolvesFromTable });
  checks.push({ name: "deriveHudState() nunca lança/retorna estado inválido", passed: hudResolvedOk });
  checks.push({ name: "Nenhuma exceção lançada durante os ticks", passed: errorThrown === null });

  // Vertical Slice — Dungeon Modifiers, Variants & Replayability Phase I
  // — Fase 3/4/5: confirma que getExpeditionDefinition() já devolve a
  // recompensa AJUSTADA (o único mecanismo real desta Sprint) e que o
  // snapshot que o HUD consome (deriveExpeditionProgress) expõe os
  // modificadores ativos + o mesmo bônus percentual — tudo sem
  // recalcular nada, só empacotando o que expeditionModifiers.ts já
  // resolve.
  if (definition?.modifiers && definition.modifiers.length > 0) {
    const expectedMultiplier = getCombinedRewardMultiplier(definition.modifiers);
    const resolved = resolveExpeditionModifiers(definition.modifiers);
    checks.push({ name: `Todos os ${definition.modifiers.length} modificadores resolvem pra uma DungeonModifierDefinition real`, passed: resolved.length === definition.modifiers.length });

    // Testado com uma Timeline sintética própria (só um ExpeditionStarted
    // manual) — decidido de propósito pra NÃO depender da sessão de
    // combate acima (que pode falhar/concluir antes de eu conseguir ler
    // o snapshot): isola exatamente o que este check quer provar (o
    // snapshot que o HUD consome reflete os modificadores certos),
    // igual ao princípio já usado no check de Boss acima.
    const probeTimeline = createAdventureTimeline("modifier-probe");
    probeTimeline.events.push({ kind: "ExpeditionStarted", expeditionId: testCase.expeditionId, name: definition.name, regionId: testCase.regionId, tickIndex: 0, timestamp: 0 });
    const probeSnapshot = deriveExpeditionProgress(session, probeTimeline);

    const progressOk =
      !!probeSnapshot &&
      probeSnapshot.activeModifiers.length === definition.modifiers.length &&
      Math.abs(probeSnapshot.rewardMultiplier - expectedMultiplier) < 1e-9;
    checks.push({ name: "ExpeditionProgressSnapshot expõe activeModifiers/rewardMultiplier corretos (consumido pelo HUD)", passed: progressOk });
  }

  for (const check of checks) {
    lines.push(`- [${check.passed ? "OK" : "FALHOU"}] ${check.name}`);
    if (!check.passed) allPassed = false;
  }
  if (errorThrown) lines.push(`  - erro: ${errorThrown}`);
  lines.push("");
}

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);

const markdown = lines.join("\n");
console.log(markdown);
if (!allPassed) process.exit(1);
