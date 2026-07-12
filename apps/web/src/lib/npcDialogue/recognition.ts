// Sprint Recognition System (MVP) — camada opcional de condição sobre o
// catálogo de falas já existente (lib/npcDialogue/*). Não é reputação,
// não é relacionamento: cada NPC só reage a alguns dados reais que já
// existem no jogo (nível, Bosses derrotados, título equipado, cargo no
// Reino, regiões descobertas, primeira expedição, Gold, primeira visita
// à Cidade) — nunca um estado novo, nunca uma mecânica de afinidade.
//
// Quando nenhuma condição bate, quem chama (NpcIntro) continua caindo
// de volta na fala aleatória do catálogo de 100 falas — esta camada
// nunca substitui o catálogo, só tem prioridade quando bate.
//
// Sprint Reactive Layer Foundation — este contexto era a única definição
// de "fatos do jogador" no projeto; agora é um alias de PlayerFacts
// (lib/playerFacts.ts), a fonte única compartilhada com Feedback/Timeline,
// em vez de cada sistema declarar sua própria cópia do mesmo formato.
import type { EquipmentTier, PlayerFacts } from "../playerFacts";
import { hasRemembered } from "../playerMemory";
import type { CharacterStage } from "../characterPresence";

export type RecognitionContext = PlayerFacts;

interface RecognitionRule {
  when: (ctx: RecognitionContext) => boolean;
  lines: string[];
}

