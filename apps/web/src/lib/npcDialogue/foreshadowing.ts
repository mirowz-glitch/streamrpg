// Sprint Discovery Loop Phase I (Foreshadowing) — camada centralizada,
// sem estado próprio, sem persistência: responde só "o que este jogador
// ainda não viu, mas o mundo pode comentar?". Mesmo padrão de
// recognition.ts's getHabitLine (memoryKey por regra, marcada por quem
// chama — NpcIntro — assim que exibida, nunca aqui). Cada linha aponta
// pra um id/slug REAL já existente em outro catálogo (nunca um texto
// solto inventado sem conexão):
//
// - lobo-alfa / o-lobo-marcado (lib/bestiary.ts, criaturas raras já
//   escritas, ambas "locked" pra todo mundo — nenhum risco de estragar
//   algo que alguém já viu, porque ninguém ainda vê o conteúdo delas).
// - a-dragoa-dos-picos-eternos (lib/bestiary.ts, idem, locked).
// - presa-do-alfa (itemSlug já conectado a lobo-alfa em bestiary.ts).
// - tratado-da-matilha (lib/library.ts, livro real e desbloqueado).
// - monumento-coluna-dos-nomes (lib/museum.ts, registro real e
//   desbloqueado — "Coluna dos Nomes").
// - As Ruínas Antigas (lib/ruins.ts) — catálogo inteiro nunca renderizado
//   em nenhuma tela do jogo ainda (confirmado: zero componentes o
//   importam), então é seguro pra qualquer jogador, sempre.
//
// Gates só usam sinais já confiáveis o bastante pra nunca soar como
// spoiler de algo já visto: flags "nunca abriu a categoria inteira"
// (first_bestiary_entry/museum_first_visit) em vez de tentar rastrear
// uma criatura/livro específico (Personal Timeline tem só 20 posições,
// não seria confiável pra isso) — e contagens agregadas já usadas em
// outras Sprints (regionsDiscovered/booksRead/bossesDefeated).
import { hasRemembered } from "../playerMemory";
import type { HabitContext } from "./recognition";

interface ForeshadowRule {
  memoryKey: string;
  when: (ctx: HabitContext) => boolean;
  line: string;
}

const FORESHADOW_RULES: Record<string, ForeshadowRule[]> = {
  ferreiro: [
    {
      memoryKey: "foreshadow_ferreiro_presa_do_alfa",
      when: () => !hasRemembered("first_bestiary_entry"),
      line: "Já ouvi falar de uma presa de lobo que ninguém trouxe até mim ainda. Bicho deve ser grande.",
    },
  ],
  erudito: [
    {
      memoryKey: "foreshadow_erudito_lobo_marcado",
      when: () => !hasRemembered("first_bestiary_entry"),
      line: "Tem um lobo por aí que ninguém consegue encurralar. Ainda não documentei.",
    },
    {
      memoryKey: "foreshadow_erudito_dragoa_picos",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Dizem que existe uma criatura enorme nos Picos. Ninguém provou ainda.",
    },
  ],
  bibliotecaria: [
    {
      memoryKey: "foreshadow_biblioteca_tratado_matilha",
      when: (ctx) => ctx.booksRead === 0,
      line: "Existe um livro antigo sobre lobos, se algum já cruzou seu caminho.",
    },
  ],
  curador: [
    {
      memoryKey: "foreshadow_museu_coluna_dos_nomes",
      when: () => !hasRemembered("museum_first_visit"),
      line: "Tem um monumento aqui que intriga mais gente do que devia.",
    },
  ],
  viajante: [
    {
      memoryKey: "foreshadow_idris_terras_desconhecidas",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Tem terra por aí que eu ainda não entendi direito, mesmo depois de tantas viagens.",
    },
  ],
  guarda: [
    {
      memoryKey: "foreshadow_guarda_ruinas",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Tem gente que entra nas Ruínas... nem todo mundo volta.",
    },
  ],
  taverneira: [
    {
      memoryKey: "foreshadow_taverna_primeiro_boss",
      when: (ctx) => ctx.bossesDefeated === 0,
      line: "Dizem que ninguém esquece o primeiro Boss que vê. Você ainda vai descobrir.",
    },
  ],
  mestreArena: [
    {
      memoryKey: "foreshadow_arena_boss",
      when: (ctx) => ctx.bossesDefeated === 0,
      line: "Ainda não sabe o que é encarar um Boss de verdade. Vai saber, uma hora dessas.",
    },
  ],
};

export interface ForeshadowResult {
  line: string;
  memoryKey: string;
}

// Pura na leitura (hasRemembered só lê) — mesmo contrato de
// getHabitLine: quem chama decide quando marcar `memoryKey` como visto.
export function getForeshadowLine(npcKey: string, ctx: HabitContext): ForeshadowResult | null {
  const rules = FORESHADOW_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}
