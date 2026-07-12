import type { PlayerFacts } from "./playerFacts";
import { buildCollectionInsightContext, hasEncounteredLethalCreature } from "./collectionInsights";

// Sprint Kingdom Reputation Phase I — camada central, sem estado, sem
// persistência, sem backend: "o que o Reino inteiro começaria a
// comentar sobre este aventureiro?". O jogador vê NO MÁXIMO uma frase
// (nunca duas, nunca lista), decidida por prioridade fixa, renderizada
// só em CharacterPage — empilhada junto de Character Presence,
// Collection Insight e Legacy.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// regra:
// - Legacy (legacy.ts): já responde "que MARCA CONSOLIDADA este
//   aventureiro deixou" — uma conquista estável, contada como fato já
//   assentado ("Seu nome já é conhecido...", "Poucos exploraram tantas
//   terras..."). Kingdom Reputation é deliberadamente diferente em
//   REGISTRO, não só em sinal: nunca um fato assentado, sempre um
//   boato EM CIRCULAÇÃO agora ("dizem que", "boatos comentam",
//   "circula a notícia de que", "alguns viajantes juram que") — a
//   diferença entre "isto já é verdade sobre você" (Legacy) e "as
//   pessoas estão começando a falar sobre isto" (Kingdom Reputation).
//   Nenhuma regra abaixo repete um combo de sinais já usado por Legacy
//   (lenda+founder / kingdomRole+bosses>=6 / regions=11 / bosses>=2+
//   museu>=3+livros>=3 / livros>=6+título / equipTier=strong+nível>=20).
// - Recognition/Living Consequences: falam pela boca de UM NPC
//   específico, em primeira pessoa implícita ("Ouvi dizer que...",
//   sempre atribuído). Kingdom Reputation nunca é atribuído a ninguém
//   — é o Reino inteiro, sem rosto, sem "eu/vi/acho/penso".
// - Hero Journey: é MEMÓRIA — compara o personagem de hoje com o de
//   antes (mistura tempo de jogo + evolução). Kingdom Reputation nunca
//   usa `totalMinutes` como contraste temporal — usa como um sinal de
//   presença/circulação entre outros, nunca como "antes vs. agora".
// - Character Presence: fala de ESTÁGIO contínuo (iniciante→lenda),
//   reavaliado toda visita. Kingdom Reputation nunca usa
//   `getCharacterStage` — sinais reais isolados/combinados, nunca o
//   score consolidado.
// - Collection Insights: já cobre contadores isolados (livros>=6,
//   criaturas>=6, regiões>=8, museu>=3) com textos PESSOAIS ("Você
//   já..."). Toda regra aqui que toca os mesmos contadores usa um
//   patamar diferente e/ou uma combinação nova, e o texto é sempre
//   IMPESSOAL ("comentam que você...", nunca "Você já...").
// - Dívida técnica encontrada e corrigida ANTES deste arquivo:
//   `hasEncounteredLethalCreature` (cruza creatureId do Personal
//   Timeline com dangerLevel "letal" do Bestiário) vivia só inline em
//   NpcIntro.tsx. Extraída pra lib/collectionInsights.ts (mesmo
//   arquivo central de sinais derivados do Personal Timeline) —
//   NpcIntro.tsx refatorado pra reaproveitar, Kingdom Reputation nasce
//   já consumindo a versão central, nunca uma terceira cópia.
export interface KingdomReputationContext {
  facts: PlayerFacts;
  creaturesViewed: number;
  booksRead: number;
  hasEncounteredLethal: boolean;
}

export function buildKingdomReputationContext(facts: PlayerFacts): KingdomReputationContext {
  const insightCtx = buildCollectionInsightContext();
  return {
    facts,
    creaturesViewed: insightCtx.creaturesViewed,
    booksRead: insightCtx.booksRead,
    hasEncounteredLethal: hasEncounteredLethalCreature(),
  };
}

interface ReputationRule {
  when: (ctx: KingdomReputationContext) => boolean;
  line: string;
}

// Ordem = prioridade: a primeira regra que bater decide. Da mais rara
// (títulos de fundador são um punhado de slugs reais) pra mais comum.
const REPUTATION_RULES: ReputationRule[] = [
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "Circula a notícia de que um dos primeiros aventureiros deste Reino ainda anda por aí.",
  },
  {
    when: (ctx) => ctx.hasEncounteredLethal,
    line: "Dizem que alguém enfrentou uma criatura que poucos conseguem descrever direito.",
  },
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= 9,
    line: "Alguns viajantes juram que existe um aventureiro que conhece quase todo o Reino.",
  },
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 4,
    line: "Boatos comentam sobre um aventureiro que já enfrentou vários Bosses e ainda segue de pé.",
  },
  {
    when: (ctx) => ctx.facts.hasKingdomRole,
    line: "Na Guilda começaram a falar bastante sobre seu nome.",
  },
  {
    when: (ctx) => ctx.facts.totalMinutes >= 180 && ctx.facts.regionsDiscovered >= 5,
    line: "Os comerciantes comentam que você já passou por muitos lugares.",
  },
  {
    when: (ctx) => ctx.creaturesViewed >= 5 && ctx.booksRead >= 4,
    line: "Moradores comentam que um aventureiro anda estudando o Reino com mais atenção que o normal.",
  },
];

// Pura: mesma entrada, mesma saída, sempre.
export function getKingdomReputationLine(facts: PlayerFacts): string | null {
  const ctx = buildKingdomReputationContext(facts);
  const rule = REPUTATION_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}
