import { useEffect, useMemo, useState } from "react";
import type { NpcDefinition } from "../../lib/npcs";
import { NpcPortrait } from "./NpcPortrait";
import { NPC_DIALOGUE, randomLine, flattenDialogue, getRecognitionLine, getHabitLine, getForeshadowLine, getConsequenceLine, getHeroJourneyLine, getLivingConversationLine } from "../../lib/npcDialogue";
import { useCharacter } from "../../hooks/useCharacter";
import { useIdentity } from "../../hooks/useIdentity";
import { useKingdomRole } from "../../hooks/useKingdomRole";
import { getStoredChannel } from "../../hooks/usePing";
import { buildPlayerFacts } from "../../lib/playerFacts";
import { recordEvent, getRecentEvents } from "../../lib/personalTimeline";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { getNpcSubjects, getNpcCitedPeople } from "../../lib/knowledgeLinks";
import { pickOfTheDay, keySalt } from "../../lib/dailyRotation";
import { hasEncounteredLethalCreature } from "../../lib/collectionInsights";
import { getCharacterStage, STAGE_CITY_HONORIFIC } from "../../lib/characterPresence";
import { EMPTY_ECHO_CONTEXT, getNpcEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { feedbackClassName } from "../../lib/uiFeedback";
import { getNpcDailyActivity } from "../../lib/npcDailyActivities";
import { getSingleHighlight } from "../../lib/liveReadiness";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint NPCs Vivos — bloco de apresentação reaproveitado por todo
// edifício: retrato, nome, profissão, frase própria e descrição.
//
// Sprint Living NPCs (MVP) — abaixo da frase de identidade fixa
// (`npc.quote`, nunca muda), uma segunda linha sorteada do catálogo de
// 100 falas do NPC (lib/npcDialogue), uma vez por visita.
//
// Sprint Recognition System (MVP) — antes de sortear do catálogo, uma
// camada opcional verifica se algum dado real do jogador (nível, Bosses
// derrotados, título, cargo, regiões descobertas, Gold, primeira visita)
// bate com alguma condição do NPC — só quando bate, substitui a fala
// aleatória. Sem estado novo: reaproveita os mesmos hooks já usados em
// CharacterPage/CityPage (useCharacter/useIdentity/useKingdomRole) e a
// mesma flag de onboarding (city_seen) já usada em outro lugar.
//
// Sprint Reactive Layer Foundation — os fatos do jogador agora vêm de
// buildPlayerFacts (lib/playerFacts.ts) em vez de montados aqui à mão;
// e todo "reconhecimento" real (linha condicional efetivamente exibida)
// vira um registro em lib/personalTimeline.ts — o mesmo ponto de escrita
// que qualquer feedback/timeline futuro pode reaproveitar.
interface NpcIntroProps {
  npc: NpcDefinition;
  // Sprint Gameplay Presence Phase I — só passado por TavernBuilding, a
  // categoria do evento atual do Reino (worldState.current_event.category,
  // já buscado por CityPage) — opcional porque nenhum outro prédio
  // precisa dele.
  worldEventCategory?: string;
  // Sprint Expedition Echoes Phase I — opcional/default vazio: toda
  // chamada existente sem o prop continua com o comportamento de
  // sempre. Só os prédios que já recebem o contexto de CityPage passam
  // isso adiante (Taverna/Casa dos Viajantes — Greta/Idris, exemplos do
  // brief — mais Bestiário/Biblioteca/Portão Norte).
  echoContext?: ExpeditionEchoContext;
}

export function NpcIntro({ npc, worldEventCategory, echoContext = EMPTY_ECHO_CONTEXT }: NpcIntroProps) {
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || undefined, true);

  const catalog = NPC_DIALOGUE[npc.key];
  const [fallbackLine] = useState(() => (catalog ? randomLine(catalog) : null));

  // Sprint Character Evolution Presence Phase I — mesmos PlayerFacts que
  // CharacterPage/GuildBuilding já usam pro estágio de evolução; hoisted
  // aqui porque agora dois lugares deste componente precisam dele
  // (Recognition já precisava, o honorífico de Cidade abaixo também).
  const facts = useMemo(() => {
    if (!character || !identity) return null;
    return buildPlayerFacts(character, identity, kingdomRoles);
  }, [character, identity, kingdomRoles]);

  const recognitionLine = useMemo(() => {
    if (!facts) return null;
    return getRecognitionLine(npc.key, facts);
  }, [npc.key, facts]);

  useEffect(() => {
    if (recognitionLine) {
      recordEvent("recognition_shown", { npcKey: npc.key });
    }
  }, [npc.key, recognitionLine]);

  const line = recognitionLine ?? fallbackLine;

  // Sprint Reactive NPCs Phase I — segunda camada, aditiva: uma pequena
  // observação de hábito (ou "reconhecimento social" de outro NPC),
  // exibida ABAIXO de `line`, nunca no lugar dela. Aparece no máximo uma
  // vez por hábito/NPC pra sempre (playerMemory), nunca por sorteio.
  const habitContext = useMemo(() => {
    if (!facts) return null;
    const recentEvents = getRecentEvents(20);
    const booksRead = recentEvents.filter((e) => e.kind === "book_read").length;
    const creaturesViewed = recentEvents.filter((e) => e.kind === "creature_viewed").length;
    // Sprint Hero Journey Phase I — mesmo padrão de booksRead/
    // creaturesViewed acima, agora pro Museu (mesmo `museum_entry_viewed`
    // que a Collection Insights central já consome).
    const museumEntriesViewed = recentEvents.filter((e) => e.kind === "museum_entry_viewed").length;
    // Sprint Gameplay Presence Phase I — cruza os creatureId já
    // registrados (Personal Timeline) com o catálogo estático do
    // Bestiário (dangerLevel), sem nenhum dado novo dos dois lados.
    // Sprint Kingdom Reputation Phase I — extraído pra
    // lib/collectionInsights.ts (Kingdom Reputation precisa do mesmo
    // sinal), reaproveitado aqui em vez de duplicado.
    const hasViewedRareCreature = hasEncounteredLethalCreature();
    return {
      booksRead,
      creaturesViewed,
      hasEquippedItem: facts.hasEquippedItem,
      isFirstCityVisit: facts.isFirstCityVisit,
      regionsDiscovered: facts.regionsDiscovered,
      equipmentTier: facts.equipmentTier,
      worldEventCategory,
      hasViewedRareCreature,
      bossesDefeated: facts.bossesDefeated,
      hasKingdomRole: facts.hasKingdomRole,
      // Sprint Hero Journey Phase I — os quatro dados que só esta camada
      // precisa (ver recognition.ts's HabitContext).
      totalMinutes: facts.totalMinutes,
      characterStage: getCharacterStage(facts),
      museumEntriesViewed,
      hasCompletedFirstExpedition: facts.hasCompletedFirstExpedition,
    };
  }, [npc.key, facts, worldEventCategory]);

  // Sprint Living Consequences Phase I — camada com a MAIOR prioridade
  // entre as três aditivas: "eu percebi o que você fez" (uma ação
  // específica e recente) vem antes de "hábito"/"tease", que são mais
  // genéricos. Mutuamente exclusiva com as outras duas — nunca empilha.
  const consequenceLine = useMemo(() => {
    if (!habitContext) return null;
    return getConsequenceLine(npc.key, habitContext);
  }, [npc.key, habitContext]);

  useEffect(() => {
    if (!consequenceLine) return;
    remember(consequenceLine.memoryKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consequenceLine]);

  // Sprint Hero Journey Phase I — quarta camada aditiva, entre
  // Consequence e Habit: mais rara e especial que uma observação de
  // hábito genérica (por isso vem antes dela), mas menos urgente que uma
  // reação a uma ação concreta e recente (por isso vem depois). "Eu
  // lembro de quem você era" — olha pra trás, ao contrário das outras
  // três. Mutuamente exclusiva com todo o resto — nunca empilha.
  const heroJourneyLine = useMemo(() => {
    if (!habitContext || consequenceLine) return null;
    return getHeroJourneyLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine]);

  useEffect(() => {
    if (!heroJourneyLine) return;
    remember(heroJourneyLine.memoryKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroJourneyLine]);

  const habitLine = useMemo(() => {
    if (!habitContext || consequenceLine || heroJourneyLine) return null;
    return getHabitLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine, heroJourneyLine]);

  useEffect(() => {
    if (!habitLine) return;
    remember(habitLine.memoryKey);
    if (habitLine.timelineKind) {
      recordEvent(habitLine.timelineKind, { npcKey: npc.key });
    }
    if (!hasRemembered("npc_first_recognition_recorded")) {
      remember("npc_first_recognition_recorded");
      recordEvent("npc_first_recognition", { npcKey: npc.key });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitLine]);

  // Sprint Discovery Loop Phase I (Foreshadowing) — quarta camada, a
  // mais discreta: só aparece quando NEM `consequenceLine` NEM
  // `habitLine` já tinham algo a dizer nesta visita — nunca empilha
  // várias linhas ao mesmo tempo. Mesmo contexto, reaproveitado sem
  // reconstruir nada.
  const foreshadowLine = useMemo(() => {
    if (!habitContext || consequenceLine || heroJourneyLine || habitLine) return null;
    return getForeshadowLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine, heroJourneyLine, habitLine]);

  useEffect(() => {
    if (!foreshadowLine) return;
    remember(foreshadowLine.memoryKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foreshadowLine]);

  // Sprint Character Evolution Presence Phase I — quinta camada, a mais
  // baixa prioridade de todas: um tratamento diferente vindo de só 2 NPCs
  // já ligados a reconhecer mérito (Elenya na Guilda, Roth no Portão
  // Norte), acima do Recognition, nunca no lugar dele. Não é um evento
  // pontual como as outras três (não usa playerMemory) — é uma leitura
  // contínua de "quem este personagem é hoje", por isso só aparece
  // quando nenhuma das três outras camadas tem algo mais específico a
  // dizer nesta visita.
  const honorificLine = useMemo(() => {
    if (!facts || consequenceLine || heroJourneyLine || habitLine || foreshadowLine) return null;
    if (npc.key !== "guildmaster" && npc.key !== "guarda") return null;
    return STAGE_CITY_HONORIFIC[getCharacterStage(facts)] ?? null;
  }, [npc.key, facts, consequenceLine, heroJourneyLine, habitLine, foreshadowLine]);

  // Sprint Living Conversations Phase I — sexta camada aditiva, a mais
  // baixa prioridade de todas: NUNCA reage ao jogador (nenhum
  // PlayerFacts/HabitContext envolvido), só ao dia atual — por isso só
  // aparece quando NENHUMA das cinco camadas pessoais acima tem algo a
  // dizer nesta visita. É o "piso" da ambientação: mesmo um jogador
  // extremamente avançado, que já esgotou toda memoryKey pessoal
  // possível, sempre encontra o Reino conversando sozinho.
  const livingConversationLine = useMemo(() => {
    if (consequenceLine || heroJourneyLine || habitLine || foreshadowLine || honorificLine) return null;
    return getLivingConversationLine(npc.key);
  }, [npc.key, consequenceLine, heroJourneyLine, habitLine, foreshadowLine, honorificLine]);

  // Sprint Living Kingdom Phase I (Daily NPC Activities) — sétima e
  // última camada aditiva, abaixo até de Living Conversation: nunca
  // fala, nunca reage ao jogador — só uma atividade física ligada à
  // profissão, determinística por dia. Só aparece quando NENHUMA
  // camada acima (nem Living Conversation, o piso de sempre) já tinha
  // algo a dizer nesta visita — o NOVO piso, garantindo que todo NPC
  // sempre pareça estar fazendo algo, mesmo sem nenhuma fala disponível.
  const dailyActivityLine = useMemo(() => {
    if (consequenceLine || heroJourneyLine || habitLine || foreshadowLine || honorificLine || livingConversationLine) {
      return null;
    }
    return getNpcDailyActivity(npc.key);
  }, [npc.key, consequenceLine, heroJourneyLine, habitLine, foreshadowLine, honorificLine, livingConversationLine]);

  // Sprint World Visual States Phase I — traduz Living Consequence/Hero
  // Journey (já calculados acima) pro vocabulário visual comum (4
  // estados); nenhum dado novo, nenhuma prioridade alterada.
  const worldVisualClass = getWorldVisualClass(
    "npc",
    buildWorldVisualContext({ hasLivingConsequence: consequenceLine !== null, hasHeroJourney: heroJourneyLine !== null }),
  );

  // Sprint Living Knowledge — "Últimos assuntos": criaturas do
  // Bestiário cujas conexões (Sprint Content Connections) citam este
  // NPC. Sem estado de conversa novo — é sempre a mesma lista derivada
  // dos dados já existentes.
  const subjects = getNpcSubjects(npc.key);
  // Sprint Discovery Graph (Phase I) — "Pessoas citadas": outros NPCs
  // mencionados pelo nome no próprio catálogo de falas dele.
  const citedPeople = getNpcCitedPeople(npc.key);

  // Sprint Expedition Echoes Phase I — eco genérico, aplicado a
  // qualquer NPC (nenhum tratamento especial pra Greta/Idris): só
  // aparece quando o PRÓPRIO catálogo de falas deste NPC já menciona o
  // nome da região da expedição atual do jogador (mesma técnica de
  // busca textual já usada por getNpcCitedPeople/getSimilarRumors em
  // knowledgeLinks.ts) — nunca uma menção inventada.
  const npcMentionsEchoRegion = useMemo(() => {
    if (!catalog || echoContext.regionName === null) return false;
    const regionName = echoContext.regionName.toLowerCase();
    return flattenDialogue(catalog).some((dialogueLine) => dialogueLine.toLowerCase().includes(regionName));
  }, [catalog, echoContext.regionName]);
  const echoLine = getNpcEchoLine(npcMentionsEchoRegion, echoContext);

  // Sprint Live Readiness Phase I — antes um encadeamento
  // `resolveFeedback ?? resolveFeedback` escrito à mão (cálculo de
  // prioridade duplicado, achado na auditoria); agora pergunta à camada
  // central (lib/liveReadiness.ts) qual das duas camadas mais
  // "pessoais" e mutuamente exclusivas (Living Consequences/Hero
  // Journey, já calculadas acima, nenhum dado novo) vence. `attention`
  // (Living Consequences) sempre vence sobre `softGlow` (Hero
  // Journey), nunca os dois juntos.
  const npcHighlightKey = getSingleHighlight(["consequence", "heroJourney"] as const, {
    consequence: consequenceLine !== null,
    heroJourney: heroJourneyLine !== null,
  });
  const feedbackCls = feedbackClassName(
    npcHighlightKey === "consequence" ? "attention" : npcHighlightKey === "heroJourney" ? "softGlow" : null,
  );

  // Sprint Living World (Phase I) — "Hoje está falando sobre...":
  // escolha determinística por dia dentro do próprio catálogo de 100
  // falas do NPC (mesmo catálogo do `fallbackLine`, só que fixo o dia
  // inteiro, igual pra todo jogador, em vez de sorteado por visita.
  const topicOfTheDay = useMemo(() => {
    if (!catalog) return null;
    const lines = flattenDialogue(catalog);
    return lines.length > 0 ? pickOfTheDay(lines, keySalt(npc.key)) : null;
  }, [catalog, npc.key]);

  return (
    <div className={`npc-intro${feedbackCls ? ` ${feedbackCls}` : ""} ${worldVisualClass}`}>
      <NpcPortrait npc={npc} />
      <div className="npc-intro-text">
        <strong className="npc-name">{npc.name}</strong>
        <span className="npc-profession">{npc.profession}</span>
        <p className="npc-quote">"{npc.quote}"</p>
        <p className="npc-description">{npc.description}</p>
        {topicOfTheDay ? (
          <p className="npc-topic-today">
            <span>Hoje está falando sobre: </span>"{topicOfTheDay}"
          </p>
        ) : null}
        {line ? <p className="npc-line">"{line}"</p> : null}
        {consequenceLine ? <p className="npc-line npc-habit-line">"{consequenceLine.line}"</p> : null}
        {heroJourneyLine ? <p className="npc-line npc-habit-line">"{heroJourneyLine.line}"</p> : null}
        {habitLine ? <p className="npc-line npc-habit-line">"{habitLine.line}"</p> : null}
        {foreshadowLine ? <p className="npc-line npc-habit-line">"{foreshadowLine.line}"</p> : null}
        {honorificLine ? <p className="npc-line npc-habit-line">"{honorificLine}"</p> : null}
        {livingConversationLine ? <p className="npc-line npc-habit-line">"{livingConversationLine.line}"</p> : null}
        {subjects.length > 0 ? (
          <p className="npc-subjects">
            <span>Últimos assuntos: </span>
            {subjects.join(", ")}
          </p>
        ) : null}
        {citedPeople.length > 0 ? (
          <p className="npc-subjects">
            <span>Pessoas citadas: </span>
            {citedPeople.join(", ")}
          </p>
        ) : null}
        {echoLine ? <p className="npc-line npc-habit-line">"{echoLine}"</p> : null}
        {dailyActivityLine ? <p className="npc-activity-line">{dailyActivityLine}</p> : null}
      </div>
    </div>
  );
}
