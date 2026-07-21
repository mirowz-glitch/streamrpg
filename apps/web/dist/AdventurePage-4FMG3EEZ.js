import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import "./chunk-ATYDFFRC.js";
import {
  ProgressBar
} from "./chunk-W3P4YRUG.js";
import {
  AnimationController,
  CharacterBuild,
  Equipment,
  ITEM_GEN_RARITIES,
  Inventory,
  advanceDungeonTick,
  buildAnimationsForTick,
  createAdventureCharacter,
  createAdventureSession,
  createAdventureTimeline,
  deriveHudState,
  equipStarterKit,
  getRegionName,
  toHealthBarState
} from "./chunk-S4O55MUY.js";
import "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/useAdventureSession.ts
var import_react = __toESM(require_react(), 1);
var DEMO_CHARACTER_ID = "vertical-slice-hero";
var DEMO_CLASS_ID = "warrior";
var DEMO_REGION_ID = "bosque-sussurrante";
var DEMO_LEVEL_UPS = 0;
var DEMO_XP_PER_LEVEL = 2e4;
var DEMO_INVENTORY_CAPACITY = 24;
function createDemoState(seed) {
  const build = new CharacterBuild(DEMO_CHARACTER_ID, DEMO_CLASS_ID, 0);
  for (let i = 0; i < DEMO_LEVEL_UPS; i++) build.addExperience(DEMO_XP_PER_LEVEL);
  const inventory = new Inventory(DEMO_CHARACTER_ID, DEMO_INVENTORY_CAPACITY);
  const equipment = new Equipment(DEMO_CHARACTER_ID);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, DEMO_CLASS_ID, seed);
  const session = createAdventureSession(`${DEMO_CHARACTER_ID}-session`, character, DEMO_REGION_ID, seed, Date.now());
  const timeline = createAdventureTimeline(session.sessionId);
  return { session, timeline };
}
function useAdventureSession() {
  const stateRef = (0, import_react.useRef)(createDemoState(Date.now()));
  const [renderVersion, forceRender] = (0, import_react.useReducer)((version) => version + 1, 0);
  const [error, setError] = (0, import_react.useState)(null);
  const hudState = (0, import_react.useMemo)(
    () => deriveHudState(stateRef.current.session, stateRef.current.timeline),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- renderVersion é a única dependência real (session/timeline são mutáveis, não re-criados)
    [renderVersion]
  );
  const advance = (0, import_react.useCallback)((autoEquip) => {
    let outcome = null;
    try {
      const { events, floatingNumbers } = advanceDungeonTick(stateRef.current.session, stateRef.current.timeline, {
        autoEquip,
        currentTime: Date.now()
      });
      outcome = { events, floatingNumbers };
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
    forceRender();
    return outcome;
  }, []);
  const restart = (0, import_react.useCallback)(() => {
    stateRef.current = createDemoState(Date.now());
    setError(null);
    forceRender();
  }, []);
  return { hudState, error, advance, restart };
}

// apps/web/src/hooks/useAnimationController.ts
var import_react2 = __toESM(require_react(), 1);
var TICK_INTERVAL_MS = 50;
function useAnimationController() {
  const controllerRef = (0, import_react2.useRef)(new AnimationController());
  const [active, setActive] = (0, import_react2.useState)([]);
  (0, import_react2.useEffect)(() => {
    const intervalId = window.setInterval(() => {
      controllerRef.current.tick(Date.now());
      setActive(controllerRef.current.getSnapshot().active);
    }, TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);
  function playTick(events, floatingNumbers) {
    const animations = buildAnimationsForTick(events, floatingNumbers, Date.now());
    controllerRef.current.enqueue(animations);
  }
  function reset() {
    controllerRef.current.clear();
    setActive([]);
  }
  return { active, playTick, reset };
}

// apps/web/src/components/hud/HealthBar.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function HealthBar({ currentLife, maximumLife }) {
  const state = toHealthBarState(currentLife, maximumLife);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hud-health-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent: state.percent, variant: "life", label: "Vida" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "hud-health-bar-value", children: [
      Math.round(state.current),
      " / ",
      Math.round(state.maximum),
      " (",
      state.percent,
      "%)"
    ] })
  ] });
}

