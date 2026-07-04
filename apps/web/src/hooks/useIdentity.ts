import { useCallback, useEffect, useState } from "react";
import type { IdentityProfile } from "@streamrpg/shared";
import { api } from "../lib/api";

export function useIdentity(enabled: boolean) {
  const [identity, setIdentity] = useState<IdentityProfile | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.get<IdentityProfile>("/api/identity/me");
      setIdentity(data);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const equipTitle = useCallback(
    async (titleId: number) => {
      const data = await api.post<IdentityProfile>("/api/identity/equip-title", { title_id: titleId });
      setIdentity(data);
    },
    [],
  );

  const unequipTitle = useCallback(async () => {
    const data = await api.post<IdentityProfile>("/api/identity/unequip-title", {});
    setIdentity(data);
  }, []);

  const equipFrame = useCallback(async (frameId: number) => {
    const data = await api.post<IdentityProfile>("/api/identity/equip-frame", { frame_id: frameId });
    setIdentity(data);
  }, []);

  const unequipFrame = useCallback(async () => {
    const data = await api.post<IdentityProfile>("/api/identity/unequip-frame", {});
    setIdentity(data);
  }, []);

  return { identity, loading, refresh, equipTitle, unequipTitle, equipFrame, unequipFrame };
}
