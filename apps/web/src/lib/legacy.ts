import type { PlayerFacts } from "./playerFacts";
import { getCharacterStage } from "./characterPresence";
import { buildCollectionInsightContext } from "./collectionInsights";
import { REGIONS } from "./regions";

// Sprint Legacy Phase I — camada central, sem estado, sem persistência,
// sem backend: "qual é a marca que este aventureiro já deixou no
// Reino?". O jogador vê NO MÁXIMO uma frase (nunca duas, nunca lista),
// decidida por prioridade fixa.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// regra, pra eliminar toda duplicação:
// - Character Presence (characterPresence.ts) já renderiza em
//   CharacterPage uma frase de "fama" contínua (STAGE_CHARACTER_
//   DESCRIPTION, reavaliada toda visita, sem memoryKey) combinando 6
//   sinais num único `characterStage`. Legacy NUNCA reusa esse texto —
//   quando uma regra de Legacy também depende de estágio (fama), exige
//   um segundo sinal ADICIONAL (ex.: "lenda" sozinho já é dito por
//   Character Presence; "lenda" + hasFounderTitle é uma afirmação mais
//   rara e diferente, nunca coberta lá).
// - Collection Insights (collectionInsights.ts) já renderiza em
//   CharacterPage uma frase de exploração (getRegionsInsight,
//   regionsDiscovered >= 8/11 = "boa parte do Reino") e, na Biblioteca,
//   uma frase de leitura (getLibraryInsight, booksRead >= 6). Toda
//   regra de Legacy que toca esses mesmos contadores exige um limiar
//   ESTRITAMENTE mais alto (regionsDiscovered === todas as 11 regiões,
//   nunca 8) ou uma combinação com um segundo sinal que Collection
//   Insights nunca olha (booksRead + hasEquippedTitle).
// - Hero Journey (heroJourney.ts) já tem uma fala do Alaric ("Poucos
//   visitantes voltam tantas vezes quanto você.") ligada a museu/tempo,
//   e do Roth ("É bom ver rostos conhecidos voltando aos portões.")
//   ligada a expedição/tempo — ambas por NPC, raras, memoryKey própria.
//   Legacy nunca usa `hasCompletedFirstExpedition` sozinho nem
//   `museumEntriesViewed` sozinho pelos mesmos motivos — quando usa
//   museu, é sempre dentro de uma combinação de 3 domínios (ver regra
//   "multi-domínio" abaixo), nunca isolado.
// - Living Consequences (livingConsequences.ts) já tem falas do Roth
//   (hasKingdomRole sozinho) e da Greta (bossesDefeated >= 1 sozinho).
//   Legacy nunca usa esses sinais ISOLADOS — sempre em COMBINAÇÃO
//   (hasKingdomRole + bossesDefeated altos ao mesmo tempo), uma
//   afirmação que nenhuma das duas regras sozinhas cobre.
// - Recognition (recognition.ts) reage por NPC a sinais isolados
//   (gold/level/regionsDiscovered/hasFounderTitle/etc.), sempre
//   substituindo a fala aleatória de UM NPC específico. Legacy nunca
//   fala pela boca de um NPC — é sempre uma observação impessoal, do
//   próprio Reino, na tela do Personagem.
//
// Conclusão da auditoria: nenhuma regra abaixo usa um sinal isolado que
// outra camada já verbaliza sozinho — todas exigem uma COMBINAÇÃO de
// 2+ sinais reais ou um limiar estritamente mais alto. Esse é
// exatamente o motivo de existir uma camada nova em vez de duplicar.
export interface LegacyContext {
  facts: PlayerFacts;
  booksRead: number;
  museumEntriesViewed: number;
  totalRegions: number;
}

export function buildLegacyContext(facts: PlayerFacts): LegacyContext {
  const insightCtx = buildCollectionInsightContext({ regionsDiscovered: facts.regionsDiscovered });
  return {
    facts,
    booksRead: insightCtx.booksRead,
    museumEntriesViewed: insightCtx.museumEntriesViewed,
    totalRegions: REGIONS.length,
  };
}

interface LegacyRule {
  when: (ctx: LegacyContext) => boolean;
  line: string;
}

// Ordem = prioridade: a primeira regra que bater decide, nunca duas ao
// mesmo tempo. Da mais rara pra mais comum — checado por raridade
// REAL, não só por "parece especial": atingir "lenda" em
// characterPresence.ts exige score>=10/10, o que matematicamente já
// implica hasKingdomRole=true E bossesDefeated>=6 (sem os dois, o
// score máximo possível é 9 = "heroi"). Por isso "fama" precisa vir
// ANTES de "autoridade+combate" — senão a regra de fama nunca
// acenderia (autoridade+combate sempre bateria primeiro). Achado
// durante o teste isolado desta Sprint, corrigido antes de entregar.
const LEGACY_RULES: LegacyRule[] = [
  // Fama — Character Presence já cobre o estágio "lenda" sozinho; aqui
  // exige também um Título de Fundador (dado real e raro de Identity).
  // A combinação mais rara de todas (score quase máximo + flag rara).
  {
    when: (ctx) => getCharacterStage(ctx.facts) === "lenda" && ctx.facts.hasFounderTitle,
    line: "Seu nome já é conhecido em algumas estradas.",
  },
  // Autoridade + combate — Living Consequences só verifica hasKingdomRole
  // sozinho (Roth); aqui exige também um histórico de combate real.
  {
    when: (ctx) => ctx.facts.hasKingdomRole && ctx.facts.bossesDefeated >= 6,
    line: "Guardas parecem lembrar de suas passagens.",
  },
  // Exploração — Collection Insights já cobre "boa parte do Reino" em
  // 8/11; aqui exige as 11 regiões, um patamar estritamente mais raro.
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= ctx.totalRegions,
    line: "Poucos aventureiros exploraram tantas terras.",
  },
  // Multi-domínio — exemplo exato do brief: presença reconhecida em 3
  // lugares independentes ao mesmo tempo (combate, museu, biblioteca).
  // Nenhuma camada existente combina 3 domínios assim.
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 2 && ctx.museumEntriesViewed >= 3 && ctx.booksRead >= 3,
    line: "Arena, Museu e Biblioteca já conhecem seu rosto.",
  },
  // Conhecimento — Collection Insights já cobre booksRead >= 6 sozinho;
  // aqui exige também um título equipado (Identity), combinação nova.
  {
    when: (ctx) => ctx.booksRead >= 6 && ctx.facts.hasEquippedTitle,
    line: "Alguns estudiosos já reconhecem seu interesse pelo conhecimento.",
  },
  // Equipamento — equipmentTier "strong" já é só um dos 6 sinais do
  // estágio de Character Presence, nunca verbalizado sozinho em nenhum
  // lugar; aqui combinado com nível alto, uma afirmação nova.
  {
    when: (ctx) => ctx.facts.equipmentTier === "strong" && ctx.facts.level >= 20,
    line: "Mercadores comentam sobre seu equipamento.",
  },
];

// Pura: mesma entrada, mesma saída, sempre.
export function getLegacyLine(facts: PlayerFacts): string | null {
  const ctx = buildLegacyContext(facts);
  const rule = LEGACY_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}
