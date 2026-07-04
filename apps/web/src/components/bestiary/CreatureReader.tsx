import type { CreatureDefinition } from "../../lib/bestiary";
import { CREATURE_TYPES, DANGER_LABEL, getRegionName } from "../../lib/bestiary";
import { CodexReader } from "../codex/CodexReader";

interface CreatureReaderProps {
  creature: CreatureDefinition | null;
}

// Sprint Codex Framework — painel direito, agora sobre o CodexReader
// genérico. Bestiário e Museu (ao contrário da Biblioteca) sempre
// mostraram um título genérico e nenhum subtítulo quando bloqueados —
// por isso `lockedTitle` fixo e `lockedSubtitle` nunca passado aqui.
export function CreatureReader({ creature }: CreatureReaderProps) {
  const type = creature ? CREATURE_TYPES.find((t) => t.slug === creature.type) : undefined;

  return (
    <CodexReader
      isEmpty={!creature}
      emptyMessage="Escolha uma criatura no catálogo ao lado."
      locked={creature?.locked ?? false}
      lockedTitle="Criatura desconhecida"
      lockedMessage="🔒 Este registro ainda está bloqueado."
      unlockCondition={creature?.unlockCondition ?? ""}
      icon={creature?.icon}
      title={creature?.name ?? ""}
      subtitle={type?.label ?? creature?.type}
      description={creature?.description ?? ""}
      facts={
        creature
          ? [
              { label: "Habitat", value: creature.habitat },
              { label: "Região", value: getRegionName(creature.regionId) },
              { label: "Periculosidade", value: DANGER_LABEL[creature.dangerLevel] },
            ]
          : []
      }
      pages={creature?.pages ?? []}
    />
  );
}
