import {
  api
} from "./chunk-R22SVZL5.js";
import {
  PING_COOLDOWN_MS
} from "./chunk-S4O55MUY.js";
import {
  __toESM,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/usePing.ts
var import_react = __toESM(require_react(), 1);
var CHANNEL_KEY = "streamrpg_channel";
function getStoredChannel() {
  return localStorage.getItem(CHANNEL_KEY) ?? "";
}
function setStoredChannel(channel) {
  localStorage.setItem(CHANNEL_KEY, channel.toLowerCase());
}
function applyChannelFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("canal");
  if (fromUrl && fromUrl.trim()) {
    setStoredChannel(fromUrl.trim());
  }
}
function usePing(enabled = true, channel) {
  const [lastPing, setLastPing] = (0, import_react.useState)(null);
  const [cooldownMs, setCooldownMs] = (0, import_react.useState)(0);
  const [error, setError] = (0, import_react.useState)(null);
  const timerRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    applyChannelFromUrl();
  }, []);
  const activeChannel = channel || getStoredChannel();
  const ping = (0, import_react.useCallback)(async () => {
    if (!activeChannel) {
      setError("Informe o canal da live (login Twitch do streamer)");
      return null;
    }
    setError(null);
    const result = await api.post("/api/ping", { channel: activeChannel });
    setLastPing(result);
    if (result.xp_gained > 0) {
      setCooldownMs(PING_COOLDOWN_MS);
    } else if (result.cooldown_seconds > 0) {
      setCooldownMs(result.cooldown_seconds * 1e3);
    } else {
      setCooldownMs(3e4);
    }
    return result;
  }, [activeChannel]);
  (0, import_react.useEffect)(() => {
    if (cooldownMs <= 0) return;
    timerRef.current = window.setInterval(() => {
      setCooldownMs((ms) => Math.max(0, ms - 1e3));
    }, 1e3);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [cooldownMs]);
  (0, import_react.useEffect)(() => {
    if (!enabled || !activeChannel) return;
    void ping().catch((err) => {
      setError(err instanceof Error ? err.message : "Ping failed");
    });
  }, [enabled, activeChannel]);
  (0, import_react.useEffect)(() => {
    if (!enabled || !activeChannel) return;
    if (cooldownMs > 0) return;
    if (lastPing === null) return;
    const autoTimer = window.setTimeout(() => {
      void ping().catch((err) => {
        setError(err instanceof Error ? err.message : "Ping failed");
      });
    }, 500);
    return () => window.clearTimeout(autoTimer);
  }, [cooldownMs, enabled, activeChannel, lastPing]);
  return {
    lastPing,
    cooldownMs,
    ping,
    canPing: cooldownMs <= 0,
    error,
    channel: activeChannel,
    setChannel: setStoredChannel
  };
}

export {
  getStoredChannel,
  setStoredChannel,
  usePing
};
