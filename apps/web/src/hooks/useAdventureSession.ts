import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import {
  CharacterBuild,
  Inventory,
  Equipment,
  createAdventureCharacter,
  createAdventureSession,
  createAdventureTimeline,
  advanceDungeonTick,
  deriveHudState,
  equipStarterKit,
  type AdventureSession,
  type AdventureTimeline,
  type PresentationEvent,
  type FloatingNumberEvent,
} from "@streamrpg/shared";

const DEMO_CHARACTER_ID = "vertical-slice-hero";
const DEMO_CLASS_ID = "warrior";
// Progression & Player Retention Phase I — requisito 1/2: a região e o
// nível inicial da demo precisam deixar a Barra de XP/Level Up
// observáveis de verdade. A curva real (xp.ts) cresce como
// 100*nível^1.5 — em "colinas-aridas" (nível 15-45) o personagem
// começava direto no MAX_LEVEL (30), deixando xpProgress travado em
// 100% pra sempre. Trocado pra "bosque-sussurrante" (nível 1-14) com o
// personagem começando do zero.
//
// Gameplay Balance & First Playable Experience Phase I — requisito 8:
// a demo agora equipa o mesmo kit inicial que o Simulador (ver
// adventure/starterKit.ts) — sem ele, um personagem nível 1
// completamente nu morria quase sempre no primeiro encontro (achado
// confirmado empiricamente via 100 aventuras simuladas, ver
// simulation/). Enemy Templates (enemy/templates.ts) e Encounter
// Tables (worldencounter/encounterTables.ts) também foram recalibrados
// na mesma Sprint — nenhuma fórmula de combate/XP mudou, só dados.
const DEMO_REGION_ID = "bosque-sussurrante";
const DEMO_LEVEL_UPS = 0;
const DEMO_XP_PER_LEVEL = 20000;
const DEMO_INVENTORY_CAPACITY = 24;

interface AdventureDemoState {
  session: AdventureSession;
  timeline: AdventureTimeline;
}

export interface AdventureTickOutcome {
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
}

function createDemoState(seed: number): AdventureDemoState {
  const build = new CharacterBuild(DEMO_CHARACTER_ID, DEMO_CLASS_ID, 0);
  for (let i = 0; i < DEMO_LEVEL_UPS; i++) build.addExperience(DEMO_XP_PER_LEVEL);

  const inventory = new Inventory(DEMO_CHARACTER_ID, DEMO_INVENTORY_CAPACITY);
  const equipment = new Equipment(DEMO_CHARACTER_ID);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, DEMO_CLASS_ID, seed);

  const session = createAdventureSession(`${DEMO_CHARACTER_ID}-session`, character, DEMO_REGION_ID, seed, Date.now());
  const timeline = createAdventureTimeline(session.sessionId);

  return { session, timeline };
}

// HUD & Gameplay UI Phase I — Vertical Slice: única ponte entre o
// motor (packages/shared) e React nesta página. Nenhuma regra de
// gameplay aqui — só cria a demo (Character Build + Inventory +
// Equipment + Adventure Session, tudo client-side, sem tocar
// backend/API).
//
// Recovery & Adventure Flow Phase I — troca advanceAdventureWithPresentation()
// por advanceAdventureWithRecovery() (Recovery Layer, packages/shared/
// src/recovery/): a Presentation Layer em si continua 100% intocada
// (a Recovery Layer só chama por cima, nunca modifica seu código).
//
// Objectives, Missions & Player Goals Phase I — troca de novo por
// advanceAdventureWithObjectives() (Objective System, packages/shared/
// src/objectives/), que já envolve a Recovery Layer por baixo.
//
// Expeditions, Checkpoints & Long Session Progression Phase I — troca
// de novo por advanceExpeditionTick() (expeditions/expeditionController.ts),
// que já envolve o Objective System por baixo.
//
// Factions, Reputation & World Consequences Phase I — troca de novo
// por advanceFactionTick() (factions/factionController.ts), que já
// envolve o Expedition Controller por baixo.
//
// First Dungeon, Final Boss & Complete Game Loop Phase I — troca de
// novo por advanceDungeonTick() (dungeon/dungeonController.ts), que já
// envolve o Faction Controller por baixo — esta continua sendo a
// única linha que muda a cada Sprint. `hudState` é recomputado via
// useMemo, dependente só de `renderVersion` (requisito 13: "HUD State
// deve ser memoizável") — nenhum estado duplicado, `session`/`timeline`
// continuam sendo a única fonte de verdade (objetos mutáveis do motor,
// guardados numa ref).
//
// Combat Feel & Animation System Phase I — `advance()` agora devolve
// os `events`/`floatingNumbers` do próprio tick (em vez de guardá-los
// como estado local, como na Sprint anterior) — quem chama (AdventurePage)
// repassa isso pro Animation Controller (useAnimationController),
// mantendo este hook sem saber nada sobre animação/apresentação visual.
export function useAdventureSession() {
  const stateRef = useRef<AdventureDemoState>(createDemoState(Date.now()));
  const [renderVersion, forceRender] = useReducer((version: number) => version + 1, 0);
  const [error, setError] = useState<string | null>(null);

  const hudState = useMemo(
    () => deriveHudState(stateRef.current.session, stateRef.current.timeline),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- renderVersion é a única dependência real (session/timeline são mutáveis, não re-criados)
    [renderVersion],
  );

  const advance = useCallback((autoEquip: boolean): AdventureTickOutcome | null => {
    let outcome: AdventureTickOutcome | null = null;
    try {
      const { events, floatingNumbers } = advanceDungeonTick(stateRef.current.session, stateRef.current.timeline, {
        autoEquip,
        currentTime: Date.now(),
      });
      outcome = { events, floatingNumbers };
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
    forceRender();
    return outcome;
  }, []);

  const restart = useCallback(() => {
    stateRef.current = createDemoState(Date.now());
    setError(null);
    forceRender();
  }, []);

  return { hudState, error, advance, restart };
}
