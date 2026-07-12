// Sprint Living Consequences Phase I — camada centralizada, sem estado
// próprio, sem persistência: responde "o que este jogador FEZ
// recentemente que o Reino poderia comentar?". Mesmo padrão exato de
// foreshadowing.ts (memoryKey por regra, marcada por quem chama —
// NpcIntro — assim que exibida) e mesmo HabitContext compartilhado por
// recognition.ts/foreshadowing.ts — nenhum contexto novo, nenhuma regra
// própria em nenhum componente.
//
// Diferença deliberada de Recognition (recognition.ts): Recognition diz
// "eu vejo quem você é" — persistente, reavaliada a cada visita, some
// se o estado mudar. Living Consequences diz "eu percebi o que você
// fez" — uma ação específica, no passado, comentada UMA vez e nunca
// mais (mesmo se a condição continuar verdadeira depois).
//
// Auditoria feita antes de escrever qualquer regra nova: comparei os 6
// exemplos do brief contra HABIT_RULES (recognition.ts, Sprint Reactive
// NPCs Phase I) pra nunca duplicar. Resultado: 3 dos 6 já existem lá —
// equipamento raro (ferreiro.equipmentTier), muita leitura
// (bibliotecaria.booksRead) e muitas visitas ao museu
// (curador.museum_return_recorded) — por isso NÃO viraram regra nova
// aqui. Os outros 3 (primeiro Boss/Greta, muitas regiões/Idris, cargo
// assumido/Roth) eram gaps reais.
import { hasRemembered } from "../playerMemory";
import type { HabitContext } from "./recognition";

interface ConsequenceRule {
  memoryKey: string;
  when: (ctx: HabitContext) => boolean;
  line: string;
}

const CONSEQUENCE_RULES: Record<string, ConsequenceRule[]> = {
  taverneira: [
    {
      memoryKey: "consequence_greta_primeiro_boss",
      when: (ctx) => ctx.bossesDefeated >= 1,
      line: "Ouvi dizer que alguém finalmente derrubou aquele monstro.",
    },
  ],
  viajante: [
    {
      memoryKey: "consequence_idris_muitas_regioes",
      when: (ctx) => ctx.regionsDiscovered >= 6,
      line: "Está ficando difícil encontrar lugares que você ainda não conheça.",
    },
  ],
  guarda: [
    {
      memoryKey: "consequence_roth_cargo_assumido",
      when: (ctx) => ctx.hasKingdomRole,
      line: "As pessoas começam a observar quem ocupa posições importantes.",
    },
  ],
};

export interface ConsequenceResult {
  line: string;
  memoryKey: string;
}

// Pura na leitura, mesmo contrato de getHabitLine/getForeshadowLine.
export function getConsequenceLine(npcKey: string, ctx: HabitContext): ConsequenceResult | null {
  const rules = CONSEQUENCE_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}
