import { createBrowserRouter } from "react-router-dom";
import { AuthCallbackPage } from "../pages/AuthCallbackPage";
import { CharacterPage } from "../pages/CharacterPage";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { OverlayPage } from "../pages/OverlayPage";
import { RankingPage } from "../pages/RankingPage";
import { StreamerPage } from "../pages/StreamerPage";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },
  { path: "/app/character", element: <CharacterPage /> },
  { path: "/app/inventory", element: <InventoryPage /> },
  { path: "/app/ranking", element: <RankingPage /> },
  { path: "/app/streamer", element: <StreamerPage /> },
  { path: "/overlay/:channel", element: <OverlayPage /> },
]);
