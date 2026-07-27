import { DEMO_INVENTORY_CAPACITY } from "../hooks/useAdventureSession";

// Backpack Experience Phase I — Fase 5 ("Sinais de Mochila"): "começar
// a preparar a futura limitação de capacidade SEM implementá-la...
// apenas informativos". Nenhum gate novo — isto nunca bloqueia
// pickup/equip, só classifica um número que já existe
// (`items.length`, a mesma contagem que a lista já mostra) contra a
// MESMA referência de capacidade que o motor já usa
// (DEMO_INVENTORY_CAPACITY, packages/shared/Inventory via
// useAdventureSession.ts) — puramente presentational, igual ao
// "ladder" de status do Living Character.
export type BackpackFullness = "leve" | "normal" | "cheia";

const LIGHT_THRESHOLD = Math.floor(DEMO_INVENTORY_CAPACITY / 3);
const FULL_THRESHOLD = Math.floor((DEMO_INVENTORY_CAPACITY * 5) / 6);

export function classifyBackpackFullness(itemCount: number): BackpackFullness {
  if (itemCount <= LIGHT_THRESHOLD) return "leve";
  if (itemCount >= FULL_THRESHOLD) return "cheia";
  return "normal";
}

// Descobertas recentes "demais" pra caberem sem esforço na percepção
// do jogador — limiar pequeno de propósito (o mesmo princípio de
// "pequena seção" já usado no diário: não é sobre um número exato, é
// sobre "está acontecendo bastante coisa agora").
const MANY_RECENT_FINDS_THRESHOLD = 3;

export interface BackpackSignals {
  fullness: BackpackFullness;
  manyRecentFinds: boolean;
  suggestCityVisit: boolean;
}

export function deriveBackpackSignals(itemCount: number, recentFindsCount: number): BackpackSignals {
  const fullness = classifyBackpackFullness(itemCount);
  const manyRecentFinds = recentFindsCount >= MANY_RECENT_FINDS_THRESHOLD;
  return {
    fullness,
    manyRecentFinds,
    // Fase 5 — "vale a pena visitar a cidade": só um convite (nunca um
    // gate), disparado pela mochila estando cheia OU por uma leva
    // grande de descobertas recentes — mesmo gatilho já recomendado em
    // docs/design/backpack-experience-plan.md Seção 4/5.
    suggestCityVisit: fullness === "cheia" || manyRecentFinds,
  };
}
