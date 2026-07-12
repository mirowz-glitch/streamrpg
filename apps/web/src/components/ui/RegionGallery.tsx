import { memo } from "react";
import { REGIONS } from "../../lib/regions";
import { getRegionKnowledge } from "../../lib/knowledgeLinks";
import { getRegionDiscoveryCandidates } from "../../lib/discoveryChains";
import { getRegionCreatureThreadCandidates, getRegionSiblingRuinsThreadCandidates } from "../../lib/knowledgeThreads";
import { getNextSteps } from "../../lib/knowledgeNetwork";
import { EMPTY_ECHO_CONTEXT, getRegionGalleryEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";

interface RegionGalleryProps {
  // Sprint Expedition Echoes Phase I — opcional/default vazio: WorldPage/
  // Landing (sem personagem logado) continuam chamando sem prop nenhum,
  // comportamento idêntico ao de antes desta Sprint. Só NorthGateBuilding
  // (dentro da Cidade, com expedição real) passa um contexto de verdade.
  // CityPage memoiza este objeto por region/approach — preserva o memo
  // abaixo mesmo com o poll de 5s do useExpedition.
  echoContext?: ExpeditionEchoContext;
}

// Sprint World Simulation, Parte 4 — identidade das regiões já existentes
// no World Design (docs/world-design/regions.md). Nenhuma região nova,
// nenhum dado alterado; só transcrito para a tela.
//
// Sprint Performance Optimization — conteúdo majoritariamente estático;
// memo evita recriar esta lista toda vez que a página que a contém
// (Mundo/Portão Norte) re-renderiza por outro motivo (ex: o relógio
// atualizando a cada segundo) — `echoContext` precisa ser uma referência
// estável (useMemo no chamador) pra este memo continuar funcionando.
//
// Sprint Living Knowledge — "Histórias" e "Ruínas" por região, os
// únicos dois catálogos já existentes com `regionId` real (rumores,
// livros e eventos não têm esse campo hoje, por isso ficam de fora).
export const RegionGallery = memo(function RegionGallery({ echoContext = EMPTY_ECHO_CONTEXT }: RegionGalleryProps) {
  return (
    <div className="region-grid">
      {REGIONS.map((region) => {
        const knowledge = getRegionKnowledge(region.id);
        // Sprint Discovery Chains Phase I — reaproveita o mesmo
        // getRegionKnowledge acima, fraseado como sugestão ("o que
        // isto tem") em vez de lista factual.
        //
        // Sprint Knowledge Threads Phase I — criaturas nativas desta
        // região + outras regiões com ruínas reais ("o que é parecido
        // com isto").
        //
        // Sprint Knowledge Network Phase I — as duas fontes acima eram
        // renderizadas como DUAS linhas separadas — dívida eliminada:
        // `getNextSteps` combina, remove repetições e decide quantos
        // revelar (pickKnowledge, cap 1/3 por Approach) — uma única
        // linha "Próximo Passo".
        const nextSteps = getNextSteps(
          [
            getRegionDiscoveryCandidates(region.id),
            getRegionCreatureThreadCandidates(region.id),
            getRegionSiblingRuinsThreadCandidates(region.id),
          ],
          echoContext.approach,
        );
        // Sprint Expedition Echoes Phase I — no máximo um eco, só quando
        // a expedição atual do jogador tem esta região como destino real.
        const echoLine = getRegionGalleryEchoLine(region.name, echoContext);
        return (
          <div key={region.id} className="region-card">
            <strong className="region-name">{region.name}</strong>
            <span className="region-difficulty">{region.difficulty}</span>
            <p className="region-description">"{region.description}"</p>
            <span className="region-theme">{region.theme}</span>
            {knowledge.stories.length > 0 ? (
              <p className="region-knowledge">
                <span>Histórias: </span>
                {knowledge.stories.slice(0, 2).join(", ")}
                {knowledge.stories.length > 2 ? ` +${knowledge.stories.length - 2}` : ""}
              </p>
            ) : null}
            {knowledge.ruins.length > 0 ? (
              <p className="region-knowledge">
                <span>Ruínas: </span>
                {knowledge.ruins.slice(0, 2).join(", ")}
                {knowledge.ruins.length > 2 ? ` +${knowledge.ruins.length - 2}` : ""}
              </p>
            ) : null}
            {nextSteps.length > 0 ? <p className="region-knowledge">{nextSteps.join(" ")}</p> : null}
            {echoLine ? <p className="region-knowledge">{echoLine}</p> : null}
          </div>
        );
      })}
    </div>
  );
});
