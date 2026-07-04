import { memo } from "react";
import type { IdentityProfile } from "@streamrpg/shared";
import { FRAME_TIER_LABEL } from "../../lib/identity";
import { StatsRow } from "./StatsRow";

interface IdentityPanelProps {
  identity: IdentityProfile;
  onEquipTitle: (titleId: number) => void;
  onUnequipTitle: () => void;
  onEquipFrame: (frameId: number) => void;
  onUnequipFrame: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Sprint Founder Identity & Prestige, Etapa 3 — seção de Perfil: título,
// moldura, data de criação, primeira expedição, Bosses derrotados,
// regiões descobertas, mais a lista de títulos/molduras já
// desbloqueados com botão de equipar/remover. Puramente cosmético —
// nenhum valor aqui é lido por XP/Gold/Combat/Boss. Recebe `identity`
// pronto (CharacterPage já busca uma vez, para também colorir a moldura
// do avatar no cabeçalho sem um segundo fetch).
//
// Sprint Performance Optimization — memo evita re-renderizar a lista de
// títulos/molduras a cada tick do cooldown de ping; exige que
// CharacterPage passe os 4 callbacks com referência estável (useCallback).
export const IdentityPanel = memo(function IdentityPanel({
  identity,
  onEquipTitle,
  onUnequipTitle,
  onEquipFrame,
  onUnequipFrame,
}: IdentityPanelProps) {
  const unlockedTitles = identity.titles.filter((t) => t.unlocked);
  const unlockedFrames = identity.frames.filter((f) => f.unlocked);

  return (
    <section className="identity-panel">
      <h2>Identidade</h2>

      <StatsRow
        items={[
          {
            label: "Título",
            value: identity.equipped_title ? identity.equipped_title.name : "Nenhum",
            highlight: true,
          },
          {
            label: "Moldura",
            value: identity.equipped_frame ? FRAME_TIER_LABEL[identity.equipped_frame.tier] : "Nenhuma",
          },
          { label: "Personagem criado em", value: formatDate(identity.created_at) },
          { label: "Primeira expedição", value: formatDate(identity.first_expedition_at) },
          { label: "Bosses derrotados", value: identity.bosses_defeated },
          { label: "Regiões descobertas", value: identity.regions_discovered },
        ]}
      />

      <h3 className="identity-subtitle">Títulos desbloqueados ({unlockedTitles.length}/{identity.titles.length})</h3>
      {unlockedTitles.length === 0 ? (
        <p className="hint">Nenhum título desbloqueado ainda — continue jogando para conquistar o primeiro.</p>
      ) : (
        <ul className="identity-unlock-list">
          {unlockedTitles.map((title) => {
            const equipped = identity.equipped_title?.id === title.id;
            return (
              <li key={title.id} className={equipped ? "identity-unlock-equipped" : ""}>
                <div>
                  <strong>{title.name}</strong>
                  <p className="item-desc">{title.description}</p>
                </div>
                {equipped ? (
                  <button onClick={() => onUnequipTitle()}>Remover</button>
                ) : (
                  <button onClick={() => onEquipTitle(title.id)}>Equipar</button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="identity-subtitle">Molduras desbloqueadas ({unlockedFrames.length}/{identity.frames.length})</h3>
      {unlockedFrames.length === 0 ? (
        <p className="hint">Nenhuma moldura desbloqueada ainda.</p>
      ) : (
        <ul className="identity-unlock-list">
          {unlockedFrames.map((frame) => {
            const equipped = identity.equipped_frame?.id === frame.id;
            return (
              <li key={frame.id} className={equipped ? "identity-unlock-equipped" : ""}>
                <div>
                  <strong>{frame.name}</strong>
                  <p className="item-desc">Tier: {FRAME_TIER_LABEL[frame.tier]}</p>
                </div>
                {equipped ? (
                  <button onClick={() => onUnequipFrame()}>Remover</button>
                ) : (
                  <button onClick={() => onEquipFrame(frame.id)}>Equipar</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