// apps/web/src/components/hud/RegionPanel.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function RegionPanel({ region }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "section",
    {
      className: `hud-region-panel${region.biome ? " hud-region-panel-themed" : ""}`,
      style: region.biome ? { borderLeftColor: region.biome.visualTheme.color } : void 0,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h3", { className: "hud-region-name", children: [
          region.biome ? `${region.biome.visualTheme.icon} ` : "",
          region.name
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "hud-region-detail", children: [
          "Dificuldade: ",
          region.biome?.difficultyLabel ?? region.difficulty ?? "Desconhecida"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "hud-region-detail", children: [
          "N\xEDvel recomendado:",
          " ",
          region.recommendedLevelRange ? `${region.recommendedLevelRange.min}\u2013${region.recommendedLevelRange.max}` : "Sem dados ainda"
        ] }),
        region.biome ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "hud-region-detail", children: [
            "Clima: ",
            region.biome.climate
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "hud-region-description", children: region.biome.description })
        ] }) : null
      ]
    }
  );
}

// apps/web/src/components/hud/EncounterPanel.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var STATE_LABEL = {
  "sem-encontro": "Explorando",
  "em-combate": "Em combate",
  concluido: "Encontro conclu\xEDdo"
};
function EncounterPanel({ encounter }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "hud-encounter-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "hud-encounter-state", children: STATE_LABEL[encounter.state] }),
    encounter.enemiesTotal > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "hud-encounter-detail", children: [
      encounter.enemiesDefeated,
      " / ",
      encounter.enemiesTotal,
      " inimigos derrotados"
    ] }) : null
  ] });
}

// apps/web/src/components/hud/SessionStatusBadge.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL = {
  explorando: "Explorando",
  "em-combate": "Em combate",
  vitoria: "Vit\xF3ria",
  derrota: "Derrota",
  encerrada: "Encerrada"
};
function SessionStatusBadge({ status }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `hud-session-status hud-session-status-${status}`, children: STATUS_LABEL[status] });
}

// apps/web/src/components/hud/SessionOverlay.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
function SessionOverlay({ statistics }) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "hud-session-overlay", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u23F1 ",
      formatElapsed(statistics.elapsedTime)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u{1F5FA} ",
      statistics.encountersCompleted,
      " encontros"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u2620\uFE0F ",
      statistics.enemiesKilled,
      " derrotados"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u{1F381} ",
      statistics.itemsFound,
      " itens achados"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u{1F6E1}\uFE0F ",
      statistics.itemsEquipped,
      " equipados"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u{1F4A5} ",
      statistics.damageDealt.toFixed(0),
      " dano causado"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hud-session-overlay-item", children: [
      "\u{1FA78} ",
      statistics.damageTaken.toFixed(0),
      " dano sofrido"
    ] })
  ] });
}

// apps/web/src/components/hud/LootPopup.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var LOOT_ANIMATION_TYPES = /* @__PURE__ */ new Set(["loot-drop-common", "loot-drop-magic", "loot-drop-rare", "loot-drop-unique"]);
function rarityDisplay(rarity) {
  const found = ITEM_GEN_RARITIES.find((entry) => entry.id === rarity);
  return found ? { label: found.label, color: found.color } : { label: rarity, color: "#9aa0a6" };
}
function LootPopup({ active }) {
  const animation = active.find((entry) => LOOT_ANIMATION_TYPES.has(entry.type));
  if (!animation) return null;
  const loot = animation.payload;
  const rarity = rarityDisplay(loot.rarity);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "hud-loot-popup", style: { borderColor: rarity.color }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "hud-loot-popup-title", style: { color: rarity.color }, children: loot.baseItemId }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "hud-loot-popup-line", children: rarity.label }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "hud-loot-popup-line", children: [
      "Power Score: ",
      loot.powerScore
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "hud-loot-popup-line", children: [
      "Origem: ",
      loot.regionId
    ] })
  ] });
}

