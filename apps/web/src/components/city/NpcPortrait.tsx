import type { NpcDefinition } from "../../lib/npcs";

// Sprint NPCs Vivos — retrato ilustrado simples (sem IA): uma silhueta
// (forma via CSS, `npc-portrait-{shape}`) numa cor própria do NPC, com o
// ícone já usado para o prédio dele por cima. A combinação forma+cor+ícone
// é única por NPC — o suficiente para ser "imediatamente reconhecível"
// sem precisar de arte real.
export function NpcPortrait({ npc }: { npc: NpcDefinition }) {
  return (
    <div
      className={`npc-portrait npc-portrait-${npc.shape}`}
      style={{ backgroundColor: npc.color }}
      aria-hidden="true"
    >
      <span className="npc-portrait-icon">{npc.icon}</span>
    </div>
  );
}
