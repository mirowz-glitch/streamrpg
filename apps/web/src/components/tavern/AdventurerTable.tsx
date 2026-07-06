import { useState } from "react";
import { TAVERN_CONVERSATIONS } from "../../lib/tavern";

const SHOWN_COUNT = 5;

// Sprint Tavern Stories (MVP) — "Mesa dos Aventureiros": um punhado de
// conversas curtas, sorteadas sem repetição a cada visita, do catálogo
// de 30+ diálogos. Nenhuma delas é interativa — só leitura.
function randomConversations(): string[][] {
  const shuffled = [...TAVERN_CONVERSATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SHOWN_COUNT);
}

export function AdventurerTable() {
  const [conversations] = useState(randomConversations);

  return (
    <div className="tavern-block">
      <h3>🍻 Mesa dos Aventureiros</h3>
      <div className="tavern-conversations">
        {conversations.map((lines, i) => (
          <div className="tavern-conversation" key={i}>
            {lines.map((line, j) => (
              <p key={j}>— {line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
