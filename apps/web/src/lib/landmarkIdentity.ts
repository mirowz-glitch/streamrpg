import type { CityPlace } from "./cityPlaces";

// Sprint Landmark Identity Phase I — camada central, sem estado, sem
// persistência, sem backend: "qual é a característica que faz este
// lugar ser inesquecível?". Cada lugar exibe UMA frase, sempre a MESMA
// — ao contrário de toda camada irmã, esta NUNCA muda por dia, por
// evento ou por progresso do jogador. É uma assinatura permanente, não
// uma observação circunstancial; por isso não usa Daily Rotation nem
// nenhum contexto — a constância É o requisito ("uma frase capaz de
// fazer o jogador lembrar do lugar meses depois" só funciona se ela
// nunca mudar).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// frase, pra eliminar duplicação e dívida técnica:
// - World Presence: fala de ATMOSFERA/MOVIMENTO do dia (muda com o
//   evento atual). Environmental Storytelling: fala de um DETALHE
//   FÍSICO parado (muda por dia, entre variantes). World Simulation:
//   fala de um EVENTO PONTUAL recente (muda por dia). Living
//   Conversations: fala ATRIBUÍDA a um NPC específico. As quatro têm em
//   comum mudar/variar — Landmark Identity é a única camada
//   deliberadamente CONSTANTE, a assinatura permanente por trás de
//   todas as outras observações variáveis. Nenhuma sobreposição de
//   conteúdo: cada frase abaixo foi conferida 1 a 1 contra os textos
//   reais das quatro camadas pro mesmo prédio (ver auditoria completa
//   na entrega desta Sprint).
// - Dívida técnica encontrada e corrigida ANTES deste arquivo: os
//   mesmos 9 lugares estavam declarados como union de string literals
//   duplicada em environmentalStorytelling.ts (`EnvironmentalPlace`) e
//   worldSimulation.ts (`SimulationPlace`). Consolidados em
//   lib/cityPlaces.ts (`CityPlace`) — este arquivo já nasce reusando
//   esse tipo único, em vez de declarar um quarto.
// - Daily Rotation/Knowledge Links: nenhum dos dois se aplica aqui —
//   não há rotação (a frase nunca muda) nem cruzamento de catálogos
//   (a frase não cita um dado específico de outro sistema, é uma
//   síntese de personalidade). Ambos foram considerados e
//   deliberadamente não usados, não esquecidos.
const LANDMARK_IDENTITY: Record<CityPlace, string> = {
  praca: "Mais cedo ou mais tarde, todos acabam voltando para cá.",
  ferreiro: "O cheiro de metal aquecido parece nunca desaparecer.",
  biblioteca: "É difícil entrar aqui sem acabar descobrindo algo novo.",
  museu: "Cada visita revela um detalhe que passou despercebido.",
  guilda: "Nunca faltam planos para uma nova expedição.",
  taverna: "Quem permanece tempo suficiente sempre acaba ouvindo uma boa história.",
  "casa-dos-viajantes": "Quase toda história importante passou por esta mesa.",
  "portao-norte": "Toda grande jornada começa atravessando este portão.",
  arena: "Até o silêncio aqui parece esperar o próximo combate.",
};

// Pura: mesma entrada, mesma saída, sempre — para sempre, não só no
// mesmo dia.
export function getLandmarkIdentityLine(place: CityPlace): string {
  return LANDMARK_IDENTITY[place];
}
