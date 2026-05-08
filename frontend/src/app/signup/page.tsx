"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/auth";
import { Alert } from "@/app/components/Alert";
import { NavBar } from "@/app/components/NavBar";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no cadastro");
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
          Pedir Lugar na Mesa
        </h1>
        <p
          className="text-center text-gray-600 mb-6 text-lg"
          style={{ fontFamily: "var(--font-handwritten)" }}
        >
          Faz a tua entrada no balcão
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={4}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-carimbo w-full bg-[#C4122E] text-white font-black uppercase tracking-widest py-3 rounded-md hover:bg-[#A30F26] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#C4122E] font-bold hover:underline">
            Voltar à mesa
          </Link>
        </p>
      </div>
      </div>
    </main>
  );
}
