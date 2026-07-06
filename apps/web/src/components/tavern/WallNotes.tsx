import { TAVERN_WALL_NOTES } from "../../lib/tavern";

// Sprint Tavern Stories (MVP) — "Recados na Parede": o catálogo inteiro
// (cerca de 50 bilhetes), sempre na mesma ordem — é um mural, não um
// sorteio. Só leitura, nenhuma interação.
export function WallNotes() {
  return (
    <div className="tavern-block">
      <h3>📌 Recados na Parede</h3>
      <ul className="tavern-wall-notes">
        {TAVERN_WALL_NOTES.map((note, i) => (
          <li key={i} className="tavern-note">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
