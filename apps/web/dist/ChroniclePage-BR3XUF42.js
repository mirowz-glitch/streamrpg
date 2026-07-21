import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import "./chunk-ATYDFFRC.js";
import {
  STAGE_CHRONICLE_INTRO,
  buildPlayerFacts,
  getCharacterStage,
  useCharacter,
  useKingdomRole
} from "./chunk-3U2FLU6U.js";
import "./chunk-LIYTWNFS.js";
import {
  useIdentity
} from "./chunk-WSY5ZGYB.js";
import {
  getStoredChannel
} from "./chunk-QNP5WKGO.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import "./chunk-S4O55MUY.js";
import "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/ChroniclePage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function ChroniclePage() {
  const { profile, loading } = useAuth();
  const [data, setData] = (0, import_react.useState)(null);
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || void 0, !!profile);
  (0, import_react.useEffect)(() => {
    if (!profile) return;
    void api.get("/api/chronicle").then(setData).catch(() => void 0);
  }, [profile]);
  if (!profile && !loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fa\xE7a login para ver seu Livro." }) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "\u{1F4D6} Cr\xF4nicas" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "O Livro do seu aventureiro \u2014 os momentos que ele contaria anos depois." }),
      character && identity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: STAGE_CHRONICLE_INTRO[getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles))] }) : null,
      !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "loading-state", children: "Abrindo o Livro..." }) : data.entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhum cap\xEDtulo escrito ainda. A jornada est\xE1 apenas come\xE7ando." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "chronicle-list", children: data.entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "chronicle-entry", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "chronicle-entry-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "chronicle-entry-icon", children: entry.icon }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "chronicle-entry-title", children: entry.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "chronicle-entry-date", children: new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "chronicle-entry-text", children: entry.text })
      ] }, entry.id)) })
    ] })
  ] });
}
export {
  ChroniclePage
};
