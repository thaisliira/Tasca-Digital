"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Carica } from "./Carica";
import type { User } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Menu do Dia", icon: BookmarkIcon },
  { href: "/events", label: "Quadro de Avisos", icon: CalendarIcon },
  { href: "/messages", label: "O Reservado", icon: ChatIcon },
  { href: "/settings", label: "Ficha do Freguês", icon: GearIcon },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block col-span-1">
      <div className="bg-napkin rounded-2xl border-b-4 border-[#E5B044] p-5 sticky top-24">
        <Carica name={user.name} color={user.avatar_color || "#C4122E"} size={84} className="mb-4" />
        <h2 className="font-black text-xl text-[#1A1A1A] leading-tight">{user.name}</h2>
        <p className="text-sm text-gray-600 font-medium">{user.department || "Freguês da casa"}</p>

        <nav className="mt-6 pt-4 border-t border-[#D4C5A8] space-y-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 transition-colors ${
                  active ? "text-[#C4122E]" : "text-[#7C2734] hover:text-[#C4122E]"
                }`}
              >
                <Icon />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function BookmarkIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}
