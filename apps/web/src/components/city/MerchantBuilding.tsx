import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { RARITY_LABEL } from "../../lib/rarity";
import type { MerchantOffer } from "../../lib/merchantOffers";

export interface SellFeedback {
  ok: boolean;
  message: string;
}

interface MerchantBuildingProps {
  // City Foundation Phase I — Fase 4 ("Sugestões Inteligentes"): texto
  // já pronto vindo de CityPage (citySuggestions.merchant,
  // apps/web/src/lib/citySuggestions.ts) — este componente nunca decide
  // sozinho quando mostrar, só exibe o que já foi calculado a partir do
  // Estado Global.
  suggestion?: string | null;
  // Merchant Phase I — Fase 6/7: dados/comando vêm prontos de CityPage.
  // Este componente NUNCA calcula preço, NUNCA muta saldo/inventário —
  // só apresenta `offers` e delega o clique a `onSell`, que já é a
  // única porta pra `POST /api/merchant/sell` (D2/D5,
  // docs/architecture/decisions.md: React nunca contém regra de
  // gameplay/negócio).
  offers: MerchantOffer[];
  onSell: (characterItemId: number) => Promise<SellFeedback>;
}

// Sprint Capital City — componente próprio. City Foundation Phase I —
// Fase 3: papel comunicado mesmo bloqueado. Merchant Phase I — Fase 6:
// primeira funcionalidade real (venda simples) — sem estoque próprio,
// sem barganha, sem confirmação por modal, sem animação (fora de
// escopo desta Sprint, ver docs/design/merchant-phase1.md).
export function MerchantBuilding({ suggestion = null, offers, onSell }: MerchantBuildingProps) {
  const [feedback, setFeedback] = useState<SellFeedback | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleSell(characterItemId: number) {
    setPendingId(characterItemId);
    setFeedback(null);
    const result = await onSell(characterItemId);
    setFeedback(result);
    setPendingId(null);
  }

  return (
    <section className="city-building-screen">
      <h2>🛒 Mercador</h2>
      <NpcIntro npc={NPCS.mercador} />
      <p className="city-building-role">Responsável por: compra; venda; avaliação de itens.</p>
      {suggestion ? <p className="city-building-suggestion">{suggestion}</p> : null}

      {feedback ? (
        <p className={feedback.ok ? "merchant-feedback-success" : "merchant-feedback-error"}>{feedback.message}</p>
      ) : null}

      {offers.length === 0 ? (
        <p className="hint">Nenhum item disponível para vender no momento.</p>
      ) : (
        <ul className="merchant-offer-list">
          {offers.map(({ item, saleValue }) => (
            <li key={item.id} className="merchant-offer-item">
              <span className="merchant-offer-name">{item.name}</span>
              <span className="merchant-offer-rarity">{RARITY_LABEL[item.rarity]}</span>
              <span className="merchant-offer-value">🪙 {saleValue}</span>
              <button type="button" disabled={pendingId === item.id} onClick={() => void handleSell(item.id)}>
                {pendingId === item.id ? "Vendendo..." : "Vender"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
