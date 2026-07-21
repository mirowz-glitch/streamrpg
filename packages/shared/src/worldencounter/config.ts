// World Encounter System Phase I — requisito 3 ("tudo parametrizado")
// e mesmo princípio de centralização de constantes das Sprints
// anteriores (COMBAT_CONFIG/ENEMY_DEFAULT_CRITICAL_MULTIPLIER):
// nenhum número solto em generator.ts.
export const WORLD_ENCOUNTER_CONFIG = {
  // Variação aleatória em torno do nível do jogador ao rolar o nível
  // de um grupo do encontro — mesmo princípio do `itemLevelVariance`
  // do Loot Generator, só que um valor único do sistema (a Encounter
  // Table não declara um por região nesta fase).
  levelVariance: 2,
} as const;