// Mesmo formato do catálogo atual (Record<npcKey, ...>), só que cada
// entrada é uma lista de regras avaliadas em ordem — a primeira regra
// cujo `when` bate decide a fala. "Algumas falas condicionais" (não
// dezenas): 2-3 níveis por NPC é suficiente para o efeito de
// reconhecimento pedido.
export const RECOGNITION_RULES: Record<string, RecognitionRule[]> = {
  // Borin — reage a Bosses derrotados (exemplo do próprio brief).
  ferreiro: [
    {
      when: (ctx) => ctx.bossesDefeated === 0,
      lines: ["Ainda não encarou um Boss? Vai chegar sua hora.", "Nunca enfrentou um Boss ainda. Isso muda, cedo ou tarde."],
    },
    {
      when: (ctx) => ctx.bossesDefeated === 1,
      lines: ["Então era verdade. Você voltou.", "Ouvi que enfrentou um Boss. Ainda inteiro, pelo visto."],
    },
    {
      when: (ctx) => ctx.bossesDefeated >= 2,
      lines: ["Já estou cansado de consertar sua armadura.", "Mais um Boss? Minha bigorna já reconhece seus equipamentos."],
    },
  ],

  // Talia — adora vender, reage a Gold.
  mercador: [
    { when: (ctx) => ctx.gold < 20, lines: ["Sem moeda, sem negócio. Mas eu espero.", "Volta quando tiver mais pra gastar."] },
    { when: (ctx) => ctx.gold >= 200, lines: ["Agora sim, um cliente de verdade.", "Com esse tanto de Gold, temos muito o que conversar."] },
  ],

  // Zoltar — "prevê o futuro", reage a nível.
  alquimista: [
    {
      when: (ctx) => ctx.level < 5,
      lines: ["Sinto que você ainda vai longe. Ou não. Difícil dizer.", "Você ainda tem muito caminho pela frente. Ou não. Quem sabe."],
    },
    {
      when: (ctx) => ctx.level >= 15,
      lines: ["Eu já sabia que você chegaria até aqui. Ou finjo que sabia.", "Previsível, você chegar tão longe. Pelo menos é o que digo agora."],
    },
  ],

  // Elenya — líder da Guilda, reage a cargo no Reino.
  guildmaster: [
    {
      when: (ctx) => !ctx.hasKingdomRole,
      lines: ["Ainda não ocupa nenhum cargo no Reino. Tudo bem, tem tempo.", "Seu nome ainda não está em nenhum cargo. Isso pode mudar."],
    },
    {
      when: (ctx) => ctx.hasKingdomRole,
      lines: ["O Reino já reconhece seu nome em algum cargo. Isso não é pouco.", "Já vi seu nome associado a um cargo por aqui. Bom trabalho."],
    },
  ],

  // Dorwin — exemplo exato do brief, reage a Gold.
  tesoureiro: [
    { when: (ctx) => ctx.gold < 20, lines: ["Economizar nunca fez mal."] },
    { when: (ctx) => ctx.gold >= 200, lines: ["Agora sim estamos falando de dinheiro."] },
  ],

  // Kade — Mestre da Arena, reage a Bosses derrotados.
  mestreArena: [
    { when: (ctx) => ctx.bossesDefeated === 0, lines: ["Nunca enfrentou um Boss? Treina mais, então.", "Sem Boss nenhum ainda. A Arena espera por você."] },
    {
      when: (ctx) => ctx.bossesDefeated >= 1 && ctx.bossesDefeated <= 2,
      lines: ["Já provou o gosto de uma vitória de verdade.", "Um Boss derrotado já conta história. Poucos chegam lá."],
    },
    { when: (ctx) => ctx.bossesDefeated >= 3, lines: ["Você já é um nome conhecido na Arena.", "Vários Bosses já. Comece a pensar em treinar os novatos."] },
  ],

  // Roth — Guarda do Portão Norte, reage a regiões descobertas. Sprint
  // Gameplay Presence Phase I — título de fundador (dado real, raro)
  // vem primeiro na lista: quando bate, tem prioridade sobre a
  // observação de regiões, sem removê-la pra quem não tem título.
  guarda: [
    {
      when: (ctx) => ctx.hasFounderTitle,
      lines: ["Poucos guardas confundiriam esse título com qualquer outro. Reconheço o peso dele.", "Vejo o título que carrega. Não é qualquer um que chega a ele."],
    },
    { when: (ctx) => ctx.regionsDiscovered <= 1, lines: ["Ainda não saiu muito da Capital, hein.", "Pouca região explorada ainda. Cuidado lá fora."] },
    { when: (ctx) => ctx.regionsDiscovered >= 5, lines: ["Já vi você voltar de tantas regiões que perdi a conta.", "Você conhece mais estrada que muito guarda veterano."] },
  ],

  // Greta — exemplo exato do brief, reage a primeira visita à Cidade
  // (reaproveita a flag "city_seen" já existente, nenhum contador novo).
  taverneira: [
    { when: (ctx) => ctx.isFirstCityVisit, lines: ["Nunca vi você por aqui."] },
    { when: (ctx) => !ctx.isFirstCityVisit, lines: ["De sempre? A mesa de costume continua livre."] },
  ],

  // Miriam — o brief pede "livros lidos", mas essa contagem não existe
  // em nenhum lugar do jogo (Biblioteca não rastreia leitura por
  // personagem). Substituído por título equipado — mesmo espírito
  // (reconhecer dedicação), só que com um dado que realmente existe.
  bibliotecaria: [
    { when: (ctx) => !ctx.hasEquippedTitle, lines: ["Quando tiver tempo... leia alguma coisa."] },
    {
      when: (ctx) => ctx.hasEquippedTitle,
      lines: ["Você é um dos poucos aventureiros que carregam um título com a mesma seriedade que um bom livro."],
    },
  ],

  // Yannick — biólogo/observador, reage a regiões descobertas.
  erudito: [
    { when: (ctx) => ctx.regionsDiscovered <= 2, lines: ["Ainda há tanto Reino que você não viu.", "Poucas regiões estudadas ainda. Há muito para observar."] },
    { when: (ctx) => ctx.regionsDiscovered >= 5, lines: ["Você já viu mais regiões do que a maioria dos estudiosos daqui.", "Suas viagens já renderiam um bom estudo."] },
  ],

  // Alaric — curador do Museu, reage a ter completado a primeira
  // expedição (o começo de uma "história própria").
  curador: [
    {
      when: (ctx) => !ctx.hasCompletedFirstExpedition,
      lines: ["Ainda não tem uma história própria pra contar. Ainda.", "Sem nenhuma expedição ainda. O Museu espera suas histórias."],
    },
    {
      when: (ctx) => ctx.hasCompletedFirstExpedition,
      lines: ["Sua primeira expedição já é, de certa forma, história.", "Toda jornada começa a virar história a partir da primeira expedição."],
    },
  ],
};

