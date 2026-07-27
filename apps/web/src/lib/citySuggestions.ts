import type { RecentFind } from "./backpackFinds";
import type { BackpackSignals } from "./backpackSignals";

// City Foundation Phase I — Fase 4 ("Sugestões Inteligentes"): "a
// Cidade deverá reagir ao Estado Global... utilizando apenas os sinais
// já implementados". Mercador reage a QUALQUER item novo (ele avalia
// tudo, equipado ou não); Ferreiro reage especificamente a itens
// AUTO-EQUIPADOS (peças novas de verdade no personagem, não só
// achadas) — a mesma distinção honesta que `RecentFind.autoEquipped`
// já carrega (Backpack Experience Phase I), nenhum dado novo.
export interface CityBuildingSuggestions {
  merchant: string | null;
  blacksmith: string | null;
  general: string | null;
}

export function buildCitySuggestions(recentFinds: readonly RecentFind[], signals: BackpackSignals): CityBuildingSuggestions {
  const autoEquippedCount = recentFinds.filter((find) => find.autoEquipped).length;

  return {
    merchant: recentFinds.length > 0 ? "O Mercador gostaria de ver sua mochila." : null,
    blacksmith: autoEquippedCount > 0 ? "O Ferreiro percebe novas peças interessantes." : null,
    // Fase 5 ("Fluxo Natural") — sugestão, nunca obrigação: mesmo
    // sinal que a própria Mochila já mostra (`suggestCityVisit`), só
    // reformulado como um convite a ORGANIZAR, já dentro da Cidade.
    general: signals.fullness === "cheia" ? "Talvez seja hora de organizar seus equipamentos." : null,
  };
}
