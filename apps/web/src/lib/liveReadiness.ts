import type { UiFeedbackState } from "./uiFeedback";

// Sprint Live Readiness Phase I (First 5 Minutes) — camada única e
// central, completamente pura: "qual elemento desta tela merece
// destaque visual agora?". Nunca renderiza, nunca conhece componentes,
// nunca cria estado/fetch/backend novo — só decide QUAL(IS) chave(s)
// vence(m), reutilizando exclusivamente o vocabulário já existente em
// lib/uiFeedback.ts (highlight/attention/softGlow/subtleBorder). Nenhum
// componente decide sozinho: todos perguntam a esta camada.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// código, mapeando os 19 componentes/camadas listados no brief:
//
// 1) O que chama atenção IMEDIATAMENTE hoje: XpBar (cor + barra),
//    Encounter atual no ExpeditionPanel/Compact (ícone + texto em
//    destaque), GuideBubble (💬, mas só na primeira visita — some pra
//    sempre depois), FirstLevelBanner/FirstBossBanner/FirstItemCard
//    (só uma vez, onboarding). World Event highlight (`eventFeedbackCls`
//    em CityPage) e Legacy (`legacyFeedbackCls` em CharacterPage) já são
//    os ÚNICOS destaques "ui-feedback" reais hoje, e cada um decide
//    sozinho, sem saber do outro.
// 2) O que fica escondido abaixo da dobra: PlayerGoals (após BossCard +
//    cargos do Reino), Kingdom Reputation/Personal Chronicle (abaixo de
//    Legacy, sem NENHUM destaque visual mesmo quando o único hint
//    ativo), Region Gallery inteira (exige rolar toda a Praça),
//    Discovery Chain/Knowledge Thread (só aparecem dentro do Reader,
//    depois de abrir um livro/criatura/registro específico).
// 3) O que é só texto e passa despercebido: Expedition Evolution/
//    Journey/Region Identity/Specialization/Consequence (6 linhas
//    `.expedition-narrative` idênticas visualmente, nenhuma mais
//    importante que a outra hoje), World Presence/Environmental
//    Storytelling/World Simulation/Landmark Identity/City Ambient State
//    (todas `<p className="hint">` no mesmo estilo, se acumulam sem
//    hierarquia), Kingdom Memory nas 5 Buildings (texto plano).
// 4) O que poderia reaproveitar UI Feedback já existente: exatamente os
//    casos acima — nenhuma classe/animação nova é necessária, só uma
//    decisão de PRIORIDADE que hoje não existe.
// 5) O que aparece tarde demais: Legacy/Kingdom Reputation/Personal
//    Chronicle e o próprio Expedition Specialization (Sprint anterior)
//    só se revelam depois de minutos/horas de jogo real — para a
//    "vitrine" (Landing Page), isso significa que um espectador nos
//    primeiros 5 minutos NUNCA veria nenhum desses reagir; por isso a
//    Landing Page precisa de destaques SEMPRE presentes e determinísticos,
//    nunca dependentes de progresso real.
//
// DÍVIDA TÉCNICA ENCONTRADA (cálculo de prioridade duplicado) —
// eliminada nesta Sprint, cada um substituído por getSingleHighlight:
// - NpcIntro.tsx: `resolveFeedback(consequenceLine !== null, "attention")
//   ?? resolveFeedback(heroJourneyLine !== null, "softGlow")` — um
//   encadeamento de prioridade escrito à mão, só entre 2 dos 7 sinais
//   que o próprio componente já calcula.
// - MuseumBuilding.tsx: `resolveFeedback(collectionInsight !== null ||
//   placeMemory !== null, "softGlow")` — um OR entre 2 sinais tratados
//   como um só (nunca decide QUAL dos dois é o motivo do destaque).
// - CreatureReader.tsx: `resolveFeedback(echoLine !== null,
//   "subtleBorder")` — ignora Creature Ecology/Discovery Chain/
//   Knowledge Thread completamente, mesmo quando um deles é o sinal
//   real mais forte daquela visita.
// - CityPage.tsx (`eventFeedbackCls`) e CharacterPage.tsx
//   (`legacyFeedbackCls`): cada um já decide um booleano→estado
//   isoladamente, sem nenhuma noção de "e se outro sinal da mesma tela
//   também for elegível?" (Legacy sempre ganhava por padrão, nunca por
//   comparação real com Kingdom Reputation/Personal Chronicle).
//
// PersonalTimeline/PlayerMemory/PlayerFacts: nenhum dado novo — esta
// camada só recebe booleanos já calculados por quem chama (a partir de
// linhas que essas fontes já produzem), nunca os recalcula.
export type { UiFeedbackState };

// Arbitragem genérica nº1 — "existe mais de um candidato? só o de maior
// prioridade vence" (Personagem, Biblioteca, Bestiário, Museu,
// Expedição). Pura: mesma entrada, mesma saída, sempre.
export function getSingleHighlight<K extends string>(
  priorityOrder: readonly K[],
  candidates: Partial<Record<K, boolean>>,
): K | null {
  return priorityOrder.find((key) => candidates[key] === true) ?? null;
}

// Arbitragem genérica nº2 — "podem existir vários ao mesmo tempo, mas
// NUNCA mais que o limite" (Landing Page, distribuição da Praça). Pura,
// determinística: mesma entrada, mesma ordem, mesma saída, sempre —
// nunca sorteia, nunca pisca.
const MAX_SIMULTANEOUS_HIGHLIGHTS = 3;