// apps/web/src/components/hud/EquipmentPopup.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var EQUIPMENT_ANIMATION_TYPES = /* @__PURE__ */ new Set(["equipment-pulse-upgrade", "equipment-pulse-downgrade", "equipment-pulse-neutral"]);
function EquipmentPopup({ active }) {
  const animation = active.find((entry) => EQUIPMENT_ANIMATION_TYPES.has(entry.type));
  if (!animation) return null;
  const equip = animation.payload;
  const isPositive = equip.delta >= 0;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `hud-equipment-popup ${isPositive ? "hud-equipment-popup-positive" : "hud-equipment-popup-negative"}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "hud-equipment-popup-title", children: equip.baseItemId }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "hud-equipment-popup-line", children: [
      "Slot: ",
      equip.slotId
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "hud-equipment-popup-line", children: [
      "Power Score: ",
      equip.powerScore
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "hud-equipment-popup-delta", children: [
      isPositive ? "+" : "",
      equip.delta
    ] })
  ] });
}

// apps/web/src/components/hud/FloatingNumbers.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var FLOATING_ANIMATION_TYPES = [
  "floating-number-damage",
  "floating-number-critical",
  "floating-number-miss",
  "floating-number-heal",
  "floating-number-lifeLeech"
];
var LABEL = {
  "floating-number-damage": "Dano",
  "floating-number-critical": "Cr\xEDtico!",
  "floating-number-miss": "Errou",
  "floating-number-heal": "Cura",
  "floating-number-lifeLeech": "Roubo de Vida"
};
function FloatingNumbers({ active }) {
  const numbers = active.filter(
    (animation) => FLOATING_ANIMATION_TYPES.includes(animation.type)
  );
  if (numbers.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "hud-floating-numbers", children: numbers.map((animation) => {
    const payload = animation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
      "span",
      {
        className: `hud-floating-number hud-floating-number-${animation.type} hud-floating-number-${payload.target}`,
        style: { animationDuration: `${animation.duration}ms` },
        children: [
          LABEL[animation.type],
          " ",
          payload.value > 0 ? payload.value.toFixed(0) : ""
        ]
      },
      animation.id
    );
  }) });
}

// apps/web/src/components/hud/EventFeed.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function describeEvent(event) {
  switch (event.kind) {
    case "EncounterStarted":
      return `Encontro iniciado em ${event.regionId} (${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"})`;
    case "AttackStarted":
      return `Combate contra ${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"}`;
    case "AttackHit":
      return `${event.damageDealt.toFixed(0)} de dano causado, ${event.damageTaken.toFixed(0)} sofrido`;
    case "CriticalHit":
      return "Golpe cr\xEDtico!";
    case "Miss":
      return "Ataque errou";
    case "EnemyKilled":
      return `${event.count} inimigo${event.count === 1 ? "" : "s"} derrotado${event.count === 1 ? "" : "s"}`;
    case "LootDropped":
      return `Item encontrado: ${event.baseItemId} (${event.rarity})`;
    case "ItemEquipped":
      return `Equipado: ${event.baseItemId} no slot ${event.slotId}`;
    case "EncounterFinished":
      return `Encontro conclu\xEDdo (${event.enemiesKilled} derrotado${event.enemiesKilled === 1 ? "" : "s"})`;
    case "CharacterDied":
      return "Seu personagem morreu";
    case "LevelUp":
      return `N\xEDvel ${event.level} alcan\xE7ado!`;
    case "RecoveryApplied":
      return `Recupera\xE7\xE3o: +${event.lifeHealed.toFixed(0)} HP`;
    case "ObjectiveCompleted":
      return `Objetivo conclu\xEDdo: ${event.objectiveName} (+${event.xpBonus} XP)`;
    case "RegionUnlocked":
      return `Nova regi\xE3o desbloqueada: ${getRegionName(event.newRegionId)}`;
    case "RegionEntered":
      return `Entrando em ${getRegionName(event.regionId)}`;
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: "feed" —
    // mesmo padrão de todos os outros casos, só formata o que o próprio
    // evento já carrega.
    case "EliteEncounter":
      return `Elite avistado: ${event.enemyName} em ${getRegionName(event.regionId)}`;
    case "MiniBossEncounter":
      return `Mini-Boss avistado: ${event.enemyName} em ${getRegionName(event.regionId)}`;
    case "EliteDefeated":
      return `Elite derrotado: ${event.enemyName} (+${event.xpBonus} XP)`;
    case "MiniBossDefeated":
      return `Mini-Boss derrotado: ${event.enemyName} (+${event.xpBonus} XP)`;
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 7: "feed" — mesmo padrão de todos os outros casos.
    case "WorldEventStarted":
      return `Evento encontrado: ${event.name}`;
    case "WorldEventCompleted":
      return `Evento conclu\xEDdo: ${event.name}`;
    case "TreasureOpened":
      return `Tesouro aberto: ${event.itemCount} item${event.itemCount === 1 ? "" : "ns"}${event.goldAmount > 0 ? ` + ${event.goldAmount} ouro` : ""}`;
    case "MerchantFound":
      return `Mercador encontrado: +${event.goldAmount} ouro`;
    case "ShrineBlessing":
      return `B\xEAn\xE7\xE3o recebida: +${event.recoveryAmount.toFixed(0)} HP, +${event.xpAmount} XP, +${event.goldAmount} ouro`;
    case "DiscoveryMade":
      return `Descoberta feita: +${event.xpAmount} XP`;
    case "AmbushTriggered":
      return `Emboscada! ${event.enemyCount} inimigo${event.enemyCount === 1 ? "" : "s"}`;
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 8: "feed" — mesmo padrão de todos os outros casos.
    case "ExpeditionStarted":
      return `Expedi\xE7\xE3o iniciada: ${event.name}`;
    case "ExpeditionCheckpointReached":
      return `Checkpoint ${event.checkpointIndex}/${event.checkpointsTotal} atingido (+${event.recoveryAmount.toFixed(0)} HP)`;
    case "ExpeditionCompleted":
      return `Expedi\xE7\xE3o conclu\xEDda: ${event.name} (+${event.xpAmount} XP, +${event.goldAmount} ouro)`;
    case "ExpeditionFailed":
      return `Expedi\xE7\xE3o falhou: ${event.name}`;
    // Factions, Reputation & World Consequences Phase I — requisito 6:
    // "feed" — mesmo padrão de todos os outros casos.
    case "ReputationChanged":
      return `Reputa\xE7\xE3o com ${event.factionName}: +${event.delta} (total: ${event.newReputation})`;
    case "ReputationRankUp":
      return `${event.factionName} agora te v\xEA como: ${event.rankName}`;
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 9: "feed" — mesmo padrão de todos os outros casos.
    case "FinalBossEncounter":
      return `Chefe Final avistado: ${event.enemyName}`;
    case "FinalBossDefeated":
      return `Chefe Final derrotado: ${event.enemyName} (+${event.xpAmount} XP, +${event.goldAmount} ouro)`;
    case "DungeonCompleted":
      return `Dungeon conclu\xEDda: ${event.name} (Chefe Final: ${event.bossName})`;
    default:
      return event;
  }
}
function EventFeed({ events }) {
  if (events.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "hud-event-feed-empty", children: "Nenhum evento ainda." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("ul", { className: "hud-event-feed", children: [...events].reverse().map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("li", { className: `hud-event-feed-item hud-event-feed-item-${event.kind}`, children: describeEvent(event) }, `${event.tickIndex}-${index}`)) });
}

// apps/web/src/components/hud/CharacterStage.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function CharacterStage({ active }) {
  const isHit = active.some((animation) => animation.type === "character-hit");
  const isDead = active.some((animation) => animation.type === "character-death");
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: `hud-combatant-stage hud-character-stage${isHit ? " hud-character-stage-hit" : ""}${isDead ? " hud-character-stage-dead" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "hud-combatant-icon", children: "\u{1F9CD}" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "hud-combatant-label", children: "Voc\xEA" })
  ] });
}

// apps/web/src/components/hud/EnemyStage.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function EnemyStage({ active, encounter }) {
  const variant = encounter?.variant ?? "normal";
  const isCritical = active.some((animation) => animation.type === "enemy-critical-hit");
  const isMiss = active.some((animation) => animation.type === "enemy-miss");
  const isHit = active.some(
    (animation) => animation.type === "enemy-hit" || animation.type === "enemy-critical-hit" || animation.type === "enemy-elite-hit" || animation.type === "enemy-boss-hit"
  );
  const isDead = active.some((animation) => animation.type.startsWith("enemy-death"));
  const classes = ["hud-combatant-stage", "hud-enemy-stage"];
  if (isHit) classes.push(variant === "miniboss" ? "hud-enemy-stage-boss-hit" : variant === "elite" ? "hud-enemy-stage-elite-hit" : "hud-enemy-stage-hit");
  if (isCritical) classes.push("hud-enemy-stage-critical");
  if (isMiss) classes.push("hud-enemy-stage-miss");
  if (isDead) classes.push("hud-enemy-stage-dead");
  if (variant !== "normal") classes.push("hud-enemy-stage-aura");
  const auraStyle = variant !== "normal" && encounter?.auraColor ? { "--hud-aura-color": encounter.auraColor } : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: classes.join(" "), style: auraStyle, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "hud-combatant-icon", children: variant !== "normal" && encounter?.auraIcon ? encounter.auraIcon : "\u{1F479}" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "hud-combatant-label", children: variant === "miniboss" ? "Mini-Boss" : variant === "elite" ? "Elite" : "Inimigo" })
  ] });
}

// apps/web/src/components/hud/XpBar.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function XpBar({ xpProgress }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "hud-xp-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "hud-xp-bar-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "hud-xp-bar-level", children: [
        "N\xEDvel ",
        xpProgress.level
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "hud-xp-bar-value", children: [
        xpProgress.xp,
        " / ",
        xpProgress.xp + xpProgress.xp_to_next,
        " XP (",
        xpProgress.percent,
        "%)"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ProgressBar, { percent: xpProgress.percent, variant: "xp", label: "Experi\xEAncia" })
  ] });
}

// apps/web/src/components/hud/LevelUpBanner.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function LevelUpBanner({ active }) {
  const animation = active.find((entry) => entry.type === "level-up");
  if (!animation) return null;
  const payload = animation.payload;
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "hud-level-up-banner", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "hud-level-up-banner-title", children: [
    "N\xEDvel ",
    payload.level,
    " alcan\xE7ado!"
  ] }) });
}

// apps/web/src/components/hud/PermanentStatsBar.tsx
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function PermanentStatsBar({ hudState }) {
  const { xpProgress, statistics, bestItemFound } = hudState;
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("section", { className: "hud-permanent-stats", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "hud-permanent-stats-item", children: [
      "N\xEDvel ",
      xpProgress.level
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "hud-permanent-stats-item", children: [
      xpProgress.xp,
      " XP"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "hud-permanent-stats-item", children: [
      "\u{1FA99} ",
      statistics.goldFound
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "hud-permanent-stats-item", children: [
      "\u{1F3C6} ",
      bestItemFound ? `${bestItemFound.baseItemId} (${bestItemFound.powerScore})` : "Nenhum item ainda"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("span", { className: "hud-permanent-stats-item", children: [
      "\u{1F525} ",
      statistics.enemiesKilled,
      " abates"
    ] })
  ] });
}

// apps/web/src/components/hud/ProgressionCelebration.tsx
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function ProgressionCelebration({ hudState }) {
  const { newBestItemEvent, newDamageRecordEvent } = hudState;
  if (!newBestItemEvent && !newDamageRecordEvent) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "hud-progression-celebration", children: [
    newBestItemEvent ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "hud-progression-celebration-item", children: [
      "\u{1F3C6} Novo melhor item: ",
      newBestItemEvent.baseItemId,
      " (",
      newBestItemEvent.rarity,
      ", Power Score ",
      newBestItemEvent.powerScore,
      ")"
    ] }) : null,
    newDamageRecordEvent ? /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("span", { className: "hud-progression-celebration-item", children: [
      "\u{1F525} Novo recorde de dano: ",
      newDamageRecordEvent.damageDealt.toFixed(0)
    ] }) : null
  ] });
}

// apps/web/src/components/hud/SessionHistoryPanel.tsx
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function SessionHistoryPanel({ history }) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("section", { className: "hud-session-history", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "hud-session-history-item", children: [
      "\u{1F5FA} ",
      history.encountersCompleted,
      "/",
      history.encountersStarted,
      " encontros conclu\xEDdos"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "hud-session-history-item", children: [
      "\u{1F6E1}\uFE0F ",
      history.survivalRate.toFixed(0),
      "% sobreviv\xEAncia"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "hud-session-history-item", children: [
      "\u2694\uFE0F ",
      history.averageDps.toFixed(1),
      " DPS m\xE9dio"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "hud-session-history-item", children: [
      "\u{1FA78} ",
      history.damagePerEncounter.toFixed(0),
      " dano/encontro"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "hud-session-history-item", children: [
      "\u{1F381} ",
      history.itemsPerEncounter.toFixed(1),
      " itens/encontro"
    ] })
  ] });
}

// apps/web/src/components/hud/SessionSummaryPanel.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
function formatElapsed2(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
function SessionSummaryPanel({ summary }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "hud-session-summary", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "hud-session-summary-title", children: "Resumo da Aventura" }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "hud-session-summary-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u23F1 Tempo jogado: ",
        formatElapsed2(summary.elapsedTime)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u2620\uFE0F Inimigos derrotados: ",
        summary.enemiesKilled
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u{1F4A5} Dano causado: ",
        summary.damageDealt.toFixed(0)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u{1FA78} Dano recebido: ",
        summary.damageTaken.toFixed(0)
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u{1F381} Itens encontrados: ",
        summary.itemsFound
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u{1F6E1}\uFE0F Itens equipados: ",
        summary.itemsEquipped
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { children: [
        "\u2728 XP obtida: ",
        summary.xpGained
      ] })
    ] })
  ] });
}

// apps/web/src/components/hud/RecoveryBadge.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function RecoveryBadge({ recovery }) {
  if (!recovery) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "hud-recovery-badge", children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "hud-recovery-badge-label", children: "Recupera\xE7\xE3o" }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { className: "hud-recovery-badge-value", children: [
      "+",
      recovery.lifeHealed.toFixed(0),
      " HP"
    ] })
  ] });
}

// apps/web/src/components/hud/ObjectiveCard.tsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
function ObjectiveCard({ objective }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("section", { className: "hud-objective-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "hud-objective-card-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "hud-objective-card-label", children: "Objetivo Atual" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "hud-objective-card-name", children: objective.name })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "hud-objective-card-description", children: objective.description }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(ProgressBar, { percent: objective.percent, variant: "objective", label: "Progresso do objetivo" }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "hud-objective-card-progress", children: [
      objective.progress,
      " / ",
      objective.target
    ] })
  ] });
}

// apps/web/src/components/hud/ObjectiveCompletedBanner.tsx
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
function ObjectiveCompletedBanner({ active }) {
  const animation = active.find((entry) => entry.type === "objective-completed");
  if (!animation) return null;
  const payload = animation.payload;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "hud-objective-completed-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "hud-objective-completed-banner-title", children: [
      "Objetivo conclu\xEDdo: ",
      payload.objectiveName
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { className: "hud-objective-completed-banner-reward", children: [
      "+",
      payload.xpBonus,
      " XP b\xF4nus"
    ] })
  ] });
}

// apps/web/src/components/hud/RegionUnlockBanner.tsx
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
function RegionUnlockBanner({ active }) {
  const animation = active.find((entry) => entry.type === "region-unlocked");
  if (!animation) return null;
  const payload = animation.payload;
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "hud-region-unlock-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "hud-region-unlock-banner-label", children: "Nova regi\xE3o desbloqueada" }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "hud-region-unlock-banner-title", children: getRegionName(payload.newRegionId) })
  ] });
}

// apps/web/src/components/hud/EliteMiniBossBanner.tsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
function EliteMiniBossBanner({ active }) {
  const encounterAnimation = active.find((entry) => entry.type === "elite-encounter" || entry.type === "miniboss-encounter");
  const defeatedAnimation = active.find((entry) => entry.type === "elite-defeated" || entry.type === "miniboss-defeated");
  if (encounterAnimation) {
    const payload = encounterAnimation.payload;
    const isMiniBoss = encounterAnimation.type === "miniboss-encounter";
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: `hud-variant-banner hud-variant-banner-encounter ${isMiniBoss ? "hud-variant-banner-miniboss" : "hud-variant-banner-elite"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "hud-variant-banner-label", children: isMiniBoss ? "Mini-Boss surgiu" : "Elite surgiu" }),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "hud-variant-banner-title", children: payload.enemyName })
    ] });
  }
  if (defeatedAnimation) {
    const payload = defeatedAnimation.payload;
    const isMiniBoss = defeatedAnimation.type === "miniboss-defeated";
    return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: `hud-variant-banner hud-variant-banner-defeated ${isMiniBoss ? "hud-variant-banner-miniboss" : "hud-variant-banner-elite"}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "hud-variant-banner-label", children: isMiniBoss ? "Mini-Boss derrotado" : "Elite derrotado" }),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("span", { className: "hud-variant-banner-title", children: [
        payload.enemyName,
        " (+",
        payload.xpBonus,
        " XP)"
      ] })
    ] });
  }
  return null;
}

// apps/web/src/components/hud/WorldEventBanner.tsx
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
var CATEGORY_ICON = {
  treasure: "\u{1F381}",
  merchant: "\u{1F9F3}",
  shrine: "\u2728",
  ambush: "\u2694\uFE0F",
  discovery: "\u{1F4DC}"
};
function WorldEventBanner({ active }) {
  const animation = active.find((entry) => entry.type === "world-event-discovered");
  if (!animation) return null;
  const payload = animation.payload;
  const icon = CATEGORY_ICON[payload.category] ?? "\u2753";
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: `hud-world-event-banner hud-world-event-banner-${payload.category}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "hud-world-event-banner-icon", children: icon }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: "hud-world-event-banner-title", children: payload.name })
  ] });
}

