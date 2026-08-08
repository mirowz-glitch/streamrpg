import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginUrl, api } from "../lib/api";
import { LandingBackground } from "../components/landing/LandingBackground";
import { HeroSection } from "../components/landing/HeroSection";
import { FeatureCard } from "../components/landing/FeatureCard";
import { HowItWorks } from "../components/landing/HowItWorks";
import { WorldPreview } from "../components/landing/WorldPreview";
import { KingdomPreview } from "../components/landing/KingdomPreview";
import { CityPreview } from "../components/landing/CityPreview";
import { CharacterPreview } from "../components/landing/CharacterPreview";
import { WorldSimulationPreview } from "../components/landing/WorldSimulationPreview";
import { FinalCTA } from "../components/landing/FinalCTA";
import { GLOBAL_HIGHLIGHT_PRIORITY, getLiveHighlights } from "../lib/liveReadiness";

// Front Door Experience — Vertical Slice Phase I — Fase 1/2 (Audit +
// Positioning): antes desta Sprint, os 6 destaques eram todos escritos
// como se o jogo só existisse passivamente, assistindo uma live
// (achado "enganoso" da auditoria — nenhum menciona explorar, lutar ou
// equipar, que é o que a Cidade/Aventura já entregam hoje sem login).
// Reescrito em duas camadas honestas: 4 que já funcionam em "Jogar
// Agora" (sem badge) e 2 que dependem de vincular a Twitch (com
// badge visível, nunca escondido) — nenhuma promessa de recurso que
// não existe (ex.: Bosses aqui nunca foi multiplayer real com outros
// espectadores, por isso essa reformulação não repete essa alegação).
//
// World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 8 — o card "Reino"
// dizia "Requer login Twitch", mas Kingdom Domain/Citizen System (Sprints
// 2/3, já implementadas) tornaram Reino/Cidadania acessíveis com
// QUALQUER login (Twitch, E-mail, ...) — corrigido para não sugerir mais
// uma dependência de Twitch especificamente que não existe.
const FEATURES = [
  { icon: "⚔", title: "Combate", description: "Enfrente inimigos em expedições ativas, sem precisar de conta." },
  { icon: "🎒", title: "Equipamentos", description: "Encontre itens e evolua seu personagem a cada aventura." },
  { icon: "🌎", title: "Explore", description: "Viaje por um mundo com várias regiões, cada uma com sua própria identidade." },
  { icon: "🐉", title: "Chefes", description: "Enfrente elites, mini-chefes e chefes finais nas profundezas do mundo." },
  { icon: "👑", title: "Reino", description: "Funde ou entre em um Reino, construa Casas e participe do Mercado — com qualquer conta.", badge: "Requer login" },
  { icon: "📺", title: "Twitch", description: "Vincule sua live: seu personagem ganha XP automaticamente enquanto você transmite.", badge: "Requer login Twitch" },
];

