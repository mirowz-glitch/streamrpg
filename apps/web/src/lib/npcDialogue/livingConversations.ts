import { pickOfTheDay, keySalt } from "../dailyRotation";

// Sprint Living Conversations Phase I — camada central, sem estado
// próprio, sem persistência: "sobre o que estes NPCs estariam
// conversando hoje?". Diferente de Recognition/Hero Journey/Living
// Consequences/Foreshadowing (todas reagem ao JOGADOR) — esta camada
// NUNCA olha pra PlayerFacts/HabitContext: é pura ambientação, o Reino
// continuando a existir independente de quem está de visita. Por isso
// não é gated por playerMemory (não é uma "descoberta" nem um
// "reconhecimento" pontual — é conversa contínua, plausível em
// qualquer visita), e sim por rotação determinística por dia, mesma
// técnica já usada em "Hoje está falando sobre..."/World Presence/
// Living World (pickOfTheDay) — muda a cada dia, nunca a cada render,
// nunca aleatório demais.
//
// Auditoria de relações reais: cruzei os catálogos de 100 falas de
// cada NPC (lib/npcDialogue/{borin,greta,miriam,idris,roth,kade,
// alaric,elenya}.ts) em busca de menções MÚTUAS — NPC A cita NPC B E
// NPC B cita NPC A de volta, prova de uma relação já estabelecida nos
// dois lados, nunca inventada do zero. 8 pares confirmados: 3 são os
// exemplos exatos do brief (Greta/Borin — cozinha da Taverna, balde da
// forja; Miriam/Idris — histórias e diários; Roth/Kade — caçadas
// antigas, treino) e 5 novos, com a mesma técnica de "frase capturada
// no meio de uma conversa", nunca contradizendo o que já está escrito:
// Miriam/Alaric (já discutem história com respeito mútuo — livro.ts/
// alaric.ts), Greta/Alaric (visita semanal, sempre sozinho, mesa
// guardada), Borin/Roth (lado a lado na Defesa do Portão Norte, nunca
// precisaram ser próximos depois), Greta/Elenya ("sabe mais do que
// aparenta", dos dois lados) e Borin/Elenya (confiança/liderança, dos
// dois lados). Pares descartados por citação de UM lado só (ex.:
// Elenya cita Idris, mas Idris nunca cita Elenya de volta; Dorwin↔
// Miriam também é mútuo e ficou de fora só pra manter "poucas e
// excelentes" — candidato natural pra uma Fase II) não viraram
// conversa aqui.
export interface ConversationLine {
  npcKey: string;
  aboutNpcKey: string;
  line: string;
}

interface ConversationPair {
  id: string;
  lines: [ConversationLine, ConversationLine];
}

const CONVERSATION_PAIRS: ConversationPair[] = [
  // Exemplo exato do brief.
  {
    id: "greta_borin_espada",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "ferreiro", line: "Borin ainda insiste que aquela espada pode ser salva." },
      { npcKey: "ferreiro", aboutNpcKey: "taverneira", line: "Greta exagera metade das histórias." },
    ],
  },
  // Exemplo exato do brief.
  {
    id: "miriam_idris_diario",
    lines: [
      { npcKey: "bibliotecaria", aboutNpcKey: "viajante", line: "Idris prometeu trazer outro diário." },
      { npcKey: "viajante", aboutNpcKey: "bibliotecaria", line: "Se eu encontrar mais alguma coisa, a Miriam nunca mais me deixa em paz." },
    ],
  },
  // Exemplo exato do brief.
  {
    id: "roth_kade_treino",
    lines: [
      { npcKey: "guarda", aboutNpcKey: "mestreArena", line: "Kade chama qualquer discussão de treinamento." },
      { npcKey: "mestreArena", aboutNpcKey: "guarda", line: "Roth leva tudo sério demais." },
    ],
  },
  // Novo — grounded em alaric.ts/miriam.ts ("discutimos sobre história
  // com frequência/respeito").
  {
    id: "miriam_alaric_datas",
    lines: [
      { npcKey: "bibliotecaria", aboutNpcKey: "curador", line: "Alaric ainda insiste que aquela data está errada nos registros." },
      { npcKey: "curador", aboutNpcKey: "bibliotecaria", line: "Miriam corrige minhas datas toda vez que passo pela Biblioteca." },
    ],
  },
  // Novo — grounded em alaric.ts/greta.ts (visita semanal, sempre
  // sozinho, mesa guardada sem perguntas).
  {
    id: "greta_alaric_mesa",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "curador", line: "Alaric já reservou a mesa de sempre pra esta semana." },
      { npcKey: "curador", aboutNpcKey: "taverneira", line: "Greta nunca me pergunta por que venho sempre sozinho. Agradeço por isso." },
    ],
  },
  // Novo — grounded em borin.ts/roth.ts (lado a lado na Defesa do
  // Portão Norte, "nunca precisamos ser" próximos depois).
  {
    id: "borin_roth_portao",
    lines: [
      { npcKey: "ferreiro", aboutNpcKey: "guarda", line: "Roth ainda lembra da Defesa do Portão Norte como se fosse ontem." },
      { npcKey: "guarda", aboutNpcKey: "ferreiro", line: "Borin nunca fala da Defesa do Portão Norte. Prefiro assim." },
    ],
  },
  // Novo — grounded em greta.ts/elenya.ts ("sabe mais do que aparenta",
  // dos dois lados).
  {
    id: "greta_elenya_sabe_tudo",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "guildmaster", line: "Elenya sabe mais do que deixa transparecer. Sempre soube." },
      { npcKey: "guildmaster", aboutNpcKey: "taverneira", line: "Greta ouve tudo antes de qualquer relatório chegar até mim." },
    ],
  },
  // Novo — grounded em borin.ts/elenya.ts (confiança/liderança, dos
  // dois lados).
  {
    id: "borin_elenya_confianca",
    lines: [
      { npcKey: "ferreiro", aboutNpcKey: "guildmaster", line: "Elenya lidera essa Guilda melhor do que eu lideraria uma forja com dois aprendizes." },
      { npcKey: "guildmaster", aboutNpcKey: "ferreiro", line: "Borin nunca promete o que não pode entregar. Isso vale mais que qualquer discurso." },
    ],
  },
];

// Índice npcKey -> falas em que ELE é quem fala (nunca o aboutNpcKey
// sozinho — cada fala só aparece na tela do NPC que a diz, nunca na do
// NPC citado).
const LINES_BY_SPEAKER: Record<string, ConversationLine[]> = {};
for (const pair of CONVERSATION_PAIRS) {
  for (const line of pair.lines) {
    (LINES_BY_SPEAKER[line.npcKey] ??= []).push(line);
  }
}

// Determinístico por dia — muda a cada dia, nunca a cada render. Sem
// playerMemory: ao contrário das outras camadas aditivas, esta nunca
// "se esgota" — o Reino continua conversando pra sempre, mesmo com um
// jogador extremamente avançado que já viu tudo o mais.
export function getLivingConversationLine(npcKey: string): ConversationLine | null {
  const candidates = LINES_BY_SPEAKER[npcKey];
  if (!candidates || candidates.length === 0) return null;
  return pickOfTheDay(candidates, keySalt(npcKey));
}
