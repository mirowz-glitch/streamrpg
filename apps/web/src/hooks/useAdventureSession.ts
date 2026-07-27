import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import {
  CharacterBuild,
  Inventory,
  Equipment,
  createAdventureCharacter,
  createAdventureSession,
  createAdventureTimeline,
  advanceDungeonTick,
  deriveHudState,
  equipStarterKit,
  getBaseItem,
  xpForLevel,
  EQUIPMENT_SLOT_DEFINITIONS,
  getEquipmentSlotDefinition,
  IdleDriver,
  type IdleDriverStatus,
  type AdventureSession,
  type AdventureTimeline,
  type PresentationEvent,
  type FloatingNumberEvent,
  type HudState,
  type ItemGenRarityId,
  type ItemGenSlot,
  type ItemRarity,
  type ItemSlot,
} from "@streamrpg/shared";
import { api } from "../lib/api";

// Global Idle System — Architecture Refactor: intervalo real do driver
// (2.5s, valor herdado de "Idle Loop Implementation Phase I", nunca
// mudou) e frequência do polling que checa "já é hora?" (100ms, mesmo
// valor que o antigo useIdleDriver.ts já usava). Ambos migraram de
// AdventurePage.tsx pra cá porque o timer que os usa agora vive no
// singleton de módulo, não mais dentro do componente.
const IDLE_TICK_INTERVAL_MS = 2500;
const IDLE_POLL_INTERVAL_MS = 100;

const DEMO_CHARACTER_ID = "vertical-slice-hero";
const DEMO_CLASS_ID = "warrior";
const DEMO_REGION_ID = "bosque-sussurrante";
// Backpack Experience Phase I — exportado pra que a Mochila (Fase 5,
// "sinais de mochila") use a MESMA referência de capacidade que o
// motor já usa, em vez de inventar um número novo — só leitura, nunca
// um novo limite/gate (o real continua sendo decidido só por
// `Inventory` em packages/shared).
export const DEMO_INVENTORY_CAPACITY = 24;

// Vertical Slice — Persistent Player Experience Phase I — Fase 2/3: o
// motor (packages/shared, Item Generator, intocado) usa 4 raridades
// procedurais (common/magic/rare/unique); o personagem persistido
// (apps/api, tabela `items`, já existente antes desta Sprint) usa as 5
// do modelo simples (types.ts: ItemRarity) — RARITY_COLOR/getItemPower
// (ambos também intocados, "Balance" protegido) indexam por essa
// segunda lista e QUEBRARIAM (acesso a propriedade de `undefined`) se
// recebessem "magic"/"unique" direto. Este mapeamento só traduz o
// vocabulário na fronteira de persistência — nenhuma fórmula de
// Balance muda, nenhuma raridade nova é inventada.
const RARITY_TO_PERSISTED: Record<ItemGenRarityId, ItemRarity> = {
  common: "common",
  magic: "uncommon",
  rare: "rare",
  unique: "legendary",
};

// `LootDropped.rarity` (presentation/types.ts) é tipado como `string`
// solto (fronteira deliberadamente genérica da Presentation Layer) —
// este guard é só o que garante, no limite da persistência, que nunca
// indexamos RARITY_TO_PERSISTED com uma chave fora de ItemGenRarityId.
function isItemGenRarityId(value: string): value is ItemGenRarityId {
  return value in RARITY_TO_PERSISTED;
}

// Equipment Progression Repair Phase II — achado incidental corrigido:
// o Item Generator (itemgen/types.ts: ItemGenSlot) tem 8 slots
// (weapon/helmet/chest/gloves/boots/ring/amulet/belt) — nunca teve
// `ring1`/`ring2` (essa dupla é só um detalhe do outro sistema de
// Equipment de 9 slots, equipment/slots.ts, não deste). A tabela
// anterior usava essas duas chaves erradas (nunca batiam com
// `baseItem.slot`, portanto mortas) e não tinha entrada nenhuma pra
// `gloves`/`belt`, que caíam no fallback e sincronizavam com um valor
// de slot inválido pro modelo persistido — por isso Elmo/Peitoral
// pareciam nunca aparecer corretamente e tudo se misturava sob "Arma"
// no Inventário. `ItemSlot` (types.ts) agora tem os 8 slots
// correspondentes 1:1, então este mapeamento é só uma tradução de nome
// (`chest` -> `armor`), sem colisão nenhuma.
const SLOT_TO_PERSISTED: Record<ItemGenSlot, ItemSlot> = {
  weapon: "weapon",
  helmet: "helmet",
  chest: "armor",
  gloves: "gloves",
  boots: "boots",
  ring: "ring",
  amulet: "amulet",
  belt: "belt",
};

