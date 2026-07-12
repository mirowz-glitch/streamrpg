// Sprint New Player Journey — persistência exclusivamente local
// (localStorage), nenhuma tabela/coluna nova, nenhuma regra de gameplay.
// Mesmo espírito do "watermark" já usado em InventoryPage (Sprint
// Equipment Experience): flags simples de "já visto", nada complexo.
//
// Sprint Reactive Layer Foundation — storage e evento agora vêm de
// lib/playerMemory.ts (primitiva genérica); este arquivo só decide o
// prefixo e o conjunto de flags válidas (OnboardingFlag). Mesmas chaves
// de sempre (`streamrpg_onboarding_<flag>`), mesmo evento — nenhum
// comportamento muda pra quem já usa isFlagSet/setFlag/ONBOARDING_FLAG_EVENT.
import { hasRemembered, remember, PLAYER_MEMORY_EVENT } from "./playerMemory";

const PREFIX = "streamrpg_onboarding_";

export type OnboardingFlag =
  | "welcome_seen"
  | "city_seen"
  | "world_seen"
  | "ranking_seen"
  | "profile_seen"
  | "tutorial_completed"
  | "first_item_announced"
  | "first_level_announced"
  | "first_boss_seen"
  | "first_title_announced"
  // Sprint First 15 Minutes Experience — mesma flag/GuideBubble de
  // sempre, uma por marco novo dos primeiros minutos (biblioteca,
  // bestiário, taverna, expedição, objetos da praça, galeria do Mundo).
  | "library_seen"
  | "bestiary_seen"
  | "tavern_seen"
  | "expedition_seen"
  | "hidden_object_seen"
  | "world_gallery_seen";

export function isFlagSet(flag: OnboardingFlag): boolean {
  return hasRemembered(PREFIX + flag);
}

// Evento próprio (não é o "storage" nativo do browser, que só dispara em
// OUTRAS abas) — avisa componentes desta mesma aba (ex: EldrinGuide) que
// uma flag mudou, para reagir sem precisar trocar de página. Mesmo
// evento genérico de lib/playerMemory.ts, só reexportado com o nome
// antigo (nenhum listener existente precisa mudar).
export const ONBOARDING_FLAG_EVENT = PLAYER_MEMORY_EVENT;

export function setFlag(flag: OnboardingFlag): void {
  remember(PREFIX + flag);
}

// "Primeiros Passos" — 4 dos 5 itens são visitas de página (flags acima);
// o 5º ("assistir alguns minutos da live") é derivado de
// characters.total_minutes, que já existe, nunca uma flag própria.
export const FIRST_STEPS_PAGE_FLAGS: OnboardingFlag[] = ["profile_seen", "city_seen", "ranking_seen", "world_seen"];
export const FIRST_STEPS_TOTAL = FIRST_STEPS_PAGE_FLAGS.length + 1;

export function countFirstStepsDone(totalMinutesWatched: number): number {
  const pageDone = FIRST_STEPS_PAGE_FLAGS.filter(isFlagSet).length;
  return pageDone + (totalMinutesWatched > 0 ? 1 : 0);
}

// Eldrin fala em sequência, nunca repete — um contador simples de "até
// qual linha ele já disse", nunca um índice de conversa complexo.
const ELDRIN_STEP_KEY = `${PREFIX}eldrin_step`;

export function getEldrinStep(): number {
  return Number(localStorage.getItem(ELDRIN_STEP_KEY) ?? 0);
}

export function advanceEldrinStep(): void {
  localStorage.setItem(ELDRIN_STEP_KEY, String(getEldrinStep() + 1));
}
