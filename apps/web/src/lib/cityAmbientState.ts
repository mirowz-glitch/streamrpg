import type { WorldEventCategory } from "@streamrpg/shared";
import { keySalt, resolveRotatingLine, type RotatingVariant } from "./dailyRotation";
import type { CityPlace } from "./cityPlaces";

// Sprint Living City — Ambient Life Phase I — camada central, sem
// estado, sem persistência, sem backend: "qual vestígio FÍSICO de
// atividade recente vale a pena mostrar hoje?". Cada Building exibe NO
// MÁXIMO uma linha, determinística por dia (nunca aleatória a cada
// render) — mesmo padrão de Environmental Storytelling/World
// Simulation.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, pra eliminar duplicação e dívida técnica:
// - World Presence (worldPresence.ts): "qual é o HUMOR/MOVIMENTO deste
//   lugar hoje?" — pessoas, barulho, população. Ambient Life nunca
//   fala de gente nem de movimento — só objetos parados.
// - Environmental Storytelling (environmentalStorytelling.ts): "que
//   detalhe físico FIXO/atemporal vale a pena notar?" — uma marca que
//   está sempre ali (a Fonte sempre molhada, ferramentas sempre
//   quentes). Ambient Life é sempre enquadrado como algo de HOJE
//   (rotação diária ou reativo a um sinal real), nunca "sempre assim".
// - World Simulation (worldSimulation.ts): "o que ACONTECEU
//   recentemente?" — sempre um AGENTE fazendo algo ("um grupo",
//   "alguém", "uma equipe"), frase com sujeito e verbo de ação.
//   Ambient Life nunca tem agente: é sempre um objeto/vestígio no
//   estado em que ficou, sem narrar quem fez o quê.
// - Landmark Identity (landmarkIdentity.ts): assinatura permanente,
//   nunca muda. Ambient Life é o oposto — sempre variável.
// - Cada uma das 9 linhas abaixo foi conferida 1 a 1 contra os textos
//   reais das quatro camadas pro mesmo lugar (ver auditoria completa na
//   entrega desta Sprint) — nenhuma reformula a mesma ideia com
//   palavras diferentes (ex: Portão Norte já tinha "pegadas" em
//   Environmental Storytelling; aqui o vestígio é outro objeto —
//   marcas de roda de carroça, nunca pegadas de novo).
// - Daily Rotation (`pickOfTheDay`/`keySalt`): reaproveitada tal como
//   já está (mesmo padrão de ES/WS), nenhuma cópia nova.
// - Hidden Objects/Living Conversations: nenhum dos dois se aplica
//   aqui — Hidden Objects já é sua própria mecânica de clique
//   (HiddenObjects.tsx), Living Conversations já é atribuída a um NPC
//   nomeado (dentro do NpcIntro); Ambient Life nunca cita NPC nem
//   depende de clique. Considerados e deliberadamente não usados.
export interface CityAmbientContext {
  worldEventCategory?: WorldEventCategory;
  playersOnline?: number;
}

// Mesmo `RotatingVariant` genérico já usado por environmentalStorytelling.ts/
// worldSimulation.ts (lib/dailyRotation.ts) — nenhuma interface local
// nova duplicando a mesma forma.
type AmbientVariant = RotatingVariant<CityAmbientContext>;

// Ilustrativo, não calibrado por playtest — mesmo limiar já usado por
// worldPresence.ts pro mesmo sinal real (players_online).
const HIGH_POPULATION_THRESHOLD = 5;

const PLACE_VARIANTS: Record<CityPlace, AmbientVariant[]> = {
  // Reage a players_online (mesmo sinal real de World Presence, eixo
  // diferente: aqui é só o objeto físico — bancos —, nunca o
  // "movimento"/"humor" da praça que World Presence já cobre.
  praca: [
    { when: (ctx) => (ctx.playersOnline ?? 0) >= HIGH_POPULATION_THRESHOLD, line: "Vários bancos da praça estão ocupados." },
    { line: "Um banco da praça está ocupado." },
  ],
  // Reage ao evento "militar" (mesma categoria real que World Presence
  // usa pra "A forja trabalha sem descanso hoje." — aqui o vestígio é
  // outro: carvão ainda fumegando, nunca a mesma frase sobre a forja
  // "trabalhando").
  ferreiro: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "Restos de carvão ainda fumegam ao lado de várias bancadas." },
    { line: "Restos de carvão ainda fumegam ao lado da bancada." },
  ],
  biblioteca: [{ line: "Algumas cadeiras da Biblioteca ainda estão fora do lugar." }],
  museu: [{ line: "Uma peça está coberta por um pano, à espera de restauração." }],
  // Duas variantes fixas, sem sinal nenhum — rotação diária pura (o
  // mesmo mecanismo de ES/WS quando há mais de uma variante fixa).
  guilda: [
    { line: "Alguns mapas ainda estão abertos sobre a mesa de reuniões." },
    { line: "Um banco perto da mesa de reuniões ainda está fora do lugar." },
  ],
  arena: [{ line: "A areia da arena ainda está revirada em alguns pontos." }],
  "portao-norte": [{ line: "Marcas de rodas de carroça ainda cortam a lama da entrada." }],
  "casa-dos-viajantes": [{ line: "Algumas mochilas ainda esperam encostadas perto da porta." }],
  taverna: [{ line: "Algumas canecas na mesa ainda estão úmidas." }],
};

// Pura: mesma entrada, mesma saída, sempre (dentro do mesmo dia) —
// mesmo algoritmo de getEnvironmentalLine/getWorldSimulationLine,
// agora centralizado em resolveRotatingLine (dailyRotation.ts).
export function getCityAmbientLine(place: CityPlace, ctx: CityAmbientContext = {}): string | null {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}
