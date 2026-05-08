"use client";

import { useEffect, useState } from "react";
import { Alert } from "./Alert";
import type { EventItem } from "./EventCard";

export function CreateEventModal({
  open,
  onClose,
  onSaved,
  eventToEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  eventToEdit?: EventItem | null;
}) {
  const isEditing = !!eventToEdit;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || "");
      setLocation(eventToEdit.location || "");
      const d = new Date(eventToEdit.event_date);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEventDate(local);
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");
    }
    setError(null);
  }, [eventToEdit, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !eventDate) {
      setError("Título e data são obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const isoDate = new Date(eventDate).toISOString();
      const url = isEditing
        ? `http://localhost:8080/events/${eventToEdit!.id}`
        : "http://localhost:8080/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          event_date: isoDate,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Erro ao guardar evento");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      onSaved();
      onClose();
    } catch {
      setError("Erro de rede ao guardar evento");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-napkin rounded-2xl p-6 max-w-lg w-full -rotate-1 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-3xl text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
        >
          {isEditing ? "Atualizar Evento" : "Marcar Evento"}
        </h3>
        <p
          className="text-gray-600 mb-5 text-lg"
          style={{ fontFamily: "var(--font-handwritten)" }}
        >
          {isEditing ? "Mexe no que precisa de mexer." : "Onde, quando e o que vai dar?"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
            >
              Título
            </label>
            <input
              id="event-title"
              type="text"
              required
              minLength={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bifanas e finos no fim do sprint"
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
            />
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
            >
              Descrição
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conta lá o que se passa..."
              className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-location"
                className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
              >
                Local
              </label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tasca do costume"
                className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
              />
            </div>

            <div>
              <label
                htmlFor="event-date"
                className="block text-xs font-black uppercase tracking-widest text-[#7C2734] mb-1"
              >
                Quando
              </label>
              <input
                id="event-date"
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-[#FFFCF2] border border-[#D4C5A8] rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C4122E]"
              />
            </div>
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <div className="flex justify-end gap-3 items-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-gray-600 hover:text-[#1A1A1A] font-bold text-sm uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-carimbo bg-[#C4122E] text-white px-7 py-2.5 rounded-md font-black uppercase text-xs tracking-widest hover:bg-[#A30F26] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (isEditing ? "A guardar..." : "A marcar...") : (isEditing ? "Guardar" : "Marcar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