// apps/web/src/components/hud/WorldEventPanel.tsx
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
function WorldEventPanel({ worldEvent }) {
  if (!worldEvent) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("section", { className: "hud-world-event-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { className: "hud-world-event-panel-label", children: "Evento Mundial" }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { className: "hud-world-event-panel-name", children: worldEvent.name }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("p", { className: "hud-world-event-panel-description", children: worldEvent.description })
  ] });
}

// apps/web/src/components/hud/ExpeditionCard.tsx
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
function ExpeditionCard({ expedition }) {
  if (!expedition) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("section", { className: "hud-expedition-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "hud-expedition-card-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "hud-expedition-card-label", children: "Expedi\xE7\xE3o" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "hud-expedition-card-name", children: expedition.name })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(ProgressBar, { percent: expedition.percent, variant: "expedition-compact", label: "Progresso da expedi\xE7\xE3o" }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { className: "hud-expedition-card-checkpoint", children: [
      "Checkpoint ",
      expedition.checkpointsReached,
      "/",
      expedition.checkpointsTotal
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "hud-expedition-card-stats", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        expedition.encountersCompleted,
        " encontro",
        expedition.encountersCompleted === 1 ? "" : "s"
      ] }),
      expedition.elitesDefeated > 0 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        expedition.elitesDefeated,
        " Elite",
        expedition.elitesDefeated === 1 ? "" : "s"
      ] }) : null,
      expedition.miniBossesDefeated > 0 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        expedition.miniBossesDefeated,
        " Mini-Boss",
        expedition.miniBossesDefeated === 1 ? "" : "es"
      ] }) : null,
      expedition.worldEventsFound > 0 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("span", { children: [
        expedition.worldEventsFound,
        " Evento",
        expedition.worldEventsFound === 1 ? "" : "s"
      ] }) : null
    ] }),
    expedition.finalBoss ? /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "hud-expedition-card-boss", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "hud-expedition-card-boss-label", children: "Boss Final" }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("span", { className: "hud-expedition-card-boss-name", children: expedition.finalBoss.bossName }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
        ProgressBar,
        {
          percent: expedition.finalBoss.defeated ? 0 : expedition.finalBoss.healthPercent ?? 100,
          variant: "boss",
          label: "Vida do Chefe Final"
        }
      )
    ] }) : null
  ] });
}

