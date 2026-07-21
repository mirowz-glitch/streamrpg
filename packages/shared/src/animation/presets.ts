import type { AnimationPreset, AnimationType } from "./types.js";

// Requisito 10 — "Nunca hardcode dentro dos componentes": todo valor
// visual (duration/offset/scale/shake/opacity) vive aqui, numa tabela
// só. Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos de mod usada em todo o projeto).
//
// Requisito 12 — "adicionar uma nova animação deve exigir apenas: novo
// preset, novo handler": inserir um novo registro aqui + um handler em
// handlers.ts. O Animation Controller (controller.ts) nunca lê este
// arquivo — ele só processa CombatAnimation genéricas por
// timestamp/duration, então nunca precisa mudar.
export const ANIMATION_PRESETS: Record<AnimationType, AnimationPreset> = {
  "enemy-hit": { type: "enemy-hit", duration: 300, priority: 10, shake: 4, opacity: 0.7 },
  "enemy-critical-hit": { type: "enemy-critical-hit", duration: 420, priority: 15, shake: 9, opacity: 0.6, scale: 1.1 },
  "enemy-miss": { type: "enemy-miss", duration: 250, priority: 5, opacity: 0.9 },
  "enemy-boss-hit": { type: "enemy-boss-hit", duration: 500, priority: 18, shake: 14, opacity: 0.5, scale: 1.15 },
  "enemy-elite-hit": { type: "enemy-elite-hit", duration: 400, priority: 16, shake: 10, opacity: 0.6, scale: 1.1 },

  "character-hit": { type: "character-hit", duration: 350, priority: 20, offset: 6, opacity: 0.6 },

  "enemy-death": { type: "enemy-death", duration: 600, priority: 12, scale: 0, opacity: 0 },
  "enemy-death-explosion": { type: "enemy-death-explosion", duration: 700, priority: 14, scale: 1.4, opacity: 0 },
  "enemy-death-ragdoll": { type: "enemy-death-ragdoll", duration: 800, priority: 14, offset: 20, opacity: 0 },
  "enemy-death-dissolve": { type: "enemy-death-dissolve", duration: 900, priority: 14, opacity: 0 },

  "loot-drop-common": { type: "loot-drop-common", duration: 800, priority: 8, offset: -12 },
  "loot-drop-magic": { type: "loot-drop-magic", duration: 850, priority: 8, offset: -14, scale: 1.05 },
  // Requisito 10, exemplo literal "Loot Rare".
  "loot-drop-rare": { type: "loot-drop-rare", duration: 900, priority: 9, offset: -16, scale: 1.1 },
  // Requisito 10, exemplo literal "Loot Unique".
  "loot-drop-unique": { type: "loot-drop-unique", duration: 1100, priority: 11, offset: -20, scale: 1.2 },

  "equipment-pulse-upgrade": { type: "equipment-pulse-upgrade", duration: 500, priority: 9, scale: 1.08 },
  "equipment-pulse-downgrade": { type: "equipment-pulse-downgrade", duration: 500, priority: 9, scale: 0.95 },
  "equipment-pulse-neutral": { type: "equipment-pulse-neutral", duration: 400, priority: 7, scale: 1.02 },

  "floating-number-damage": { type: "floating-number-damage", duration: 900, priority: 6, offset: -24, opacity: 0 },
  "floating-number-critical": { type: "floating-number-critical", duration: 1000, priority: 13, offset: -30, opacity: 0, scale: 1.3 },
  "floating-number-miss": { type: "floating-number-miss", duration: 700, priority: 4, offset: -16, opacity: 0 },
  "floating-number-heal": { type: "floating-number-heal", duration: 900, priority: 6, offset: -24, opacity: 0 },
  "floating-number-lifeLeech": { type: "floating-number-lifeLeech", duration: 900, priority: 6, offset: -24, opacity: 0 },

  // Requisito 10, exemplo literal "Character Death".
  "character-death": { type: "character-death", duration: 1200, priority: 25, scale: 0.9, opacity: 0.2 },

  // Progression & Player Retention Phase I — requisito 2: duração mais
  // longa de propósito (celebração, não reação de combate) — prioridade
  // alta o bastante pra não ser descartada por um hit simultâneo, mas
  // abaixo de Character Death (o único evento que deve sempre vencer).
  "level-up": { type: "level-up", duration: 1600, priority: 22, scale: 1.15, opacity: 1 },

  // Objectives, Missions & Player Goals Phase I — requisito 8: mesma
  // duração/prioridade de "level-up" (celebração equivalente), um
  // pouco abaixo pra nunca competir com um Level Up simultâneo.
  "objective-completed": { type: "objective-completed", duration: 1500, priority: 21, scale: 1.12, opacity: 1 },

  // Biomes, Regions & World Progression Phase I — requisito 7: a
  // celebração mais longa/de maior prioridade de todas (evento raro,
  // acontece só uma vez por bioma) — ainda abaixo de Character Death.
  "region-unlocked": { type: "region-unlocked", duration: 1800, priority: 23, scale: 1.2, opacity: 1 },

  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: banners de
  // surgimento (Elite < Mini-Boss em duração/prioridade, mesma lógica
  // de "objective-completed" < "region-unlocked" — Mini-Boss é o evento
  // mais raro/mais grave dos dois) e de derrota (levemente abaixo do
  // banner de surgimento correspondente).
  "elite-encounter": { type: "elite-encounter", duration: 1400, priority: 19, scale: 1.1, opacity: 1 },
  "miniboss-encounter": { type: "miniboss-encounter", duration: 1700, priority: 22, scale: 1.18, opacity: 1 },
  "elite-defeated": { type: "elite-defeated", duration: 1300, priority: 17, scale: 1.1, opacity: 1 },
  "miniboss-defeated": { type: "miniboss-defeated", duration: 1600, priority: 21, scale: 1.15, opacity: 1 },

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 7: duração/prioridade mais discretas que Elite/Mini-Boss (evento
  // frequente e de baixo risco, não uma celebração rara) — ainda acima
  // de "loot-drop-common" (a categoria Ambush já dispara os presets de
  // combate normais por cima, então este banner só precisa se destacar
  // sobre eles brevemente).
  "world-event-discovered": { type: "world-event-discovered", duration: 1200, priority: 15, scale: 1.05, opacity: 1 },

  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 8: checkpoint é um marco frequente dentro de UMA
  // expedição (prioridade moderada); conclusão é o evento mais raro/
  // celebrado (prioridade alta, só abaixo de Character Death); falha
  // é discreta (a própria morte já tem seu próprio "character-death").
  "expedition-checkpoint": { type: "expedition-checkpoint", duration: 1500, priority: 20, scale: 1.1, opacity: 1 },
  "expedition-completed": { type: "expedition-completed", duration: 2000, priority: 24, scale: 1.25, opacity: 1 },
  "expedition-failed": { type: "expedition-failed", duration: 1400, priority: 16, scale: 1, opacity: 1 },

  // Factions, Reputation & World Consequences Phase I — requisito 6:
  // duração/prioridade equivalentes a "objective-completed" (celebração
  // de progressão de longo prazo, não um marco de sessão única como
  // Expedição/Região).
  "faction-rank-up": { type: "faction-rank-up", duration: 1600, priority: 21, scale: 1.12, opacity: 1 },

  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 9: o topo da hierarquia de prioridade de toda a Sprint — "surge"
  // (acima de miniboss-encounter) < "derrotado" (acima de
  // expedition-completed) < "Dungeon concluída" (o evento mais raro/
  // dramático possível, sempre vence qualquer banner simultâneo).
  "final-boss-encounter": { type: "final-boss-encounter", duration: 1900, priority: 23, scale: 1.2, opacity: 1 },
  "final-boss-defeated": { type: "final-boss-defeated", duration: 2200, priority: 26, scale: 1.3, opacity: 1 },
  "dungeon-completed": { type: "dungeon-completed", duration: 2600, priority: 27, scale: 1.4, opacity: 1 },
};

export function getAnimationPreset(type: AnimationType): AnimationPreset {
  return ANIMATION_PRESETS[type];
}
