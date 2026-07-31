import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { RARITY_LABEL } from "../../lib/rarity";
import type { SalvageOffer } from "../../lib/salvageOffers";

export interface DismantleFeedback {
  ok: boolean;
  message: string;
}

interface SalvageBuildingProps {
  // Salvage Phase I — Fase 6/7: dados/comando vêm prontos de CityPage,
  // mesma disciplina de Merchant/Blacksmith: este componente NUNCA
  // calcula recompensa, NUNCA muta recurso/inventário — só apresenta
  // `offers` e delega o clique a `onDismantle`, a única porta pra
  // POST /api/salvage.
  offers: SalvageOffer[];
  onDismantle: (characterItemId: number) => Promise<DismantleFeedback>;
}

// Salvage Phase I — Fase 6: prédio novo (achado da Fase 1 — não existia
// nenhum placeholder de Sucateiro até esta Sprint). UI mínima: lista de
// itens elegíveis (mochila inteira, equipados ou não — Seção 9 da prep
// doc), recursos previstos, botão "Desmontar", feedback — sem filtros,
// múltiplos itens, confirmação ou animação (fora de escopo, ver
// docs/design/salvage-phase1.md).
export function SalvageBuilding({ offers, onDismantle }: SalvageBuildingProps) {
  const [feedback, setFeedback] = useState<DismantleFeedback | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleDismantle(characterItemId: number) {
    setPendingId(characterItemId);
    setFeedback(null);
    const result = await onDismantle(characterItemId);
    setFeedback(result);
    setPendingId(null);
  }

  return (
    <section className="city-building-screen">
      <h2>♻️ Sucateiro</h2>
      <NpcIntro npc={NPCS.sucateiro} />
      <p className="city-building-role">Responsável por: desmontagem de equipamentos; recursos.</p>

      {feedback ? (
        <p className={feedback.ok ? "salvage-feedback-success" : "salvage-feedback-error"}>{feedback.message}</p>
      ) : null}

      {offers.length === 0 ? (
        <p className="hint">Nenhum equipamento elegível para desmontagem no momento.</p>
      ) : (
        <ul className="salvage-offer-list">
          {offers.map(({ item, rewards }) => (
            <li key={item.id} className="salvage-offer-item">
              <span className="salvage-offer-name">{item.name}</span>
              <span className="salvage-offer-rarity">{RARITY_LABEL[item.rarity]}</span>
              <span className="salvage-offer-rewards">
                {rewards.map((r) => `♻️ ${r.amount}`).join(", ")}
              </span>
              <button type="button" disabled={pendingId === item.id} onClick={() => void handleDismantle(item.id)}>
                {pendingId === item.id ? "Desmontando..." : "Desmontar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