interface AdventureDemoState {
  session: AdventureSession;
  timeline: AdventureTimeline;
}

export interface AdventureTickOutcome {
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
}

// Player Feedback & Retention — Vertical Slice Phase I — Fase 3 (Loot
// Feedback): explica, em linguagem simples, por que um item encontrado
// NÃO foi equipado — achado #3 do playtest anterior ("itens aparecem,
// nenhum é equipado, sem explicação"). Puramente leitura: consulta o
// MESMO Equipment já equipado nesta sessão (getEquippedItem, API já
// existente) só pra exibir a comparação que tryAutoEquip() (Adventure
// Loop, intocado) já fez internamente — nenhuma regra de equipar/
// comparar/gerar item muda aqui, isto só NARRA uma decisão que já
// aconteceu.
export interface LootRejectedFeedback {
  instanceId: string;
  itemName: string;
  slotLabel: string;
  powerScore: number;
  currentPowerScore: number | null;
}

// `getBaseItem(baseItemId).slot` é o vocabulário do Item Generator
// (ItemGenSlot); os slots de EQUIPAMENTO (onde o item pode ir de
// verdade — ex.: Anéis têm 2 sockets) são outra tabela
// (EQUIPMENT_SLOT_DEFINITIONS, equipment/slots.ts, já existente) — o
// MESMO cruzamento que tryAutoEquip() já faz, só pra decidir quais
// slots checar, nunca pra decidir se equipa.
function findLowestEquippedPowerScoreForItemSlot(equipment: Equipment, itemSlot: string): number | null {
  const candidateSlots = EQUIPMENT_SLOT_DEFINITIONS.filter((definition) => definition.acceptsItemSlot === itemSlot);
  let lowest: number | null = null;
  for (const definition of candidateSlots) {
    const equipped = equipment.getEquippedItem(definition.id);
    const power = equipped?.powerScore ?? 0;
    if (lowest === null || power < lowest) lowest = power;
  }
  return lowest;
}

function buildLootRejectedFeedback(session: AdventureSession, events: readonly PresentationEvent[]): LootRejectedFeedback[] {
  const feedback: LootRejectedFeedback[] = [];
  for (const event of events) {
    if (event.kind !== "LootDropped") continue;
    const wasEquippedThisTick = events.some((e) => e.kind === "ItemEquipped" && e.baseItemId === event.baseItemId);
    if (wasEquippedThisTick) continue;

    const base = getBaseItem(event.baseItemId);
    if (!base) continue;
    const candidateSlots = EQUIPMENT_SLOT_DEFINITIONS.filter((definition) => definition.acceptsItemSlot === base.slot);
    const slotLabel = candidateSlots[0] ? (getEquipmentSlotDefinition(candidateSlots[0].id)?.label ?? base.slot) : base.slot;

    feedback.push({
      instanceId: event.instanceId,
      itemName: base.name,
      slotLabel,
      powerScore: event.powerScore,
      currentPowerScore: findLowestEquippedPowerScoreForItemSlot(session.character.equipment, base.slot),
    });
  }
  return feedback;
}

function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
  return total;
}

interface RealCharacterSnapshot {
  level: number;
  xp: number;
  gold: number;
}

