import {
  Feedback
} from "./chunk-WG45DOPD.js";
import {
  AppNav
} from "./chunk-SFYVYXWE.js";
import {
  RARITY_COLOR
} from "./chunk-3JY4BVUW.js";
import {
  getCombatAttributes,
  getItemPower
} from "./chunk-AGN4IQHH.js";
import "./chunk-QE563634.js";
import "./chunk-ATYDFFRC.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/InventoryPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Invent\xE1rio" }),
      message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feedback, { kind: "notice", children: message }) : null,
      loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "loading-state", children: "Carregando invent\xE1rio..." }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "empty-state", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Seu invent\xE1rio est\xE1 vazio." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Continue assistindo \u2014 drops t\xEAm boa chance a cada minuto de presen\xE7a." })
      ] }) : SLOT_ORDER.filter((slot) => bySlot[slot]?.length).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "inventory-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "inventory-group-title", children: SLOT_LABEL[slot] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "inventory-list", children: bySlot[slot].map((item) => {
          const equippedInSlot = getEquippedInSlot(item.slot);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "li",
            {
              className: `inventory-item rarity-border-${item.rarity}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: RARITY_COLOR[item.rarity] ?? "#fff" }, children: item.name }),
                  item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "badge-equipped", children: "EQUIPADO" }) : null,
                  isNew(item) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "badge-new", children: "NOVO" }) : null,
                  bestAvailableBySlot[item.slot] === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "badge-best", children: "\u2B06 Melhor dispon\xEDvel" }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item-meta", children: [
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
                  !item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item-compare", children: renderComparisonDetail(item, equippedInSlot) }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "item-desc", children: item.description })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item-actions", children: item.is_equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => void unequip(item.slot), children: "Desequipar" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => void equip(item.id), children: "Equipar" }) })
              ]
            },
            item.id
          );
        }) })
      ] }, slot))
    ] })
  ] });
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
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item-comparison", children: [
      equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "comparison-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: equipped.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "ATQ ",
            tipoAntigo,
            " +",
            antigoAtq
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "comparison-arrow", children: "\u2193" })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "comparison-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          "ATQ ",
          tipoNovo,
          " +",
          novoAtq
        ] })
      ] }),
      mesmoTipo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: delta >= 0 ? "comparison-delta-positive" : "comparison-delta-negative", children: [
        "(",
        delta >= 0 ? "+" : "",
        delta,
        ")"
      ] }) : equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "comparison-delta-neutral", children: "troca de tipo \u2014 n\xE3o \xE9 o mesmo eixo de dano" }) : null
    ] });
  }
  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (equipped?.uti_bonus ?? 0);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item-comparison", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      deltaFisica >= 0 ? "+" : "",
      deltaFisica,
      " Resist\xEAncia F\xEDsica"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      deltaMagica >= 0 ? "+" : "",
      deltaMagica,
      " Resist\xEAncia M\xE1gica"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
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
  InventoryPage
};
