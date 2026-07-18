import { useEffect, useState } from "react";
import type { EncounterCategory, ExpeditionStatus } from "@streamrpg/shared";
import { buildWorldSimulationState } from "../../lib/worldSimulationState";
import type { Entity } from "../../lib/entity";
import { EntityMarker } from "../ui/EntityMarker";

// Sprint World Simulation Phase I — primeiro renderer do mundo: ainda
// sem sprite/animação/mapa/colisão, só a posição lógica (grid simples,
// x = progress_percent, y fixo) de uma expedição de exemplo. Mesma
// convenção de dado fabricado/rotulado já usada por CharacterPreview
// (Landing Page 2.0) — este componente nunca lê expedição real.
//
// Sprint World Simulation Phase II — a mesma expedição de exemplo agora
// avança por um mock determinístico (20% → 35% → 58% → 81% → 100%,
// exemplo literal do brief), só pra demonstrar o marcador caminhando em
// vez de teletransportar. Nenhum estado complexo: um índice cíclico e
// um `setInterval`, a transição suave é inteiramente CSS
// (`.simulation-player.walking`).
//
// Sprint World Simulation Phase III — a mesma sequência de progresso
// (inalterada) agora troca também de região a cada passo, uma por
// categoria visual (Bosque/Deserto/Pântano/Picos Congelados/qualquer
// outra), só pra deixar o cenário perceptível no mesmo mock ilustrativo.
// Sprint World Simulation Phase V — mesma sequência de progress/região
// de sempre, inalterada; cada passo ganhou `status`/`encounterCategory`
// (campos novos, aditivos) só pra existir um momento "combating" no
// mesmo loop ilustrativo — sem isso o inimigo nunca apareceria na
// Landing. Um único passo (Pântano) vira o encontro; os outros 4
// continuam "exploring" sem encontro, exatamente como antes.
// Sprint World Simulation Phase IX — mesmo formato aditivo de sempre
// (status/encounterCategory já eram assim desde a Phase V): dois passos
// trocaram de "exploring" pra "returning"/"preparing" (progress
// inalterado), só pra existir um ciclo combat→returning→preparing
// completo — sem isso "loot em returning" nunca apareceria na Landing.
// `lootLeft` é a posição FIXA onde o inimigo estava durante o combate
// (mesmo `getEnemyLeft(58)` = 68, calculado uma vez e gravado aqui —
// "nunca se move", "nenhuma lógica compartilhada" entre passos).
type LootVariant = "common" | "rare" | "gold" | "discovery";

interface MockStep {
  progress: number;
  region: string;
  status: ExpeditionStatus;
  encounterCategory: EncounterCategory | null;
  lootType: LootVariant | null;
  lootLeft: number | null;
}

const MOCK_STEPS: readonly MockStep[] = [
  { progress: 20, region: "Bosque Sussurrante", status: "exploring", encounterCategory: null, lootType: null, lootLeft: null },
  { progress: 35, region: "Deserto de Vidro", status: "exploring", encounterCategory: null, lootType: null, lootLeft: null },
  { progress: 58, region: "Pântano Podre", status: "combating", encounterCategory: "misterio", lootType: null, lootLeft: null },
  { progress: 81, region: "Picos Congelados", status: "returning", encounterCategory: null, lootType: "rare", lootLeft: 68 },
  { progress: 100, region: "Porto do Amanhecer", status: "preparing", encounterCategory: null, lootType: null, lootLeft: null },
];
const MOCK_STEP_INTERVAL_MS = 2500;

// Sprint World Simulation Phase III — classificação puramente visual de
// `current_region_name` (único dado usado), local a este componente
// (worldSimulationState.ts não é alterado nesta Sprint). Só recolore a
// trilha via classe no container — nenhuma lógica de expedição/estado
// envolvida.
function getRegionClass(regionName: string): string {
  if (regionName.includes("Bosque")) return "region-bosque";
  if (regionName.includes("Deserto")) return "region-deserto";
  if (regionName.includes("Pântano")) return "region-pantano";
  if (regionName.includes("Picos Congelados")) return "region-neve";
  return "region-default";
}

