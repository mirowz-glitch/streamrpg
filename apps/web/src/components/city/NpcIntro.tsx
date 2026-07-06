import { useMemo, useState } from "react";
import type { NpcDefinition } from "../../lib/npcs";
import { NpcPortrait } from "./NpcPortrait";
import { NPC_DIALOGUE, randomLine, getRecognitionLine, type RecognitionContext } from "../../lib/npcDialogue";
import { useCharacter } from "../../hooks/useCharacter";
import { useIdentity } from "../../hooks/useIdentity";
import { useKingdomRole } from "../../hooks/useKingdomRole";
import { getStoredChannel } from "../../hooks/usePing";
import { isFlagSet } from "../../lib/onboarding";

// Sprint NPCs Vivos — bloco de apresentação reaproveitado por todo
// edifício: retrato, nome, profissão, frase própria e descrição.
//
// Sprint Living NPCs (MVP) — abaixo da frase de identidade fixa
// (`npc.quote`, nunca muda), uma segunda linha sorteada do catálogo de
// 100 falas do NPC (lib/npcDialogue), uma vez por visita.
//
// Sprint Recognition System (MVP) — antes de sortear do catálogo, uma
// camada opcional verifica se algum dado real do jogador (nível, Bosses
// derrotados, título, cargo, regiões descobertas, Gold, primeira visita)
// bate com alguma condição do NPC — só quando bate, substitui a fala
// aleatória. Sem estado novo: reaproveita os mesmos hooks já usados em
// CharacterPage/CityPage (useCharacter/useIdentity/useKingdomRole) e a
// mesma flag de onboarding (city_seen) já usada em outro lugar.
export function NpcIntro({ npc }: { npc: NpcDefinition }) {
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || undefined, true);

  const catalog = NPC_DIALOGUE[npc.key];
  const [fallbackLine] = useState(() => (catalog ? randomLine(catalog) : null));

  const recognitionLine = useMemo(() => {
    if (!character || !identity) return null;
    const ctx: RecognitionContext = {
      level: character.level,
      gold: character.gold,
      totalMinutes: character.total_minutes,
      hasEquippedItem: character.equipped.length > 0,
      bossesDefeated: identity.bosses_defeated,
      regionsDiscovered: identity.regions_discovered,
      hasCompletedFirstExpedition: identity.first_expedition_at !== null,
      hasEquippedTitle: identity.equipped_title !== null,
      hasKingdomRole: kingdomRoles.length > 0,
      isFirstCityVisit: !isFlagSet("city_seen"),
    };
    return getRecognitionLine(npc.key, ctx);
  }, [npc.key, character, identity, kingdomRoles]);

  const line = recognitionLine ?? fallbackLine;

  return (
    <div className="npc-intro">
      <NpcPortrait npc={npc} />
      <div className="npc-intro-text">
        <strong className="npc-name">{npc.name}</strong>
        <span className="npc-profession">{npc.profession}</span>
        <p className="npc-quote">"{npc.quote}"</p>
        <p className="npc-description">{npc.description}</p>
        {line ? <p className="npc-line">"{line}"</p> : null}
      </div>
    </div>
  );
}
