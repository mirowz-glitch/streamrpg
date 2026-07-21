import {
  NpcPortrait
} from "./chunk-INHR2XNO.js";
import {
  buildWorldVisualContext,
  feedbackClassName,
  getSingleHighlight,
  getWorldVisualClass
} from "./chunk-3SXGP2NO.js";
import {
  hasEncounteredLethalCreature
} from "./chunk-SMRWZSNT.js";
import {
  EMPTY_ECHO_CONTEXT,
  NPC_DIALOGUE,
  flattenDialogue,
  getConsequenceLine,
  getForeshadowLine,
  getHabitLine,
  getHeroJourneyLine,
  getLivingConversationLine,
  getNpcCitedPeople,
  getNpcEchoLine,
  getNpcSubjects,
  getRecentEvents,
  getRecognitionLine,
  keySalt,
  pickOfTheDay,
  randomLine,
  recordEvent,
  resolveRotatingLine
} from "./chunk-RHKKRLPV.js";
import {
  STAGE_CITY_HONORIFIC,
  buildPlayerFacts,
  getCharacterStage,
  useCharacter,
  useKingdomRole
} from "./chunk-3U2FLU6U.js";
import {
  useIdentity
} from "./chunk-WSY5ZGYB.js";
import {
  getStoredChannel
} from "./chunk-QNP5WKGO.js";
import {
  hasRemembered,
  remember
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/city/CityMap.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var BUILDING_IDENTITY_CLASS = {
  arena: "city-building-arena",
  ferreiro: "city-building-ferreiro",
  guilda: "city-building-guilda",
  "portao-norte": "city-building-portao-norte",
  biblioteca: "city-building-biblioteca",
  bestiario: "city-building-bestiario",
  museu: "city-building-museu",
  taverna: "city-building-taverna",
  "casa-dos-viajantes": "city-building-viajantes"
};
var BUILDINGS = [
  { key: "arena", name: "Arena", icon: "\u{1F3DF}\uFE0F", description: "Onde os feitos contra os Bosses s\xE3o lembrados." },
  { key: "ferreiro", name: "Ferreiro", icon: "\u{1F6E0}\uFE0F", description: "Seu equipamento, sempre \xE0 mostra." },
  { key: "mercador", name: "Mercador", icon: "\u{1F6D2}", description: "O com\xE9rcio do Reino \u2014 em constru\xE7\xE3o." },
  { key: "alquimista", name: "Alquimista", icon: "\u2697\uFE0F", description: "Po\xE7\xF5es e reagentes \u2014 em constru\xE7\xE3o." },
  { key: "guilda", name: "Guilda", icon: "\u{1F3DB}\uFE0F", description: "O Hall da Fama do Reino." },
  { key: "banco", name: "Banco", icon: "\u{1F3E6}", description: "Seu Gold, guardado com seguran\xE7a." },
  { key: "portao-norte", name: "Port\xE3o Norte", icon: "\u{1F6AA}", description: "A sa\xEDda para o mundo \u2014 regi\xF5es e expedi\xE7\xF5es." },
  { key: "biblioteca", name: "Biblioteca", icon: "\u{1F4DA}", description: "Um c\xF3dice para cada hist\xF3ria do Reino." },
  { key: "bestiario", name: "Besti\xE1rio", icon: "\u{1F52C}", description: "Um registro de cada criatura j\xE1 avistada." },
  { key: "museu", name: "Museu do Reino", icon: "\u{1F5BC}\uFE0F", description: "Onde a hist\xF3ria da comunidade fica registrada." },
  { key: "taverna", name: "Taverna", icon: "\u{1F37A}", description: "Onde o Reino descansa, conversa e inventa hist\xF3rias." },
  { key: "casa-dos-viajantes", name: "Casa dos Viajantes", icon: "\u{1F4DC}", description: "Hist\xF3rias contadas por gente comum. Ningu\xE9m sabe se s\xE3o verdade." }
];
var CityMap = (0, import_react.memo)(function CityMap2({ onSelect, highlightedBuildings = [] }) {
  const highlightCls = feedbackClassName("highlight");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "city-map-grid", children: BUILDINGS.map((building) => {
    const isHighlighted = highlightedBuildings.includes(building.key);
    const identityCls = BUILDING_IDENTITY_CLASS[building.key];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: `city-building-card${identityCls ? ` ${identityCls}` : ""}${isHighlighted ? ` ${highlightCls}` : ""}`,
        onClick: () => onSelect(building.key),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-icon", children: building.icon }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "city-building-name", children: building.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-description", children: building.description })
        ]
      },
      building.key
    );
  }) });
});

