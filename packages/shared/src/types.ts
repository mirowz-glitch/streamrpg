// Sprint 11 — Persistent Items + Affixes: único import deste arquivo
// (types.ts sempre foi auto-contido) — seguro porque itemization/
// nunca importa de volta `./types.js` (só de `./itemgen/types.js`),
// então não há ciclo.
import type { ItemAffix, ItemCraftState, ItemHistory, ItemLegacy, ItemPotential, ItemQuality, LegacyEvent, LegacySummary } from "./itemization/index.js";
// Sprint 15 — Sockets + Gem System (Foundation): mesmo princípio de
// itemization/ — `socket/` nunca importa de volta `./types.js`, sem
// ciclo.
import type { SocketConfiguration } from "./socket/index.js";
import type { MythicOrigin } from "./mythic/index.js";
import type { BaseIdentitySummary } from "./baseIdentity/index.js";
// Sprint 22 — Living Combat Phase I: `import type` é apagado na
// compilação (nenhum import de valor/runtime) — combat/combatSnapshot.ts
// também só importa `EquippedItem` daqui via `import type`, então não
// existe ciclo real em tempo de execução, só uma referência de tipo nos
// dois sentidos (mesmo princípio seguro de tipos mutuamente recursivos).
import type { CombatSnapshotDTO, ActiveBehaviorSummary } from "./combat/combatSnapshot.js";

