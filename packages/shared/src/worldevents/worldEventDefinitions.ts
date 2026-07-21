import type { ExplorationEventDefinition } from "./types.js";

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 1/2: 3 registros por categoria (15 no total), valores ilustrativos,
// não calibrados (mesma convenção de CRITICAL_HIT_CHANCE/pesos usada em
// todo o resto do projeto) — verificados empiricamente pelo Simulador
// (requisito 8/9) antes da entrega.
//
// `lootTableId: "treasure_chest"` reaproveita a MESMA Loot Table já
// usada desde o Loot Generator Phase I (lootgen/lootTables.ts,
// dropChance 1.0) — nenhuma tabela nova criada pra Treasure. Ambush
// nunca tem `reward` própria (objeto vazio): a categoria inteira
// "reutiliza Encounter normal" — quem concede XP/loot é o mecanismo de
// abate já existente (Presentation Layer), não este módulo.
export const EXPLORATION_EVENT_DEFINITIONS: ExplorationEventDefinition[] = [
  // Treasure — requisito 2: "Baú Abandonado, Carroça Destruída, Tesouro
  // Esquecido."
  {
    id: "abandoned-chest",
    name: "Baú Abandonado",
    description: "Um baú de madeira, meio enterrado, esquecido por algum viajante.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
      "fortaleza-sombria",
    ],
    weight: 100,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 20 },
  },
  {
    id: "destroyed-cart",
    name: "Carroça Destruída",
    description: "Os restos de uma carroça de mercador, saqueada há tempos.",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas", "pantano-podre"],
    weight: 80,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 15 },
  },
  {
    id: "forgotten-treasure",
    name: "Tesouro Esquecido",
    description: "Um esconderijo antigo, coberto de poeira e teias — ninguém vem aqui há gerações.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas", "fortaleza-sombria"],
    weight: 60,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 40 },
  },

  // Merchant — requisito 2: "Mercador Perdido, Viajante, Acampamento
  // Comercial." "Nesta Sprint apenas gera recompensas. Sem interface de
  // compra" — ouro direto, sem loja.
  {
    id: "lost-merchant",
    name: "Mercador Perdido",
    description: "Um mercador que se perdeu do caminho, grato por companhia — divide o que tem.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
    ],
    weight: 100,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 30 },
  },
  {
    id: "traveler",
    name: "Viajante",
    description: "Um viajante solitário, disposto a trocar histórias e um pouco de ouro.",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas"],
    weight: 80,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 20 },
  },
  {
    id: "trade-camp",
    name: "Acampamento Comercial",
    description: "Um pequeno acampamento de comerciantes, de passagem entre regiões.",
    allowedBiomes: ["colinas-aridas", "bosque-sussurrante", "minas-abandonadas"],
    weight: 50,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 50 },
  },

  // Shrine — requisito 2: "Altar Antigo, Fonte Sagrada, Pedra Rúnica."
  // "Pode conceder: recuperação, XP, ouro" — cada um combina um
  // subconjunto diferente (variedade via dado, nunca lógica nova).
  //
  // Boss Accessibility & Endgame Balance Phase I — Fase 3
  // (Configurações): `recoveryAmount` era um valor fixo pequeno (30/20)
  // frente à vida máxima típica ao avistar o Chefe (~360, Estado do
  // Personagem, bossaccess-before-dungeon-report.md) — uma fração
  // pequena demais pra realmente aliviar a exaustão da jornada.
  // Aumentado (30->120, 20->100). Testado via Simulador: contribuição
  // real pequena isoladamente (Shrine é raro e não garante acontecer
  // logo antes do Chefe), mas mantido — nenhuma regressão medida em
  // nenhuma métrica, e ajuda genuinamente quem o encontra.
  {
    id: "ancient-altar",
    name: "Altar Antigo",
    description: "Um altar de pedra coberto de musgo, ainda emanando um calor reconfortante.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
      "fortaleza-sombria",
    ],
    weight: 100,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { recoveryAmount: 120 },
  },
  {
    id: "sacred-fountain",
    name: "Fonte Sagrada",
    description: "Água cristalina brota de uma fonte esculpida — beber dela revigora corpo e mente.",
    allowedBiomes: ["bosque-sussurrante", "ruinas-esquecidas"],
    weight: 60,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { recoveryAmount: 100, xpAmount: 25 },
  },
  {
    id: "rune-stone",
    name: "Pedra Rúnica",
    description: "Uma pedra gravada com runas antigas, pulsando com um brilho fraco.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas", "fortaleza-sombria"],
    weight: 50,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { xpAmount: 30, goldAmount: 10 },
  },

  // Ambush — requisito 2: "Emboscada, Patrulha Hostil, Caçadores."
  // "Reutilizar Encounter normal" — `reward` vazia de propósito, o
  // combate real (Enemy System/Loot Generator, já existentes) concede
  // tudo através dos mecanismos de abate normais.
  {
    id: "ambush",
    name: "Emboscada",
    description: "Inimigos saltam da vegetação, sem aviso — não há tempo pra hesitar.",
    allowedBiomes: ["pantano-podre", "bosque-sussurrante", "colinas-aridas"],
    weight: 100,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar.",
  },
  {
    id: "hostile-patrol",
    name: "Patrulha Hostil",
    description: "Uma patrulha armada bloqueia o caminho — não parecem dispostos a negociar.",
    allowedBiomes: ["colinas-aridas", "fortaleza-sombria", "minas-abandonadas"],
    weight: 70,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar.",
  },
  {
    id: "hunters",
    name: "Caçadores",
    description: "Um grupo de caçadores confunde você com presa fácil.",
    allowedBiomes: ["pantano-podre", "bosque-sussurrante"],
    weight: 60,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar.",
  },

  // Discovery — requisito 2: "Ruínas Antigas, Diário Perdido,
  // Monumento." "Concedem progresso exploratório" — XP direto, sem
  // combate/loot.
  {
    id: "ancient-ruins",
    name: "Ruínas Antigas",
    description: "Colunas quebradas e paredes desmoronadas — vestígios de uma civilização esquecida.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas"],
    weight: 100,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 35 },
  },
  {
    id: "lost-diary",
    name: "Diário Perdido",
    description: "As páginas gastas de um diário, relatando os últimos dias de quem o escreveu.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
    ],
    weight: 70,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 20 },
  },
  {
    id: "monument",
    name: "Monumento",
    description: "Um monumento imponente, entalhado com símbolos que ninguém mais consegue ler.",
    allowedBiomes: ["ruinas-esquecidas", "fortaleza-sombria", "minas-abandonadas"],
    weight: 50,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 45 },
  },
];

export function getExplorationEventDefinition(id: string): ExplorationEventDefinition | undefined {
  return EXPLORATION_EVENT_DEFINITIONS.find((definition) => definition.id === id);
}
