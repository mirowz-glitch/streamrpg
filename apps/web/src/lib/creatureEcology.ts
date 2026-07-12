import type { CreatureDefinition } from "./bestiary";
import { getRegionName } from "./bestiary";
import { RAVEN_SPECIES } from "./ravens";

// Sprint Creature Ecology Phase I — camada central, sem estado, sem
// persistência, sem backend: "o que torna esta criatura parte do
// mundo?". Cada criatura exibe NO MÁXIMO uma observação (nunca
// várias), decidida por prioridade fixa.
//
// REQUISITO ADICIONAL (obrigatório) — auditoria feita ANTES de
// escrever qualquer regra:
// 1. CreatureReader.tsx já reaproveita getCreatureMentions()
//    (knowledgeLinks.ts) pra mostrar "Também citado em" (Item/Livro/
//    História dos Viajantes/Rumor da Taverna/NPC) como uma PÁGINA
//    extra no final do registro (`pages`). Isso já cobre toda conexão
//    estruturada de `creature.connections` — repetir esse mesmo dado
//    aqui seria dívida técnica nova, exatamente o que o brief pede pra
//    evitar.
// 2. Por isso, Creature Ecology usa APENAS fontes que
//    getCreatureMentions/connections NUNCA toca: RAVEN_SPECIES (lib/
//    ravens.ts, isolado, nunca conectado a nenhuma UI antes), o próprio
//    campo `habitat` da criatura (nunca lido por knowledgeLinks.ts) e
//    `dangerLevel` (já exibido como fato cru "Periculosidade: X" — a
//    observação aqui nunca repete o rótulo, sempre acrescenta uma
//    consequência narrativa dele).
// 3. Renderizada como mais um item do array `facts` do CodexReader
//    (mesmo mecanismo de Habitat/Região/Periculosidade) — NUNCA como
//    página nova, diferente e sem sobrepor o mecanismo de
//    getCreatureMentions.
//
// Conexões reais mapeadas nesta auditoria:
// - Ravens (lib/ravens.ts): `corvo-do-bosque` menciona explicitamente
//   "território de lobo" e liga a presença de corvos a caçadas de
//   matilha no Bosque Sussurrante — grounding real pro Tier 1.
//   `corvo-das-montanhas`/`corvo-das-ruinas` também citam regiões reais
//   pelo nome (Picos Congelados/Ruínas Esquecidas) nos próprios campos
//   habitat/story.
// - Ruínas: 9 criaturas têm a palavra "ruínas" no próprio `habitat`
//   (grep confirmado) — dado já escrito na criatura, nunca inventado.
// - Periculosidade: `dangerLevel === "letal"` (19 criaturas, o tier
//   mais raro que existe) — usado como o tier mais baixo, só pra quem
//   não bateu em nenhuma fonte mais específica acima.
// - Folclore/Museu/Biblioteca/Itens/Profissões: auditados, sem
//   correspondência textual confiável (nenhuma menção literal de
//   criatura por nome/tipo) que não fosse inventar uma relação —
//   deixados de fora desta Fase, deliberadamente.
function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// Sprint Expedition Consequences Phase I — antes só o primeiro Tier
// que batesse decidia ("nunca combina duas"); agora TODOS os Tiers que
// batem viram uma lista ordenada (mesma prioridade/mesmos 3 Tiers de
// sempre, nenhum dado novo). `getCreatureEcologyLine` (abaixo) continua
// exatamente igual — `candidates[0] ?? null` é o mesmo valor que já
// era retornado antes desta Sprint, zero regressão pra quem só chama a
// versão singular. A lista completa existe só pra
// lib/expeditionConsequences.ts poder decidir, com base no Approach,
// mostrar mais de um Tier quando fizer sentido — esta função nunca
// decide isso sozinha.
export function getCreatureEcologyCandidates(creature: CreatureDefinition): string[] {
  const regionName = getRegionName(creature.regionId);
  const candidates: string[] = [];

  // Tier 1 — uma espécie real de corvo (lib/ravens.ts) já cita esta
  // mesma região pelo nome no próprio habitat/história, e a criatura é
  // do tipo "besta" (caçador/presa de matilha, mesmo perfil do lobo que
  // corvo-do-bosque descreve explicitamente).
  const relatedRaven = RAVEN_SPECIES.find(
    (raven) => includes(raven.habitat, regionName) || includes(raven.story, regionName),
  );
  if (relatedRaven && creature.type === "besta") {
    candidates.push("Corvos costumam aparecer depois que esta criatura é vista.");
  }

  // Tier 2 — o próprio habitat da criatura já menciona ruínas.
  if (includes(creature.habitat, "ruína")) {
    candidates.push("Dizem que algumas ruínas ficam silenciosas quando esta criatura aparece.");
  }

  // Tier 3 — periculosidade letal (o tier mais raro do jogo, 19
  // criaturas) — nunca repete o rótulo "Periculosidade: Letal", sempre
  // acrescenta a consequência: ninguém quer segui-la de perto.
  if (creature.dangerLevel === "letal") {
    candidates.push("Caçadores evitam seguir os rastros desta espécie.");
  }

  return candidates;
}

// Pura: mesma entrada, mesma saída, sempre. Prioridade fixa — a
// primeira fonte que bater decide, nunca combina duas.
export function getCreatureEcologyLine(creature: CreatureDefinition): string | null {
  return getCreatureEcologyCandidates(creature)[0] ?? null;
}
