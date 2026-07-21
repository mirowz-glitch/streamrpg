import { useEffect, useRef, useState } from "react";
import { AnimationController, type CombatAnimation, type PresentationEvent, type FloatingNumberEvent } from "@streamrpg/shared";
import { buildAnimationsForTick } from "@streamrpg/shared";

// Combat Feel & Animation System Phase I — requisito 11: "evitar
// timers espalhados, setTimeout em componentes. Centralizar tudo."
// Este é o ÚNICO lugar de todo o apps/web que roda um timer pra
// animação — um `setInterval` só, dirigindo o AnimationController
// (packages/shared, puro). Componentes (LootPopup/EquipmentPopup/
// FloatingNumbers/EnemyStage/CharacterStage) só leem `active` (o
// snapshot devolvido aqui), nunca criam seu próprio timer.
//
// `setInterval` em vez de `requestAnimationFrame` de propósito: a
// suavidade visual em si já vem inteira do CSS (`@keyframes` em
// styles.css, GPU-acelerado) — este tick só decide QUANDO uma classe
// de animação entra/sai do DOM, não anima frame a frame em JS. rAF é
// pausado pelo navegador quando a aba não está visível (ex.: em
// segundo plano); um intervalo de 50ms mantém isso funcionando mesmo
// assim, sem perder suavidade nenhuma (a animação CSS continua
// independente da frequência deste tick).
const TICK_INTERVAL_MS = 50;

export function useAnimationController() {
  const controllerRef = useRef(new AnimationController());
  const [active, setActive] = useState<CombatAnimation[]>([]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      controllerRef.current.tick(Date.now());
      setActive(controllerRef.current.getSnapshot().active);
    }, TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  function playTick(events: readonly PresentationEvent[], floatingNumbers: readonly FloatingNumberEvent[]): void {
    const animations = buildAnimationsForTick(events, floatingNumbers, Date.now());
    controllerRef.current.enqueue(animations);
  }

  function reset(): void {
    controllerRef.current.clear();
    setActive([]);
  }

  return { active, playTick, reset };
}
