import { useEffect, useState } from "react";
import type { KingdomIntegration } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";

/**
 * Kingdom Integration Phase I (Vision 2.0, Sprint 8) — tela mínima
 * deliberada ("apenas página simples, lista das integrações, botão
 * Conectar/Desconectar, mostrar Provider/Status/Nome, nada além
 * disso"): sem OAuth real — o formulário de "Conectar" é um mock de
 * infraestrutura (o jogador digita provider/id/nome à mão), provando
 * que o modelo funciona para qualquer provedor sem exigir uma
 * integração de verdade ainda (per o brief, "não implementar OAuth
 * completo"). Nenhum cálculo aqui — só chama a API e renderiza a
 * resposta (D2/D5, docs/architecture/decisions.md).
 */
export function KingdomIntegrationsPage() {
  const [integrations, setIntegrations] = useState<KingdomIntegration[] | null>(null);
  const [provider, setProvider] = useState("");
  const [externalId, setExternalId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    void api.get<{ integrations: KingdomIntegration[] }>("/api/kingdom/integrations").then((res) => setIntegrations(res.integrations));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleConnect() {
    if (!provider.trim() || !externalId.trim() || !displayName.trim()) return;
    setConnecting(true);
    setError(null);
    try {
      const citizen = await api.get<{ citizen: { kingdom_id: string } | null }>("/api/citizen");
      if (!citizen.citizen) {
        setError("Você precisa ser cidadão de um Reino para conectar uma integração.");
        return;
      }
      await api.post("/api/kingdom/integration", {
        kingdom_id: citizen.citizen.kingdom_id,
        provider: provider.trim(),
        external_id: externalId.trim(),
        display_name: displayName.trim(),
      });
      setProvider("");
      setExternalId("");
      setDisplayName("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao conectar integração");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await api.delete(`/api/kingdom/integration/${id}`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao desconectar integração");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Integrações do Reino</h1>
        <p className="hint">O Reino nunca pertence à plataforma. A plataforma pertence ao Reino.</p>

        {error ? <p className="error">{error}</p> : null}

        {!integrations ? (
          <p className="loading-state">Carregando integrações...</p>
        ) : integrations.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma integração conectada ainda.</p>
          </div>
        ) : (
          <ul className="kingdom-list">
            {integrations.map((integration) => (
              <li key={integration.id} className="kingdom-list-item">
                <strong>{integration.provider}</strong>
                <span className="hint">{integration.display_name}</span>
                <span>{integration.status === "connected" ? "Conectado" : "Desconectado"}</span>
                {integration.status === "connected" ? (
                  <button type="button" onClick={() => void handleDisconnect(integration.id)} disabled={busyId === integration.id}>
                    {busyId === integration.id ? "Desconectando..." : "Desconectar"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setProvider(integration.provider);
                      setExternalId(integration.external_id);
                      setDisplayName(integration.display_name);
                    }}
                  >
                    Reconectar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <h2 className="identity-subtitle">Conectar uma integração</h2>
        <p className="hint">Sem OAuth real nesta versão — Twitch, Kick, YouTube, Discord ou qualquer outro provedor futuro, todos tratados igual.</p>
        <label>
          Provider
          <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="twitch, kick, youtube, discord..." />
        </label>
        <label>
          ID do canal/servidor
          <input value={externalId} onChange={(e) => setExternalId(e.target.value)} placeholder="ID externo" />
        </label>
        <label>
          Nome de exibição
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nome" />
        </label>
        <button type="button" onClick={() => void handleConnect()} disabled={connecting || !provider.trim() || !externalId.trim() || !displayName.trim()}>
          {connecting ? "Conectando..." : "Conectar"}
        </button>
      </div>
    </main>
  );
}
