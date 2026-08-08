/**
 * Sprint 19 — Base Identity. Registro REAL de todas as 13 Bases hoje
 * existentes em `itemgen/baseItems.ts` (ITEM_GEN_BASE_ITEMS) — "toda
 * Base registrada" (Fase 3), diferente da Sprint 18 (que só pedia 2-3
 * exemplos QA). Nenhuma Base nova foi criada aqui — cada entrada só
 * referencia um `id` que já existe no catálogo procedural real.
 *
 * `weaponClass`/`armorClass` hoje coincidem 1:1 com o próprio `id`
 * (só existe UMA Base por família — nenhuma "Espada Curta"/"Espada
 * Longa" ainda) — o campo existe separado de propósito, pronto pro dia
 * em que Bases novas puderem compartilhar a mesma classe (Fase 2).
 *
 * Tier/Potential (Fase 6/7) refletem uma leitura honesta dos dados já
 * reais do Item Generator (`baseDamage`/`baseDefense`/`baseAttackSpeed`,
 * itemgen/baseItems.ts) — nunca um número arbitrário: a Base
 * numericamente mais forte da sua família tende a um Tier/Potential
 * mais alto. `ring` é a única exceção deliberada: além dos números
 * (accessory neutro, sem baseDamage/baseDefense), é a ÚNICA Base com um
 * caminho real pra um Item Mítico hoje (mythic/exampleMythics.ts,
 * Sprint 18) — por isso ganha Potential "exceptional", uma decisão de
 * identidade, não de estatística crua.
 *
 * Implicit Mods (Fase 4) usam os 4 exemplos LITERAIS do brief
 * (sword/axe/bow/ring) e completam as 9 Bases restantes no mesmo
 * espírito — "infraestrutura apenas", nenhum destes valores é somado a
 * item real nesta Sprint.
 */
import type { BaseIdentityRegistry } from "./types.js";

