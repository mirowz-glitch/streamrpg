import { HeroIllustration } from "./HeroIllustration";

interface HeroSectionProps {
  onLogin: () => void;
  loading: boolean;
  error: string | null;
}

// Sprint Landing Page 2.0 — primeira impressão do StreamRPG. Ocupa
// praticamente toda a tela: título, tagline, CTA e a cena ilustrada
// (castelo, montanhas, bosque, aventureiros, Boss gigante ao fundo)
// logo abaixo, tudo dentro da mesma seção.
export function HeroSection({ onLogin, loading, error }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Stream<span className="hero-title-accent">RPG</span>
        </h1>
        <p className="hero-tagline">
          Seu personagem vive enquanto você acompanha seus criadores favoritos.
        </p>
        <button type="button" className="hero-cta" onClick={onLogin} disabled={loading}>
          {loading ? "Redirecionando..." : "Entrar com Twitch"}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </div>
      <div className="hero-illustration">
        <HeroIllustration />
      </div>
    </section>
  );
}
