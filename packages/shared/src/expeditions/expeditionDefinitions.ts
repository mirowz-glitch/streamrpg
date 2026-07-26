import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import type { ExpeditionDefinition } from "./types.js";

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 1: uma definição por região com Encounter Table real (as
// mesmas 6 já usadas por worldencounter/encounterTables.ts/biomes.ts —
// nenhuma região nova inventada). `expectedEncounters`/`checkpointCount`
// crescem com a dificuldade da região (mesma progressão de poder já
// usada pelos Enemy Templates/Encounter Tables) — valores ilustrativos,
// não calibrados (mesma convenção de sempre), verificados empiricamente
// pelo Simulador (requisito 9/10) antes da entrega.
export const EXPEDITION_DEFINITIONS: ExpeditionDefinition[] = [
  {
    id: "bosque-antigo",
    name: "Bosque Antigo",
    description: "Uma travessia guiada pelas trilhas mais antigas do Bosque Sussurrante.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante"],
    expectedEncounters: 12,
    expectedSeconds: 264,
    checkpointCount: 3,
    reward: { xpAmount: 200, goldAmount: 50 },
    difficulty: "Baixa",
  },
  {
    id: "travessia-do-pantano",
    name: "Travessia do Pântano",
    description: "Atravessar o Pântano Podre de ponta a ponta, sem se perder na neblina.",
    startBiome: "pantano-podre",
    allowedBiomes: ["pantano-podre"],
    expectedEncounters: 14,
    expectedSeconds: 308,
    checkpointCount: 3,
    reward: { xpAmount: 260, goldAmount: 60 },
    difficulty: "Baixa",
  },
  {
    id: "rota-das-colinas",
    name: "Rota das Colinas",
    description: "Uma rota comercial perigosa através das Colinas Áridas.",
    startBiome: "colinas-aridas",
    allowedBiomes: ["colinas-aridas"],
    expectedEncounters: 18,
    expectedSeconds: 396,
    checkpointCount: 3,
    reward: { xpAmount: 450, goldAmount: 120 },
    difficulty: "Média",
  },
  {
    id: "descida-as-minas",
    name: "Descida às Minas",
    description: "Descer fundo nas Minas Abandonadas, entre os construtos de pedra.",
    startBiome: "minas-abandonadas",
    allowedBiomes: ["minas-abandonadas"],
    expectedEncounters: 16,
    expectedSeconds: 352,
    checkpointCount: 3,
    reward: { xpAmount: 400, goldAmount: 100 },
    difficulty: "Média",
  },
  {
    id: "exploracao-das-ruinas",
    name: "Exploração das Ruínas",
    description: "Uma expedição longa pelas Ruínas Esquecidas, em busca do que restou do passado.",
    startBiome: "ruinas-esquecidas",
    allowedBiomes: ["ruinas-esquecidas"],
    expectedEncounters: 20,
    expectedSeconds: 440,
    checkpointCount: 4,
    reward: { xpAmount: 600, goldAmount: 160 },
    difficulty: "Alta",
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 1: "Dungeon deve ser apenas uma ExpeditionDefinition" — a primeira
  // Dungeon completa, atravessando os 6 biomas conhecidos (Bosque
  // Sussurrante -> Colinas Áridas -> Pântano Podre -> Minas Abandonadas
  // -> Ruínas Esquecidas -> Fortaleza Sombria, mesma ORDEM de
  // BIOME_PROGRESSION, worldencounter/biomes.ts) via a MESMA travessia
  // automática por nível que já existe (Region Unlock, Objective
  // System — intocado, só reaproveitado). `expectedEncounters` bem
  // maior que qualquer Expedição regional isolada (soma aproximada dos
  // 6 biomas) — calibrado empiricamente via Simulador (requisito 10)
  // pra terminar POUCO depois do Chefe Final normalmente aparecer
  // (Ruínas Esquecidas, penúltimo bioma). `guaranteedLootTableId`
  // finalmente LÊ o Future Hook preparado desde a Sprint de Expedições
  // (expeditions/types.ts: ExpeditionReward.guaranteedLootTableId,
  // nunca lido por nenhuma lógica real até agora) — aponta pra
  // "final-boss-relic" (lootgen/lootTables.ts), mas quem efetivamente
  // concede o item é dungeon/dungeonController.ts (na derrota do Chefe,
  // não na conclusão da Expedição — ver nota lá).
  {
    id: "queda-da-fortaleza-sombria",
    name: "Queda da Fortaleza Sombria",
    description:
      "A primeira Dungeon completa do reino: atravesse todos os biomas conhecidos até enfrentar o Guardião Esquecido, o Chefe Final que guarda o caminho para a Fortaleza Sombria.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas", "pantano-podre", "minas-abandonadas", "ruinas-esquecidas", "fortaleza-sombria"],
    // Player Journey Recovery & World Progression Phase I — Fase 3
    // (Game Design Audit Phase I, achado #10): a auditoria mediu esta
    // Dungeon consumindo ~68% do orçamento de uma sessão de 2h (179
    // encontros médios reais, apesar do alvo de 220). Pior: com o
    // reorder de BIOME_PROGRESSION desta MESMA Sprint (Fase 1/2)
    // liberando as regiões seguintes, uma calibração de verificação
    // (100 execuções) revelou um efeito colateral novo — como
    // `encountersCompleted` conta QUALQUER `EncounterFinished` desde o
    // início da Expedição, independente da região atual, e Region
    // Unlock continua avançando `session.currentRegion` livremente
    // enquanto esta Expedição-Dungeon segue "ativa" (não concluída),
    // um orçamento de 220 dava tempo de sobra pro personagem vagar
    // BEM além de Ruínas Esquecidas (onde o Chefe mora) — inclusive
    // Fortaleza Sombria e Picos Congelados — ainda "dentro" desta MESMA
    // Expedição. Uma morte lá contava como ExpeditionFailed desta
    // Dungeon original, mesmo o Chefe já tendo sido derrotado (medido:
    // 0/90 conclusões, apesar de 488/488 vitórias reais contra o
    // Guardião — 100% de taxa de vitória do Chefe, 0% de Expedição
    // concluída).
    //
    // Medido nesta mesma calibração (nova ordem de biomas): o Chefe é
    // encontrado e derrotado em média por volta do encontro ~128
    // (2811s / 22s por encontro). `expectedEncounters: 140` dá margem
    // pra praticamente toda execução alcançar Ruínas Esquecidas e
    // derrotar o Guardião ANTES de concluir a Expedição, mas corta a
    // folga de "vagar por regiões seguintes ainda dentro desta
    // Expedição" de ~90 encontros (220-128) pra ~12 (140-128) — o
    // suficiente pra reduzir drasticamente o efeito colateral acima sem
    // arriscar cortar a jornada ANTES do Chefe (que o alvo de 40-70
    // encontros desta Sprint não permitiria, pelo mesmo motivo já
    // documentado numa Sprint anterior: alcançar Ruínas Esquecidas
    // sozinho já exige ~90-100 encontros reais, Region Unlock fora do
    // escopo). Também reduz a duração real média da Dungeon de ~68%
    // pra uma fração bem menor do orçamento de uma sessão de 2h (ver
    // comparação Antes/Depois na entrega desta Sprint).
    // Calibrado empiricamente (100 execuções de verificação, mesma
    // técnica de sempre) contra um efeito colateral descoberto nesta
    // Sprint: como `encountersCompleted` conta qualquer encontro desde
    // o início, independente da região, e Region Unlock (fora do
    // escopo) continua avançando `session.currentRegion` enquanto esta
    // Expedição segue ativa, um orçamento GRANDE demais (220 original,
    // ou 170 testado) dava tempo pro personagem avançar de Ruínas
    // Esquecidas até Picos Congelados (letal, ver "Problemas
    // Remanescentes" na entrega) ainda DENTRO desta mesma Expedição —
    // uma morte lá contava como ExpeditionFailed mesmo com o Guardião
    // já derrotado (medido: 220 e 170 chegaram a 0% de conclusão). Um
    // orçamento PEQUENO demais (130) cortava a própria janela de
    // encontrar o Guardião cedo demais (arrivalRate caiu de 0.66 pra
    // 0.49). 140 é o ponto testado com melhor equilíbrio (38.5% de
    // conclusão, arrivalRate 0.66, ante 0% do valor original) — ainda
    // um corte de ~36% no total de encontros da Dungeon (220->140) e
    // uma redução grande na janela de "vagar por regiões letais ainda
    // dentro desta Expedição" (~90 encontros de folga antes -> ~12
    // agora). A conclusão não voltou ao patamar histórico de ~74-77%
    // porque o gargalo dominante hoje é Picos Congelados (fora do
    // escopo desta Sprint), não mais o tamanho desta Dungeon — ver
    // "Problemas Remanescentes" e "Próximo Roadmap" na entrega.
    expectedEncounters: 140,
    expectedSeconds: 3080,
    // Mantida a MESMA proporção de ~4 encontros/checkpoint já validada
    // (Balance, Pacing & Player Experience Phase I) — 140/4 = 35.
    checkpointCount: 35,
    // Vertical Slice — Progression Economy & Reward Curve Phase I — Fase
    // 2/3 (Auditoria): revertido de volta pra perto do valor original
    // (2200->1500 XP, 600->400 ouro). O aumento anterior (Boss
    // Accessibility & Endgame Balance Phase I) foi uma resposta direta a
    // "Chefe com taxa de vitória de 0% na linha de base" — mas essa
    // taxa de 0% foi medida ANTES da Engine Observability & Event
    // Derivation Phase I (Sprint intermediária): o Chefe era derrotado
    // de verdade, só que o evento MiniBossDefeated/FinalBossDefeated
    // era silenciosamente descartado sempre que o Inventory estava
    // cheio (quase sempre, ao alcançar Ruínas Esquecidas ~tick 90+) —
    // um bug de OBSERVABILIDADE, não de dificuldade real. Auditoria
    // desta Sprint (scripts/runProgressionEconomyAudit.ts, 100 execuções,
    // medição JÁ corrigida): taxa de vitória por encontro real = 99.8%
    // (2987/2993), muito acima do "quase impossível" que justificou o
    // aumento. A recompensa inflada deixou de fazer sentido pro risco
    // real — revertida a um valor mais próximo do original, ainda
    // acima dele (a Dungeon continua a mais longa do jogo, 220
    // encontros, 77% de conclusão total mesmo com o Chefe fácil, ver
    // relatório da auditoria) pra reconhecer esse tempo investido sem
    // repetir a inflação desproporcional.
    reward: { xpAmount: 1500, goldAmount: 400, guaranteedLootTableId: "final-boss-relic" },
    difficulty: "Lendária",
  },
  // Vertical Slice — Multi-Dungeon Content & Data Expansion Phase I —
  // Fase 1: 3 novas Dungeons, provando que a arquitetura suporta
  // expansão de conteúdo só por dados. Diferente de "queda-da-fortaleza-
  // sombria" (que atravessa TODOS os biomas conhecidos, sua própria
  // identidade de "primeira Dungeon completa do reino"), estas 3 seguem
  // o padrão mais comum de Expedição de região ÚNICA (mesmo formato de
  // "descida-as-minas"/"exploracao-das-ruinas" acima) — `startBiome` ==
  // único item de `allowedBiomes`, cada uma focada só no seu próprio
  // bioma novo (worldencounter/biomes.ts). `expectedEncounters`/
  // `checkpointCount` mantêm a MESMA proporção já validada em toda
  // região de nível médio/alto (~4 encontros por checkpoint) — sem
  // simulação nesta Sprint (briefing pede pra evitar), valores
  // ilustrativos extrapolados da mesma convenção. `guaranteedLootTableId`
  // aponta pra uma Loot Table nova (lootgen/lootTables.ts) exclusiva de
  // cada Chefe, mesmo mecanismo já usado pela primeira Dungeon.
  {
    id: "fortaleza-congelada",
    name: "Fortaleza Congelada",
    description: "Escale as torres geladas dos Picos Congelados até o trono do Rei Gélido, guardião de um frio que nunca cede.",
    startBiome: "picos-congelados",
    allowedBiomes: ["picos-congelados"],
    // Player Journey Recovery & World Progression Phase I — Fase 4:
    // mesmo com o Chefe já reduzido (enemy/templates.ts) e mais fácil
    // de encontrar (encounterTables.ts), a Dungeon inteira ainda
    // completava 0% — medido: o Chefe (0.35 por encontro) muitas vezes
    // só é encontrado perto do FIM do orçamento de 24 encontros, e o
    // personagem sobrevive a ele com pouco HP (~11% em média);
    // dobrar os checkpoints (testado: 6->12) não teve efeito
    // mensurável (os checkpoints já "gastos" antes do Chefe não voltam
    // a curar) — o problema real é falta de margem PÓS-Chefe, não
    // frequência de cura. Diferente da Dungeon original (Fase 3), esta
    // é de região ÚNICA sem risco de "vagar pra região seguinte letal"
    // — aumentar o orçamento aqui é seguro. Subido de 24 pra 44 (quase
    // dobrado) pra dar margem real de sobrevivência depois do Chefe,
    // mesmo quando ele aparece tarde.
    expectedEncounters: 44,
    expectedSeconds: 968,
    // Mantida a MESMA proporção de ~2 encontros/checkpoint testada
    // acima (44/2 = 22).
    checkpointCount: 22,
    reward: { xpAmount: 900, goldAmount: 220, guaranteedLootTableId: "frost-king-relic" },
    difficulty: "Muito Alta",
    // Vertical Slice — Dungeon Modifiers, Variants & Replayability Phase
    // I — Fase 2/6: combo literal do exemplo do briefing ("modifiers:
    // ['elite-density', 'reduced-healing']"). Combinado x1.38 (ver
    // expeditionModifiers.ts).
    modifiers: ["elite-density", "reduced-healing"],
  },
  {
    id: "catedral-esquecida",
    name: "Catedral Esquecida",
    description: "Desça até a catedral afundada do Litoral Quebrado e enfrente o Bispo Corrompido antes que sua corrupção alcance a costa.",
    startBiome: "litoral-quebrado",
    allowedBiomes: ["litoral-quebrado"],
    // Player Journey Recovery & World Progression Phase I — Fase 4:
    // mesmo ajuste de fortaleza-congelada acima — orçamento subido
    // (28->48) pra dar margem pós-Chefe (Dungeon de região única, sem
    // risco de "vagar pra região seguinte letal").
    expectedEncounters: 48,
    expectedSeconds: 1056,
    checkpointCount: 24,
    reward: { xpAmount: 1300, goldAmount: 320, guaranteedLootTableId: "corrupted-bishop-relic" },
    difficulty: "Lendária",
    // Combinado x1.32.
    modifiers: ["increased-vitality", "worldevents-disabled"],
  },
  {
    id: "covil-do-dragao",
    name: "Covil do Dragão",
    description: "Atravesse o Deserto de Vidro, vitrificado por um fogo antigo, até o covil do Dragão Ancião — o desafio mais lendário do reino.",
    startBiome: "deserto-de-vidro",
    allowedBiomes: ["deserto-de-vidro"],
    // Player Journey Recovery & World Progression Phase I — Fase 4:
    // mesmo ajuste acima — orçamento subido (32->52) pra dar margem
    // pós-Chefe.
    expectedEncounters: 52,
    expectedSeconds: 1144,
    checkpointCount: 26,
    reward: { xpAmount: 1800, goldAmount: 450, guaranteedLootTableId: "ancient-dragon-relic" },
    difficulty: "Lendária",
    // Combinado x1.326 (a mais forte das 3, condizente com "Boss
    // lendário" — inclui um modificador de penalidade real,
    // "reduced-gold", pra mostrar que multiplicadores <1 também
    // combinam normalmente).
    modifiers: ["miniboss-surge", "increased-damage", "reduced-gold"],
  },
];

