import { useEffect, useState } from "react";
import type { Citizen, CitizenRank, Kingdom } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";
import { citizenRankLabel, citizenRankLadder } from "../lib/citizenRank";

/**
 * Sprint Kingdom Domain 2.0 (Vision 2.0, Sprint 2) — tela mínima
 * deliberada ("nada visual complexo, nada de mapa, nada de Housing/Guild,
 * sem cosméticos, sem rankings"): lista de Reinos + detalhe ao clicar +
 * formulário simples de fundação. Nenhum cálculo aqui — só chama a API e
 * renderiza a resposta (D2/D5, docs/architecture/decisions.md).
 *
 * Sprint Citizen System (Vision 2.0, Sprint 3), Fase 8 — adiciona
 * Entrar/Sair do Reino e a lista simples de cidadãos, mesma disciplina
 * de tela mínima ("nada visual elaborado, sem mapa, sem casas, sem
 * ranking").
 *
 * Sprint Citizen Progression (Vision 2.0, Sprint 4), Fase 7 — mostra o
 * rank atual do jogador neste Reino (Visitante se ele não é cidadão
 * daqui) e o rank de cada cidadão na lista. Nenhuma animação, nenhum
 * botão de promover/rebaixar — infraestrutura de leitura só, per o
 * brief ("nenhuma animação, nenhum efeito, nenhum progresso visual
 * complexo").
 */
export function KingdomsPage() {
  const [kingdoms, setKingdoms] = useState<Kingdom[] | null>(null);
  const [selected, setSelected] = useState<Kingdom | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [myCitizen, setMyCitizen] = useState<Citizen | null>(null);
  const [citizens, setCitizens] = useState<Citizen[] | null>(null);
  const [membershipBusy, setMembershipBusy] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(null);

  function refresh() {
    void api.get<{ kingdoms: Kingdom[] }>("/api/kingdoms").then((res) => setKingdoms(res.kingdoms));
  }

  function refreshMyCitizen() {
    void api.get<{ citizen: Citizen | null }>("/api/citizen").then((res) => setMyCitizen(res.citizen));
  }

  useEffect(() => {
    refresh();
    refreshMyCitizen();
  }, []);

  useEffect(() => {
    if (!selected) {
      setCitizens(null);
      return;
    }
    void api
      .get<{ citizens: Citizen[] }>(`/api/kingdom/${selected.id}/citizens`)
      .then((res) => setCitizens(res.citizens));
  }, [selected]);

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post<{ kingdom: Kingdom }>("/api/kingdom", { name, description });
      setName("");
      setDescription("");
      refresh();
      setSelected(res.kingdom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao fundar o Reino");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    if (!selected) return;
    setMembershipBusy(true);
    setMembershipError(null);
    try {
      const res = await api.post<{ citizen: Citizen }>("/api/kingdom/join", { kingdom_id: selected.id });
      setMyCitizen(res.citizen);
      const refreshed = await api.get<{ citizens: Citizen[] }>(`/api/kingdom/${selected.id}/citizens`);
      setCitizens(refreshed.citizens);
    } catch (err) {
      setMembershipError(err instanceof Error ? err.message : "Falha ao entrar no Reino");
    } finally {
      setMembershipBusy(false);
    }
  }

  async function handleLeave() {
    if (!selected) return;
    setMembershipBusy(true);
    setMembershipError(null);
    try {
      await api.post("/api/kingdom/leave");
      setMyCitizen(null);
      const refreshed = await api.get<{ citizens: Citizen[] }>(`/api/kingdom/${selected.id}/citizens`);
      setCitizens(refreshed.citizens);
    } catch (err) {
      setMembershipError(err instanceof Error ? err.message : "Falha ao sair do Reino");
    } finally {
      setMembershipBusy(false);
    }
  }

  if (selected) {
    const belongsHere = myCitizen?.kingdom_id === selected.id;
    const myRank: CitizenRank = belongsHere && myCitizen ? myCitizen.rank : "visitante";
    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <button type="button" onClick={() => setSelected(null)}>
            ← Voltar
          </button>
          <h1>{selected.name}</h1>
          <p className="hint">/{selected.slug}</p>
          {selected.motto ? (
            <p>
              <em>“{selected.motto}”</em>
            </p>
          ) : null}
          <p>{selected.description || "Nenhuma descrição ainda."}</p>
          <p className="hint">Fundado em {new Date(selected.created_at).toLocaleDateString()}</p>
          <p className="hint">Status: {selected.status === "active" ? "Ativo" : "Adormecido"}</p>

          <div className="citizen-membership">
            {belongsHere ? (
              <>
                <p>Você pertence a este Reino.</p>
                <button type="button" onClick={() => void handleLeave()} disabled={membershipBusy}>
                  {membershipBusy ? "Saindo..." : "Sair do Reino"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => void handleJoin()} disabled={membershipBusy}>
                {membershipBusy ? "Entrando..." : "Entrar no Reino"}
              </button>
            )}
            {membershipError ? <p className="error">{membershipError}</p> : null}
          </div>

          <h2 className="identity-subtitle">Seu rank neste Reino</h2>
          <ul className="citizen-rank-ladder">
            {citizenRankLadder().map(({ rank, label }) => (
              <li key={rank} className={rank === myRank ? "citizen-rank-current" : undefined}>
                {label}
              </li>
            ))}
          </ul>

          <h2 className="identity-subtitle">Cidadãos</h2>
          {!citizens ? (
            <p className="loading-state">Carregando cidadãos...</p>
          ) : citizens.length === 0 ? (
            <p className="hint">Nenhum cidadão ainda.</p>
          ) : (
            <ul className="citizen-list">
              {citizens.map((citizen) => (
                <li key={citizen.id}>
                  {citizen.character_display_name} — {citizenRankLabel(citizen.rank)}
                  {citizen.is_founder ? " 👑" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Reinos</h1>
        <p className="hint">O Reino existe mesmo sem ninguém assistindo.</p>
        <p className="hint">
          {myCitizen
            ? `Você pertence ao Reino ${kingdoms?.find((k) => k.id === myCitizen.kingdom_id)?.name ?? myCitizen.kingdom_id}.`
            : "Você ainda não pertence a nenhum Reino."}
        </p>

        {!kingdoms ? (
          <p className="loading-state">Carregando Reinos...</p>
        ) : kingdoms.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum Reino fundado ainda.</p>
            <p className="hint">Seja o primeiro a fundar um.</p>
          </div>
        ) : (
          <ul className="kingdom-list">
            {kingdoms.map((kingdom) => (
              <li key={kingdom.id}>
                <button type="button" onClick={() => setSelected(kingdom)} className="kingdom-list-item">
                  <strong>{kingdom.name}</strong>
                  <span className="hint">/{kingdom.slug}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="identity-subtitle">Fundar um Reino</h2>
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do Reino" />
        </label>
        <label>
          Descrição (opcional)
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="button" onClick={() => void handleCreate()} disabled={creating || !name.trim()}>
          {creating ? "Fundando..." : "Fundar Reino"}
        </button>
      </div>
    </main>
  );
}
