export function BeerGlassLoader({ message = "A tirar um fino..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 100 130" width="84" height="110" className="drop-shadow-md">
        <defs>
          <clipPath id="glass-clip">
            <path d="M 22 14 L 78 14 L 73 122 L 27 122 Z" />
          </clipPath>
        </defs>
        {/* Asa */}
        <path
          d="M 78 32 Q 96 32 96 60 Q 96 88 78 88"
          fill="none"
          stroke="#1A1A1A"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Vidro (fundo) */}
        <path
          d="M 22 14 L 78 14 L 73 122 L 27 122 Z"
          fill="rgba(255, 255, 255, 0.18)"
          stroke="#1A1A1A"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Líquido a encher */}
        <g clipPath="url(#glass-clip)">
          <rect
            x="22"
            y="14"
            width="56"
            height="108"
            fill="#E5B044"
            className="beer-liquid"
          />
          {/* Bolhas */}
          <circle cx="40" cy="105" r="2" fill="rgba(255,255,255,0.55)" className="beer-liquid" />
          <circle cx="58" cy="92" r="1.5" fill="rgba(255,255,255,0.45)" className="beer-liquid" />
          <circle cx="48" cy="80" r="2.2" fill="rgba(255,255,255,0.5)" className="beer-liquid" />
        </g>
        {/* Espuma */}
        <g clipPath="url(#glass-clip)" className="beer-foam">
          <ellipse cx="50" cy="22" rx="32" ry="11" fill="#FAF5E6" />
          <ellipse cx="38" cy="18" rx="9" ry="5" fill="#FFFFFF" />
          <ellipse cx="58" cy="20" rx="7" ry="4" fill="#FFFFFF" />
        </g>
      </svg>
      <p
        className="font-bold animate-pulse text-[#E5B044]"
        style={{ fontFamily: "var(--font-handwritten)", fontSize: "1.4rem" }}
      >
        {message}
      </p>
    </div>
  );
}
