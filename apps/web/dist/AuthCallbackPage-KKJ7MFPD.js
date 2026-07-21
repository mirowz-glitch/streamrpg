import {
  useNavigate
} from "./chunk-ATYDFFRC.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/AuthCallbackPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function AuthCallbackPage() {
  const navigate = useNavigate();
  (0, import_react.useEffect)(() => {
    navigate("/app/character", { replace: true });
  }, [navigate]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "page", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card city-square-view", children: "Chegando ao Reino..." }) });
}
export {
  AuthCallbackPage
};
