/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 13. QA-only, mesmo padrão
 * de qaGrantGems.ts/qaGrantSpheres.ts: nenhuma rota HTTP chama isto,
 * existe só para Browser Validation — nenhum fluxo real de
 * drop/craft concede Sockets pré-preenchidos com Gemas com Behavior
 * ainda (só o Item Generator concede 0-6 Sockets vazios, Sprint 15).
 *
 * Força Sockets num item já equipado do personagem e socketa até 4
 * Gemas com Behavior real (Rubi/Safira/Esmeralda/Onyx) — o suficiente
 * pra ver "Builds Ativas" na CharacterPage e o Snapshot refletir os
 * Behaviors em uma única jornada de Adventure/Dungeon/Boss.
 *
 * Uso (a partir da raiz do repo):
 *   npx tsx apps/api/scripts/qaSocketBehaviorGems.ts <characterId>
 */
import { getDb } from "../src/config/database.js";
import { getEquippedItems } from "../src/services/drop.service.js";
import { createGemForTesting, socketGem } from "../src/services/gem.service.js";
import { createSocketConfiguration } from "@streamrpg/shared";

function listCharacters(): void {
  const rows = getDb().prepare(`SELECT id, display_name FROM characters ORDER BY created_at DESC LIMIT 20`).all() as {
    id: string;
    display_name: string;
  }[];
  console.log("Nenhum characterId informado. Personagens existentes (mais recentes primeiro):");
  for (const row of rows) {
    console.log(`  ${row.id}  —  ${row.display_name}`);
  }
  console.log("\nUso: npx tsx apps/api/scripts/qaSocketBehaviorGems.ts <characterId>");
}

function main(): void {
  const [characterId] = process.argv.slice(2);
  if (!characterId) {
    listCharacters();
    return;
  }

  const equipped = getEquippedItems(characterId);
  if (equipped.length === 0) {
    console.error(`Personagem "${characterId}" não tem nenhum item equipado — equipe algo primeiro.`);
    process.exitCode = 1;
    return;
  }

  const target = equipped[0]!;
  const config = createSocketConfiguration(4, 424242);
  getDb().prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(config), target.item_id);

  const gemTypes = ["ruby-1", "sapphire-1", "emerald-1", "onyx-1"] as const;
  for (let i = 0; i < gemTypes.length; i++) {
    const gem = createGemForTesting(characterId, gemTypes[i]!, 1);
    const result = socketGem(characterId, gem.id, target.character_item_id, config.sockets[i]!.id);
    console.log(`Socket ${i}: ${gemTypes[i]} -> ${result.success ? "OK" : "FALHOU: " + result.reason}`);
  }

  console.log(`\n4 Gemas com Behavior socketadas em "${target.name}" (item ${target.item_id}) de ${characterId}.`);
}

main();
