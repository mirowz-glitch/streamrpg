/**
 * Sprint 15 — Sockets + Gem System (Foundation), QA-only. "Nenhuma
 * Gema poderosa será criada" nesta Sprint — nenhum fluxo real de
 * drop/craft concede Gemas ainda. Este script é a ÚNICA forma de um
 * personagem ganhar Gemas hoje, e existe só para testes/QA/Browser
 * Validation — nunca chamado por nenhuma rota HTTP, nunca exposto ao
 * jogador. Mesmo formato de scripts/qaGrantSpheres.ts.
 *
 * Uso (a partir da raiz do repo — DB_PATH em env.ts é relativo a
 * process.cwd(), mesmo cuidado já documentado pra todo QA seed script
 * deste projeto):
 *
 *   npx tsx apps/api/scripts/qaGrantGems.ts <characterId> [quantidade]
 *
 * Sem characterId: lista os personagens existentes e sai (não adivinha
 * qual usar). `quantidade` (opcional, default 3) é a quantidade de
 * Gemas soltas criadas (gemType "test-gem", tier 1).
 */
import { getDb } from "../src/config/database.js";
import { createGemForTesting, listCharacterGems } from "../src/services/gem.service.js";

function listCharacters(): void {
  const rows = getDb().prepare(`SELECT id, display_name FROM characters ORDER BY created_at DESC LIMIT 20`).all() as {
    id: string;
    display_name: string;
  }[];
  console.log("Nenhum characterId informado. Personagens existentes (mais recentes primeiro):");
  for (const row of rows) {
    console.log(`  ${row.id}  —  ${row.display_name}`);
  }
  console.log("\nUso: npx tsx apps/api/scripts/qaGrantGems.ts <characterId> [quantidade]");
}

function main(): void {
  const [characterId, quantityArg] = process.argv.slice(2);
  if (!characterId) {
    listCharacters();
    return;
  }

  const character = getDb().prepare(`SELECT id, display_name FROM characters WHERE id = ?`).get(characterId) as
    | { id: string; display_name: string }
    | undefined;
  if (!character) {
    console.error(`Personagem "${characterId}" não encontrado.`);
    process.exitCode = 1;
    return;
  }

  const quantity = quantityArg ? Number(quantityArg) : 3;
  for (let i = 0; i < quantity; i++) {
    createGemForTesting(characterId, "test-gem", 1);
  }

  console.log(`Concedidas ${quantity} Gema(s) solta(s) para "${character.display_name}" (${characterId}).`);
  console.log("Gemas agora:", listCharacterGems(characterId));
}

main();
