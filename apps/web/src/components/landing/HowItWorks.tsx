const STEPS = [
  { icon: "🏰", text: "Jogue Agora e entre na Cidade — sem login" },
  { icon: "🚪", text: "No Portão Norte, siga para a Aventura" },
  { icon: "⚔", text: "Explore regiões e enfrente inimigos" },
  { icon: "🎒", text: "Encontre equipamentos e suba de nível" },
  { icon: "🟣", text: "Opcional: entre com Twitch" },
  { icon: "👑", text: "Seu Reino cresce enquanto você transmite" },
];

// Front Door Experience — Vertical Slice Phase I — Fase 4 (Navigation
// Flow): achado da Sprint anterior — os 6 passos aqui eram todos
// Twitch-primeiro, mesmo o jogo real começando pela Cidade sem
// precisar de login nenhum. Reescrito pra seguir a ordem real —
// Cidade → Portão Norte → Aventura → Combate → Loot/Nível — com a
// Twitch marcada como o que sempre foi: um passo opcional, no final,
// nunca um pré-requisito pra jogar.
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