// apps/web/src/lib/microEvents.ts
function buildMicroEventContext(ctx) {
  if (!ctx) return {};
  return { worldEventCategory: ctx.eventCategory, playersOnline: ctx.playersOnline };
}
var HIGH_POPULATION_THRESHOLD = 5;
var PLACE_VARIANTS = {
  praca: [
    { when: (ctx) => (ctx.playersOnline ?? 0) >= HIGH_POPULATION_THRESHOLD, line: "V\xE1rias crian\xE7as brincam de pega-pombo ao mesmo tempo." },
    { line: "Uma crian\xE7a corre atr\xE1s de um pombo." }
  ],
  ferreiro: [{ line: "Um aprendiz varre limalha de metal para o canto da forja." }],
  biblioteca: [
    { when: (ctx) => ctx.worldEventCategory === "misterios", line: "Uma crian\xE7a larga o livro de figuras e espia por cima do ombro, curiosa." },
    { line: "Uma crian\xE7a folheia um livro de figuras no canto da sala." }
  ],
  museu: [{ line: "Algu\xE9m deixou flores diante de uma pe\xE7a antiga." }],
  guilda: [{ line: "Dois aventureiros comparam anota\xE7\xF5es sobre uma rota." }],
  arena: [{ line: "Um espectador aplaude sozinho nas arquibancadas vazias." }],
  "casa-dos-viajantes": [{ line: "Um viajante rec\xE9m-chegado ainda tira a poeira das botas." }],
  "portao-norte": [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "Um mensageiro entrega um recado urgente e retoma a marcha sem descanso." },
    { line: "Um mensageiro apressado passa pelos port\xF5es sem parar." }
  ],
  taverna: [
    { when: (ctx) => ctx.worldEventCategory === "celebracoes", line: "Algu\xE9m come\xE7a a bater palmas no ritmo de uma can\xE7\xE3o que todos conhecem." },
    { line: "Algu\xE9m assobia uma melodia desconhecida em um canto da sala." }
  ]
};
function getMicroEvent(place, ctx = {}) {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}