// Vertical Slice — World Tiers & Endgame Scaling Phase I — requisito
// arquitetural: revertido pra devolver o registro CRU (sem nenhum
// multiplicador aplicado). A Sprint anterior (Dungeon Modifiers Runtime
// Integration) aplicava o multiplicador combinado AQUI, porque
// `definition.modifiers` é estático (não depende da sessão) — mas o
// Runtime Final agora também depende de `session.worldTier` (uma
// escolha POR SESSÃO, nunca uma propriedade da Dungeon em si), que uma
// função de lookup pura como esta (sem acesso à sessão) não tem como
// conhecer. Por isso a multiplicação de recompensa se mudou pro(s)
// ponto(s) que JÁ recebem a sessão inteira e o CombinedRuntimeConfig
// resolvido (expeditions/expeditionController.ts: XP/ouro;
// factions/factionController.ts: reputação) — nunca duplicada, nunca
// aplicada duas vezes. `getExpeditionDefinition()` volta a ser "só
// dados", exatamente como antes da Sprint de Dungeon Modifiers.
export function getExpeditionDefinition(id: string): ExpeditionDefinition | undefined {
  return EXPEDITION_DEFINITIONS.find((entry) => entry.id === id);
}

// Requisito 1/2 — "sem intervenção da UI": seleciona automaticamente
// entre as definições cujo `startBiome` é a região atual do jogador —
// mesmo princípio de selectObjectiveId() (Objective System), nunca
// Math.random. `null` quando não há nenhuma definição pra esta região
// (região sem Expedição ainda — dado que falta, não lógica que falta).
export function selectExpeditionDefinitionId(seed: number, currentRegionId: string): string | null {
  const candidates = EXPEDITION_DEFINITIONS.filter((definition) => definition.startBiome === currentRegionId);
  if (candidates.length === 0) return null;
  const rng = createSeededRandom(seed);
  const index = randomInt(rng, 0, candidates.length - 1);
  return candidates[index].id;
}
