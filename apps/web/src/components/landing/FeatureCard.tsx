interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

// Sprint Landing Page 2.0 — cartão reaproveitado pelos 6 destaques logo
// abaixo do Hero. Só apresentação: ícone + título + descrição curta,
// nenhum dado de gameplay.
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <span className="feature-card-icon">{icon}</span>
      <strong className="feature-card-title">{title}</strong>
      <p className="feature-card-description">{description}</p>
    </div>
  );
}
