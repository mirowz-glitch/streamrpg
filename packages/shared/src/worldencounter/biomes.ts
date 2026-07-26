import type { BiomeDefinition } from "./types.js";

// Biomes, Regions & World Progression Phase I — requisito 1: "Criar
// Progressão de Biomas... tudo data-driven." Conteúdo (clima/descrição/
// dificuldade) reaproveitado literalmente de docs/world-design/
// regions.md (rascunho de World Design já existente) — nenhuma lore
// nova inventada. `levelRange` NUNCA é duplicado aqui: sempre lido de
// getEncounterTable(regionId).levelRange (worldencounter/
// encounterTables.ts, já existente) — este arquivo só acrescenta o que
// ainda não existia como dado (clima/descrição/identidade visual/
// ordem de progressão/dificuldade autoral).
//
// "Cavernas Antigas" (exemplo da Sprint) não existe como região
// documentada em regions.md nem no grafo real (regions.ts) — decisão
// transparente: reaproveitada "Minas Abandonadas" (região real já
// documentada, mesma vibe de túneis subterrâneos antigos) em vez de
// inventar uma região nova sem lastro em nenhum documento, mesmo
// princípio de "nunca inventar dado" usado em todas as Sprints
// anteriores.
//
// Requisito 7 — "adicionar um novo bioma exige apenas: uma nova
// Encounter Table (worldencounter/encounterTables.ts) + um novo
// registro aqui": nenhuma outra parte desta camada
// (generator.ts/spawn.ts/regionProgression.ts) precisa mudar.
// Vertical Slice — Player Journey, Retention & First Hour Experience
// Phase I — Fase 3 ("Progressão regional"; "Distância entre regiões";
// "Distância até Boss"): reordenado. Diagnóstico (journey-before-
// dungeon-report.md, 300 Dungeons): apenas 3% das tentativas avistam o
// Chefe Final, tempo médio até avistá-lo de 3352s — o gargalo raiz é
// que a ordem antiga (bosque -> colinas-aridas -> pantano-podre -> ...)
// forçava TODO personagem a cruzar o gate de nível 15 de colinas-aridas
// (encounterTables.ts: levelRange.min) logo depois do bosque, antes de
// sequer poder desbloquear pântano-podre (que só exige nível 1) ou
// minas-abandonadas/ruínas-esquecidas (níveis 12/10, onde o Chefe
// vive) — um gate real bem mais alto que o necessário no meio do
// caminho pro Boss, inflando a maratona de encontros necessária.
//
// Vertical Slice — Player Journey Recovery & World Progression Phase I
// — Fase 1/2 (Game Design Audit Phase I, achado #1): a auditoria mediu
// 0/300 jornadas naturais alcançando qualquer região além de
// ruinas-esquecidas (order 4) — causa raiz: fortaleza-sombria (então
// order 5) exigia nível 60 (encounterTables.ts), impossível com
// MAX_LEVEL=30, e como getNextBiome() só oferece SEMPRE o `order + 1`
// imediato, isso bloqueava em cascata as 4 regiões seguintes mesmo com
// gates individualmente alcançáveis (15/20/24/28).
//
// Correção de 2 partes:
// 1) fortaleza-sombria: levelRange.min baixado de 60 pra 30 (=MAX_LEVEL,
//    ver encounterTables.ts) — permanece a região mais dura do jogo
//    (só alcançável no nível máximo), mas deixa de ser matematicamente
//    impossível.
// 2) Reordenada pro FIM da sequência (order 9), depois de colinas-
//    aridas/picos-congelados/litoral-quebrado/deserto-de-vidro (gates
//    15/20/24/28, todos abaixo de 30) — preserva sua identidade de
//    capstone final, agora genuinamente alcançável.
//
// Colinas-aridas volta pra PERTO do início (order 3, logo depois de
// pântano-podre) em vez do fim da sequência: o histórico documentado
// abaixo (Player Journey, Retention & First Hour Experience Phase I)
// mediu 100% de taxa de morte quando ela era alcançada TARDE (depois de
// Ruínas Esquecidas, personagem já nível ~20-30+, Enemy Templates
// bandit/hyena/bandit_captain desproporcionais nesse patamar) — mas o
// MESMO comentário explica que ela "foi originalmente calibrada
// assumindo um encontro LOGO no início da jornada (nível ~15)", que é
// exatamente onde ela volta a cair agora (gate 15, logo após
// pântano-podre gate 5) — evita reintroduzir a falha documentada
// (chegada tardia/overlevada) sem depender de nenhuma mudança em Enemy
// Templates (protegidos nesta Sprint). minas-abandonadas/ruinas-
// esquecidas continuam alcançáveis normalmente logo em seguida (seus
// próprios gates, 12/10, já ficam satisfeitos de sobra ao se chegar aos
// 15 de colinas-aridas).
export const BIOME_PROGRESSION: BiomeDefinition[] = [
  {
    regionId: "bosque-sussurrante",
    order: 1,
    climate: "Temperado, chuva leve ocasional",
    description: "Floresta densa de copas altas, luz filtrada em feixes, trilhas estreitas cobertas de folhas.",
    difficultyLabel: "Baixa",
    visualTheme: { color: "#2f9e44", icon: "🌲" },
  },
  {
    regionId: "pantano-podre",
    order: 2,
    climate: "Neblina constante, calor úmido",
    description: "Água parada, árvores tortas meio submersas, palafitas precárias ao longe.",
    difficultyLabel: "Baixa-Média",
    visualTheme: { color: "#5c7a5c", icon: "🌫️" },
  },
  {
    regionId: "colinas-aridas",
    order: 3,
    climate: "Sol forte, pouca sombra, noites frias",
    description: "Colinas ocre, vegetação rasteira e seca, ruínas de fazendas abandonadas espalhadas.",
    difficultyLabel: "Baixa-Média",
    visualTheme: { color: "#c9a227", icon: "🏜️" },
  },
  {
    regionId: "minas-abandonadas",
    order: 4,
    climate: "Subterrâneo — sem clima externo, temperatura em queda constante",
    description: "Túneis escavados, trilhos de vagonete quebrados, tochas apagadas há muito tempo.",
    difficultyLabel: "Média",
    visualTheme: { color: "#6b5b4f", icon: "⛏️" },
  },
  {
    regionId: "ruinas-esquecidas",
    order: 5,
    climate: "Ameno, protegido pelas próprias ruínas",
    description: "Colunas quebradas, estátuas cobertas de vinha, salas subterrâneas com inscrições antigas.",
    difficultyLabel: "Alta",
    visualTheme: { color: "#d4af37", icon: "🏛️" },
  },
  // Vertical Slice — Multi-Dungeon Content & Data Expansion Phase I —
  // Fase 1: 3 novos biomas, um por Dungeon nova (ver dungeon/
  // dungeonDefinitions.ts + expeditions/expeditionDefinitions.ts).
  // `regionId` reaproveita 3 ids REAIS já documentados em regions.ts
  // (REGION_GRAPH, desde a Sprint de Expedições) mas nunca antes usados
  // por este módulo — "planicie-dourada"/"litoral-quebrado"/
  // "picos-congelados"/"deserto-de-vidro" já existiam como nós do grafo
  // de viagem sem Encounter Table/BiomeDefinition próprios (ver nota no
  // topo de encounterTables.ts) — nenhuma região nova inventada, mesmo
  // princípio de "Cavernas Antigas -> Minas Abandonadas" já usado nesta
  // Sprint original. `order` 6/7/8 (Player Journey Recovery Phase I:
  // renumerado de 7/8/9 pra abrir espaço pra colinas-aridas voltar pro
  // início da sequência, order 3) continuam a sequência de desbloqueio
  // automático (mesmo mecanismo de sempre, checkRegionUnlock) — como o
  // nível MÍNIMO de cada uma fica <= MAX_LEVEL (30), elas ficam
  // genuinamente alcançáveis assim que ruinas-esquecidas (order 5)
  // desbloquear.
  {
    regionId: "picos-congelados",
    order: 6,
    climate: "Nevasca constante, ventos cortantes, frio que nunca cede",
    description: "Picos nevados acima das nuvens, geleiras rachadas, o silêncio quebrado só pelo vento e o estalar do gelo.",
    difficultyLabel: "Muito Alta",
    visualTheme: { color: "#a8d8ff", icon: "❄️" },
  },
  {
    regionId: "litoral-quebrado",
    order: 7,
    climate: "Névoa salgada constante, marés violentas e imprevisíveis",
    description: "Destroços de navios encalhados na areia, uma catedral afundada meio submersa na maré, sinos que ainda tocam sozinhos.",
    difficultyLabel: "Muito Alta",
    visualTheme: { color: "#4a5a6a", icon: "⛪" },
  },
  {
    regionId: "deserto-de-vidro",
    order: 8,
    climate: "Calor abrasador, areia que corta como vidro moído",
    description: "Dunas vitrificadas por um fogo antigo, cristais afiados brotando da areia derretida, o covil de algo muito maior no centro.",
    difficultyLabel: "Lendária",
    visualTheme: { color: "#ff6b35", icon: "🐉" },
  },
  // Player Journey Recovery & World Progression Phase I — Fase 1/2:
  // reordenada do order 5 pro FIM da sequência (order 9) — ver nota
  // histórica completa no topo deste arquivo. Continua a região mais
  // dura do jogo (gate baixado de 60 pra 30 = MAX_LEVEL em
  // encounterTables.ts), agora genuinamente alcançável só depois de
  // atravessar TODAS as outras 8 regiões.
  {
    regionId: "fortaleza-sombria",
    order: 9,
    climate: "Céu permanentemente nublado, independente das regiões vizinhas",
    description: "Torres negras, pontes suspensas sobre abismos, portões de ferro maiores que qualquer construção vista antes.",
    difficultyLabel: "Muito Alta",
    visualTheme: { color: "#8b1e3f", icon: "🏰" },
  },
];

export function getBiomeDefinition(regionId: string): BiomeDefinition | undefined {
  return BIOME_PROGRESSION.find((biome) => biome.regionId === regionId);
}

// Requisito 4 — "quando a faixa de nível for atingida, desbloquear
// automaticamente o próximo bioma": o "próximo" é sempre o `order + 1`
// desta MESMA lista — nenhuma outra noção de sequência existe em
// nenhum outro lugar (ver regionProgression.ts).
export function getNextBiome(regionId: string): BiomeDefinition | undefined {
  const current = getBiomeDefinition(regionId);
  if (!current) return undefined;
  return BIOME_PROGRESSION.find((biome) => biome.order === current.order + 1);
}
