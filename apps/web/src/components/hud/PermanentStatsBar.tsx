import type { HudState } from "@streamrpg/shared";

interface PermanentStatsBarProps {
  hudState: HudState;
}

// Progression & Player Retention Phase I — requisito 7: nível/XP vêm
// de xpProgress, ouro de statistics.goldFound (sempre 0 nesta fase —
// Loot Generator ainda não gera moeda real, ver adventure/types.ts),
// melhor item de bestItemFound. "Sequência de inimigos derrotados" usa
// statistics.enemiesKilled direto: não existe conceito de "reset de
// sequência" ainda — a morte do personagem encerra a sessão inteira,
// então todo abate acumulado já é, por definição, uma streak
// ininterrupta. Sem persistência entre sessões: tudo nasce/reinicia
// junto com a AdventureSession/Timeline.
export function PermanentStatsBar({ hudState }: PermanentStatsBarProps) {
  const { xpProgress, statistics, bestItemFound } = hudState;

  return (
    <section className="hud-permanent-stats">
      <span className="hud-permanent-stats-item">Nível {xpProgress.level}</span>
      <span className="hud-permanent-stats-item">{xpProgress.xp} XP</span>
      <span className="hud-permanent-stats-item">🪙 {statistics.goldFound}</span>
      <span className="hud-permanent-stats-item">
        🏆 {bestItemFound ? `${bestItemFound.baseItemId} (${bestItemFound.powerScore})` : "Nenhum item ainda"}
      </span>
      <span className="hud-permanent-stats-item">🔥 {statistics.enemiesKilled} abates</span>
    </section>
  );
}
