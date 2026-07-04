import { useEffect, useState } from "react";
import { api } from "../lib/api";

export interface CharacterKingdomRole {
  slug: string;
  name: string;
  icon: string;
}

// Sprint Kingdom Prestige System, Etapa 6 — "Cargo atual dentro do
// Reino" no Perfil. Mesmo canal já usado por BossCard/ExpeditionPanel via
// usePing (cargo é um conceito de Reino, não existe sem um canal).
export function useKingdomRole(channel: string | undefined, enabled: boolean) {
  const [roles, setRoles] = useState<CharacterKingdomRole[]>([]);

  useEffect(() => {
    if (!enabled || !channel) {
      setRoles([]);
      return;
    }
    let cancelled = false;
    void api
      .get<{ roles: CharacterKingdomRole[] }>(`/api/kingdom/${encodeURIComponent(channel)}/me`)
      .then((data) => {
        if (!cancelled) setRoles(data.roles);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [channel, enabled]);

  return roles;
}
