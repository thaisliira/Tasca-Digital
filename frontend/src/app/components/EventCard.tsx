"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Carica } from "./Carica";

type EventComment = {
  id: string;
  author_name: string;
  author_color: string;
  content: string;
  created_at: string;
};

export type EventItem = {
  id: string;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  total_going: number;
  total_not_going: number;
  my_status: "going" | "not_going" | "";
};

export function EventCard({
  event,
  currentUserId,
  onVote,
  onEdit,
}: {
  event: EventItem;
  currentUserId: string;
  onVote: (eventId: string, status: "going" | "not_going") => void;
  onEdit: (event: EventItem) => void;
}) {
  const isCreator = event.creator_id === currentUserId;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<EventComment[] | undefined>(undefined);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const dateObj = new Date(event.event_date);
  const dataFormatada = format(dateObj, "dd 'de' MMMM, EEEE 'às' HH:mm", { locale: ptBR });

  useEffect(() => {
    if (showComments && comments === undefined) {
      fetch(`http://localhost:8080/events/${event.id}/comments`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setComments(data || []))
        .catch(() => setComments([]));
    }
  }, [showComments, comments, event.id]);

  async function handleSendComment() {
    if (!commentText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`http://localhost:8080/events/${event.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const refresh = await fetch(`http://localhost:8080/events/${event.id}/comments`, {
          credentials: "include",
        });
        const data = await refresh.json();
        setComments(data || []);
        setCommentText("");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="bg-napkin border-b-4 border-[#E5B044] p-6 rounded-2xl shadow-md transition-shadow hover:shadow-lg">
      {/* CABEÇALHO DO EVENTO (Título e Data) */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">{event.title}</h2>
          <p className="text-sm text-[#7C2734] font-bold uppercase tracking-wider mb-2">
            📍 {event.location || "Na Tasca do Costume"}
          </p>
          <p className="text-gray-600 text-sm">
            Marcado por <span className="font-bold text-[#1A1A1A]">{event.creator_name}</span>
          </p>
        </div>

        {/* COLUNA DIREITA: Editar (só dono) + Data */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isCreator && (
            <button
              onClick={() => onEdit(event)}
              className="cursor-pointer text-xs font-black uppercase tracking-widest text-[#7C2734] hover:text-[#C4122E] transition-colors"
            >
              ✎ Editar
            </button>
          )}
          <div className="bg-[#1A1A1A] text-[#F5E6D3] py-2 px-4 rounded-lg text-center">
            <span className="block text-xs uppercase opacity-70 mb-1">Quando</span>
            <span className="font-bold text-sm">{dataFormatada}</span>
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <p
        className="text-[#1A1A1A] mb-6 leading-relaxed text-lg"
        style={{ fontFamily: "var(--font-handwritten)" }}
      >
        {event.description || "Nenhuma descrição. Aparece e pronto!"}
      </p>

      {/* ZONA DE VOTAÇÃO E CONTADORES */}
      <div className="flex items-center justify-between border-t border-[#D4C5A8] pt-5">
        {/* BOTÕES DE AÇÃO (Vou / Não Vou / Palpites) */}
        <div className="flex gap-3">
          <button
            onClick={() => onVote(event.id, "going")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              event.my_status === "going"
                ? "bg-[#C4122E] text-white border border-[#C4122E]"
                : "bg-transparent text-gray-500 border border-gray-300 hover:border-[#C4122E] hover:text-[#C4122E]"
            }`}
          >
            🍻 Eu bou
          </button>

          <button
            onClick={() => onVote(event.id, "not_going")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              event.my_status === "not_going"
                ? "bg-gray-700 text-white border border-gray-700"
                : "bg-transparent text-gray-500 border border-gray-300 hover:border-gray-700 hover:text-gray-700"
            }`}
          >
            💨 Bazei
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              showComments
                ? "bg-[#7C2734] text-white border border-[#7C2734]"
                : "bg-transparent text-gray-500 border border-gray-300 hover:border-[#7C2734] hover:text-[#7C2734]"
            }`}
          >
            💬 Palpites
          </button>
        </div>

        {/* CONTADORES */}
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1 text-[#1A1A1A]">
            <span className="text-[#C4122E]">●</span> {event.total_going} Confirmados
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <span>●</span> {event.total_not_going} Baldas
          </div>
        </div>
      </div>

      {/* PAINEL DE PALPITES */}
      {showComments && (
        <div className="mt-5 pt-5 border-t border-[#D4C5A8] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-3 mb-3">
            {comments === undefined ? (
              <p
                className="text-lg text-gray-500 italic"
                style={{ fontFamily: "var(--font-handwritten)" }}
              >
                A carregar palpites...
              </p>
            ) : comments.length === 0 ? (
              <p
                className="text-xl text-gray-600 italic"
                style={{ fontFamily: "var(--font-handwritten)" }}
              >
                Ninguém palpitou ainda. Sê o primeiro!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start">
                  <Carica
                    name={c.author_name}
                    color={c.author_color || "#C4122E"}
                    size={32}
                  />
                  <div className="flex-1 bg-[#FFFCF2] border border-[#D4C5A8] rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#1A1A1A]">{c.author_name}</span>
                      <span className="text-xs text-gray-500">
                        • {new Date(c.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p
                      className="text-[#1A1A1A]"
                      style={{ fontFamily: "var(--font-handwritten)", fontSize: "1.05rem" }}
                    >
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Qual é o teu bitaite?"
              className="flex-1 bg-[#FFFCF2] border border-[#D4C5A8] rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#C4122E] focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={posting}
              className="btn-carimbo bg-[#C4122E] text-white px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest hover:bg-[#A30F26] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {posting ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
