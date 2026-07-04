import type { EquippedItem, ExpeditionCompact as ExpeditionCompactData } from "@streamrpg/shared";
import { FramedAvatar } from "../ui/FramedAvatar";
import { XpBar } from "../ui/XpBar";
import { EquipmentSlots } from "../ui/EquipmentSlots";
import { ExpeditionCompact } from "../ui/ExpeditionCompact";

// Sprint Landing Page 2.0 — "Mostrar o Perfil": personagem de exemplo,
// mesmos componentes reais do Perfil (`FramedAvatar`/`XpBar`/
// `EquipmentSlots`/`ExpeditionCompact`) — dados fabricados só para esta
// vitrine, rotulados como exemplo na tela.
const MOCK_EQUIPPED: EquippedItem[] = [
  { slot: "weapon", character_item_id: 1, name: "Espada da Aurora", rarity: "rare", damage_type: "physical", uti_bonus: 0 },
  { slot: "armor", character_item_id: 2, name: "Cota de Escamas", rarity: "uncommon", damage_type: "physical", uti_bonus: 2 },
  { slot: "amulet", character_item_id: 3, name: "Amuleto da Maré", rarity: "epic", damage_type: "magic", uti_bonus: 4 },
];

const MOCK_EXPEDITION: ExpeditionCompactData = {
  region_name: "Bosque Sussurrante",
  status: "exploring",
  progress_percent: 62,
  encounter: { category: "descoberta", icon: "🎁", text: "Encontrou um baú escondido entre as raízes." },
};

export function CharacterPreview() {
  return (
    <div className="character-preview">
      <span className="landing-example-tag">Exemplo ilustrativo</span>
      <div className="character-header">
        <FramedAvatar avatarUrl={null} frameTier="prata" baseClassName="character-avatar" />
        <div>
          <h3 style={{ margin: 0 }}>Kaio</h3>
          <p className="character-title">👑 Explorador</p>
          <span className="badge-level">Nível 14</span>
        </div>
      </div>
      <XpBar percent={68} label="680 XP no nível · faltam 320 para o próximo nível" />
      <ExpeditionCompact expedition={MOCK_EXPEDITION} />
      <h4 className="identity-subtitle">Equipamento</h4>
      <EquipmentSlots equipped={MOCK_EQUIPPED} />
    </div>
  );
}
