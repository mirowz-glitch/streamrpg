import type { CharacterResponse } from "@streamrpg/shared";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { StatsRow } from "../ui/StatsRow";

interface BankBuildingProps {
  character: CharacterResponse | null;
}

// Sprint Capital City — só consulta (Gold/estatísticas já existentes em
// CharacterResponse); nenhum depósito, nenhum saque, nenhuma nova regra
// de Economy. Sprint NPCs Vivos — Dorwin apresenta o prédio.
export function BankBuilding({ character }: BankBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🏦 Banco</h2>
      <NpcIntro npc={NPCS.tesoureiro} />
      <p className="hint">Seu ouro estará seguro comigo — sem depósito, sem saque, só consulta.</p>
      {character ? (
        <StatsRow
          items={[
            { label: "Gold atual", value: character.gold.toFixed(1), highlight: true },
            { label: "Nível", value: character.level },
            { label: "XP total", value: character.xp },
            { label: "Minutos assistidos", value: character.total_minutes },
          ]}
        />
      ) : (
        <p className="loading-state">Carregando conta...</p>
      )}
    </section>
  );
}
