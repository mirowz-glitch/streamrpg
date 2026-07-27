import type { RecentFind } from "./backpackFinds";
import type { BackpackSignals } from "./backpackSignals";

// City Foundation Phase I — Fase 2 ("Cidade Viva"): "ao entrar na
// Cidade, o jogador deve receber um resumo contextual... usando apenas
// informações já existentes". Reaproveita `RecentFind[]`/
// `BackpackSignals` (Backpack Experience Phase I) — nenhum estado
// novo, nenhuma consulta nova: só uma composição de frases em cima do
// que a Mochila já calcula.
export function buildCityWelcomeLines(recentFinds: readonly RecentFind[], signals: BackpackSignals): string[] {
  const lines: string[] = ["Você acaba de retornar da expedição."];

  if (recentFinds.length > 0) {
    lines.push(`Sua mochila trouxe ${recentFinds.length} ${recentFinds.length === 1 ? "novo item" : "novos itens"}.`);
    lines.push("O Ferreiro talvez tenha interesse neles.");
    lines.push("O Mercador pode avaliar seus itens.");
  } else if (signals.fullness === "cheia") {
    lines.push("Sua mochila está cheia de equipamentos acumulados.");
    lines.push("Talvez seja hora de organizar tudo com o Ferreiro ou o Mercador.");
  } else {
    lines.push("Por enquanto, nada novo pra resolver — só descansar.");
  }

  return lines;
}
