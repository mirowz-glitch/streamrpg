import { useCallback, useEffect, useRef, useState } from "react";
import type { ExpeditionApproach, ExpeditionResponse } from "@streamrpg/shared";
import { api } from "../lib/api";
import { isSameData } from "../lib/compare";
import { DEFAULT_POLL_MS } from "../lib/pollIntervals";

/**
 * Sprint Expedition System — poll simples (mesmo mecanismo já usado por
 * useBossState/Overlay), sem WebSocket/SSE.
 *
 * Sprint Performance Optimization — o backend só avança expedições a
 * cada world.tick (60s); a maioria dos polls de 5s traz exatamente o
 * mesmo dado. Pular o setState quando nada mudou evita re-renderizações
 * que não mudariam nada na tela.
 */
export function useExpedition(enabled: boolean, pollMs = DEFAULT_POLL_MS) {
  const [expedition, setExpedition] = useState<ExpeditionResponse | null>(null);
  const prevRef = useRef<ExpeditionResponse | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    function load() {
      void api
        .get<{ expedition: ExpeditionResponse | null }>("/api/expedition/current")
        .then((data) => {
          if (cancelled) return;
          if (isSameData(prevRef.current, data.expedition)) return;
          prevRef.current = data.expedition;
          setExpedition(data.expedition);
        })
        .catch(() => undefined);
    }

    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollMs]);

  // Sprint Expedition Choice Phase III — Meaningful Consequences:
  // notifica o backend da abordagem escolhida (só usada por
  // ExpeditionSystem para enviesar levemente a geração de Encounters,
  // nunca lida de volta aqui — o badge visual continua vindo do
  // estado local do próprio ExpeditionPanel, Phase II inalterada).
  // "fire and forget": nenhuma UI depende da resposta, mesmo padrão já
  // usado pelo Overlay para join/leave.
  const chooseApproach = useCallback((option: ExpeditionApproach) => {
    void api.post("/api/expedition/approach", { option }).catch(() => undefined);
  }, []);

  return { expedition, chooseApproach };
}
