"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, type User } from "@/lib/auth";
import {
  getPosts,
  createPost,
  deletePost,
  getComments,
  createComment,
  type Comment,
} from "@/lib/api";
import { PostCard } from "@/app/components/PostCard";
import { Carica } from "@/app/components/Carica";
import { BeerGlassLoader } from "@/app/components/BeerGlassLoader";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { NavBar } from "@/app/components/NavBar";
import { Toast } from "@/app/components/Toast";
import { Sidebar } from "@/app/components/Sidebar";

interface Post {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  author_color: string;
  created_at: string;
  reaction_count: number;
  comment_count: number;
  comments?: Comment[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
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

  useEffect(() => {
    if (user) {
      getPosts().then(setPosts);
    }
  }, [user]);

  async function handleSendPost() {
    if (!newPostContent.trim()) return;
    await createPost(newPostContent);
    setNewPostContent("");
  }

  async function handleToggleReaction(postId: string) {
    await fetch(`http://localhost:8080/posts/${postId}/reactions`, {
      method: "POST",
      credentials: "include",
    });
  }

  async function handleSendComment(postId: string, content: string) {
    await createComment(postId, content);
  }

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  function handleDeletePost(id: string) {
    setPostToDelete(id);
  }

  async function confirmDeletePost() {
    if (!postToDelete) return;
    const id = postToDelete;
    setPostToDelete(null);
    await deletePost(id);
  }

  async function handleLoadComments(postId: string) {
    const comments = await getComments(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments } : p))
    );
  }

  useEffect(() => {
    if (!user) return;

    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "post.created") {
        const newPost = data.payload;
        setPosts((prevPosts) => [newPost, ...prevPosts]);
      }

      if (data.type === "post.deleted") {
        const postId: string = data.payload.post_id;
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }

      if (data.type === "reaction.updated") {
        const update: {
          post_id: string;
          reaction_count: number;
          actor_id: string;
          actor_name: string;
          post_owner_id: string;
          added: boolean;
        } = data.payload;

        setPosts((prev) =>
          prev.map((p) =>
            p.id === update.post_id
              ? { ...p, reaction_count: update.reaction_count }
              : p
          )
        );

        if (
          update.added &&
          user &&
          update.post_owner_id === user.id &&
          update.actor_id !== user.id
        ) {
          pushToast(`${update.actor_name} brindou à tua posta!`);
        }
      }

      if (data.type === "comment.created") {
        const newComment: Comment & { post_owner_id?: string } = data.payload;
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== newComment.post_id) return p;
            return {
              ...p,
              comment_count: p.comment_count + 1,
              comments: p.comments ? [...p.comments, newComment] : p.comments,
            };
          })
        );

        if (
          user &&
          newComment.post_owner_id === user.id &&
          newComment.author_id !== user.id
        ) {
          pushToast(`${newComment.author_name} palpitou na tua posta!`);
        }
      }
    };

    return () => socket.close();
  }, [user]);

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

          {/* O BALCÃO (Feed) */}
          <section className="col-span-1 md:col-span-3 space-y-6">
            {/* COMPOSER — ARDÓSIA */}
            <div className="bg-chalkboard rounded-2xl p-5 mt-2">
              <div className="flex gap-4 items-start">
                <Carica name={user.name} color={user.avatar_color || "#C4122E"} size={44} />
                <div className="flex-1">
                  <p
                    className="text-[#E5B044] mb-1 text-lg"
                    style={{ fontFamily: "var(--font-handwritten)" }}
                  >
                    Cardápio do dia · {new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long" })}
                  </p>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`Manda uma posta de pescada, se faz favor...`}
                    className="w-full bg-transparent text-[#F5F0E0] placeholder-[#A89870] border-b border-dashed border-[#A89870]/40 focus:border-[#E5B044] focus:outline-none resize-none px-1 py-2"
                    rows={3}
                    style={{ fontFamily: "var(--font-handwritten)", fontSize: "1.5rem", lineHeight: "1.4" }}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSendPost}
                      className="btn-carimbo bg-[#C4122E] text-white px-7 py-2.5 rounded-md font-black uppercase text-xs tracking-widest hover:bg-[#A30F26]"
                    >
                      Lançar ao Balcão
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTA DE POSTAS */}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post: Post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    comments={post.comments}
                    onDelete={handleDeletePost}
                    onReaction={handleToggleReaction}
                    onSendComment={handleSendComment}
                    onLoadComments={handleLoadComments}
                    onError={(msg) => pushToast(msg, "error")}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <p
                    className="text-[#E5B044] text-3xl"
                    style={{ fontFamily: "var(--font-handwritten)" }}
                  >
                    Balcão ainda em silêncio...
                  </p>
                  <p
                    className="text-[#F5E6D3]/70 mt-2 text-xl"
                    style={{ fontFamily: "var(--font-handwritten)" }}
                  >
                    quem se atreve a abrir a boca?
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={postToDelete !== null}
        title="Retirar a posta?"
        message="Esta posta vai sair do balcão para todos os fregueses. Tens a certeza?"
        confirmText="Sim, retirar"
        cancelText="Deixa estar"
        onConfirm={confirmDeletePost}
        onCancel={() => setPostToDelete(null)}
      />

      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} kind={t.kind} />
        ))}
      </div>
    </main>
  );
}