// Sprint World Simulation Phase III — trilha horizontal fixa (24 tiles,
// exemplo literal do brief); não muda de tamanho, só de aparência
// (classe de região no container pai).
const TILE_COUNT = 24;
const TRACK_TILES = Array.from({ length: TILE_COUNT });

// Sprint World Simulation — Region Transitions Phase I — cada tile
// passa a ter SUA PRÓPRIA classe de região (antes só o container inteiro
// trocava de uma vez). Determinístico, nunca sorteado: os primeiros
// ~70% dos tiles (Math.floor, nunca Math.random) recebem `currentRegion`
// sólido; os últimos ~30% recebem "region-transition" — uma faixa fixa
// de mistura, sem saber qual bioma vem a seguir (a função só recebe
// `currentRegion`, como pedido). Nenhuma cor/gradiente/sombra nova, só
// distribuição de classes — `.simulation-tile.region-X` reaproveita
// exatamente os mesmos valores rgba já usados por `.region-X
// .simulation-tile` (styles.css), agora como seletor composto (a classe
// vai no próprio tile, não mais só no container ancestral).
const REGION_TRANSITION_RATIO = 0.7;
const REGION_TRANSITION_CLASS = "region-transition";

function getTileRegion(index: number, currentRegion: string): string {
  const transitionStartIndex = Math.floor(TILE_COUNT * REGION_TRANSITION_RATIO);
  return index < transitionStartIndex ? currentRegion : REGION_TRANSITION_CLASS;
}

// Sprint World Simulation Phase IV — mesma partição de região já usada
// por getRegionClass acima, só traduzida pro tipo de decoração (árvore/
// pedra/vegetação baixa/cristal/pedra pequena); nenhuma classificação
// nova, nenhum dado novo.
const REGION_TO_DECORATION: Record<string, string> = {
  "region-bosque": "decoration-tree",
  "region-deserto": "decoration-rock",
  "region-pantano": "decoration-swamp",
  "region-neve": "decoration-ice",
  "region-default": "decoration-default",
};

// Sprint World Simulation Phase IV — posições fixas (nunca aleatórias,
// nunca se movem); só o jogador anda. 8 decorações, dentro da faixa de
// 6–10 pedida pelo brief.
const DECORATION_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 5, top: 20 },
  { left: 14, top: 75 },
  { left: 24, top: 25 },
  { left: 35, top: 70 },
  { left: 47, top: 20 },
  { left: 60, top: 78 },
  { left: 72, top: 22 },
  { left: 85, top: 72 },
];

// Sprint World Simulation Phase V — categoria só decide a classe CSS,
// nenhuma lógica adicional. Categorias fora das 5 nomeadas pelo brief
// (combate/descanso/ruínas) e ausência de encontro caem em enemy-default.
function getEnemyClass(category: EncounterCategory | null): string {
  switch (category) {
    case "descoberta":
      return "enemy-discovery";
    case "natureza":
      return "enemy-nature";
    case "misterio":
      return "enemy-mystery";
    case "clima":
      return "enemy-climate";
    case "comercio":
      return "enemy-commerce";
    default:
      return "enemy-default";
  }
}

const ENEMY_OFFSET = 10;
const ENEMY_MAX_LEFT = 96;

// Sprint World Simulation Phase V — 10% à frente do jogador, nunca além
// de 96% (regra literal do brief); só consome `targetX` já existente,
// não altera WorldSimulationState.
function getEnemyLeft(playerTargetX: number): number {
  return Math.min(playerTargetX + ENEMY_OFFSET, ENEMY_MAX_LEFT);
}

const PLAYER_STOP_GAP = 4;

// Sprint World Simulation Phase VI — enquanto status != combating,
// devolve `targetX` sem nenhuma alteração ("continua exatamente
// igual"); quando combating, nunca deixa o jogador alcançar/atravessar
// o inimigo — para `PLAYER_STOP_GAP`% antes dele. Não altera `targetX`
// nem WorldSimulationState, só o valor renderizado (`left`).
function getPlayerLeft(status: ExpeditionStatus, targetX: number, enemyLeft: number): number {
  if (status !== "combating") return targetX;
  return Math.min(targetX, enemyLeft - PLAYER_STOP_GAP);
}

