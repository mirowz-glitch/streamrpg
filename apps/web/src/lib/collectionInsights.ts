import { getRecentEvents } from "./personalTimeline";
import { REGIONS } from "./regions";
import { CREATURES } from "./bestiary";

// Sprint Collections & Discovery Phase I — camada única e central que
// interpreta "o quanto deste conjunto o jogador já está construindo?" a
// partir de dados que já existem (Personal Timeline, identity.regions_
// discovered, character.equipped) — sem estado, sem persistência, sem
// backend. Nenhum componente calcula coleção sozinho; todos chamam
// getXxxInsight() daqui. Nunca números/frações/porcentagens — só
// observações, mesmo espírito de lib/characterPresence.ts.
//
// Auditoria — conjuntos já existentes no jogo e por que cada um entrou
// (ou não) nesta Sprint:
// - Bestiário (CREATURES, lib/bestiary.ts): 133 criaturas. Sinal real
//   já existia (creaturesViewed, alimentado por CreatureReader) —
//   estava DUPLICADO como lógica inline em BestiaryBuilding.tsx.
// - Biblioteca (BOOKS, lib/library.ts): 9 livros. Mesma situação —
//   sinal (booksRead) e reação já existiam, duplicados em
//   LibraryBuilding.tsx.
// - Museu (MUSEUM_ENTRIES, lib/museum.ts): 55 registros. NÃO tinha
//   nenhum sinal pessoal (só o total estático "X/Y catalogados", igual
//   pra todo jogador) — MuseumReader.tsx ganhou o mesmo ponto de
//   escrita (`museum_entry_viewed`) que Livro/Criatura já tinham.
// - Regiões (REGIONS, lib/regions.ts): 11 regiões. Sinal real já
//   existe em identity.regions_discovered (PlayerFacts), nunca exibido
//   como observação de coleção antes.
// - Equipamento (6 slots, lib/rarity.ts + InventoryPage): sinal real já
//   existe em character.equipped.length, nunca exibido como observação
//   de coleção antes.
// - Avaliados e DEIXADOS DE FORA por não terem sinal pessoal real nem
//   tela própria hoje (não criar tela nova é restrição explícita desta
//   Sprint): tipos de criatura/raridade (só rótulo/filtro, sem tracking
//   por tipo), monumentos/ruínas isolados (lib/ruins.ts nunca é
//   renderizado por nenhum componente), profissões/NPCs/folclore
//   (catálogos sempre visíveis, sem noção de "descoberta"), títulos
//   (já tem sua própria contagem "X/Y" em IdentityPanel, não duplicado
//   aqui).
export interface CollectionInsightContext {
  booksRead: number;
  creaturesViewed: number;
  museumEntriesViewed: number;
  regionsDiscovered: number;
  totalRegions: number;
  equippedSlotCount: number;
  totalEquipmentSlots: number;
}

const TOTAL_EQUIPMENT_SLOTS = 6;

// regionsDiscovered/equippedSlotCount são opcionais porque vêm de fontes
// diferentes (identity/character) que nem todo consumidor busca — quem
// só precisa do trio derivado do Personal Timeline (Bestiário/Biblioteca/
// Museu) chama sem argumentos; Character/Inventário passam o que já têm.
export function buildCollectionInsightContext(opts?: {
  regionsDiscovered?: number;
  equippedSlotCount?: number;
}): CollectionInsightContext {
  const recentEvents = getRecentEvents(20);
  return {
    booksRead: recentEvents.filter((e) => e.kind === "book_read").length,
    creaturesViewed: recentEvents.filter((e) => e.kind === "creature_viewed").length,
    museumEntriesViewed: recentEvents.filter((e) => e.kind === "museum_entry_viewed").length,
    regionsDiscovered: opts?.regionsDiscovered ?? 0,
    totalRegions: REGIONS.length,
    equippedSlotCount: opts?.equippedSlotCount ?? 0,
    totalEquipmentSlots: TOTAL_EQUIPMENT_SLOTS,
  };
}

// Sprint Kingdom Reputation Phase I — refatoração de dívida técnica:
// esta checagem (cruzar creatureId do Personal Timeline com
// `dangerLevel` do Bestiário) vivia só dentro do useMemo de
// habitContext em NpcIntro.tsx (Sprint Gameplay Presence Phase I).
// Kingdom Reputation precisa exatamente do mesmo sinal — em vez de
// copiar a lógica pela segunda vez, ela foi extraída pra cá (mesmo
// arquivo central de sinais derivados do Personal Timeline) e
// NpcIntro.tsx passou a importar daqui.
export function hasEncounteredLethalCreature(): boolean {
  return getRecentEvents(20).some((e) => {
    if (e.kind !== "creature_viewed") return false;
    const creatureId = e.meta?.creatureId;
    if (typeof creatureId !== "string") return false;
    const creature = CREATURES.find((c) => c.id === creatureId);
    return creature?.dangerLevel === "letal";
  });
}

// Bestiário — extraído de BestiaryBuilding.tsx (estava calculado ali
// dentro), mesmo texto de sempre pro tier avançado; tier intermediário
// novo, exemplo quase literal do brief.
export function getBestiaryInsight(ctx: CollectionInsightContext): string | null {
  if (ctx.creaturesViewed >= 6) return "Seu caderno está ficando cheio.";
  if (ctx.creaturesViewed >= 2) return "Você já registrou criaturas suficientes para começar a entender esta região.";
  return null;
}

// Biblioteca — extraído de LibraryBuilding.tsx, textos preservados
// exatamente (já existiam, só estavam duplicados ali).
export function getLibraryInsight(ctx: CollectionInsightContext): string | null {
  if (ctx.booksRead >= 6) return "Está formando uma boa coleção de conhecimento.";
  if (ctx.booksRead >= 2) return "Vejo que continua pesquisando.";
  return null;
}

// Museu — primeira vez que ganha uma observação pessoal (antes só tinha
// o total estático "X/Y catalogados", igual pra todo jogador).
export function getMuseumInsight(ctx: CollectionInsightContext): string | null {
  if (ctx.museumEntriesViewed >= 3) return "Poucas peças faltam para compreender esta Era.";
  if (ctx.museumEntriesViewed >= 1) return "Você já reconhece alguns nomes deste lugar.";
  return null;
}

// Character/Cidade — regiões descobertas (identity.regions_discovered),
// nunca exibido como observação de coleção antes desta Sprint.
export function getRegionsInsight(ctx: CollectionInsightContext): string | null {
  if (ctx.regionsDiscovered >= Math.ceil(ctx.totalRegions * 0.7)) return "Você já visitou boa parte do Reino.";
  if (ctx.regionsDiscovered >= 3) return "Você está começando a conhecer os caminhos do Reino.";
  return null;
}

// Inventário — espaços de equipamento preenchidos, nunca exibido como
// observação de coleção antes desta Sprint.
export function getInventoryInsight(ctx: CollectionInsightContext): string | null {
  if (ctx.equippedSlotCount >= ctx.totalEquipmentSlots) return "Seu equipamento cobre cada espaço que você tem.";
  if (ctx.equippedSlotCount >= ctx.totalEquipmentSlots - 1) return "Seu equipamento já cobre quase todos os espaços.";
  if (ctx.equippedSlotCount >= 3) return "Seu equipamento já cobre boa parte dos espaços.";
  return null;
}
