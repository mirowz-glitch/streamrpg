import { useEffect, useRef, useState } from "react";
import type { ExpeditionApproach, InventoryItem, ItemSlot } from "@streamrpg/shared";
import { getItemPower, getCombatAttributes, POTENTIAL_LABEL } from "@streamrpg/shared";
import { api } from "../lib/api";
import { AppNav } from "../components/ui/AppNav";
import { Feedback } from "../components/ui/Feedback";
import { BackpackNarrativePanel } from "../components/ui/BackpackNarrativePanel";
import { RARITY_COLOR } from "../lib/rarity";
import { SLOT_LABEL, SLOT_ORDER } from "../lib/itemSlots";
import { getItemRelated } from "../lib/knowledgeLinks";
import { useCharacter } from "../hooks/useCharacter";
import { useIdentity } from "../hooks/useIdentity";
import { useKingdomRole } from "../hooks/useKingdomRole";
import { getStoredChannel } from "../hooks/usePing";
import { buildPlayerFacts } from "../lib/playerFacts";
import { getCharacterStage, STAGE_INVENTORY_HINT } from "../lib/characterPresence";
import { buildCollectionInsightContext, getInventoryInsight } from "../lib/collectionInsights";
import { getItemIdentityLine } from "../lib/itemIdentity";
import { getItemDiscoveryCandidates } from "../lib/discoveryChains";
import { getItemNpcThreadCandidates } from "../lib/knowledgeThreads";
import { getNextSteps } from "../lib/knowledgeNetwork";
import { useExpedition } from "../hooks/useExpedition";
import { buildExpeditionEchoContext } from "../lib/expeditionEchoes";

// Sprint Equipment Experience — watermark de "visto" fica só no navegador
// (localStorage), sem nenhuma coluna/tabela nova. Mesmo padrão já sugerido
// na Player Visibility Review para o delta de Ranking.
const SEEN_WATERMARK_KEY = "streamrpg_inventory_seen_watermark";

