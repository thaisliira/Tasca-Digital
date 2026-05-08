import Link from "next/link";

export function NavBar({ children }: { children?: React.ReactNode }) {
  return (
    <nav className="sticky top-0 z-50 bg-[#C4122E] shadow-lg border-b-4 border-[#6B0F1E]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-3xl text-white"
            style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
          >
            Tasca<span className="text-[#E5B044]">Digital</span>
          </span>
        </Link>
        {children}
      </div>
    </nav>
  );
}