// apps/web/src/components/hud/ExpeditionCheckpointBanner.tsx
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
function ExpeditionCheckpointBanner({ active }) {
  const checkpointAnimation = active.find((entry) => entry.type === "expedition-checkpoint");
  const completedAnimation = active.find((entry) => entry.type === "expedition-completed");
  const failedAnimation = active.find((entry) => entry.type === "expedition-failed");
  if (checkpointAnimation) {
    const payload = checkpointAnimation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "hud-expedition-banner hud-expedition-banner-checkpoint", children: [
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "hud-expedition-banner-label", children: "Checkpoint atingido" }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("span", { className: "hud-expedition-banner-title", children: [
        payload.checkpointIndex,
        "/",
        payload.checkpointsTotal
      ] }),
      payload.recoveryAmount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("span", { className: "hud-expedition-banner-detail", children: [
        "+",
        payload.recoveryAmount.toFixed(0),
        " HP"
      ] }) : null
    ] });
  }
  if (completedAnimation) {
    const payload = completedAnimation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "hud-expedition-banner hud-expedition-banner-completed", children: [
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "hud-expedition-banner-label", children: "Expedi\xE7\xE3o conclu\xEDda" }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "hud-expedition-banner-title", children: payload.name }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("span", { className: "hud-expedition-banner-detail", children: [
        "+",
        payload.xpAmount,
        " XP, +",
        payload.goldAmount,
        " ouro"
      ] })
    ] });
  }
  if (failedAnimation) {
    const payload = failedAnimation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "hud-expedition-banner hud-expedition-banner-failed", children: [
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "hud-expedition-banner-label", children: "Expedi\xE7\xE3o falhou" }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("span", { className: "hud-expedition-banner-title", children: payload.name })
    ] });
  }
  return null;
}

