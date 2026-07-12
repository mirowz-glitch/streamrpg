import type { WorldPresenceContext } from "./worldPresence";
import { keySalt, resolveRotatingLine, type RotatingVariant } from "./dailyRotation";
import type { CityPlace } from "./cityPlaces";

// Sprint Living Kingdom Phase I (Micro Events) — camada central, sem
// estado, sem persistência, sem backend/tabela/fetch/API/hook novo:
// "que pequena coisa cotidiana está acontecendo agora, sem nenhum
// motivo especial?". Nunca cita o jogador, nunca cita um NPC pelo nome,
// nunca cita o World Event — é sempre um figurante anônimo ("uma
// criança", "um aprendiz", "alguém") fazendo algo pequeno e sem
// consequência. Cada Building exibe NO MÁXIMO uma linha, determinística
// por dia (nunca aleatória a cada render), mesmo padrão de Environmental
// Storytelling/World Simulation/City Ambient State.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, mapeando os 16 componentes/camadas do brief:
// - Muda por DIA: World Simulation (evento pontual passado), Environmental
//   Storytelling (variantes fixas quando há mais de uma), City Ambient
//   State (vestígio físico), NPC Daily Activities, Living Conversations,
//   "Hoje está falando sobre..." (NpcIntro), objectOfTheDay/
//   rumorTopicOfTheDay/ravenAmbient/guardComment (CityPage).
// - Muda por EVENTO (current_event.category): World Presence (sempre);
//   1 variante reativa cada em Environmental Storytelling (Portão
//   Norte+militar), World Simulation (Taverna+celebracoes), City
//   Ambient State (Ferreiro+militar).
// - Muda por POPULAÇÃO (players_online): World Presence (praça, limiar
//   5); City Ambient State (praça, mesmo limiar 5).
// - NUNCA muda: Landmark Identity (assinatura permanente, deliberadamente
//   constante).
// - "Congelado" (achado desta auditoria — exatamente o problema que
//   esta Sprint resolve): TavernRumor já tem sua própria rotação (a
//   cada 6h, `pickByTime`); GuideBubble só aparece 1x por sempre
//   (onboarding, não ambientação); Hidden Objects muda só por CLIQUE
//   (nunca sozinho); CityMap/WorldPreview/ExpeditionPanel/
//   ExpeditionCompact são cascas de navegação/estado real, sem nenhuma
//   ambientação própria de fundo — nenhuma dessas é o alvo desta
//   Sprint, mas confirma que faltava uma camada de "coisas pequenas
//   acontecendo" nos 9 lugares da Cidade, distinta de todas as 6 já
//   existentes.
//
// DÍVIDA TÉCNICA — nenhuma encontrada: `pickOfTheDay`/`pickByTime`/
// `keySalt`/`resolveRotatingLine` (lib/dailyRotation.ts) já foram
// centralizados por Sprints anteriores (World Simulation Phase I,
// Living City Ambient Life Phase I) exatamente para eliminar essa
// duplicação — reaproveitados tal como estão, nenhuma cópia nova, nenhum
// quarto algoritmo de rotação/prioridade/seleção de variante escrito
// aqui.
//
// CRITÉRIO MÁXIMO — 5 das 9 frases abaixo DIVERGEM deliberadamente do
// texto literal de exemplo do brief, porque o exemplo colidia
// semanticamente com uma linha já real de uma camada irmã pro MESMO
// lugar (auditado 1 a 1 contra WP/ES/WS/CAS/Landmark/NPC Daily
// Activities/Living Conversations antes de escrever):
// - Ferreiro: exemplo "Uma encomenda acabou de ser retirada." colidia
//   com World Simulation ("Mais cedo alguém encomendou uma espada
//   incomum.") — mesmo conceito (encomenda). Trocado por um figurante
//   e ação diferentes (aprendiz varrendo limalha).
// - Biblioteca: exemplo "Um livro permanece aberto sobre uma mesa."
//   quase repetia Environmental Storytelling literalmente ("Um livro
//   foi deixado aberto sobre uma mesa."). Trocado por uma criança
//   folheando um livro de figuras (ação, não detalhe estático).
// - Arena: exemplo "Um aprendiz tenta repetir um golpe." colidia com a
//   própria NPC Daily Activity do Mestre da Arena ("Treina golpes.").
//   Trocado por um espectador aplaudindo sozinho nas arquibancadas.
// - Casa dos Viajantes: exemplo "Uma mochila recém-chegada ainda está
//   coberta de poeira." colidia com City Ambient State ("Algumas
//   mochilas ainda esperam encostadas perto da porta.") — mesmo objeto
//   (mochila). Trocado pelo viajante tirando a poeira das próprias
//   botas, nunca a mochila.
// - Portão Norte: exemplo "Uma carroça termina de atravessar os
//   portões." colidia com City Ambient State ("Marcas de rodas de
//   carroça...") e World Simulation ("...liberaram uma caravana.").
//   Trocado por um mensageiro, nunca um veículo.
// - Taverna: exemplo "Um garçom recolhe canecas vazias." colidia com
//   City Ambient State ("Algumas canecas na mesa ainda estão úmidas.")
//   — mesmo objeto (canecas). Trocado por alguém assobiando, nenhuma
//   caneca envolvida.
// Praça/Museu/Guilda mantiveram o espírito do exemplo (nenhuma colisão
// real encontrada), com Guilda levemente ajustada (nunca usa a palavra
// "mapa", já usada por City Ambient State pro mesmo prédio).
export interface MicroEventContext {
  worldEventCategory?: WorldPresenceContext["eventCategory"];
  playersOnline?: number;
}

