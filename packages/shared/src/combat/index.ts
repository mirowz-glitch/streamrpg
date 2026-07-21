// Combat Engine Phase I — Attacker -> Final Stats -> Combat Engine ->
// Damage Calculation -> Target -> Combat Result. Pipeline de combate
// puro e determinístico: Hit Roll -> Critical Roll -> Damage Roll ->
// Armor Reduction -> Life Leech -> Final Damage -> Combat Result.
//
// Uso básico:
//
//   import { resolveCombat } from "@streamrpg/shared";
//   const result = resolveCombat({
//     attacker: { finalStats, criticalMultiplier: 1.5, currentLife: 500 },
//     target: { finalStats: targetStats, criticalMultiplier: 1.5, currentLife: 300 },
//     seed: 123456,
//     timestamp: Date.now(),
//     attackType: "physical",
//   });
//
// Como adicionar um novo tipo de dano (Fire/Cold/Lightning/Chaos já
// vêm preparados; um 6º tipo futuro) sem alterar a lógica principal:
// inserir um novo registro em damageTypes.ts (COMBAT_DAMAGE_TYPES) com
// `finalStatKey`/`resistanceKey`/`mitigatedByArmor`. pipeline.ts/
// combatEngine.ts nunca precisam mudar — toda etapa lê a definição do
// tipo de dano pelo `attackType` do Combat Context, nunca conhece o
// nome de um tipo específico.
export * from "./types.js";
export * from "./damageTypes.js";
export * from "./config.js";
export * from "./pipeline.js";
export * from "./combatEngine.js";
