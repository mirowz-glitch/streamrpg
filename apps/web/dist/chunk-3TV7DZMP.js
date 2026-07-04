import {
  RARITY_COLOR,
  RARITY_LABEL
} from "./chunk-IGCLJZA6.js";
import {
  getCombatAttributes
} from "./chunk-H5WBUEHD.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/components/ui/EquipmentSlots.tsx
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
function attributeLine(item) {
  const attrs = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  if (item.slot === "weapon") {
    const isMagic2 = attrs.attackMagic > attrs.attackPhysical;
    return `ATQ ${isMagic2 ? "M\xE1gico" : "F\xEDsico"} +${isMagic2 ? attrs.attackMagic : attrs.attackPhysical}`;
  }
  const isMagic = attrs.resistanceMagic > attrs.resistancePhysical;
  const resist = isMagic ? attrs.resistanceMagic : attrs.resistancePhysical;
  const parts = [`Resist\xEAncia ${isMagic ? "M\xE1gica" : "F\xEDsica"} +${resist}`];
  if (item.uti_bonus > 0) parts.push(`UTI +${item.uti_bonus}`);
  return parts.join(" \xB7 ");
}
var EquipmentSlots = (0, import_react.memo)(function EquipmentSlots2({ equipped }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "equipment-grid", children: SLOT_ORDER.map((slot) => {
    const item = equipped.find((e) => e.slot === slot);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `equipment-slot${item ? " equipment-slot-filled" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-label", children: SLOT_LABEL[slot] }),
      item ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-item", style: { color: RARITY_COLOR[item.rarity] }, children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "equipment-slot-meta", children: [
          RARITY_LABEL[item.rarity],
          " \xB7 ",
          attributeLine(item)
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-empty", children: "N\xE3o equipado" })
    ] }, slot);
  }) });
});

// apps/web/src/components/city/NpcPortrait.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function NpcPortrait({ npc }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: `npc-portrait npc-portrait-${npc.shape}`,
      style: { backgroundColor: npc.color },
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "npc-portrait-icon", children: npc.icon })
    }
  );
}

export {
  EquipmentSlots,
  NpcPortrait
};
//# sourceMappingURL=chunk-3TV7DZMP.js.map
