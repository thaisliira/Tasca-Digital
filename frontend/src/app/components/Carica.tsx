import { useId } from "react";

export function Carica({
  name,
  color = "#C4122E",
  size = 40,
  className = "",
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const rawId = useId();
  const gradientId = `carica-shine-${rawId.replace(/:/g, "_")}`;
  const initial = (name?.charAt(0) ?? "?").toUpperCase();
  const teeth = 22;
  const points: string[] = [];
  const cx = 50;
  const cy = 50;
  const rOuter = 48;
  const rInner = 43;

  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  const fontSize = Math.round(size * 0.45);

  return (
    <div
      className={`relative inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Carica de ${name}`}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </radialGradient>
        </defs>
        {/* Borda serrilhada (a tampa propriamente dita) */}
        <polygon points={points.join(" ")} fill={color} />
        {/* Anel interno mais escuro para dar profundidade */}
        <circle cx="50" cy="50" r="36" fill="rgba(0,0,0,0.18)" />
        {/* Disco central */}
        <circle cx="50" cy="50" r="34" fill={color} />
        {/* Brilho 3D no canto superior esquerdo */}
        <circle cx="50" cy="50" r="34" fill={`url(#${gradientId})`} />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-black text-white"
        style={{
          fontSize,
          textShadow: "0 1px 2px rgba(0,0,0,0.45)",
          letterSpacing: "-0.02em",
        }}
      >
        {initial}
      </div>
    </div>
  );
}
