import type { CharacterResponse, IdentityProfile } from "@streamrpg/shared";
import { hasRemembered } from "./playerMemory";
import { getRecentEvents } from "./personalTimeline";
import { REGIONS } from "./regions";
import { FOUNDER_TITLE_SLUGS } from "./identity";
import type { CharacterKingdomRole } from "../hooks/useKingdomRole";
import { buildPlayerFacts } from "./playerFacts";
import { getCharacterStage, type CharacterStage } from "./characterPresence";

// Sprint Player Motivation Phase I ("Natural Goals") — camada
// centralizada e sem estado próprio: lê fatos que já existem
// (character/identity/playerMemory/personalTimeline/worldState) e
// sugere 1-2 objetivos naturais, nunca uma checklist, nunca progresso
// falso, nunca recompensa. Mesmo espírito de playerFacts.ts/
// recognition.ts — uma única fonte de verdade, quem chama nunca decide
// objetivo sozinho.
export interface PlayerGoalsContext {
  hasWeaponEquipped: boolean;
  equippedSlotCount: number;
  hasVisitedBestiary: boolean;
  bossesDefeated: number;
  booksRead: number;
  regionsDiscovered: number;
  totalRegions: number;
  hasFounderTitle: boolean;
  isExperienced: boolean;
  hasActiveWorldEvent: boolean;
  // Sprint Character Evolution Presence Phase I — mesmo estágio central
  // (lib/characterPresence.ts) usado por CharacterPage/Guilda/Cidade,
  // reaproveitado aqui só pra destravar objetivos mais ambiciosos pra
  // quem já está avançado. Nenhum dado novo, nenhuma regra de gameplay.
  stage: CharacterStage;
}

const TOTAL_EQUIPMENT_SLOTS = 6;
const EXPERIENCED_LEVEL_THRESHOLD = 15;
const EXPERIENCED_BOSS_THRESHOLD = 3;

export function buildPlayerGoalsContext(
  character: CharacterResponse,
  identity: IdentityProfile,
  hasActiveWorldEvent: boolean,
  kingdomRoles: CharacterKingdomRole[] = [],
): PlayerGoalsContext {
  const booksRead = getRecentEvents(20).filter((e) => e.kind === "book_read").length;
  return {
    hasWeaponEquipped: character.equipped.some((item) => item.slot === "weapon"),
    equippedSlotCount: character.equipped.length,
    hasVisitedBestiary: hasRemembered("first_bestiary_entry"),
    bossesDefeated: identity.bosses_defeated,
    booksRead,
    regionsDiscovered: identity.regions_discovered,
    totalRegions: REGIONS.length,
    hasFounderTitle: identity.titles.some((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)),
    isExperienced: character.level >= EXPERIENCED_LEVEL_THRESHOLD || identity.bosses_defeated >= EXPERIENCED_BOSS_THRESHOLD,
    hasActiveWorldEvent,
    stage: getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles)),
  };
}

interface GoalRule {
  when: (ctx: PlayerGoalsContext) => boolean;
  text: string;
}

// Ordem = prioridade: a primeira regra que bater "consome" o assunto —
// ex: "sem arma" e "poucos itens equipados" nunca aparecem juntas, a
// segunda só é avaliada quando a arma já existe.
const GOAL_RULES: GoalRule[] = [
  {
    when: (ctx) => !ctx.hasWeaponEquipped,
    text: "Sua arma ainda está vazia. Equipar uma pode ser um bom próximo passo.",
  },
  {
    when: (ctx) => ctx.hasWeaponEquipped && ctx.equippedSlotCount <= 2,
    text: "Você pode ficar mais forte equipando o que já carrega.",
  },
  {
    when: (ctx) => !ctx.hasVisitedBestiary,
    text: "Conheça as criaturas do Reino — o Bestiário guarda mais do que parece.",
  },
  {
    when: (ctx) => ctx.bossesDefeated === 0,
    text: "O Reino ainda não ouviu falar do seu nome.",
  },
  {
    when: (ctx) => ctx.booksRead < 2,
    text: "A Biblioteca guarda conhecimentos que podem ajudar.",
  },
  {
    when: (ctx) => ctx.regionsDiscovered <= 2,
    text: "Ainda existem muitas terras desconhecidas.",
  },
  // Jogadores experientes — mesmos temas (regiões, título), fraseados
  // pra quem já avançou, nunca repetindo as sugestões de iniciante.
  {
    when: (ctx) => ctx.isExperienced && ctx.regionsDiscovered >= 5 && ctx.regionsDiscovered < ctx.totalRegions,
    text: "Poucas terras ainda escapam de você. Vale terminar o mapa.",
  },
  {
    when: (ctx) => ctx.isExperienced && !ctx.hasFounderTitle,
    text: "Poucos chegam tão longe. Talvez seja hora de mirar num título que ainda não é seu.",
  },
  // Sprint Character Evolution Presence Phase I — objetivos mais
  // ambiciosos pra estágios avançados, mesmos temas (regiões, título,
  // reputação) mas fraseados pra quem o Reino já reconhece.
  {
    when: (ctx) => ctx.stage === "lenda",
    text: "Seu nome já é lenda no Reino. O que ainda resta pra alguém no seu nível provar?",
  },
  {
    when: (ctx) => ctx.stage === "heroi",
    text: "Poucos chegam tão longe quanto você. Talvez seja hora de mirar em algo que só heróis tentam.",
  },
  {
    when: (ctx) => ctx.equippedSlotCount < TOTAL_EQUIPMENT_SLOTS,
    text: "Ainda há espaço no seu equipamento para mais alguma coisa.",
  },
  {
    when: (ctx) => ctx.hasActiveWorldEvent,
    text: "Talvez hoje seja um bom dia para visitar o Reino.",
  },
];

// Pura, sem estado, sem persistência — cada chamada reavalia do zero.
export function getPlayerGoals(ctx: PlayerGoalsContext, limit = 2): string[] {
  const matched: string[] = [];
  for (const rule of GOAL_RULES) {
    if (matched.length >= limit) break;
    if (rule.when(ctx)) matched.push(rule.text);
  }
  return matched;
}
