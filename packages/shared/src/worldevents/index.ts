// World Events, Dynamic Encounters & Exploration Phase I — definições
// de dados puras (categoria/recompensa/bioma/peso). Quem decide QUANDO
// um evento acontece é o World Encounter (worldencounter/generator.ts,
// "eventos do mundo são apenas mais um tipo de encontro") — este módulo
// nunca é chamado diretamente por Adventure Loop/Combat Engine/HUD.
export * from "./types.js";
export * from "./worldEventDefinitions.js";
export * from "./worldEventTables.js";
export * from "./generator.js";
