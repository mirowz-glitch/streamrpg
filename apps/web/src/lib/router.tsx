import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

// Sprint Performance Optimization — cada página principal vira seu
// próprio chunk (React.lazy + import() dinâmico). O esbuild (splitting:
// true em bundler.ts) separa esses chunks automaticamente: quem abre a
// Landing não baixa o código de Cidade/Mundo/Ranking, e vice-versa.
// Nenhuma rota, comportamento ou aparência muda — só o momento em que o
// código de cada página é buscado.
const AdventurePage = lazy(() => import("../pages/AdventurePage").then((m) => ({ default: m.AdventurePage })));
const AuthCallbackPage = lazy(() => import("../pages/AuthCallbackPage").then((m) => ({ default: m.AuthCallbackPage })));
const CharacterPage = lazy(() => import("../pages/CharacterPage").then((m) => ({ default: m.CharacterPage })));
const CityPage = lazy(() => import("../pages/CityPage").then((m) => ({ default: m.CityPage })));
const ChroniclePage = lazy(() => import("../pages/ChroniclePage").then((m) => ({ default: m.ChroniclePage })));
const HousingPage = lazy(() => import("../pages/HousingPage").then((m) => ({ default: m.HousingPage })));
const InventoryPage = lazy(() => import("../pages/InventoryPage").then((m) => ({ default: m.InventoryPage })));
const KingdomsPage = lazy(() => import("../pages/KingdomsPage").then((m) => ({ default: m.KingdomsPage })));
const KingdomIntegrationsPage = lazy(() =>
  import("../pages/KingdomIntegrationsPage").then((m) => ({ default: m.KingdomIntegrationsPage })),
);
const RealEstatePage = lazy(() => import("../pages/RealEstatePage").then((m) => ({ default: m.RealEstatePage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const OverlayPage = lazy(() => import("../pages/OverlayPage").then((m) => ({ default: m.OverlayPage })));
const RankingPage = lazy(() => import("../pages/RankingPage").then((m) => ({ default: m.RankingPage })));
const StreamerPage = lazy(() => import("../pages/StreamerPage").then((m) => ({ default: m.StreamerPage })));
const WorldPage = lazy(() => import("../pages/WorldPage").then((m) => ({ default: m.WorldPage })));

function PageFallback() {
  return (
    <main className="page">
      <p className="loading-state">Carregando...</p>
    </main>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/", element: withSuspense(<LoginPage />) },
  { path: "/login", element: withSuspense(<LoginPage />) },
  { path: "/auth/callback", element: withSuspense(<AuthCallbackPage />) },
  { path: "/app/character", element: withSuspense(<CharacterPage />) },
  { path: "/app/adventure", element: withSuspense(<AdventurePage />) },
  { path: "/app/city", element: withSuspense(<CityPage />) },
  { path: "/app/chronicle", element: withSuspense(<ChroniclePage />) },
  { path: "/app/inventory", element: withSuspense(<InventoryPage />) },
  { path: "/app/kingdoms", element: withSuspense(<KingdomsPage />) },
  { path: "/app/kingdom-integrations", element: withSuspense(<KingdomIntegrationsPage />) },
  { path: "/app/housing", element: withSuspense(<HousingPage />) },
  { path: "/app/real-estate", element: withSuspense(<RealEstatePage />) },
  { path: "/app/ranking", element: withSuspense(<RankingPage />) },
  { path: "/app/world", element: withSuspense(<WorldPage />) },
  { path: "/app/streamer", element: withSuspense(<StreamerPage />) },
  { path: "/overlay/:channel", element: withSuspense(<OverlayPage />) },
]);
