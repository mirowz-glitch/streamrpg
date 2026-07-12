import { useEffect, useState } from "react";
import type { InventoryItem } from "@streamrpg/shared";
import { api } from "../../lib/api";
import { RARITY_COLOR, RARITY_LABEL } from "../../lib/rarity";
import { isFlagSet, setFlag } from "../../lib/onboarding";
import { SLOT_LABEL } from "../../pages/InventoryPage";
import { DEFAULT_POLL_MS } from "../../lib/pollIntervals";

// Sprint New Player Journey — apresentação especial na primeira vez que
// o jogador tem QUALQUER item (reaproveita /api/items, já existente;
// nenhuma mudança em Drop/Economy). Mostrado uma única vez — não altera
// o que o Drop concede, só celebra o que ele já concedeu.
//
// Sprint First 120 Seconds — como todo personagem novo já nasce com
// "Luvas Rasgadas" equipada (FirstItemQuestSystem), este card passa a
// ser, na prática, o momento em que a missão "equipar seu primeiro item"
// vira visível. Reaproveitado tal como já era — só ganhou a fala do
// Eldrin logo abaixo, no mesmo card, em vez de um componente novo.
//
// Sprint First WOW Moment (Phase I) — Borin comenta logo abaixo do
// Eldrin, no mesmo card. Nenhuma recompensa nova: só personalidade.
//
// Sprint Gameplay Feel 01 (Item Drops precisam ser emocionantes) — antes
// desta Sprint, só o PRIMEIRO item da vida do jogador tinha qualquer
// celebração (o card acima); todo drop seguinte era 100% invisível —
// `PingResponse.drop` está permanentemente `null` desde a migração da
// XP pro Engine assíncrono (débito já registrado), então o aviso
// "Drop: X" que existia em CharacterPage nunca dispara de verdade.
// Reaproveita a MESMA técnica de watermark já usada em
// InventoryPage.tsx (SEEN_WATERMARK_KEY) — só com chave própria,
// deliberadamente separada, pra não alterar o comportamento do badge
// "NOVO" do Inventário (fora do escopo desta Sprint). Reaproveita
// também o mesmo poll de 5s já usado por useExpedition/useBossState
// (DEFAULT_POLL_MS) e a mesma caixa visual (.first-item-card) já usada
// acima, só com a cor da borda ajustada pela raridade real do item —
// nenhuma classe CSS nova, nenhum componente novo, nenhum popup.
const DROP_TOAST_WATERMARK_KEY = "streamrpg_drop_toast_watermark";
const TOAST_DURATION_MS = 4000;

export function FirstItemCard() {
  const [firstItem, setFirstItem] = useState<InventoryItem | null>(null);
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_item_announced"));

  useEffect(() => {
    if (isFlagSet("first_item_announced")) return;
    void api
      .get<{ items: InventoryItem[] }>("/api/items")
      .then((data) => {
        if (data.items.length === 0) return;
        const earliest = [...data.items].sort((a, b) => a.id - b.id)[0];
        setFirstItem(earliest);
      })
      .catch(() => undefined);
  }, []);

  // Fila de novos drops detectados desde a última checagem — mostrados
  // um de cada vez, sem bloquear nada, sem botão, some sozinho.
  const [queue, setQueue] = useState<InventoryItem[]>([]);
  const [current, setCurrent] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (!dismissed) return; // só começa a vigiar depois do primeiro item já anunciado
    let cancelled = false;

    function load() {
      void api
        .get<{ items: InventoryItem[] }>("/api/items")
        .then((data) => {
          if (cancelled || data.items.length === 0) return;
          const maxId = Math.max(...data.items.map((i) => i.id));
          const stored = localStorage.getItem(DROP_TOAST_WATERMARK_KEY);

          if (stored === null) {
            // Primeira checagem desta funcionalidade: estabelece a
            // referência sem celebrar nada — evita falso positivo para
            // quem já tinha itens antes desta Sprint existir.
            localStorage.setItem(DROP_TOAST_WATERMARK_KEY, String(maxId));
            return;
          }

          const watermark = Number(stored);
          if (maxId <= watermark) return;

          const newItems = data.items.filter((i) => i.id > watermark).sort((a, b) => a.id - b.id);
          if (newItems.length === 0) return;

          localStorage.setItem(DROP_TOAST_WATERMARK_KEY, String(maxId));
          setQueue((prev) => [...prev, ...newItems]);
        })
        .catch(() => undefined);
    }

    load();
    const id = window.setInterval(load, DEFAULT_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [dismissed]);

  // Avança a fila assim que não há item "atual" sendo exibido.
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
  }, [current, queue]);

  // Auto-esconde o item atual depois de alguns segundos.
  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setCurrent(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  return (
    <>
      {!dismissed && firstItem ? (
        <div className="card first-item-card">
          <p className="landing-example-tag">Seu primeiro equipamento</p>
          <strong style={{ color: RARITY_COLOR[firstItem.rarity], fontSize: "1.2rem" }}>{firstItem.name}</strong>
          <span className="hint">{RARITY_LABEL[firstItem.rarity]}</span>
          <p className="item-desc">{firstItem.description}</p>
          <p className="hint">🧙 Eldrin: "Nada mal. Agora pelo menos você consegue machucar um pão."</p>
          <p className="hint">🛠️ Borin: "Já vi gente lutar pior equipada. Também já vi gente morrer melhor equipada."</p>
          <button
            type="button"
            onClick={() => {
              setFlag("first_item_announced");
              setDismissed(true);
            }}
          >
            Guardar no inventário
          </button>
        </div>
      ) : null}
      {current ? (
        <div className="card first-item-card" style={{ borderColor: RARITY_COLOR[current.rarity] }}>
          <p className="landing-example-tag">Novo item!</p>
          <strong style={{ color: RARITY_COLOR[current.rarity], fontSize: "1.2rem" }}>{current.name}</strong>
          <span className="hint">
            {RARITY_LABEL[current.rarity]} · {SLOT_LABEL[current.slot]}
          </span>
        </div>
      ) : null}
    </>
  );
}
