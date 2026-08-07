import type { RareMapInstance } from "../raremap/types.js";
import type { CorruptedMap } from "../mapcorruption/types.js";
import type { WaystoneInstance } from "../waystone/types.js";

// Sprint 36 — Atlas Phase I. "O Atlas não cria mapas. O Atlas organiza
// mapas. O jogador escolhe qual explorar. O Atlas é persistente.
// Adventure continua exatamente igual." Todo tipo aqui é puro — "Sem
// persistência" (Fase 2) é levado a sério: nada neste módulo GUARDA
// estado entre chamadas; o que hoje pareceria "persistente" (Node
// desbloqueado/favorito/concluído) é sempre RECEBIDO de fora
// (`AtlasProgress`) e devolvido reconstruído (`AtlasState`), nunca
// mantido vivo aqui.

// Fase 3 — "AtlasConnection": alias, nunca uma segunda estrutura de
// aresta — mesmo princípio de `CorruptionModifier = MapModifierId`
// (Sprint 35, mapcorruption/types.ts). Uma conexão É o id do Node
// vizinho; o grafo real que a alimenta (`REGION_GRAPH`, regions.ts) já
// é não-direcionado e sem peso, então nenhum campo extra é necessário.
export type AtlasConnection = string;

// Fase 3 — "Cada Node possui: id, mapId, tier, completed, connections,
// favorite, unlocked." `id`/`mapId` são sempre o MESMO valor (mesma
// convenção 1:1 já usada por `MapDefinition.id === regionId`, Sprint
// 30) — dois campos porque o brief pede os dois nomes, nunca dois
// valores divergentes. `tier` reaproveita `MapDefinition.dangerLevel`
// (Sprint 30, que por sua vez já reaproveita `BIOME_PROGRESSION.order`,
// Enemy System original) — nunca uma escala nova. `unlocked`/
// `completed`/`favorite` nunca são guardados NESTE tipo entre chamadas
// — são sempre resolvidos na hora a partir de um `AtlasProgress`
// recebido (ver `atlasRegistry.ts`).
export interface AtlasNode {
  id: string;
  mapId: string;
  tier: number;
  completed: boolean;
  connections: AtlasConnection[];
  favorite: boolean;
  unlocked: boolean;
}

// Fase 2 — "AtlasState": o Atlas inteiro de um jogador, num instante —
// sempre RECONSTRUÍDO a partir de um `AtlasProgress`, nunca guardado
// como singleton mutável por este módulo (essa responsabilidade é de
// quem chama, nunca daqui).
export interface AtlasState {
  nodes: AtlasNode[];
}

// Fase 2 — "AtlasProgress": tudo que este módulo precisa RECEBER de
// fora pra resolver `unlocked`/`completed`/`favorite` de cada Node, sem
// nenhuma chamada própria a banco/sessão/Character. `unlockedMapIds`
// tem uma fonte real pronta (`AdventureTimeline.unlockedRegionIds`,
// presentation/types.ts) ou pode ser derivado puramente do nível do
// personagem (`deriveUnlockedMapIds()`, atlasRegistry.ts, reaproveita a
// MESMA régua de nível de `checkRegionUnlock()`). `completedMapIds`/
// `favoriteMapIds` NÃO têm nenhum produtor real no Engine ainda — nenhum
// sistema marca "Mapa concluído" hoje, e não existe persistência de
// preferência de jogador nesta Fase. Aceitos aqui como entrada honesta
// (o chamador decide o que sabe), nunca inventados internamente — mesmo
// princípio de "dado que falta, nunca lógica que falta" já usado em todo
// o projeto.
export interface AtlasProgress {
  unlockedMapIds: readonly string[];
  completedMapIds: readonly string[];
  favoriteMapIds: readonly string[];
}

// Fase 5 — o único dado que atravessa a fronteira Map Device -> Adventure.
// "Nunca duplicar lógica": carrega exatamente o que
// `createAdventureSession()` (adventure/session.ts, intocado) já recebe
// como `regionId` (aqui `mapId`, mesmo valor 1:1) + o 6º parâmetro
// opcional que as Sprints 34/35 já construíram (`RareMapInstance |
// CorruptedMap`) — nenhum campo novo, nenhuma lógica nova, só um
// envelope nomeado pronto pra um Map Device produzir e pra Adventure
// consumir.
export interface AdventureConfiguration {
  mapId: string;
  rareMap?: RareMapInstance | CorruptedMap;
}

// Fase 2 — "MapDevice": o estado mínimo de um dispositivo que ainda não
// recebeu nenhum Mapa — só existe pra dar um tipo próprio ao conceito
// "um Map Device pode ou não ter um Mapa carregado agora". Fase 4:
// "Nunca inicia Adventure. Nunca abre mapas. Nunca aplica combate" — um
// MapDevice é sempre um valor descartável, criado e consumido na hora,
// nunca uma entidade com ciclo de vida próprio.
//
// Sprint 37 — Waystones Phase I, Fase 4: "Map Device passa a aceitar
// WaystoneInstance... Continuar aceitando RareMap, CorruptedMap sem
// regressões." `loadedMap` alarga pra um terceiro tipo alternativo —
// todos os três já compartilham `.mapId`, o único campo que este tipo
// sempre precisou garantir.
export interface MapDevice {
  loadedMap?: RareMapInstance | CorruptedMap | WaystoneInstance;
}
