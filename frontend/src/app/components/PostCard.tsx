import { useEffect, useState } from "react";
import type { Comment } from "@/lib/api";
import { Carica } from "./Carica";
import { Tooltip } from "./Tooltip";

export function PostCard({
  post,
  currentUserId,
  comments,
  onDelete,
  onReaction,
  onSendComment,
  onLoadComments,
  onError,
}: {
  post: any;
  currentUserId?: string;
  comments?: Comment[];
  onDelete: (id: string) => void;
  onReaction: (id: string) => void;
  onSendComment: (postId: string, content: string) => Promise<void>;
  onLoadComments: (postId: string) => Promise<void>;
  onError?: (message: string) => void;
}) {
  const [showInput, setShowInput] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isOwner = post.author_id === currentUserId;
  const hasReactions = post.reaction_count > 0;
  const hasComments = post.comment_count > 0;

  const tilt =
    (post.id?.charCodeAt(0) || 0) % 2 === 0 ? "-rotate-1" : "rotate-1";

  useEffect(() => {
    if (showInput && comments === undefined) {
      onLoadComments(post.id);
    }
  }, [showInput, comments, post.id, onLoadComments]);

  async function handleSendCommentInternal() {
    if (!commentText.trim()) return;
    await onSendComment(post.id, commentText);
    setCommentText("");
  }

  async function handleDeleteComment(commentId: string) {
    const res = await fetch(
      `http://localhost:8080/posts/${post.id}/comments/${commentId}`,
      { method: "DELETE", credentials: "include" }
    );
    if (res.ok) {
      onLoadComments(post.id);
    } else {
      const body = await res.json().catch(() => ({}));
      const msg = body.error || "Agora já fostes, não podes apagar.";
      if (onError) onError(msg);
      else alert(msg);
    }
  }

  return (
    <div
      className={`bg-napkin rounded-xl p-5 relative group transform ${tilt} hover:rotate-0 transition-transform duration-200`}
    >
      {/* BOTÃO DE DELETE */}
      {isOwner && (
        <button
          onClick={() => onDelete(post.id)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-700 transition-colors p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      <div className="flex gap-4">
        <Carica
          name={post.author_name}
          color={post.author_color || "#C4122E"}
          size={44}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-[#1A1A1A]">{post.author_name}</span>
            <span className="text-xs text-gray-500">
              • {new Date(post.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p
            className="text-[#1A1A1A] leading-relaxed pr-8 text-lg"
            style={{ fontFamily: "var(--font-handwritten)" }}
          >
            {post.content}
          </p>

          <div className="mt-4 pt-3 border-t border-[#D4C5A8] flex gap-6">
            {/* BOTÃO DE BRINDAR */}
            <button
              onClick={() => onReaction(post.id)}
              className={`flex items-center gap-2 transition-colors group ${
                hasReactions ? "text-[#C4122E]" : "text-gray-500 hover:text-[#C4122E]"
              }`}
            >
              <span className="text-lg group-hover:scale-125 group-active:scale-150 transition-transform">🍻</span>
              <span className="text-xs font-bold uppercase">
                {post.reaction_count > 0 ? `${post.reaction_count} Brindes` : "Brindar"}
              </span>
            </button>

            {/* BOTÃO DE PALPITE (Toggle) */}
            <button
              onClick={() => setShowInput(!showInput)}
              className={`flex items-center gap-2 transition-colors ${
                showInput || hasComments ? "text-[#7C2734]" : "text-gray-500 hover:text-[#7C2734]"
              }`}
            >
              <span className="text-lg">💬</span>
              <span className="text-xs font-bold uppercase">
                {post.comment_count > 0 ? `${post.comment_count} Palpites` : "Palpite"}
              </span>
            </button>
          </div>

          {/* ÁREA DE PALPITES */}
          {showInput && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
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
                    Ainda ninguém palpitou. Sê o primeiro!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-3 items-start">
                      <Carica
                        name={c.author_name}
                        color={c.author_color || "#C4122E"}
                        size={32}
                      />
                      <div className="flex-1 bg-[#FFFCF2] border border-[#D4C5A8] rounded-xl px-3 py-2 relative group/comment">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#1A1A1A]">{c.author_name}</span>
                          <span className="text-xs text-gray-500">
                            • {new Date(c.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p
                          className="text-[#1A1A1A] pr-6"
                          style={{ fontFamily: "var(--font-handwritten)", fontSize: "1.05rem" }}
                        >
                          {c.content}
                        </p>
                        {c.author_id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-red-700 transition-colors text-sm leading-none p-1 group/tip"
                          >
                            ✕
                            <Tooltip text="Apagar palpite (até 15 min depois)" />
                          </button>
                        )}
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
                  onKeyDown={(e) => e.key === "Enter" && handleSendCommentInternal()}
                />
                <button
                  onClick={handleSendCommentInternal}
                  className="btn-carimbo bg-[#C4122E] text-white px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest hover:bg-[#A30F26]"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
