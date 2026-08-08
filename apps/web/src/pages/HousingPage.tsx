import { useEffect, useState } from "react";
import type { Citizen, House } from "@streamrpg/shared";
import { Link } from "react-router-dom";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";

/**
 * Sprint Housing Phase I (Vision 2.0, Sprint 5) — tela mínima deliberada
 * ("nenhuma decoração, nenhum mapa, nenhuma visualização 3D"): lista de
 * Casas do Reino atual do jogador + formulário simples de construção +
 * detalhe ao clicar. Nenhum cálculo aqui — só chama a API e renderiza a
 * resposta (D2/D5, docs/architecture/decisions.md).
 *
 * Só cidadãos ativos de um Reino conseguem construir (a resposta desta
 * Sprint para "quem pode construir?", deixada em aberto por
 * citizen-progression-implementation.md Fase 8) — por isso a tela
 * primeiro resolve `GET /api/citizen` antes de mostrar qualquer coisa.
 *
 * Sprint Real Estate Phase I (Vision 2.0, Sprint 6), Fase 7 — o detalhe
 * de uma Casa ganha "Vender esta Casa" quando o jogador é o proprietário
 * atual dela. Comprar acontece na tela do Mercado (RealEstatePage.tsx) —
 * esta tela nunca chama /api/house/buy.
 */
export function HousingPage() {
  const [citizen, setCitizen] = useState<Citizen | null | undefined>(undefined);
  const [houses, setHouses] = useState<House[] | null>(null);
  const [selected, setSelected] = useState<House | null>(null);
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [plot, setPlot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [listing, setListing] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [listedSaleId, setListedSaleId] = useState<string | null>(null);

  useEffect(() => {
    void api.get<{ citizen: Citizen | null }>("/api/citizen").then((res) => setCitizen(res.citizen));
  }, []);

  function refreshHouses(kingdomId: string) {
    void api.get<{ houses: House[] }>(`/api/kingdom/${kingdomId}/houses`).then((res) => setHouses(res.houses));
  }

  useEffect(() => {
    if (citizen) refreshHouses(citizen.kingdom_id);
  }, [citizen]);

  async function handleCreate() {
    if (!citizen || !name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post<{ house: House }>("/api/houses", {
        kingdom_id: citizen.kingdom_id,
        name,
        district: district || undefined,
        plot: plot || undefined,
      });
      setName("");
      setDistrict("");
      setPlot("");
      refreshHouses(citizen.kingdom_id);
      setSelected(res.house);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao construir a casa");
    } finally {
      setCreating(false);
    }
  }

  if (citizen === undefined) {
    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <p className="loading-state">Carregando...</p>
        </div>
      </main>
    );
  }

  if (!citizen) {
    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <h1>Casas</h1>
          <div className="empty-state">
            <p>Você precisa ser cidadão de um Reino para construir uma casa.</p>
            <p className="hint">Visite a tela de Reinos e entre em um deles primeiro.</p>
          </div>
        </div>
      </main>
    );
  }

  if (selected) {
    const isOwner = citizen.character_id === selected.current_owner_character_id;

    async function handleSell() {
      if (!selected) return;
      const price = Number(askingPrice);
      if (!Number.isFinite(price) || price <= 0) {
        setListingError("Informe um preço válido.");
        return;
      }
      setListing(true);
      setListingError(null);
      try {
        const res = await api.post<{ sale: { id: string } }>("/api/house/sell", {
          house_id: selected.id,
          asking_price: price,
        });
        setListedSaleId(res.sale.id);
        setAskingPrice("");
      } catch (err) {
        setListingError(err instanceof Error ? err.message : "Falha ao anunciar a casa");
      } finally {
        setListing(false);
      }
    }

    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <button type="button" onClick={() => setSelected(null)}>
            ← Voltar
          </button>
          <h1>{selected.name}</h1>
          <p className="hint">Reino: {selected.kingdom_name}</p>
          {selected.district ? <p className="hint">Bairro: {selected.district}</p> : null}
          {selected.plot ? <p className="hint">Lote: {selected.plot}</p> : null}
          <p>Tipo: {selected.house_type}</p>
          <p>Construtor original: {selected.original_builder_display_name}</p>
          <p>Proprietário atual: {selected.current_owner_display_name}</p>
          <p className="hint">Construída em {new Date(selected.created_at).toLocaleDateString()}</p>

          {isOwner ? (
            <div className="citizen-membership">
              <h2 className="identity-subtitle">Vender esta Casa</h2>
              {listedSaleId ? (
                <p>
                  Anunciada. Veja no <Link to="/app/real-estate">Mercado Imobiliário</Link>.
                </p>
              ) : (
                <>
                  <label>
                    Preço em Ouro
                    <input
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(e.target.value)}
                      placeholder="Preço"
                      inputMode="numeric"
                    />
                  </label>
                  {listingError ? <p className="error">{listingError}</p> : null}
                  <button type="button" onClick={() => void handleSell()} disabled={listing || !askingPrice}>
                    {listing ? "Anunciando..." : "Vender esta Casa"}
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Casas</h1>
        <p className="hint">A casa pertence ao Reino — o proprietário é só quem cuida dela agora.</p>
        {houses && houses.length > 0 ? <p className="hint">Reino atual: {houses[0].kingdom_name}</p> : null}

        {!houses ? (
          <p className="loading-state">Carregando casas...</p>
        ) : houses.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma casa construída neste Reino ainda.</p>
            <p className="hint">Seja o primeiro a construir uma.</p>
          </div>
        ) : (
          <ul className="kingdom-list">
            {houses.map((house) => (
              <li key={house.id}>
                <button type="button" onClick={() => setSelected(house)} className="kingdom-list-item">
                  <strong>{house.name}</strong>
                  <span className="hint">Proprietário: {house.current_owner_display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="identity-subtitle">Construir uma Casa</h2>
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da Casa" />
        </label>
        <label>
          Bairro (opcional)
          <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Bairro" />
        </label>
        <label>
          Lote (opcional)
          <input value={plot} onChange={(e) => setPlot(e.target.value)} placeholder="Lote" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="button" onClick={() => void handleCreate()} disabled={creating || !name.trim()}>
          {creating ? "Construindo..." : "Construir Casa"}
        </button>
      </div>
    </main>
  );
}
