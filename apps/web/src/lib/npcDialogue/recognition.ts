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
export interface RecognitionContext {
  level: number;
  gold: number;
  totalMinutes: number;
  hasEquippedItem: boolean;
  bossesDefeated: number;
  regionsDiscovered: number;
  hasCompletedFirstExpedition: boolean;
  hasEquippedTitle: boolean;
  hasKingdomRole: boolean;
  isFirstCityVisit: boolean;
}

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

  // Roth — Guarda do Portão Norte, reage a regiões descobertas.
  guarda: [
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
