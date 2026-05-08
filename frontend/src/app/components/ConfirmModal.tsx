"use client";

import { useEffect } from "react";

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Sim, retirar",
  cancelText = "Deixa estar",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-napkin rounded-2xl p-6 max-w-sm w-full -rotate-1 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-3xl text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-handwritten)", fontWeight: 700 }}
        >
          {title}
        </h3>
        <p className="text-gray-700 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 items-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-[#1A1A1A] font-bold text-sm uppercase tracking-widest"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-carimbo bg-[#C4122E] text-white px-6 py-2.5 rounded-md font-black uppercase text-xs tracking-widest hover:bg-[#A30F26]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