// Primeira regra cujo `when` bate, dentro da ordem declarada — as regras
// de cada NPC são mutuamente exclusivas por design (nunca duas batem ao
// mesmo tempo), então a ordem só importa como desempate defensivo.
export function getRecognitionLine(npcKey: string, ctx: RecognitionContext): string | null {
  const rules = RECOGNITION_RULES[npcKey];
  if (!rules) return null;
  const matched = rules.find((rule) => rule.when(ctx));
  if (!matched) return null;
  return matched.lines[Math.floor(Math.random() * matched.lines.length)];
}

// Sprint Reactive NPCs Phase I — segunda camada de reconhecimento,
// deliberadamente separada de RECOGNITION_RULES: nunca substitui a fala
// principal (recognitionLine ?? fallbackLine), só aparece como uma
// observação extra, pequena e rara, abaixo dela. Cada regra tem uma
// `memoryKey` própria — quem chama (NpcIntro) marca com
// playerMemory.remember(memoryKey) assim que exibe, então cada
// observação aparece no máximo uma única vez pra sempre (a forma mais
// simples de "raramente" com a primitiva booleana que playerMemory
// oferece). Hábitos vêm do Personal Timeline (contagens já registradas
// por BookReader/CreatureReader/StoryReader) ou de flags booleanas já
// gravadas por outras telas (museum_return_recorded, tavern_regular_recorded,
// traveller_listener_recorded — Sprint Reactive World Phase I).
export interface HabitContext {
  booksRead: number;
  creaturesViewed: number;
  hasEquippedItem: boolean;
  isFirstCityVisit: boolean;
  regionsDiscovered: number;
  // Sprint Gameplay Presence Phase I — dados reais já existentes, os
  // três só passados por quem já os tem à mão (nenhum novo fetch): tier
  // de equipamento (playerFacts.ts), categoria do evento atual do Reino
  // (worldState.current_event, só passada por TavernBuilding) e se
  // alguma criatura de perigo "letal" já foi vista (Personal Timeline).
  equipmentTier: EquipmentTier;
  worldEventCategory?: string;
  hasViewedRareCreature: boolean;
  // Sprint Discovery Loop Phase I (Foreshadowing) — único dado a mais
  // que o Foreshadowing precisa e o resto deste contexto ainda não
  // tinha; reaproveitado do mesmo PlayerFacts já montado em NpcIntro.
  bossesDefeated: number;
  // Sprint Living Consequences Phase I — idem, só o cargo no Reino
  // (playerFacts.hasKingdomRole) que faltava neste contexto.
  hasKingdomRole: boolean;
  // Sprint Hero Journey Phase I — quatro dados a mais que só esta
  // camada precisa e o resto do contexto ainda não tinha: minutos totais
  // (playerFacts.totalMinutes, proxy real de "muito tempo se passou"),
  // estágio de evolução (lib/characterPresence.ts, mesma camada central
  // já usada por Character/Guilda/Cidade — nunca recalculado aqui),
  // registros do Museu já abertos (Personal Timeline, mesmo padrão de
  // booksRead/creaturesViewed acima) e primeira expedição concluída
  // (playerFacts.hasCompletedFirstExpedition).
  totalMinutes: number;
  characterStage: CharacterStage;
  museumEntriesViewed: number;
  hasCompletedFirstExpedition: boolean;
}

interface HabitRule {
  memoryKey: string;
  when: (ctx: HabitContext) => boolean;
  line: string;
  // Só os "reconhecimentos importantes" pedidos pelo brief viram evento
  // no Personal Timeline — a maioria das regras não tem isso.
  timelineKind?: string;
}

