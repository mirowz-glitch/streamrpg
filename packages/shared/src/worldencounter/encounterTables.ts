import type { EncounterTable } from "./types.js";

// World Encounter System Phase I — requisito 1: uma Encounter Table
// por região. `regionId` reaproveita ids reais de
// packages/shared/src/regions.ts (REGION_GRAPH) — só lidos, nunca
// alterados. `entries[].enemyTemplateId` reaproveita ids reais de
// packages/shared/src/enemy/templates.ts (ENEMY_TEMPLATES) — também
// só lidos.
//
// Nem toda região tem uma Encounter Table ainda (ex.: "porto-do-
// amanhecer" é o hub inicial seguro, sem encontros de propósito;
// "planicie-dourada"/"minas-abandonadas"/"litoral-quebrado"/
// "picos-congelados"/"deserto-de-vidro" ainda não têm Enemy Template
// próprio — Enemy System Phase I só criou 6 templates) — uma região
// sem tabela simplesmente não gera encontro ainda (generateEncounter()
// lança erro claro, requisito 7: dado que falta, não lógica que
// falta).
//
// Requisito 7 — "adicionar uma nova região ou um novo encontro deve
// exigir apenas dados novos": inserir um novo objeto nesta lista (nova
// região) ou um novo item em `entries` de uma região existente (novo
// encontro). generator.ts/spawn.ts nunca precisam mudar.
// Gameplay Balance & First Playable Experience Phase I — requisito 1/2:
// "encontros de abertura tenham menor quantidade de inimigos." Os
// grupos das duas regiões iniciais (nível 1) foram reduzidos de 1-3/
// 1-4 para 1-2 — combinado com o recalibramento dos Enemy Templates
// (enemy/templates.ts), isso evita o "gauntlet" sequencial sem
// recuperação de vida entre inimigos do mesmo encontro (Adventure
// Loop não regenera vida entre membros — ver adventureLoop.ts) que
// antes matava o jogador quase sempre no primeiro encontro. Nenhuma
// mudança no algoritmo do World Encounter (generator.ts) — só dado.
export const ENCOUNTER_TABLES: EncounterTable[] = [
  // Biomes, Regions & World Progression Phase I — requisito 2:
  // Lobo continua maioria (preserva o balanceamento já calibrado na
  // Sprint de Gameplay Balance — mesmo peso relativo de antes, só
  // redistribuído pra abrir espaço pros dois novos); Javali/Aranha
  // entram como minoria, mesmo patamar de poder (ver enemy/templates.ts).
  {
    regionId: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/3:
    // exemplo literal da Sprint (Normal 95%/Elite 4%/MiniBoss 1%).
    // Mini-Boss: Lobo Alfa (novo Enemy Template, ver enemy/templates.ts).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "wolf-alpha",
    entries: [
      {
        enemyTemplateId: "wolf",
        weight: 60,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
      {
        enemyTemplateId: "boar",
        weight: 25,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
      {
        enemyTemplateId: "spider",
        weight: 15,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
    ],
  },
  {
    regionId: "pantano-podre",
    // Vertical Slice — Player Journey, Retention & First Hour Experience
    // Phase I — Fase 3 ("Progressão regional"): min subiu de 1 pra 5.
    // Reordenar BIOME_PROGRESSION (biomes.ts) pra tirar colinas-aridas
    // do caminho crítico até o Boss colocou pântano-podre logo depois
    // de bosque-sussurrante (`order` 2) — como o gate original (nível 1)
    // já era trivialmente satisfeito desde o personagem nascer, o
    // desbloqueio disparava JÁ NA 1ª tick (checkRegionUnlock roda a
    // cada tick, ver worldencounter/regionProgression.ts), esvaziando
    // bosque-sussurrante como experiência real da 1ª hora — descoberto
    // via testes que dependiam do timing antigo (expeditions.test.ts).
    // Nível 5 dá um espaço real de jogo em bosque antes da transição
    // (~10-20min pelo ritmo já medido em before-adventures-report.md),
    // continua bem abaixo do antigo gate de colinas-aridas (15).
    levelRange: { min: 5, max: 18 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Bruxa do Charco (novo Enemy Template).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "swamp-witch",
    entries: [
      {
        enemyTemplateId: "goblin",
        weight: 100,
        minimumLevel: 1,
        maximumLevel: 18,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
    ],
  },
  // Biomes, Regions & World Progression Phase I — requisito 9: a
  // simulação de longa duração (progressão automática de biomas,
  // ver simulation/) mediu 100% de taxa de morte pra quem alcança
  // Ruínas Esquecidas — "região impossível", exatamente o que o
  // requisito 9 pede pra evitar. Causa: até 2 slots x 3 Skeletons = até
  // 6 inimigos sequenciais no mesmo encontro, sem regeneração de vida
  // entre eles (Adventure Loop não regenera dentro de um encontro) —
  // o mesmo "gauntlet" identificado e corrigido pra bosque-sussurrante/
  // pantano-podre na Sprint de Gameplay Balance, nunca replicado aqui
  // até agora. Corrigido com a MESMA técnica: reduzir o tamanho médio
  // do grupo (mesma calibração, dado apenas).
  {
    regionId: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): o 2º slot (20% de chance de "1
    // Skeleton + 2 Skeletons" sequenciais, até 4 inimigos sem
    // recuperação entre eles — o mesmo "gauntlet" já documentado)
    // mostrou-se insustentável numa Dungeon que precisa atravessar
    // dezenas de encontros aqui sem morrer (medido empiricamente: 80%
    // das mortes em execuções forçadas da Dungeon aconteciam
    // especificamente em Ruínas Esquecidas). Removido o 2º slot —
    // sempre 1 grupo por encontro agora (até 2 Skeletons, nunca 4),
    // mesma técnica de redução de grupo já usada nesta região desde a
    // Sprint de Biomas.
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Guardião Esquecido (novo Enemy Template).
    //
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 2: "Guardião Esquecido" reaproveitado EXATAMENTE como já
    // existia (mesmo Enemy Template, mesma região, "Boss deve ser apenas
    // um EnemyTemplate" — nenhum novo template criado) vira o Chefe
    // Final da nova Dungeon (ver dungeon/). 0.01 (1%) era calibrado pra
    // um encontro OCASIONAL num bioma qualquer — insuficiente pra um
    // "Chefe Final" confiável ao longo de uma Dungeon inteira (medido
    // empiricamente: ~0.2 ocorrências esperadas nos ~20 encontros de
    // Ruínas Esquecidas de uma Expedição comum). Recalibrado pra 0.08
    // (~83% de chance de ao menos 1 ocorrência em 20 encontros),
    // verificado via Simulador antes da entrega. Efeito colateral aceito
    // conscientemente: qualquer aventura (dungeon ou não) em Ruínas
    // Esquecidas agora encontra o Guardião Esquecido com mais frequência
    // — puramente dado, nenhuma lógica nova, mesma convenção de
    // calibração já usada em todo o projeto.
    //
    // Balance, Pacing & Player Experience Phase I — Fase 3 (MiniBosses):
    // "frequência." Diagnóstico (before-dungeon-report.md, 100 Dungeons):
    // o Chefe Final (mesmo template, mesma role de Mini-Boss aqui) só
    // apareceu em 5% das execuções — quase ninguém sequer chega a
    // enfrentá-lo, o oposto de "clímax da Dungeon". Aumentado de 0.08
    // para 0.14 (~95% de chance de ao menos 1 ocorrência ao longo dos
    // ~20-40 encontros que uma Dungeon tipicamente passa nesta região,
    // versus ~83% antes) — mesma técnica de cálculo já documentada
    // acima quando 0.08 foi escolhido.
    //
    // Boss Accessibility & Endgame Balance Phase I — Fase 3
    // (Encounter Tables): "frequência." Diagnóstico (bossaccess-before-
    // dungeon-report.md, 500 Dungeons): mesmo com 0.14 e uma permanência
    // média de ~430 ticks em Ruínas Esquecidas — o bastante pra uma
    // chance teórica de ~99.9997% de ao menos 1 ocorrência — só 3% das
    // execuções realmente avistaram o Chefe. Investigado a fundo
    // (scripts de diagnóstico descartados após o uso): a sequência de
    // seeds `session.seed + encountersCompleted` (consecutiva dentro de
    // UMA sessão, formato documentado em presentationLayer.ts) produz
    // uma taxa de acerto real muito menor que a teórica pra rolagens
    // raras ao longo de centenas de chamadas consecutivas — o MESMO
    // tipo de correlação de seed já documentado (Sprints de Facções/
    // Dungeon) pra seeds pequenas e próximas ENTRE execuções do
    // Simulador, só que aqui acontece DENTRO da própria sequência real
    // de jogo (itemgen/rng.ts, fora do escopo desta Sprint — nenhuma
    // lógica alterada). Não é possível corrigir a causa raiz sem tocar
    // nessa lógica; a correção disponível dentro do escopo é compensar
    // empiricamente subindo a probabilidade nominal. Testado via
    // Simulador: 0.35 eleva a taxa de chegada real de ~3% pra ~19-20%
    // (medido em amostras de 150-400 Dungeons) — ainda não 1:1 com o
    // valor nominal (a supressão real permanece, só atenuada), mas uma
    // melhora grande e mensurável, o critério de aprovação desta
    // Sprint. Ver "Recomendações" na entrega final.
    variantChances: { elite: 0.04, miniBoss: 0.35 },
    miniBossTemplateId: "forgotten-guardian",
    entries: [
      {
        enemyTemplateId: "skeleton",
        weight: 100,
        minimumLevel: 10,
        maximumLevel: 30,
        minimumGroup: 1,
        // First Dungeon, Final Boss & Complete Game Loop Phase I —
        // requisito 11: reduzido de 2 pra 1 (mesma técnica de "reduzir
        // grupo" já aplicada acima em packSizeOptions) — 2 Skeletons
        // sequenciais na MESMA tick, sem regeneração entre eles (Adventure
        // Loop não regenera dentro de um encontro), produziam os picos de
        // dano que zeravam o personagem numa jornada longa (medido
        // empiricamente via Simulador).
        maximumGroup: 1,
        futureFlags: {},
      },
    ],
  },
  {
    regionId: "colinas-aridas",
    levelRange: { min: 15, max: 45 },
    // Vertical Slice — Player Journey, Retention & First Hour Experience
    // Phase I — Fase 3 (Encounter Tables): reordenar BIOME_PROGRESSION
    // (biomes.ts) tirou colinas-aridas do caminho crítico até o Boss,
    // mas ela passou a ser visitada MAIS TARDE (depois de Ruínas
    // Esquecidas) em vez de logo após o Bosque — um personagem chega
    // aqui já num nível bem mais alto que o original (~15-20) previa.
    // Medido empiricamente (quickCheck): 100% de taxa de morte (antes:
    // 8%), causa quase toda "encontro normal" — o mesmo "gauntlet"
    // (múltiplos inimigos sequenciais na mesma tick, sem regeneração
    // entre eles) já identificado e corrigido em bosque-sussurrante/
    // pantano-podre/ruínas-esquecidas em Sprints anteriores, nunca
    // replicado aqui até agora. Corrigido com a MESMA técnica: só 1
    // slot por encontro (nunca mais "2 Goblins + 1 Bandit" no mesmo
    // encontro) e Bandit/Hyena reduzidos de até 3/2 pra até 1 cada
    // (1ª tentativa, reduzir só pra 2, não foi suficiente — medido
    // novamente, ainda 100%).
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Bandit Captain reaproveitado (já existia, já
    // championEligible — ver enemy/templates.ts) — nenhum template novo
    // criado pra Colinas Áridas.
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "bandit_captain",
    entries: [
      {
        enemyTemplateId: "bandit",
        weight: 80,
        minimumLevel: 15,
        maximumLevel: 40,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: {},
      },
      {
        enemyTemplateId: "bandit_captain",
        weight: 15,
        minimumLevel: 20,
        maximumLevel: 45,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: { elitePackEligible: true },
      },
      // Requisito 2 — Hiena: nova, mesmo patamar de poder do Bandit
      // raso (ver enemy/templates.ts).
      {
        enemyTemplateId: "hyena",
        weight: 25,
        minimumLevel: 15,
        maximumLevel: 45,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: {},
      },
    ],
  },
  // Biomes, Regions & World Progression Phase I — requisito 1: bioma
  // novo (Minas Abandonadas — reaproveita a região real já documentada
  // em docs/world-design/regions.md como equivalente de "Cavernas
  // Antigas", nenhuma região nova inventada fora do que já existe no
  // grafo — ver worldencounter/biomes.ts). Nível 12-25 (mesma faixa do
  // documento). Nunca testada por simulação antes desta Sprint.
  {
    regionId: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    packSizeOptions: [
      { slots: 1, weight: 70 },
      { slots: 2, weight: 30 },
    ],
    // Mini-Boss: Construto Ancião (novo Enemy Template).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "ancient-construct",
    entries: [
      {
        enemyTemplateId: "stone-construct",
        weight: 70,
        minimumLevel: 12,
        maximumLevel: 25,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
      // Skeleton reaproveitado (mesmo Enemy Template de Ruínas
      // Esquecidas — "mortos-vivos" também aparecem nas Minas per
      // docs/world-design/regions.md) — nenhum template duplicado.
      {
        enemyTemplateId: "skeleton",
        weight: 30,
        minimumLevel: 12,
        maximumLevel: 25,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {},
      },
    ],
  },
  {
    regionId: "fortaleza-sombria",
    // "Faixa da região" mais estreita que a "Faixa do template" (Boss
    // vai de 20-80 no Enemy Template) — demonstra os dois clamps
    // sendo genuinamente diferentes (requisito 3).
    //
    // First Dungeon, Final Boss & Complete Game Loop Phase I — nota:
    // investigado (e revertido) baixar este limiar pra "encurtar" a
    // jornada até o Chefe Final — descartado: o EnemyTemplate "boss"
    // (baseStats.strength 40, growth.strength 4) foi claramente
    // calibrado pra um personagem MUITO acima do nível 20 (medido
    // empiricamente: um personagem recém-chegado nesta região morre
    // quase sempre). A solução correta (ver expeditions/
    // expeditionDefinitions.ts: "queda-da-fortaleza-sombria") foi
    // dimensionar `expectedEncounters` da Dungeon pra concluir LOGO
    // DEPOIS de derrotar o Guardião Esquecido em Ruínas Esquecidas —
    // nunca exigindo que a Dungeon force o personagem a entrar aqui.
    levelRange: { min: 60, max: 80 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Requisito 3 — "configurável por bioma": Elite fica em 0 aqui de
    // propósito — a única entry desta região já é o Boss final
    // (isBoss: true); multiplicar o Boss final por um modificador de
    // Elite produziria um "Elite Boss" absurdamente acima do que o
    // Enemy System já calibra pra ele. Mini-Boss: Cavaleiro Negro (novo
    // Enemy Template, mais forte que qualquer inimigo comum mas bem
    // abaixo do Boss final).
    variantChances: { elite: 0, miniBoss: 0.02 },
    miniBossTemplateId: "dark-knight",
    entries: [
      {
        enemyTemplateId: "boss",
        weight: 100,
        minimumLevel: 20,
        maximumLevel: 80,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: { bossPackEligible: true },
      },
    ],
  },
];

export function getEncounterTable(regionId: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES.find((table) => table.regionId === regionId);
}
