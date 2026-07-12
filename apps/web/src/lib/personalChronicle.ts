import type { PlayerFacts } from "./playerFacts";
import { buildCollectionInsightContext } from "./collectionInsights";

// Sprint Personal Chronicle Phase I — camada central, sem estado, sem
// persistência, sem backend: "qual momento merece ser lembrado sobre
// este aventureiro?". O jogador vê NO MÁXIMO uma frase, decidida por
// prioridade fixa, renderizada só em CharacterPage — empilhada junto
// de Character Presence, Collection Insight, Legacy e Kingdom
// Reputation.
//
// OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer regra:
// - Muitos dos exemplos do próprio brief ("seu primeiro Boss foi
//   derrotado antes mesmo de visitar o Museu", "os primeiros livros
//   que você leu falavam justamente sobre as criaturas que encontrou
//   depois") são afirmações de SEQUÊNCIA TEMPORAL — exigiriam saber a
//   ORDEM real em que dois marcos aconteceram. Personal Timeline
//   (lib/personalTimeline.ts) guarda `at` (timestamp) por evento, mas
//   é uma janela rolante de só 20 posições, compartilhada por todos os
//   tipos de evento — não confiável pra afirmar "X aconteceu antes de
//   Y" pra um jogador veterano (o evento mais antigo já pode ter sido
//   descartado). Nenhum outro dado real guarda ORDEM entre marcos
//   como "primeiro Boss" e "primeira visita ao Museu" (nem
//   `identity.bosses_defeated`, nem `museumEntriesViewed`, são só
//   contadores, sem timestamp do primeiro evento). Por isso — "usar
//   somente dados reais, nunca deduzir, nunca imaginar" — nenhuma
//   regra abaixo afirma ORDEM/SEQUÊNCIA entre dois marcos. Todas usam
//   CONTAGENS/PROPORÇÕES reais, verificáveis a qualquer momento,
//   nunca uma linha do tempo reconstruída.
// - Character Presence (characterPresence.ts): fala de ESTÁGIO
//   contínuo (iniciante→lenda) em tom de fato presente ("Alguns já
//   reconhecem seu rosto..."). Personal Chronicle nunca usa
//   `getCharacterStage` — é sempre uma retrospectiva em tom de
//   história já vivida ("sua jornada foi/já se estende"), nunca um
//   estado atual.
// - Legacy (legacy.ts): consolida uma CONQUISTA em tom de fato já
//   assentado ("Seu nome já é conhecido..."). Personal Chronicle narra
//   o CAMINHO percorrido, não o resultado — nenhuma regra abaixo
//   reusa um combo de sinais já usado por Legacy (lenda+founder /
//   kingdomRole+bosses≥6 / regiões=11 / bosses≥2+museu≥3+livros≥3 /
//   livros≥6+título / equipTier=strong+nível≥20).
// - Kingdom Reputation (kingdomReputation.ts): é a OPINIÃO do Reino,
//   sempre em terceira pessoa impessoal ("dizem que", "boatos
//   comentam"). Personal Chronicle é sempre endereçado ao próprio
//   jogador ("sua jornada", "você já"), nunca um boato de terceiros —
//   e nenhuma regra abaixo reusa um combo já usado por Kingdom
//   Reputation (founderTitle sozinho / criatura letal sozinha /
//   regiões≥9 / bosses≥4 / kingdomRole sozinho / totalMinutes≥180+
//   regiões≥5 / criaturas≥5+livros≥4).
// - Hero Journey (heroJourney.ts): é um COMENTÁRIO, sempre atribuído a
//   um NPC específico, dentro do NpcIntro, memory-gated (nunca mais de
//   uma vez). Personal Chronicle nunca fala pela boca de um NPC e
//   nunca é memory-gated — é reavaliada a cada visita a CharacterPage,
//   como Character Presence/Legacy/Kingdom Reputation já fazem.
// - Timeline (WorldPage): é CRONOLÓGICA, eventos reais de TODOS os
//   jogadores com timestamp exibido ("09:39 Ashley concluiu uma
//   expedição..."). Personal Chronicle nunca menciona hora/data, nunca
//   é um log de evento específico — é sempre uma síntese/retrospectiva
//   sobre o jogador atual.
// - Discovery Chains (discoveryChains.ts): sugere o PRÓXIMO passo
//   ("talvez faça sentido..."). Personal Chronicle olha pra TRÁS, nunca
//   sugere o que fazer a seguir.
export interface PersonalChronicleContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  museumEntriesViewed: number;
}

export function buildPersonalChronicleContext(facts: PlayerFacts): PersonalChronicleContext {
  const insightCtx = buildCollectionInsightContext();
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    museumEntriesViewed: insightCtx.museumEntriesViewed,
  };
}

interface ChronicleRule {
  when: (ctx: PersonalChronicleContext) => boolean;
  line: string;
}

// Ordem = prioridade: a primeira regra que bater decide. Da mais rara
// pra mais comum.
const CHRONICLE_RULES: ChronicleRule[] = [
  // Fundador — sinal isolado (Kingdom Reputation também usa
  // hasFounderTitle isolado, mas em tom de boato coletivo; aqui é uma
  // retrospectiva pessoal sobre QUANDO a jornada começou).
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "Sua jornada começou nos primeiros dias deste Reino.",
  },
  // Jornada plural — presença real em 3 domínios ao mesmo tempo, com
  // limiares deliberadamente mais baixos que o multi-domínio de Legacy
  // (bosses≥2+museu≥3+livros≥3) — aqui não envolve Bosses, é sobre
  // conhecimento/cultura, não combate.
  {
    when: (ctx) => ctx.booksRead >= 2 && ctx.creaturesViewed >= 2 && ctx.museumEntriesViewed >= 1,
    line: "Sua jornada até aqui reúne um pouco de cada canto do Reino.",
  },
  // Jornada longa — totalMinutes isolado, limiar mais alto que o
  // combo de Kingdom Reputation (totalMinutes≥180+regiões≥5).
  {
    when: (ctx) => ctx.facts.totalMinutes >= 300,
    line: "Sua jornada já se estende por bastante tempo.",
  },
  // Jornada de explorador — regiões descobertas é o traço DOMINANTE da
  // jornada (maior que livros/criaturas/museu), não só um número
  // isolado. Exemplo quase literal do brief.
  {
    when: (ctx) =>
      ctx.facts.regionsDiscovered >= 4 &&
      ctx.facts.regionsDiscovered >= ctx.booksRead &&
      ctx.facts.regionsDiscovered >= ctx.creaturesViewed &&
      ctx.facts.regionsDiscovered >= ctx.museumEntriesViewed,
    line: "Boa parte da sua jornada foi construída explorando o Reino.",
  },
  // Jornada de coragem — combate real enfrentado mesmo com
  // equipamento ainda modesto (nunca "strong", o tier que Legacy usa).
  {
    when: (ctx) => ctx.facts.equipmentTier === "notable" && ctx.facts.bossesDefeated >= 1,
    line: "Você já enfrentou perigos reais mesmo sem o melhor equipamento.",
  },
  // Jornada de estudo — conhecimento construído mais pelos livros do
  // que pela própria observação de campo (proporção, não sequência).
  {
    when: (ctx) => ctx.booksRead >= 3 && ctx.creaturesViewed < 2,
    line: "Grande parte do que você sabe sobre o Reino veio dos livros, não das próprias descobertas.",
  },
];

// Pura: mesma entrada, mesma saída, sempre.
export function getPersonalChronicleLine(facts: PlayerFacts): string | null {
  const ctx = buildPersonalChronicleContext(facts);
  const rule = CHRONICLE_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}
