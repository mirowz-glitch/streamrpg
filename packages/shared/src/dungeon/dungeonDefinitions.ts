// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito 1/2:
// "Dungeon deve ser apenas uma ExpeditionDefinition. Boss deve ser
// apenas um EnemyTemplate." A ÚNICA peça de dado genuinamente NOVA que
// este módulo precisa (além da ExpeditionDefinition em
// expeditions/expeditionDefinitions.ts e do EnemyTemplate já existente
// em enemy/templates.ts, nenhum dos dois alterado em sua forma) é: QUAL
// Expedição tem um Chefe Final designado, e QUAL EnemyTemplate é esse
// Chefe. Nenhum campo novo foi adicionado a ExpeditionDefinition
// (expeditions/types.ts, "Expedition Controller" protegido nesta
// Sprint) — este mapeamento fica inteiramente aqui, externo, só lido.
//
// "Guardião Esquecido" (forgotten-guardian, enemy/templates.ts) é
// reaproveitado EXATAMENTE como já existia desde a Sprint de Elites —
// já é o Mini-Boss de "ruinas-esquecidas" (worldencounter/
// encounterTables.ts), com sua própria Loot Table (lootgen/
// lootTables.ts). Nenhum EnemyTemplate novo, nenhuma IA especial,
// nenhuma fase — ele só passa a ser TAMBÉM reconhecido como "Chefe
// Final" quando derrotado dentro da Expedição "queda-da-fortaleza-
// sombria" especificamente (ver dungeonProgress.ts/dungeonController.ts).
// Vertical Slice — Multi-Dungeon Content & Data Expansion Phase I —
// Fase 1/2: 3 novas entradas, uma por Dungeon nova (expeditions/
// expeditionDefinitions.ts + enemy/templates.ts) — a ÚNICA coisa que
// "cria" uma nova Dungeon aos olhos deste módulo é adicionar um par
// (expeditionId, bossTemplateId) aqui; getFinalBossTemplateId()/
// isDungeonExpedition() e todo o resto de dungeonController.ts
// continuam 100% genéricos, sem nenhuma mudança de código.
export const DUNGEON_FINAL_BOSS_BY_EXPEDITION: Record<string, string> = {
  "queda-da-fortaleza-sombria": "forgotten-guardian",
  "fortaleza-congelada": "frost-king",
  "catedral-esquecida": "corrupted-bishop",
  "covil-do-dragao": "ancient-dragon",
};

export function getFinalBossTemplateId(expeditionId: string): string | undefined {
  return DUNGEON_FINAL_BOSS_BY_EXPEDITION[expeditionId];
}

export function isDungeonExpedition(expeditionId: string): boolean {
  return expeditionId in DUNGEON_FINAL_BOSS_BY_EXPEDITION;
}
