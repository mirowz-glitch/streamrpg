import type { EncounterCategory, ExpeditionStatus } from "@streamrpg/shared";

// Sprint Expedition Decisions Phase I — camada central, sem estado, sem
// persistência, sem backend, sem botão/popup/painel: "neste momento, qual
// escolha faria sentido o jogador considerar?". Sempre UMA frase, sempre
// uma PERGUNTA ou um TRADE-OFF explícito — nunca uma descrição do que já
// está acontecendo (isso já é responsabilidade de Evolution/Narrative).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, pra eliminar duplicação e dívida técnica:
// - ExpeditionSystem (apps/api): confirmado que STATE_ORDER é uma
//   sequência FIXA e obrigatória (preparing→exploring→combating→
//   resting→returning→completed), nunca ramificada — não existe hoje
//   nenhum ponto real de bifurcação (duas rotas, dois destinos). Por
//   isso nenhuma regra abaixo finge que uma escolha já mudaria o
//   resultado: são só gatilhos mentais, como o brief pede ("as frases
//   NÃO alteram gameplay, resultados, drops, XP").
// - lib/expeditionNarratives.ts (`pickExpeditionNarrative`): pool
//   aleatório de flavor por status, já mostrado junto do Encounter.
//   Nenhuma frase abaixo repete esse padrão descritivo nem reusa texto.
// - lib/expeditionEvolution.ts (`getExpeditionEvolutionLine`): também
//   por status+categoria, mas sempre uma AFIRMAÇÃO sobre o estágio da
//   jornada ("o grupo diminui o ritmo..."). A diferença deliberada:
//   Evolution descreve o que já acontece; Decision Hints propõe uma
//   escolha hipotética sobre a MESMA situação (ex: mesma categoria
//   "descoberta" — Evolution afirma que o grupo já observa algo, aqui
//   perguntamos se vale a pena parar ou seguir). Nenhuma linha abaixo
//   repete o texto de Evolution.
// - lib/expeditionJourney.ts: eixo de progresso (0-100), sem relação
//   com escolha — não reaproveitado diretamente aqui (nenhuma regra
//   depende de progressPercent), pra manter os dois eixos ortogonais
//   como já estabelecido entre as Sprints anteriores.
// - lib/regionIdentity.ts: assinatura fixa por região (átemporal, sem
//   relação com decisão) — não se aplica.
// - "Combat Feel Phase I" (key={expedition.status} remount +
//   .expedition-panel-combat/.expedition-compact-combat, dentro de
//   ExpeditionPanel/ExpeditionCompact): resolve o destaque VISUAL de
//   combate; não é um arquivo de texto, nada a reaproveitar em texto.
// - CreatureEcology / KnowledgeLinks: exigiriam saber QUAL criatura ou
//   monumento está por trás do Encounter atual — EncounterSnapshot
//   (apps/api) não carrega creatureId/monumentId, só
//   category+icon+text. Ligar isso aqui seria inventar uma referência
//   que o dado real não sustenta — por isso, deliberadamente não
//   usados (mesmo critério já aplicado em Personal Chronicle: nunca
//   deduzir uma referência que o dado não garante).
// - DailyRotation (`pickOfTheDay`/`keySalt`): útil quando várias frases
//   empatam pra mesma chave e precisam de uma escolha estável entre
//   sessões. Aqui cada combinação real de status+categoria já cai numa
//   única regra determinística (lista de prioridade), sem empate a
//   desambiguar — não se aplica, mesmo espírito de Expedition
//   Evolution/Journey (também não usam DailyRotation).
export interface ExpeditionDecisionContext {
  status: ExpeditionStatus;
  encounterCategory?: EncounterCategory | null;
}

interface DecisionRule {
  when: (ctx: ExpeditionDecisionContext) => boolean;
  line: string;
}

// Ordem = prioridade: a primeira regra que bater decide. Combinações
// mais específicas (status + categoria) antes das genéricas (só status).
const DECISION_RULES: DecisionRule[] = [
  {
    when: (ctx) => ctx.status === "exploring" && ctx.encounterCategory === "descoberta",
    line: "Vale a pena parar para investigar, ou é melhor seguir em frente?",
  },
  {
    when: (ctx) => ctx.status === "exploring" && ctx.encounterCategory === "misterio",
    line: "Nem todo grupo se arriscaria a chegar mais perto disso.",
  },
  {
    when: (ctx) => ctx.status === "exploring" && ctx.encounterCategory === "clima",
    line: "Continuar mesmo com o tempo assim nem sempre é a decisão mais segura.",
  },
  {
    when: (ctx) => ctx.status === "combating",
    line: "Continuar lutando ou recuar? Cada grupo decidiria de um jeito diferente.",
  },
  {
    when: (ctx) => ctx.status === "resting",
    line: "Descansar por completo ou seguir logo em frente? A escolha muda a jornada.",
  },
  {
    when: (ctx) => ctx.status === "returning",
    line: "Apressar o passo ou aproveitar os últimos momentos do caminho?",
  },
  {
    when: (ctx) => ctx.status === "preparing",
    line: "Partir sem pressa ou logo de uma vez? Nem todo grupo decide igual.",
  },
  {
    when: (ctx) => ctx.status === "exploring",
    line: "O caminho parece esconder mais de uma rota possível.",
  },
];

// Pura: mesma entrada, mesma saída, sempre. "completed" nunca bate
// nenhuma regra (não há decisão a considerar no instante exato da
// chegada — a próxima expedição já começa em "preparing").
export function getExpeditionDecisionHint(ctx: ExpeditionDecisionContext): string | null {
  const rule = DECISION_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}
