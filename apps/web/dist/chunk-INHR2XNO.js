import {
  RARITY_COLOR,
  RARITY_LABEL
} from "./chunk-SMRWZSNT.js";
import {
  getCombatAttributes
} from "./chunk-S4O55MUY.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

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
function attributeChips(item) {
  const attrs = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  if (item.slot === "weapon") {
    const isMagic2 = attrs.attackMagic > attrs.attackPhysical;
    return [{ icon: "\u2694", value: isMagic2 ? attrs.attackMagic : attrs.attackPhysical }];
  }
  const isMagic = attrs.resistanceMagic > attrs.resistancePhysical;
  const resist = isMagic ? attrs.resistanceMagic : attrs.resistancePhysical;
  const chips = [{ icon: "\u{1F6E1}", value: resist }];
  if (item.uti_bonus > 0) chips.push({ icon: "\u2728", value: item.uti_bonus });
  return chips;
}
var EquipmentSlots = (0, import_react.memo)(function EquipmentSlots2({ equipped }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "equipment-grid", children: SLOT_ORDER.map((slot) => {
    const item = equipped.find((e) => e.slot === slot);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: `equipment-slot${item ? " equipment-slot-filled equipment-slot-rarity" : ""}`,
        style: item ? { borderLeftColor: RARITY_COLOR[item.rarity] } : void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-label", children: SLOT_LABEL[slot] }),
          item ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-item", style: { color: RARITY_COLOR[item.rarity] }, children: item.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "equipment-slot-meta", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-rarity", style: { color: RARITY_COLOR[item.rarity] }, children: RARITY_LABEL[item.rarity] }),
              attributeChips(item).map((chip, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "equipment-attr-chip", children: [
                chip.icon,
                " +",
                chip.value
              ] }, i))
            ] })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "equipment-slot-empty", children: "N\xE3o equipado" })
        ]
      },
      slot
    );
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