// Sprint World Simulation — Entity Migration Phase I — EntityMarker
// sempre define `top` inline (a partir de `position.y`), diferente do
// player antigo (só `left` inline; `top: 50%` vinha 100% do CSS). Pra
// manter a posição visual EXATAMENTE igual, este é o mesmo "50%" que a
// regra `.simulation-player` já declarava — nunca `state.y` (que é o y
// lógico do grid futuro, sempre 0, um espaço de coordenadas diferente
// do percentual de renderização usado aqui).
const PLAYER_VERTICAL_CENTER = 50;

// Sprint World Simulation — Entity Migration Phase II — mesmo raciocínio
// do PLAYER_VERTICAL_CENTER acima, agora pro Enemy (a regra
// `.simulation-enemy` também declarava `top: 50%`); constante própria
// (não reaproveita a do Player) pra manter o diff desta Sprint restrito
// só ao Enemy.
const ENEMY_VERTICAL_CENTER = 50;

// Sprint World Simulation — Entity Migration Phase III — mesmo
// raciocínio das duas constantes acima, agora pro Loot (a regra
// `.simulation-loot` também declarava `top: 50%`); constante própria,
// diff restrito só ao Loot.
const LOOT_VERTICAL_CENTER = 50;

// Sprint World Simulation Phase IX — mesmo padrão de getEnemyClass:
// tipo só decide a classe CSS, nenhuma lógica adicional.
function getLootClass(lootType: LootVariant | null): string {
  switch (lootType) {
    case "common":
      return "loot-common";
    case "rare":
      return "loot-rare";
    case "gold":
      return "loot-gold";
    case "discovery":
      return "loot-discovery";
    default:
      return "loot-common";
  }
}

// Sprint World Simulation — Living NPCs Phase I — conjunto fixo de NPCs
// mockados (posições x literais do brief), cada um com um tipo/aparência
// diferente. Nenhuma IA, nenhuma interação, nenhuma colisão — só
// caminham devagar (drift determinístico a partir do mesmo `stepIndex`
// já existente, nenhum timer novo). `WorldSimulationState`/Expedição/
// Progressão do Player não são tocadas nem consultadas aqui.
type NpcVariant = "villager" | "merchant" | "guard" | "traveller";

interface NpcConfig {
  id: string;
  baseX: number;
  variant: NpcVariant;
}

const NPC_CONFIGS: readonly NpcConfig[] = [
  { id: "npc-1", baseX: 12, variant: "villager" },
  { id: "npc-2", baseX: 34, variant: "merchant" },
  { id: "npc-3", baseX: 63, variant: "guard" },
  { id: "npc-4", baseX: 88, variant: "traveller" },
];

// "Velocidade menor" que o Player (que salta ~15-20% por passo do
// mock): NPCs derivam devagar (1,5% por tick) dentro de uma faixa curta
// perto da posição base, depois envolvem — nunca saem caminhando pra
// fora da trilha, nunca precisam de IA/pathfinding.
const NPC_STEP_DRIFT = 1.5;
const NPC_DRIFT_RANGE = 8;
const NPC_VERTICAL_CENTER = 50;

function getNpcLeft(baseX: number, stepIndex: number): number {
  return baseX + ((stepIndex * NPC_STEP_DRIFT) % NPC_DRIFT_RANGE);
}

// Sprint World Simulation — Layered Environment (Profundidade) —
// cenário reorganizado em 3 camadas via ordem no DOM (nenhum z-index
// novo, nenhuma entidade nova): background nasce ANTES de tudo (pinta
// atrás de tiles/decorações/entidades), foreground nasce DEPOIS do
// Player (pinta por cima de tudo, inclusive dele). Posições fixas,
// nunca aleatórias, nunca se movem — só decoração, mesma convenção da
// Phase IV.
const BACKGROUND_ELEMENTS: ReadonlyArray<{ left: number; top: number; className: string }> = [
  { left: 3, top: 15, className: "bg-mountain" },
  { left: 18, top: 10, className: "bg-tree" },
  { left: 40, top: 12, className: "bg-mountain" },
  { left: 55, top: 15, className: "bg-bush" },
  { left: 76, top: 10, className: "bg-tree" },
  { left: 93, top: 18, className: "bg-stone" },
];