export const BASE_IDENTITY_REGISTRY: BaseIdentityRegistry = {
  // --- Weapons ---
  sword: {
    id: "sword",
    displayName: "Espada",
    category: "weapon",
    weaponClass: "sword",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Velocidade de Ataque", value: 8, unit: "percent" }],
    description: "Equilibrada entre dano e velocidade — a arma mais versátil do arsenal de qualquer aventureiro.",
    tags: ["physical", "speed"],
    enabled: true,
    potential: "medium",
    tier: 2,
    lore: { origin: "Forjada em todo canto do mundo, sem uma única civilização de origem." },
  },
  axe: {
    id: "axe",
    displayName: "Machado",
    category: "weapon",
    weaponClass: "axe",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Dano", value: 12, unit: "percent" }],
    description: "Pesado e brutal — corta fundo, mas nunca rápido.",
    tags: ["physical", "bleed"],
    enabled: true,
    potential: "medium",
    tier: 3,
    lore: {},
  },
  bow: {
    id: "bow",
    displayName: "Arco",
    category: "weapon",
    weaponClass: "bow",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Chance de Acerto Crítico", value: 6, unit: "percent" }],
    description: "Precisão à distância — recompensa quem sabe manter distância do perigo.",
    tags: ["physical", "critical"],
    enabled: true,
    potential: "medium",
    tier: 2,
    lore: {},
  },
  dagger: {
    id: "dagger",
    displayName: "Adaga",
    category: "weapon",
    weaponClass: "dagger",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Velocidade de Ataque", value: 10, unit: "percent" }],
    description: "A mais rápida de todas as armas — cada golpe é fraco, mas eles nunca param.",
    tags: ["physical", "speed", "critical"],
    enabled: true,
    potential: "low",
    tier: 1,
    lore: {},
  },
  staff: {
    id: "staff",
    displayName: "Cajado",
    category: "weapon",
    weaponClass: "staff",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Dano de Feitiço", value: 10, unit: "percent" }],
    description: "Canaliza magia bruta — a escolha de quem prefere destruir à distância com a mente, não com o braço.",
    tags: ["caster", "fire"],
    enabled: true,
    potential: "medium",
    tier: 3,
    lore: {},
  },
  wand: {
    id: "wand",
    displayName: "Varinha",
    category: "weapon",
    weaponClass: "wand",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Velocidade de Conjuração", value: 8, unit: "percent" }],
    description: "Leve e ágil — magia rápida para quem não quer esperar pelo próximo feitiço.",
    tags: ["caster", "speed"],
    enabled: true,
    potential: "low",
    tier: 1,
    lore: {},
  },
  mace: {
    id: "mace",
    displayName: "Maça",
    category: "weapon",
    weaponClass: "mace",
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Dano", value: 15, unit: "percent" }],
    description: "A mais lenta e a mais forte — cada golpe é uma decisão, nunca um reflexo.",
    tags: ["physical", "tank"],
    enabled: true,
    potential: "high",
    tier: 4,
    lore: {},
  },

  // --- Armor ---
  helmet: {
    id: "helmet",
    displayName: "Elmo",
    category: "armor",
    weaponClass: null,
    armorClass: "helmet",
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Resistência Física", value: 5, unit: "percent" }],
    description: "Protege a cabeça — o primeiro golpe que você nunca vê chegando.",
    tags: ["tank"],
    enabled: true,
    potential: "medium",
    tier: 2,
    lore: {},
  },
  chest: {
    id: "chest",
    displayName: "Peitoral",
    category: "armor",
    weaponClass: null,
    armorClass: "chest",
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Resistência Física", value: 8, unit: "percent" }],
    description: "A maior peça de proteção que um aventureiro pode vestir — onde a maior parte do dano é absorvida.",
    tags: ["tank"],
    enabled: true,
    potential: "high",
    tier: 3,
    lore: {},
  },
  gloves: {
    id: "gloves",
    displayName: "Luvas",
    category: "armor",
    weaponClass: null,
    armorClass: "gloves",
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Chance de Acerto Crítico", value: 5, unit: "percent" }],
    description: "Leves o bastante para não atrapalhar a mira, fortes o bastante para importar.",
    tags: ["tank", "critical"],
    enabled: true,
    potential: "low",
    tier: 1,
    lore: {},
  },
  boots: {
    id: "boots",
    displayName: "Botas",
    category: "armor",
    weaponClass: null,
    armorClass: "boots",
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Velocidade de Movimento", value: 10, unit: "percent" }],
    description: "Levam você mais rápido pra longe do perigo — ou mais rápido em direção a ele.",
    tags: ["tank", "speed"],
    enabled: true,
    potential: "low",
    tier: 1,
    lore: {},
  },

  // --- Accessories ---
  ring: {
    id: "ring",
    displayName: "Anel",
    category: "accessory",
    weaponClass: null,
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Magia", value: 8, unit: "percent" }],
    description: "Pequeno, discreto, e ainda assim capaz de carregar o destino de quem o usa.",
    tags: ["caster", "critical"],
    enabled: true,
    // Exceptional por identidade, não por número cru — ver comentário
    // no topo do arquivo: única Base com caminho real pra Mítico hoje.
    potential: "exceptional",
    tier: 3,
    lore: { origin: "Ninguém sabe dizer com certeza onde o primeiro anel foi forjado." },
  },
  amulet: {
    id: "amulet",
    displayName: "Amuleto",
    category: "accessory",
    weaponClass: null,
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Dano Mágico", value: 6, unit: "percent" }],
    description: "Usado sobre o peito, perto do coração — dizem que amplifica o que já vive dentro de quem o veste.",
    tags: ["caster"],
    enabled: true,
    potential: "medium",
    tier: 2,
    lore: {},
  },
  belt: {
    id: "belt",
    displayName: "Cinto",
    category: "accessory",
    weaponClass: null,
    armorClass: null,
    requiredLevel: 1,
    implicitMods: [{ statLabel: "Vida Máxima", value: 10, unit: "percent" }],
    description: "Discreto e frequentemente esquecido — até o momento em que faz a diferença entre sobreviver e não.",
    tags: ["tank"],
    enabled: true,
    potential: "low",
    tier: 1,
    lore: {},
  },
};