function sumPower(rarity: InventoryItem["rarity"], slot: ItemSlot): number {
  const power = getItemPower(rarity, slot);
  return power.attack + power.defense;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<number>>(new Set());

  // Capturado uma vez, no mount — fica estável durante toda a visita,
  // para as tags "NOVO" não sumirem sozinhas enquanto o jogador olha a
  // página. A próxima visita (novo mount) já lê o valor atualizado.
  const seenWatermarkRef = useRef<number>(Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0));

  // Sprint Character Evolution Presence Phase I — mesmos dados já
  // buscados em CharacterPage/CityPage/Crônicas, só reaproveitados aqui
  // pra uma mensagem discreta conforme o estágio de evolução.
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || undefined, true);
  // Sprint Expedition Discovery Phase IV (Knowledge Rewards) — mesmo
  // hook já usado por CityPage/ExpeditionPanel; aqui só pra saber o
  // Approach ativo, nunca pra exibir a Expedição em si nesta página.
  const { expedition } = useExpedition(true);
  const echoContext = buildExpeditionEchoContext(expedition);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.get<{ items: InventoryItem[] }>("/api/items");
      setItems(data.items);
      if (data.items.length > 0) {
        const maxId = Math.max(...data.items.map((i) => i.id));
        const stored = Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0);
        if (maxId > stored) {
          localStorage.setItem(SEEN_WATERMARK_KEY, String(maxId));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isNew(item: InventoryItem): boolean {
    return item.id > seenWatermarkRef.current && !acknowledgedIds.has(item.id);
  }

  function getEquippedInSlot(slot: ItemSlot): InventoryItem | null {
    return items.find((i) => i.is_equipped && i.equipped_slot === slot) ?? null;
  }

  // Etapa 2 — "⬆ Melhor disponível": qual item não-equipado, dentro do
  // mesmo slot, tem o maior poder entre TODOS os itens do slot (não só
  // "melhor que o equipado", o melhor de todos). Mesmo cálculo de poder
  // já usado (getItemPower), nenhuma fórmula nova.
  function getBestAvailableIdBySlot(): Record<string, number> {
    const bySlot: Record<string, InventoryItem[]> = {};
    for (const item of items) {
      (bySlot[item.slot] ??= []).push(item);
    }
    const best: Record<string, number> = {};
    for (const [slot, slotItems] of Object.entries(bySlot)) {
      let bestItem: InventoryItem | null = null;
      let bestPower = -1;
      for (const item of slotItems) {
        const power = sumPower(item.rarity, item.slot);
        if (power > bestPower) {
          bestPower = power;
          bestItem = item;
        }
      }
      if (bestItem && !bestItem.is_equipped) {
        best[slot] = bestItem.id;
      }
    }
    return best;
  }

  async function equip(characterItemId: number) {
    setMessage(null);
    const itemToEquip = items.find((i) => i.id === characterItemId);
    const previousEquipped = itemToEquip ? getEquippedInSlot(itemToEquip.slot) : null;
    try {
      await api.post("/api/items/equip", { character_item_id: characterItemId });
      setAcknowledgedIds((prev) => new Set(prev).add(characterItemId));
      setMessage(buildEquipFeedback(itemToEquip, previousEquipped));
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao equipar");
    }
  }

  async function unequip(slot: ItemSlot) {
    setMessage(null);
    try {
      const data = await api.post<{ items: InventoryItem[] }>("/api/items/unequip", { slot });
      setItems(data.items);
      setMessage("Item desequipado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao desequipar");
    }
  }

  function renderPower(item: InventoryItem) {
    const power = getItemPower(item.rarity, item.slot);
    if (item.slot === "weapon") {
      return `ATQ ${power.attack}`;
    }
    return `DEF ${power.defense}`;
  }

  const bestAvailableBySlot = getBestAvailableIdBySlot();

  // Backpack Experience Phase I — Fase 4 ("Organização Natural"):
  // agrupamento por SLOT continua exatamente igual a antes (nenhuma
  // regra de exibição por item mudou) — só passou a ser aplicado a
  // DUAS listas separadas (equipados primeiro, resto depois) em vez de
  // uma lista só. `renderItemGroups` é a MESMA lógica de antes extraída
  // pra uma função, reaproveitada pelas duas seções — nenhuma
  // duplicação do bloco de JSX do item.
  function renderItemGroups(itemsForGroups: InventoryItem[]) {
    const grouped: Partial<Record<ItemSlot, InventoryItem[]>> = {};
    for (const item of itemsForGroups) {
      (grouped[item.slot] ??= []).push(item);
    }
    return SLOT_ORDER.filter((slot) => grouped[slot]?.length).map((slot) => (
      <div key={slot} className="inventory-group">
        <h3 className="inventory-group-title">{SLOT_LABEL[slot]}</h3>
        <ul className="inventory-list">
          {grouped[slot]!.map((item) => {
            const equippedInSlot = getEquippedInSlot(item.slot);
            return (
              <li key={item.id} className={`inventory-item rarity-border-${item.rarity}`}>
                <div>
                  <strong style={{ color: RARITY_COLOR[item.rarity] ?? "#fff" }}>{item.name}</strong>
                  {item.is_equipped ? <span className="badge-equipped">EQUIPADO</span> : null}
                  {isNew(item) ? <span className="badge-new">NOVO</span> : null}
                  {bestAvailableBySlot[item.slot] === item.id ? <span className="badge-best">⬆ Melhor disponível</span> : null}
                  <div className="item-meta">
                    {item.rarity} · {item.slot} · nv. {item.min_level} · {renderPower(item)}
                    {item.damage_type === "magic" ? " · mágico" : ""}
                    {item.is_equipped ? ` · equipado (${item.equipped_slot})` : ""}
                  </div>
                  {!item.is_equipped ? <div className="item-compare">{renderComparisonDetail(item, equippedInSlot)}</div> : null}
                  <p className="item-desc">{item.description}</p>
                  {renderItemOrigin(item)}
                  {renderItemIdentity(item)}
                  {renderNextStep(item, echoContext.approach)}
                  {renderItemLegacy(item)}
                  {renderItemSockets(item)}
                  {renderUncertaintyHint(item)}
                  {renderMythicOrigin(item)}
                  {renderBaseIdentity(item)}
                </div>
                <div className="item-actions">
                  {item.is_equipped ? (
                    <button onClick={() => void unequip(item.slot)}>Desequipar</button>
                  ) : (
                    <button onClick={() => void equip(item.id)}>Equipar</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  }

  const equippedItems = items.filter((item) => item.is_equipped);
  const restItems = items.filter((item) => !item.is_equipped);

  // Sprint Collections & Discovery Phase I — espaços de equipamento
  // preenchidos, via a camada central (lib/collectionInsights.ts).
  const collectionInsight = getInventoryInsight(
    buildCollectionInsightContext({ equippedSlotCount: equippedItems.length }),
  );

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Inventário</h1>
        {character && identity ? (
          <p className="hint">
            {STAGE_INVENTORY_HINT[getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles))]}
          </p>
        ) : null}
        {collectionInsight ? <p className="hint">{collectionInsight}</p> : null}
        {message ? <Feedback kind="notice">{message}</Feedback> : null}
        {loading ? (
          <p className="loading-state">Carregando inventário...</p>
        ) : !identity ? (
          // Player Feedback & Retention — Vertical Slice Phase I — Fase 6
          // (Inventory Consistency): sem login, `/api/items` nunca
          // retorna os itens de verdade — a tela antiga mostrava "vazio"
          // igual a quem realmente não tinha nada, escondendo a causa
          // real (achado #4 do playtest anterior). Mesmo padrão de
          // CharacterPage pra esse caso.
          <div className="empty-state">
            <p>Faça login para ver seu inventário.</p>
            <p className="hint">Os itens que você encontra jogando a Aventura ficam aqui depois de entrar com sua conta.</p>
          </div>
        ) : (
          <>
            {/* Backpack Experience Phase I — Fase 2/3/5: acima de tudo,
                de propósito ("seção superior", pedido literal do brief).
                Consome só o Estado Global (useAdventureSession) — nunca
                a lista persistida abaixo, exceto pra passar a CONTAGEM
                real (itemCount) que os sinais de capacidade (Fase 5)
                precisam. Isolado num componente próprio (ver Fase 8). */}
            <BackpackNarrativePanel itemCount={items.length} />

            {items.length === 0 ? (
              // Fase 6: a frase antiga ("Continue assistindo — drops têm
              // boa chance a cada minuto de presença") era da mecânica
              // antiga de espectador passivo — não tem nenhuma relação
              // com o fluxo atual (jogar a Aventura). Corrigido pra
              // descrever o que realmente concede itens hoje.
              <div className="empty-state">
                <p>Seu inventário está vazio.</p>
                <p className="hint">Jogue uma Aventura para encontrar seus primeiros equipamentos.</p>
              </div>
            ) : (
              <>
                {equippedItems.length > 0 ? (
                  <section className="inventory-section">
                    <h2 className="inventory-section-title">Equipados</h2>
                    {renderItemGroups(equippedItems)}
                  </section>
                ) : null}
                {restItems.length > 0 ? (
                  <section className="inventory-section">
                    <h2 className="inventory-section-title">Restante da Mochila</h2>
                    {renderItemGroups(restItems)}
                  </section>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// Sprint Living Knowledge — "Origem" / "Encontrado em" / "Citado por",
// só quando alguma criatura do Bestiário referencia este item (via
// `connections.itemSlug`, Sprint Content Connections). Nenhum dado
// novo: só reaproveita o que já existe em lib/knowledgeLinks.ts.
function renderItemOrigin(item: InventoryItem) {
  const related = getItemRelated(item.slug);
  if (related.length === 0) return null;
  return (
    <p className="item-origin">
      {related.map((r) => `${r.label}: ${r.value}`).join(" · ")}
    </p>
  );
}

// Sprint Item Identity Phase I — no máximo UMA observação por item,
// vinda da camada central (lib/itemIdentity.ts); nunca a descrição do
// item, sempre um dado real de outro catálogo. Reaproveita a mesma
// classe visual de renderItemOrigin (nenhum estilo novo).
function renderItemIdentity(item: InventoryItem) {
  const line = getItemIdentityLine({ slug: item.slug, name: item.name });
  if (!line) return null;
  return <p className="item-origin">{line}</p>;
}

// Sprint Discovery Chains Phase I — reaproveita o mesmo getItemRelated
// já usado em renderItemOrigin acima, fraseado como sugestão ("o que
// isto menciona") em vez de lista factual.
//
// Sprint Knowledge Threads Phase I — o NPC real que cita este item
// ("Citado por", getItemRelated), fechando uma conexão que já existia
// nos dados mas nunca virava sugestão (Discovery Chains só usava
// "Origem"/"Profissão") — "o que é parecido com isto".
//
// Sprint Knowledge Network Phase I — as duas fontes acima eram
// renderizadas como DUAS linhas separadas (renderDiscoveryChain +
// renderItemThread) — dívida eliminada: `getNextSteps` combina, remove
// repetições e decide quantos revelar (pickKnowledge, cap 1/3 por
// Approach) — uma única linha "Próximo Passo".
function renderNextStep(item: InventoryItem, approach: ExpeditionApproach | null) {
  const lines = getNextSteps([getItemDiscoveryCandidates(item.slug), getItemNpcThreadCandidates(item.slug)], approach);
  if (lines.length === 0) return null;
  return <p className="item-origin">{lines.join(" ")}</p>;
}

// Sprint 14 — Legendary Items + Legacy System, Fase 9: UI mínima,
// "Nada além disso" (brief explícito) — uma única linha compacta,
// mesmo estilo visual de renderItemOrigin/renderItemIdentity (reusa a
// classe `item-origin`, nenhum CSS novo). `item.legacy` é `null` pro
// catálogo fixo pré-Sprint 11 (sem História real) — nesse caso não
// renderiza nada, mesmo padrão já usado pelos outros `render*` acima.
// Só o título (Fase 7, quando existe) ganha destaque próprio.
function renderItemLegacy(item: InventoryItem) {
  if (!item.legacy) return null;
  const { ownerCount, bossesWitnessed, sphereEventsCount, ageInDays } = item.legacy;
  const parts = [
    `${ageInDays} dia${ageInDays === 1 ? "" : "s"} de história`,
    `${ownerCount} dono${ownerCount === 1 ? "" : "s"}`,
  ];
  if (bossesWitnessed > 0) parts.push(`${bossesWitnessed} chefe${bossesWitnessed === 1 ? "" : "s"} derrotado${bossesWitnessed === 1 ? "" : "s"}`);
  if (sphereEventsCount > 0) parts.push(`${sphereEventsCount} Esfera${sphereEventsCount === 1 ? "" : "s"} usada${sphereEventsCount === 1 ? "" : "s"}`);
  return (
    <>
      {item.legacySummary?.title ? <p className="item-legacy-title">🏺 {item.legacySummary.title}</p> : null}
      <p className="item-origin">📜 {parts.join(" · ")}</p>
    </>
  );
}

// Sprint 15 — Sockets + Gem System (Foundation), Fase 9: UI mínima,
// "○ ◐ ● ou outro indicador simples... nada de arte, redesign,
// animação" (brief explícito). Um Socket sem Gema (vazio) é ○, com
// Gema (preenchido) é ●, desabilitado é ◐ — nenhuma cor/forma/efeito
// de Gema é exibido ainda (Fase 6 não concede nenhum efeito). Mesmo
// estilo compacto de renderItemLegacy (reusa a classe `item-origin`,
// nenhum CSS novo). `item.sockets` é `null` pra todo item gerado antes
// desta Sprint — nesse caso não renderiza nada.
// Sprint 20 — Sockets & Gemas Phase I, Fase 10: "nome da Gema" além do
// indicador ○/●/◐ já existente (Sprint 15) — sem cor/forma/efeito
// (Fase 6 do Sprint 20 não concedia efeito algum ainda). `item.socketGems`
// é `null` pra todo item sem Socket `filled` (economiza a query no
// backend).
// Sprint 21 — Gem Effects Phase I, Fase 8: acrescenta a descrição do
// efeito entre parênteses quando a Gema tem um `GemEffect` real
// (`item.socketGemEffects`) — "Na Gema: Ataque +5%", texto puro, sem
// ícone/animação novos (brief explícito).
function renderItemSockets(item: InventoryItem) {
  if (!item.sockets || item.sockets.sockets.length === 0) return null;
  const indicators = item.sockets.sockets
    .map((socket) => (socket.state === "filled" ? "●" : socket.state === "disabled" ? "◐" : "○"))
    .join(" ");
  const gemLabels = item.sockets.sockets
    .filter((socket) => socket.state === "filled")
    .map((socket) => {
      const name = item.socketGems?.[socket.id];
      if (!name) return null;
      const effect = item.socketGemEffects?.[socket.id];
      return effect ? `${name} (${effect})` : name;
    })
    .filter((label): label is string => Boolean(label));
  return (
    <>
      <p className="item-origin">🔘 Sockets: {indicators}</p>
      {gemLabels.length > 0 ? <p className="item-origin">💎 Gemas: {gemLabels.join(", ")}</p> : null}
    </>
  );
}

// Sprint 17 — Esfera da Incerteza 2.0, Fase 10: UI mínima, "sem
// animações, sem efeitos" (brief explícito) — mensagem de aviso, não
// mais uma promessa de "pode revelar" (Sprint 16): agora a Esfera
// NUNCA falha, então o aviso precisa deixar claro que o resultado é
// permanente e pode ser pior, não só melhor. Mesmo estilo compacto de
// renderItemLegacy/renderItemSockets (reusa a classe `item-origin`,
// nenhum CSS novo). `uncertaintyEligible` já vem derivado da API (mesma
// infraestrutura que valida o uso real) — esta função nunca decide
// elegibilidade sozinha; itens inelegíveis (Base fora do
// BaseTransformationPool) continuam sinalizados, só com uma frase
// diferente.
function renderUncertaintyHint(item: InventoryItem) {
  return (
    <p className="item-origin">
      {item.uncertaintyEligible
        ? "⚠ Ao utilizar uma Esfera da Incerteza este Item será alterado permanentemente. O resultado pode ser melhor ou pior."
        : "🔮 Esta Base não é compatível com a Esfera da Incerteza."}
    </p>
  );
}

// Sprint 18 — Mythic Foundation, Fase 10: "Adicionar apenas: Origem.
// Nada além." — sem menção a quem foi o primeiro, sem ranking, sem
// selo especial (Discovery, Fase 5, é infraestrutura silenciosa esta
// Sprint). `item.mythicOrigin` já vem derivado da API
// (drop.service.ts, via mythic/mythicLegacy.ts) — `null`/`isMythic:
// false` pra esmagadora maioria dos itens, então esta linha só
// aparece pra um item que realmente carrega um evento
// `mythic_revealed` no History real.
function renderMythicOrigin(item: InventoryItem) {
  if (!item.mythicOrigin?.isMythic) return null;
  return <p className="item-origin">Origem: Revelado pela Esfera da Incerteza.</p>;
}

// Sprint 19 — Base Identity, Fase 10: "adicionar apenas uma linha —
// Base: Espada Longa / Tier 4 / Potential: High. Nada além." Sem
// Tags/Implicit Mods/Lore aqui (infraestrutura ainda não consumida por
// nenhuma UI real nesta Sprint) — `item.baseIdentity` já vem como o
// resumo mínimo exato que esta linha precisa (drop.service.ts).
function renderBaseIdentity(item: InventoryItem) {
  if (!item.baseIdentity) return null;
  const { displayName, tier, potential } = item.baseIdentity;
  return (
    <p className="item-origin">
      Base: {displayName} · Tier {tier} · Potential: {POTENTIAL_LABEL[potential]}
    </p>
  );
}

// Etapa 3 — comparação detalhada, nunca escondendo números. Arma: ATQ
// antes → depois, com delta. Demais slots: Resistência Física/Mágica e
// UTI, cada um com seu próprio delta.
function renderComparisonDetail(item: InventoryItem, equipped: InventoryItem | null) {
  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = equipped ? getCombatAttributes(equipped.rarity, equipped.slot, equipped.damage_type) : null;

  if (item.slot === "weapon") {
    // Cada lado rotulado com o próprio tipo — uma arma física equipada
    // nunca deve aparecer rotulada como "Mágico" só porque a candidata é
    // mágica (achado real, encontrado testando no navegador).
    const tipoNovo = next.attackMagic > next.attackPhysical ? "Mágico" : "Físico";
    const tipoAntigo = prev ? (prev.attackMagic > prev.attackPhysical ? "Mágico" : "Físico") : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? (prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical) : 0;
    const delta = novoAtq - antigoAtq;
    const mesmoTipo = tipoAntigo === tipoNovo;
    return (
      <div className="item-comparison">
        {equipped ? (
          <>
            <div className="comparison-row">
              <span>{equipped.name}</span>
              <span>ATQ {tipoAntigo} +{antigoAtq}</span>
            </div>
            <div className="comparison-arrow">↓</div>
          </>
        ) : null}
        <div className="comparison-row">
          <span>{item.name}</span>
          <span>ATQ {tipoNovo} +{novoAtq}</span>
        </div>
        {mesmoTipo ? (
          <div className={delta >= 0 ? "comparison-delta-positive" : "comparison-delta-negative"}>
            ({delta >= 0 ? "+" : ""}
            {delta})
          </div>
        ) : equipped ? (
          <div className="comparison-delta-neutral">troca de tipo — não é o mesmo eixo de dano</div>
        ) : null}
      </div>
    );
  }

  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (equipped?.uti_bonus ?? 0);
  return (
    <div className="item-comparison">
      <div>
        {deltaFisica >= 0 ? "+" : ""}
        {deltaFisica} Resistência Física
      </div>
      <div>
        {deltaMagica >= 0 ? "+" : ""}
        {deltaMagica} Resistência Mágica
      </div>
      <div>
        {deltaUti >= 0 ? "+" : ""}
        {deltaUti} UTI
      </div>
    </div>
  );
}

// Etapa 6 — feedback imediato após equipar, com os números reais do
// ganho (nunca só "Item equipado!").
function buildEquipFeedback(item: InventoryItem | undefined, previous: InventoryItem | null): string {
  if (!item) return "Item equipado!";

  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = previous ? getCombatAttributes(previous.rarity, previous.slot, previous.damage_type) : null;
  const parts = ["Equipado!"];

  if (item.slot === "weapon") {
    const tipoNovo = next.attackMagic > next.attackPhysical ? "Mágico" : "Físico";
    const tipoAntigo = prev ? (prev.attackMagic > prev.attackPhysical ? "Mágico" : "Físico") : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? (prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical) : 0;
    if (prev && tipoAntigo !== tipoNovo) {
      parts.push(`Tipo de dano mudou de ${tipoAntigo} para ${tipoNovo} · ATQ ${tipoNovo} ${novoAtq}`);
    } else {
      const delta = novoAtq - antigoAtq;
      parts.push(`ATQ ${tipoNovo} ${delta >= 0 ? "+" : ""}${delta}`);
    }
    return parts.join(" ");
  }

  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (previous?.uti_bonus ?? 0);
  if (deltaFisica !== 0) parts.push(`Resistência Física ${deltaFisica >= 0 ? "+" : ""}${deltaFisica}`);
  if (deltaMagica !== 0) parts.push(`Resistência Mágica ${deltaMagica >= 0 ? "+" : ""}${deltaMagica}`);
  if (deltaUti !== 0) parts.push(`UTI ${deltaUti >= 0 ? "+" : ""}${deltaUti}`);
  return parts.join(" · ");
}
