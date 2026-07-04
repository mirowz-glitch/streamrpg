import type { ReactNode } from "react";

export interface StatItem {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

interface StatsRowProps {
  items: StatItem[];
}

// Extraído de 7 telas (Personagem, Mundo, Cidade, Arena, Banco,
// Expedição, Identidade) que repetiam a mesma estrutura
// `.identity-stats`/`.identity-stat` — mesmo HTML e mesmas classes de
// sempre, nenhuma mudança de aparência.
export function StatsRow({ items }: StatsRowProps) {
  return (
    <div className="identity-stats">
      {items.map((item, index) => (
        <div key={index} className={`identity-stat${item.highlight ? " identity-stat-highlight" : ""}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
