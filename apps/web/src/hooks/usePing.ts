import { useCallback, useEffect, useRef, useState } from "react";
import type { PingResponse } from "@streamrpg/shared";
import { PING_COOLDOWN_MS } from "@streamrpg/shared";
import { api } from "../lib/api";

const CHANNEL_KEY = "streamrpg_channel";

export function getStoredChannel(): string {
  return localStorage.getItem(CHANNEL_KEY) ?? "";
}

export function setStoredChannel(channel: string): void {
  localStorage.setItem(CHANNEL_KEY, channel.toLowerCase());
}

// Lê o parâmetro ?canal= da URL e salva automaticamente, se existir
function applyChannelFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("canal");
  if (fromUrl && fromUrl.trim()) {
    setStoredChannel(fromUrl.trim());
  }
}

export function usePing(enabled = true, channel?: string) {
  const [lastPing, setLastPing] = useState<PingResponse | null>(null);
  const [cooldownMs, setCooldownMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  // Aplica o canal da URL uma única vez, antes de calcular o canal ativo
  useEffect(() => {
    applyChannelFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChannel = channel || getStoredChannel();

  const ping = useCallback(async () => {
    if (!activeChannel) {
      setError("Informe o canal da live (login Twitch do streamer)");
      return null;
    }
    setError(null);
    const result = await api.post<PingResponse>("/api/ping", { channel: activeChannel });
    setLastPing(result);
    if (result.xp_gained > 0) {
      setCooldownMs(PING_COOLDOWN_MS);
    } else if (result.cooldown_seconds > 0) {
      setCooldownMs(result.cooldown_seconds * 1000);
    } else {
      setCooldownMs(30000);
    }
    return result;
  }, [activeChannel]);

  useEffect(() => {
    if (cooldownMs <= 0) return;
    timerRef.current = window.setInterval(() => {
      setCooldownMs((ms) => Math.max(0, ms - 1000));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [cooldownMs]);

  useEffect(() => {
    if (!enabled || !activeChannel) return;
    void ping().catch((err) => {
      setError(err instanceof Error ? err.message : "Ping failed");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, activeChannel]);

  useEffect(() => {
    if (!enabled ||
