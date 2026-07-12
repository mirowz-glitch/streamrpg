import type { EncounterCategory, ExpeditionApproach, ExpeditionStatus } from "@streamrpg/shared";

// Sprint Live Experience Phase I (Expedition Events) — camada central,
// sem estado, sem persistência, sem backend/fetch/hook/React: "que
// pequeno acontecimento PONTUAL está rolando agora nesta expedição?".
// Diferente de toda camada irmã: nunca narrativa ambiente (Expedition
// Narratives, aleatória a cada poll), nunca estágio da jornada
// (Evolution/Journey), nunca reação à escolha do jogador como
// consequência ambiental (Consequences), nunca assinatura da região
// (Region Identity) — é sempre um micro-instante concreto, determinado
// pelo mesmo status/progresso/categoria/approach já existentes, 100%
// determinístico (nunca `Math.random`, ao contrário de
// `pickExpeditionNarrative`).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, mapeando os 11 componentes/sistemas do brief:
// - Já depende de STATUS: Expedition Evolution (preparing/combating/
//   resting/returning/completed, 1 frase fixa cada) e Expedition
//   Narratives (pool de ~70-300 frases por status, sorteada a cada
//   poll via Math.random — o único "flicker" verdadeiramente aleatório
//   do projeto).
// - Já depende de progress_percent: Expedition Journey (6 faixas
//   contínuas 0-100, cobrindo a jornada INTEIRA, sem olhar pro status)
//   e Expedition Evolution (só dentro de "exploring", divide em <50/
//   >=50 como desempate).
// - Já depende de encounter.category: Expedition Evolution ("descoberta"
//   tem prioridade sobre a divisão por progresso, dentro de
//   "exploring") e Expedition Consequences (indiretamente, via Approach
//   que enviesa quais categorias de Encounter aparecem no backend).
// - Muda só por rotação: nenhuma camada de Expedição usa Daily Rotation
//   hoje — Region Identity é constante (nunca muda), Consequences só
//   depende de Approach (constante durante toda a expedição).
//
// DÍVIDA TÉCNICA — nenhuma encontrada: nenhuma seleção por progress_percent/
// status/prioridade estava duplicada entre Evolution/Journey/
// Consequences (cada uma já é uma função pura própria, formas
// deliberadamente diferentes — enum discreto vs faixa contínua vs
// approach isolado — auditado e confirmado nos comentários de cada
// arquivo). Nenhum helper de renderização duplicado: todo Building/Panel
// já usa o mesmo padrão `{linha ? <p className="hint">{linha}</p> :
// null}`. Nada a refatorar antes desta Sprint.
//
// CRITÉRIO MÁXIMO — 5 dos 6 exemplos literais do brief foram
// substituídos por colidirem com uma camada irmã já real (a exigência
// "nunca repetir textos de ExpeditionNarratives/Journey/Evolution/
// Consequences/RegionIdentity" é levada ao pé da letra, não só a
// intenção):
// - Exploração: exemplo ("O grupo faz uma breve parada para observar
//   rastros.") seguia o MESMO molde de EXPLORING_NARRATIVES ("O grupo
//   faz uma pausa rápida para respirar."). Reescrito como um sujeito
//   diferente notando algo, não o grupo parando.
// - Descoberta: exemplo ("Todos diminuem o ritmo por alguns instantes.")
//   quase repetia literalmente a própria frase de Expedition Evolution
//   pra "descoberta" ("O grupo diminui o ritmo para observar algo
//   incomum.") — mesmo verbo "diminuir o ritmo". Reescrito sem esse
//   verbo.
// - Retorno: exemplo ("As mochilas parecem mais pesadas.") era quase
//   idêntico a uma frase real de RETURNING_NARRATIVES ("As mochilas
//   voltam mais pesadas."). Reescrito com sujeito e verbo diferentes.
// - Conclusão: exemplo ("O caminho de volta parece mais familiar.") é
//   uma frase REAL, EXISTENTE, LITERAL de RETURNING_NARRATIVES —
//   duplicação exata que o brief proíbe. Reescrito por completo.
// - Descanso: exemplo ("A fogueira começa a perder intensidade.")
//   reformulava o tema de fogo/silêncio já extensamente coberto por
//   RESTING_NARRATIVES ("O fogo diminui aos poucos..."). Trocado por um
//   detalhe físico nunca usado ali (curativo).
// Combate manteve o exemplo original (nenhuma colisão real encontrada).
//
// DETERMINISMO — ao contrário de `pickExpeditionNarrative` (Math.random
// a cada poll, de propósito, é o "flicker"), esta camada nunca sorteia:
// mesma combinação de status/progresso/categoria/approach sempre produz
// a mesma linha, mesmo padrão de Expedition Evolution/Journey (nenhuma
// Daily Rotation aqui — não faz sentido rotacionar por dia um
// "instante" da expedição em si).
export interface ExpeditionMomentContext {
  status: ExpeditionStatus;
  progressPercent: number;
  encounterCategory?: EncounterCategory | null;
  approach: ExpeditionApproach | null;
}

// Aceita tanto ExpeditionResponse quanto ExpeditionCompact (packages/
// shared) — os dois já compartilham exatamente esses 4 campos com os
// mesmos nomes; nenhum tipo novo precisou ser criado, nenhuma região
// precisou ser lida (nenhum dos 6 micro acontecimentos abaixo depende
// de qual região é — isso já é o trabalho de Region Identity).
interface ExpeditionMomentInput {
  status: ExpeditionStatus;
  progress_percent: number;
  encounter?: { category: EncounterCategory } | null;
  approach: ExpeditionApproach | null;
}

export function buildExpeditionMomentContext(expedition: ExpeditionMomentInput): ExpeditionMomentContext {
  return {
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    encounterCategory: expedition.encounter?.category ?? null,
    approach: expedition.approach,
  };
}

const EXPLORING_PROGRESS_MIDPOINT = 50;

// Pura: mesma entrada, mesma saída, sempre — nunca sorteia.
export function getExpeditionMoment(ctx: ExpeditionMomentContext): string {
  if (ctx.status === "preparing") return "Uma bandeira improvisada é erguida como sinal de partida.";
  if (ctx.status === "resting") return "Alguém amarra um curativo improvisado no braço.";
  if (ctx.status === "returning") return "Os primeiros sinais da Capital aparecem no horizonte.";
  if (ctx.status === "completed") return "Os primeiros passos na Capital parecem mais leves.";
  if (ctx.status === "combating") {
    if (ctx.approach === "investigate") return "O grupo avalia cada movimento antes de agir.";
    if (ctx.approach === "continue") return "O grupo age rápido, sem hesitar.";
    return "As armas são rapidamente reorganizadas.";
  }
  // exploring — mesma prioridade de Expedition Evolution: "descoberta"
  // vence a divisão por progresso.
  if (ctx.encounterCategory === "descoberta") return "Um objeto chama a atenção de todos por um instante.";
  if (ctx.progressPercent < EXPLORING_PROGRESS_MIDPOINT) return "Alguém aponta rastros recentes no chão.";
  return "O passo do grupo acelera por um instante.";
}
