import { CityMap } from "../city/CityMap";
import { NpcIntro } from "../city/NpcIntro";
import { NPCS } from "../../lib/npcs";
import { feedbackClassName } from "../../lib/uiFeedback";
import { getMicroEvent } from "../../lib/microEvents";
import { getWorldCohesionLine } from "../../lib/worldCohesion";

interface CityPreviewProps {
  // Sprint Live Readiness Phase I (First 5 Minutes) — já decidido por
  // LoginPage (lib/liveReadiness.ts); um visitante anônimo nunca tem
  // PlayerFacts reais, então o próprio NpcIntro nunca teria seu destaque
  // interno ativo aqui — CityPreview aplica o realce por fora, só na
  // vitrine.
  highlighted?: boolean;
}

// Sprint Landing Page 2.0 — "Mostrar a Cidade": o mesmo `CityMap`
// (Sprint Capital City) usado dentro do jogo, aqui só como vitrine —
// clicar num prédio na Landing não navega para lugar nenhum (visitante
// ainda não tem sessão), é só apresentação.
export function CityPreview({ highlighted = false }: CityPreviewProps) {
  const highlightCls = feedbackClassName("softGlow");
  // Sprint Living Kingdom Phase I (Micro Events) — mesma camada central
  // usada em CityPage (praça real), aqui sem contexto de evento/
  // população (visitante anônimo não tem nenhum dos dois) — mesmo
  // padrão de retrocompatibilidade já usado pelo resto da vitrine
  // (NpcIntro/CityMap também renderizam sem dado real de jogador).
  const microEventLine = getMicroEvent("praca");
  // Sprint World Cohesion Phase I (Connected World) — mesma camada
  // central usada em CityPage (praça real), aqui sem contexto (mesmo
  // padrão de retrocompatibilidade já usado por Micro Events na
  // vitrine).
  const worldCohesionLine = getWorldCohesionLine("praca");
  return (
    <div className={highlighted ? highlightCls : undefined}>
      <CityMap onSelect={() => undefined} />
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      <NpcIntro npc={NPCS.ferreiro} />
    </div>
  );
}
