import { memo } from "react";
import { useAdventureSession } from "../../hooks/useAdventureSession";
import { formatRelativeTime } from "../../lib/adventureLiveState";
import { buildRecentFinds } from "../../lib/backpackFinds";
import { buildLastJourneySummary } from "../../lib/backpackJourney";
import { deriveBackpackSignals } from "../../lib/backpackSignals";

interface BackpackNarrativePanelProps {
  // Único dado que precisa vir de fora: a contagem REAL da lista
  // persistida que InventoryPage já busca (GET /api/items) — a
  // Mochila em si (Fase 5) precisa saber "quantos itens tenho", não
  // só "o que aconteceu na sessão ao vivo". Tudo o mais vem da própria
  // assinatura de useAdventureSession() abaixo.
  itemCount: number;
}

// Backpack Experience Phase I — "o jogador não deve pensar 'aqui estão
// meus itens', deve pensar 'isso foi tudo que eu trouxe da minha
// última jornada'" (Visão da Sprint). Consome SÓ o Estado Global já
// existente (useAdventureSession) — nenhuma regra de Loot/AutoEquip/
// Combate é recalculada aqui, cada linha só formata um campo que já
// existe (ver docs/design/backpack-experience-plan.md Seção 0).
//
// `memo` + assinatura PRÓPRIA de useAdventureSession() isola este
// painel do resto de InventoryPage (Fase 8 — Performance), no mesmo
// padrão já validado por AdventureLivePanel (Living Character/World):
// a lista principal do Inventário (que faz seu próprio fetch via
// api.get) nunca precisa re-renderizar a cada tick global só porque a
// Aventura avançou — só esta seção se inscreve nisso.
export const BackpackNarrativePanel = memo(function BackpackNarrativePanel({ itemCount }: BackpackNarrativePanelProps) {
  const { ready, hudState } = useAdventureSession();

  if (!ready) return null;

  const journeyLines = buildLastJourneySummary(hudState);
  const recentFinds = buildRecentFinds(hudState.recentEvents);
  const signals = deriveBackpackSignals(itemCount, recentFinds.length);
  const now = Date.now();

  return (
    <div className="backpack-narrative">
      <section className="backpack-journey">
        <h2>Última Jornada</h2>
        {journeyLines.map((line, index) => (
          <p key={index} className="backpack-journey-line">
            {line}
          </p>
        ))}
      </section>

      {recentFinds.length > 0 ? (
        <section className="backpack-recent-finds">
          <h2>Encontrados Recentemente</h2>
          <ul className="backpack-recent-finds-list">
            {recentFinds.map((find) => (
              <li key={find.instanceId} className={`backpack-recent-find-item backpack-recent-find-item-${find.rarity}`}>
                <strong>{find.name}</strong> <span className="backpack-recent-find-rarity">({find.rarityLabel})</span>
                <div className="backpack-recent-find-meta">
                  {find.regionName} · {formatRelativeTime(find.timestamp, now)}
                  {find.autoEquipped ? <span className="backpack-recent-find-autoequip"> · equipado automaticamente</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="backpack-signals">
        {signals.fullness === "leve" ? <p className="backpack-signal">🪶 Mochila leve — ainda cabe bastante coisa.</p> : null}
        {signals.fullness === "cheia" ? <p className="backpack-signal backpack-signal-full">🎒 Mochila cheia.</p> : null}
        {signals.manyRecentFinds ? <p className="backpack-signal">✨ Muitas descobertas recentes.</p> : null}
        {signals.suggestCityVisit ? <p className="backpack-signal backpack-signal-city">🏙️ Vale a pena visitar a cidade.</p> : null}
      </div>
    </div>
  );
});
