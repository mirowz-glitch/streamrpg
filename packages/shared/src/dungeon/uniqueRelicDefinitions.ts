// Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — módulo
// isolado de propósito (irmão de dungeon/dungeonDefinitions.ts, mesmo
// padrão: dados + funções puras de leitura, nenhuma Layer/Manager/
// Wrapper novo). "Nenhum Boss deve conter código específico" — a
// relação Boss -> Relíquias vive inteiramente AQUI, nunca em
// enemy/templates.ts (o Enemy Template continua 100% agnóstico, "Boss
// deve ser apenas um EnemyTemplate" preservado ao pé da letra).
//
// Fase 1 — "Cada relíquia deve conter apenas dados... Nenhuma lógica."
// `lootIdentity` aqui referencia o id da Loot Table dedicada desta
// relíquia (lootgen/lootTables.ts) — não a Monster Loot Identity
// (lootidentity/lootIdentities.ts, que resolve BIAS pra um sorteio
// normal; relíquias usam generateLoot() diretamente, sem Loot
// Identity, exatamente como o loot garantido do Chefe Final já fazia
// desde a Sprint "First Dungeon, Final Boss & Complete Game Loop").
// `statSummary` é só descritivo (Fase 1 pede dado, não algoritmo) —
// nunca lido por nenhuma lógica de jogo, só pela HUD (flavor).
export interface UniqueRelicDefinition {
  id: string;
  name: string;
  description: string;
  dungeonId: string;
  bossId: string;
  rarity: string;
  lootIdentity: string;
  statSummary: string;
  flavorText: string;
}

export const UNIQUE_RELIC_DEFINITIONS: UniqueRelicDefinition[] = [
  {
    id: "relic-guardian-seal",
    name: "Selo do Guardião Esquecido",
    description: "Um anel de pedra escura, gravado com símbolos que nenhum vivo ainda decifrou.",
    dungeonId: "queda-da-fortaleza-sombria",
    bossId: "forgotten-guardian",
    rarity: "unique",
    lootIdentity: "unique-guardian-seal",
    statSummary: "Vida +, Inteligência + (tema: guardião ancestral, resistência silenciosa)",
    flavorText: "Ele guardou a passagem por tempo demais pra lembrar o que estava protegendo.",
  },
  {
    id: "relic-frost-crown",
    name: "Coroa de Gelo Eterno",
    description: "Uma coroa entalhada em gelo que nunca derrete, mesmo ao fogo mais intenso.",
    dungeonId: "fortaleza-congelada",
    bossId: "frost-king",
    rarity: "unique",
    lootIdentity: "unique-frost-crown",
    statSummary: "Vida +, Força + (tema: resistência, um trono que nunca cede)",
    flavorText: "Quem a usa sente o frio da Fortaleza Congelada mesmo sob o sol mais forte.",
  },
  {
    id: "relic-corrupted-mitre",
    name: "Mitra Corrompida",
    description: "Uma mitra de bispo, antes sagrada, agora manchada por uma corrupção que sussurra.",
    dungeonId: "catedral-esquecida",
    bossId: "corrupted-bishop",
    rarity: "unique",
    lootIdentity: "unique-corrupted-mitre",
    statSummary: "Inteligência +, Vida + (tema: fé quebrada, poder emprestado)",
    flavorText: "As orações que ele ainda murmura não são mais dirigidas a lugar nenhum de luz.",
  },
  {
    id: "relic-dragon-heart",
    name: "Coração do Dragão Ancião",
    description: "Um amuleto forjado do próprio coração do Dragão Ancião, ainda quente ao toque.",
    dungeonId: "covil-do-dragao",
    bossId: "ancient-dragon",
    rarity: "unique",
    lootIdentity: "unique-dragon-heart",
    statSummary: "Força +, Destreza + (tema: fúria contida, poder lendário)",
    flavorText: "Diz a lenda que o Deserto de Vidro nasceu do primeiro bater deste coração.",
  },
];

export function getUniqueRelicDefinition(id: string): UniqueRelicDefinition | undefined {
  return UNIQUE_RELIC_DEFINITIONS.find((relic) => relic.id === id);
}

// Fase 2 — "Cada Boss poderá declarar: uniqueRelics: [...] ou lista
// vazia. Toda leitura deve ser genérica." Mesmo padrão exato de
// dungeon/dungeonDefinitions.ts (DUNGEON_FINAL_BOSS_BY_EXPEDITION) —
// um Enemy Template (bossId) nunca aparece aqui sozinho decidindo seu
// próprio comportamento; é só uma chave num mapa externo.
export const BOSS_UNIQUE_RELICS: Record<string, string[]> = {
  "forgotten-guardian": ["relic-guardian-seal"],
  "frost-king": ["relic-frost-crown"],
  "corrupted-bishop": ["relic-corrupted-mitre"],
  "ancient-dragon": ["relic-dragon-heart"],
};

export function getUniqueRelicIdsForBoss(bossTemplateId: string): string[] {
  return BOSS_UNIQUE_RELICS[bossTemplateId] ?? [];
}
