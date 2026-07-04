import type { EquippedItem } from "@streamrpg/shared";
import { EquipmentSlots } from "../ui/EquipmentSlots";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

interface BlacksmithBuildingProps {
  equipped: EquippedItem[];
}

// Sprint Capital City — reaproveita EquipmentSlots (Sprint Identity &
// Progression) tal como já existe no Perfil; nenhum dado novo, nenhuma
// forja real ainda. Sprint NPCs Vivos — Borin apresenta o prédio.
export function BlacksmithBuilding({ equipped }: BlacksmithBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🛠️ Ferreiro</h2>
      <NpcIntro npc={NPCS.ferreiro} />
      <p className="hint">Seus equipamentos atuais, prontos para a próxima forja.</p>
      <EquipmentSlots equipped={equipped} />
      <p className="city-building-banner">Forja disponível em breve.</p>
    </section>
  );
}
