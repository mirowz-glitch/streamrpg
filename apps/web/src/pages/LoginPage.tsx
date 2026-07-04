import { useState } from "react";
import { getLoginUrl } from "../lib/api";
import { LandingBackground } from "../components/landing/LandingBackground";
import { HeroSection } from "../components/landing/HeroSection";
import { FeatureCard } from "../components/landing/FeatureCard";
import { HowItWorks } from "../components/landing/HowItWorks";
import { WorldPreview } from "../components/landing/WorldPreview";
import { KingdomPreview } from "../components/landing/KingdomPreview";
import { CityPreview } from "../components/landing/CityPreview";
import { CharacterPreview } from "../components/landing/CharacterPreview";
import { FinalCTA } from "../components/landing/FinalCTA";

const FEATURES = [
  { icon: "⚔", title: "Evolua", description: "Ganhe experiência automaticamente enquanto assiste." },
  { icon: "🌎", title: "Explore", description: "Viaje por um mundo vivo, região por região." },
  { icon: "👑", title: "Reino", description: "Ajude sua comunidade a crescer e conquistar cargos." },
  { icon: "🐉", title: "Bosses", description: "Enfrente chefes gigantes ao lado de outros espectadores." },
  { icon: "🎒", title: "Equipamentos", description: "Descubra itens raros em suas aventuras." },
  { icon: "🏆", title: "Prestígio", description: "Construa sua história — e a do seu Reino." },
];

// Sprint Landing Page 2.0 — primeira impressão do StreamRPG. Login
// (`handleLogin`) é compartilhado entre HeroSection e FinalCTA; todo o
// resto da página é composição de componentes de `components/landing/`
// e de componentes já existentes do jogo, reaproveitados como vitrine.
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await getLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <LandingBackground />

      <HeroSection onLogin={() => void handleLogin()} loading={loading} error={error} />

      <section className="landing-section">
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Como funciona</h2>
        <HowItWorks />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Um mundo para explorar</h2>
        <WorldPreview />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Cada Reino tem sua própria história</h2>
        <KingdomPreview />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">A Capital espera por você</h2>
        <CityPreview />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Seu personagem, sua jornada</h2>
        <CharacterPreview />
      </section>

      <FinalCTA onLogin={() => void handleLogin()} loading={loading} />
    </main>
  );
}
