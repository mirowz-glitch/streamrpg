// Sprint Expedition Journey Phase II — camada central, sem estado, sem
// persistência, sem backend: "qual sensação esta etapa da viagem deve
// transmitir?". Sempre UMA frase, nunca substitui Encounter/Narrative/
// Combat Feel/Expedition Evolution — é uma quinta linha complementar.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, pra eliminar duplicação e dívida técnica:
// - Achado central desta auditoria, em apps/api/src/systems/
//   ExpeditionSystem.ts (`calculateOverallProgress`) e apps/api/src/
//   services/expedition-status.service.ts: `progress_percent` NÃO é
//   "progresso dentro do status atual" — é um único arco contínuo de
//   0 a 100 cobrindo a expedição INTEIRA (STATE_ORDER = preparing →
//   exploring → combating → resting → returning → completed é uma
//   sequência FIXA, obrigatória pra toda expedição, com durações fixas
//   por estado somadas no denominador). Isso muda o desenho desta
//   Sprint: Expedition Evolution (Phase I) responde "como é ESTE
//   status" (6 categorias discretas, `progress_percent` só usado como
//   desempate dentro de "exploring"); Expedition Journey (Phase II)
//   responde "quão longe estamos da jornada INTEIRA" — um eixo
//   contínuo e ortogonal ao status, nunca sobreposto: um "combating"
//   a 15% de progresso geral (encontro cedo) e um "combating" a 85%
//   (quase no fim) merecem sensações diferentes, e só esta camada
//   cobre isso.
// - `pickExpeditionNarrative`/Combat Feel: nada a refatorar — nenhum
//   dos dois olha pra `progress_percent`, e esta camada nunca sorteia
//   nem mexe em classe CSS/remount, só texto determinístico.
// - Nenhuma abstração compartilhada foi criada entre Phase I e Phase
//   II (ambas são só uma lista de bandas/condições → string): a
//   primeira é indexada por enum discreto (`ExpeditionStatus`), a
//   segunda por faixas numéricas contínuas — formas diferentes o
//   bastante pra uma abstração comum custar mais indireção do que
//   remover duplicação real (nenhuma existe entre as duas).
export interface ExpeditionJourneyContext {
  progressPercent: number;
}

interface ProgressBand {
  // Limite superior (inclusive) da faixa.
  max: number;
  line: string;
}

// Exemplos quase literais do brief — um arco contínuo do início ao fim
// da jornada INTEIRA (0–100%), independente do status discreto atual.
const PROGRESS_BANDS: ProgressBand[] = [
  { max: 10, line: "A cidade ainda permanece ao alcance dos olhos." },
  { max: 30, line: "A estrada se torna cada vez mais silenciosa." },
  { max: 50, line: "O grupo já parece completamente imerso na viagem." },
  { max: 70, line: "Cada decisão começa a exigir mais atenção." },
  { max: 90, line: "O retorno já passa a ser considerado." },
  { max: 100, line: "O caminho conhecido volta lentamente a aparecer." },
];

// Pura: mesma entrada, mesma saída, sempre.
export function getExpeditionJourneyLine(ctx: ExpeditionJourneyContext): string {
  const band = PROGRESS_BANDS.find((b) => ctx.progressPercent <= b.max);
  return (band ?? PROGRESS_BANDS[PROGRESS_BANDS.length - 1]).line;
}
