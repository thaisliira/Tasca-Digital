"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { NavBar } from "@/app/components/NavBar";
import { BeerGlassLoader } from "@/app/components/BeerGlassLoader";
import { PublicPreview } from "@/app/components/PublicPreview";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((u) => {
        if (u) {
          router.replace("/dashboard");
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-wood">
        <BeerGlassLoader />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-wood text-[#1A1A1A]">
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="max-w-3xl mx-auto text-center mt-16 px-4">
          <h1
            className="text-6xl md:text-8xl font-bold text-[#F5E6D3] mb-6 tracking-tight drop-shadow-xl"
            style={{
              fontFamily: "var(--font-handwritten)",
              lineHeight: 0.9,
              transform: "rotate(-1.5deg)"
            }}
          >
            <span className="text-[#C4122E]">Tasca Digital:</span> <br/>
            Aqui manda-se a posta e bate-se o copo.
          </h1>

          {/* SUBTÍTULO / SLOGAN */}
          <p
            className="text-xl md:text-2xl text-[#F5E6D3]/80 mb-12 font-medium italic tracking-wide max-w-2xl mx-auto"
          >
            Só para quem não tem tempo para paneleirices.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="btn-carimbo bg-[#C4122E] text-white font-black uppercase tracking-widest px-10 py-4 rounded-md hover:bg-[#A30F26]"
            >
              Pedir Lugar na Mesa
            </Link>
            <Link
              href="/login"
              className="bg-[#F5E6D3] text-[#1A1A1A] font-black uppercase tracking-widest px-10 py-4 rounded-md border-2 border-[#1A1A1A] hover:bg-[#FAF1DD] transition"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* A JANELA DA TASCA — preview público com fade + CTA */}
        <PublicPreview />

      </div>
    </main>
  );
}