function createSessionState(seed: number, real: RealCharacterSnapshot | null): AdventureDemoState {
  const build = new CharacterBuild(DEMO_CHARACTER_ID, DEMO_CLASS_ID, 0);
  // Fase 2/3 — Fonte Única da Verdade: o personagem da Aventura nasce
  // no XP/nível REAL do personagem persistido (GET /api/character),
  // nunca mais sempre no nível 1. `cumulativeXpForLevel` reconstrói o
  // total exato a partir de level+xp-no-nível (mesma fórmula de
  // getProgress()/xp.ts, só invertida) — nenhuma tabela de XP nova.
  if (real) build.addExperience(cumulativeXpForLevel(real.level) + real.xp);

  const inventory = new Inventory(DEMO_CHARACTER_ID, DEMO_INVENTORY_CAPACITY);
  const equipment = new Equipment(DEMO_CHARACTER_ID);
  const character = createAdventureCharacter(build, inventory, equipment);
  // Kit inicial sempre equipado client-side (mesmo já existente) — os
  // itens REAIS já equipados no modelo antigo (antes desta Sprint) não
  // têm baseItemId/afixos procedurais pra reconstruir aqui; qualquer
  // item NOVO encontrado a partir de agora passa a existir nos dois
  // lados (ver persistLoot abaixo), documentado na entrega como a
  // única lacuna restante.
  equipStarterKit(character, DEMO_CLASS_ID, seed);

  const session = createAdventureSession(`${DEMO_CHARACTER_ID}-session`, character, DEMO_REGION_ID, seed, Date.now());
  // Fase 3 — Ouro real como ponto de partida (campo mutável simples,
  // mesmo padrão que equipStarterKit já usa pra customizar o estado
  // inicial logo após a criação — nenhuma fórmula do motor muda).
  if (real) session.statistics.goldFound = real.gold;
  const timeline = createAdventureTimeline(session.sessionId);

  return { session, timeline };
}

async function fetchRealCharacter(): Promise<RealCharacterSnapshot | null> {
  try {
    const character = await api.get<{ level: number; xp: number; gold: number }>("/api/character");
    return { level: character.level, xp: character.xp, gold: character.gold };
  } catch {
    return null;
  }
}

// Fase 4 — Persistência dos Eventos: cada item encontrado vira uma
// chamada a POST /api/items/loot (grantAdventureLoot, reaproveita
// items/character_items já existentes); XP/ouro são sincronizados por
// DELTA (characterBuild.experience/statistics.goldFound já são o total
// corrente do motor — comparado contra o último valor sincronizado,
// nunca reconstruído a partir de eventos individuais, mais simples e
// robusto com múltiplas fontes de XP/ouro por tick).
async function persistTick(session: AdventureSession, events: PresentationEvent[], lastSynced: { xp: number; gold: number }): Promise<void> {
  const currentXp = session.character.characterBuild.experience;
  const currentGold = session.statistics.goldFound;

  const xpDelta = currentXp - lastSynced.xp;
  const goldDelta = currentGold - lastSynced.gold;
  lastSynced.xp = currentXp;
  lastSynced.gold = currentGold;

  const requests: Promise<unknown>[] = [];
  if (xpDelta > 0) requests.push(api.post("/api/character/adventure/xp", { amount: xpDelta }));
  if (goldDelta > 0) requests.push(api.post("/api/character/adventure/gold", { amount: goldDelta }));

  for (const event of events) {
    if (event.kind !== "LootDropped") continue;
    const baseItem = getBaseItem(event.baseItemId);
    const autoEquip = events.some((e) => e.kind === "ItemEquipped" && e.baseItemId === event.baseItemId);
    requests.push(
      api.post("/api/items/loot", {
        baseItemId: event.baseItemId,
        name: baseItem?.name ?? event.baseItemId,
        rarity: isItemGenRarityId(event.rarity) ? RARITY_TO_PERSISTED[event.rarity] : "common",
        slot: baseItem ? SLOT_TO_PERSISTED[baseItem.slot] : "weapon",
        powerScore: event.powerScore,
        autoEquip,
      }),
    );
  }

  // Fire-and-forget deliberado: a Aventura nunca deve travar esperando
  // a rede (mesmo princípio de "o motor nunca sabe que existe API") —
  // falhas de sincronização não impedem o próximo tick, só ficam sem
  // persistir (ver "Próximos Passos" na entrega sobre retry).
  await Promise.allSettled(requests);
}

interface AdventureSingleton {
  session: AdventureSession;
  timeline: AdventureTimeline;
  lastSynced: { xp: number; gold: number };
  isDemoSession: boolean;
}

// Adventure Session Persistence — RC1 Blocker Fix: `singleton` vive no
// escopo do módulo, não em um useRef de componente. `AdventurePage` é
// desmontada a cada troca de rota (router.tsx não tem layout
// persistente entre páginas-irmãs) — um useRef morre junto. Um `let`
// de módulo sobrevive a qualquer remontagem, porque o módulo JS só é
// recarregado num reload de página de verdade (F5), nunca numa
// navegação normal do React Router. Isso é EXATAMENTE a linha entre o
// que deve/não deve sobreviver: reload continua reiniciando (mesmo
// comportamento de sempre), navegação interna passa a preservar tudo.
let singleton: AdventureSingleton | null = null;
let initPromise: Promise<void> | null = null;

