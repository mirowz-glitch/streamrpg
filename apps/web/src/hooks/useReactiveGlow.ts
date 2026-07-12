import { useEffect, useState } from "react";
import { hasRemembered, remember } from "../lib/playerMemory";

// Sprint Reactive Layer Foundation — versão genérica do mecanismo já
// usado por useFirstVisit (onboarding): "isto é novidade pra este
// jogador?", só que pra qualquer chave, não só flags de onboarding.
// Não decide nenhum efeito visual — devolve só o booleano. Quem consome
// escolhe a classe CSS (ex: reaproveitar `nav-glow-pulse`/
// `first-level-pulse`, já definidas em styles.css sem nenhum consumidor
// hoje). Mesma mecânica de lib/playerMemory.ts usada por onboarding.ts,
// sem duplicar storage/evento.
export function useReactiveGlow(key: string): boolean {
  const [isNew] = useState(() => !hasRemembered(key));

  useEffect(() => {
    remember(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return isNew;
}
