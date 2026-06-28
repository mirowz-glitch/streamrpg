import { Link } from "react-router-dom";

export function AppNav() {
  return (
    <nav>
      <Link to="/app/character">Personagem</Link>
      <Link to="/app/inventory">Inventário</Link>
      <Link to="/app/ranking">Ranking</Link>
      <Link to="/app/streamer">Streamer</Link>
    </nav>
  );
}
