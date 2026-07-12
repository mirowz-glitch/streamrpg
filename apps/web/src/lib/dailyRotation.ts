// Sprint Living World (Phase I) — utilitário genérico e reutilizável
// pra "pequenas rotações" determinísticas por dia (ou por uma fração
// do dia), sem nenhum backend novo. Mesma ideia já usada por
// EventOfTheDaySystem (apps/api): `Math.floor(now / bucketMs)` dá o
// mesmo índice pra todo mundo, o dia inteiro (ou a fração escolhida),
// e muda sozinho quando o relógio vira — nenhuma tabela, nenhum timer
// próprio, nenhum estado pra perder ou duplicar.
const DAY_MS = 24 * 60 * 60 * 1000;

// Escolhe um item de uma lista, determinístico dentro do intervalo de
// tempo `bucketMs` (por padrão, um dia inteiro). `salt` desloca o
// índice — usado só quando duas rotações de mesmo tamanho de lista não
// deveriam sempre cair no mesmo item no mesmo dia.
export function pickByTime<T>(items: readonly T[], bucketMs: number = DAY_MS, salt = 0, now: number = Date.now()): T {
  const bucketIndex = Math.floor(now / bucketMs) + salt;
  return items[bucketIndex % items.length];
}

// Atalho pro caso mais comum: um item novo por dia (UTC).
export function pickOfTheDay<T>(items: readonly T[], salt = 0, now?: number): T {
  return pickByTime(items, DAY_MS, salt, now);
}

// Sprint World Simulation Phase I — refatoração de dívida técnica: esta
// função existia copiada de forma idêntica em três lugares (NpcIntro.tsx,
// environmentalStorytelling.ts, npcDialogue/livingConversations.ts),
// cada um com seu próprio `function keySalt`. Movida pra cá, junto do
// resto da infraestrutura de rotação que ela sempre serviu — soma
// simples dos char codes de uma chave, só pra dar um "salt" estável (dois
// `pickOfTheDay` de mesmo tamanho de lista não caem sempre no mesmo
// índice no mesmo dia).
export function keySalt(key: string): number {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum;
}

export interface RotatingVariant<Ctx> {
  // Só variantes reativas usam isso — todas as demais são fixas e
  // entram na rotação diária abaixo.
  when?: (ctx: Ctx) => boolean;
  line: string;
}

// Sprint Living City (Ambient Life Phase I) — dívida técnica encontrada
// na auditoria: este algoritmo de resolução ("a primeira variante
// condicional que bate vence; senão, rotação diária entre as variantes
// fixas") estava copiado de forma idêntica em
// environmentalStorytelling.ts e worldSimulation.ts, e cityAmbientState.ts
// estava prestes a criar uma terceira cópia. Centralizado aqui, junto
// do resto da infraestrutura de rotação que ele sempre consumiu
// (`pickOfTheDay`) — os três arquivos agora chamam esta função em vez
// de reimplementá-la.
export function resolveRotatingLine<Ctx>(variants: readonly RotatingVariant<Ctx>[] | undefined, ctx: Ctx, salt: number): string | null {
  if (!variants || variants.length === 0) return null;
  const conditional = variants.find((v) => v.when && v.when(ctx));
  if (conditional) return conditional.line;
  const fixed = variants.filter((v) => !v.when);
  if (fixed.length === 0) return null;
  return pickOfTheDay(fixed, salt).line;
}
