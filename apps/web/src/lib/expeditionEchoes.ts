import type { ExpeditionApproach, ExpeditionResponse } from "@streamrpg/shared";

// Sprint Expedition Echoes Phase I — camada central, sem estado, sem
// persistência, sem backend/tabela/evento novo: "existe algum eco
// dessa expedição que vale a pena mostrar?". Nunca executa nada, nunca
// altera XP/Gold/Loot/Drop/Encounter/Progress/Status — só responde com
// uma frase (ou null). Nenhum componente decide sozinho: todos
// perguntam a esta camada.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha:
// - Não existe (e não pode ser criado nesta Sprint) nenhum histórico
//   de "expedições concluídas" no cliente: ExpeditionSystem conclui e
//   já inicia a próxima expedição no mesmo tick, e a única forma hoje
//   de perceber isso é o watermark local e efêmero de
//   ExpeditionPanel.tsx (`justCompleted`, 5s, só naquele componente).
//   Por isso o único dado real e disponível FORA do ExpeditionPanel é
//   a expedição ATUAL — `destination_region_name` (o alvo real da
//   expedição em curso, estável do início ao fim, ao contrário de
//   `current_region_name`, que só passa a valer o destino a partir de
//   "combating"). Nenhum eco aqui inventa um "histórico" — é sempre a
//   mesma pergunta: "a região desta expedição em curso é a mesma deste
//   livro/criatura/região/NPC?".
// - ExpeditionResponse (packages/shared) já expõe `approach`
//   (Expedition Choice Phase III) e `destination_region_name`
//   (Expedition System, desde sempre) — nenhum campo novo precisou ser
//   criado.
// - DiscoveryChains/CreatureEcology (Expedition Consequences Phase I)
//   já estabeleceram o padrão "investigate revela mais de um match
//   real" via `pickWithApproach` — aqui NÃO se repete essa lógica:
//   Echoes é sobre presença de MUNDO (uma região sendo visitada),
//   Consequences é sobre a ATENÇÃO do próprio jogador (o que ele
//   percebe). Os dois nunca compartilham a mesma frase.
// - DÍVIDA TÉCNICA ENCONTRADA E ELIMINADA: a Sprint anterior
//   (Expedition Consequences Phase I) tinha começado a passar um prop
//   solto `expeditionApproach` de CityPage → BestiaryBuilding →
//   CreatureReader. Continuar nesse padrão criaria DOIS objetos de
//   contexto paralelos (um só de approach, outro só de região) descendo
//   pelas mesmas telas. Unificado num único `ExpeditionEchoContext`
//   (approach + regionName) — CreatureReader agora recebe um só prop
//   pra tudo relacionado à expedição atual, nunca dois.
export interface ExpeditionEchoContext {
  regionName: string | null;
  approach: ExpeditionApproach | null;
}

export const EMPTY_ECHO_CONTEXT: ExpeditionEchoContext = { regionName: null, approach: null };

// Pura: mesma entrada, mesma saída, sempre. `expedition === null` cobre
// "sem expedição" (personagem não carregado, ou nunca logado) —
// retorna o mesmo contexto vazio de sempre, nunca quebra.
export function buildExpeditionEchoContext(expedition: ExpeditionResponse | null): ExpeditionEchoContext {
  if (!expedition) return EMPTY_ECHO_CONTEXT;
  return { regionName: expedition.destination_region_name, approach: expedition.approach };
}

function matchesEchoRegion(regionName: string, ctx: ExpeditionEchoContext): boolean {
  return ctx.regionName !== null && ctx.regionName === regionName;
}

// RegionGallery — cada card pergunta pela própria região.
export function getRegionGalleryEchoLine(regionName: string, ctx: ExpeditionEchoContext): string | null {
  return matchesEchoRegion(regionName, ctx) ? "Expedições recentes passaram por aqui." : null;
}

// CreatureReader — região real da criatura (`bestiary.ts` regionId,
// já usada por Creature Ecology/RegionIdentity).
export function getCreatureEchoLine(creatureRegionName: string, ctx: ExpeditionEchoContext): string | null {
  return matchesEchoRegion(creatureRegionName, ctx) ? "Exploradores recentes voltaram a relatar essa criatura." : null;
}

// BookReader — região real do livro, só quando existe (nem todo livro
// tem uma criatura conectada com região — `getBookRelated` já resolve
// isso, "Região" só aparece quando uma conexão real existe).
export function getBookEchoLine(bookRegionName: string | null, ctx: ExpeditionEchoContext): string | null {
  if (!bookRegionName) return null;
  return matchesEchoRegion(bookRegionName, ctx) ? "Este livro voltou a despertar interesse." : null;
}

// LibraryBuilding (nível do prédio, não de um livro específico) — só
// quando a Biblioteca realmente tem algum livro real conectado a essa
// região (`hasRegionRelatedBook`, calculado pelo chamador reaproveitando
// `getBookRelated` já existente) — nunca um "relato" genérico sem
// nenhuma conexão real por trás.
export function getLibraryEchoLine(hasRegionRelatedBook: boolean, ctx: ExpeditionEchoContext): string | null {
  if (!hasRegionRelatedBook || ctx.regionName === null) return null;
  return "Alguns relatos recentes vieram dessa região.";
}

// NpcIntro (genérico, qualquer NPC) — só quando o próprio catálogo de
// falas deste NPC já menciona o nome da região pelo texto
// (`npcDialogueMentionsRegion`, calculado pelo chamador reaproveitando
// `flattenDialogue`/o mesmo padrão de busca textual já usado por
// `getNpcCitedPeople`/`getSimilarRumors` em knowledgeLinks.ts) — nunca
// uma menção nova inventada para um NPC que nunca falou sobre aquele
// lugar.
export function getNpcEchoLine(npcDialogueMentionsRegion: boolean, ctx: ExpeditionEchoContext): string | null {
  if (!npcDialogueMentionsRegion || ctx.regionName === null) return null;
  return "Há viajantes comentando essa região por aqui.";
}