// apps/web/src/components/hud/FactionCard.tsx
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
function FactionCard({ faction }) {
  if (!faction) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("section", { className: "hud-faction-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "hud-faction-card-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { className: "hud-faction-card-label", children: "Fac\xE7\xE3o Atual" }),
      /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { className: "hud-faction-card-name", children: faction.factionName })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(ProgressBar, { percent: faction.percentToNextRank, variant: "expedition-compact", label: "Progresso de reputa\xE7\xE3o" }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "hud-faction-card-footer", children: [
      /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("span", { className: "hud-faction-card-rank", children: faction.rankName }),
      faction.nextRankName ? /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("span", { className: "hud-faction-card-next", children: [
        "Pr\xF3ximo: ",
        faction.nextRankName
      ] }) : null
    ] })
  ] });
}

// apps/web/src/components/hud/FactionRankUpBanner.tsx
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
function FactionRankUpBanner({ active }) {
  const animation = active.find((entry) => entry.type === "faction-rank-up");
  if (!animation) return null;
  const payload = animation.payload;
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "hud-faction-rankup-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("span", { className: "hud-faction-rankup-banner-label", children: "Reputa\xE7\xE3o em ascens\xE3o" }),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("span", { className: "hud-faction-rankup-banner-title", children: [
      payload.factionName,
      ": ",
      payload.rankName
    ] }),
    payload.xpBonusPercent > 0 || payload.goldBonusPercent > 0 ? /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("span", { className: "hud-faction-rankup-banner-detail", children: [
      "+",
      payload.xpBonusPercent,
      "% XP, +",
      payload.goldBonusPercent,
      "% ouro em Expedi\xE7\xF5es"
    ] }) : null
  ] });
}