// apps/web/src/lib/worldCohesion.ts
function buildWorldCohesionContext(worldPresenceCtx, echoContext) {
  return {
    worldEventCategory: worldPresenceCtx?.eventCategory,
    approach: echoContext?.approach ?? null,
    destinationRegionName: echoContext?.regionName ?? null
  };
}
var hasDestination = (ctx) => ctx.destinationRegionName !== null && ctx.destinationRegionName !== void 0;
var PLACE_VARIANTS2 = {
  // Praça ↔ Expedição: a praça é onde o Reino inteiro comenta o que
  // acontece nas regiões, incluindo a expedição em curso do jogador.
  praca: [
    { when: hasDestination, line: "Quem passa por aqui comenta sobre relatos vindos da regi\xE3o da expedi\xE7\xE3o em curso." },
    { line: "Quem passa por aqui comenta sobre acontecimentos vindos de outras regi\xF5es." }
  ],
  // Ferreiro ↔ World Presence: o movimento da forja acompanha o humor
  // geral do Reino, sem repetir a própria frase de World Presence pra
  // "militar" ("A forja trabalha sem descanso hoje." — sobre a forja
  // em si) nem a de Micro Events (o aprendiz varrendo limalha).
  ferreiro: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "O ritmo na forja parece acompanhar o mesmo alvoro\xE7o que tomou conta do Reino hoje." },
    { line: "O ritmo na forja parece acompanhar o que se comenta pelo Reino hoje." }
  ],
  // Biblioteca ↔ Expedição: os mapas consultados na Biblioteca ecoam
  // pra onde as expedições reais estão indo.
  biblioteca: [
    { when: hasDestination, line: "Os mapas consultados hoje parecem apontar direto para o destino da expedi\xE7\xE3o em curso." },
    { line: "Os mapas consultados hoje parecem apontar para a mesma dire\xE7\xE3o das \xFAltimas expedi\xE7\xF5es." }
  ],
  // Museu ↔ Expedição/Discovery: peças recentes do Museu remetem a
  // achados feitos durante expedições além das muralhas.
  museu: [
    { when: (ctx) => ctx.worldEventCategory === "misterios", line: "Pe\xE7as rec\xE9m-catalogadas parecem vir de achados intrigantes feitos al\xE9m das muralhas." },
    { line: "Pe\xE7as rec\xE9m-catalogadas parecem vir de achados feitos al\xE9m das muralhas." }
  ],
  // Guilda ↔ Taverna/Kingdom Reputation: contratos da Guilda ecoam os
  // mesmos rumores que já circulam pela cidade — reage a Approach
  // (mesmo eixo "investigate revela mais detalhe" já usado em Knowledge
  // Rewards, aqui só como tom, nunca alterando quantidade de nada).
  guilda: [
    {
      when: (ctx) => ctx.approach === "investigate",
      line: "Os contratos mais procurados citam detalhes que s\xF3 quem se aprofunda percebe, os mesmos que os rumores da cidade j\xE1 insinuavam."
    },
    {
      when: (ctx) => ctx.approach === "continue",
      line: "Os contratos mais procurados lembram os rumores que circulam pela cidade, sem muita novidade."
    },
    { line: "Os contratos mais procurados lembram os rumores que circulam pela cidade." }
  ],
  // Taverna ↔ World Presence: as histórias contadas hoje combinam com
  // o clima geral do Reino, sem repetir a própria frase de World
  // Simulation ("Alguém acabou de contar uma história...").
  taverna: [
    { when: (ctx) => ctx.worldEventCategory === "celebracoes", line: "As hist\xF3rias desta noite parecem ecoar as celebra\xE7\xF5es que tomam conta do Reino." },
    { line: "As hist\xF3rias desta noite parecem combinar com o clima do Reino." }
  ],
  // Portão Norte ↔ Casa dos Viajantes/Knowledge Threads: viajantes que
  // chegam contam relatos parecidos com os de quem segue pro mesmo
  // destino.
  "portao-norte": [
    { when: hasDestination, line: "Os viajantes chegam trazendo relatos parecidos com os de quem segue para o mesmo destino agora." },
    { line: "Os viajantes chegam trazendo relatos semelhantes." }
  ],
  // Arena ↔ NPC Daily Activities/World Presence: os treinamentos
  // parecem acompanhar o momento do Reino, sem repetir a própria
  // atividade do Mestre da Arena ("Treina golpes.").
  arena: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "At\xE9 os treinamentos parecem mais intensos, acompanhando o momento vivido pelo Reino." },
    { line: "At\xE9 os treinamentos parecem acompanhar o momento vivido pelo Reino." }
  ],
  // Casa dos Viajantes ↔ Expedição: quase toda conversa acaba
  // convergindo pro destino da expedição em curso.
  "casa-dos-viajantes": [
    { when: hasDestination, line: "As hist\xF3rias contadas aqui hoje parecem sempre puxar assunto para o destino da expedi\xE7\xE3o em curso." },
    { line: "As hist\xF3rias contadas aqui hoje parecem sempre puxar assunto para o mesmo lugar." }
  ]
};
function getWorldCohesionLine(place, ctx = {}) {
  return resolveRotatingLine(PLACE_VARIANTS2[place], ctx, keySalt(place));
}

// apps/web/src/components/city/NpcIntro.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/lib/npcDailyActivities.ts
var ACTIVITIES_BY_NPC = {
  ferreiro: [
    "Est\xE1 afiando uma espada antiga.",
    "Examina uma pe\xE7a de armadura.",
    "Organiza ferramentas.",
    "Apaga a forja por alguns minutos."
  ],
  taverneira: ["Enche novas canecas.", "Limpa o balc\xE3o.", "Conta moedas.", "Conversa com viajantes."],
  bibliotecaria: [
    "Organiza livros antigos.",
    "Anota alguma descoberta.",
    "Separa pergaminhos.",
    "Recoloca um livro na estante."
  ],
  curador: ["Limpa uma vitrine.", "Observa um artefato.", "Anota um registro."],
  guarda: ["Observa a estrada.", "Confere o port\xE3o.", "Troca turno com outro guarda."],
  viajante: ["Desdobra mapas.", "Escreve notas.", "Marca uma rota."],
  mestreArena: ["Treina golpes.", "Reorganiza armas.", "Analisa um duelo."],
  guildmaster: ["Observa os aventureiros.", "Conversa discretamente.", "Analisa relat\xF3rios."],
  tesoureiro: ["Revisa documentos.", "Organiza registros.", "Confere o cofre.", "Anota um pagamento."],
  mercador: [
    "Reorganiza as mercadorias na prateleira.",
    "Confere o estoque.",
    "Negocia um pre\xE7o com um fornecedor.",
    "Empacota itens novos."
  ],
  alquimista: [
    "Mistura um novo composto.",
    "Rotula frascos.",
    "Observa uma rea\xE7\xE3o borbulhante.",
    "Organiza ingredientes raros."
  ],
  erudito: [
    "Examina anota\xE7\xF5es de campo.",
    "Cataloga uma nova observa\xE7\xE3o.",
    "Organiza esp\xE9cimes.",
    "Revisa desenhos de criaturas."
  ]
};
function getNpcDailyActivity(npcKey) {
  const activities = ACTIVITIES_BY_NPC[npcKey];
  if (!activities || activities.length === 0) return null;
  return pickOfTheDay(activities, keySalt(npcKey));
}

