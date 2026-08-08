/**
 * Sprint 12 — Crafting Phase I (Sphere System), QA-only. "Esferas não
 * podem ser compradas... nenhum drop definitivo, nenhuma loja" nesta
 * Sprint — a distribuição real (Boss/Dungeon/World Event) é Sprint
 * futura. Este script é a ÚNICA forma de um personagem ganhar Esferas
 * hoje, e existe só para testes/QA/Browser Validation — nunca chamado
 * por nenhuma rota HTTP, nunca exposto ao jogador.
 *
 * Uso (a partir da raiz do repo — DB_PATH em env.ts é relativo a
 * process.cwd(), mesmo cuidado já documentado pra todo QA seed script
 * deste projeto):
 *
 *   npx tsx apps/api/scripts/qaGrantSpheres.ts <characterId> [quantidade]
 *
 * Sem characterId: lista os personagens existentes e sai (não adivinha
 * qual usar). `quantidade` (opcional, default 5) é aplicada às 5
 * Esferas de uma vez.
 */
import { getDb } from "../src/config/database.js";
import { grantSphereForTesting, getSphereInventory } from "../src/services/sphere.service.js";
import type { SphereTypeId } from "@streamrpg/shared";

// Sprint 16 — Economy Foundation: "uncertainty" (Esfera da Incerteza) somada — mesmo caminho QA-only das outras 5.
const ALL_SPHERE_IDS: SphereTypeId[] = ["fortune", "purification", "ascension", "lapidation", "curse", "uncertainty"];

function listCharacters(): void {
  const rows = getDb().prepare(`SELECT id, display_name FROM characters ORDER BY created_at DESC LIMIT 20`).all() as {
    id: string;
    display_name: string;
  }[];
  console.log("Nenhum characterId informado. Personagens existentes (mais recentes primeiro):");
  for (const row of rows) {
    console.log(`  ${row.id}  —  ${row.display_name}`);
  }
  console.log("\nUso: npx tsx apps/api/scripts/qaGrantSpheres.ts <characterId> [quantidade]");
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

  const quantity = quantityArg ? Number(quantityArg) : 5;
  for (const sphereId of ALL_SPHERE_IDS) {
    grantSphereForTesting(characterId, sphereId, quantity);
  }

  console.log(`Concedidas ${quantity} unidade(s) de cada uma das 5 Esferas para "${character.display_name}" (${characterId}).`);
  console.log("Inventário de Esferas agora:", getSphereInventory(characterId));
}

main();
