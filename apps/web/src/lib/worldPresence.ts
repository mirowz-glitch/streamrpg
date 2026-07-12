import type { WorldEventCategory } from "@streamrpg/shared";

// Sprint Dynamic World Presence Phase I — camada única e central que
// interpreta o estado real do Reino (worldState, já buscado por
// CityPage) e devolve, no máximo, UMA linha de ambientação por prédio.
// Sem estado, sem persistência, sem backend novo — os componentes só
// chamam getWorldPresenceLine() e renderizam o que ela devolver (nunca
// decidem sozinhos). A MESMA categoria de evento (worldState.
// current_event.category, já existente — Sprint Kingdom Events MVP)
// alimenta vários prédios ao mesmo tempo, de propósito: é o que cria a
// sensação de corrente única (ex: evento "militar" → Praça comenta mais
// guardas, Taverna comenta mercenários, Ferreiro comenta excesso de
// trabalho, Guilda comenta treino, Portão Norte comenta vigilância — 5
// prédios, 1 único dado real por trás de todos).
export type PresenceBuildingKey =
  | "praca"
  | "taverna"
  | "biblioteca"
  | "museu"
  | "bestiario"
  | "guilda"
  | "ferreiro"
  | "portao-norte";

export interface WorldPresenceContext {
  eventCategory: WorldEventCategory;
  playersOnline: number;
}

// Ilustrativo, não calibrado — mesma convenção de todo número não
// validado por playtest neste projeto (Tiers de Boss, pesos de
// raridade). Só decide quando a Praça comenta população alta.
const HIGH_POPULATION_THRESHOLD = 5;

// As 9 categorias reais (packages/shared/src/types.ts) mapeadas pros
// prédios onde o tema realmente se encaixa — nunca todas, só onde faz
// sentido (ex: "clima" não força nada na Guilda). Textos escritos pra
// combinar com os eventos reais já catalogados em
// apps/api/src/systems/EventOfTheDaySystem.ts (lidos antes de escrever
// qualquer linha, pra nunca contradizer o evento real).
const WORLD_PRESENCE_LINES: Record<WorldEventCategory, Partial<Record<PresenceBuildingKey, string>>> = {
  clima: {
    praca: "O tempo muda o jeito como a praça se move hoje.",
    ferreiro: "Borin resmunga mais que o normal com esse tempo.",
    biblioteca: "Poucos visitantes apareceram hoje — o tempo não ajudou.",
  },
  celebracoes: {
    praca: "A praça parece mais animada hoje.",
    taverna: "O salão está especialmente barulhento hoje.",
  },
  reino: {
    praca: "Algo no ar sugere que o Reino guarda um assunto reservado hoje.",
    guilda: "Os aventureiros parecem inquietos hoje.",
  },
  militar: {
    praca: "Há mais guardas circulando pela praça hoje.",
    taverna: "Mais mercenários que o normal ocupam as mesas hoje.",
    ferreiro: "A forja trabalha sem descanso hoje.",
    guilda: "Os aventureiros treinam com mais afinco hoje.",
    "portao-norte": "Há mais guardas observando a estrada hoje.",
  },
  natureza: {
    praca: "Corvos cruzam o céu da Capital com mais frequência hoje.",
    bestiario: "Alguns aventureiros comentam uma criatura vista recentemente.",
  },
  cidade: {
    praca: "A praça parece mais movimentada hoje.",
    museu: "Uma vitrine recebeu mais atenção dos visitantes hoje.",
  },
  cultura: {
    biblioteca: "Miriam separou alguns livros raros pra quem quiser ver.",
    museu: "Alaric organizou uma pequena exposição temporária.",
  },
  taverna: {
    taverna: "O salão está lotado hoje.",
    praca: "Risadas da Taverna chegam até a praça hoje.",
  },
  misterios: {
    praca: "Um silêncio estranho toma conta da praça hoje.",
    bestiario: "Yannick evita comentar o que ouviu ontem à noite.",
    museu: "Alaric passou a manhã catalogando algo que prefere não explicar.",
  },
};

// Pura: mesma entrada, mesma saída, sempre. `praca` tem um sinal extra
// (população real, worldState.panel.players_online) que tem prioridade
// sobre o evento — os dois nunca aparecem juntos, pra manter só uma
// linha por prédio.
export function getWorldPresenceLine(building: PresenceBuildingKey, ctx: WorldPresenceContext): string | null {
  if (building === "praca" && ctx.playersOnline >= HIGH_POPULATION_THRESHOLD) {
    return "Hoje a praça parece mais movimentada.";
  }
  return WORLD_PRESENCE_LINES[ctx.eventCategory]?.[building] ?? null;
}
