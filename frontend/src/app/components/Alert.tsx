export function Alert({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: React.ReactNode;
}) {
  const palette =
    kind === "error"
      ? { bg: "#FFF1F0", border: "#C4122E", text: "#7C2734", icon: "⚠" }
      : { bg: "#F0F7E8", border: "#5C6B3F", text: "#3D4A26", icon: "🍻" };

  return (
    <div
      className="border-l-4 px-4 py-2.5 rounded-r-md text-sm font-medium flex items-start gap-2"
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
        color: palette.text,
      }}
      role={kind === "error" ? "alert" : "status"}
    >
      <span className="leading-none translate-y-0.5">{palette.icon}</span>
      <span>{children}</span>
    </div>
  );
}