// Reaproveita o mesmo shape de WorldPresenceContext (único dado de
// evento/população já buscado por CityPage) — nenhum fetch novo, nenhum
// dado inventado.
export function buildMicroEventContext(ctx?: WorldPresenceContext): MicroEventContext {
  if (!ctx) return {};
  return { worldEventCategory: ctx.eventCategory, playersOnline: ctx.playersOnline };
}

type MicroEventVariant = RotatingVariant<MicroEventContext>;

const HIGH_POPULATION_THRESHOLD = 5;

const PLACE_VARIANTS: Record<CityPlace, MicroEventVariant[]> = {
  praca: [
    { when: (ctx) => (ctx.playersOnline ?? 0) >= HIGH_POPULATION_THRESHOLD, line: "Várias crianças brincam de pega-pombo ao mesmo tempo." },
    { line: "Uma criança corre atrás de um pombo." },
  ],
  ferreiro: [{ line: "Um aprendiz varre limalha de metal para o canto da forja." }],
  biblioteca: [
    { when: (ctx) => ctx.worldEventCategory === "misterios", line: "Uma criança larga o livro de figuras e espia por cima do ombro, curiosa." },
    { line: "Uma criança folheia um livro de figuras no canto da sala." },
  ],
  museu: [{ line: "Alguém deixou flores diante de uma peça antiga." }],
  guilda: [{ line: "Dois aventureiros comparam anotações sobre uma rota." }],
  arena: [{ line: "Um espectador aplaude sozinho nas arquibancadas vazias." }],
  "casa-dos-viajantes": [{ line: "Um viajante recém-chegado ainda tira a poeira das botas." }],
  "portao-norte": [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "Um mensageiro entrega um recado urgente e retoma a marcha sem descanso." },
    { line: "Um mensageiro apressado passa pelos portões sem parar." },
  ],
  taverna: [
    { when: (ctx) => ctx.worldEventCategory === "celebracoes", line: "Alguém começa a bater palmas no ritmo de uma canção que todos conhecem." },
    { line: "Alguém assobia uma melodia desconhecida em um canto da sala." },
  ],
};

// Pura: mesma entrada, mesma saída, sempre (dentro do mesmo dia). Nenhum
// componente decide sozinho: todos perguntam a esta camada.
export function getMicroEvent(place: CityPlace, ctx: MicroEventContext = {}): string | null {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}
