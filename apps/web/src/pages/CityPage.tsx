import { useEffect, useMemo, useState } from "react";
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
import { useKingdomRole } from "../hooks/useKingdomRole";
import { useExpedition } from "../hooks/useExpedition";
import { api } from "../lib/api";
import { getStoredChannel, setStoredChannel } from "../hooks/usePing";
import { GuideBubble } from "../components/onboarding/GuideBubble";
import { EldrinGuide } from "../components/onboarding/EldrinGuide";
import { CLOCK_TICK_MS } from "../lib/pollIntervals";
import { pickOfTheDay } from "../lib/dailyRotation";
import { HIDDEN_OBJECTS } from "../lib/hiddenObjects";
import { TRAVELLER_STORIES } from "../lib/travellerStories";
import { RAVEN_ENCOUNTERS } from "../lib/ravens";
import { NPC_DIALOGUE } from "../lib/npcDialogue";
import type { WorldPresenceContext } from "../lib/worldPresence";
import { WorldPresenceLine } from "../components/ui/WorldPresenceLine";
import { getEnvironmentalLine } from "../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../lib/landmarkIdentity";
import { buildExpeditionEchoContext } from "../lib/expeditionEchoes";
import { getCityAmbientLine } from "../lib/cityAmbientState";
import { feedbackClassName, resolveFeedback } from "../lib/uiFeedback";
import { buildPlayerFacts } from "../lib/playerFacts";
import { buildExpeditionSpecializationContext, getExpeditionSpecialization } from "../lib/expeditionSpecialization";
import { buildCollectionInsightContext } from "../lib/collectionInsights";
import { getKingdomMemoryLine } from "../lib/kingdomMemory";
import { getLiveHighlights } from "../lib/liveReadiness";
import { buildMicroEventContext, getMicroEvent } from "../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../lib/worldCohesion";
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const PRACA_DECOR: Record<BuildingStage, string> = {
  "stage-1": "⛲",
  "stage-2": "⛲ 🪑",
  "stage-3": "⛲ 🌷🌷",
  "stage-4": "⛲ 🪑 🌷🌷",
};
import { buildLiveGuideContext, getRecommendedSurface } from "../lib/liveGuide";

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Sprint Living World (Phase I) — "Objeto curioso do dia" (Praça) e
// "Hoje muitos viajantes comentam sobre..." (Cidade), ambos
// determinísticos por dia, reaproveitando catálogos já existentes
// (Hidden Objects e Histórias dos Viajantes) — nenhum dado novo.
const objectOfTheDay = pickOfTheDay(HIDDEN_OBJECTS, 1);
const rumorTopicOfTheDay = pickOfTheDay(TRAVELLER_STORIES, 2);

// Sprint World Presence Phase I — o Reino precisa parecer que continua
// acontecendo mesmo longe da Praça. Mesma técnica de rotação diária
// acima, dois catálogos que já existiam mas nunca apareciam na Cidade:
// RAVEN_ENCOUNTERS (Sprint Ravens Ecosystem, "conteúdo isolado, pronto
// pra conectar a uma UI futura" — esta é essa conexão) e o próprio
// catálogo de falas de Roth (comentarios_reino), o guarda do Portão
// Norte — nenhum texto novo, nenhum dado novo.
const ravenAmbient = pickOfTheDay(RAVEN_ENCOUNTERS, 3);
const guardComment = pickOfTheDay(NPC_DIALOGUE.guarda.comentarios_reino, 4);

