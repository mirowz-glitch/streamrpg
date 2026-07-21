// Character Build Phase I — fundação da progressão do personagem:
// Level -> Character Build -> Base Attributes -> Equipment Stats ->
// Final Stats. Sem Skill Tree/Passive Tree/Talentos/UI/Craft/Mercado/
// classes novas/balanceamento — só a fundação.
//
// Uso básico:
//
//   import { CharacterBuild, calculateFinalStats } from "@streamrpg/shared";
//   const build = new CharacterBuild("char-42", "warrior", 5000);
//   build.addExperience(1000);
//   const finalStats = calculateFinalStats(build, equipment);
//
// Como adicionar uma nova classe sem alterar nenhuma lógica: inserir
// um novo registro em classes.ts (CHARACTER_CLASSES) com
// `startingAttributes`/`growthPerLevel`. baseAttributes.ts/
// derivedAttributes.ts/characterBuild.ts/finalStats.ts nunca
// precisam mudar — todos leem a classe pelo `classId`, nunca
// conhecem o nome de uma classe específica.
export * from "./types.js";
export * from "./classes.js";
export * from "./baseAttributes.js";
export * from "./derivedAttributes.js";
export * from "./characterBuild.js";
export * from "./finalStats.js";
