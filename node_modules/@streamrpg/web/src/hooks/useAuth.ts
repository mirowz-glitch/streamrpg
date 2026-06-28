import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string | null;
}

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    profile: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get<{ profile: Profile }>("/api/auth/me");
      setState({ profile: data.profile, loading: false, error: null });
    } catch {
      setState({ profile: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout");
    setState({ profile: null, loading: false, error: null });
  }, []);

  return { ...state, refresh, logout };
}