const HABIT_RULES: Record<string, HabitRule[]> = {
  bibliotecaria: [
    {
      memoryKey: "habit_library_shown",
      when: (ctx) => ctx.booksRead >= 3,
      line: "Vejo que continua estudando.",
      timelineKind: "npc_library_comment",
    },
  ],
  erudito: [
    {
      memoryKey: "habit_bestiary_shown",
      when: (ctx) => ctx.creaturesViewed >= 3,
      line: "Ouvi dizer que anda registrando criaturas.",
      timelineKind: "npc_bestiary_comment",
    },
    {
      memoryKey: "habit_expedition_shown",
      when: (ctx) => ctx.regionsDiscovered >= 4,
      line: "Tem viajado bastante.",
    },
  ],
  curador: [
    {
      memoryKey: "habit_museum_shown",
      when: () => hasRemembered("museum_return_recorded"),
      line: "Pouca gente volta ao museu tantas vezes.",
    },
    // Sprint Gameplay Presence Phase I — reage a uma criatura de
    // periculosidade "letal" já vista (Personal Timeline, cruzado com
    // lib/bestiary.ts — nenhum dado inventado, só cruzamento de dois
    // catálogos que já existiam).
    {
      memoryKey: "habit_rare_creature_shown",
      when: (ctx) => ctx.hasViewedRareCreature,
      line: "Uma criatura daquele nível de perigo já registrada? Isso merece destaque no Museu.",
    },
  ],
  taverneira: [
    {
      memoryKey: "habit_tavern_shown",
      when: () => hasRemembered("tavern_regular_recorded"),
      line: "Já conhece metade dos frequentadores.",
    },
    // Sprint Gameplay Presence Phase I — reage à categoria do evento
    // atual do Reino (worldState.current_event.category, já existente,
    // só passado até aqui via TavernBuilding — nenhum fetch novo).
    {
      memoryKey: "habit_greta_event_shown",
      when: (ctx) => ctx.worldEventCategory === "taverna",
      line: "Foi o que ouvi: esse evento do Reino já virou assunto aqui dentro.",
    },
  ],
  viajante: [
    {
      memoryKey: "habit_traveller_shown",
      when: () => hasRemembered("traveller_listener_recorded"),
      line: "Você realmente gosta de ouvir histórias.",
      timelineKind: "npc_traveller_comment",
    },
  ],
  ferreiro: [
    // Sprint Gameplay Presence Phase I — substitui a observação genérica
    // de "tem algo equipado" por 3 momentos distintos, ligados à
    // raridade real do equipamento (playerFacts.equipmentTier). Cada
    // tier tem sua própria memoryKey — evoluir de tier em tier sempre
    // rende um comentário novo, nunca preso ao primeiro que já apareceu.
    {
      memoryKey: "habit_equipment_weak_shown",
      when: (ctx) => ctx.equipmentTier === "weak",
      line: "Isso aí mal seria uma faca de cozinha decente. Cuidado lá fora.",
    },
    {
      memoryKey: "habit_equipment_notable_shown",
      when: (ctx) => ctx.equipmentTier === "notable",
      line: "Já não é mais vergonha o que você carrega.",
    },
    {
      memoryKey: "habit_equipment_strong_shown",
      when: (ctx) => ctx.equipmentTier === "strong",
      line: "Isso sim é equipamento decente. Trata bem, ouviu?",
    },
  ],
};

// "Reconhecimento social" — um NPC menciona uma observação que outro já
// fez, secundária (`requiresKey` é a memoryKey de uma regra acima, ou de
// uma flag de outra Sprint) já registrada antes. Não é uma mecânica de
// relação nova: só reaproveita, em modo leitura, o mesmo playerMemory.
interface SocialRule {
  memoryKey: string;
  requiresKey: string;
  line: string;
}

const SOCIAL_RULES: Record<string, SocialRule[]> = {
  taverneira: [
    {
      memoryKey: "social_greta_borin_shown",
      requiresKey: "habit_equipment_shown",
      line: "Borin comentou que você passou por aqui.",
    },
  ],
  guarda: [
    {
      memoryKey: "social_roth_idris_shown",
      requiresKey: "traveller_listener_recorded",
      line: "Idris disse que você anda explorando bastante.",
    },
  ],
};

export interface HabitLineResult {
  line: string;
  memoryKey: string;
  timelineKind?: string;
}

// Função pura na leitura (hasRemembered só lê o localStorage, nunca
// escreve) — quem chama decide quando marcar `memoryKey` como visto e
// quando registrar `timelineKind`, no mesmo useEffect que já existe pra
// esse fim (mesmo padrão de MuseumBuilding/TavernBuilding).
export function getHabitLine(npcKey: string, ctx: HabitContext): HabitLineResult | null {
  const habitRules = HABIT_RULES[npcKey] ?? [];
  for (const rule of habitRules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey, timelineKind: rule.timelineKind };
    }
  }
  const socialRules = SOCIAL_RULES[npcKey] ?? [];
  for (const rule of socialRules) {
    if (!hasRemembered(rule.memoryKey) && hasRemembered(rule.requiresKey)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}
