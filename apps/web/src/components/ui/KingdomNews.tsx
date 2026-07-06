import { memo, useMemo } from "react";
import type { KingdomNewsItem } from "@streamrpg/shared";

interface KingdomNewsProps {
  items: KingdomNewsItem[];
}

// Sprint Kingdom News (MVP) — mesma estrutura da Timeline (mesmo arquivo
// nunca alterado): item extraído para memoizar por notícia, já que o
// backend nunca reescreve uma notícia passada. Reaproveita as classes
// `.timeline-list`/`.timeline-time` tal como já existem — mesma
// linguagem visual, nenhum CSS novo.
const KingdomNewsItemRow = memo(function KingdomNewsItemRow({ item }: { item: KingdomNewsItem }) {
  return (
    <li>
      <span className="timeline-time">
        {new Date(item.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </span>
      <span>
        {item.icon} {item.text}
      </span>
    </li>
  );
});

// Sem botão, sem interação (Interface pedida) — só as últimas 10
// notícias (limite já aplicado no backend, KingdomNewsSystem), mais
// recente primeiro.
export function KingdomNews({ items }: KingdomNewsProps) {
  const reversed = useMemo(() => [...items].reverse(), [items]);

  if (items.length === 0) {
    return <p className="timeline-idle">O Reino ainda não tem novidades nesta sessão.</p>;
  }

  return (
    <ul className="timeline-list">
      {reversed.map((item) => (
        <KingdomNewsItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
}
