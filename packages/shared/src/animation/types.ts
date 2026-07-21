// Combat Feel & Animation System Phase I — tipos isolados de
// propósito. "Nenhum componente poderá consultar diretamente o Combat
// Engine" — este módulo também não consulta: ele só lê
// PresentationEvent/FloatingNumberEvent, já produzidos pela
// Presentation Layer (Sprint anterior), intocada nesta Sprint.

// Requisito 1 — o formato de UMA animação na fila. `payload` é
// discriminado por `type` (união abaixo), nunca um objeto solto — o
// mesmo padrão já usado em PresentationEvent (Presentation Layer).
export interface CombatAnimationBase {
  id: string;
  timestamp: number;
  duration: number;
  priority: number;
}

export type AnimationType =
  // Requisito 3 — Enemy Hit: Damage/Critical/Miss. "Critical"/"Miss"
  // ficam preparados (nunca produzidos por nenhum handler nesta fase —
  // FloatingNumberEvent nunca emite esses kinds ainda, ver
  // presentation/types.ts) igual "Boss Hit"/"Elite Hit" (nenhum sinal
  // de "é boss/elite" chega até os eventos ainda).
  | "enemy-hit"
  | "enemy-critical-hit"
  | "enemy-miss"
  | "enemy-boss-hit"
  | "enemy-elite-hit"
  // Requisito 4 — Character Hit: só Damage recebido, sem alterar HP
  // (isso já foi feito pelo Adventure Loop antes deste módulo existir).
  | "character-hit"
  // Requisito 5 — Enemy Death: fade/escala/desaparecimento real;
  // explosão/ragdoll/dissolução preparados (nenhum dado distingue TIPO
  // de morte ainda).
  | "enemy-death"
  | "enemy-death-explosion"
  | "enemy-death-ragdoll"
  | "enemy-death-dissolve"
  // Requisito 6 — Loot Drop: uma variante por raridade real do Item
  // Generator (ItemGenRarityId) — "brilho pela raridade" é literalmente
  // isso, sem inventar uma raridade nova.
  | "loot-drop-common"
  | "loot-drop-magic"
  | "loot-drop-rare"
  | "loot-drop-unique"
  // Requisito 7 — Equipment: upgrade/downgrade/neutro, decidido só pelo
  // sinal de `previousPowerScore`/`powerScore` do próprio evento.
  | "equipment-pulse-upgrade"
  | "equipment-pulse-downgrade"
  | "equipment-pulse-neutral"
  // Requisito 8 — Floating Numbers: um tipo por FloatingNumberKind já
  // existente (Presentation Layer); "critical"/"miss" preparados pelo
  // mesmo motivo de sempre.
  | "floating-number-damage"
  | "floating-number-critical"
  | "floating-number-miss"
  | "floating-number-heal"
  | "floating-number-lifeLeech"
  // CharacterDied — sem requisito numerado próprio, mas listado no
  // preset de exemplo ("Character Death").
  | "character-death"
  // Progression & Player Retention Phase I — requisito 2: única
  // animação nova desta Sprint (mesmo padrão de extensão de sempre:
  // "adicionar uma animação exige só um novo preset + um novo
  // handler" — nenhuma lógica existente muda).
  | "level-up"
  // Objectives, Missions & Player Goals Phase I — requisito 8: banner
  // de conclusão de objetivo, mesmo padrão de extensão de "level-up".
  | "objective-completed"
  // Biomes, Regions & World Progression Phase I — requisito 7: banner
  // de desbloqueio de região, mesmo padrão de extensão de sempre.
  | "region-unlocked"
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: "Quando
  // um Elite aparecer: banner, aura, animação, feed." `enemy-elite-hit`/
  // `enemy-boss-hit` (acima) já existiam preparados desde a Sprint
  // original de Combat Feel & Animation — hoje é o dia em que passam a
  // ser alcançáveis de verdade (ver handlers.ts: FloatingNumberEvent
  // não carrega variante, então o HIT em si continua "enemy-hit"
  // normal; quem vira `enemy-elite-hit`/`enemy-boss-hit` é a Enemy
  // Stage, lendo `HudEncounterInfo.variant`, ver components/hud/
  // EnemyStage.tsx). As 4 novas abaixo são os BANNERS de
  // surgimento/derrota (mesmo padrão de "objective-completed"/
  // "region-unlocked"), nunca a reação de golpe.
  | "elite-encounter"
  | "miniboss-encounter"
  | "elite-defeated"
  | "miniboss-defeated"
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 7: "banner, aura, animação, feed... mesmo padrão de Elite,
  // Objective, Region." Um único tipo de banner cobre as 5 categorias
  // (treasure/merchant/shrine/ambush/discovery) — o payload (ver
  // handlers.ts) carrega `category`/`name`, e o componente de UI
  // escolhe o ícone certo a partir da categoria (mesmo princípio de
  // "loot-drop-*" escolhendo variante pela raridade real, nunca um tipo
  // de animação por evento individual).
  | "world-event-discovered"
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 8: "quando atingir um checkpoint: banner, feed,
  // animação. Mesmo padrão existente" — mesmo princípio de
  // "region-unlocked"/"objective-completed". "expedition-completed"/
  // "expedition-failed" completam o ciclo (início já é só uma linha no
  // feed, sem banner próprio — mesmo tratamento de "RegionEntered").
  | "expedition-checkpoint"
  | "expedition-completed"
  | "expedition-failed"
  // Factions, Reputation & World Consequences Phase I — requisito 6:
  // banner de subida de rank, mesmo padrão de "level-up"/
  // "region-unlocked" (celebração rara, nunca reação de combate).
  // "ReputationChanged" (a variação comum, frequente) não tem animação
  // própria — só registrado no feed, mesmo tratamento de
  // "ExpeditionStarted"/"RegionEntered".
  | "faction-rank-up"
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 9: "banner; animação; feed; resumo especial da Expedição" ao
  // derrotar o Chefe. Mesmo princípio de "elite-encounter"/
  // "miniboss-encounter"/"miniboss-defeated" (banners de
  // surgimento/derrota), mas no topo da hierarquia de prioridade — o
  // evento mais raro/mais celebrado de toda a Sprint.
  // "dungeon-completed" é DISTINTO de "expedition-completed" (que
  // continua disparando normalmente na mesma tick, requisito 7): é o
  // "resumo especial" — banner PRÓPRIO, mais dramático, só quando a
  // Expedição concluída tinha um Chefe Final designado.
  | "final-boss-encounter"
  | "final-boss-defeated"
  | "dungeon-completed";

export interface CombatAnimation extends CombatAnimationBase {
  type: AnimationType;
  payload: Record<string, unknown>;
}

// Requisito 10 — Animation Presets: "Hit (duration/offset/scale/shake/
// opacity)", "Loot Rare", "Loot Unique", "Character Death" — campos
// puramente visuais, nunca lidos por nenhuma lógica de jogo. Todos
// opcionais pra um preset poder usar só o que precisa (ex.: um
// floating number não precisa de `shake`).
export interface AnimationPreset {
  type: AnimationType;
  duration: number;
  priority: number;
  offset?: number;
  scale?: number;
  shake?: number;
  opacity?: number;
}
