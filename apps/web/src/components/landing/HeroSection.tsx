import { HeroIllustration } from "./HeroIllustration";

interface HeroSectionProps {
  onPlay: () => void;
  onLogin: () => void;
  loading: boolean;
  error: string | null;
}

// Front Door Experience — Vertical Slice Phase I — Fase 3 (Primary
// CTA) + Fase 2 (Product Positioning): achado da Sprint anterior — a
// única ação possível aqui era um login real da Twitch, mesmo a
// Cidade/Aventura sendo 100% jogáveis sem conta. Agora existem duas
// ações claramente diferentes: "Jogar Agora" (leva direto pra
// `/app/city`, nunca pede login) como CTA primário, e "Entrar com
// Twitch" como secundário, com uma linha explicando o que o login
// realmente adiciona — nunca descoberto por tentativa e erro (Fase 5).
export function HeroSection({ onPlay, onLogin, loading, error }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Stream<span className="hero-title-accent">RPG</span>
        </h1>
        <p className="hero-tagline">
          Explore um mundo vivo, enfrente monstros e evolua seu personagem — jogue agora mesmo, sem conta.
        </p>
        <div className="hero-cta-group">
          <button type="button" className="hero-cta hero-cta-primary" onClick={onPlay}>
            🎮 Jogar Agora
          </button>
          <button type="button" className="hero-cta hero-cta-secondary" onClick={onLogin} disabled={loading}>
            {loading ? "Redirecionando..." : "Entrar com Twitch"}
          </button>
        </div>
        <p className="hero-cta-note">
          Jogar Agora não exige login. Entrar com Twitch é opcional — vincula seu personagem à sua live e adiciona XP automático enquanto você transmite, Reino e Prestígio da sua comunidade.
        </p>
        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="hero-illustration">
        <HeroIllustration />
      </div>
    </section>
  );
}
