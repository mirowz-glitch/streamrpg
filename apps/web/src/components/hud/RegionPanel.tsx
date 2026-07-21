import type { HudRegionInfo } from "@streamrpg/shared";

interface RegionPanelProps {
  region: HudRegionInfo;
}

// HUD & Gameplay UI Phase I — requisito 3: Nome/Dificuldade/Nível
// recomendado, tudo já derivado em HudRegionInfo (deriveHudState,
// Presentation Layer) — este componente só exibe, nenhum texto
// hardcoded aqui (quando a região não tem Encounter Table ainda,
// mostra isso honestamente em vez de inventar um valor).
//
// Biomes, Regions & World Progression Phase I — requisito 1: clima/
// descrição/identidade visual (region.biome) só aparecem quando a
// região tem BiomeDefinition; regiões sem bioma continuam mostrando
// exatamente o que já mostravam antes desta Sprint.
export function RegionPanel({ region }: RegionPanelProps) {
  return (
    <section
      className={`hud-region-panel${region.biome ? " hud-region-panel-themed" : ""}`}
      style={region.biome ? { borderLeftColor: region.biome.visualTheme.color } : undefined}
    >
      <h3 className="hud-region-name">
        {region.biome ? `${region.biome.visualTheme.icon} ` : ""}
        {region.name}
      </h3>
      <p className="hud-region-detail">Dificuldade: {region.biome?.difficultyLabel ?? region.difficulty ?? "Desconhecida"}</p>
      <p className="hud-region-detail">
        Nível recomendado:{" "}
        {region.recommendedLevelRange ? `${region.recommendedLevelRange.min}–${region.recommendedLevelRange.max}` : "Sem dados ainda"}
      </p>
      {region.biome ? (
        <>
          <p className="hud-region-detail">Clima: {region.biome.climate}</p>
          <p className="hud-region-description">{region.biome.description}</p>
        </>
      ) : null}
    </section>
  );
}
