// Sprint Landing Page 2.0 — fundo ambiente fixo por trás de toda a
// página (não só o Hero). Puramente CSS/SVG: gradiente de céu + uma
// silhueta distante de montanhas + nuvens simples. Sem imagens, sem IA,
// sem animação — só profundidade visual atrás do conteúdo real.
export function LandingBackground() {
  return (
    <div className="landing-background" aria-hidden="true">
      <svg
        className="landing-background-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="landing-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#100a1f" />
            <stop offset="55%" stopColor="#1a1030" />
            <stop offset="100%" stopColor="#0e0e1a" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1600" height="900" fill="url(#landing-sky)" />

        {/* Nuvens distantes */}
        <g opacity="0.12" fill="#cfc4ff">
          <ellipse cx="220" cy="140" rx="120" ry="26" />
          <ellipse cx="340" cy="120" rx="80" ry="20" />
          <ellipse cx="1180" cy="90" rx="140" ry="28" />
          <ellipse cx="1320" cy="115" rx="90" ry="20" />
          <ellipse cx="760" cy="70" rx="100" ry="18" />
        </g>

        {/* Silhueta distante de montanhas, bem sutil */}
        <polygon
          points="0,620 140,520 300,600 460,470 640,580 820,500 1000,600 1180,480 1360,590 1600,510 1600,900 0,900"
          fill="#241a40"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
