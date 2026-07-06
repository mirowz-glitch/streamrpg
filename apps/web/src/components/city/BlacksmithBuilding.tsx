import type { EquippedItem } from "@streamrpg/shared";
import { EquipmentSlots } from "../ui/EquipmentSlots";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { isFlagSet } from "../../lib/onboarding";

interface BlacksmithBuildingProps {
  equipped: EquippedItem[];
}

// Sprint Capital City — reaproveita EquipmentSlots (Sprint Identity &
// Progression) tal como já existe no Perfil; nenhum dado novo, nenhuma
// forja real ainda. Sprint NPCs Vivos — Borin apresenta o prédio.
export function BlacksmithBuilding({ equipped }: BlacksmithBuildingProps) {
  // Sprint First 120 Seconds — Passo 7: fala única do Ferreiro depois que
  // o jogador já viu seu primeiro item (mesma flag client-side que
  // FirstItemCard já usa — nenhuma flag nova). Permanente, não some após
  // a primeira visita: é uma linha de contexto do mundo, não um toast.
  const hasSeenFirstItem = isFlagSet("first_item_announced");

  return (
    <section className="city-building-screen">
      <h2>🛠️ Ferreiro</h2>
      <NpcIntro npc={NPCS.ferreiro} />
      <p className="hint">Seus equipamentos atuais, prontos para a próxima forja.</p>
      {hasSeenFirstItem ? <p className="hint">"...acho que essas luvas serviram para alguma coisa."</p> : null}
      <EquipmentSlots equipped={equipped} />
      <p className="city-building-banner">Forja disponível em breve.</p>
    </section>
  );
}
