import type { NpcDefinition } from "../../lib/npcs";
import { NpcPortrait } from "./NpcPortrait";

// Sprint NPCs Vivos — bloco de apresentação reaproveitado por todo
// edifício: retrato, nome, profissão, frase própria e descrição. Nenhum
// diálogo, nenhuma interação — só identidade. Preparado para uma futura
// Sprint de interação real (ex: um botão "Falar com {nome}") sem precisar
// mudar este componente, só estendê-lo.
export function NpcIntro({ npc }: { npc: NpcDefinition }) {
  return (
    <div className="npc-intro">
      <NpcPortrait npc={npc} />
      <div className="npc-intro-text">
        <strong className="npc-name">{npc.name}</strong>
        <span className="npc-profession">{npc.profession}</span>
        <p className="npc-quote">"{npc.quote}"</p>
        <p className="npc-description">{npc.description}</p>
      </div>
    </div>
  );
}
