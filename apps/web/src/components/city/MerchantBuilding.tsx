import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

// Sprint Capital City — componente próprio, preparado para a loja real
// (Marketplace) numa Sprint futura; hoje só apresentação, nenhum
// catálogo, nenhuma compra/venda. Sprint NPCs Vivos — Talia apresenta o
// prédio.
export function MerchantBuilding() {
  return (
    <section className="city-building-screen">
      <h2>🛒 Mercador</h2>
      <NpcIntro npc={NPCS.mercador} />
      <p className="city-building-banner">Loja fechada</p>
      <p className="hint">Novas mercadorias chegam em breve.</p>
    </section>
  );
}
