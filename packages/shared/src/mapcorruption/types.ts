import type { RareMapRarity, RareMapTier } from "../raremap/types.js";
import type { MapModifierId } from "../mapmods/types.js";

// Sprint 35 — Corrupted Maps Phase I. Requisito arquitetural do brief:
// "Rare Map -> Corruption -> Corrupted Rare Map -> Adventure". Filosofia
// central: "Corrupção nunca é reversível. Nunca existe 'descorromper'.
// Nunca existe reroll. Depois que corrompe: acabou." — por isso não
// existe nenhuma função "undoCorruption()"/"rerollCorruption()" neste
// módulo, nem persistência (Fase 2: "Tudo puro. Sem persistência.") —
// o mesmo princípio de `raremap/` (Sprint 34), levado um passo adiante:
// aqui, a irreversibilidade é uma propriedade ARQUITETURAL (não existe
// caminho de código de volta), não só uma convenção documental.

// Fase 4 — "Infraestrutura. Sem balanceamento definitivo." Os 6
// exemplos literais do brief, "nada além disso" — nenhum resultado
// inventado sem lastro no texto do brief.
export type CorruptionOutcome =
  | "nothing"
  | "add-one-modifier"
  | "add-two-modifiers"
  | "replace-one-add-two"
  | "increase-tier"
  | "brick";

// Fase 2 — CorruptionModifier: um `MapModifierId` (mapmods/types.ts)
// visto pela LENTE da Corrupção — o mesmo vocabulário de sempre
// ("Reutilizar toda Sprint 33"), nunca um segundo catálogo de Mods
// paralelo. Alias deliberado (não um novo tipo estrutural), mesmo
// princípio de `RareMapId = string` em raremap/types.ts.
export type CorruptionModifier = MapModifierId;

// Fase 2 — CorruptionResult: o "fato puro" da rolagem de Corrupção —
// qual resultado saiu e o que ele fez (Mods adicionados/removidos/Tier
// alterado), ANTES de ser aplicado a um Mapa real. Existe separado de
// `CorruptedMap` pelo mesmo motivo que `EncounterResult` existe
// separado de `WorldEncounter` (worldencounter/types.ts) — a "receita"
// pura, observável independentemente do objeto final, útil pra teste/
// depuração sem precisar desmontar um CorruptedMap inteiro.
export interface CorruptionResult {
  outcome: CorruptionOutcome;
  addedMods: CorruptionModifier[];
  removedMods: CorruptionModifier[];
  tierIncreased: boolean;
}

// Fase 2 — CorruptedMap: o `RareMap` original, depois de corrompido.
// "Mapa Corrompido continua sendo uma instância" (Decisões Oficiais) —
// mesmo formato de campos de `RareMap`/`RareMapInstance`
// (raremap/types.ts: `mapId`/`rarity`/`tier`/`mods`), nunca um tipo
// estruturalmente diferente — só ganha `corrupted: true` (marcador
// permanente, nunca `false` neste tipo — não existe "Corrupted Map não
// corrompido") e `corruptionOutcome` (qual dos 6 resultados produziu
// este Mapa, pra HUD/log/teste). `sourceInstanceId` aponta pro
// `RareMapInstance.instanceId` original que foi consumido — nunca mais
// utilizável por si só depois da Corrupção (a irreversibilidade é
// documentada aqui, não aplicada por nenhum guard em runtime — este
// módulo nunca tenta "proteger" o RareMapInstance original de uso
// indevido, só nunca oferece um caminho de volta).
export interface CorruptedMap {
  mapId: string;
  rarity: RareMapRarity;
  tier: RareMapTier;
  mods: MapModifierId[];
  corrupted: true;
  corruptionOutcome: CorruptionOutcome;
  sourceInstanceId: string;
  instanceId: string;
  seed: number;
}