// apps/web/src/components/city/NpcIntro.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function NpcIntro({ npc, worldEventCategory, echoContext = EMPTY_ECHO_CONTEXT }) {
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || void 0, true);
  const catalog = NPC_DIALOGUE[npc.key];
  const [fallbackLine] = (0, import_react2.useState)(() => catalog ? randomLine(catalog) : null);
  const facts = (0, import_react2.useMemo)(() => {
    if (!character || !identity) return null;
    return buildPlayerFacts(character, identity, kingdomRoles);
  }, [character, identity, kingdomRoles]);
  const recognitionLine = (0, import_react2.useMemo)(() => {
    if (!facts) return null;
    return getRecognitionLine(npc.key, facts);
  }, [npc.key, facts]);
  (0, import_react2.useEffect)(() => {
    if (recognitionLine) {
      recordEvent("recognition_shown", { npcKey: npc.key });
    }
  }, [npc.key, recognitionLine]);
  const line = recognitionLine ?? fallbackLine;
  const habitContext = (0, import_react2.useMemo)(() => {
    if (!facts) return null;
    const recentEvents = getRecentEvents(20);
    const booksRead = recentEvents.filter((e) => e.kind === "book_read").length;
    const creaturesViewed = recentEvents.filter((e) => e.kind === "creature_viewed").length;
    const museumEntriesViewed = recentEvents.filter((e) => e.kind === "museum_entry_viewed").length;
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
      hasCompletedFirstExpedition: facts.hasCompletedFirstExpedition
    };
  }, [npc.key, facts, worldEventCategory]);
  const consequenceLine = (0, import_react2.useMemo)(() => {
    if (!habitContext) return null;
    return getConsequenceLine(npc.key, habitContext);
  }, [npc.key, habitContext]);
  (0, import_react2.useEffect)(() => {
    if (!consequenceLine) return;
    remember(consequenceLine.memoryKey);
  }, [consequenceLine]);
  const heroJourneyLine = (0, import_react2.useMemo)(() => {
    if (!habitContext || consequenceLine) return null;
    return getHeroJourneyLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine]);
  (0, import_react2.useEffect)(() => {
    if (!heroJourneyLine) return;
    remember(heroJourneyLine.memoryKey);
  }, [heroJourneyLine]);
  const habitLine = (0, import_react2.useMemo)(() => {
    if (!habitContext || consequenceLine || heroJourneyLine) return null;
    return getHabitLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine, heroJourneyLine]);
  (0, import_react2.useEffect)(() => {
    if (!habitLine) return;
    remember(habitLine.memoryKey);
    if (habitLine.timelineKind) {
      recordEvent(habitLine.timelineKind, { npcKey: npc.key });
    }
    if (!hasRemembered("npc_first_recognition_recorded")) {
      remember("npc_first_recognition_recorded");
      recordEvent("npc_first_recognition", { npcKey: npc.key });
    }
  }, [habitLine]);
  const foreshadowLine = (0, import_react2.useMemo)(() => {
    if (!habitContext || consequenceLine || heroJourneyLine || habitLine) return null;
    return getForeshadowLine(npc.key, habitContext);
  }, [npc.key, habitContext, consequenceLine, heroJourneyLine, habitLine]);
  (0, import_react2.useEffect)(() => {
    if (!foreshadowLine) return;
    remember(foreshadowLine.memoryKey);
  }, [foreshadowLine]);
  const honorificLine = (0, import_react2.useMemo)(() => {
    if (!facts || consequenceLine || heroJourneyLine || habitLine || foreshadowLine) return null;
    if (npc.key !== "guildmaster" && npc.key !== "guarda") return null;
    return STAGE_CITY_HONORIFIC[getCharacterStage(facts)] ?? null;
  }, [npc.key, facts, consequenceLine, heroJourneyLine, habitLine, foreshadowLine]);
  const livingConversationLine = (0, import_react2.useMemo)(() => {
    if (consequenceLine || heroJourneyLine || habitLine || foreshadowLine || honorificLine) return null;
    return getLivingConversationLine(npc.key);
  }, [npc.key, consequenceLine, heroJourneyLine, habitLine, foreshadowLine, honorificLine]);
  const dailyActivityLine = (0, import_react2.useMemo)(() => {
    if (consequenceLine || heroJourneyLine || habitLine || foreshadowLine || honorificLine || livingConversationLine) {
      return null;
    }
    return getNpcDailyActivity(npc.key);
  }, [npc.key, consequenceLine, heroJourneyLine, habitLine, foreshadowLine, honorificLine, livingConversationLine]);
  const worldVisualClass = getWorldVisualClass(
    "npc",
    buildWorldVisualContext({ hasLivingConsequence: consequenceLine !== null, hasHeroJourney: heroJourneyLine !== null })
  );
  const subjects = getNpcSubjects(npc.key);
  const citedPeople = getNpcCitedPeople(npc.key);
  const npcMentionsEchoRegion = (0, import_react2.useMemo)(() => {
    if (!catalog || echoContext.regionName === null) return false;
    const regionName = echoContext.regionName.toLowerCase();
    return flattenDialogue(catalog).some((dialogueLine) => dialogueLine.toLowerCase().includes(regionName));
  }, [catalog, echoContext.regionName]);
  const echoLine = getNpcEchoLine(npcMentionsEchoRegion, echoContext);
  const npcHighlightKey = getSingleHighlight(["consequence", "heroJourney"], {
    consequence: consequenceLine !== null,
    heroJourney: heroJourneyLine !== null
  });
  const feedbackCls = feedbackClassName(
    npcHighlightKey === "consequence" ? "attention" : npcHighlightKey === "heroJourney" ? "softGlow" : null
  );
  const topicOfTheDay = (0, import_react2.useMemo)(() => {
    if (!catalog) return null;
    const lines = flattenDialogue(catalog);
    return lines.length > 0 ? pickOfTheDay(lines, keySalt(npc.key)) : null;
  }, [catalog, npc.key]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `npc-intro${feedbackCls ? ` ${feedbackCls}` : ""} ${worldVisualClass}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(NpcPortrait, { npc }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "npc-intro-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "npc-name", children: npc.name }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "npc-profession", children: npc.profession }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-quote", children: [
        '"',
        npc.quote,
        '"'
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "npc-description", children: npc.description }),
      topicOfTheDay ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-topic-today", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Hoje est\xE1 falando sobre: " }),
        '"',
        topicOfTheDay,
        '"'
      ] }) : null,
      line ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line", children: [
        '"',
        line,
        '"'
      ] }) : null,
      consequenceLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        consequenceLine.line,
        '"'
      ] }) : null,
      heroJourneyLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        heroJourneyLine.line,
        '"'
      ] }) : null,
      habitLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        habitLine.line,
        '"'
      ] }) : null,
      foreshadowLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        foreshadowLine.line,
        '"'
      ] }) : null,
      honorificLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        honorificLine,
        '"'
      ] }) : null,
      livingConversationLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        livingConversationLine.line,
        '"'
      ] }) : null,
      subjects.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-subjects", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\xDAltimos assuntos: " }),
        subjects.join(", ")
      ] }) : null,
      citedPeople.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-subjects", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Pessoas citadas: " }),
        citedPeople.join(", ")
      ] }) : null,
      echoLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line npc-habit-line", children: [
        '"',
        echoLine,
        '"'
      ] }) : null,
      dailyActivityLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "npc-activity-line", children: dailyActivityLine }) : null
    ] })
  ] });
}

export {
  CityMap,
  NpcIntro,
  buildMicroEventContext,
  getMicroEvent,
  buildWorldCohesionContext,
  getWorldCohesionLine
};
