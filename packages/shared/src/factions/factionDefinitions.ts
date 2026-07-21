import type { FactionDefinition, FactionRank } from "./types.js";

// Requisito 3 — Reputação: escada de ranks compartilhada por todas as
// facções (mesmos limiares/bônus, dado ilustrativo). "Respeitado" é o
// rank citado literalmente no mockup de HUD da Sprint.
//
// Limiares calibrados empiricamente via o Simulador (requisito 7/8,
// ver scripts/runBalanceSimulation.ts): a primeira versão ("amigavel"
// em 30) fazia o bônus de XP/ouro nunca se manifestar de verdade numa
// sessão de 100 execuções — a maioria completa só 2 Expedições em
// ~600s simulados, e a 2ª conclusão (a que normalmente cruzaria 30 de
// reputação) sempre usa o rank de ANTES dela mesma (ver
// factionController.ts), então o bônus só apareceria numa 3ª conclusão
// que a maioria das sessões nunca alcança. "amigavel" em 15 (alcançável
// já na 1ª conclusão de Expedição, +15 de reputação) garante que a 2ª
// conclusão (e futuras) já vejam o bônus reduzido de forma real na
// amostra observada.
function standardRanks(): FactionRank[] {
  return [
    { id: "neutro", name: "Neutro", minReputation: 0, reward: {} },
    { id: "amigavel", name: "Amigável", minReputation: 15, reward: { xpBonusPercent: 5, goldBonusPercent: 5 } },
    { id: "respeitado", name: "Respeitado", minReputation: 50, reward: { xpBonusPercent: 10, goldBonusPercent: 10 } },
    { id: "honrado", name: "Honrado", minReputation: 100, reward: { xpBonusPercent: 15, goldBonusPercent: 15 } },
    { id: "lendario", name: "Lendário", minReputation: 180, reward: { xpBonusPercent: 20, goldBonusPercent: 20 } },
  ];
}

// Requisito 2 — Facções iniciais: os 4 exemplos literais da Sprint.
// `regions` decide qual facção é "Facção Atual" na HUD (uma por bioma,
// sem sobreposição — ver factionProgress.ts); os GATILHOS de reputação
// de cada uma (ver factionController.ts) não ficam presos a essas
// regiões, exceto pela conclusão de Expedição (sempre atribuída à
// facção dona do bioma inicial da Expedição concluída).
export const FACTION_DEFINITIONS: FactionDefinition[] = [
  {
    id: "guardioes-da-floresta",
    name: "Guardiões da Floresta",
    description: "Protetores antigos do Bosque Sussurrante e do Pântano Podre, hostis a tudo que corrompe a natureza.",
    regions: ["bosque-sussurrante", "pantano-podre"],
    alignment: "Ordem Natural",
    ranks: standardRanks(),
  },
  {
    id: "mercadores-livres",
    name: "Mercadores Livres",
    description: "Uma rede de caravanas e postos de troca que atravessa todas as regiões, neutra em qualquer conflito.",
    regions: ["colinas-aridas"],
    alignment: "Neutro",
    ranks: standardRanks(),
  },
  {
    id: "culto-das-ruinas",
    name: "Culto das Ruínas",
    description: "Estudiosos obcecados pelos segredos enterrados nas Ruínas Esquecidas.",
    regions: ["ruinas-esquecidas"],
    alignment: "Oculto",
    ranks: standardRanks(),
  },
  {
    id: "legiao-sombria",
    name: "Legião Sombria",
    description: "Uma força de conquista que domina as Minas Abandonadas e a Fortaleza Sombria, e respeita apenas o poder.",
    regions: ["minas-abandonadas", "fortaleza-sombria"],
    alignment: "Tirania",
    ranks: standardRanks(),
  },
];

export function getFactionDefinition(id: string): FactionDefinition | undefined {
  return FACTION_DEFINITIONS.find((definition) => definition.id === id);
}

// Requisito 5 — HUD ("Facção Atual"): a facção dona do bioma atual do
// jogador — uma por região, sem ambiguidade (ver comentário acima sobre
// `regions`). `undefined` pra qualquer região ainda sem facção dona
// (dado que falta, nunca lógica que falta).
export function getFactionForRegion(regionId: string): FactionDefinition | undefined {
  return FACTION_DEFINITIONS.find((definition) => definition.regions.includes(regionId));
}

// Requisito 3 — Rank atual: o último rank cujo `minReputation` a
// reputação já alcançou (ranks sempre ordenados ascendentemente em
// `standardRanks()`, então o último match é sempre o mais alto
// alcançável).
export function getRankForReputation(faction: FactionDefinition, reputation: number): FactionRank {
  let current = faction.ranks[0];
  for (const rank of faction.ranks) {
    if (reputation >= rank.minReputation) current = rank;
  }
  return current;
}

export function getNextRank(faction: FactionDefinition, reputation: number): FactionRank | null {
  return faction.ranks.find((rank) => rank.minReputation > reputation) ?? null;
}
