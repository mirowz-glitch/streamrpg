import {
  RARITY_COLOR,
  RARITY_LABEL
} from "./chunk-3JY4BVUW.js";
import {
  getCombatAttributes
} from "./chunk-AGN4IQHH.js";
import {
  api
} from "./chunk-R22SVZL5.js";
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

// apps/web/src/hooks/useCharacter.ts
var import_react2 = __toESM(require_react(), 1);
function useCharacter(enabled = true) {
  const [character, setCharacter] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(enabled);
  const [error, setError] = (0, import_react2.useState)(null);
  const refresh = (0, import_react2.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/character");
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load character");
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react2.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const updateName = (0, import_react2.useCallback)(async (displayName) => {
    const data = await api.patch("/api/character", { display_name: displayName });
    setCharacter(data);
    return data;
  }, []);
  return { character, loading, error, refresh, updateName };
}

// apps/web/src/hooks/useIdentity.ts
var import_react3 = __toESM(require_react(), 1);
function useIdentity(enabled) {
  const [identity, setIdentity] = (0, import_react3.useState)(null);
  const [loading, setLoading] = (0, import_react3.useState)(enabled);
  const refresh = (0, import_react3.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.get("/api/identity/me");
      setIdentity(data);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react3.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const equipTitle = (0, import_react3.useCallback)(
    async (titleId) => {
      const data = await api.post("/api/identity/equip-title", { title_id: titleId });
      setIdentity(data);
    },
    []
  );
  const unequipTitle = (0, import_react3.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-title", {});
    setIdentity(data);
  }, []);
  const equipFrame = (0, import_react3.useCallback)(async (frameId) => {
    const data = await api.post("/api/identity/equip-frame", { frame_id: frameId });
    setIdentity(data);
  }, []);
  const unequipFrame = (0, import_react3.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-frame", {});
    setIdentity(data);
  }, []);
  return { identity, loading, refresh, equipTitle, unequipTitle, equipFrame, unequipFrame };
}

// apps/web/src/hooks/useKingdomRole.ts
var import_react4 = __toESM(require_react(), 1);
function useKingdomRole(channel, enabled) {
  const [roles, setRoles] = (0, import_react4.useState)([]);
  (0, import_react4.useEffect)(() => {
    if (!enabled || !channel) {
      setRoles([]);
      return;
    }
    let cancelled = false;
    void api.get(`/api/kingdom/${encodeURIComponent(channel)}/me`).then((data) => {
      if (!cancelled) setRoles(data.roles);
    }).catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [channel, enabled]);
  return roles;
}

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
  useCharacter,
  useIdentity,
  useKingdomRole,
  NpcPortrait
};
