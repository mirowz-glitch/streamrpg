import type { RareMapInstance } from "../raremap/types.js";
import type { CorruptedMap } from "../mapcorruption/types.js";
import type { AdventureConfiguration, MapDevice } from "./types.js";

// Fase 4 — "Map Device: Criar MapDeviceInstance. Responsável apenas por
// receber RareMap ou CorruptedMap e devolver AdventureConfiguration.
// Nunca inicia Adventure. Nunca abre mapas. Nunca aplica combate."
// Mesmo padrão Definição/Instância já usado por `RareMap`/`RareMapInstance`
// (Sprint 34): `MapDevice` (atlas/types.ts) é o estado "vazio, pronto
// pra receber" — `MapDeviceInstance` só existe DEPOIS que um Mapa real
// foi carregado (`loadedMap` deixa de ser opcional).
//
// Sprint 37 — Waystones Phase I, Fase 4: "Map Device passa a aceitar
// WaystoneInstance... Continuar aceitando RareMap, CorruptedMap sem
// regressões." `LoadableMap` é sempre DERIVADO de `MapDevice.loadedMap`
// (atlas/types.ts) — nunca uma segunda declaração do mesmo union, pra
// nunca divergir quando um tipo novo entrar nessa lista no futuro.
export type LoadableMap = NonNullable<MapDevice["loadedMap"]>;

export interface MapDeviceInstance extends MapDevice {
  loadedMap: LoadableMap;
}

// Carrega um Rare Map, Corrupted Map ou Waystone real num Map Device —
// puro, nenhum efeito colateral, nenhuma sessão/Adventure tocada.
export function loadMapIntoDevice(source: LoadableMap): MapDeviceInstance {
  return { loadedMap: source };
}

// Sprint 37, Fase 2: "Waystone... nunca carrega Map Modifiers" — a
// única diferença estrutural entre um `WaystoneInstance` e um
// `RareMapInstance`/`CorruptedMap` é o campo `mods`. Este type guard é
// a ÚNICA lógica nova que distingue os três tipos — nunca duplicada em
// outro lugar.
function hasMapModifiers(loadedMap: LoadableMap): loadedMap is RareMapInstance | CorruptedMap {
  return "mods" in loadedMap;
}

// "Decisões Oficiais: Atlas apenas organiza. Map Device apenas prepara.
// Adventure continua sendo o executor." / (Sprint 37) "Waystone... Ele
// apenas fornece AdventureConfiguration." Único trabalho deste módulo:
// extrair o que `createAdventureSession()` (adventure/session.ts,
// INTOCADO desde a Sprint 34) já sabe ler — `mapId` (o `regionId` que a
// função sempre recebeu) + o Rare Map/Corrupted Map em si quando
// existir (o mesmo 6º parâmetro opcional desde a Sprint 34; um
// Waystone puro nunca tem Mods, então `rareMap` fica `undefined` —
// exatamente o mesmo caminho já coberto pela Sprint 36, "sem rareMap
// na AdventureConfiguration"). Nenhuma lógica de sessão é duplicada
// aqui, e `AdventureConfiguration` (atlas/types.ts) não precisou mudar.
export function prepareAdventureConfiguration(device: MapDeviceInstance): AdventureConfiguration {
  return {
    mapId: device.loadedMap.mapId,
    rareMap: hasMapModifiers(device.loadedMap) ? device.loadedMap : undefined,
  };
}
