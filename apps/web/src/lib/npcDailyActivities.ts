import { pickOfTheDay, keySalt } from "./dailyRotation";

// Sprint Living Kingdom Phase I (Daily NPC Activities) — camada nova,
// central, sem estado, sem persistência, sem backend/scheduler/clock/
// worker: "o que este NPC PARECE estar fazendo hoje?". Nunca fala,
// nunca reage ao jogador, nunca narra um evento — só uma atividade
// física ligada à própria profissão, determinística por dia.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// atividade, comparando 1 a 1 contra cada camada de NpcIntro pra
// garantir papel único:
// - Living Conversations (npcDialogue/livingConversations.ts): já é o
//   "piso" de sempre — uma FALA (`ConversationLine`, sempre entre
//   aspas na tela) sorteada por dia. Daily Activity é o NOVO piso,
//   abaixo dele: nunca uma fala, nunca entre aspas, sempre uma AÇÃO
//   física ("Está afiando...", nunca "Diz que...").
// - Recognition/Habit/Foreshadow/Hero Journey/Living Consequence: todas
//   reagem a PlayerFacts/HabitContext (o que o jogador fez). Daily
//   Activity nunca depende do jogador — a mesma atividade apareceria
//   pra qualquer jogador, no mesmo dia, pro mesmo NPC.
// - Honorific: é um tratamento vindo do ESTÁGIO do jogador (Character
//   Presence). Daily Activity nunca menciona o jogador.
// - Kingdom Memory/Kingdom Reputation/Legacy: são sobre o Reino ou o
//   jogador, nunca sobre o que um NPC individual está fazendo agora.
// - World Presence/World Simulation/City Ambient State/Environmental
//   Storytelling: são sobre o LUGAR (praça, ferreiro como prédio),
//   nunca sobre a PESSOA do NPC — Daily Activity é a primeira camada
//   sobre o próprio NPC como indivíduo fazendo algo.
// - REFACTOR OBRIGATÓRIO — nenhuma rotação diária duplicada encontrada:
//   `pickOfTheDay`/`keySalt` (lib/dailyRotation.ts) já são o único
//   helper de rotação determinística no projeto, reaproveitados tal
//   como estão, nenhuma cópia nova.
const ACTIVITIES_BY_NPC: Record<string, string[]> = {
  ferreiro: [
    "Está afiando uma espada antiga.",
    "Examina uma peça de armadura.",
    "Organiza ferramentas.",
    "Apaga a forja por alguns minutos.",
  ],
  taverneira: ["Enche novas canecas.", "Limpa o balcão.", "Conta moedas.", "Conversa com viajantes."],
  bibliotecaria: [
    "Organiza livros antigos.",
    "Anota alguma descoberta.",
    "Separa pergaminhos.",
    "Recoloca um livro na estante.",
  ],
  curador: ["Limpa uma vitrine.", "Observa um artefato.", "Anota um registro."],
  guarda: ["Observa a estrada.", "Confere o portão.", "Troca turno com outro guarda."],
  viajante: ["Desdobra mapas.", "Escreve notas.", "Marca uma rota."],
  mestreArena: ["Treina golpes.", "Reorganiza armas.", "Analisa um duelo."],
  guildmaster: ["Observa os aventureiros.", "Conversa discretamente.", "Analisa relatórios."],
  tesoureiro: ["Revisa documentos.", "Organiza registros.", "Confere o cofre.", "Anota um pagamento."],
  mercador: [
    "Reorganiza as mercadorias na prateleira.",
    "Confere o estoque.",
    "Negocia um preço com um fornecedor.",
    "Empacota itens novos.",
  ],
  alquimista: [
    "Mistura um novo composto.",
    "Rotula frascos.",
    "Observa uma reação borbulhante.",
    "Organiza ingredientes raros.",
  ],
  erudito: [
    "Examina anotações de campo.",
    "Cataloga uma nova observação.",
    "Organiza espécimes.",
    "Revisa desenhos de criaturas.",
  ],
};

// Pura: mesma entrada, mesmo dia, mesma saída. Nunca a última camada a
// decidir sozinha — NpcIntro só a consulta quando nenhuma camada
// pessoal/conversacional acima já tem algo a dizer nesta visita.
export function getNpcDailyActivity(npcKey: string): string | null {
  const activities = ACTIVITIES_BY_NPC[npcKey];
  if (!activities || activities.length === 0) return null;
  return pickOfTheDay(activities, keySalt(npcKey));
}
