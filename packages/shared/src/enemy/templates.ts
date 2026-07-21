import type { EnemyTemplate } from "./types.js";

// Enemy System Phase I — requisito 1: um Enemy Template por tipo de
// inimigo. Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos das Sprints anteriores).
//
// `id`/`archetype`/`lootIdentityId` reaproveitam de propósito os
// mesmos ids já usados em packages/shared/src/lootidentity/
// lootIdentities.ts e archetypes.ts — nenhum dos dois é alterado,
// só referenciado, pra este sistema já nascer integrado com o Loot
// Identity existente (requisito 8). `region` reaproveita ids reais de
// packages/shared/src/regions.ts (REGION_GRAPH), também só lidos.
//
// Requisito 7 — "adicionar um novo inimigo deve exigir apenas: novo
// Enemy Template": inserir um novo registro nesta lista. Nenhuma outra
// parte desta camada (enemyStats.ts/instance.ts/combatant.ts) precisa
// mudar.
// Gameplay Balance & First Playable Experience Phase I — requisito 3:
// Wolf/Goblin são os únicos Enemy Templates usados pelas duas regiões
// iniciais de nível 1 (bosque-sussurrante/pantano-podre — ver
// worldencounter/encounterTables.ts), então são os únicos recalibrados
// nesta Sprint (Skeleton/Bandit/Bandit Captain/Boss atendem regiões de
// nível 10+/15+/60+, fora da janela dos "primeiros 10 minutos").
//
// Antes: um Wolf nível 1 (108 HP/15 dano/9 armadura) contra um Warrior
// nível 1 (145 HP/25 dano/17.5 armadura) consumia ~45-55% da vida do
// jogador por DUELO (Enemy System não tem regeneração entre inimigos
// do mesmo encontro — ver adventureLoop.ts) — um grupo de 2-3 lobos
// (packSizeOptions de bosque-sussurrante) matava o jogador quase
// sempre já no primeiro encontro (confirmado empiricamente: 100% de
// morte, sobrevivência média de ~29s na simulação de 100 aventuras
// antes deste ajuste). Valores recalibrados por simulação (ver
// packages/shared/src/simulation/) pra que um duelo dure poucos golpes
// e deixe margem real pra encontrar 2-3 inimigos seguidos sem morrer.
export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  {
    id: "wolf",
    name: "Wolf",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "wolf",
    baseStats: { strength: 2, dexterity: 4, intelligence: 1, vitality: 2 },
    growth: { strength: 0.3, dexterity: 0.35, intelligence: 0.1, vitality: 0.3 },
    futureFlags: {},
  },
  {
    id: "goblin",
    name: "Goblin",
    region: "pantano-podre",
    levelRange: { min: 1, max: 18 },
    archetype: "humanoid",
    lootIdentityId: "goblin",
    baseStats: { strength: 2, dexterity: 5, intelligence: 2, vitality: 2 },
    growth: { strength: 0.3, dexterity: 0.3, intelligence: 0.15, vitality: 0.3 },
    futureFlags: {},
  },
  // Biomes, Regions & World Progression Phase I — requisito 2:
  // "Identidade de Monstros" do Bosque Sussurrante (Lobo já existia,
  // Javali/Aranha são novos) — mesmo patamar de poder do Wolf já
  // calibrado (dano/vida próximos), pra não perturbar o balanceamento
  // da região feito na Sprint de Gameplay Balance.
  {
    id: "boar",
    name: "Boar",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "boar",
    baseStats: { strength: 3, dexterity: 3, intelligence: 1, vitality: 4 },
    growth: { strength: 0.35, dexterity: 0.3, intelligence: 0.1, vitality: 0.4 },
    futureFlags: {},
  },
  {
    id: "spider",
    name: "Spider",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "spider",
    baseStats: { strength: 2, dexterity: 5, intelligence: 1, vitality: 1 },
    growth: { strength: 0.25, dexterity: 0.4, intelligence: 0.1, vitality: 0.25 },
    futureFlags: {},
  },
  // Biomes, Regions & World Progression Phase I — requisito 9: a
  // simulação de longa duração (progressão automática de biomas)
  // mediu 100% de taxa de morte pra quem alcança Ruínas Esquecidas
  // mesmo depois de reduzir o tamanho do grupo (worldencounter/
  // encounterTables.ts) — Skeleton nunca tinha sido recalibrado desde
  // a Sprint original do Enemy System (antes de qualquer trabalho de
  // balanceamento existir no projeto). Reduzido na mesma proporção
  // aplicada a Wolf/Goblin na Sprint de Gameplay Balance, pra tirar
  // "região impossível" da lista de recomendações automáticas.
  {
    id: "skeleton",
    name: "Skeleton",
    region: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    archetype: "undead",
    lootIdentityId: "skeleton",
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): medido empiricamente (Simulador,
    // execuções forçadas da Dungeon) que o personagem estabiliza num
    // patamar de vida persistente de ~30-40% do máximo em Ruínas
    // Esquecidas (a regeneração entre encontros/checkpoints nunca
    // alcança recuperar mais que isso) — margem estreita demais pra
    // sobreviver às dezenas de encontros que a travessia de uma Dungeon
    // completa exige, eventualmente zerada por um pico de dano azarado
    // ("gambler's ruin"). `strength`/growth.strength reduzidos (~30%,
    // mesma técnica de redução aplicada a Wolf/Goblin na Sprint de
    // Gameplay Balance) — objetivo: elevar o patamar de vida estável
    // pra reduzir a chance acumulada de morte numa sessão longa, sem
    // tornar o Skeleton trivial (vitality/intelligence intocados).
    baseStats: { strength: 3, dexterity: 3, intelligence: 3, vitality: 7 },
    growth: { strength: 0.25, dexterity: 0.2, intelligence: 0.3, vitality: 0.7 },
    futureFlags: {},
  },
  {
    id: "bandit",
    name: "Bandit",
    region: "colinas-aridas",
    levelRange: { min: 15, max: 40 },
    archetype: "bandit",
    lootIdentityId: "bandit",
    baseStats: { strength: 10, dexterity: 14, intelligence: 4, vitality: 10 },
    growth: { strength: 1, dexterity: 1.3, intelligence: 0.3, vitality: 1 },
    futureFlags: {},
  },
  // Requisito 2 — "Identidade de Monstros" das Colinas Áridas: Hiena
  // nova, mesmo patamar de poder do Bandit já existente na região
  // (rápida e frágil, em vez de tática/organizada).
  {
    id: "hyena",
    name: "Hyena",
    region: "colinas-aridas",
    levelRange: { min: 15, max: 45 },
    archetype: "beast",
    lootIdentityId: "hyena",
    baseStats: { strength: 8, dexterity: 16, intelligence: 2, vitality: 8 },
    growth: { strength: 0.8, dexterity: 1.4, intelligence: 0.1, vitality: 0.8 },
    futureFlags: {},
  },
  {
    id: "bandit_captain",
    name: "Bandit Captain",
    region: "colinas-aridas",
    levelRange: { min: 20, max: 45 },
    archetype: "bandit",
    lootIdentityId: "bandit_captain",
    baseStats: { strength: 16, dexterity: 18, intelligence: 6, vitality: 16 },
    growth: { strength: 1.5, dexterity: 1.6, intelligence: 0.4, vitality: 1.5 },
    criticalMultiplier: 1.7,
    // Requisito 6 — já nasce marcado como candidato a Champion; nenhuma
    // lógica real lê isso ainda.
    futureFlags: { championEligible: true },
  },
  // Requisito 1/2 — Bioma novo (Minas Abandonadas, ver worldencounter/
  // biomes.ts): "constructos de pedra animados" (docs/world-design/
  // regions.md) — Enemy Template novo, nível 12-25 (nunca testado por
  // simulação antes desta Sprint, ver worldencounter/worldEncounter.test.ts).
  {
    id: "stone-construct",
    name: "Stone Construct",
    region: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    archetype: "construct",
    lootIdentityId: "stone-construct",
    baseStats: { strength: 14, dexterity: 6, intelligence: 2, vitality: 16 },
    growth: { strength: 1.2, dexterity: 0.4, intelligence: 0.1, vitality: 1.4 },
    futureFlags: {},
  },
  {
    id: "boss",
    name: "Boss",
    region: "fortaleza-sombria",
    levelRange: { min: 20, max: 80 },
    archetype: "boss",
    lootIdentityId: "boss",
    baseStats: { strength: 40, dexterity: 20, intelligence: 20, vitality: 60 },
    growth: { strength: 4, dexterity: 2, intelligence: 2, vitality: 6 },
    criticalMultiplier: 2.0,
    futureFlags: { isBoss: true, seasonModifierEligible: true, mapModifierEligible: true },
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2: "exatamente
  // UM Mini-Boss por bioma... não criar sistema novo, são apenas Enemy
  // Templates especiais." Colinas Áridas reaproveita bandit_captain (já
  // existia, já marcado championEligible — ver worldencounter/
  // encounterTables.ts, `miniBossTemplateId: "bandit_captain"`); os
  // outros 5 biomas ganham um template novo aqui, mesmo mecanismo de
  // sempre (arquétipo reaproveitado, nenhum novo criado). Poder
  // deliberadamente acima do inimigo comum da região (~1.8-2x), mas bem
  // abaixo do Boss final de fortaleza-sombria (que continua o único
  // `isBoss: true` do jogo).
  {
    id: "wolf-alpha",
    name: "Lobo Alfa",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "wolf-alpha",
    baseStats: { strength: 5, dexterity: 8, intelligence: 2, vitality: 6 },
    growth: { strength: 0.5, dexterity: 0.55, intelligence: 0.15, vitality: 0.5 },
    criticalMultiplier: 1.6,
    futureFlags: {},
  },
  {
    id: "swamp-witch",
    name: "Bruxa do Charco",
    region: "pantano-podre",
    levelRange: { min: 1, max: 18 },
    archetype: "mage",
    lootIdentityId: "swamp-witch",
    baseStats: { strength: 5, dexterity: 6, intelligence: 8, vitality: 6 },
    growth: { strength: 0.5, dexterity: 0.5, intelligence: 0.6, vitality: 0.5 },
    criticalMultiplier: 1.6,
    futureFlags: {},
  },
  {
    id: "ancient-construct",
    name: "Construto Ancião",
    region: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    archetype: "construct",
    lootIdentityId: "ancient-construct",
    baseStats: { strength: 20, dexterity: 8, intelligence: 4, vitality: 24 },
    growth: { strength: 1.6, dexterity: 0.5, intelligence: 0.15, vitality: 1.8 },
    criticalMultiplier: 1.5,
    futureFlags: {},
  },
  {
    id: "forgotten-guardian",
    name: "Guardião Esquecido",
    region: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    archetype: "undead",
    lootIdentityId: "forgotten-guardian",
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): medido empiricamente que o Chefe
    // Final nunca era derrotado (0/8 vitórias numa amostra de 50
    // Dungeons forçadas) — o personagem chega ao encontro já desgastado
    // por uma jornada de ~150-200 encontros (ver expeditions/
    // expeditionDefinitions.ts), e a diferença de poder original
    // (~4x o Skeleton comum) era grande demais pra esse estado.
    // strength/growth.strength reduzidos (~25%, mesma técnica já usada
    // em Skeleton/Wolf/Goblin) — continua sendo um Mini-Boss real
    // (ainda ~3x o Skeleton comum), só não uma parede intransponível.
    //
    // Balance, Pacing & Player Experience Phase I — Fase 3 (Boss): "HP;
    // dano." Mesmo após o corte de 25% acima, o diagnóstico desta
    // Sprint (before/quickCheck, combinando todas as amostras) mediu
    // 0/17 vitórias contra o Chefe — o corte anterior ainda não foi o
    // bastante pra um personagem que sobrevive a ~150-220 encontros
    // consecutivos sem descanso completo entre eles. Reduzido mais uma
    // vez (~15% adicional em strength/vitality/growth) — continua acima
    // do Skeleton comum (não trivial), mas não mais uma parede
    // matematicamente intransponível pro estado desgastado em que o
    // personagem realmente chega até ele.
    // Boss Accessibility & Endgame Balance Phase I — Fase 3 (Enemy
    // Templates): "HP; dano." Diagnóstico (bossaccess-before-dungeon-
    // report.md, 500 Dungeons): HP médio do jogador ao AVISTAR o Chefe
    // é de apenas 11% (Estado do Personagem, capturado ao vivo no exato
    // tick do encontro) — o jogador chega esgotado pela jornada, não
    // "perde uma luta justa". Reduzido HP (vitality 11->8, growth
    // 1.0->0.75) e dano (strength 7.5->6, growth 0.65->0.5) mais uma
    // vez. Efeito medido: HP restante do Boss quando o jogador perde
    // caiu de ~48% pra ~34-40% (o jogador causa mais dano relativo
    // antes de morrer) — mas a taxa de vitória permaneceu em 0% em
    // TODAS as amostras testadas (150 a 400 Dungeons, múltiplas
    // configurações). Investigado: com HP de chegada tão baixo (5-11%),
    // qualquer troca de golpes tende a matar o jogador antes de sua
    // própria ação valer — um limite estrutural do estado de chegada,
    // não da força do Chefe em si (Combat Engine/Adventure Loop, que
    // decidem a ordem de ataque, estão fora do escopo desta Sprint).
    // Mantido este corte (melhora real e mensurável de "HP do Boss ao
    // perder", mesmo sem cruzar pra vitória) — reverter não
    // desfaria o gargalo raiz. Ver "Recomendações" na entrega final.
    baseStats: { strength: 6, dexterity: 7, intelligence: 9, vitality: 8 },
    growth: { strength: 0.5, dexterity: 0.5, intelligence: 0.8, vitality: 0.75 },
    criticalMultiplier: 1.6,
    futureFlags: {},
  },
  {
    id: "dark-knight",
    name: "Cavaleiro Negro",
    region: "fortaleza-sombria",
    levelRange: { min: 20, max: 80 },
    archetype: "humanoid",
    lootIdentityId: "dark-knight",
    baseStats: { strength: 24, dexterity: 16, intelligence: 8, vitality: 30 },
    growth: { strength: 2.0, dexterity: 1.0, intelligence: 0.3, vitality: 2.4 },
    criticalMultiplier: 1.8,
    futureFlags: {},
  },
];

export function getEnemyTemplate(id: string): EnemyTemplate | undefined {
  return ENEMY_TEMPLATES.find((template) => template.id === id);
}
