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
// Enemy System está protegido nesta Sprint (não é possível baixar o
// levelRange dos Enemy Templates de colinas-aridas — bandit/hyena/
// bandit_captain continuam calibrados pra nível 15+, ver enemy/
// templates.ts) — a correção tecnicamente correta e de menor raio de
// impacto é reordenar a SEQUÊNCIA de desbloqueio (puro dado, `order`),
// não os thresholds em si: pântano-podre (gate nível 1, trivial) e
// minas-abandonadas (gate nível 12) passam a vir ANTES de colinas-
// aridas (gate nível 15), e ruínas-esquecidas (gate nível 10, onde o
// Chefe Final mora) fica alcançável assim que minas-abandonadas
// desbloqueia — sem nunca exigir atravessar o gate de nível 15 a
// caminho do Boss.
//
// Colinas-aridas foi originalmente calibrada (Enemy Templates: bandit/
// hyena/bandit_captain, frozen nesta Sprint) assumindo um encontro
// LOGO no início da jornada (nível ~15) — ao virar conteúdo "tardio"
// (1ª tentativa: order 5, depois de Ruínas Esquecidas), o personagem
// chega lá num nível bem mais alto (~20-30+), e o `resolveGroupLevel`
// escala os inimigos pra acompanhar — só que a curva de força desses
// 3 Enemy Templates nesse patamar acabou se mostrando desproporcional
// (medido empiricamente: 100% de taxa de morte em Colinas Áridas,
// mesmo já reduzindo packSizeOptions/maximumGroup pra 1 — não era
// "gauntlet" de múltiplos inimigos, é desproporção real de poder num
// nível que a região nunca foi calibrada pra receber). Como o Enemy
// System está fora de escopo, a correção segura é mover colinas-aridas
// pro FIM da sequência (order 6, depois de Fortaleza Sombria, cujo
// gate de nível 60 já raramente é alcançado nas simulações) — na
// prática ela deixa de ser alcançada automaticamente (mesmo
// comportamento seguro que Fortaleza Sombria já tinha), preservando o
// equilíbrio geral em vez de introduzir uma região letal no caminho da
// maioria das jornadas.
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
    regionId: "minas-abandonadas",
    order: 3,
    climate: "Subterrâneo — sem clima externo, temperatura em queda constante",
    description: "Túneis escavados, trilhos de vagonete quebrados, tochas apagadas há muito tempo.",
    difficultyLabel: "Média",
    visualTheme: { color: "#6b5b4f", icon: "⛏️" },
  },
  {
    regionId: "ruinas-esquecidas",
    order: 4,
    climate: "Ameno, protegido pelas próprias ruínas",
    description: "Colunas quebradas, estátuas cobertas de vinha, salas subterrâneas com inscrições antigas.",
    difficultyLabel: "Alta",
    visualTheme: { color: "#d4af37", icon: "🏛️" },
  },
  {
    regionId: "fortaleza-sombria",
    order: 5,
    climate: "Céu permanentemente nublado, independente das regiões vizinhas",
    description: "Torres negras, pontes suspensas sobre abismos, portões de ferro maiores que qualquer construção vista antes.",
    difficultyLabel: "Muito Alta",
    visualTheme: { color: "#8b1e3f", icon: "🏰" },
  },
  {
    regionId: "colinas-aridas",
    order: 6,
    climate: "Sol forte, pouca sombra, noites frias",
    description: "Colinas ocre, vegetação rasteira e seca, ruínas de fazendas abandonadas espalhadas.",
    difficultyLabel: "Baixa-Média",
    visualTheme: { color: "#c9a227", icon: "🏜️" },
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
