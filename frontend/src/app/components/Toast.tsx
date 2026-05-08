const palette = {
  info: { border: "#E5B044", icon: "🍻" },
  error: { border: "#C4122E", icon: "⚠️" },
};

export type ToastKind = keyof typeof palette;

export function Toast({
  message,
  kind = "info",
  icon,
}: {
  message: string;
  kind?: ToastKind;
  icon?: string;
}) {
  const p = palette[kind];
  return (
    <div
      className="bg-napkin border-l-4 px-4 py-3 rounded-r-lg shadow-xl flex items-center gap-3 min-w-[260px] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300"
      style={{ borderLeftColor: p.border }}
      role={kind === "error" ? "alert" : "status"}
    >
      <span className="text-2xl flex-shrink-0">{icon ?? p.icon}</span>
      <span
        className="text-base text-[#1A1A1A] leading-tight"
        style={{ fontFamily: "var(--font-handwritten)" }}
      >
        {message}
      </span>
    </div>
  );
}