// apps/web/src/components/hud/FinalBossBanner.tsx
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
function FinalBossBanner({ active }) {
  const encounterAnimation = active.find((entry) => entry.type === "final-boss-encounter");
  const defeatedAnimation = active.find((entry) => entry.type === "final-boss-defeated");
  if (encounterAnimation) {
    const payload = encounterAnimation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("div", { className: "hud-final-boss-banner hud-final-boss-banner-encounter", children: [
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("span", { className: "hud-final-boss-banner-label", children: "Chefe Final Avistado" }),
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("span", { className: "hud-final-boss-banner-title", children: payload.enemyName })
    ] });
  }
  if (defeatedAnimation) {
    const payload = defeatedAnimation.payload;
    return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("div", { className: "hud-final-boss-banner hud-final-boss-banner-defeated", children: [
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("span", { className: "hud-final-boss-banner-label", children: "Chefe Final Derrotado" }),
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("span", { className: "hud-final-boss-banner-title", children: payload.enemyName }),
      /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("span", { className: "hud-final-boss-banner-detail", children: [
        "+",
        payload.xpAmount,
        " XP, +",
        payload.goldAmount,
        " ouro"
      ] })
    ] });
  }
  return null;
}

// apps/web/src/components/hud/DungeonCompletedBanner.tsx
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
function DungeonCompletedBanner({ active }) {
  const animation = active.find((entry) => entry.type === "dungeon-completed");
  if (!animation) return null;
  const payload = animation.payload;
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("div", { className: "hud-dungeon-completed-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("span", { className: "hud-dungeon-completed-banner-label", children: "Dungeon Conclu\xEDda" }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("span", { className: "hud-dungeon-completed-banner-title", children: payload.name }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("span", { className: "hud-dungeon-completed-banner-detail", children: [
      "Chefe Final derrotado: ",
      payload.bossName
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("span", { className: "hud-dungeon-completed-banner-detail", children: [
      "+",
      payload.xpAmount,
      " XP, +",
      payload.goldAmount,
      " ouro"
    ] })
  ] });
}

