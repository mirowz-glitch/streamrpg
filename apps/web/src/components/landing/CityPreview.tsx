import { CityMap } from "../city/CityMap";
import { NpcIntro } from "../city/NpcIntro";
import { NPCS } from "../../lib/npcs";

// Sprint Landing Page 2.0 — "Mostrar a Cidade": o mesmo `CityMap`
// (Sprint Capital City) usado dentro do jogo, aqui só como vitrine —
// clicar num prédio na Landing não navega para lugar nenhum (visitante
// ainda não tem sessão), é só apresentação.
export function CityPreview() {
  return (
    <div>
      <CityMap onSelect={() => undefined} />
      <NpcIntro npc={NPCS.ferreiro} />
    </div>
  );
}
