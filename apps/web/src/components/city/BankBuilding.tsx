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
//
// City Foundation Phase I — Fase 3: papel comunicado mesmo bloqueado —
// "armazenamento; recursos; futuras economias". Fase 8: consulta (o que
// já existe) permanece gratuita; um futuro armazenamento extra além da
// mochila provavelmente vai depender de Ouro ou de reputação — decisão
// real fica pra docs/design/gold-architecture-phase1.md.
export function BankBuilding({ character }: BankBuildingProps) {
  return (
    <section className="city-building-screen">
      <h2>🏦 Banco</h2>
      <NpcIntro npc={NPCS.tesoureiro} />
      <p className="city-building-role">Responsável por: armazenamento; recursos; futuras economias.</p>
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
