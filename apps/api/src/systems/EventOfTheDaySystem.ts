/**
 * EventOfTheDaySystem — Sprint Kingdom Events (MVP)
 *
 * Camada puramente ambiental: um evento "do dia", igual para todo o
 * Reino, nunca concede XP/Gold/item, nunca altera gameplay — só
 * ambientação (mesmo espírito do Jornal do Reino, KingdomNewsSystem).
 *
 * Ao contrário dos outros Systems deste projeto, este NÃO reage a
 * nenhum evento do EventBus — não existe "acontecimento" que dispare a
 * troca do evento do dia, é o próprio calendário que dita a troca. Por
 * isso não tem `register(bus)`: é determinístico, calculado a partir do
 * timestamp atual, sem nenhum estado para perder ou duplicar.
 *
 * Determinístico por data (dias desde a época Unix, UTC): o mesmo dia
 * sempre resolve para o mesmo evento, para qualquer jogador, mesmo após
 * reiniciar o servidor — nenhuma tabela nova, nenhum timer próprio.
 * "Tempo restante" é sempre até a próxima virada de dia (UTC).
 */
import type { CurrentWorldEventNpcComment, CurrentWorldEventResponse, WorldEventCategory } from "@streamrpg/shared";

interface WorldEventDefinition {
  name: string;
  icon: string;
  description: string;
  durationLabel: string;
  category: WorldEventCategory;
}

