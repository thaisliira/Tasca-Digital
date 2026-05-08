"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, logout, updateProfile, type User } from "@/lib/auth";
import { Carica } from "@/app/components/Carica";
import { BeerGlassLoader } from "@/app/components/BeerGlassLoader";
import { Alert } from "@/app/components/Alert";
import { NavBar } from "@/app/components/NavBar";
import { Sidebar } from "@/app/components/Sidebar";

const CARICA_COLORS = [
  "#C4122E",
  "#E5B044",
  "#7C2734",
  "#5C6B3F",
  "#2C5F8A",
  "#8B4513",
  "#1A1A1A",
  "#6B0F1E",
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [avatarColor, setAvatarColor] = useState("#C4122E");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    getMe()
      .then((u) => {
        if (!u) {
          router.replace("/login");
          return;
        }
        setUser(u);
        setName(u.name);
        setDepartment(u.department || "");
        setAvatarColor(u.avatar_color || "#C4122E");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const wantsPasswordChange =
      currentPassword.length > 0 || newPassword.length > 0;
    if (wantsPasswordChange && (!currentPassword || newPassword.length < 6)) {
      setError("Para mudar a senha preenche a atual e uma nova com 6+ caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile({
        name: name !== user?.name ? name : undefined,
        department: department !== (user?.department || "") ? department : undefined,
        avatar_color: avatarColor !== user?.avatar_color ? avatarColor : undefined,
        current_password: wantsPasswordChange ? currentPassword : undefined,
        new_password: wantsPasswordChange ? newPassword : undefined,
      });

      setUser((prev) => (prev ? { ...prev, name, department, avatar_color: avatarColor } : prev));
      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Freguês atualizado! 🍻");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-wood">
        <BeerGlassLoader />
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-wood">
      <NavBar>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="cursor-pointer text-sm font-bold text-white/80 hover:text-white transition-colors"
          >
            Sair da Mesa
          </button>
          <Carica name={user.name} color={user.avatar_color || "#1A1A1A"} size={42} />
        </div>
      </NavBar>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Sidebar user={user} />

          <section className="col-span-1 md:col-span-3">
            <div className="bg-napkin rounded-2xl p-8">
          <h1
            className="text-4xl text-[#1A1A1A] text-center"
            style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
          >
            Ficha do Freguês
          </h1>
          <p
            className="text-center text-gray-600 text-lg mb-8"
            style={{ fontFamily: "var(--font-handwritten)" }}
          >
            Atualiza a tua ficha na tasca
          </p>

          {/* PRÉ-VISUALIZAÇÃO DA CARICA */}
          <div className="flex flex-col items-center mb-8 pb-6 border-b border-[#D4C5A8]">
            <Carica name={name || "?"} color={avatarColor} size={96} />
            <p className="mt-3 font-black text-xl text-[#1A1A1A]">{name || "Sem nome"}</p>
            <p className="text-sm text-gray-600">{department || "Freguês da casa"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* COR DA CARICA */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-2">
                Cor da Carica
              </label>
              <div className="grid grid-cols-8 gap-2">
                {CARICA_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    aria-label={`Cor ${c}`}
                    className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${
                      avatarColor === c
                        ? "border-[#1A1A1A] ring-2 ring-[#E5B044] scale-110"
                        : "border-white/60"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* NOME */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
              >
                Freguês
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={4}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
              />
            </div>

            {/* DEPARTAMENTO */}
            <div>
              <label
                htmlFor="department"
                className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
              >
                Ofício
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex: Engenharia, Marketing, Freguês da casa..."
                className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
              />
            </div>

            {/* SECÇÃO DE SENHA */}
            <div className="pt-4 mt-4 border-t border-[#D4C5A8]">
              <p
                className="text-2xl text-[#7C2734] mb-1"
                style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
              >
                Mudar Senha
              </p>
              <p className="text-xs text-gray-500 mb-3 italic">
                (opcional — preenche os dois campos só se quiseres mudar)
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="current_password"
                    className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
                  >
                    Senha Atual
                  </label>
                  <input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
                  >
                    Nova Senha
                  </label>
                  <input
                    id="new_password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>
              </div>
            </div>

            {error && <Alert kind="error">{error}</Alert>}
            {success && <Alert kind="success">{success}</Alert>}

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-[#1A1A1A] font-bold"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn-carimbo bg-[#C4122E] text-white px-7 py-3 rounded-md font-black uppercase text-xs tracking-widest hover:bg-[#A30F26] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "A guardar..." : "Guardar Mesa"}
              </button>
            </div>
          </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
