import { Link } from "react-router-dom";
import { isFlagSet } from "../../lib/onboarding";

// Sprint New Player Journey, Etapa 4 — brilho suave nos 4 destinos que
// ainda não foram visitados (mesmas flags de GuideBubble/FirstSteps).
// Desaparece sozinho assim que a página correspondente é visitada.
export function AppNav() {
  return (
    <nav>
      <Link to="/app/character" className={isFlagSet("profile_seen") ? "" : "nav-glow"}>
        Personagem
      </Link>
      <Link to="/app/inventory">Inventário</Link>
      <Link to="/app/chronicle">📖 Crônicas</Link>
      <Link to="/app/city" className={isFlagSet("city_seen") ? "" : "nav-glow"}>
        Cidade
      </Link>
      <Link to="/app/ranking" className={isFlagSet("ranking_seen") ? "" : "nav-glow"}>
        Ranking
      </Link>
      <Link to="/app/world" className={isFlagSet("world_seen") ? "" : "nav-glow"}>
        Mundo
      </Link>
      <Link to="/app/streamer">Streamer</Link>
    </nav>
  );
}