const WORLD_EVENTS: WorldEventDefinition[] = [
  // ---- Clima (☀) ----
  { name: "Neblina Espessa", icon: "☀", description: "A cidade acordou coberta por uma névoa incomum.", durationLabel: "Até o meio-dia", category: "clima" },
  { name: "Sol Forte", icon: "☀", description: "O calor incomoda até os mais acostumados.", durationLabel: "O dia todo", category: "clima" },
  { name: "Chuva Fina", icon: "☀", description: "Uma chuva leve e constante cobre o Reino.", durationLabel: "Boa parte do dia", category: "clima" },
  { name: "Vento Forte", icon: "☀", description: "Bandeiras e toldos batem sem parar.", durationLabel: "Algumas horas", category: "clima" },
  { name: "Céu Limpo", icon: "☀", description: "Não há uma nuvem sequer no céu hoje.", durationLabel: "O dia todo", category: "clima" },
  { name: "Geada da Manhã", icon: "☀", description: "As pedras da praça amanheceram cobertas de gelo fino.", durationLabel: "Só de manhã", category: "clima" },
  { name: "Ar Parado", icon: "☀", description: "Nem uma brisa se move hoje. Estranhamente quieto.", durationLabel: "O dia todo", category: "clima" },

  // ---- Celebrações (🎉) ----
  { name: "Festival da Colheita", icon: "🎉", description: "Cestas de frutas decoram as portas da Capital.", durationLabel: "O dia todo", category: "celebracoes" },
  { name: "Dia da Fundação", icon: "🎉", description: "Pequenas bandeiras enfeitam as ruas em homenagem ao Reino.", durationLabel: "O dia todo", category: "celebracoes" },
  { name: "Noite de Fogueiras", icon: "🎉", description: "Fogueiras pequenas foram acesas por toda a praça.", durationLabel: "A noite toda", category: "celebracoes" },
  { name: "Feira Improvisada", icon: "🎉", description: "Barracas extras se instalaram perto do mercado.", durationLabel: "Até o entardecer", category: "celebracoes" },
  { name: "Dança na Praça", icon: "🎉", description: "Alguns moradores organizaram uma dança simples na praça central.", durationLabel: "Ao entardecer", category: "celebracoes" },
  { name: "Comemoração Sem Motivo", icon: "🎉", description: "Ninguém sabe ao certo por que estão comemorando. Estão mesmo assim.", durationLabel: "A noite toda", category: "celebracoes" },

  // ---- Reino (👑) ----
  { name: "Dia do Fundador", icon: "👑", description: "Os moradores lembram os primeiros aventureiros.", durationLabel: "O dia todo", category: "reino" },
  { name: "Visita Inesperada", icon: "👑", description: "Um mensageiro de outro Reino foi visto na Capital.", durationLabel: "Algumas horas", category: "reino" },
  { name: "Bandeiras Novas", icon: "👑", description: "As bandeiras do Reino foram trocadas por outras, recém-costuradas.", durationLabel: "Permanente, mas ninguém falou nada", category: "reino" },
  { name: "Silêncio no Salão", icon: "👑", description: "A Guilda ficou incomumente quieta hoje.", durationLabel: "O dia todo", category: "reino" },
  { name: "Reunião Fechada", icon: "👑", description: "Elenya se reuniu com alguns poucos, a portas fechadas.", durationLabel: "Algumas horas", category: "reino" },
  { name: "Conselho do Reino", icon: "👑", description: "Rumores de uma reunião importante circulam pela Capital.", durationLabel: "Boa parte do dia", category: "reino" },

  // ---- Militar (⚔) ----
  { name: "Guardas Reforçados", icon: "⚔", description: "Os portões permanecem mais vigiados.", durationLabel: "O dia todo", category: "militar" },
  { name: "Treino Coletivo", icon: "⚔", description: "Vários aventureiros treinam juntos na Arena hoje.", durationLabel: "A tarde toda", category: "militar" },
  { name: "Alerta Silencioso", icon: "⚔", description: "A Guarda parece mais atenta que o normal, sem explicar o motivo.", durationLabel: "O dia todo", category: "militar" },
  { name: "Ronda Extra", icon: "⚔", description: "Uma segunda ronda foi organizada pela muralha.", durationLabel: "A noite toda", category: "militar" },
  { name: "Kade Sem Descanso", icon: "⚔", description: "Kade não parou de treinar desde o amanhecer.", durationLabel: "O dia todo", category: "militar" },

  // ---- Natureza (🌲) ----
  { name: "Migração dos Corvos", icon: "🌲", description: "Centenas de corvos sobrevoam o Reino.", durationLabel: "O dia todo", category: "natureza" },
  { name: "Floração Repentina", icon: "🌲", description: "Flores desabrocharam fora de época pelas bordas da Capital.", durationLabel: "Alguns dias", category: "natureza" },
  { name: "Enxame de Vagalumes", icon: "🌲", description: "Pequenas luzes piscam pela praça ao anoitecer.", durationLabel: "À noite", category: "natureza" },
  { name: "Silêncio dos Bichos", icon: "🌲", description: "Nenhum pássaro cantou hoje. Ninguém sabe por quê.", durationLabel: "O dia todo", category: "natureza" },
  { name: "Cheiro de Chuva na Terra", icon: "🌲", description: "O ar carrega um cheiro forte de terra molhada.", durationLabel: "A manhã toda", category: "natureza" },
  { name: "Folhas Fora de Época", icon: "🌲", description: "Árvores derrubam folhas num período estranho do ano.", durationLabel: "Alguns dias", category: "natureza" },

  // ---- Cidade (🏛) ----
  { name: "Limpeza da Praça", icon: "🏛", description: "Os moradores passaram a manhã organizando a praça.", durationLabel: "Até o meio-dia", category: "cidade" },
  { name: "Reparo na Muralha", icon: "🏛", description: "Trabalhadores consertam uma rachadura antiga na muralha.", durationLabel: "O dia todo", category: "cidade" },
  { name: "Mercado Cheio", icon: "🏛", description: "Mais gente que o normal circula entre as barracas.", durationLabel: "O dia todo", category: "cidade" },
  { name: "Rua Interditada", icon: "🏛", description: "Uma rua foi fechada para reparos, sem aviso prévio.", durationLabel: "Algumas horas", category: "cidade" },
  { name: "Sino Consertado", icon: "🏛", description: "Alguém finalmente ajustou o sino da torre. Quase ninguém notou.", durationLabel: "Permanente", category: "cidade" },
  { name: "Poço Limpo", icon: "🏛", description: "O poço da Vila do Bosque foi limpo pela primeira vez em anos.", durationLabel: "O dia todo", category: "cidade" },

  // ---- Cultura (📚) ----
  { name: "Semana da Biblioteca", icon: "📚", description: "Miriam separou livros raros para exposição.", durationLabel: "A semana toda", category: "cultura" },
  { name: "Contação de Histórias", icon: "📚", description: "Um contador de histórias itinerante parou na Capital.", durationLabel: "A noite toda", category: "cultura" },
  { name: "Exposição Nova no Museu", icon: "📚", description: "Alaric organizou uma pequena exposição temporária.", durationLabel: "Alguns dias", category: "cultura" },
  { name: "Concurso de Poesia", icon: "📚", description: "Alguns moradores decidiram, por conta própria, competir em versos.", durationLabel: "A tarde toda", category: "cultura" },
  { name: "Dia da Escrita", icon: "📚", description: "Miriam incentivou os visitantes a escreverem algo, qualquer coisa.", durationLabel: "O dia todo", category: "cultura" },
  { name: "Relato Reescrito", icon: "📚", description: "Um velho relato da Biblioteca foi encontrado com uma versão diferente da história.", durationLabel: "Permanente", category: "cultura" },

  // ---- Taverna (🍺) ----
  { name: "Festival da Cerveja", icon: "🍺", description: "A Taverna está mais barulhenta que o normal.", durationLabel: "A noite toda", category: "taverna" },
  { name: "Mesa Cheia", icon: "🍺", description: "Todas as mesas da Taverna estão ocupadas hoje.", durationLabel: "A noite toda", category: "taverna" },
  { name: "Música ao Vivo", icon: "🍺", description: "Alguém trouxe um instrumento para tocar na Taverna.", durationLabel: "A noite toda", category: "taverna" },
  { name: "Brinde Coletivo", icon: "🍺", description: "Um brinde geral tomou conta da Taverna, sem motivo claro.", durationLabel: "Uma noite", category: "taverna" },
  { name: "Silêncio Incomum", icon: "🍺", description: "A Taverna está mais quieta que o normal hoje.", durationLabel: "O dia todo", category: "taverna" },

  // ---- Mistérios (✨) ----
  { name: "Chuva de Estrelas", icon: "✨", description: "Durante a noite foi possível observar dezenas de estrelas cadentes.", durationLabel: "Uma noite", category: "misterios" },
  { name: "Luzes Distantes", icon: "✨", description: "Luzes fracas foram vistas na direção da Fortaleza Sombria.", durationLabel: "A noite toda", category: "misterios" },
  { name: "Eco Sem Origem", icon: "✨", description: "Um som distante ecoou pela Capital sem explicação.", durationLabel: "Algumas horas", category: "misterios" },
  { name: "Sombra na Torre", icon: "✨", description: "Moradores juram ter visto uma sombra na torre do relógio.", durationLabel: "Uma noite", category: "misterios" },
  { name: "Objeto Fora de Lugar", icon: "✨", description: "Um item apareceu num lugar onde ninguém o deixou.", durationLabel: "Permanente", category: "misterios" },
  { name: "Sonhos Repetidos", icon: "✨", description: "Vários moradores relatam ter tido o mesmo sonho essa semana.", durationLabel: "Alguns dias", category: "misterios" },
];

