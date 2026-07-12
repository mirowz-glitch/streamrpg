import type { ExpeditionApproach } from "@streamrpg/shared";
import type { PlayerFacts } from "./playerFacts";
import { pickOfTheDay, keySalt } from "./dailyRotation";
import { getNextSteps } from "./knowledgeNetwork";

// Sprint Kingdom Memory Phase I — camada central, sem estado próprio,
// sem persistência nova, sem backend/tabela/sistema/quest: "existe
// alguma pequena lembrança do Reino que faz sentido aparecer agora?".
// Nunca afirma que foi O JOGADOR — sempre tom coletivo/indireto ("Há
// quem diga...", "Alguns comentam..."), e sempre num prédio da Cidade
// (nunca CharacterPage), diferente de toda camada irmã.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, comparando 1 a 1 contra cada camada que já responde uma
// pergunta parecida, pra garantir papel único:
// - Kingdom Reputation (kingdomReputation.ts): já é "o boato coletivo
//   do Reino sobre você", em terceira pessoa, mas SEMPRE em
//   CharacterPage. Kingdom Memory nunca aparece lá — só em prédios da
//   Cidade. Nenhuma combinação de sinal usada aqui repete uma já usada
//   por Kingdom Reputation (hasFounderTitle/hasEncounteredLethal/
//   regions>=9/bosses>=4/hasKingdomRole/totalMinutes>=180+regions>=5/
//   creatures>=5+books>=4) — todos os limiares abaixo são diferentes.
// - Collection Insight (collectionInsights.ts): já é "quanto desta
//   coleção você já tem", em PRIMEIRA pessoa ("Seu caderno...", "Você
//   já registrou..."), no MESMO prédio (Bestiário usa creaturesViewed,
//   Biblioteca usa booksRead). Pra não repetir o mesmo limiar com tom
//   diferente, Kingdom Memory usa limiares mais altos (a "próxima
//   camada" depois que a coleção já está avançada) e NUNCA usa "você"/
//   "seu" — sempre impessoal.
// - Personal Chronicle (personalChronicle.ts): já usa totalMinutes>=300
//   sozinho e books>=3+creatures<2 — limiares diferentes usados aqui
//   (totalMinutes>=240, books>=8) pra não duplicar a mesma regra.
// - Hero Journey/Living Consequences (npcDialogue/*.ts): são
//   ATRIBUÍDAS a um NPC específico, dentro do NpcIntro, memory-gated
//   (some depois de aparecer uma vez). Kingdom Memory nunca fala pela
//   boca de um NPC — é uma observação do LUGAR, sempre reavaliada
//   (nunca desaparece depois de mostrada, mesmo espírito de Kingdom
//   Reputation/Legacy: um fato real continua sendo real).
// - World Presence/Environmental Storytelling/World Simulation/City
//   Ambient/Landmark Identity: todas variam por EVENTO DO REINO
//   (current_event) ou por DIA (rotação), nunca por PROGRESSO PESSOAL
//   do jogador (PlayerFacts). Kingdom Memory é o oposto: só reage a
//   PlayerFacts, nunca a current_event/players_online.
// - REFACTOR OBRIGATÓRIO — nenhum componente calculava uma "pequena
//   observação isolada" fora das camadas centrais já existentes; nada
//   a remover além do que as Sprints anteriores já centralizaram.
// - Reaproveitado: `getNextSteps` (KnowledgeNetwork) decide quantos
//   dos sinais elegíveis revelar quando "investigate" (cap 1/3, já
//   existente, nenhuma lógica de cap nova); `pickOfTheDay`/`keySalt`
//   (DailyRotation) decide QUAL memória elegível aparece em
//   "continue"/approach nulo quando mais de uma bate — variedade real
//   entre visitas, em vez de sempre a de maior prioridade.
export type KingdomMemoryBuilding = "taverna" | "biblioteca" | "museu" | "bestiario" | "casa-dos-viajantes";

export interface KingdomMemoryContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
}

interface MemoryRule {
  when: (ctx: KingdomMemoryContext) => boolean;
  line: string;
}

// Limiares deliberadamente diferentes dos já usados por Kingdom
// Reputation/Personal Chronicle/Collection Insight para os mesmos
// sinais (ver auditoria acima) — cada camada com seu próprio papel.
const RULES_BY_BUILDING: Record<KingdomMemoryBuilding, MemoryRule[]> = {
  taverna: [
    { when: (ctx) => ctx.facts.bossesDefeated >= 6, line: "Há quem diga que os monstros andam mais cautelosos ultimamente." },
    { when: (ctx) => ctx.facts.bossesDefeated >= 2, line: "Alguns comentam sobre confrontos recentes contra criaturas perigosas." },
  ],
  biblioteca: [
    { when: (ctx) => ctx.facts.regionsDiscovered >= 7, line: "Novos mapas aparecem com mais frequência ultimamente." },
    { when: (ctx) => ctx.facts.regionsDiscovered >= 3, line: "Alguns visitantes comentam sobre terras que poucos exploraram." },
  ],
  museu: [{ when: (ctx) => ctx.booksRead >= 8, line: "Algumas vitrines receberam pequenas anotações recentes." }],
  bestiario: [{ when: (ctx) => ctx.creaturesViewed >= 10, line: "Alguns registros receberam observações recentes." }],
  "casa-dos-viajantes": [
    { when: (ctx) => ctx.facts.totalMinutes >= 240, line: "Um viajante jurava ter seguido os mesmos caminhos, há tempos." },
  ],
};

// Pura: mesma entrada, mesmo dia, mesma saída. "investigate" revela
// até 3 memórias elegíveis (getNextSteps, cap já existente);
// "continue"/nenhuma escolha revelam exatamente 1 — mas, ao contrário
// de toda camada irmã (que sempre mostra a de maior prioridade), aqui
// a rotação diária decide QUAL das elegíveis aparece, dando variedade
// real entre visitas sem nunca inventar uma memória que não é real.
export function getKingdomMemoryLine(
  building: KingdomMemoryBuilding,
  ctx: KingdomMemoryContext,
  approach: ExpeditionApproach | null,
): string | null {
  const matched = RULES_BY_BUILDING[building].filter((r) => r.when(ctx)).map((r) => r.line);
  if (matched.length === 0) return null;
  if (approach === "investigate") {
    return getNextSteps([matched], approach).join(" ");
  }
  return pickOfTheDay(matched, keySalt(building));
}
