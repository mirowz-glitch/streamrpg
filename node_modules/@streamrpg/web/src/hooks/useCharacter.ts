import { useCallback, useEffect, useState } from "react";
import type { CharacterResponse } from "@streamrpg/shared";
import { api } from "../lib/api";

export function useCharacter(enabled = true) {
  const [character, setCharacter] = useState<CharacterResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<CharacterResponse>("/api/character");
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load character");
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateName = useCallback(async (displayName: string) => {
    const data = await api.patch<CharacterResponse>("/api/character", { display_name: displayName });
    setCharacter(data);
    return data;
  }, []);

  return { character, loading, error, refresh, updateName };
}