// Sprint NPCs Vivos/Living NPCs — comentário opcional por categoria
// (nunca por evento específico: 9 linhas cobrem os 53 eventos). "Nada
// obrigatório" — aqui sempre presente, por simplicidade, mas puramente
// decorativo, nunca lido por nenhuma mecânica.
const CATEGORY_COMMENTS: Record<WorldEventCategory, CurrentWorldEventNpcComment> = {
  clima: { npc_name: "Borin", npc_icon: "🛠️", text: "Não gosto quando o tempo fica desse jeito." },
  celebracoes: { npc_name: "Greta", npc_icon: "🍺", text: "Hoje a cidade está mais animada." },
  reino: { npc_name: "Elenya", npc_icon: "🏛️", text: "O Reino sempre tem algo acontecendo." },
  militar: { npc_name: "Roth", npc_icon: "🚪", text: "Bom ver todo mundo mais atento, pra variar." },
  natureza: { npc_name: "Yannick", npc_icon: "🔬", text: "Isso merece ser estudado com calma." },
  cidade: { npc_name: "Alaric", npc_icon: "🖼️", text: "Isso é digno de registro, quando o tempo passar." },
  cultura: { npc_name: "Miriam", npc_icon: "📚", text: "Um bom dia para os livros, esse." },
  taverna: { npc_name: "Greta", npc_icon: "🍺", text: "A Taverna nunca esteve tão cheia." },
  misterios: { npc_name: "Yannick", npc_icon: "🔬", text: "Prefiro não especular. Ainda." },
};

const DAY_MS = 24 * 60 * 60 * 1000;

export class EventOfTheDaySystem {
  getCurrentEvent(now: number): CurrentWorldEventResponse {
    const dayIndex = Math.floor(now / DAY_MS);
    const event = WORLD_EVENTS[dayIndex % WORLD_EVENTS.length];

    const nextRotation = (dayIndex + 1) * DAY_MS;
    const secondsRemaining = Math.max(0, Math.round((nextRotation - now) / 1000));

    return {
      name: event.name,
      icon: event.icon,
      description: event.description,
      duration_label: event.durationLabel,
      category: event.category,
      seconds_remaining: secondsRemaining,
      npc_comment: CATEGORY_COMMENTS[event.category] ?? null,
    };
  }
}