// Sprint Identity Core (Vision 2.0) — uma Pessoa não exige mais Twitch
// para existir; twitch_id nunca mais é a identidade, só um campo legado
// (ver `Account`/`AuthProvider` abaixo, o vínculo de autenticação real).
export interface Profile {
  id: string;
  twitch_id: string | null;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// Sprint Identity Core (Vision 2.0) — os seis provedores de login já
// nomeados em docs/design/login-providers.md. Só "twitch" é implementado
// de fato nesta Sprint (login real) — os demais existem como valor
// possível do tipo, arquitetura pronta sem OAuth implementado.
export type AuthProvider = "twitch" | "google" | "discord" | "kick" | "youtube" | "email";

// Um Vínculo de Autenticação — uma Pessoa (Profile) pode ter zero, um, ou
// vários, nunca o inverso (docs/design/identity-core.md Seção 2).
export interface Account {
  id: string;
  profile_id: string;
  provider: AuthProvider;
  provider_user_id: string;
  connected_at: string;
}

// Sprint Kingdom Domain 2.0 (Vision 2.0, Sprint 2) — o Reino como domínio
// permanente do mundo (docs/design/kingdom-domain-2.0.md). Deliberadamente
// separado de `StreamerChannel` abaixo (o modelo antigo, ainda em uso por
// Kingdom Prestige/Boss/City nesta Sprint, não migrado ainda — ver
// docs/design/kingdom-domain-implementation.md Seção 7). Um Kingdom nunca
// depende de Twitch/Kick/YouTube/Discord para existir.
export type KingdomStatus = "active" | "dormant";
export type KingdomVisibility = "public" | "private";

export interface Kingdom {
  id: string;
  name: string;
  slug: string;
  description: string;
  founder_profile_id: string | null;
  leader_profile_id: string | null;
  status: KingdomStatus;
  visibility: KingdomVisibility;
  banner: string | null;
  symbol: string | null;
  motto: string | null;
  created_at: string;
  updated_at: string;
  // "history" (per docs/design/kingdom-domain-2.0.md Fase 2) é
  // deliberadamente NÃO um campo de dado nesta Sprint — mapeia para uma
  // futura tabela de Crônica do Reino (mesmo padrão de
  // `character_chronicles`), Citizen System/World Events, não construída
  // aqui ("sem implementar funcionalidades futuras", Fase 2 do brief).
}

// Sprint Citizen System (Vision 2.0, Sprint 3) — a ligação permanente
// entre Character e Kingdom (docs/design/citizen-system.md). Um
// personagem "pertence" a um Reino porque tem uma linha ativa aqui —
// nunca por viewer_sessions/channel_rankings (ver
// docs/design/citizen-system-implementation.md Fase 1, auditoria).
//
// `rank` cobre os 5 estágios documentados (Visitante → Residente →
// Cidadão → Veterano → Lenda), mas esta Sprint só atribui "residente"
// no momento de entrar num Reino — a progressão para os estágios
// seguintes (métricas de contribuição real: tempo, expedições, Bosses)
// é escopo de uma Sprint futura, não implementada aqui. "Visitante" não
// tem linha nesta tabela — é qualquer personagem sem citizenship ativa.
//
// Sprint Citizen Progression (Vision 2.0, Sprint 4) — formaliza os 5
// estágios como um domínio próprio (docs/design/
// citizen-progression-implementation.md). `PersistedCitizenRank` é o
// subconjunto que de fato existe como coluna em `citizens.rank`
// (Visitante nunca é uma linha, per Sprint 3) — `CitizenRank` é a escada
// completa de 5 estágios, usada por qualquer leitura/exibição que
// precise responder "qual o rank deste personagem agora", incluindo o
// caso derivado (sem linha = Visitante). Nenhum critério de promoção
// automática (tempo, contribuição) é definido aqui — só a infraestrutura
// de armazenar/ler/mudar manualmente o estágio atual.
export type PersistedCitizenRank = "residente" | "cidadao" | "veterano" | "lenda";
export type CitizenRank = "visitante" | PersistedCitizenRank;

// Ordem oficial da escada (Fase 2). Usada por promote()/demote() para
// mover um passo por vez — nunca pula estágio, nunca decide sozinho
// quando promover (isso é critério de uma Sprint futura).
export const CITIZEN_RANK_ORDER: PersistedCitizenRank[] = ["residente", "cidadao", "veterano", "lenda"];
export const CITIZEN_RANK_LADDER: CitizenRank[] = ["visitante", ...CITIZEN_RANK_ORDER];

export type CitizenStatus = "active" | "left";

export interface Citizen {
  id: string;
  character_id: string;
  kingdom_id: string;
  joined_at: string;
  status: CitizenStatus;
  rank: PersistedCitizenRank;
  // Nunca colunas persistidas — sempre derivados por comparação com
  // kingdoms.founder_profile_id/leader_profile_id no momento da leitura,
  // para nunca ficarem desatualizados se a liderança do Reino mudar de
  // mãos numa Sprint futura (Kingdom Domain já documenta liderança como
  // transitória, ver kingdom-domain-2.0.md Seção 2).
  is_founder: boolean;
  is_leader: boolean;
  notes: string | null;
  last_activity: string;
  // Também derivado (join com characters.display_name), nunca uma coluna
  // própria — só para permitir uma lista de cidadãos legível na UI
  // mínima desta Sprint, sem duplicar a fonte de verdade do nome.
  character_display_name: string;
}

// Sprint Housing Phase I (Vision 2.0, Sprint 5) — o primeiro ativo
// verdadeiramente permanente do mundo (docs/design/housing-phase1.md).
// Uma Casa pertence ao Reino, nunca ao personagem — o mesmo princípio de
// "fundação permanente / posse transitória" já aplicado a Kingdom
// (`kingdom-domain-2.0.md` Seção 1), um nível abaixo.
// `original_builder_character_id` nunca muda depois de construída (fato
// histórico permanente); `current_owner_character_id` é quem possui
// agora (transitório — nasce igual ao construtor, muda só via
// transferOwnership). "status"/"house_type" existem como enums desde já
// (mesmo padrão de kingdoms.status), mas esta Sprint só escreve
// 'active'/o tipo padrão — abandono/tipos variados são escopo futuro.
export type HouseStatus = "active" | "abandoned";

// Log append-only de fatos permanentes (Fase 8, "Legado") — nunca
// editado, só recebe novas entradas. "built" é sempre a primeira; cada
// "transferred"/"sold" subsequente registra quem entregou/recebeu e
// quando. "sold" (Sprint Real Estate Phase I) é uma transferência que
// aconteceu através de uma venda real — carrega `price` — distinta de
// "transferred", que continua existindo para transferência
// administrativa pura (sem preço, ver docs/design/
// housing-phase1-implementation.md Seção 13).
export interface HouseHistoryEvent {
  event: "built" | "transferred" | "sold";
  from_character_id: string | null;
  to_character_id: string;
  at: string;
  price?: number;
}

export interface House {
  id: string;
  kingdom_id: string;
  // district/plot são texto livre nesta Sprint — a divisão real em
  // bairros com capacidade/disponibilidade (housing-phase1.md Seção 2)
  // é escopo futuro, não implementada aqui.
  district: string | null;
  plot: string | null;
  name: string;
  current_owner_character_id: string;
  original_builder_character_id: string;
  created_at: string;
  status: HouseStatus;
  house_type: string;
  history: HouseHistoryEvent[];
  // Derivados via join (characters.display_name), nunca colunas —
  // mesmo padrão de Citizen.character_display_name.
  current_owner_display_name: string;
  original_builder_display_name: string;
  kingdom_name: string;
}

// Sprint Real Estate Phase I (Vision 2.0, Sprint 6) — o Mercado
// Imobiliário do Reino (docs/design/real-estate.md). Transforma uma
// Casa em patrimônio negociável entre jogadores, sem nunca alterar
// `houses` fora de `transferOwnership()` (Fase 4 do brief — "nunca
// duplicar regra"). `status` cobre o ciclo trivial desta Sprint:
// 'active' (anunciada) → 'sold' (comprada) ou 'cancelled' (retirada
// pelo vendedor) — nenhum leilão, imposto ou tomada pelo Reino.
export type HouseSaleStatus = "active" | "sold" | "cancelled";

export interface HouseSale {
  id: string;
  house_id: string;
  seller_character_id: string;
  asking_price: number;
  created_at: string;
  status: HouseSaleStatus;
  buyer_character_id: string | null;
  sold_at: string | null;
  // Derivados via join, nunca colunas — mesmo padrão de House/Citizen.
  house_name: string;
  kingdom_name: string;
  seller_display_name: string;
}

// Kingdom Integration Phase I (Vision 2.0, Sprint 8) — Streamer vira
// apenas uma Integração de Reino ("Kingdom Integration"), nunca um
// requisito, nunca dono do Reino. Um Kingdom pode ter zero, uma ou
// várias — Twitch/Kick/YouTube/Discord tratados exatamente igual,
// nenhum privilegiado. `provider` é deliberadamente `string`, nunca uma
// union fechada de Twitch — o brief é explícito ("Não limitar
// providers. Nunca usar enum Twitch-only.") para que uma integração
// futura (qualquer uma) nunca exija mexer neste tipo. Puramente
// infraestrutura: nenhuma regra de liderança/gameplay lê esta tabela
// (per o brief, "apenas infraestrutura" — sem OAuth completo, chat,
// drops, eventos, notificações, webhooks, tempo real ou benefício
// exclusivo).
export type KingdomIntegrationStatus = "connected" | "disconnected";

export interface KingdomIntegration {
  id: string;
  kingdom_id: string;
  provider: string;
  external_id: string;
  display_name: string;
  status: KingdomIntegrationStatus;
  connected_at: string;
  metadata: Record<string, unknown> | null;
}

export interface StreamerChannel {
  id: string;
  display_name: string;
  twitch_id: string;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
}

export interface Character {
  id: string;
  profile_id: string;
  display_name: string;
  level: number;
  xp: number;
  gold: number;
  total_minutes: number;
  primary_channel_id: string | null;
  last_ping_at: number | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterCombatSummary {
  attack_physical: number;
  attack_magic: number;
  resistance_physical: number;
  resistance_magic: number;
  sus: number;
  uti: number;
}

export interface CharacterResponse {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  xp_to_next: number;
  percent: number;
  gold: number;
  total_minutes: number;
  avatar_url: string | null;
  primary_channel_id: string | null;
  equipped: EquippedItem[];
  // Sprint Equipment Experience — reaproveita CharacterRepository.getCombatAttributes()
  // (já existente desde a Sprint Character Attributes Schema). Sprint 22
  // — Living Combat Phase I, Fase 8: os 4 campos de dano/resistência
  // agora são sourceados do MESMO `combatSnapshot` abaixo (nunca um
  // segundo cálculo) — só `sus`/`uti` continuam vindo de
  // `getCombatAttributes()` (fora do vocabulário de 7 stats do Combat
  // Snapshot). `resistance_magic` fica sempre 0 — simplificação honesta:
  // o modelo antigo separava física/mágica por peça de armadura, o
  // Combat Snapshot unificado (armor único) não reproduz esse split.
  combat: CharacterCombatSummary;
  // Sprint 22 — Living Combat Phase I, Fase 2/3/8: "Character API deve
  // devolver exatamente o Snapshot utilizado pelo combate, nunca duas
  // versões" — substitui o `resolvedStats`/`activeGemEffects` da Sprint
  // 21 (agregado paralelo, nunca consumido por nenhuma UI) pelo MESMO
  // CombatSnapshotDTO que Adventure/Idle/Dungeon/Boss agora consultam
  // (combat/combatSnapshot.ts, buildCombatSnapshot). Sempre derivado,
  // nunca persistido.
  combatSnapshot: CombatSnapshotDTO;
  // Sprint 23 — Sockets & Gems Phase II, Fase 9: "Nunca duplicar" — a
  // MESMA lista de `combatSnapshot.activeBehaviors`, também exposta no
  // nível raiz (nome que o brief desta Sprint pede).
  activeGemBehaviors: ActiveBehaviorSummary[];
  created_at: string;
}

export interface PingResponse {
  xp_gained: number;
  gold_gained: number;
  new_xp: number;
  level: number;
  leveled_up: boolean;
  xp_to_next: number;
  percent: number;
  cooldown_seconds: number;
  drop: DropResult | null;
}

export interface DropResult {
  dropped: boolean;
  item?: InventoryItem;
}

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
// Persistence & Sync Layer Repair — "gloves"/"belt" adicionados: o Item
// Generator (itemgen/types.ts: ItemGenSlot) sempre teve 8 slots, mas
// este vocabulário persistido só cobria 6 — itens de luva/cinto
// encontrados na Aventura não tinham pra onde ir e caíam num slot
// errado ao sincronizar (ver useAdventureSession.ts). Puramente
// aditivo: nenhum slot existente muda de nome/comportamento.
export type ItemSlot = "weapon" | "armor" | "helmet" | "boots" | "amulet" | "ring" | "gloves" | "belt";

// Sprint Character Attributes Schema — infraestrutura para o Combat Model
// (docs/combat-model/canonical-formula.md). Em armas, decide se o ATQ é
// físico ou mágico; nos demais slots, decide se a Resistência concedida é
// física ou mágica. Opcional aqui porque o catálogo hoje é quase todo
// físico por padrão (mesmo default da coluna `items.damage_type` no
// banco) — não precisa ser declarado em toda entrada do catálogo.
export type DamageType = "physical" | "magic";

export interface ItemCatalogEntry {
  id: number;
  slug: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  min_level: number;
  damage_type?: DamageType;
  uti_bonus?: number;
}

// Sprint 11 — Persistent Items + Affixes. Campos comuns aos dois shapes
// abaixo (InventoryItem/EquippedItem) — extraídos pra nunca divergir
// entre eles. `affixes`/`history` são `[]`/`null` para o catálogo fixo
// (itens sem Item Generator por trás nunca tiveram afixo algum);
// `potential`/`quality`/`craft_state` sempre presentes (mesmo que
// neutros) porque toda LINHA de `items` ganhou essas colunas na
// migração desta Sprint, catálogo fixo incluso (potential neutro,
// quality 0, craft_state 'open').
export interface PersistedItemFields {
  item_level: number | null;
  seed: number | null;
  affixes: ItemAffix[];
  potential: ItemPotential | null;
  quality: ItemQuality;
  craft_state: ItemCraftState;
  history: ItemHistory | null;
  // Sprint 14 — Legendary Items + Legacy System, Fase 8: os 3 campos que
  // o brief pede em toda resposta de Item — sempre DERIVADOS de
  // `history` na camada de leitura (mapInventoryRow/getEquippedItems,
  // drop.service.ts), nunca uma coluna nova/migração; `null` sempre que
  // `history` também é `null` (catálogo fixo pré-Sprint 11, mesmo
  // padrão de `potential`).
  legacy: ItemLegacy | null;
  legacyEvents: LegacyEvent[];
  legacySummary: LegacySummary | null;
  // Sprint 15 — Sockets + Gem System (Foundation), Fase 8: "Todo Item
  // retorna Sockets" — `null` pro catálogo fixo e todo item dropado
  // antes desta migração (mesmo padrão de `potential`). Gemas (Fase 8)
  // não vivem aqui — elas têm identidade própria numa tabela separada
  // (`gems`), nunca embutidas dentro do item; ver `GET /api/items/gems`.
  sockets: SocketConfiguration | null;
  // Sprint 16 — Economy Foundation, Fase 9: sinal derivado pra UI
  // mínima da Esfera da Incerteza — `true` só quando o `base_item_id`
  // do item está no BaseItemChancePool (transformation/); nunca indica
  // SE vai acontecer algo, só SE é possível tentar.
  uncertaintyEligible: boolean;
  // Sprint 18 — Mythic Foundation, Fase 6/10: "Origem" de um item —
  // `null` só quando `history` também é `null` (catálogo fixo
  // pré-Sprint 11, mesmo padrão de `legacy`); pra todo item com
  // History real, sempre um `MythicOrigin` (com `isMythic: false` pra
  // esmagadora maioria — só itens revelados pela Esfera da Incerteza
  // como `mythic_reveal` têm `isMythic: true`).
  mythicOrigin: MythicOrigin | null;
  // Sprint 19 — Base Identity, Fase 10: "adicionar apenas uma linha —
  // Base: X / Tier N / Potential: Y". `null` pra item sem
  // `base_item_id` (catálogo fixo pré-Sprint 11) ou cujo `base_item_id`
  // ainda não tem BaseIdentity registrada — mesmo padrão de
  // `uncertaintyEligible`/`mythicOrigin`, nunca inventa identidade.
  baseIdentity: BaseIdentitySummary | null;
  // Sprint 20 — Sockets & Gemas Phase I, Fase 10: nome de Gema por
  // Socket ocupado (`Socket.id` → nome exibível). `null` sempre que
  // `sockets` também é `null` OU nenhum Socket está `filled` — mesmo
  // padrão de nunca consultar `gems` sem necessidade real.
  socketGems: Record<string, string> | null;
  // Sprint 21 — Gem Effects Phase I, Fase 8: descrição do efeito por
  // Socket ocupado (`Socket.id` → "Ataque +5%", etc.) — só presente
  // quando a Gema socketada tem um `GemEffect` real (`effectId`
  // resolvido); mesmo padrão de `null` de `socketGems`.
  socketGemEffects: Record<string, string> | null;
}

export interface InventoryItem extends PersistedItemFields {
  id: number;
  item_id: number;
  slug: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  slot: ItemSlot;
  min_level: number;
  is_equipped: boolean;
  equipped_slot: ItemSlot | null;
  obtained_at: string;
  // Sprint Equipment Experience — colunas já existentes desde a Sprint
  // Character Attributes Schema (items.damage_type/uti_bonus), nunca
  // enviadas pela API até agora.
  damage_type: DamageType;
  uti_bonus: number;
  // Blacksmith Phase I — items.power_score já existia (Item Generator
  // procedural), nunca exposto pela API. `null` para o catálogo fixo
  // (itens sem Power Score não são elegíveis para melhoria do Ferreiro).
  power_score: number | null;
  upgrade_level: number;
}

export interface EquippedItem extends PersistedItemFields {
  slot: ItemSlot;
  character_item_id: number;
  // Sprint 21 — Gem Effects Phase I: `items.id` (o catalog real, mesmo
  // campo que `InventoryItem.item_id` já expõe) — necessário pra
  // consultar `gems.socketed_item_id` a partir de um EquippedItem fora
  // do escopo de `parsePersistedItemFields` (drop.service.ts), que já
  // tinha acesso direto à linha crua e nunca precisou deste campo até
  // agora. Nunca confundir com `character_item_id` (a posse do
  // personagem, `character_items.id`) — são chaves de tabelas
  // diferentes.
  item_id: number;
  name: string;
  rarity: ItemRarity;
  // Sprint Identity & Progression — mesmas colunas já expostas em
  // InventoryItem, agora também na lista de equipados (nenhum dado novo,
  // só reaproveitado aqui para mostrar atributos/bônus no perfil).
  damage_type: DamageType;
  uti_bonus: number;
  // Blacksmith Phase I — necessário para calcular custo/resultado de
  // melhoria sem uma segunda consulta.
  min_level: number;
  power_score: number | null;
  upgrade_level: number;
}

export interface RankingEntry {
  position: number;
  character_id: string;
  display_name: string;
  level: number;
  xp: number;
  total_minutes: number;
  avatar_url: string | null;
  // Sprint Founder Identity & Prestige — título/moldura equipados, só
  // para exibição (nunca afeta posição/XP/ordenação do ranking).
  title_name: string | null;
  frame_tier: FrameTier | null;
  // Sprint Kingdom Prestige System — ícones dos cargos do Reino que este
  // personagem ocupa hoje (Etapa 7). Só populado quando o Ranking está
  // filtrado por canal — cargo é um conceito de Reino, não existe versão
  // "global" (mesmo motivo pelo qual channel pode ser null acima).
  role_icons: string[];
}

export interface RankingResponse {
  channel: string | null;
  entries: RankingEntry[];
  my_position: number | null;
}

export interface OverlayViewer {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  percent: number;
  avatar_url: string | null;
  equipped_weapon: string | null;
  // Sprint Expedition System — resumo compacto, mesmo formato usado no
  // overlay (Etapa 9): região atual + estado + progresso. Null quando o
  // personagem ainda não tem nenhuma expedição.
  expedition: ExpeditionCompact | null;
  // Sprint Founder Identity & Prestige — título equipado, mostrado
  // abaixo do nome (Etapa 4), nunca ocupando muito espaço.
  title_name: string | null;
}

export interface OverlayResponse {
  channel: string;
  viewers: OverlayViewer[];
  total: number;
  updated_at: string;
  // Sprint Kingdom Prestige System, Etapa 5 — só os cargos mais
  // importantes (Guardião + Campeão dos Bosses), nunca os 6, "sem
  // poluir" o overlay. Vazio quando nenhum dos dois tem ocupante ainda.
  hall_of_fame_highlights: KingdomHallOfFameSlot[];
}

// Sprint Boss Experience — leitura pública, mesmo espírito de
// OverlayResponse. "Nome" do Boss não existe em nenhuma coluna do
// schema (docs/reviews/boss-experience-review.md) — tier é o único
// identificador real, nunca um nome inventado.
export interface BossParticipantSummary {
  character_id: string;
  display_name: string;
}

export interface BossRewardSummary {
  character_id: string;
  display_name: string;
  xp_granted: number;
  item_name: string | null;
  item_rarity: string | null;
}

export type BossStatus = "awaiting" | "active" | "defeated" | "escaped";

export interface BossStateSnapshot {
  active: boolean;
  status: BossStatus | null;
  tier: number | null;
  current_hp: number | null;
  max_hp: number | null;
  ends_at: number | null;
  resolved_at: number | null;
  participant_count: number;
  participants: BossParticipantSummary[];
  rewards: BossRewardSummary[] | null;
}

export interface StreamerDashboard {
  channel: StreamerChannel;
  active_viewers: number;
  total_viewers: number;
  overlay_url: string;
  ranking_preview: RankingEntry[];
}

// Sprint World Simulation — contratos HTTP puramente de leitura, mesmo
// espírito de BossStateSnapshot: nenhum campo aqui é inventado, cada um
// mapeia direto para uma leitura real (Engine em memória ou agregado de
// banco) feita em world-state.service.ts.
export interface TimelineEvent {
  id: string;
  text: string;
  timestamp: number;
}

// Sprint Kingdom News (MVP) — mesmo espírito de TimelineEvent (nenhum
// campo inventado, buffer em memória no backend), só com um `icon`
// próprio: a Timeline embute o ícone no texto quando existe, o Jornal
// sempre tem um campo separado (Interface pedida: "horário, ícone,
// texto").
export interface KingdomNewsItem {
  id: string;
  icon: string;
  text: string;
  timestamp: number;
}

export interface WorldPanel {
  server_time: number;
  current_tick: number;
  current_tick_timestamp: number;
  players_online: number;
  bosses_active_now: number;
  last_event: TimelineEvent | null;
}

export interface KingdomState {
  players_active: number;
  bosses_active_now: number;
  bosses_defeated_total: number;
  gold_in_circulation: number;
  // Sprint Expedition System — Exploração deixou de ser um placeholder
  // ("exploration_available: false") assim que expedições reais
  // passaram a existir.
  expeditions_active: number;
}

export interface KingdomStats {
  adventurers_total: number;
  bosses_defeated_total: number;
  items_found_total: number;
}

export interface RegionVisitSummary {
  region_id: string;
  region_name: string;
  visits: number;
}

export type ExpeditionStatus = "preparing" | "exploring" | "combating" | "resting" | "returning" | "completed";

// Sprint Expedition Choice Phase III — Meaningful Consequences. Mesma
// opção binária já existente no cliente (Phase I/II, lib/expeditionChoice.ts),
// agora compartilhada com o backend: ExpeditionSystem usa isto para
// enviesar levemente (3-8 pontos percentuais) a geração de Encounters
// durante "exploring" — nunca uma classe/skill, só uma leve inclinação
// estatística sobre Encounters que já existiam.
export type ExpeditionApproach = "investigate" | "continue";

// Sprint Encounter System — categorias já existentes em
// docs/world-design/random-events.md (consolidadas nas 8 já propostas
// pela própria Sprint), nunca uma taxonomia nova.
export type EncounterCategory =
  | "natureza"
  | "combate"
  | "descoberta"
  | "descanso"
  | "misterio"
  | "comercio"
  | "clima"
  | "ruinas";

export interface EncounterSummary {
  category: EncounterCategory;
  icon: string;
  text: string;
}

export interface ExpeditionCompact {
  region_name: string;
  status: ExpeditionStatus;
  progress_percent: number;
  encounter: EncounterSummary | null;
  // Sprint Expedition Consequences Phase I — mesmo campo já exposto em
  // ExpeditionResponse abaixo, aqui também cobrindo Overlay/Landing
  // Preview (que reaproveitam ExpeditionCompact). Sempre opcional/null:
  // nenhuma expedição antiga quebra, nenhum viewer sem escolha muda de
  // comportamento.
  approach: ExpeditionApproach | null;
}

export interface ExpeditionResponse {
  id: string;
  origin_region_id: string;
  origin_region_name: string;
  destination_region_id: string;
  destination_region_name: string;
  current_region_id: string;
  current_region_name: string;
  status: ExpeditionStatus;
  progress_percent: number;
  encounter: EncounterSummary | null;
  estimated_seconds_remaining: number;
  started_at: string;
  // Sprint Expedition Consequences Phase I — mesma abordagem já
  // persistida no backend (Phase III), agora exposta pro cliente poder
  // reutilizá-la fora do ExpeditionPanel (CreatureReader, BookReader,
  // etc. — nenhum deles tem acesso ao estado local do painel).
  approach: ExpeditionApproach | null;
}

export interface RegionEncounterSummary {
  region_id: string;
  region_name: string;
  count: number;
}

export interface CategoryEncounterSummary {
  category: EncounterCategory;
  icon: string;
  count: number;
}

export interface KingdomEncounterEvent {
  id: string;
  region_name: string;
  encounter: EncounterSummary;
  timestamp: number;
}

export interface EncounterStats {
  recent: KingdomEncounterEvent[];
  most_active_regions: RegionEncounterSummary[];
  most_common_categories: CategoryEncounterSummary[];
}

export interface WorldStateResponse {
  panel: WorldPanel;
  kingdom: KingdomState;
  most_visited_regions: RegionVisitSummary[];
  encounter_stats: EncounterStats;
  stats: KingdomStats;
  timeline: TimelineEvent[];
  idle_flavor: string;
  // Sprint Kingdom News (MVP) — "Jornal do Reino", buffer próprio e
  // separado da Timeline (nunca a mesma lista, nunca os mesmos textos).
  news: KingdomNewsItem[];
  // Sprint Kingdom Events (MVP) — evento ambiental do dia, igual para
  // todo o Reino, nunca afeta gameplay.
  current_event: CurrentWorldEventResponse;
  // Sprint Kingdom Prestige System — só preenchido quando a página Mundo
  // está filtrada por canal (mesmo padrão `?channel=` já usado pelo
  // Ranking). `kingdom`/`stats` acima continuam sendo o agregado GLOBAL
  // de todo o StreamRPG (nome herdado do World Simulation, não deste
  // Reino específico) — `channel_kingdom` é o Reino de um canal só.
  channel_kingdom: ChannelKingdomState | null;
}

// Sprint Founder Identity & Prestige — puramente cosmético (Etapa 1-3).
// Nenhum campo aqui concede XP/Gold/poder.
export type FrameTier = "bronze" | "prata" | "ouro" | "fundador" | "alpha" | "evento";

export interface TitleSummary {
  id: number;
  slug: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface FrameSummary {
  id: number;
  slug: string;
  name: string;
  tier: FrameTier;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface IdentityProfile {
  equipped_title: { id: number; name: string; description: string } | null;
  equipped_frame: { id: number; name: string; tier: FrameTier } | null;
  titles: TitleSummary[];
  frames: FrameSummary[];
  created_at: string;
  first_expedition_at: string | null;
  bosses_defeated: number;
  regions_discovered: number;
}

// Sprint Kingdom Prestige System — identidade coletiva de um canal
// (Reino), nunca do personagem. Diferente de Título/Moldura (Founder
// Identity), um cargo pode trocar de dono — não é um desbloqueio
// permanente. Nenhum campo aqui concede XP/Gold/poder de combate.
export type KingdomRoleSlug =
  | "guardiao"
  | "campeao-bosses"
  | "grande-explorador"
  | "heroi-reino"
  | "membro-antigo"
  | "maior-sequencia";

export interface KingdomRoleDefinition {
  slug: KingdomRoleSlug;
  name: string;
  icon: string;
}

// Catálogo fixo de 6 cargos (Etapa 2). Crescer o catálogo no futuro é só
// adicionar uma linha aqui + um critério de cálculo em
// kingdom-prestige.service.ts, nunca uma migração de schema (mesma
// extensibilidade já obtida para Títulos/Molduras).
export const KINGDOM_ROLE_CATALOG: KingdomRoleDefinition[] = [
  { slug: "guardiao", name: "Guardião do Reino", icon: "👑" },
  { slug: "campeao-bosses", name: "Campeão dos Bosses", icon: "⚔" },
  { slug: "grande-explorador", name: "Grande Explorador", icon: "🗺" },
  { slug: "heroi-reino", name: "Herói do Reino", icon: "⭐" },
  { slug: "membro-antigo", name: "Membro Mais Antigo", icon: "📅" },
  { slug: "maior-sequencia", name: "Maior Sequência", icon: "🔥" },
];

export interface KingdomRoleHolder {
  character_id: string;
  display_name: string;
  avatar_url: string | null;
  held_since: string;
}

export interface KingdomHallOfFameSlot {
  role: KingdomRoleSlug;
  role_name: string;
  icon: string;
  holder: KingdomRoleHolder | null;
}

export interface KingdomPrestigeBreakdown {
  total_xp: number;
  bosses_defeated: number;
  members_count: number;
  total_minutes_watched: number;
  regions_discovered: number;
}

// Fórmula ilustrativa (mesma honestidade de todo número não calibrado do
// projeto): soma ponderada de dados reais, nunca editada manualmente
// (Etapa 1). Pesos podem mudar no futuro sem afetar nenhuma regra de
// jogo — Prestígio nunca alimenta XP/Gold/Combate, só o contrário seria
// verdade (Etapa 8: features futuras consumindo este score).
export interface KingdomPrestige {
  score: number;
  breakdown: KingdomPrestigeBreakdown;
}

export interface KingdomAchievement {
  id: string;
  text: string;
  timestamp: number;
}

export interface ChannelKingdomState {
  channel: string;
  channel_display_name: string;
  prestige: KingdomPrestige;
  hall_of_fame: KingdomHallOfFameSlot[];
  recent_achievements: KingdomAchievement[];
}

// Sprint Kingdom Chronicles (MVP) — o "Livro" permanente de um
// personagem. Ao contrário de TimelineEvent/KingdomNewsItem (buffers em
// memória, perdidos a cada reinício do servidor), cada entrada aqui é
// definitiva — persistida em character_chronicles.
export interface ChronicleEntryResponse {
  id: number;
  icon: string;
  title: string;
  text: string;
  created_at: string;
}

export interface ChronicleResponse {
  entries: ChronicleEntryResponse[];
}

// Sprint Kingdom Events (MVP) — camada puramente ambiental: um evento
// "do dia", igual para todo o Reino, trocado uma vez por dia (nunca
// concede XP/Gold/item, nunca altera gameplay).
export type WorldEventCategory =
  | "clima"
  | "celebracoes"
  | "reino"
  | "militar"
  | "natureza"
  | "cidade"
  | "cultura"
  | "taverna"
  | "misterios";

export interface CurrentWorldEventNpcComment {
  npc_name: string;
  npc_icon: string;
  text: string;
}

export interface CurrentWorldEventResponse {
  name: string;
  icon: string;
  description: string;
  duration_label: string;
  category: WorldEventCategory;
  seconds_remaining: number;
  npc_comment: CurrentWorldEventNpcComment | null;
}
