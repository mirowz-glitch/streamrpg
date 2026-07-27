import type { PresentationEvent } from "@streamrpg/shared";
import { describeEvent } from "../components/hud/EventFeed";

// Living World Phase II — Fase 3/4 ("Diário do Aventureiro" / "Eventos
// Relevantes"): a EventFeed completa (Aventura) mostra TODOS os
// eventos, incluindo os puramente técnicos — pertence só à Aventura
// (docs/design/idle-experience-redesign.md Seção 10). Este módulo
// escolhe só os marcos que um diário narraria, classifica cada um por
// prioridade (pedido explícito do brief: Boss/Mini-Boss/Dungeon/Novo
// Equipamento/Checkpoint/Level Up = "Muito importante"; Loot raro =
// "Importante"; combates comuns = "Normal"), e agrupa combates comuns
// consecutivos numa única linha — "eventos repetitivos não devem
// dominar a tela". Reusa `describeEvent` (mesmo texto de sempre) pra
// todo evento cuja frase já é narrativa o bastante; só reescreve as
// duas entradas que mais pareciam log técnico (EncounterFinished,
// ExpeditionCheckpointReached — achado da Fase 1, Auditoria).
export type DiaryPriority = "alta" | "media" | "normal";

export interface DiaryEntry {
  text: string;
  priority: DiaryPriority;
}

// "Muito importante" — Boss, Mini-Boss, Dungeon, Novo Equipamento,
// Checkpoint, Level Up (lista literal do brief). RegionUnlocked entra
// no mesmo balde: é o mesmo tipo de marco raro e definitivo.
const HIGH_PRIORITY_KINDS: ReadonlySet<PresentationEvent["kind"]> = new Set([
  "FinalBossEncounter",
  "FinalBossDefeated",
  "DungeonCompleted",
  "MiniBossEncounter",
  "MiniBossDefeated",
  "LevelUp",
  "ExpeditionCheckpointReached",
  "ItemEquipped",
  "RegionUnlocked",
]);

// "Importante" — um degrau abaixo do "muito importante", mas ainda
// acima do ruído de combate comum.
const MEDIUM_PRIORITY_KINDS: ReadonlySet<PresentationEvent["kind"]> = new Set([
  "EliteDefeated",
  "ExpeditionStarted",
  "WorldEventStarted",
]);

// "Loot raro" (pedido explícito do brief) — as duas raridades mais
// altas do Item Generator (ItemGenRarityId: common/magic/rare/unique).
const RARE_LOOT_RARITIES: ReadonlySet<string> = new Set(["rare", "unique"]);

function classifyPriority(event: PresentationEvent): DiaryPriority | null {
  if (event.kind === "EncounterFinished") return event.enemiesKilled > 0 ? "normal" : null;
  if (event.kind === "LootDropped") return RARE_LOOT_RARITIES.has(event.rarity) ? "media" : "normal";
  if (HIGH_PRIORITY_KINDS.has(event.kind)) return "alta";
  if (MEDIUM_PRIORITY_KINDS.has(event.kind)) return "media";
  return null;
}

// Fase 1 (Auditoria) — estas duas frases eram as que mais pareciam log
// técnico: "Encontro concluído (N derrotado)" e "Checkpoint X/Y
// atingido (+N HP)" (fração + estatística crua). O resto do vocabulário
// de describeEvent() já lê como diário — não reescrito.
function narrate(event: PresentationEvent): string {
  if (event.kind === "EncounterFinished") {
    return `Derrotou ${event.enemiesKilled} ${event.enemiesKilled === 1 ? "inimigo" : "inimigos"}.`;
  }
  if (event.kind === "ExpeditionCheckpointReached") {
    return "Chegou a um novo checkpoint da jornada.";
  }
  return describeEvent(event);
}

// Fase 4 — "eventos repetitivos não devem dominar a tela": combates
// comuns (EncounterFinished) consecutivos viram UMA linha agregada em
// vez de uma por encontro; qualquer evento de prioridade alta/média
// nunca é agregado, sempre aparece como sua própria linha, na posição
// cronológica correta.
export function buildAdventureDiaryEntries(events: readonly PresentationEvent[], limit = 6): DiaryEntry[] {
  const collapsed: DiaryEntry[] = [];
  let runKills = 0;
  let runCount = 0;

  function flushRun() {
    if (runCount === 0) return;
    const text =
      runCount === 1
        ? `Derrotou ${runKills} ${runKills === 1 ? "inimigo" : "inimigos"}.`
        : `Derrotou ${runKills} inimigos em ${runCount} combates recentes.`;
    collapsed.push({ text, priority: "normal" });
    runKills = 0;
    runCount = 0;
  }

  for (const event of events) {
    const priority = classifyPriority(event);
    if (priority === null) continue;

    if (event.kind === "EncounterFinished") {
      runKills += event.enemiesKilled;
      runCount += 1;
      continue;
    }

    flushRun();
    collapsed.push({ text: narrate(event), priority });
  }
  flushRun();

  return collapsed.slice(-limit).reverse();
}
