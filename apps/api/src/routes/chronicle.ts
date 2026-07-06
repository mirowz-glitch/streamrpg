import type { ChronicleEntryResponse, ChronicleResponse } from "@streamrpg/shared";
import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { getCharacterIdByProfileId } from "./character.js";
import { SQLiteChronicleRepository } from "../infrastructure/SQLiteChronicleRepository.js";

// Sprint Kingdom Chronicles (MVP) — mesmo padrão de leitura de
// character.ts/items.ts (autenticado, um personagem só lê o próprio
// Livro). Só leitura: quem grava é o ChronicleSystem, reagindo a
// eventos já existentes.
const chronicleRepository = new SQLiteChronicleRepository();

export const chronicleRoutes = [
  route("GET", "/api/chronicle", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }

      const entries = await chronicleRepository.listByCharacter(characterId);
      const response: ChronicleResponse = {
        entries: entries.map(
          (entry): ChronicleEntryResponse => ({
            id: entry.id,
            icon: entry.icon,
            title: entry.title,
            text: entry.text,
            created_at: new Date(entry.createdAt * 1000).toISOString(),
          }),
        ),
      };
      json(res, 200, response);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
