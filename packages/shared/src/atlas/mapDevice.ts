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
export interface MapDeviceInstance extends MapDevice {
  loadedMap: RareMapInstance | CorruptedMap;
}

// Carrega um Rare Map ou Corrupted Map real num Map Device — puro,
// nenhum efeito colateral, nenhuma sessão/Adventure tocada.
export function loadMapIntoDevice(source: RareMapInstance | CorruptedMap): MapDeviceInstance {
  return { loadedMap: source };
}

// "Decisões Oficiais: Atlas apenas organiza. Map Device apenas prepara.
// Adventure continua sendo o executor." Único trabalho deste módulo:
// extrair o que `createAdventureSession()` (adventure/session.ts,
// INTOCADO por esta Sprint) já sabe ler — `mapId` (o `regionId` que a
// função sempre recebeu) + o Rare Map/Corrupted Map em si (o mesmo 6º
// parâmetro opcional desde a Sprint 34). Nenhuma lógica de sessão é
// duplicada aqui.
export function prepareAdventureConfiguration(device: MapDeviceInstance): AdventureConfiguration {
  return {
    mapId: device.loadedMap.mapId,
    rareMap: device.loadedMap,
  };
}