// Global Idle System — Architecture Refactor: "A interface nunca deverá
// controlar a simulação. A interface apenas observa e envia comandos.
// A simulação vive sozinha. Sempre." — o IdleDriver e seu setInterval
// agora vivem no MESMO escopo de módulo que `singleton` (não mais
// dentro de AdventurePage/useIdleDriver.ts), pelo mesmo motivo que
// `session`/`timeline` vieram pra cá na Sprint "Adventure Session
// Persistence": este módulo só é recarregado num F5 de verdade, nunca
// numa troca de rota — então o timer sobrevive a qualquer navegação.
// `subscribers` é o mecanismo de notificação: cada `useAdventureSession()`
// montado registra seu próprio `forceRender` aqui; `runGlobalTick()`
// nunca conhece React, só chama `notifySubscribers()` no final.
let idleDriverInstance: IdleDriver | null = null;
let idleTickIntervalId: ReturnType<typeof setInterval> | null = null;
const subscribers = new Set<() => void>();
let globalError: string | null = null;
let globalLootRejectedFeedback: LootRejectedFeedback[] = [];
let globalLastTickOutcome: AdventureTickOutcome | null = null;
// Registrado por quem precisa adiar um tick (hoje só AdventurePage, via
// registerIdleBlockChecker) — ex.: um banner de Level Up ainda tocando.
// O driver não sabe POR QUE está bloqueado, só respeita o sinal (mesma
// separação que o IdleDriver puro já tinha antes desta Sprint).
let externalBlockedCheck: (() => boolean) | null = null;

function buildSingleton(real: RealCharacterSnapshot | null): AdventureSingleton {
  const { session, timeline } = createSessionState(Date.now(), real);
  return {
    session,
    timeline,
    lastSynced: { xp: real ? cumulativeXpForLevel(real.level) + real.xp : 0, gold: real?.gold ?? 0 },
    isDemoSession: real === null,
  };
}

function notifySubscribers(): void {
  for (const listener of subscribers) listener();
}

// Extraído do antigo `advance()` do hook (Idle Loop Implementation
// Phase I) — mesma chamada, mesma ordem de efeitos colaterais
// (advanceDungeonTick -> feedback de loot -> persistTick fire-and-
// forget), só que lendo/escrevendo estado de MÓDULO em vez de useState
// de componente, porque agora quem chama isto é o setInterval global,
// não um onClick/onTick de um componente específico. `autoEquip: true`
// preserva o único valor que `handleAdvance()` sempre passou — Princípio
// 4 (AutoEquip não muda) fica satisfeito por nunca ter existido outra
// chamada com `false`.
function runGlobalTick(): void {
  if (!singleton) return;

  // A checagem de derrota antes pertencia ao `disabled` do botão
  // "Avançar" (removido na Sprint anterior) — sem um clique manual pra
  // gatilhar, essa responsabilidade precisa morar aqui: o próprio
  // tick-runner recusa avançar uma sessão já derrotada e para o driver.
  const hudState = deriveHudState(singleton.session, singleton.timeline);
  if (hudState.sessionStatus === "derrota") {
    idleDriverInstance?.stop();
    notifySubscribers();
    return;
  }

  try {
    const { events, floatingNumbers } = advanceDungeonTick(singleton.session, singleton.timeline, {
      autoEquip: true,
      currentTime: Date.now(),
    });
    globalLastTickOutcome = { events, floatingNumbers };
    globalError = null;
    if (events.some((event) => event.kind === "LootDropped")) {
      globalLootRejectedFeedback = buildLootRejectedFeedback(singleton.session, events);
    }
    void persistTick(singleton.session, events, singleton.lastSynced);
  } catch (caught) {
    globalError = caught instanceof Error ? caught.message : String(caught);
  }
  notifySubscribers();
}

