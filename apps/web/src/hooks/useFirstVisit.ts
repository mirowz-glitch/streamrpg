import { useEffect, useState } from "react";
import { isFlagSet, setFlag, type OnboardingFlag } from "../lib/onboarding";

// Sprint New Player Journey — captura, uma única vez no mount, se esta é
// a primeira visita (flag ainda não marcada), e então marca a flag para
// sempre (visitas futuras verão `false`, estável durante toda a visita
// atual mesmo depois de marcar).
export function useFirstVisit(flag: OnboardingFlag): boolean {
  const [wasFirstVisit] = useState(() => !isFlagSet(flag));

  useEffect(() => {
    setFlag(flag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return wasFirstVisit;
}