// "Sempre poucos elementos" (brief) — só 3, o suficiente pra criar a
// ilusão de profundidade sem poluir a cena.
const FOREGROUND_ELEMENTS: ReadonlyArray<{ left: number; top: number; className: string }> = [
  { left: 20, top: 62, className: "fg-branch" },
  { left: 50, top: 58, className: "fg-leaves" },
  { left: 82, top: 62, className: "fg-stone" },
];

// Sprint World Simulation — Ambient Life Phase I — só configurações
// fixas + animação CSS (nenhum Entity/Sprite/State/Timer novo). Pássaros
// sempre visíveis (fazem parte da camada de fundo — nascem logo depois
// de BACKGROUND_ELEMENTS no DOM, sem tocar o array/bloco já existente).
// Os outros 4 reaproveitam o mesmo `regionClass` já calculado por
// render pro mesmo `stepIndex`/mock — nenhum ciclo novo, só um `&&`
// condicional a mais no JSX.
const BIRD_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 15, top: 8 },
  { left: 45, top: 5 },
  { left: 75, top: 9 },
];

const LEAF_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 25, top: 10 },
  { left: 60, top: 15 },
];

const DUST_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 30, top: 40 },
  { left: 70, top: 55 },
];

const SPARKLE_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 20, top: 20 },
  { left: 50, top: 35 },
  { left: 80, top: 25 },
];

const INSECT_POSITIONS: ReadonlyArray<{ left: number; top: number }> = [
  { left: 35, top: 45 },
  { left: 65, top: 50 },
];

// Sprint World Simulation — Parallax Phase I — cada camada recebe só um
// translateX calculado a partir de `state.targetX` (já vem de
// `progress_percent`, dado permitido pelo brief); nenhum estado/timer/
// lógica novos, nenhum useRef pra rastrear deltas entre renders. Player
// não entra nesta tabela como um offset a mais: 100% já É a posição
// real dele (`playerLeft`, inalterada) — "o Player continua seguindo
// exatamente sua posição real". As demais camadas só "compensam
// visualmente" na proporção pedida pelo brief.
const PARALLAX_BACKGROUND_RATIO = 0.2;
const PARALLAX_DECORATION_RATIO = 0.4;
const PARALLAX_NPC_RATIO = 0.6;
const PARALLAX_FOREGROUND_RATIO = 1.2;

function getParallaxOffset(targetX: number, ratio: number): number {
  return targetX * ratio;
}

// Sprint World Simulation — Landmarks Phase I — só configuração fixa
// (posição + tipo), nenhuma lógica, nenhuma Entity. Ficam na mesma
// "camada do cenário" das decorações — reaproveitam o `decorationParallax`
// já calculado (PARALLAX_DECORATION_RATIO, inalterado), nunca um ratio
// próprio novo. Nunca mais que 5, sempre fixas, sem estado/timer/
// interação/animação.
type LandmarkKind = "sign" | "ruins" | "bridge" | "portal" | "watchtower" | "campfire";

interface LandmarkConfig {
  position: number;
  top: number;
  kind: LandmarkKind;
}

const LANDMARK_CONFIGS: readonly LandmarkConfig[] = [
  { position: 15, top: 30, kind: "sign" },
  { position: 38, top: 25, kind: "ruins" },
  { position: 50, top: 70, kind: "campfire" },
  { position: 63, top: 28, kind: "bridge" },
  { position: 88, top: 22, kind: "portal" },
];

