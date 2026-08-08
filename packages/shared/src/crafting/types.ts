/**
 * Sprint 12 — Crafting Phase I (Sphere System). Novo domínio: quem
 * possui quantas Esferas, e o contrato de consumo de uma Esfera contra
 * um item. Distinto de `itemization/spheres.ts` (Sprint 10/11), que
 * modela a ESFERA em si (definição/efeito/restrição) e a transição de
 * `craft_state` — este módulo modela a POSSE e o USO.
 *
 * "Esferas não podem ser compradas... entram no mundo apenas por
 * gameplay (a distribuição real é Sprint futura)" — por isso não existe
 * nenhum tipo de "loja" aqui, só posse/consumo.
 */
import type { SphereTypeId } from "../itemization/spheres.js";

export interface SphereStack {
  sphereId: SphereTypeId;
  quantity: number;
}

/** Todas as Esferas que um personagem possui agora. */
export interface SphereInventory {
  characterId: string;
  stacks: SphereStack[];
}

/**
 * Alias documentado — o brief pede "SphereOwnership" como conceito
 * distinto; hoje tem exatamente a forma de `SphereInventory` (mesmo
 * princípio de `ItemAffix = ItemGenRolledMod`, Sprint 10: nomear sem
 * duplicar campo).
 */
export type SphereOwnership = SphereInventory;

// Sprint 12 tinha aqui um `SphereDropRecord` PLACEHOLDER ("distribuição
// real é Sprint futura", nunca lido por código de produção). Sprint 13
// (Sphere Economy Phase I) é essa Sprint — o contrato real vive agora
// em `adventure/types.ts` (`SphereDropRecord`, o fato de engine emitido
// por `adventureLoop.ts`) e `spheredrop/` (tabela/rolagem). Removido
// daqui pra nunca existir um segundo modelo do mesmo conceito.

/** Um consumo real de 1 unidade de Esfera contra um item específico. */
export interface SphereConsumptionEvent {
  sphereId: SphereTypeId;
  characterId: string;
  characterItemId: number;
  consumedAt: string;
}
