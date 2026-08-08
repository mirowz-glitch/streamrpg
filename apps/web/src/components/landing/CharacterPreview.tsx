import type { EquippedItem, ExpeditionCompact as ExpeditionCompactData } from "@streamrpg/shared";
import { FramedAvatar } from "../ui/FramedAvatar";
import { XpBar } from "../ui/XpBar";
import { EquipmentSlots } from "../ui/EquipmentSlots";
import { ExpeditionCompact } from "../ui/ExpeditionCompact";

// Sprint Landing Page 2.0 — "Mostrar o Perfil": personagem de exemplo,
// mesmos componentes reais do Perfil (`FramedAvatar`/`XpBar`/
// `EquipmentSlots`/`ExpeditionCompact`) — dados fabricados só para esta
// vitrine, rotulados como exemplo na tela.
// Sprint 11 — Persistent Items + Affixes: campos novos preenchidos com
// o valor neutro (mesmo que o catálogo fixo pré-Sprint 11 recebe na
// migração) — esta vitrine nunca teve afixos/potencial/craft state de
// verdade, dado fabricado permanece fabricado.
const MOCK_PERSISTED_FIELDS = {
  item_level: null,
  seed: null,
  affixes: [],
  potential: null,
  quality: { value: 0, scalesAttribute: "" },
  craft_state: "open" as const,
  history: null,
  // Sprint 14 — Legendary Items + Legacy System: mesmo princípio, `null`
  // neutro — esta vitrine nunca teve histórico de verdade.
  legacy: null,
  legacyEvents: [],
  legacySummary: null,
  // Sprint 15 — Sockets + Gem System (Foundation): mesmo princípio, `null`
  // neutro — esta vitrine nunca teve Sockets de verdade.
  sockets: null,
  // Sprint 16 — Economy Foundation: mesmo princípio, `false` neutro —
  // esta vitrine nunca teve Esfera da Incerteza de verdade.
  uncertaintyEligible: false,
  // Sprint 18 — Mythic Foundation: mesmo princípio, `null` neutro —
  // esta vitrine nunca teve Item Mítico de verdade.
  mythicOrigin: null,
  // Sprint 19 — Base Identity: mesmo princípio, `null` neutro — esta
  // vitrine nunca teve BaseIdentity de verdade.
  baseIdentity: null,
  socketGems: null,
  socketGemEffects: null,
};

const MOCK_EQUIPPED: EquippedItem[] = [
  { slot: "weapon", character_item_id: 1, item_id: 1, name: "Espada da Aurora", rarity: "rare", damage_type: "physical", uti_bonus: 0, min_level: 1, power_score: null, upgrade_level: 0, ...MOCK_PERSISTED_FIELDS },
  { slot: "armor", character_item_id: 2, item_id: 2, name: "Cota de Escamas", rarity: "uncommon", damage_type: "physical", uti_bonus: 2, min_level: 1, power_score: null, upgrade_level: 0, ...MOCK_PERSISTED_FIELDS },
  { slot: "amulet", character_item_id: 3, item_id: 3, name: "Amuleto da Maré", rarity: "epic", damage_type: "magic", uti_bonus: 4, min_level: 1, power_score: null, upgrade_level: 0, ...MOCK_PERSISTED_FIELDS },
];

const MOCK_EXPEDITION: ExpeditionCompactData = {
  region_name: "Bosque Sussurrante",
  status: "exploring",
  progress_percent: 62,
  encounter: { category: "descoberta", icon: "🎁", text: "Encontrou um baú escondido entre as raízes." },
  // Sprint Expedition Consequences Phase I — dado fabricado (mesma
  // convenção de todo o resto deste mock), mostra a linha ambiente
  // nova na própria vitrine ilustrativa.
  approach: "investigate",
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
