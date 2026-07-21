import {
  useExpedition
} from "./chunk-XPXPPQV6.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import {
  RARITY_COLOR,
  buildCollectionInsightContext,
  getInventoryInsight
} from "./chunk-SMRWZSNT.js";
import {
  BOOKS,
  CREATURES,
  KINGDOM_PROFESSIONS,
  MUSEUM_ENTRIES,
  NPC_DIALOGUE,
  REGIONS,
  TRAVELLER_STORIES,
  buildExpeditionEchoContext,
  flattenDialogue,
  getItemDiscoveryCandidates,
  getItemNpcThreadCandidates,
  getItemRelated,
  getNextSteps
} from "./chunk-RHKKRLPV.js";
import {
  STAGE_INVENTORY_HINT,
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
  api
} from "./chunk-R22SVZL5.js";
import {
  getCombatAttributes,
  getItemPower
} from "./chunk-S4O55MUY.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/InventoryPage.tsx
var import_react = __toESM(require_react(), 1);

// apps/web/src/components/ui/Feedback.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function Feedback({ kind, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: kind, children });
}

// apps/web/src/lib/itemIdentity.ts
function includes(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
function themeCore(itemName) {
  const stripped = itemName.replace(/^\S+\s+(d[oa]s?\s+)?/i, "").trim();
  return stripped.includes(" ") ? stripped : null;
}
function getItemIdentityLine(item) {
  const creature = CREATURES.find((c) => c.connections?.itemSlug === item.slug);
  if (creature) {
    return creature.connections?.npcNote ?? `Encontrado junto a criaturas como ${creature.name}.`;
  }
  const core = themeCore(item.name);
  if (core) {
    for (const catalog of Object.values(NPC_DIALOGUE)) {
      if (includes(flattenDialogue(catalog).join(" "), core)) {
        return "J\xE1 foi citado numa conversa entre os moradores da Capital.";
      }
    }
  }
  if (core && TRAVELLER_STORIES.some((s) => includes(s.title, core) || includes(s.text, core))) {
    return "Sua origem \xE9 contada numa hist\xF3ria dos viajantes.";
  }
  if (core && BOOKS.some((b) => includes(b.title, core) || b.pages.some((p) => includes(p, core)))) {
    return "Citado num livro da Biblioteca.";
  }
  if (core && MUSEUM_ENTRIES.some((e) => includes(e.title, core) || e.pages.some((p) => includes(p, core)))) {
    return "Uma pe\xE7a parecida est\xE1 catalogada no Museu.";
  }
  const region = REGIONS.find((r) => includes(item.name, r.name));
  if (region) {
    return `Encontrado principalmente em ${region.name}.`;
  }
  const profession = KINGDOM_PROFESSIONS.find(
    (p) => includes(`${p.description} ${p.routine} ${p.curiosity} ${p.relations}`, item.name)
  );
  if (profession) {
    return `Reconhecido por quem exerce o of\xEDcio de ${profession.name}.`;
  }
  return null;
}

// apps/web/src/pages/InventoryPage.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var SLOT_ORDER = ["weapon", "armor", "helmet", "boots", "amulet", "ring"];
var SLOT_LABEL = {
  weapon: "Arma",
  armor: "Armadura",
  helmet: "Elmo",
  boots: "Botas",
  amulet: "Amuleto",
  ring: "Anel"
};
var SEEN_WATERMARK_KEY = "streamrpg_inventory_seen_watermark";
function sumPower(rarity, slot) {
  const power = getItemPower(rarity, slot);
  return power.attack + power.defense;
}
function InventoryPage() {
  const [items, setItems] = (0, import_react.useState)([]);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [message, setMessage] = (0, import_react.useState)(null);
  const [acknowledgedIds, setAcknowledgedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
  const seenWatermarkRef = (0, import_react.useRef)(Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0));
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || void 0, true);
  const { expedition } = useExpedition(true);
  const echoContext = buildExpeditionEchoContext(expedition);
  async function refresh() {
    setLoading(true);
    try {
      const data = await api.get("/api/items");
      setItems(data.items);
      if (data.items.length > 0) {
        const maxId = Math.max(...data.items.map((i) => i.id));
        const stored = Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0);
        if (maxId > stored) {
          localStorage.setItem(SEEN_WATERMARK_KEY, String(maxId));
        }
      }
    } finally {
      setLoading(false);
    }
  }
  (0, import_react.useEffect)(() => {
    void refresh();
  }, []);
  function isNew(item) {
    return item.id > seenWatermarkRef.current && !acknowledgedIds.has(item.id);
  }
  function getEquippedInSlot(slot) {
    return items.find((i) => i.is_equipped && i.equipped_slot === slot) ?? null;
  }
  function getBestAvailableIdBySlot() {
    const bySlot2 = {};
    for (const item of items) {
      (bySlot2[item.slot] ??= []).push(item);
    }
    const best = {};
    for (const [slot, slotItems] of Object.entries(bySlot2)) {
      let bestItem = null;
      let bestPower = -1;
      for (const item of slotItems) {
        const power = sumPower(item.rarity, item.slot);
        if (power > bestPower) {
          bestPower = power;
          bestItem = item;
        }
      }
      if (bestItem && !bestItem.is_equipped) {
        best[slot] = bestItem.id;
      }
    }
    return best;
  }
  async function equip(characterItemId) {
    setMessage(null);
    const itemToEquip = items.find((i) => i.id === characterItemId);
    const previousEquipped = itemToEquip ? getEquippedInSlot(itemToEquip.slot) : null;
    try {
      await api.post("/api/items/equip", { character_item_id: characterItemId });
      setAcknowledgedIds((prev) => new Set(prev).add(characterItemId));
      setMessage(buildEquipFeedback(itemToEquip, previousEquipped));
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao equipar");
    }
  }
  async function unequip(slot) {
    setMessage(null);
    try {
      const data = await api.post("/api/items/unequip", { slot });
      setItems(data.items);
      setMessage("Item desequipado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao desequipar");
    }
  }
  function renderPower(item) {
    const power = getItemPower(item.rarity, item.slot);
    if (item.slot === "weapon") {
      return `ATQ ${power.attack}`;
    }
    return `DEF ${power.defense}`;
  }
  const bestAvailableBySlot = getBestAvailableIdBySlot();
  const bySlot = {};
  for (const item of items) {
    (bySlot[item.slot] ??= []).push(item);
  }
  const collectionInsight = getInventoryInsight(
    buildCollectionInsightContext({ equippedSlotCount: items.filter((i) => i.is_equipped).length })
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { children: "Invent\xE1rio" }),
      character && identity ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "hint", children: STAGE_INVENTORY_HINT[getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles))] }) : null,
      collectionInsight ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "hint", children: collectionInsight }) : null,
      message ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Feedback, { kind: "notice", children: message }) : null,
      loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "loading-state", children: "Carregando invent\xE1rio..." }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "empty-state", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "Seu invent\xE1rio est\xE1 vazio." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "hint", children: "Continue assistindo \u2014 drops t\xEAm boa chance a cada minuto de presen\xE7a." })
      ] }) : SLOT_ORDER.filter((slot) => bySlot[slot]?.length).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "inventory-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "inventory-group-title", children: SLOT_LABEL[slot] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { className: "inventory-list", children: bySlot[slot].map((item) => {
          const equippedInSlot = getEquippedInSlot(item.slot);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "li",
            {
              className: `inventory-item rarity-border-${item.rarity}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { style: { color: RARITY_COLOR[item.rarity] ?? "#fff" }, children: item.name }),
                  item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "badge-equipped", children: "EQUIPADO" }) : null,
                  isNew(item) ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "badge-new", children: "NOVO" }) : null,
                  bestAvailableBySlot[item.slot] === item.id ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "badge-best", children: "\u2B06 Melhor dispon\xEDvel" }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "item-meta", children: [
                    item.rarity,
                    " \xB7 ",
                    item.slot,
                    " \xB7 nv. ",
                    item.min_level,
                    " \xB7 ",
                    renderPower(item),
                    item.damage_type === "magic" ? " \xB7 m\xE1gico" : "",
                    item.is_equipped ? ` \xB7 equipado (${item.equipped_slot})` : ""
                  ] }),
                  !item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "item-compare", children: renderComparisonDetail(item, equippedInSlot) }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "item-desc", children: item.description }),
                  renderItemOrigin(item),
                  renderItemIdentity(item),
                  renderNextStep(item, echoContext.approach)
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "item-actions", children: item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => void unequip(item.slot), children: "Desequipar" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { onClick: () => void equip(item.id), children: "Equipar" }) })
              ]
            },
            item.id
          );
        }) })
      ] }, slot))
    ] })
  ] });
}
function renderItemOrigin(item) {
  const related = getItemRelated(item.slug);
  if (related.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "item-origin", children: related.map((r) => `${r.label}: ${r.value}`).join(" \xB7 ") });
}
function renderItemIdentity(item) {
  const line = getItemIdentityLine({ slug: item.slug, name: item.name });
  if (!line) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "item-origin", children: line });
}
function renderNextStep(item, approach) {
  const lines = getNextSteps([getItemDiscoveryCandidates(item.slug), getItemNpcThreadCandidates(item.slug)], approach);
  if (lines.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "item-origin", children: lines.join(" ") });
}
function renderComparisonDetail(item, equipped) {
  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = equipped ? getCombatAttributes(equipped.rarity, equipped.slot, equipped.damage_type) : null;
  if (item.slot === "weapon") {
    const tipoNovo = next.attackMagic > next.attackPhysical ? "M\xE1gico" : "F\xEDsico";
    const tipoAntigo = prev ? prev.attackMagic > prev.attackPhysical ? "M\xE1gico" : "F\xEDsico" : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical : 0;
    const delta = novoAtq - antigoAtq;
    const mesmoTipo = tipoAntigo === tipoNovo;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "item-comparison", children: [
      equipped ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "comparison-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: equipped.name }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            "ATQ ",
            tipoAntigo,
            " +",
            antigoAtq
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "comparison-arrow", children: "\u2193" })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "comparison-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
          "ATQ ",
          tipoNovo,
          " +",
          novoAtq
        ] })
      ] }),
      mesmoTipo ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: delta >= 0 ? "comparison-delta-positive" : "comparison-delta-negative", children: [
        "(",
        delta >= 0 ? "+" : "",
        delta,
        ")"
      ] }) : equipped ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "comparison-delta-neutral", children: "troca de tipo \u2014 n\xE3o \xE9 o mesmo eixo de dano" }) : null
    ] });
  }
  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (equipped?.uti_bonus ?? 0);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "item-comparison", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      deltaFisica >= 0 ? "+" : "",
      deltaFisica,
      " Resist\xEAncia F\xEDsica"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      deltaMagica >= 0 ? "+" : "",
      deltaMagica,
      " Resist\xEAncia M\xE1gica"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      deltaUti >= 0 ? "+" : "",
      deltaUti,
      " UTI"
    ] })
  ] });
}
function buildEquipFeedback(item, previous) {
  if (!item) return "Item equipado!";
  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = previous ? getCombatAttributes(previous.rarity, previous.slot, previous.damage_type) : null;
  const parts = ["Equipado!"];
  if (item.slot === "weapon") {
    const tipoNovo = next.attackMagic > next.attackPhysical ? "M\xE1gico" : "F\xEDsico";
    const tipoAntigo = prev ? prev.attackMagic > prev.attackPhysical ? "M\xE1gico" : "F\xEDsico" : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical : 0;
    if (prev && tipoAntigo !== tipoNovo) {
      parts.push(`Tipo de dano mudou de ${tipoAntigo} para ${tipoNovo} \xB7 ATQ ${tipoNovo} ${novoAtq}`);
    } else {
      const delta = novoAtq - antigoAtq;
      parts.push(`ATQ ${tipoNovo} ${delta >= 0 ? "+" : ""}${delta}`);
    }
    return parts.join(" ");
  }
  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (previous?.uti_bonus ?? 0);
  if (deltaFisica !== 0) parts.push(`Resist\xEAncia F\xEDsica ${deltaFisica >= 0 ? "+" : ""}${deltaFisica}`);
  if (deltaMagica !== 0) parts.push(`Resist\xEAncia M\xE1gica ${deltaMagica >= 0 ? "+" : ""}${deltaMagica}`);
  if (deltaUti !== 0) parts.push(`UTI ${deltaUti >= 0 ? "+" : ""}${deltaUti}`);
  return parts.join(" \xB7 ");
}

export {
  Feedback,
  SLOT_LABEL,
  InventoryPage
};
