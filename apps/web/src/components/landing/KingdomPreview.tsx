import type { KingdomHallOfFameSlot, TimelineEvent } from "@streamrpg/shared";
import { KINGDOM_ROLE_CATALOG } from "@streamrpg/shared";
import { HallOfFame } from "../ui/HallOfFame";
import { Timeline } from "../ui/Timeline";

// Sprint Landing Page 2.0 — "Mostrar o Reino": mock ilustrativo (Etapa
// pede explicitamente "criar um mock elegante... usando componentes
// reais"). `HallOfFame`/`Timeline` são os componentes reais do Kingdom
// Prestige System/World Simulation; os dados abaixo são fabricados só
// para este exemplo (rotulado como exemplo na tela, nunca apresentado
// como dado real de um jogador).
const MOCK_HOLDERS: Record<string, { display_name: string; held_since: string } | null> = {
  guardiao: { display_name: "Hudson", held_since: new Date().toISOString() },
  "campeao-bosses": { display_name: "Ashley", held_since: new Date().toISOString() },
  "grande-explorador": { display_name: "Kaio", held_since: new Date().toISOString() },
  "heroi-reino": { display_name: "Luma", held_since: new Date().toISOString() },
  "membro-antigo": { display_name: "Dexx", held_since: new Date().toISOString() },
  "maior-sequencia": { display_name: "Vic", held_since: new Date().toISOString() },
};

const MOCK_HALL_OF_FAME: KingdomHallOfFameSlot[] = KINGDOM_ROLE_CATALOG.map((role) => {
  const holder = MOCK_HOLDERS[role.slug];
  return {
    role: role.slug,
    role_name: role.name,
    icon: role.icon,
    holder: holder ? { character_id: role.slug, display_name: holder.display_name, avatar_url: null, held_since: holder.held_since } : null,
  };
});

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: "mock-1", text: "👑 Hudson tornou-se Guardião do Reino.", timestamp: Date.now() - 60_000 },
  { id: "mock-2", text: "O Boss foi derrotado!", timestamp: Date.now() - 240_000 },
  { id: "mock-3", text: "Ashley concluiu uma expedição em Minas Abandonadas.", timestamp: Date.now() - 480_000 },
];

export function KingdomPreview() {
  return (
    <div className="kingdom-preview">
      <span className="landing-example-tag">Exemplo ilustrativo</span>
      <div className="kingdom-preview-prestige">
        <span>Prestígio do Reino</span>
        <strong>1.240</strong>
      </div>
      <HallOfFame slots={MOCK_HALL_OF_FAME} />
      <h3 className="identity-subtitle">Linha do tempo</h3>
      <Timeline events={MOCK_TIMELINE} idleFlavor="O Reino está tranquilo." />
    </div>
  );
}
