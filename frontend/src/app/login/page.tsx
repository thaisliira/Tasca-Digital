"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { Alert } from "@/app/components/Alert";
import { NavBar } from "@/app/components/NavBar";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-wood flex flex-col">
      <NavBar />
      <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-napkin rounded-2xl p-8">
        <h1
          className="text-3xl text-[#1A1A1A] text-center"
          style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
        >
          Voltar à Mesa
        </h1>
        <p
          className="text-center text-gray-600 mb-6 text-lg"
          style={{ fontFamily: "var(--font-handwritten)" }}
        >
          Bem-vindo de volta ao balcão
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
            />
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-carimbo w-full bg-[#C4122E] text-white font-black uppercase tracking-widest py-3 rounded-md hover:bg-[#A30F26] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-[#C4122E] font-bold hover:underline">
            Pedir lugar na mesa
          </Link>
        </p>
      </div>
      </div>
    </main>
  );
}