// Sprint Capital City — hub central, só apresentação/navegação. Reaproveita
// dados já existentes (Personagem, Identidade, Reino de um canal via
// /api/world/state?channel=) — nenhuma rota nova, nenhuma regra nova.
export function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = useState(getStoredChannel());
  // Sprint Character Evolution Presence Phase I — mesmo hook já usado
  // por CharacterPage/NpcIntro, só pra alimentar o estágio de evolução
  // (getCharacterStage precisa do mesmo PlayerFacts em todo lugar).
  const kingdomRoles = useKingdomRole(channel || undefined, !!profile);
  // Sprint Expedition Consequences Phase I — mesmo hook já usado por
  // ExpeditionPanel; aqui só pra repassar dados da expedição atual pra
  // prédios que não têm acesso ao painel de Expedição (Bestiário,
  // Biblioteca, ...), nunca pra exibir a Expedição em si dentro da
  // Cidade.
  const { expedition } = useExpedition(!!profile);
  // Sprint Expedition Echoes Phase I — substitui o `expeditionApproach`
  // solto da Sprint anterior (dívida técnica eliminada, ver
  // expeditionEchoes.ts): um único contexto (approach + região de
  // destino real da expedição atual) repassado pra todo prédio que
  // precisar. `useMemo` mantém a referência estável entre polls
  // idênticos de `expedition` (useExpedition já pula o setState quando
  // o dado não muda), preservando o `memo()` de RegionGallery.
  const echoContext = useMemo(() => buildExpeditionEchoContext(expedition), [expedition]);
  // Sprint Kingdom Memory Phase I — mesmos PlayerFacts já usados por
  // CharacterPage/NpcIntro/PlayerGoals, calculados aqui uma única vez
  // (character/identity/kingdomRoles já buscados por CityPage) e
  // repassados aos 5 prédios que precisam — nenhum fetch novo, nenhum
  // recálculo duplicado.
  const playerFacts = character && identity ? buildPlayerFacts(character, identity, kingdomRoles) : null;
  // Sprint Gameplay Phase I (Expedition Specializations) — mesmo
  // playerFacts acima, repassado só até NorthGateBuilding -> ExpeditionPanel
  // (único prédio que hospeda o painel de Expedição na Cidade).
  const expeditionSpecializationLine = playerFacts ? getExpeditionSpecialization(buildExpeditionSpecializationContext(playerFacts)) : null;
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

  // Sprint Dynamic World Presence Phase I — construído uma única vez
  // aqui a partir do worldState que CityPage já buscava; cada prédio só
  // recebe esse contexto pronto, nenhum decide sozinho.
  const worldPresenceCtx: WorldPresenceContext | undefined = worldState
    ? { eventCategory: worldState.current_event.category, playersOnline: worldState.panel.players_online }
    : undefined;

  // Sprint Environmental Storytelling Phase I — detalhe físico fixo da
  // Praça, sem relação com o evento atual (esse já é o assunto de
  // WorldPresenceLine logo abaixo).
  const environmentalLine = getEnvironmentalLine("praca");

  // Sprint World Simulation Phase I — "o que aconteceu recentemente
  // aqui?", diferente em eixo de World Presence (humor/movimento
  // contínuo) e de Environmental Storytelling (marca física parada).
  const worldSimulationLine = getWorldSimulationLine("praca");

  // Sprint Landmark Identity Phase I — assinatura permanente do lugar,
  // nunca muda (ao contrário das linhas acima).
  const landmarkIdentityLine = getLandmarkIdentityLine("praca");

  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (bancos ocupados), reage a players_online, eixo
  // diferente de World Presence (movimento/humor) e World Simulation
  // (evento narrado com agente).
  const cityAmbientLine = getCityAmbientLine("praca", {
    worldEventCategory: worldPresenceCtx?.eventCategory,
    playersOnline: worldPresenceCtx?.playersOnline,
  });

  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event); eixo novo, distinto dos 6 já existentes
  // pra este lugar (ver auditoria em lib/microEvents.ts).
  const microEventLine = getMicroEvent("praca", buildMicroEventContext(worldPresenceCtx));
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (aqui: Praça + Expedição),
  // nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("praca", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a players_online (WorldPresenceContext), nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("praca", buildKingdomEvolutionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, combina regionsDiscovered + players_online),
  // preparada pra sprites futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("praca", buildBuildingProgressionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  const buildingStage = playerFacts
    ? getBuildingStage("praca", buildBuildingProgressionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // players_online), preparado pra sprites/efeitos futuros; nenhum
  // texto novo.
  const reactiveClass = playerFacts
    ? getReactiveClass("praca", buildReactiveWorldContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint World Visual States Phase I — superfície "building" (Praça é
  // um dos 10 prédios do Reactive World), traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum; nenhum dado novo.
  const buildingVisualClass = playerFacts
    ? getWorldVisualClass(
        "building",
        buildWorldVisualContext({ buildingReactiveState: getReactiveState("praca", buildReactiveWorldContext(playerFacts, undefined, worldPresenceCtx)) }),
      )
    : null;
  // Sprint World Visual States Phase I — superfície "city" (nível da
  // Cidade inteira, WorldPresenceContext), regra própria e independente
  // da Praça (evento militar/população), nenhum dado novo.
  const cityVisualClass = getWorldVisualClass(
    "city",
    buildWorldVisualContext({ worldEventCategory: worldPresenceCtx?.eventCategory, playersOnline: worldPresenceCtx?.playersOnline }),
  );

  // Sprint Reactive UI (World Feedback Phase I) — quando o evento atual
  // do Reino é de uma categoria mais rara/dramática (mesmas 3 categorias
  // que World Presence já trata com texto mais urgente pra Praça:
  // "reino"/"misterios"/"militar"), o card do evento ganha um pequeno
  // realce — nunca um dado novo, só uma tradução visual do mesmo
  // current_event.category já exibido como texto.
  const NOTABLE_EVENT_CATEGORIES = ["reino", "misterios", "militar"] as const;
  const eventFeedbackCls = feedbackClassName(
    resolveFeedback(
      worldState !== null && (NOTABLE_EVENT_CATEGORIES as readonly string[]).includes(worldState.current_event.category),
      "highlight",
    ),
  );

  // Sprint Live Readiness Phase I (First 5 Minutes) — "Praça pareça
  // viva": distribui destaques entre os cards do CityMap (nunca mais de
  // 3, lib/liveReadiness.ts's getLiveHighlights), a partir de sinais já
  // calculados/calculáveis sem nenhum fetch novo — Expedição ativa
  // (Portão Norte, mesmo `expedition` acima) e Kingdom Memory real dos
  // 5 prédios que já a suportam (mesmo playerFacts/insightCtx que cada
  // prédio calcularia sozinho ao ser aberto, só antecipado aqui pra
  // decidir QUAL prédio merece o destaque antes mesmo de entrar nele).
  // "NPC com Living Consequence" fica de fora (ver liveReadiness.ts):
  // duplicaria o habitContext que hoje só existe dentro de cada
  // NpcIntro. O evento do Reino (`eventFeedbackCls` acima) não é um
  // card do mapa — continua na própria linha "Reino, agora".
  const cityInsightCtx = buildCollectionInsightContext();
  const cityMapHighlights = playerFacts
    ? getLiveHighlights(
        ["portao-norte", "biblioteca", "bestiario", "museu", "taverna", "casa-dos-viajantes"] as const,
        {
          "portao-norte": expedition !== null,
          biblioteca: getKingdomMemoryLine("biblioteca", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
          bestiario: getKingdomMemoryLine("bestiario", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
          museu: getKingdomMemoryLine("museu", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
          taverna: getKingdomMemoryLine("taverna", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
          "casa-dos-viajantes":
            getKingdomMemoryLine("casa-dos-viajantes", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
        },
      )
    : [];

  // Sprint Live Experience Phase II (Guided Discovery) — mesmos
  // playerFacts/cityInsightCtx/echoContext já calculados acima; responde
  // "para onde pode ser interessante ir", nunca "o que fazer" (isso já
  // é PlayerGoals, que CityPage nem renderiza).
  const liveGuideLine = playerFacts
    ? getRecommendedSurface(buildLiveGuideContext(playerFacts, cityInsightCtx, echoContext))
    : null;

  return (
    <main className="page">
      <AppNav />
      <GuideBubble flag="city_seen" message="Este é o centro do Reino." />
      <EldrinGuide />

      <div className={`card city-banner ${cityVisualClass}`}>
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
          {selected === "arena" ? (
            <ArenaBuilding identity={identity} kingdom={kingdom} worldPresenceCtx={worldPresenceCtx} playerFacts={playerFacts} />
          ) : null}
          {selected === "ferreiro" ? (
            <BlacksmithBuilding equipped={character?.equipped ?? []} worldPresenceCtx={worldPresenceCtx} playerFacts={playerFacts} />
          ) : null}
          {selected === "mercador" ? <MerchantBuilding /> : null}
          {selected === "alquimista" ? <AlchemistBuilding /> : null}
          {selected === "guilda" ? (
            <GuildBuilding
              kingdom={kingdom}
              identity={identity}
              character={character}
              kingdomRoles={kingdomRoles}
              worldPresenceCtx={worldPresenceCtx}
              echoContext={echoContext}
            />
          ) : null}
          {selected === "banco" ? <BankBuilding character={character} /> : null}
          {selected === "portao-norte" ? (
            <NorthGateBuilding
              enabled={!!profile}
              worldPresenceCtx={worldPresenceCtx}
              echoContext={echoContext}
              specializationLine={expeditionSpecializationLine}
              playerFacts={playerFacts}
            />
          ) : null}
          {selected === "biblioteca" ? (
            <LibraryBuilding worldPresenceCtx={worldPresenceCtx} echoContext={echoContext} playerFacts={playerFacts} />
          ) : null}
          {selected === "bestiario" ? (
            <BestiaryBuilding worldPresenceCtx={worldPresenceCtx} echoContext={echoContext} playerFacts={playerFacts} />
          ) : null}
          {selected === "museu" ? (
            <MuseumBuilding worldPresenceCtx={worldPresenceCtx} echoContext={echoContext} playerFacts={playerFacts} />
          ) : null}
          {selected === "taverna" ? (
            <TavernBuilding worldPresenceCtx={worldPresenceCtx} echoContext={echoContext} playerFacts={playerFacts} />
          ) : null}
          {selected === "casa-dos-viajantes" ? (
            <TravellerHouseBuilding echoContext={echoContext} playerFacts={playerFacts} />
          ) : null}
        </div>
      ) : (
        <div className={`card city-square-view city-building-praca${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${buildingVisualClass ? ` ${buildingVisualClass}` : ""}`}>
          <h2>Praça Central</h2>
          {buildingStage ? <p className="building-decor">{PRACA_DECOR[buildingStage]}</p> : null}
          <CityHubBar
            worldState={worldState}
            clock={clock}
            channelDisplayName={kingdom?.channel_display_name ?? null}
          />
          <CitySquareDecor />
          {worldState ? (
            <p className={`hint city-of-the-day${eventFeedbackCls ? ` ${eventFeedbackCls}` : ""}`}>
              <span>{worldState.current_event.icon} No Reino, agora:</span> {worldState.current_event.name}
            </p>
          ) : null}
          <p className="hint">Escolha um edifício para visitar.</p>
          {liveGuideLine ? (
            <p className="guide-bubble">
              <span className="guide-bubble-icon" aria-hidden="true">
                🗺️
              </span>
              {liveGuideLine}
            </p>
          ) : null}
          <CityMap onSelect={setSelected} highlightedBuildings={cityMapHighlights} />

          {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — as
              linhas ambientes abaixo (humor/vestígio/evento pontual/
              conexão) são decoração, nunca ação; movidas pra depois do
              CityMap pra um jogador novo chegar no "Escolha um
              edifício"/mapa sem precisar rolar por 9 frases primeiro
              (achado real da auditoria: "muitos hints juntos" antes do
              único elemento clicável da tela). Nenhuma removida, nenhum
              dado/lógica alterado — só reordenado. */}
          <WorldPresenceLine building="praca" ctx={worldPresenceCtx} />
          {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
          {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
          <p className="hint">{landmarkIdentityLine}</p>
          {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
          {microEventLine ? <p className="hint">{microEventLine}</p> : null}
          {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
          {kingdomEvolutionLine ? <p className="hint">{kingdomEvolutionLine}</p> : null}
          <p className="hint city-of-the-day">
            <span>💬 Hoje muitos viajantes comentam sobre:</span> {rumorTopicOfTheDay.title}
          </p>
          <p className="hint city-of-the-day">
            <span>🐦</span> {ravenAmbient}
          </p>

          <h3 className="hidden-objects-title">Pela praça</h3>
          <GuideBubble flag="hidden_object_seen" message="Alguns cantos comuns da praça escondem uma pequena curiosidade — vale clicar." />
          <p className="hint">Alguns cantos da praça respondem quando você clica neles.</p>
          <p className="hint city-of-the-day">
            <span>🛡️ Um guarda comenta:</span> "{guardComment}"
          </p>
          <p className="hint city-of-the-day">
            <span>
              {objectOfTheDay.icon} Objeto curioso do dia:
            </span>{" "}
            {objectOfTheDay.name}
          </p>
          <HiddenObjects />
        </div>
      )}
    </main>
  );
}
