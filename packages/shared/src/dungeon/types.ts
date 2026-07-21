// First Dungeon, Final Boss & Complete Game Loop Phase I — tipos
// isolados de propósito, prefixados `Dungeon*`.
//
// "Dungeon deve ser apenas uma ExpeditionDefinition. Boss deve ser
// apenas um EnemyTemplate.": este módulo nunca inventa uma nova regra
// de combate/expedição — só observa Presentation Events já publicados
// pela cadeia existente (Faction Controller -> Expedition Controller ->
// Objective System -> Recovery -> Presentation -> Adventure Loop, todos
// intocados) e deriva o progresso do Chefe Final/conclusão da Dungeon a
// partir deles.

// Requisito 8 — HUD ("BOSS FINAL / nome / barra"): snapshot que a HUD
// State consome. `healthPercent` só é não-nulo enquanto o combate
// contra o Chefe está literalmente em andamento (mesma limitação
// estrutural de HudEncounterInfo — `session.currentEncounter` some
// assim que o encontro se resolve); `encountered`/`defeated` são
// PERSISTENTES (derivados de FinalBossEncounter/FinalBossDefeated já
// publicados, nunca somem sozinhos enquanto a Dungeon está ativa).
export interface DungeonBossProgress {
  enemyTemplateId: string;
  bossName: string;
  encountered: boolean;
  defeated: boolean;
  healthPercent: number | null;
}
