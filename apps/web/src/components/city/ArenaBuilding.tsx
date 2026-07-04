import type { ChannelKingdomState, IdentityProfile } from "@streamrpg/shared";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { StatsRow } from "../ui/StatsRow";

interface ArenaBuildingProps {
  identity: IdentityProfile | null;
  kingdom: ChannelKingdomState | null;
}

// Sprint Capital City — só leitura. "Maior dano" não tem fonte de dado
// ainda (BossCombatSystem calcula dano por tick mas nunca persiste por
// personagem, só loga) — mostrado honestamente como "em breve", mesma
// convenção do resto da Sprint, em vez de inventar um número. Sprint NPCs
// Vivos — Kade apresenta o prédio.
export function ArenaBuilding({ identity, kingdom }: ArenaBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🏟️ Arena</h2>
      <NpcIntro npc={NPCS.mestreArena} />
      <p className="hint">Os feitos de combate contra os Bosses — somente leitura.</p>
      <StatsRow
        items={[
          { label: "Suas vitórias", value: identity?.bosses_defeated ?? 0, highlight: true },
          {
            label: "Bosses derrotados pelo Reino",
            value: kingdom ? kingdom.prestige.breakdown.bosses_defeated : "—",
          },
          { label: "Maior dano", value: "Em breve" },
        ]}
      />
    </section>
  );
}
