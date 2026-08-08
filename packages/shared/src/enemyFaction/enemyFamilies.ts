import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import type { EnemyFamily } from "./types.js";

// Fase 4 — Enemy Families. Agrupa os 22 Enemy Templates reais
// (enemy/templates.ts) por identidade de espécie/cultura — nenhum
// monstro novo inventado, cada `templateIds` entry referencia um `id`
// real. "Cada família pertence exatamente a uma Facção" (Decisão
// Oficial #2) — verificado por teste (enemyFaction.test.ts).
//
// Mapeamento e justificativa (auditoria Fase 1, `enemy/templates.ts`):
// - Lobo/Javali/Aranha/Hiena -> Bestas (archetype "beast" real de
//   todos os 6 templates da família Lobo/Javali/Aranha/Hiena).
// - Goblin -> Goblins (único template humanoid da região pantano-podre,
//   nome já bate 1:1 com a Facção).
// - Esqueleto/Guardião Esquecido -> Mortos-Vivos (archetype "undead").
// - Bandido/Capitão Bandido -> Bandidos (archetype "bandit", nome já
//   bate 1:1).
// - Construtos (Stone/Ancient/Ice/Frost King) -> Império: nenhuma
//   Facção "Construtos" existe no brief; tratados como guardiões/
//   máquinas de guerra de um império antigo (mesma leitura já sugerida
//   pelo termo "Ancient" em 2 dos 4 templates) — decisão autoral
//   documentada, não uma leitura literal de dado pré-existente.
// - Cavaleiro Negro + Boss (fortaleza-sombria) -> Império: bate 1:1 com
//   a facção de reputação já existente "Legião Sombria" (`factions/
//   factionDefinitions.ts`, region fortaleza-sombria, alignment
//   "Tirania") — é literalmente o exemplo do usuário ("preciso farmar
//   os Cavaleiros Negros"), confirmando a leitura.
// - Bruxa do Charco + Acólito/Bispo Corrompido + Cultista Flamejante ->
//   Cultistas: todos têm "corrompido"/"culto"/"bruxa" no nome ou tema;
//   Acólito/Bispo Corrompido também batem 1:1 com a facção de
//   reputação "Culto das Ruínas" (litoral-quebrado). Bruxa do Charco e
//   Cultista Flamejante vivem em REGIÕES de outras facções de
//   reputação (Guardiões da Floresta / Legião Sombria) — demonstração
//   deliberada de que Enemy Faction (cultura do monstro) e Reputation
//   Faction (controle político da região) são eixos independentes.
// - Dragão Ancião -> Demônios: archetype "demon", nenhuma Facção
//   "Dragões" existe no brief; decisão autoral documentada.
export const ENEMY_FAMILIES: readonly EnemyFamily[] = [
  { id: "familia-lobo", name: "Família Lobo", factionId: "bestas", templateIds: ["wolf", "wolf-alpha", "frost-wolf"] },
  { id: "familia-javali", name: "Família Javali", factionId: "bestas", templateIds: ["boar"] },
  { id: "familia-aranha", name: "Família Aranha", factionId: "bestas", templateIds: ["spider"] },
  { id: "familia-hiena", name: "Família Hiena", factionId: "bestas", templateIds: ["hyena"] },
  { id: "familia-goblin", name: "Família Goblin", factionId: "goblins", templateIds: ["goblin"] },
  { id: "familia-esqueleto", name: "Família Esqueleto", factionId: "mortos-vivos", templateIds: ["skeleton", "forgotten-guardian"] },
  { id: "familia-bandido", name: "Família Bandido", factionId: "bandidos", templateIds: ["bandit", "bandit_captain"] },
  { id: "familia-construto", name: "Família Construto", factionId: "imperio", templateIds: ["stone-construct", "ancient-construct", "ice-golem", "frost-king"] },
  { id: "familia-cavaleiro-negro", name: "Família Cavaleiro Negro", factionId: "imperio", templateIds: ["dark-knight", "boss"] },
  { id: "familia-culto-corrompido", name: "Família Culto Corrompido", factionId: "cultistas", templateIds: ["swamp-witch", "corrupted-acolyte", "corrupted-bishop", "fire-cultist"] },
  { id: "familia-dragao", name: "Família Dragão", factionId: "demonios", templateIds: ["ancient-dragon"] },
] as const;

export function getEnemyFamily(id: string): EnemyFamily | undefined {
  return ENEMY_FAMILIES.find((family) => family.id === id);
}

export function listEnemyFamilies(): readonly EnemyFamily[] {
  return ENEMY_FAMILIES;
}

export function getFamilyForTemplate(templateId: string): EnemyFamily | undefined {
  return ENEMY_FAMILIES.find((family) => family.templateIds.includes(templateId));
}

export function listFamiliesForFaction(factionId: string): readonly EnemyFamily[] {
  return ENEMY_FAMILIES.filter((family) => family.factionId === factionId);
}

// Todo Enemy Template real que NÃO aparece em nenhuma Família — dado
// que falta, nunca lógica que falta (mesmo princípio de encounterTables.ts).
// Vazio hoje: os 22 templates reais estão todos cobertos.
export function listUnfamiliedTemplateIds(): string[] {
  const familied = new Set(ENEMY_FAMILIES.flatMap((family) => family.templateIds));
  return ENEMY_TEMPLATES.map((template) => template.id).filter((id) => !familied.has(id));
}
