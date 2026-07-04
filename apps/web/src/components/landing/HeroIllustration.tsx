// Sprint Landing Page 2.0 — "Grande arte ilustrada" do Hero: castelo,
// montanhas, bosque, aventureiros e um Boss gigante ao fundo. Tudo
// desenhado com shapes/gradientes simples (sem IA, sem imagem pesada) —
// uma cena estática, sem animação.
const TREES = [
  { x: 40, h: 46 }, { x: 90, h: 60 }, { x: 150, h: 40 }, { x: 205, h: 66 },
  { x: 265, h: 48 }, { x: 320, h: 58 }, { x: 700, h: 44 }, { x: 755, h: 60 },
  { x: 815, h: 40 }, { x: 1370, h: 50 }, { x: 1425, h: 62 }, { x: 1480, h: 42 },
  { x: 1530, h: 56 },
];

const ADVENTURERS = [
  { x: 470, scale: 1 },
  { x: 500, scale: 0.85 },
  { x: 535, scale: 1.1 },
];

function Tree({ x, h }: { x: number; h: number }) {
  const baseY = 470;
  return <polygon points={`${x},${baseY - h} ${x - h * 0.55},${baseY} ${x + h * 0.55},${baseY}`} fill="#0f2417" />;
}

function Adventurer({ x, scale }: { x: number; scale: number }) {
  const baseY = 468;
  const s = scale;
  return (
    <g transform={`translate(${x} ${baseY}) scale(${s})`} fill="#120c1e">
      <circle cx="0" cy="-16" r="4.5" />
      <polygon points="-4,-11 4,-11 6,4 -6,4" />
    </g>
  );
}

export function HeroIllustration() {
  return (
    <svg
      className="hero-illustration-svg"
      viewBox="0 0 1600 500"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Um castelo diante de montanhas, com um Boss gigante ao fundo e aventureiros pelo caminho."
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1236" />
          <stop offset="100%" stopColor="#100a1f" />
        </linearGradient>
        <radialGradient id="hero-boss-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff3b3b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-castle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2340" />
          <stop offset="100%" stopColor="#181228" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1600" height="500" fill="url(#hero-sky)" />

      {/* Lua */}
      <circle cx="1420" cy="80" r="46" fill="#e8e2ff" opacity="0.18" />

      {/* Boss gigante ao fundo, atrás da cordilheira */}
      <circle cx="760" cy="250" r="230" fill="url(#hero-boss-glow)" />
      <g fill="#140a1f">
        <ellipse cx="760" cy="330" rx="200" ry="130" />
        <circle cx="760" cy="205" r="66" />
        <polygon points="700,150 715,110 730,155" />
        <polygon points="790,155 805,110 820,150" />
      </g>
      <circle cx="740" cy="200" r="5.5" fill="#ff3b3b" />
      <circle cx="782" cy="200" r="5.5" fill="#ff3b3b" />

      {/* Cordilheira distante (oculta a base do Boss) */}
      <polygon
        points="0,320 120,250 260,300 400,220 540,270 620,245 700,268 800,200 940,268 1080,230 1220,290 1360,240 1600,300 1600,500 0,500"
        fill="#241a40"
      />

      {/* Cordilheira mais próxima */}
      <polygon
        points="0,500 0,390 160,310 340,380 520,290 700,370 880,300 1060,380 1240,310 1420,390 1600,320 1600,500"
        fill="#191228"
      />

      {/* Bosque na base */}
      {TREES.map((t) => (
        <Tree key={t.x} x={t.x} h={t.h} />
      ))}

      {/* Trilha até o castelo */}
      <polygon points="380,500 620,500 900,420 860,410 420,470" fill="#241d33" opacity="0.6" />

      {/* Castelo */}
      <g>
        <rect x="1080" y="330" width="220" height="140" fill="url(#hero-castle)" />
        <rect x="1080" y="300" width="26" height="40" fill="url(#hero-castle)" />
        <rect x="1274" y="300" width="26" height="40" fill="url(#hero-castle)" />
        <rect x="1170" y="260" width="60" height="80" fill="url(#hero-castle)" />
        <polygon points="1080,260 1106,260 1093,238" fill="#3a2f56" />
        <polygon points="1274,260 1300,260 1287,238" fill="#3a2f56" />
        <polygon points="1170,220 1230,220 1200,190" fill="#3a2f56" />
        {/* ameias */}
        {[1090, 1112, 1134, 1156, 1246, 1268, 1290].map((cx) => (
          <rect key={cx} x={cx} y="322" width="12" height="12" fill="url(#hero-castle)" />
        ))}
        {/* bandeira */}
        <line x1="1200" y1="190" x2="1200" y2="160" stroke="#3a2f56" strokeWidth="3" />
        <polygon points="1200,160 1230,170 1200,180" fill="#9146ff" />
      </g>

      {/* Aventureiros a caminho do castelo, minúsculos perto do Boss gigante */}
      {ADVENTURERS.map((a) => (
        <Adventurer key={a.x} x={a.x} scale={a.scale} />
      ))}
    </svg>
  );
}
