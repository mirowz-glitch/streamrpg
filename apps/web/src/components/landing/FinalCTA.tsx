interface FinalCTAProps {
  onLogin: () => void;
  loading: boolean;
}

// Sprint Landing Page 2.0 — chamada final, fim da página. Mesmo login
// já usado no Hero (`onLogin` compartilhado), botão grande.
export function FinalCTA({ onLogin, loading }: FinalCTAProps) {
  return (
    <section className="final-cta">
      <h2 className="final-cta-title">Seu personagem nunca para.</h2>
      <p className="final-cta-subtitle">Mesmo quando você apenas assiste.</p>
      <button type="button" className="hero-cta final-cta-button" onClick={onLogin} disabled={loading}>
        {loading ? "Redirecionando..." : "Entrar com Twitch"}
      </button>
    </section>
  );
}