// apps/web/src/pages/AdventurePage.tsx
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
function AdventurePage() {
  const { hudState, error, advance, restart } = useAdventureSession();
  const { active, playTick, reset } = useAnimationController();
  const isDefeated = hudState.sessionStatus === "derrota";
  function handleAdvance() {
    const outcome = advance(true);
    if (outcome) playTick(outcome.events, outcome.floatingNumbers);
  }
  function handleRestart() {
    restart();
    reset();
  }
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "card hud-adventure-page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "hud-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("h1", { children: "Aventura" }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SessionStatusBadge, { status: hudState.sessionStatus })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(PermanentStatsBar, { hudState }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ObjectiveCard, { objective: hudState.currentObjective }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(WorldEventPanel, { worldEvent: hudState.recentWorldEvent }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ExpeditionCard, { expedition: hudState.expedition }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(FactionCard, { faction: hudState.faction }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(HealthBar, { currentLife: hudState.currentLife, maximumLife: hudState.maximumLife }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(RecoveryBadge, { recovery: hudState.recentRecovery }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(XpBar, { xpProgress: hudState.xpProgress }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "hud-combat-stage-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(CharacterStage, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EnemyStage, { active, encounter: hudState.encounter })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "hud-panels-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(RegionPanel, { region: hudState.region }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EncounterPanel, { encounter: hudState.encounter })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SessionOverlay, { statistics: hudState.statistics }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SessionHistoryPanel, { history: hudState.sessionHistory }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "hud-popups-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(LootPopup, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EquipmentPopup, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(LevelUpBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ObjectiveCompletedBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(RegionUnlockBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EliteMiniBossBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(WorldEventBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ExpeditionCheckpointBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(FactionRankUpBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(FinalBossBanner, { active }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(DungeonCompletedBanner, { active })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(ProgressionCelebration, { hudState }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(FloatingNumbers, { active }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "hud-controls", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", { type: "button", onClick: handleAdvance, disabled: isDefeated, children: "Avan\xE7ar" }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("button", { type: "button", onClick: handleRestart, children: "Reiniciar" })
      ] }),
      error ? /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("p", { className: "error", children: error }) : null,
      isDefeated ? /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("p", { className: "hud-defeat-message", children: "Seu personagem foi derrotado. Reinicie para tentar de novo." }) : null,
      hudState.sessionSummary ? /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(SessionSummaryPanel, { summary: hudState.sessionSummary }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("h2", { className: "hud-feed-title", children: "Linha do tempo" }),
      /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(EventFeed, { events: hudState.recentEvents })
    ] })
  ] });
}
export {
  AdventurePage
};