// Fase 8 (Singleton): protegido exatamente como `ensureSingletonInit`
// já protege a sessão — se um IdleDriver já existe, a chamada é um
// no-op registrado (aviso de dev), a instância existente nunca é
// substituída. É assim que a Sprint garante "nunca dois IdleDrivers
// simultâneos" mesmo se `useAdventureSession()` acabar sendo chamado
// por mais de uma tela ao mesmo tempo no futuro (hoje só AdventurePage
// chama).
function ensureIdleDriverStarted(intervalMs: number = IDLE_TICK_INTERVAL_MS): void {
  if (idleDriverInstance) {
    console.warn(
      "[useAdventureSession] ensureIdleDriverStarted() chamado com um IdleDriver já ativo — ignorado, instância existente preservada (Fase 8, Global Idle System).",
    );
    return;
  }
  idleDriverInstance = new IdleDriver({ intervalMs });
  idleTickIntervalId = setInterval(() => {
    if (!idleDriverInstance) return;
    if (idleDriverInstance.shouldTick(Date.now(), externalBlockedCheck?.() ?? false)) {
      runGlobalTick();
    }
  }, IDLE_POLL_INTERVAL_MS);
}

// Único ponto de entrada pra quem precisa adiar um tick (ver
// `externalBlockedCheck` acima). Passar `null` desregistra — usado pelo
// cleanup de montagem/desmontagem de AdventurePage.
function registerIdleBlockChecker(checker: (() => boolean) | null): void {
  externalBlockedCheck = checker;
}

function subscribe(listener: () => void): void {
  subscribers.add(listener);
}

function unsubscribe(listener: () => void): void {
  subscribers.delete(listener);
}

// Dedupa a busca inicial: StrictMode invoca o efeito de montagem 2x
// (monta/desmonta/monta) em dev — sem este cache, a segunda invocação
// disparia um segundo fetchRealCharacter() e uma segunda criação de
// sessão antes da primeira resolver. Uma vez que `singleton` existe,
// esta função nunca mais é chamada de verdade (todo `useAdventureSession()`
// futuro cai direto no `if (singleton) return`).
//
// Global Idle System — Architecture Refactor: o boot do IdleDriver
// global acontece logo depois que o singleton nasce pela primeira vez
// — o mesmo momento em que, antes desta Sprint, `AdventurePage` criava
// sua própria instância de `useIdleDriver()`. O gatilho não mudou, só
// deixou de estar amarrado ao ciclo de vida de um componente.
function ensureSingletonInit(): Promise<void> {
  if (singleton) return Promise.resolve();
  if (!initPromise) {
    initPromise = fetchRealCharacter().then((real) => {
      singleton = buildSingleton(real);
      ensureIdleDriverStarted();
    });
  }
  return initPromise;
}

// Só para testes automatizados (useAdventureSession.test.ts) — expõe o
// singleton de módulo e o IdleDriver global sem passar pelos hooks do
// React (que exigem um renderer/DOM que este projeto não tem
// instalado). Nunca importado por código de produção.
export const __testing = {
  ensureSingletonInit,
  buildSingleton,
  getSingleton: () => singleton,
  // Só pra testes que precisam plantar uma sessão sem passar pelo fetch
  // real (ex.: testar o IdleDriver global com um intervalo curto,
  // sem esperar pelo boot automático de `ensureSingletonInit()`, que
  // sempre usa IDLE_TICK_INTERVAL_MS).
  setSingletonForTesting: (value: AdventureSingleton | null) => {
    singleton = value;
  },
  resetSingleton: () => {
    singleton = null;
    initPromise = null;
    if (idleTickIntervalId !== null) clearInterval(idleTickIntervalId);
    idleDriverInstance = null;
    idleTickIntervalId = null;
    subscribers.clear();
    globalError = null;
    globalLootRejectedFeedback = [];
    globalLastTickOutcome = null;
    externalBlockedCheck = null;
  },
  ensureIdleDriverStarted,
  getIdleDriverInstance: () => idleDriverInstance,
  getIdleTickIntervalId: () => idleTickIntervalId,
  runGlobalTick,
  subscribe,
  unsubscribe,
  getSubscriberCount: () => subscribers.size,
  notifySubscribers,
  registerIdleBlockChecker,
};

