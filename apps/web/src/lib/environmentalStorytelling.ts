import { keySalt, resolveRotatingLine, type RotatingVariant } from "./dailyRotation";
import type { CityPlace } from "./cityPlaces";

// Sprint Environmental Storytelling Phase I — camada central, sem
// estado próprio, sem persistência: "que pequeno detalhe deste lugar
// vale a pena ser observado hoje?". Diferente de todas as camadas
// irmãs (World Presence/Hero Journey/Living Conversations/Collection
// Insights): NUNCA fala de gente (nem NPC, nem jogador) — é o AMBIENTE
// em si, uma marca física, sempre em 1 frase muito visual. Por isso não
// é gated por playerMemory (não é uma descoberta pontual do jogador) e
// nem sempre depende de sinal nenhum: a maioria é uma observação FIXA e
// atemporal (uma parede não muda porque um evento do Reino mudou), só
// 1 delas reage a um sinal real (Portão Norte + evento "militar") pra
// demonstrar o reuso pedido sem forçar reatividade onde não faz
// sentido físico.
//
// Auditoria feita ANTES de escrever qualquer linha: li WORLD_PRESENCE_
// LINES (lib/worldPresence.ts) inteiro pra garantir que nenhuma
// observação aqui duplica ou contradiz o que World Presence já diz
// pro mesmo prédio. World Presence fala de ATMOSFERA/MOVIMENTO
// (quantas pessoas, quão barulhento, quão ocupado); Environmental
// Storytelling fala de um DETALHE FÍSICO parado (uma ferramenta, uma
// cadeira, uma marca na parede) — eixos deliberadamente diferentes,
// nunca a mesma frase reformulada. Mesma checagem contra Hero Journey
// (lugares: biblioteca/museu, falam de PROGRESSO PESSOAL do jogador
// naquele lugar) e Living Conversations (falam de PESSOAS, atribuídas
// a um NPC) — nenhuma sobreposição de conteúdo com nenhuma das três.
// Sprint Landmark Identity Phase I — antes uma union de 9 literals
// declarada aqui, idêntica à de worldSimulation.ts's `SimulationPlace`;
// consolidada em lib/cityPlaces.ts (ver comentário lá). Alias mantido
// só por segurança (nenhum importador externo usava este tipo, mas
// custa zero manter o nome de sempre).
export type EnvironmentalPlace = CityPlace;

export interface EnvironmentalContext {
  worldEventCategory?: string;
}

// Sprint Living City (Ambient Life Phase I) — `EnvironmentalVariant`
// era uma interface local idêntica em forma à de worldSimulation.ts;
// ambas (e cityAmbientState.ts) agora usam o mesmo `RotatingVariant`
// genérico (lib/dailyRotation.ts) — dívida eliminada antes de escrever
// qualquer código novo desta Sprint.
type EnvironmentalVariant = RotatingVariant<EnvironmentalContext>;

// Uma observação por lugar (2 no Portão Norte: padrão + reativa ao
// evento "militar", escolhida por ser o único prédio onde uma pista
// física de "passagem recente" reforça o tema real sem repetir o texto
// de World Presence pra "militar" ali ("Há mais guardas observando a
// estrada hoje." — sobre PESSOAS; a linha abaixo é sobre uma PEGADA).
const PLACE_VARIANTS: Record<EnvironmentalPlace, EnvironmentalVariant[]> = {
  // Grounded em "A Vida no Reino" (lib/library.ts) — a Fonte da praça
  // já é citada lá como um dos "pequenos marcos que todo mundo conhece".
  praca: [{ line: "A Fonte da praça ainda molha as pedras ao redor, mesmo sem ninguém por perto." }],
  ferreiro: [{ line: "Algumas ferramentas ainda estão quentes sobre a bancada." }],
  biblioteca: [{ line: "Um livro foi deixado aberto sobre uma mesa." }],
  museu: [{ line: "Uma placa antiga parece ter sido recentemente limpa." }],
  guilda: [{ line: "Marcas profundas de espada cobrem uma parede." }],
  taverna: [{ line: "Uma cadeira permanece vazia, como se alguém tivesse acabado de sair." }],
  "casa-dos-viajantes": [{ line: "Um mapa possui novas anotações feitas à mão." }],
  "portao-norte": [
    {
      when: (ctx) => ctx.worldEventCategory === "militar",
      line: "Pegadas de botas pesadas marcam a lama perto do portão — a patrulha passou há pouco.",
    },
    { line: "Pegadas recentes desaparecem na estrada." },
  ],
  arena: [{ line: "Marcas antigas de combate continuam visíveis." }],
};

// Pura: mesma entrada, mesma saída, sempre (dentro do mesmo dia).
export function getEnvironmentalLine(place: EnvironmentalPlace, ctx: EnvironmentalContext = {}): string | null {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}
