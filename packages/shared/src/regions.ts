// Sprint Expedition System — grafo de regiões usado para mover
// personagens entre destinos válidos. Reaproveita exatamente as 11
// regiões já documentadas em docs/world-design/regions.md (mesmos ids
// já usados em apps/web/src/lib/regions.ts, Sprint World Simulation) e
// o grafo de conexão de docs/world-design/roads.md — nenhuma região
// nova, nenhuma estrada inventada.
//
// Simplificação deliberada: Última Coroa (a Capital, uma cidade — ver
// world-design/cities.md) não é um nó do grafo de viagem. roads.md já
// descreve a Capital como um "cruzamento" que todo caminho do segundo
// anel atravessa — aqui isso vira uma aresta implícita direta entre
// qualquer região do primeiro anel e qualquer região do segundo anel,
// em vez de modelar a parada na cidade como um nó de trânsito próprio.
// Isso não cria uma região nova nem contradiz roads.md, só resolve a
// travessia sem precisar de um nó de infraestrutura extra.
export interface RegionNode {
  id: string;
  name: string;
  neighbors: string[];
}

export const REGION_GRAPH: Record<string, RegionNode> = {
  "porto-do-amanhecer": {
    id: "porto-do-amanhecer",
    name: "Porto do Amanhecer",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada"],
  },
  "bosque-sussurrante": {
    id: "bosque-sussurrante",
    name: "Bosque Sussurrante",
    neighbors: [
      "porto-do-amanhecer",
      "colinas-aridas", // Trilha do Contrabandista (atalho já documentado)
      "pantano-podre",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro",
    ],
  },
  "pantano-podre": {
    id: "pantano-podre",
    name: "Pântano Podre",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "colinas-aridas",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro",
    ],
  },
  "colinas-aridas": {
    id: "colinas-aridas",
    name: "Colinas Áridas",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "pantano-podre",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro",
    ],
  },
  "planicie-dourada": {
    id: "planicie-dourada",
    name: "Planície Dourada",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro",
    ],
  },
  "minas-abandonadas": {
    id: "minas-abandonadas",
    name: "Minas Abandonadas",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"],
  },
  "litoral-quebrado": {
    id: "litoral-quebrado",
    name: "Litoral Quebrado",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"],
  },
  "picos-congelados": {
    id: "picos-congelados",
    name: "Picos Congelados",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"],
  },
  "deserto-de-vidro": {
    id: "deserto-de-vidro",
    name: "Deserto de Vidro",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"],
  },
  "ruinas-esquecidas": {
    id: "ruinas-esquecidas",
    name: "Ruínas Esquecidas",
    neighbors: ["minas-abandonadas", "litoral-quebrado", "picos-congelados", "deserto-de-vidro", "fortaleza-sombria"],
  },
  "fortaleza-sombria": {
    id: "fortaleza-sombria",
    name: "Fortaleza Sombria",
    neighbors: ["ruinas-esquecidas"],
  },
};

export const STARTING_REGION_ID = "porto-do-amanhecer";

export function getRegionName(id: string): string {
  return REGION_GRAPH[id]?.name ?? id;
}

export function getNeighbors(id: string): string[] {
  return REGION_GRAPH[id]?.neighbors ?? [];
}

export function allRegionIds(): string[] {
  return Object.keys(REGION_GRAPH);
}

// Region-Anchored Item Level — Implementation Validation Phase I.
//
// Item Level (a única entrada que generateItem() usa pra decidir Tier
// Eligibility — itemgen/generator.ts) deixava de crescer a partir de
// ~metade do jogo porque vinha do nível do PERSONAGEM (`MAX_LEVEL=30`,
// xp.ts — um teto de Combat Engine, sem nenhuma relação com a escala
// de 60-65 do banco de afixos). A investigação da Sprint anterior
// (reports/item-level-progression-model-phase-1.md) mediu que um
// modelo orientado por REGIÃO alcança 100% dos tiers de afixo do jogo
// na última região, contra 45% do modelo por nível de personagem — e
// que só ajustar o clamp de região (sem trocar a variável) não muda
// nada (o clamp já existe em resolveGroupLevel(), nunca é o limite
// ativo). Esta função é o "Modelo C — Region Floor" daquela
// investigação, agora implementado.
//
// Ordem = ordem REAL de progressão medida empiricamente
// (equipment-progression-audit-phase-1.md, fase4b_powerCurveByRegionEntry),
// não a distância no grafo de viagem (REGION_GRAPH acima) nem o
// `levelRange` bruto de worldencounter/encounterTables.ts (que tem uma
// inconsistência já documentada: colinas-aridas, região de 1º anel,
// declara max=45 — maior que minas-abandonadas, de 2º anel, que
// declara max=25). Usar a ordem empírica evita herdar essa
// inconsistência sem precisar reautorar nenhuma Encounter Table.
const REGION_PROGRESSION_ORDER: readonly string[] = [
  "bosque-sussurrante",
  "pantano-podre",
  "colinas-aridas",
  "minas-abandonadas",
  "picos-congelados",
  "litoral-quebrado",
  "deserto-de-vidro",
  "ruinas-esquecidas",
  "fortaleza-sombria",
];

// Maior `minItemLevel` já cadastrado em qualquer tier de qualquer mod
// do Item Generator (itemgen/prefixes.ts/suffixes.ts — 14 mods, 50
// tiers; valor mais alto = 65). Número fixo e documentado aqui, não
// importado de itemgen/ (mantém regions.ts sem depender do Item
// Generator, mesmo princípio de camadas separadas já documentado em
// docs/architecture/domain-vocabulary.md) — precisa ser revisado
// manualmente se um mod futuro exigir um Item Level mais alto.
const HIGHEST_AFFIX_TIER_THRESHOLD = 65;

// Puramente determinística (sem RNG) — a variância por monstro/Loot
// Table (`rollItemLevel()`, lootgen/generator.ts, intocado) continua
// aplicando a própria dispersão em cima do valor devolvido aqui, exatamente
// como já fazia em cima do antigo `monsterLevel`. Região sem Encounter
// Table (hub seguro, sem combate) nunca chega a gerar loot de verdade —
// o fallback (1) existe só pra a função nunca lançar erro.
export function getRegionItemLevelAnchor(regionId: string): number {
  const index = REGION_PROGRESSION_ORDER.indexOf(regionId);
  if (index === -1) return 1;
  const maxIndex = REGION_PROGRESSION_ORDER.length - 1;
  const progress = maxIndex === 0 ? 1 : index / maxIndex;
  return Math.round(1 + progress * (HIGHEST_AFFIX_TIER_THRESHOLD - 1));
}

/**
 * Distância em número de estradas (BFS) entre duas regiões do grafo já
 * existente — usada para que o tempo de viagem de uma expedição escale
 * com a distância real percorrida (regiões mais distantes/difíceis
 * levam mais tempo de estrada), nunca inventando uma rota que não
 * exista em `roads.md`.
 */
export function shortestPathLength(fromId: string, toId: string): number {
  if (fromId === toId) return 0;
  const visited = new Set<string>([fromId]);
  let frontier = [fromId];
  let distance = 0;

  while (frontier.length > 0) {
    distance += 1;
    const next: string[] = [];
    for (const regionId of frontier) {
      for (const neighbor of getNeighbors(regionId)) {
        if (neighbor === toId) return distance;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  return distance; // grafo é conectado — sempre alcançável
}
