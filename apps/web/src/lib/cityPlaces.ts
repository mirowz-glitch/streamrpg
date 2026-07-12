// Sprint Landmark Identity Phase I — refatoração de dívida técnica: os
// mesmos 9 lugares (Praça/Ferreiro/Biblioteca/Museu/Guilda/Taverna/Casa
// dos Viajantes/Portão Norte/Arena) estavam declarados como uma union
// de string literals IDÊNTICA em dois arquivos separados
// (`EnvironmentalPlace` em environmentalStorytelling.ts e
// `SimulationPlace` em worldSimulation.ts) — cada um seu próprio tipo,
// mesmos 9 valores. Consolidado aqui, num único lugar, antes de
// qualquer código novo desta Sprint (landmarkIdentity.ts usa este
// mesmo tipo, em vez de declarar um quarto). `PresenceBuildingKey`
// (lib/worldPresence.ts) foi deliberadamente NÃO unificado aqui: tem um
// conjunto diferente (inclui "bestiario", não inclui "arena"/"casa-dos-
// viajantes") porque World Presence nunca chegou a esses dois prédios —
// forçar o mesmo tipo ali exigiria mudar esse comportamento real, fora
// do escopo desta Sprint ("sem alterar comportamento já existente").
export type CityPlace =
  | "praca"
  | "ferreiro"
  | "biblioteca"
  | "museu"
  | "guilda"
  | "taverna"
  | "casa-dos-viajantes"
  | "portao-norte"
  | "arena";
