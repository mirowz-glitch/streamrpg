import { useEffect, useState } from "react";
import type { WorldStateResponse } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { CityMap, type BuildingKey } from "../components/city/CityMap";
import { CityHubBar } from "../components/city/CityHubBar";
import { CitySquareDecor } from "../components/city/CitySquareDecor";
import { HiddenObjects } from "../components/city/HiddenObjects";
import { MerchantBuilding } from "../components/city/MerchantBuilding";
import { BlacksmithBuilding } from "../components/city/BlacksmithBuilding";
import { AlchemistBuilding } from "../components/city/AlchemistBuilding";
import { GuildBuilding } from "../components/city/GuildBuilding";
import { BankBuilding } from "../components/city/BankBuilding";
import { ArenaBuilding } from "../components/city/ArenaBuilding";
import { NorthGateBuilding } from "../components/city/NorthGateBuilding";
import { LibraryBuilding } from "../components/city/LibraryBuilding";
import { BestiaryBuilding } from "../components/city/BestiaryBuilding";
import { MuseumBuilding } from "../components/city/MuseumBuilding";
import { TavernBuilding } from "../components/city/TavernBuilding";
import { TravellerHouseBuilding } from "../components/city/TravellerHouseBuilding";
import { useAuth } from "../hooks/useAuth";
import { useCharacter } from "../hooks/useCharacter";
import { useIdentity } from "../hooks/useIdentity";
import { api } from "../lib/api";
import { getStoredChannel, setStoredChannel } from "../hooks/usePing";
import { GuideBubble } from "../components/onboarding/GuideBubble";
import { CLOCK_TICK_MS } from "../lib/pollIntervals";

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Sprint Capital City — hub central, só apresentação/navegação. Reaproveita
// dados já existentes (Personagem, Identidade, Reino de um canal via
// /api/world/state?channel=) — nenhuma rota nova, nenhuma regra nova.
export function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = useState(getStoredChannel());
  const [worldState, setWorldState] = useState<WorldStateResponse | null>(null);
  const [selected, setSelected] = useState<BuildingKey | null>(null);
  const [clock, setClock] = useState(() => formatClock(Date.now()));

  useEffect(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api
      .get<WorldStateResponse>(`/api/world/state${query}`)
      .then(setWorldState)
      .catch(() => undefined);
  }, [channel]);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const kingdom = worldState?.channel_kingdom ?? null;

  return (
    <main className="page">
      <AppNav />
      <GuideBubble flag="city_seen" message="Este é o centro do Reino." />

      <div className="card city-banner">
        <h1>Capital</h1>
        <p className="hint">A cidade onde toda a jornada do Reino acontece.</p>
        <label>
          Reino atual
          <input
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setStoredChannel(e.target.value);
            }}
            placeholder="login do streamer (define o Reino da Guilda/Arena/Portão Norte)"
          />
        </label>
      </div>

      {selected ? (
        <div className="card city-building">
          <button type="button" className="city-back-btn" onClick={() => setSelected(null)}>
            ← Voltar à Praça Central
          </button>
          {selected === "arena" ? <ArenaBuilding identity={identity} kingdom={kingdom} /> : null}
          {selected === "ferreiro" ? <BlacksmithBuilding equipped={character?.equipped ?? []} /> : null}
          {selected === "mercador" ? <MerchantBuilding /> : null}
          {selected === "alquimista" ? <AlchemistBuilding /> : null}
          {selected === "guilda" ? <GuildBuilding kingdom={kingdom} identity={identity} /> : null}
          {selected === "banco" ? <BankBuilding character={character} /> : null}
          {selected === "portao-norte" ? <NorthGateBuilding enabled={!!profile} /> : null}
          {selected === "biblioteca" ? <LibraryBuilding /> : null}
          {selected === "bestiario" ? <BestiaryBuilding /> : null}
          {selected === "museu" ? <MuseumBuilding /> : null}
          {selected === "taverna" ? <TavernBuilding /> : null}
          {selected === "casa-dos-viajantes" ? <TravellerHouseBuilding /> : null}
        </div>
      ) : (
        <div className="card">
          <h2>Praça Central</h2>
          <CityHubBar
            worldState={worldState}
            clock={clock}
            channelDisplayName={kingdom?.channel_display_name ?? null}
          />
          <CitySquareDecor />
          <p className="hint">Escolha um edifício para visitar.</p>
          <CityMap onSelect={setSelected} />

          <h3 className="hidden-objects-title">Pela praça</h3>
          <p className="hint">Alguns cantos da praça respondem quando você clica neles.</p>
          <HiddenObjects />
        </div>
      )}
    </main>
  );
}
