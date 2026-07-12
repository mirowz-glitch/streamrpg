import type { ExpeditionApproach } from "@streamrpg/shared";
import { pickKnowledge } from "./knowledgeRewards";

// Sprint Knowledge Network Phase I — camada central, sem estado, sem
// persistência, sem backend/tabela/sistema/quest novo: "qual é o
// próximo passo mais natural dentro da rede de conhecimento que já
// existe?". Ela NÃO cria conexões, NÃO inventa relações — só COMBINA
// listas de candidatos reais que outras camadas já calculam
// (DiscoveryChains = "o que isto menciona", KnowledgeThreads = "o que
// é parecido com isto"), remove repetições, e devolve quantos passos
// revelar via `pickKnowledge` (KnowledgeRewards, já existente,
// reaproveitado sem alterar).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// código:
// - DiscoveryChains + KnowledgeThreads já resolvem TODA a parte
//   difícil (encontrar a conexão real) para livro/criatura/item/
//   região/museu — cada um devolvendo sua PRÓPRIA lista de candidatos
//   ordenada. Esta Sprint NÃO recalcula nenhuma conexão nova.
// - REFACTOR OBRIGATÓRIO — achado real: CreatureReader, MuseumReader,
//   RegionGallery e InventoryPage cada um já renderizava DUAS linhas
//   de "próximo passo" lado a lado (Descoberta + "Também pode
//   interessar"), cada uma decidida por uma camada diferente, sem
//   nenhuma das duas saber da outra — risco real de repetição textual
//   (nenhuma ainda encontrada, mas nenhuma garantia contra isso) e
//   claramente "dois Readers decidindo a sequência" em vez de "uma
//   única camada". Consolidado: os dois grupos de candidatos agora
//   passam por `getNextSteps` (dedupe + pickKnowledge) e viram UMA
//   única linha "Próximo Passo", nunca duas.
// - BookReader: auditado — só tem uma fonte de "próximo passo"
//   (Discovery Chains; nenhuma função de Knowledge Threads foi
//   escrita pra Livro, porque Livro→Criatura/Item/NPC já é coberto
//   por Discovery Chains). Nada a consolidar ali; deixado como está.
// - "Nunca repetir o que já está sendo mostrado na própria tela": o
//   dedupe abaixo é por IGUALDADE TEXTUAL exata — cada candidato já
//   nasce como uma frase única (nome real embutido), então duas fontes
//   só colidem se, por coincidência, gerarem a MESMA frase — o Set
//   cobre esse caso sem precisar de nenhuma lista de exclusão manual.
// - Zero loop possível: `getNextSteps` não recursa, não segue uma
//   conexão até a próxima entidade (não "anda" pela rede) — só combina
//   listas já prontas, uma vez, sempre determinístico.
export function getNextSteps(candidateGroups: readonly (readonly string[])[], approach: ExpeditionApproach | null): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const group of candidateGroups) {
    for (const candidate of group) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      merged.push(candidate);
    }
  }
  return pickKnowledge(merged, approach);
}
