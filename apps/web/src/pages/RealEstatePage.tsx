import { useEffect, useState } from "react";
import type { Citizen, HouseSale } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";

/**
 * Sprint Real Estate Phase I (Vision 2.0, Sprint 6) — tela mínima
 * deliberada ("sem filtros, sem mapa, sem animação, sem paginação"):
 * lista de anúncios ativos, com Casa/Preço/Reino/Proprietário + botão
 * Comprar (ou Cancelar, se o anúncio for meu). Anunciar acontece no
 * detalhe de uma Casa (HousingPage.tsx) — esta tela nunca chama
 * /api/house/sell. Nenhum cálculo aqui — só chama a API e renderiza a
 * resposta (D2/D5, docs/architecture/decisions.md).
 */
export function RealEstatePage() {
  const [citizen, setCitizen] = useState<Citizen | null | undefined>(undefined);
  const [sales, setSales] = useState<HouseSale[] | null>(null);
  const [busySaleId, setBusySaleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    void api.get<{ sales: HouseSale[] }>("/api/house/sales").then((res) => setSales(res.sales));
  }

  useEffect(() => {
    refresh();
    void api.get<{ citizen: Citizen | null }>("/api/citizen").then((res) => setCitizen(res.citizen));
  }, []);

  async function handleBuy(saleId: string) {
    setBusySaleId(saleId);
    setError(null);
    try {
      await api.post("/api/house/buy", { sale_id: saleId });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao comprar a casa");
    } finally {
      setBusySaleId(null);
    }
  }

  async function handleCancel(saleId: string) {
    setBusySaleId(saleId);
    setError(null);
    try {
      await api.post("/api/house/cancel", { sale_id: saleId });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cancelar o anúncio");
    } finally {
      setBusySaleId(null);
    }
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Mercado Imobiliário</h1>
        <p className="hint">A casa continua pertencendo ao Reino. Só o proprietário muda.</p>

        {error ? <p className="error">{error}</p> : null}

        {!sales ? (
          <p className="loading-state">Carregando anúncios...</p>
        ) : sales.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma casa à venda no momento.</p>
          </div>
        ) : (
          <ul className="kingdom-list">
            {sales.map((sale) => {
              const isMine = citizen?.character_id === sale.seller_character_id;
              const busy = busySaleId === sale.id;
              return (
                <li key={sale.id} className="kingdom-list-item">
                  <strong>{sale.house_name}</strong>
                  <span className="hint">Reino: {sale.kingdom_name}</span>
                  <span className="hint">Proprietário: {sale.seller_display_name}</span>
                  <span>🪙 {sale.asking_price}</span>
                  {isMine ? (
                    <button type="button" onClick={() => void handleCancel(sale.id)} disabled={busy}>
                      {busy ? "Cancelando..." : "Cancelar"}
                    </button>
                  ) : (
                    <button type="button" onClick={() => void handleBuy(sale.id)} disabled={busy}>
                      {busy ? "Comprando..." : "Comprar"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
