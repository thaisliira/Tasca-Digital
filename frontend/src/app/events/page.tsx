"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, type User } from "@/lib/auth";
import { NavBar } from "@/app/components/NavBar";
import { Sidebar } from "@/app/components/Sidebar";
import { Carica } from "@/app/components/Carica";
import { BeerGlassLoader } from "@/app/components/BeerGlassLoader";
import { CreateEventModal } from "@/app/components/CreateEventModal";
import { EventCard, type EventItem } from "@/app/components/EventCard";
import { Toast } from "@/app/components/Toast";

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; kind: "info" | "error" }[]
  >([]);

  function pushToast(message: string, kind: "info" | "error" = "info") {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
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

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:8080/events", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Erro ao ler o quadro de eventos:", error);
    }
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const handleVote = async (eventId: string, status: "going" | "not_going") => {
    try {
      const res = await fetch(`http://localhost:8080/events/${eventId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchEvents();
      } else {
        const data = await res.json().catch(() => ({}));
        pushToast(data.error || "Deu barraca ao votar.", "error");
      }
    } catch (error) {
      console.error("Erro ao votar:", error);
    }
  };

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

          {/* CONTEÚDO PRINCIPAL — Quadro de Avisos */}
          <section className="col-span-1 md:col-span-3">
            {/* CABEÇALHO DA PÁGINA */}
            <div className="flex justify-between items-center mb-8 border-b border-[#F5E6D3]/10 pb-6">
              <div>
                <h1
                  className="text-5xl font-bold text-[#E5B044] mb-2"
                  style={{ fontFamily: "var(--font-handwritten)", transform: "rotate(-1deg)" }}
                >
                  Quadro de Avisos
                </h1>
                <p className="text-[#F5E6D3]/80 italic">O ponto de encontro para tudo o que acontece por aqui.</p>
              </div>

              {/* BOTÃO PARA CRIAR EVENTO */}
              <button
                className="btn-carimbo bg-[#C4122E] hover:bg-[#A30F26] text-[#F5E6D3] font-black uppercase tracking-widest text-xs py-3 px-6 rounded-md"
                onClick={() => setShowCreate(true)}
              >
                + Marcar Evento
              </button>
            </div>

            {/* LISTA DE EVENTOS */}
            {events.length === 0 ? (
              <div className="bg-napkin p-8 rounded-2xl text-center">
                <p
                  className="text-[#7C2734] text-2xl"
                  style={{ fontFamily: "var(--font-handwritten)" }}
                >
                  O quadro está limpo. Quem se chega à frente para marcar a próxima?
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    currentUserId={user.id}
                    onVote={handleVote}
                    onEdit={setEditingEvent}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <CreateEventModal
        open={showCreate || editingEvent !== null}
        onClose={() => {
          setShowCreate(false);
          setEditingEvent(null);
        }}
        onSaved={fetchEvents}
        eventToEdit={editingEvent}
      />

      {/* Toasts da Tasca — empilhados no canto inferior direito */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} kind={t.kind} />
        ))}
      </div>
    </main>
  );
}
