import { TAVERN_NIGHT_SONGS } from "../../lib/tavern";

// Sprint Tavern Stories (MVP) — "Música da Noite": só os títulos, nunca
// tocados de verdade (nenhum áudio, nenhuma mecânica) — o catálogo
// inteiro, como um cartaz de repertório da Taverna.
export function NightSongs() {
  return (
    <div className="tavern-block">
      <h3>🎵 Música da Noite</h3>
      <ul className="tavern-songs">
        {TAVERN_NIGHT_SONGS.map((title, i) => (
          <li key={i}>{title}</li>
        ))}
      </ul>
    </div>
  );
}
