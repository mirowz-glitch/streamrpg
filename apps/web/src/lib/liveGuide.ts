import type { ExpeditionApproach } from "@streamrpg/shared";
import type { PlayerFacts } from "./playerFacts";
import type { CollectionInsightContext } from "./collectionInsights";
import type { ExpeditionEchoContext } from "./expeditionEchoes";

// Sprint Live Experience Phase II (Guided Discovery) — camada central,
// sem estado, sem persistência, sem backend/fetch/hook/React/
// PlayerMemory: "para onde pode ser interessante ir agora?". Nunca é um
// tutorial/onboarding/checklist/missão/recompensa/XP — é sempre uma
// sugestão natural de LUGAR, nunca de TAREFA (essa pergunta já é
// respondida por PlayerGoals).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, mapeando os 15 componentes/camadas do brief:
// - Superfícies que um jogador novo vê primeiro: CharacterPage (XpBar,
//   ExpeditionPanel, PlayerGoals, BossCard) e CityPage/Praça (CityMap,
//   CityHubBar) — nenhuma delas hoje aponta pra um PRÉDIO específico
//   como "próximo passo"; GuideBubble só existe DENTRO de cada prédio
//   (uma vez, na primeira visita a ELE), nunca antecipa qual prédio
//   visitar a seguir.
// - Sistemas que só aparecem "por acaso": Bestiário/Biblioteca/Museu/
//   Casa dos Viajantes/Taverna só são descobertos se o jogador clicar
//   no CityMap por conta própria — nenhuma camada hoje sugere isso a
//   partir da Praça ou do Personagem.
// - Exigem muitos cliques: Discovery Chains/Knowledge Network (só
//   aparecem DEPOIS de abrir um livro/criatura específico dentro de um
//   prédio já visitado); Kingdom Memory (só aparece dentro do prédio
//   já aberto).
// - Já têm feedback visual (`ui-feedback`): NpcIntro (attention/
//   softGlow), Legacy/Kingdom Reputation/Personal Chronicle
//   (subtleBorder, Live Readiness Phase I), CityMap (highlight, Live
//   Readiness/World Cohesion) — todos DENTRO da Cidade/NPC, nenhum diz
//   "vá pra lá".
// - Já têm sugestão/"próximo passo": PlayerGoals ("o que fazer" — 12
//   regras, sempre uma AÇÃO: "equipar uma arma", "conhecer o
//   Bestiário"); Discovery Chains ("Talvez valha a pena procurar mais
//   sobre isso na Biblioteca" — mas só sobre o item ABERTO agora, nunca
//   um lugar novo); Knowledge Network (combina Discovery Chains +
//   Knowledge Threads, mesmo eixo: sobre o item aberto).
//
// DÍVIDA TÉCNICA — nenhuma lógica de "próximo passo"/"destaque visual"/
// "descoberta recomendada" estava duplicada: PlayerGoals (GOAL_RULES),
// Discovery Chains (candidates + `.slice`) e Kingdom Memory
// (RULES_BY_BUILDING) já são três formas DELIBERADAMENTE diferentes
// (regra sobre o jogador / conexão sobre um item aberto / regra sobre
// um prédio), auditadas e confirmadas sem sobreposição de código. Nada
// a refatorar antes desta Sprint.
export interface LiveGuideContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  approach: ExpeditionApproach | null;
}

// Reaproveita PlayerFacts (já calculado por CharacterPage/CityPage),
// CollectionInsightContext (booksRead/creaturesViewed, já calculado por
// ambos) e ExpeditionEchoContext (approach, já calculado por CityPage;
// CharacterPage passou a calcular também, mesmo hook `useExpedition` já
// usado por CityPage pelo mesmo motivo) — nenhum dado novo, nenhum
// fetch novo.
export function buildLiveGuideContext(
  facts: PlayerFacts,
  insightCtx: Pick<CollectionInsightContext, "booksRead" | "creaturesViewed">,
  echoContext?: ExpeditionEchoContext,
): LiveGuideContext {
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    approach: echoContext?.approach ?? null,
  };
}

interface SurfaceRule {
  when: (ctx: LiveGuideContext) => boolean;
  line: string;
}

// REGIONS_DISCOVERED/BOOKS_READ/CREATURES_VIEWED/BOSSES_DEFEATED/
// TOTAL_MINUTES abaixo são todos limiares ISOLADOS e ESTRITAMENTE
// PRÓPRIOS desta camada — nenhum reaproveita a combinação exata já
// usada por Collection Insights (2/6 nos três contadores)/Legacy
// (regiões=11, livros>=6+título)/Kingdom Reputation (regiões>=9,
// criaturas>=5+livros>=4)/Personal Chronicle (minutos>=300, regiões>=4
// dominante)/Expedition Specialization (regiões>=6, criaturas>=8,
// livros>=8, minutos>=480) — auditados 1 a 1 antes de escolher os
// números abaixo.
//
// Ordem = prioridade: da mais rara (fundador) pra mais comum
// (fallback de jogador novo, sempre por último — garante que
// getRecommendedSurface NUNCA retorna vazio).
const SURFACE_RULES: SurfaceRule[] = [
  // Fundador — GuildBuilding já lista Títulos de Fundador (Sprint
  // Founder Identity & Prestige); conexão natural e real, nunca
  // repetindo o boato de Kingdom Reputation nem a retrospectiva de
  // Personal Chronicle pro mesmo sinal.
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "A Guilda talvez reconheça seu lugar entre os primeiros.",
  },
  // Veterano — muito tempo de jogo, limiar acima do de Expedition
  // Specialization (480) e Personal Chronicle (300).
  {
    when: (ctx) => ctx.facts.totalMinutes >= 600,
    line: "A Arena pode interessar a quem já viveu tanto tempo no Reino.",
  },
  // Depois de vários Bosses — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 3,
    line: "Os moradores parecem comentar suas vitórias na Taverna.",
  },
  // Depois de várias regiões — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= 5,
    line: "Talvez existam novas histórias na Casa dos Viajantes.",
  },
  // Depois de ler livros — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.booksRead >= 4,
    line: "O Museu pode complementar essas descobertas.",
  },
  // Depois de abrir o Bestiário (creaturesViewed>0 já prova visita
  // real, sem depender de PlayerMemory) — exemplo quase literal do
  // brief.
  {
    when: (ctx) => ctx.creaturesViewed >= 4,
    line: "A Biblioteca possui registros relacionados.",
  },
  // Approach — eixo comportamental da expedição atual (Investigador
  // tende a reparar em detalhe, Continue tende a manter o ritmo);
  // nunca repete o texto de Expedition Specialization pro mesmo eixo.
  {
    when: (ctx) => ctx.approach === "investigate",
    line: "Registros mais detalhados de expedições costumam aparecer na Biblioteca.",
  },
  {
    when: (ctx) => ctx.approach === "continue",
    line: "Novas expedições sempre esperam por quem segue em frente no Portão Norte.",
  },
  // Jogador novo — fallback garantido, sempre por último. Exemplo
  // literal do brief.
  {
    when: () => true,
    line: "Talvez seja uma boa ideia conhecer o Bestiário.",
  },
];

// Pura: mesma entrada, mesma saída, sempre. Sempre retorna UMA
// recomendação (nunca null, nunca lista) — nenhum componente decide
// sozinho.
export function getRecommendedSurface(ctx: LiveGuideContext): string {
  const rule = SURFACE_RULES.find((r) => r.when(ctx));
  return (rule ?? SURFACE_RULES[SURFACE_RULES.length - 1]).line;
}
