interface FinalCTAProps {
  onPlay: () => void;
  onLogin: () => void;
  loading: boolean;
}

// Front Door Experience — Vertical Slice Phase I — Fase 3: mesmo
// tratamento do Hero (dois CTAs, nunca só o login da Twitch) — quem
// rolou a página inteira e chegou até aqui sem clicar em nada no Hero
// merece a mesma chance óbvia de simplesmente jogar.
export function FinalCTA({ onPlay, onLogin, loading }: FinalCTAProps) {
  return (
    <section className="final-cta">
      <h2 className="final-cta-title">Seu personagem está esperando.</h2>
      <p className="final-cta-subtitle">Jogue agora, sem conta — ou vincule sua Twitch para evoluir também enquanto transmite.</p>
      <div className="hero-cta-group final-cta-group">
        <button type="button" className="hero-cta hero-cta-primary final-cta-button" onClick={onPlay}>
          🎮 Jogar Agora
        </button>
        <button type="button" className="hero-cta hero-cta-secondary final-cta-button" onClick={onLogin} disabled={loading}>
          {loading ? "Redirecionando..." : "Entrar com Twitch"}
        </button>
      </div>
    </section>
  );
}