export function getLiveHighlights<K extends string>(
  priorityOrder: readonly K[],
  candidates: Partial<Record<K, boolean>>,
  max: number = MAX_SIMULTANEOUS_HIGHLIGHTS,
): K[] {
  return priorityOrder.filter((key) => candidates[key] === true).slice(0, max);
}

// Prioridade global (brief, seção "Prioridade") — usada onde vários
// TIPOS de elemento (não variantes do mesmo elemento) disputam espaço:
// Landing Page (vitrine) e, futuramente, qualquer tela que precise
// decidir entre Expedição/Objetivo/NPC/Livro/Região/Bestiário/Museu ao
// mesmo tempo.
export const GLOBAL_HIGHLIGHT_PRIORITY = [
  "expedition",
  "playerGoal",
  "npc",
  "book",
  "region",
  "bestiary",
  "museum",
] as const;
export type GlobalHighlightKey = (typeof GLOBAL_HIGHLIGHT_PRIORITY)[number];

// Personagem — Legacy/Kingdom Reputation/Personal Chronicle já eram
// mutuamente exclusivos NO TEXTO (cada um só aparece quando bate sua
// própria regra), mas NUNCA no destaque visual: hoje só Legacy tem
// `legacyFeedbackCls`, sempre aplicado quando existe, sem checar se
// Kingdom Reputation/Personal Chronicle também existem. Esta ordem é a
// mesma prioridade já documentada em legacy.ts/personalChronicle.ts
// (Legacy = fato consolidado > Kingdom Reputation = boato em circulação
// > Personal Chronicle = retrospectiva).
export const CHARACTER_TRAIT_PRIORITY = ["legacy", "kingdomReputation", "personalChronicle"] as const;
export type CharacterTraitKey = (typeof CHARACTER_TRAIT_PRIORITY)[number];

// Cidade (Praça) — "distribuídos", nunca "apenas um" (diferença
// deliberada: aqui vários prédios podem viver ao mesmo tempo, até o
// limite de 3). NPC com Living Consequence fica de fora: esse sinal só
// existe hoje dentro do habitContext calculado DENTRO de cada NpcIntro
// (Personal Timeline por NPC) — replicá-lo no nível da Praça duplicaria
// exatamente a lógica que esta Sprint pede pra eliminar, não criar.
// Mantido como está (destaque próprio, local, dentro de cada NpcIntro).
export const CITY_SQUARE_PRIORITY = ["worldEvent", "expeditionActive", "kingdomMemory"] as const;
export type CitySquareKey = (typeof CITY_SQUARE_PRIORITY)[number];

// Biblioteca — Discovery Chain e Knowledge Thread já foram unificados
// deliberadamente em uma única linha "Próximo Passo" pela Sprint
// Knowledge Network (getNextSteps); Livro não tem função de Knowledge
// Threads própria (auditado então, continua true) — por isso não há
// uma chave "knowledgeThread" separada aqui, sob risco de reintroduzir
// a duplicação que aquela Sprint eliminou.
export const LIBRARY_HIGHLIGHT_PRIORITY = ["bookOfTheDay", "discoveryChain", "kingdomMemory", "expeditionEcho"] as const;
export type LibraryHighlightKey = (typeof LIBRARY_HIGHLIGHT_PRIORITY)[number];

// Bestiário — "nextSteps" representa Discovery Chain + Knowledge
// Thread já combinados (mesmo motivo acima; CreatureReader já chama
// getNextSteps para os dois juntos desde Knowledge Network Phase I).
export const BESTIARY_HIGHLIGHT_PRIORITY = ["creatureEcology", "nextSteps", "expeditionEcho", "collectionInsight"] as const;
export type BestiaryHighlightKey = (typeof BESTIARY_HIGHLIGHT_PRIORITY)[number];

// Museu — "mesmo comportamento" do Bestiário (brief), mas sem Creature
// Ecology/Expedition Echo (nenhum dos dois existe pra registros do
// Museu hoje — auditado em lib/expeditionEchoes.ts/creatureEcology.ts,
// nenhuma função cobre Museu).
export const MUSEUM_HIGHLIGHT_PRIORITY = ["nextSteps", "collectionInsight"] as const;
export type MuseumHighlightKey = (typeof MUSEUM_HIGHLIGHT_PRIORITY)[number];

// Expedição — "Approach" primeiro, de propósito: quando o jogador já
// escolheu Investigar/Seguir em frente, o badge "Estado" e a borda de
// acento (`.expedition-approach-*`, Expedition Choice Phase II/III) já
// são o próprio destaque visual daquela expedição — vencer aqui
// significa "não aplicar NENHUM outro estado ui-feedback", nunca
// empilhar um segundo brilho sobre o mesmo bloco (a checagem de
// conflito pedida no brief). Só quando Approach ainda não existe é que
// Evolution/Journey/Specialization/Region Identity/Consequence
// disputam entre si.
export const EXPEDITION_HIGHLIGHT_PRIORITY = [
  "approach",
  "evolution",
  "journey",
  "specialization",
  "regionIdentity",
  "consequence",
] as const;
export type ExpeditionHighlightKey = (typeof EXPEDITION_HIGHLIGHT_PRIORITY)[number];
