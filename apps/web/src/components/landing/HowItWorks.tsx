const STEPS = [
  { icon: "🟣", text: "Entrar com Twitch" },
  { icon: "📺", text: "Escolha uma live" },
  { icon: "✨", text: "Seu personagem nasce" },
  { icon: "🗺️", text: "Explora o mundo" },
  { icon: "🐉", text: "Enfrenta Bosses" },
  { icon: "🏆", text: "Constrói seu legado" },
];

// Sprint Landing Page 2.0 — "Como funciona", 6 passos reais (login,
// ping por canal, criação de personagem, expedições, Boss, Prestígio) —
// tudo sistemas que já existem, nenhum passo inventado.
export function HowItWorks() {
  return (
    <ol className="how-it-works">
      {STEPS.map((step, index) => (
        <li key={step.text} className="how-it-works-step">
          <span className="how-it-works-number">{index + 1}</span>
          <span className="how-it-works-icon">{step.icon}</span>
          <span className="how-it-works-text">{step.text}</span>
        </li>
      ))}
    </ol>
  );
}
