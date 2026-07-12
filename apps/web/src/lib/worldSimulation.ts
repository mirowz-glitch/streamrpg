import { keySalt, resolveRotatingLine, type RotatingVariant } from "./dailyRotation";
import type { CityPlace } from "./cityPlaces";

// Sprint World Simulation Phase I — camada central, sem estado, sem
// persistência, sem backend: "o que aconteceu recentemente neste
// lugar?". Cada Building exibe NO MÁXIMO uma linha, determinística por
// dia (nunca aleatória a cada render).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, pra eliminar duplicação e dívida técnica:
// - World Presence (lib/worldPresence.ts): já responde "qual é o
//   HUMOR/MOVIMENTO deste lugar hoje?" a partir da categoria do evento
//   atual + população (`getWorldPresenceLine`). É presente contínuo,
//   atemporal ("A forja trabalha sem descanso hoje."). World
//   Simulation é DIFERENTE no tempo verbal: sempre um evento PONTUAL,
//   passado recente ("Mais cedo alguém encomendou..."). Nunca reusa o
//   mesmo texto pra combinação prédio×categoria já coberta ali.
// - Environmental Storytelling (lib/environmentalStorytelling.ts): já
//   responde "que detalhe FÍSICO fixo vale a pena notar?" — uma marca
//   parada (ferramenta quente, cadeira vazia), nunca um evento com
//   sujeito e ação. World Simulation sempre tem um AGENTE fazendo algo
//   ("um grupo", "os guardas", "uma equipe") — eixo gramatical
//   diferente, texto sempre distinto do já escrito lá pro mesmo lugar.
// - Living Conversations (lib/npcDialogue/livingConversations.ts): já
//   responde "sobre o que os NPCs conversam entre si?" — sempre
//   ATRIBUÍDO a um NPC nomeado específico, dentro do NpcIntro. World
//   Simulation nunca é atribuído a ninguém nomeado — é sempre um
//   "alguém"/"um grupo" anônimo, e nunca renderiza dentro do NpcIntro.
// - "Ambient Life" (CityPage.tsx: objectOfTheDay/rumorTopicOfTheDay/
//   ravenAmbient/guardComment): decoração e curiosidades já rotacionadas
//   por dia na Praça — nenhuma delas descreve um evento recente com
//   agente e ação; são objetos/rumores/falas soltas. Textos novos aqui
//   nunca reformulam essas mesmas linhas.
// - Daily Rotation (lib/dailyRotation.ts): `pickOfTheDay`/`pickByTime`
//   já são a técnica correta e genérica pra "muda por dia, nunca por
//   render" — reaproveitada tal como está, nenhuma cópia nova. Achado
//   de dívida técnica real durante esta auditoria: `keySalt` (soma de
//   char codes pra salt estável) estava duplicada de forma idêntica em
//   NpcIntro.tsx, environmentalStorytelling.ts e livingConversations.ts
//   — MOVIDA pra dailyRotation.ts e reexportada dali nos três lugares,
//   antes de qualquer código novo desta Sprint (ver diff desses 3
//   arquivos).
// - Knowledge Links (lib/knowledgeLinks.ts): funções de cruzamento
//   textual entre catálogos (getCreatureMentions/getItemRelated/etc.),
//   nenhuma delas modela "evento recente" — não há sobreposição
//   possível, mas o PADRÃO (camada central, função pura, nunca
//   decidido por componente) é o mesmo já seguido aqui.
//
// Todos os 9 lugares abaixo usam SÓ texto novo, verificado 1 a 1 contra
// os textos reais já escritos em worldPresence.ts/
// environmentalStorytelling.ts/livingConversations.ts pro mesmo
// prédio, pra garantir zero duplicação de conteúdo.
// Sprint Landmark Identity Phase I — antes uma union de 9 literals
// declarada aqui, idêntica à de environmentalStorytelling.ts's
// `EnvironmentalPlace`; consolidada em lib/cityPlaces.ts (ver
// comentário lá). Alias mantido só por segurança.
export type SimulationPlace = CityPlace;

export interface WorldSimulationContext {
  worldEventCategory?: string;
}

// Sprint Living City (Ambient Life Phase I) — mesma consolidação de
// environmentalStorytelling.ts: `SimulationVariant` agora é o mesmo
// `RotatingVariant` genérico (lib/dailyRotation.ts), em vez de uma
// interface local idêntica.
type SimulationVariant = RotatingVariant<WorldSimulationContext>;

// Uma "coisa que acabou de acontecer" por lugar — exemplos quase
// literais do brief. Taverna ganha uma segunda variante, reativa ao
// evento real "celebracoes" (mesmo dado que World Presence já usa,
// texto inteiramente novo: World Presence fala do SALÃO em geral
// ["O salão está especialmente barulhento hoje."], esta fala de UMA
// história específica que acabou de prender todo mundo).
const PLACE_VARIANTS: Record<SimulationPlace, SimulationVariant[]> = {
  praca: [{ line: "Um grupo de viajantes acabou de seguir para o norte." }],
  ferreiro: [{ line: "Mais cedo alguém encomendou uma espada incomum." }],
  biblioteca: [{ line: "Poucos minutos atrás um velho manuscrito foi devolvido." }],
  museu: [{ line: "Uma peça foi movida para outra vitrine." }],
  guilda: [{ line: "Uma equipe saiu para uma expedição." }],
  arena: [{ line: "Um duelo terminou há pouco tempo." }],
  "portao-norte": [{ line: "Os guardas acabaram de liberar uma caravana." }],
  "casa-dos-viajantes": [{ line: "Um explorador deixou novas anotações sobre a estrada." }],
  taverna: [
    {
      when: (ctx) => ctx.worldEventCategory === "celebracoes",
      line: "Alguém acabou de contar uma história tão boa que a Taverna inteira parou pra ouvir.",
    },
    { line: "Alguém acabou de contar uma história curiosa." },
  ],
};

// Pura: mesma entrada, mesma saída, sempre (dentro do mesmo dia).
export function getWorldSimulationLine(place: SimulationPlace, ctx: WorldSimulationContext = {}): string | null {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}
