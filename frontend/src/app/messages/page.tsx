"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, type User } from "@/lib/auth";
import {
  getFregueses,
  getConversa,
  enviarMensagem,
  apagarConversa,
  type Freguês,
  type DirectMessage,
} from "@/lib/api";
import { Carica } from "@/app/components/Carica";
import { BeerGlassLoader } from "@/app/components/BeerGlassLoader";
import { NavBar } from "@/app/components/NavBar";
import { Sidebar } from "@/app/components/Sidebar";
import { Toast } from "@/app/components/Toast";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { Tooltip } from "@/app/components/Tooltip";

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fregueses, setFregueses] = useState<Freguês[]>([]);
  const [activeFriend, setActiveFriend] = useState<Freguês | null>(null);
  const [conversa, setConversa] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toasts, setToasts] = useState<
    { id: string; message: string; kind: "info" | "error" }[]
  >([]);
  const threadRef = useRef<HTMLDivElement | null>(null);

  function pushToast(message: string, kind: "info" | "error" = "info") {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }

  useEffect(() => {
    getMe()
      .then((u) => {
        if (!u) {
          router.replace("/login");
          return;
        }
        setUser(u);
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    getFregueses()
      .then(setFregueses)
      .catch(() => pushToast("Não conseguimos ver a freguesia", "error"));
  }, [user]);

  useEffect(() => {
    if (!activeFriend) return;
    getConversa(activeFriend.id)
      .then(setConversa)
      .catch(() => pushToast("A conversa anda perdida", "error"));
  }, [activeFriend]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversa]);

  useEffect(() => {
    if (!user) return;
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "dm.created") return;

      const msg: DirectMessage = data.payload;
      const friendId =
        msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

      if (activeFriend && friendId === activeFriend.id) {
        setConversa((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      } else if (msg.sender_id !== user.id) {
        const remetente = fregueses.find((f) => f.id === msg.sender_id);
        pushToast(
          `${remetente?.name ?? "Alguém"} mandou-te uma mensagem!`,
          "info"
        );
      }
    };

    return () => socket.close();
  }, [user, activeFriend, fregueses]);

  async function handleEnviar() {
    if (!activeFriend || !draft.trim() || sending) return;
    const content = draft.trim();
    setSending(true);
    try {
      await enviarMensagem(activeFriend.id, content);
      setDraft("");
    } catch {
      pushToast("O bilhete não chegou ao destino", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleApagarConversa() {
    if (!activeFriend) return;
    const friend = activeFriend;
    setConfirmDelete(false);
    try {
      await apagarConversa(friend.id);
      setActiveFriend(null);
      setConversa([]);
      pushToast(`Conversa com ${friend.name} esquecida (só do teu lado).`, "info");
    } catch {
      pushToast("Não conseguimos apagar a conversa", "error");
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
    <main className="min-h-screen bg-wood text-[#1A1A1A]">
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

          {/* O RESERVADO */}
          <section className="col-span-1 md:col-span-3">
            <div className="bg-chalkboard rounded-2xl p-4 mb-4">
              <p
                className="text-[#E5B044] text-2xl"
                style={{ fontFamily: "var(--font-handwritten)" }}
              >
                O Cantinho do Balcão
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-260px)]">
              {/* COLUNA: A FREGUESIA */}
              <aside className="bg-napkin rounded-2xl border-b-4 border-[#E5B044] p-4 overflow-y-auto">
                <h3
                  className="text-[#7C2734] text-xl mb-3"
                  style={{ fontFamily: "var(--font-handwritten)" }}
                >
                  A Freguesia
                </h3>
                {fregueses.length === 0 ? (
                  <p className="text-sm text-gray-600">A casa está vazia.</p>
                ) : (
                  <ul className="space-y-1">
                    {fregueses.map((f) => {
                      const active = activeFriend?.id === f.id;
                      return (
                        <li key={f.id}>
                          <button
                            onClick={() => setActiveFriend(f)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              active
                                ? "bg-[#C4122E]/10 ring-1 ring-[#C4122E]/30"
                                : "hover:bg-[#D4C5A8]/30"
                            }`}
                          >
                            <Carica
                              name={f.name}
                              color={f.avatar_color || "#C4122E"}
                              size={40}
                            />
                            <div className="text-left min-w-0">
                              <p className="font-black text-sm text-[#1A1A1A] truncate">
                                {f.name}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {f.department || "Freguês da casa"}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </aside>

              {/* COLUNA: CONVERSA */}
              <div className="md:col-span-2 bg-napkin rounded-2xl border-b-4 border-[#E5B044] flex flex-col overflow-hidden">
                {!activeFriend ? (
                  <div className="flex-1 flex items-center justify-center text-center px-6">
                    <div>
                      <p
                        className="text-[#7C2734] text-3xl"
                        style={{ fontFamily: "var(--font-handwritten)" }}
                      >
                        Puxa um banco e escolhe alguém
                      </p>
                      <p
                        className="text-gray-600 mt-2 text-xl"
                        style={{ fontFamily: "var(--font-handwritten)" }}
                      >
                        para dar um toque
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* CABEÇALHO DA CONVERSA */}
                    <div className="flex items-center gap-3 p-4 border-b border-[#D4C5A8]">
                      <Carica
                        name={activeFriend.name}
                        color={activeFriend.avatar_color || "#C4122E"}
                        size={44}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#1A1A1A] truncate">
                          {activeFriend.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {activeFriend.department || "Freguês da casa"}
                        </p>
                      </div>
                      {conversa.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          aria-label="Apagar conversa"
                          className="relative group/tip flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-[#C4122E] hover:bg-[#C4122E]/10 cursor-pointer transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <Tooltip text="Apagar conversa (só para ti)" position="left" />
                        </button>
                      )}
                    </div>

                    {/* THREAD */}
                    <div
                      ref={threadRef}
                      className="flex-1 overflow-y-auto p-4 space-y-2"
                    >
                      {conversa.length === 0 ? (
                        <p
                          className="text-center text-gray-500 mt-8 text-xl"
                          style={{ fontFamily: "var(--font-handwritten)" }}
                        >
                          Ainda não se ouviu nem um pio por aqui...
                        </p>
                      ) : (
                        conversa.map((m) => {
                          const mine = m.sender_id === user.id;
                          return (
                            <div
                              key={m.id}
                              className={`flex ${
                                mine ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                                  mine
                                    ? "bg-[#C4122E] text-white rounded-br-sm"
                                    : "bg-[#F5E6D3] text-[#1A1A1A] rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {m.content}
                                </p>
                                <p
                                  className={`text-[10px] mt-1 ${
                                    mine ? "text-white/70" : "text-gray-500"
                                  }`}
                                >
                                  {new Date(m.created_at).toLocaleTimeString(
                                    "pt-PT",
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* INPUT */}
                    <div className="p-3 border-t border-[#D4C5A8] flex gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleEnviar();
                          }
                        }}
                        placeholder="Diz lá o que te vai na alma..."
                        rows={2}
                        className="flex-1 bg-white/60 rounded-lg px-3 py-2 text-sm border border-[#D4C5A8] focus:border-[#C4122E] focus:outline-none resize-none"
                      />
                      <button
                        onClick={handleEnviar}
                        disabled={sending || !draft.trim()}
                        className="btn-carimbo bg-[#C4122E] text-white px-5 rounded-md font-black uppercase text-xs tracking-widest hover:bg-[#A30F26] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Siga!
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Esquecer a conversa?"
        message={
          activeFriend
            ? `As mensagens vão desaparecer só do teu lado — ${activeFriend.name} continua a vê-las na mesma.`
            : ""
        }
        confirmText="Sim, apagar"
        cancelText="Deixa estar"
        onConfirm={handleApagarConversa}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} kind={t.kind} />
        ))}
      </div>
    </main>
  );
}
