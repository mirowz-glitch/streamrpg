import type { EncounterCategory, ExpeditionStatus } from "@streamrpg/shared";

// Sprint Expedition Evolution Phase I — camada central, sem estado,
// sem persistência, sem backend: "em que momento da jornada o grupo
// parece estar?". Sempre UMA frase, nunca lista, nunca substitui
// Encounter/Narrative/Combat Feel — complementa, como uma quarta linha
// no mesmo bloco de história.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, pra eliminar duplicação e dívida técnica:
// - lib/expeditionNarratives.ts (`pickExpeditionNarrative`) JÁ FAZ algo
//   parecido: uma frase de "flicker" por `ExpeditionStatus`, mostrada
//   junto do Encounter em ExpeditionPanel/ExpeditionCompact. Achado
//   central desta auditoria: se Expedition Evolution criasse mais um
//   pool de frases aleatórias por status, seria duplicação direta do
//   que já existe. Diferença deliberada, pra justificar uma camada
//   nova em vez de estender a existente: `pickExpeditionNarrative` é
//   ALEATÓRIO a cada poll (mesmo com o status parado, a frase muda —
//   é o "flicker" ambiente, de propósito). Expedition Evolution é
//   DETERMINÍSTICO — a mesma combinação de status+progresso+encontro
//   sempre produz a mesma frase, porque ela não descreve um detalhe
//   passageiro, descreve em que ESTÁGIO da jornada o grupo está agora
//   (um dado real e estável: `progress_percent`, nunca antes usado
//   para nada além da barra de progresso numérica).
// - ExpeditionStatus real (`preparing/exploring/combating/resting/
//   returning/completed`) já é exatamente a lista de "Preparando/
//   Explorando/Combate/Descanso/Retorno/Concluído" pedida nos Testes —
//   reaproveitada tal como já existe (lib/expedition.ts's STATUS_ICON/
//   STATUS_LABEL), nenhum status novo.
// - EncounterCategory real (packages/shared/src/types.ts) já inclui
//   "descoberta" como uma das 8 categorias reais do Encounter System —
//   usada aqui pra dar ao momento "Descoberta" um gate real (só
//   quando o Encounter atual É da categoria descoberta, não um texto
//   novo inventado). Confirmado contra o próprio mock de
//   CharacterPreview.tsx (MOCK_EXPEDITION já usa `category: "descoberta"`
//   com progress_percent 62 — exatamente o cenário que faz esta regra
//   vencer a divisão por progresso abaixo).
// - Combat Feel Phase I (`key={expedition.status}` remount +
//   `.expedition-panel-combat`/`.expedition-compact-combat`): já
//   resolve a ANIMAÇÃO/destaque visual de combate — Expedition
//   Evolution nunca mexe nisso, só adiciona texto.
// - World Presence/World Simulation/Raven Encounters/Creature Ecology/
//   Item Identity/Knowledge Links/Daily Rotation: nenhum se aplica
//   diretamente aqui (todos são camadas de LUGAR ou de CATÁLOGO,
//   nunca de estágio de progresso dentro de uma jornada em andamento)
//   — considerados e deliberadamente não usados, não esquecidos.
export interface ExpeditionEvolutionContext {
  status: ExpeditionStatus;
  progressPercent: number;
  encounterCategory?: EncounterCategory | null;
}

// Ilustrativo, não calibrado por playtest — mesma convenção de todo
// número não validado neste projeto (Tiers de Boss, Evolution Score).
const EXPLORING_MIDPOINT = 50;

// Pura: mesma entrada, mesma saída, sempre.
export function getExpeditionEvolutionLine(ctx: ExpeditionEvolutionContext): string {
  if (ctx.status === "preparing") return "O grupo ainda organiza os últimos detalhes.";
  if (ctx.status === "combating") return "O silêncio desaparece por alguns instantes.";
  if (ctx.status === "resting") return "O grupo aproveita para recuperar as forças.";
  if (ctx.status === "returning") return "O caminho de volta parece sempre mais curto.";
  if (ctx.status === "completed") return "A jornada chega ao fim, pelo menos por enquanto.";
  // exploring — "Descoberta" (encontro real de categoria "descoberta")
  // tem prioridade sobre a divisão por progresso.
  if (ctx.encounterCategory === "descoberta") return "O grupo diminui o ritmo para observar algo incomum.";
  if (ctx.progressPercent < EXPLORING_MIDPOINT) return "A estrada ainda permanece bem conhecida.";
  return "As marcas da cidade ficam cada vez mais distantes.";
}
