// World Autonomy Phase I (Vision 2.0, Sprint 7) — PlayerPresence é o
// conceito que substitui PresenceProvider.isLive() (Twitch) como fonte
// de "o Jogador está presente agora?" para o resto do jogo.
//
// Uso básico:
//
//   import { derivePlayerPresence } from "@streamrpg/shared";
//   const presence = derivePlayerPresence({ lastSeenAt, now: Date.now(), isAdventuring, isCitizenOfKingdom });
export * from "./types.js";
export * from "./derivePresence.js";