// Sprint Landing Page 2.0 — primeira impressão do StreamRPG. Login
// (`handleLogin`) é compartilhado entre HeroSection e FinalCTA; todo o
// resto da página é composição de componentes de `components/landing/`
// e de componentes já existentes do jogo, reaproveitados como vitrine.
export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 7/8 — segundo
  // caminho real de login, provando que "o jogo funciona sem Twitch" não
  // é só uma frase: E-mail é "login core" (docs/design/login-providers.md),
  // chega no MESMO Character que o botão Twitch abaixo, sem nenhuma
  // vantagem/diferença. Google/Discord/Kick/YouTube exigem credenciais de
  // app OAuth que este ambiente não tem — ver Fase 14 da entrega.
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Front Door Experience — Vertical Slice Phase I — Fase 3 (Primary
  // CTA): leva direto pra Cidade — o hub real do Vertical Slice, de
  // onde o Portão Norte (corrigido nesta mesma Sprint) leva à
  // Aventura. Nunca passa por login.
  function handlePlay() {
    navigate("/app/city");
  }

  // Sprint Live Readiness Phase I (First 5 Minutes) — a Landing Page é
  // a vitrine da live: sem jogador real, nenhuma camada reativa (Legacy/
  // Kingdom Reputation/Personal Chronicle/Expedition Specialization)
  // jamais teria algo pra mostrar num visitante anônimo — exatamente o
  // achado da auditoria ("informações importantes aparecem tarde
  // demais"). Por isso os 3 candidatos aqui são fixos e determinísticos
  // (nunca dependem de dado real), decididos pela mesma camada central
  // (lib/liveReadiness.ts) que todo o resto do app usa — garante nunca
  // mais que 3 e nunca menos que 1, sem depender de sorte.
  const landingHighlights = getLiveHighlights(GLOBAL_HIGHLIGHT_PRIORITY, {
    expedition: true,
    npc: true,
    region: true,
  });

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

  async function handleEmailLogin() {
    setEmailLoading(true);
    setEmailError(null);
    try {
      await api.post("/api/auth/email", { email });
      navigate("/app/character");
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <LandingBackground />

      <HeroSection onPlay={handlePlay} onLogin={() => void handleLogin()} loading={loading} error={error} />

      {/* World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 7/8 —
          formulário mínimo, deliberadamente simples (sem redesenho de
          UI): prova que o jogo tem um segundo caminho de login real,
          sem Twitch, chegando no mesmo Character. */}
      <section className="landing-section">
        <div className="login-clarity-card" style={{ maxWidth: "420px", margin: "0 auto" }}>
          <strong>Entrar com e-mail</strong>
          <p>Sem Twitch, sem senha nesta versão — só o e-mail para criar ou continuar sua conta.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleEmailLogin();
            }}
            style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={emailLoading}
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={emailLoading || !email}>
              {emailLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          {emailError ? <p className="error">{emailError}</p> : null}
        </div>
      </section>

      <section className="landing-section">
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              badge={"badge" in feature ? feature.badge : undefined}
            />
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Como funciona</h2>
        <HowItWorks />
      </section>

      {/* Front Door Experience — Vertical Slice Phase I — Fase 5 (Login
          Strategy): resposta explícita e permanente às 5 perguntas do
          brief — nunca descoberta por tentativa e erro. Sem isso, um
          visitante só saberia o que precisa de login clicando em cada
          botão da navegação (achado da Sprint anterior).

          World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 8 — o card
          "Com login Twitch" afirmava que Mundo/Reino exigiam Twitch
          especificamente — falso desde Kingdom Domain/Citizen System
          (Sprints 2/3): qualquer conta (Twitch, e-mail, ...) já basta.
          Reescrito para separar o que qualquer conta desbloqueia do que
          só Twitch (como integração opcional) adiciona por cima. */}
      <section className="landing-section">
        <h2 className="landing-section-title">O que precisa de login?</h2>
        <div className="login-clarity-grid">
          <div className="login-clarity-card">
            <strong>Sem login</strong>
            <p>Cidade, Aventura, exploração, combate, loot e progressão do personagem — tudo funciona no seu navegador, sem criar conta.</p>
          </div>
          <div className="login-clarity-card">
            <strong>Com uma conta (qualquer uma)</strong>
            <p>Funda ou entre em um Reino, construa Casas, participe do Mercado, acumule sua Crônica — com Twitch, e-mail, ou qualquer provedor. Vincular Twitch adicionalmente dá XP automático enquanto você transmite e Prestígio de comunidade ao vivo.</p>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Um mundo para explorar</h2>
        <WorldPreview highlighted={landingHighlights.includes("region")} />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Cada Reino tem sua própria história</h2>
        <KingdomPreview />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">A Capital espera por você</h2>
        <CityPreview highlighted={landingHighlights.includes("npc")} />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Seu personagem, sua jornada</h2>
        <CharacterPreview />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Prévia do mundo</h2>
        <WorldSimulationPreview />
      </section>

      <FinalCTA onPlay={handlePlay} onLogin={() => void handleLogin()} loading={loading} />
    </main>
  );
}