export function WorldSimulationPreview() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % MOCK_STEPS.length);
    }, MOCK_STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const currentStep = MOCK_STEPS[stepIndex];
  const state = buildWorldSimulationState({
    status: currentStep.status,
    progress_percent: currentStep.progress,
    current_region_name: currentStep.region,
  });
  const regionClass = getRegionClass(state.region);
  const decorationClass = REGION_TO_DECORATION[regionClass];
  const showEnemy = state.status === "combating";
  const enemyClass = getEnemyClass(currentStep.encounterCategory);
  const enemyLeft = getEnemyLeft(state.targetX);
  const playerLeft = getPlayerLeft(state.status, state.targetX, enemyLeft);
  // Sprint World Simulation Phase IX — loot invisível durante combating,
  // aparece em returning, some de volta em preparing (regra literal do
  // brief). Posição fixa (`lootLeft`), nunca recalculada a partir do
  // jogador/inimigo atual — "nunca se move".
  const showLoot = state.status === "returning";
  const lootClass = getLootClass(currentStep.lootType);
  const lootLeft = currentStep.lootLeft ?? enemyLeft;
  // Sprint World Simulation — Entity Migration Phase III — mesmos
  // cálculos de sempre (`lootLeft`/`lootClass`/`showLoot`), só
  // empacotados no formato `Entity`. `variant` é o sufixo de `lootClass`
  // sem o prefixo "loot-" (getLootClass permanece intocada — mesma
  // técnica do Enemy). `getLootClass` nunca devolve "loot-default" (o
  // fallback já reaproveita "loot-common"), então `entity-loot-default`
  // nunca chega a ser usado — não há regra "default" real pra estender.
  const lootVariant = lootClass.replace("loot-", "");
  const lootEntity: Entity = {
    id: "loot",
    kind: "loot",
    variant: lootVariant,
    position: { x: lootLeft, y: LOOT_VERTICAL_CENTER },
    visible: showLoot,
  };
  // Sprint World Simulation — Entity Migration Phase I — mesmos cálculos
  // de sempre (`playerLeft`/`state.animationState`), só empacotados no
  // formato `Entity` pra renderizar via EntityMarker. `visible` sempre
  // true (o player nunca desapareceu, diferente de enemy/loot).
  const playerEntity: Entity = {
    id: "player",
    kind: "player",
    variant: state.animationState,
    position: { x: playerLeft, y: PLAYER_VERTICAL_CENTER },
    visible: true,
  };
  // Sprint World Simulation — Entity Migration Phase II — mesmos
  // cálculos de sempre (`enemyLeft`/`enemyClass`/`showEnemy`), só
  // empacotados no formato `Entity`. `variant` é o sufixo de
  // `enemyClass` sem o prefixo "enemy-" (getEnemyClass permanece
  // intocada — ela ainda devolve "enemy-default" etc., só removo o
  // prefixo aqui pra não duplicar "enemy-enemy-" na className do
  // EntityMarker, que já adiciona "entity-enemy-" sozinho).
  const enemyVariant = enemyClass.replace("enemy-", "");
  const enemyEntity: Entity = {
    id: "enemy",
    kind: "enemy",
    variant: enemyVariant,
    position: { x: enemyLeft, y: ENEMY_VERTICAL_CENTER },
    visible: showEnemy,
  };
  // Sprint World Simulation — Living NPCs Phase I — reaproveita o
  // `stepIndex` já existente (mesmo tick do Player/Enemy/Loot, nenhum
  // timer novo) só pra fazer os NPCs derivarem devagar; sempre visíveis,
  // nunca ligados a status/combate/expedição.
  const npcEntities: Entity[] = NPC_CONFIGS.map((npc) => ({
    id: npc.id,
    kind: "npc",
    variant: npc.variant,
    position: { x: getNpcLeft(npc.baseX, stepIndex), y: NPC_VERTICAL_CENTER },
    visible: true,
  }));
  // Sprint World Simulation — Parallax Phase I — 4 offsets calculados
  // uma vez por render, reaproveitando `state.targetX` já existente;
  // nenhum novo cálculo de posição lógica, só o deslocamento visual
  // aditivo de cada camada.
  const backgroundParallax = getParallaxOffset(state.targetX, PARALLAX_BACKGROUND_RATIO);
  const decorationParallax = getParallaxOffset(state.targetX, PARALLAX_DECORATION_RATIO);
  const npcParallax = getParallaxOffset(state.targetX, PARALLAX_NPC_RATIO);
  const foregroundParallax = getParallaxOffset(state.targetX, PARALLAX_FOREGROUND_RATIO);

  return (
    <div className="world-simulation">
      <span className="landing-example-tag">Exemplo ilustrativo</span>
      <div className={`simulation-track ${regionClass}`}>
        {/* Sprint World Simulation — Region Transitions Phase I — cada
            tile recebe sua própria classe (`getTileRegion`), em vez de
            herdar tudo do container; os últimos ~30% viram
            "region-transition", criando uma faixa de mistura em vez de
            uma troca instantânea. Nenhuma animação/fade — só a
            distribuição das classes. */}
        {TRACK_TILES.map((_, i) => (
          <div key={i} className={`simulation-tile ${getTileRegion(i, regionClass)}`} />
        ))}
        {/* Sprint World Simulation — Layered Environment (Profundidade) —
            camada de fundo (montanhas/árvores/arbustos/pedras distantes),
            nasce antes de tudo no DOM pra pintar atrás de decorações e
            entidades — "ele está andando DENTRO do mundo". */}
        {/* Sprint World Simulation — Parallax Phase I — mesma posição
            base de sempre (`el.left`/`el.top`, intocados); só ganhou
            `translateX` aditivo (20% da movimentação do jogador) via
            `.parallax-background`, nenhuma regra antiga alterada. */}
        {BACKGROUND_ELEMENTS.map((el, i) => (
          <div
            key={i}
            className={`simulation-background parallax-background ${el.className}`}
            style={{ left: `${el.left}%`, top: `${el.top}%`, transform: `translateX(${backgroundParallax}px)` }}
          />
        ))}
        {/* Sprint World Simulation — Ambient Life Phase I — pássaros,
            sempre visíveis, fazem parte da camada de fundo (nascem logo
            depois de BACKGROUND_ELEMENTS, mesma posição relativa no
            DOM); movimento lento só via CSS animation. */}
        {BIRD_POSITIONS.map((pos, i) => (
          <div key={i} className="simulation-bird" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />
        ))}
        {/* Sprint World Simulation — Parallax Phase I — mesma posição
            base de sempre (`pos.left`/`pos.top`, intocados); só ganhou
            `translateX` aditivo (40% da movimentação do jogador) via
            `.parallax-decoration`, nenhuma regra antiga alterada. */}
        {DECORATION_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className={`simulation-decoration parallax-decoration ${decorationClass}`}
            style={{ left: `${pos.left}%`, top: `${pos.top}%`, transform: `translateX(${decorationParallax}px)` }}
          />
        ))}
        {/* Sprint World Simulation — Landmarks Phase I — marcos visuais
            fixos, mesma camada das decorações; reaproveita o mesmo
            `decorationParallax` já calculado (nenhum ratio/lógica novo).
            Não são Entity, não têm colisão, nunca se movem sozinhas. */}
        {LANDMARK_CONFIGS.map((landmark, i) => (
          <div
            key={i}
            className={`landmark landmark-${landmark.kind}`}
            style={{ left: `${landmark.position}%`, top: `${landmark.top}%`, transform: `translateX(${decorationParallax}px)` }}
          />
        ))}
        {/* Sprint World Simulation — Ambient Life Phase I — os 4 efeitos
            por região reaproveitam o mesmo `regionClass` já calculado
            pro mock atual (nenhum ciclo/estado novo); cada um só existe
            na região certa. */}
        {regionClass === "region-bosque"
          ? LEAF_POSITIONS.map((pos, i) => (
              <div key={i} className="simulation-leaf" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />
            ))
          : null}
        {regionClass === "region-deserto"
          ? DUST_POSITIONS.map((pos, i) => (
              <div key={i} className="simulation-dust" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />
            ))
          : null}
        {regionClass === "region-neve"
          ? SPARKLE_POSITIONS.map((pos, i) => (
              <div key={i} className="simulation-sparkle" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />
            ))
          : null}
        {regionClass === "region-pantano"
          ? INSECT_POSITIONS.map((pos, i) => (
              <div key={i} className="simulation-insect" style={{ left: `${pos.left}%`, top: `${pos.top}%` }} />
            ))
          : null}
        {/* Sprint World Simulation — Living NPCs Phase I — 4 NPCs fixos
            (mockados só na Landing Preview), caminhando devagar sem
            IA/interação/colisão; reaproveitam EntityMarker exatamente
            como Player/Enemy/Loot.

            Sprint World Simulation — Parallax Phase I — NPC/EntityMarker
            são proibidos de alterar; o offset (60% da movimentação do
            jogador) é aplicado num wrapper `.parallax-npc` que cobre
            exatamente a mesma área da trilha (`inset: 0`), preservando
            a posição percentual interna do NPC (`left`/`top`, cálculo
            de `getNpcLeft` intocado) — só desloca visualmente o NPC
            inteiro, nunca sua lógica/posição real. */}
        {npcEntities.map((npc) => (
          <div key={npc.id} className="parallax-npc" style={{ transform: `translateX(${npcParallax}px)` }}>
            <EntityMarker entity={npc} />
          </div>
        ))}
        {/* Sprint World Simulation — Entity Migration Phase II — o Enemy
            deixou de ser renderizado manualmente; `.entity-enemy`/
            `.entity-enemy-{variant}` reutilizam as mesmas regras de
            `.simulation-enemy`/`.enemy-{variant}` (styles.css, seletor
            estendido, nenhum valor alterado). Continua sempre montado,
            opacidade condicional (mesma técnica da Phase VIII). */}
        <EntityMarker entity={enemyEntity} />
        {/* Sprint World Simulation — Entity Migration Phase III — o Loot
            deixou de ser renderizado manualmente; `.entity-loot`/
            `.entity-loot-{variant}` reutilizam as mesmas regras de
            `.simulation-loot`/`.loot-{variant}` (styles.css, seletor
            estendido, nenhum valor alterado). Posição continua fixa
            (`lootLeft`), nunca acompanha jogador/inimigo. */}
        <EntityMarker entity={lootEntity} />
        {/* Sprint World Simulation — Entity Migration Phase I — o Player
            deixou de ser renderizado manualmente; `.entity-player`/
            `.entity-player-{variant}` reutilizam as mesmas regras de
            `.simulation-player`/`.simulation-player.{variant}` (styles.css,
            seletor estendido, nenhum valor alterado).

            Sprint World Simulation — Parallax Phase I — Player não
            recebe wrapper/offset: 100% na tabela do brief já É sua
            posição real (`playerLeft`, inalterada) — "o Player continua
            seguindo exatamente sua posição real". `.parallax-player`
            existe em styles.css (pedido pelo brief) como regra vazia,
            nunca aplicada aqui — Player está na lista de "não alterar". */}
        <EntityMarker entity={playerEntity}>●</EntityMarker>
        {/* Sprint World Simulation — Layered Environment (Profundidade) —
            camada de frente (folhas/galho/pedra maior), nasce DEPOIS do
            Player no DOM pra pintar por cima dele — quando o jogador
            passa por trás, o cérebro entende que está caminhando entre
            camadas, não sobre um fundo plano. Sempre poucos elementos. */}
        {/* Sprint World Simulation — Parallax Phase I — mesma posição
            base de sempre (`el.left`/`el.top`, intocados); só ganhou
            `translateX` aditivo (120% da movimentação do jogador, mais
            rápido que ele mesmo — "parece mais perto") via
            `.parallax-foreground`, nenhuma regra antiga alterada. */}
        {FOREGROUND_ELEMENTS.map((el, i) => (
          <div
            key={i}
            className={`simulation-foreground parallax-foreground ${el.className}`}
            style={{ left: `${el.left}%`, top: `${el.top}%`, transform: `translateX(${foregroundParallax}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
