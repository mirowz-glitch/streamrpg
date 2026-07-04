import { memo } from "react";

// Sprint NPCs Vivos — ambientação da Praça Central. Puramente visual,
// sem animação: bandeiras, brasão, árvores, banco da praça e fonte, só
// para a cidade parecer um lugar, não uma lista de botões.
const DECOR_ITEMS = [
  { icon: "🚩", label: "Bandeiras do Reino" },
  { icon: "🛡️", label: "Brasão do Reino" },
  { icon: "🌳", label: "Árvores" },
  { icon: "🪑", label: "Banco da praça" },
  { icon: "⛲", label: "Fonte" },
];

// Sprint Performance Optimization — sem props, conteúdo 100% estático;
// memo evita recriar esta faixa decorativa a cada re-renderização da
// Praça Central (ex: o relógio a cada segundo).
export const CitySquareDecor = memo(function CitySquareDecor() {
  return (
    <div className="city-square-decor">
      {DECOR_ITEMS.map((item) => (
        <span key={item.label} className="city-decor-item" title={item.label}>
          {item.icon}
        </span>
      ))}
    </div>
  );
});
