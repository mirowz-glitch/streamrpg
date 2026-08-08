/**
 * Sprint 15 — Sockets + Gem System (Foundation). Funções puras sobre
 * `SocketConfiguration` — criação determinística (Fase 4), derivação
 * de grupos (Fase 5), nenhuma delas lê/escreve banco.
 */
import type { Socket, SocketColor, SocketConfiguration, SocketGroup, SocketLink, SocketShape } from "./types.js";
import { MAX_SOCKETS } from "./types.js";

const SOCKET_COLORS: SocketColor[] = ["red", "green", "blue", "white", "prismatic"];
const SOCKET_SHAPES: SocketShape[] = ["round", "square", "hex"];

// Mesmo espírito de `stableHashForPotential` (itemization/types.ts,
// Sprint 11) — um hash determinístico simples, nunca `itemgen/rng.ts`
// (reservado a loot/combate, D1). A MESMA seed do Item Generator
// sempre produz a MESMA contagem de Sockets — nenhuma nova fonte de
// aleatoriedade de gameplay.
function stableHashForSockets(seed: number, salt: number): number {
  let hash = (seed ^ salt) | 0;
  hash = (Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) | 0) >>> 0;
  hash = (Math.imul(hash ^ (hash >>> 16), 0x45d9f3b) | 0) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
}

/**
 * Fase 4 — "Preparar suporte para 0 1 2 3 4 5 6 sockets. Ainda sem
 * distribuição final." Distribuição UNIFORME (0-6, todas as 7
 * contagens igualmente prováveis) — deliberadamente não calibrada,
 * mesmo espírito de `derivePotentialFromSeed` na Sprint 11 (ponto de
 * partida honesto, nunca uma curva de balanceamento real). A Sprint
 * que decidir a distribuição de verdade substitui só esta função —
 * nenhum outro código depende da fórmula interna.
 */
export function deriveSocketCountFromSeed(seed: number): number {
  return stableHashForSockets(seed, 0x5c) % (MAX_SOCKETS + 1);
}

/**
 * Cria uma `SocketConfiguration` nova com `count` Sockets vazios,
 * cor/forma determinísticas a partir do MESMO seed (nunca duas cores
 * diferentes pra mesma seed em execuções diferentes). Sem links —
 * nenhum item nasce pré-linkado nesta Sprint (Fase 5: "sem bônus, sem
 * efeitos, apenas persistência" — criar links no nascimento seria
 * inventar uma regra de distribuição que o brief não pediu).
 */
export function createSocketConfiguration(count: number, seed: number): SocketConfiguration {
  const clamped = Math.max(0, Math.min(MAX_SOCKETS, count));
  const sockets: Socket[] = [];
  for (let i = 0; i < clamped; i++) {
    const colorIdx = stableHashForSockets(seed, i * 2 + 1) % SOCKET_COLORS.length;
    const shapeIdx = stableHashForSockets(seed, i * 2 + 2) % SOCKET_SHAPES.length;
    sockets.push({
      id: `socket-${i + 1}`,
      color: SOCKET_COLORS[colorIdx]!,
      shape: SOCKET_SHAPES[shapeIdx]!,
      state: "empty",
    });
  }
  return { sockets, links: [] };
}

/**
 * Marca um Socket como preenchido/vazio — pura, devolve uma
 * `SocketConfiguration` nova (nunca muta a recebida, mesmo princípio
 * de `appendItemHistoryEvent`). Quem persiste decide quando escrever
 * de volta.
 */
export function setSocketState(config: SocketConfiguration, socketId: string, state: Socket["state"]): SocketConfiguration {
  return {
    ...config,
    sockets: config.sockets.map((s) => (s.id === socketId ? { ...s, state } : s)),
  };
}

/**
 * Fase 5 — deriva os grupos de Sockets conectados transitivamente por
 * `links`, SEMPRE a partir de `links` (nunca um segundo dado
 * persistido em paralelo — "não duplicar persistência", diretriz
 * permanente do brief). Sockets sem nenhum link viram grupos de 1.
 */
export function deriveSocketGroups(config: SocketConfiguration): SocketGroup[] {
  const parent = new Map<string, string>();
  for (const socket of config.sockets) parent.set(socket.id, socket.id);

  function find(id: string): string {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    return root;
  }
  function union(a: string, b: string): void {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent.set(rootA, rootB);
  }

  for (const link of config.links) {
    const [a, b] = link.socketIds;
    if (parent.has(a) && parent.has(b)) union(a, b);
  }

  const groups = new Map<string, string[]>();
  for (const socket of config.sockets) {
    const root = find(socket.id);
    const group = groups.get(root) ?? [];
    group.push(socket.id);
    groups.set(root, group);
  }
  return [...groups.values()];
}

/** Anexa um link novo entre dois Sockets do MESMO item — pura, nunca duplica um link já existente (mesmo par, em qualquer ordem). */
export function addSocketLink(config: SocketConfiguration, socketIdA: string, socketIdB: string): SocketConfiguration {
  const exists = config.links.some(
    (l) => (l.socketIds[0] === socketIdA && l.socketIds[1] === socketIdB) || (l.socketIds[0] === socketIdB && l.socketIds[1] === socketIdA),
  );
  if (exists) return config;
  const link: SocketLink = { socketIds: [socketIdA, socketIdB] };
  return { ...config, links: [...config.links, link] };
}
