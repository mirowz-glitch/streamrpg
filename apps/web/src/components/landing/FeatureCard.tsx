interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  // Front Door Experience — Vertical Slice Phase I — Fase 2 (Product
  // Positioning): opcional, só nos destaques que realmente exigem
  // login (Twitch/Reino) — nunca nos que já funcionam em Jogar Agora.
  badge?: string;
}

// Sprint Landing Page 2.0 — cartão reaproveitado pelos 6 destaques logo
// abaixo do Hero. Só apresentação: ícone + título + descrição curta,
// nenhum dado de gameplay.
export function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <span className="feature-card-icon">{icon}</span>
      <strong className="feature-card-title">{title}</strong>
      <p className="feature-card-description">{description}</p>
      {badge ? <span className="feature-card-badge">{badge}</span> : null}
    </div>
  );
}