export function useAdventureSession() {
  // Só usado durante a primeiríssima carga, antes do singleton existir
  // — mesmo valor inicial que o código anterior sempre criou de
  // qualquer forma (useState lazy-init roda só 1x, nunca mais é lido
  // depois que `singleton` existe).
  const [fallback] = useState<AdventureDemoState>(() => createSessionState(Date.now(), null));
  const [renderVersion, forceRender] = useReducer((version: number) => version + 1, 0);
  const [ready, setReady] = useState(() => singleton !== null);

  // Global Idle System — Architecture Refactor: esta tela (ou qualquer
  // outra que chame `useAdventureSession()` no futuro) se inscreve pra
  // ser avisada sempre que `runGlobalTick()` rodar — mesmo estando em
  // Inventário/Personagem/Cidade, sem NENHUM IdleDriver local. É isto
  // que substitui o antigo `forceRender()` chamado diretamente de
  // dentro de `advance()`: agora quem muda o estado (o tick global) e
  // quem re-renderiza (cada tela inscrita) são desacoplados.
  useEffect(() => {
    const listener = () => forceRender();
    subscribe(listener);
    return () => unsubscribe(listener);
  }, []);

  useEffect(() => {
    if (singleton) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void ensureSingletonInit().then(() => {
      if (cancelled) return;
      setReady(true);
      notifySubscribers();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const current: AdventureDemoState = singleton ?? fallback;

  const hudState: HudState = useMemo(
    () => deriveHudState(current.session, current.timeline),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- renderVersion é a única dependência real (session/timeline são mutáveis, não re-criados); `current` muda de identidade só quando `singleton` passa de null pra um valor real, o que `ready` já cobre.
    [renderVersion, ready],
  );

  const isDemoSession = singleton?.isDemoSession ?? false;

  // Estado Global (Fase 4) — lido direto do módulo a cada render, não
  // espelhado em useState: a única forma de saber QUANDO reler é a
  // notificação de `subscribe()` acima, que já dispara um re-render via
  // `forceRender()`. Continua correto mesmo se esta tela nunca chamar
  // `advance` nenhuma vez — nenhuma destas variáveis é escrita por este
  // hook, só por `runGlobalTick()`.
  const idleStatus: IdleDriverStatus = idleDriverInstance?.getStatus() ?? "stopped";
  // "Tempo até o próximo avanço" (Fase 4) — leitura pontual no momento
  // deste render, não um cronômetro vivo: uma tela que queira mostrar
  // uma contagem regressiva em tempo real precisa do seu próprio
  // intervalo curto pra re-renderizar (decisão de apresentação, fora do
  // escopo desta Sprint — ver docs/design/living-character-phase1.md).
  const msUntilNextTick: number | null = idleDriverInstance?.msUntilNextTick(Date.now()) ?? null;

  const pauseIdle = useCallback(() => {
    idleDriverInstance?.pause();
    notifySubscribers();
  }, []);

  const resumeIdle = useCallback(() => {
    idleDriverInstance?.resume();
    notifySubscribers();
  }, []);

  const restart = useCallback(() => {
    // Reset otimista e imediato (mesma UX de sempre: o clique em
    // "Reiniciar" já mostra nível 1 na hora), substituído pelo
    // personagem real assim que a busca resolver. `idleDriverInstance
    // .start()` retoma o avanço automático da nova sessão — antes esta
    // responsabilidade era de `AdventurePage.handleRestart()` chamando
    // `idleDriver.start()` explicitamente; agora mora aqui porque
    // reiniciar sempre deve reativar a simulação, não só o estado.
    singleton = buildSingleton(null);
    globalLootRejectedFeedback = [];
    globalError = null;
    idleDriverInstance?.start();
    notifySubscribers();
    void fetchRealCharacter().then((real) => {
      singleton = buildSingleton(real);
      notifySubscribers();
    });
  }, []);

  return {
    hudState,
    error: globalError,
    restart,
    ready,
    isDemoSession,
    lootRejectedFeedback: globalLootRejectedFeedback,
    idleStatus,
    pauseIdle,
    resumeIdle,
    lastTickOutcome: globalLastTickOutcome,
    msUntilNextTick,
  };
}

// Global Idle System — Architecture Refactor: único ponto de acesso
// externo pra registrar/desregistrar o "block checker" (ver
// `externalBlockedCheck`, escopo de módulo acima) — hoje só
// `AdventurePage` usa isto, pra não cortar animações/banners longos.
export { registerIdleBlockChecker };
