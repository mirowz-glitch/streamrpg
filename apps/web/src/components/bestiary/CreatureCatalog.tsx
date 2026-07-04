import { useMemo, useState } from "react";
import type { CreatureDefinition, CreatureType, DangerLevel } from "../../lib/bestiary";
import { CREATURE_TYPES, DANGER_LABEL } from "../../lib/bestiary";
import { filterKnowledge, KnowledgeStatus, searchKnowledge, type KnowledgeEntry } from "../../lib/knowledge";
import { CodexSidebar } from "../codex/CodexSidebar";
import { CodexToolbar } from "../codex/CodexToolbar";
import { CodexFilter } from "../codex/CodexFilter";
import { CodexCard } from "../codex/CodexCard";

const STATUS_LABEL: Record<CreatureDefinition["status"], string> = {
  bloqueado: "🔒 Bloqueado",
  visto: "👁️ Visto",
  estudado: "📗 Estudado",
};

const KNOWLEDGE_STATUS: Record<CreatureDefinition["status"], KnowledgeStatus> = {
  bloqueado: KnowledgeStatus.Locked,
  visto: KnowledgeStatus.Discovered,
  estudado: KnowledgeStatus.Read,
};

const DANGER_LEVELS: DangerLevel[] = ["baixa", "media", "alta", "letal"];

interface CreatureKnowledgeEntry extends KnowledgeEntry<CreatureType> {
  dangerLevel: DangerLevel;
}

interface CreatureCatalogProps {
  creatures: CreatureDefinition[];
  selectedCreatureId: string | null;
  onSelectCreature: (id: string) => void;
}

// Sprint Knowledge System — painel esquerdo, agora sem lógica de busca/
// filtro própria: cada criatura vira uma `CreatureKnowledgeEntry` (a
// forma mínima do Knowledge System + `dangerLevel`, a única dimensão de
// filtro que não existe em nenhum outro catálogo). Bestiário sempre
// escondeu o nome de criaturas bloqueadas da busca — por isso
// `searchText` vira `""` quando `locked`, preservando o comportamento
// original sem precisar de um parâmetro especial.
export function CreatureCatalog({ creatures, selectedCreatureId, onSelectCreature }: CreatureCatalogProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<CreatureType | null>(null);
  const [danger, setDanger] = useState<DangerLevel | null>(null);

  const filtered = useMemo(() => {
    const entries: CreatureKnowledgeEntry[] = creatures.map((creature) => ({
      id: creature.id,
      source: "bestiario",
      title: creature.name,
      category: creature.type,
      status: KNOWLEDGE_STATUS[creature.status],
      dangerLevel: creature.dangerLevel,
      searchText: creature.locked ? "" : creature.name,
    }));

    const matched = filterKnowledge(searchKnowledge(entries, query), [
      { select: (e) => e.category, value: type },
      { select: (e) => e.dangerLevel, value: danger },
    ]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return creatures.filter((creature) => matchedIds.has(creature.id));
  }, [creatures, query, type, danger]);

  return (
    <CodexSidebar
      toolbar={
        <CodexToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar pelo nome...">
          <div className="creature-filters">
            <div className="creature-filter-row">
              <CodexFilter
                allLabel="Todos os tipos"
                selected={type}
                onSelect={(value) => setType(value as CreatureType | null)}
                options={CREATURE_TYPES.map((t) => ({ value: t.slug, label: `${t.icon} ${t.label}` }))}
              />
            </div>
            <div className="creature-filter-row">
              <CodexFilter
                allLabel="Qualquer periculosidade"
                selected={danger}
                onSelect={(value) => setDanger(value as DangerLevel | null)}
                options={DANGER_LEVELS.map((d) => ({ value: d, label: DANGER_LABEL[d] }))}
              />
            </div>
          </div>
        </CodexToolbar>
      }
      isEmpty={filtered.length === 0}
      emptyMessage="Nenhuma criatura encontrada."
    >
      {filtered.map((creature) => {
        const type2 = CREATURE_TYPES.find((t) => t.slug === creature.type);
        return (
          <CodexCard
            key={creature.id}
            variant="creature"
            icon={creature.locked ? "❔" : creature.icon}
            title={creature.locked ? "Criatura desconhecida" : creature.name}
            meta={`${type2?.label ?? creature.type} · Periculosidade ${DANGER_LABEL[creature.dangerLevel]}`}
            statusLabel={STATUS_LABEL[creature.status]}
            locked={creature.locked}
            selected={creature.id === selectedCreatureId}
            onSelect={() => onSelectCreature(creature.id)}
          />
        );
      })}
    </CodexSidebar>
  );
}
