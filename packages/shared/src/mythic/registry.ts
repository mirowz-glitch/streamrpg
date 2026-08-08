/**
 * Sprint 18 — Fase 3: MythicRegistry. Único ponto de leitura de
 * `MythicDefinition` — "nada hardcoded dentro do SphereService, tudo
 * consultado pelo Registry". Funções puras, sem I/O, mesmo princípio
 * de todo derivador do projeto.
 */
import type { MythicDefinition, MythicRegistry } from "./types.js";

export function getMythicDefinition(registry: MythicRegistry, mythicId: string): MythicDefinition | undefined {
  return registry[mythicId];
}

export function listMythicDefinitions(registry: MythicRegistry): MythicDefinition[] {
  return Object.values(registry);
}

export function listDiscoverableMythics(registry: MythicRegistry): MythicDefinition[] {
  return listMythicDefinitions(registry).filter((def) => def.enabled && def.discoverable);
}

/**
 * Ponte entre um resultado de transformação (`revealedName`, ver
 * transformation/resolver.ts) e o `MythicDefinition` correspondente.
 * `BaseTransformation` não carrega um `mythicId` (Sprint 17 não previa
 * este registro) — o vínculo é feito pelo nome revelado, que já é
 * único por design (cada `BaseTransformation.revealedName` descreve
 * exatamente um resultado). Devolve `undefined` se o nome revelado não
 * corresponde a nenhum Mítico registrado — nunca inventa uma
 * identidade que o Registry não sustenta.
 */
export function findMythicDefinitionByRevealedName(registry: MythicRegistry, revealedName: string): MythicDefinition | undefined {
  return listMythicDefinitions(registry).find((def) => def.enabled && def.displayName === revealedName);
}

/**
 * Sprint 24 — Economy Foundation II, Fase 4: mesmo predicado de
 * `transformation/resolver.ts#isUncertaintyExclusive`, agora pro nível
 * de identidade Mítica — `MythicDefinition.exclusiveSource` já é o
 * campo real desde a Sprint 18 (ex.: "Anel do Primeiro Rei" tem
 * `exclusiveSource: "uncertainty"`); nunca um segundo campo booleano.
 */
export function isMythicUncertaintyExclusive(mythic: Pick<MythicDefinition, "exclusiveSource">): boolean {
  return mythic.exclusiveSource === "uncertainty";
}
