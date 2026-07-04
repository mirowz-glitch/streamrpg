import type { ChannelKingdomState, IdentityProfile } from "@streamrpg/shared";
import { HallOfFame } from "../ui/HallOfFame";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";

// Sprint Founder Identity & Prestige — mesmos 3 slugs de título usados
// para marcar "fundador" nesta Sprint (primeiro-aventureiro/founder-alpha
// já são globais; primeiro-reino é por Reino). Reaproveitado aqui, nunca
// redefinido.
const FOUNDER_TITLE_SLUGS = new Set(["primeiro-aventureiro", "founder-alpha", "primeiro-reino"]);

interface GuildBuildingProps {
  kingdom: ChannelKingdomState | null;
  identity: IdentityProfile | null;
}

// Sprint Capital City — reaproveita getHallOfFame (Sprint Kingdom
// Prestige System) e as Títulos de Fundador (Sprint Founder Identity &
// Prestige); nenhum dado novo, nenhuma consulta nova.
export function GuildBuilding({ kingdom, identity }: GuildBuildingProps) {
  const founderTitles = identity?.titles.filter((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)) ?? [];

  return (
    <section className="city-building-screen">
      <h2>🏛️ Guilda</h2>
      <NpcIntro npc={NPCS.guildmaster} />
      <p className="hint">O Hall da Fama do Reino — quem carrega os cargos mais importantes hoje.</p>

      {kingdom ? (
        <HallOfFame slots={kingdom.hall_of_fame} />
      ) : (
        <p className="hint">Informe um Reino na Praça Central para ver o Hall da Fama.</p>
      )}

      <h3 className="identity-subtitle">Fundadores</h3>
      {founderTitles.length > 0 ? (
        <ul className="city-founder-list">
          {founderTitles.map((title) => (
            <li key={title.id}>👑 {title.name}</li>
          ))}
        </ul>
      ) : (
        <p className="hint">Nenhum título de fundador conquistado ainda.</p>
      )}
    </section>
  );
}
