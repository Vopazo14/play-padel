"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, LogOut, User, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavbarProps {
  userName?: string | null;
  unreadCount?: number;
}

export default function Navbar({ userName, unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-emerald-600 text-lg">
          <span>🎾</span>
          <span className="hidden sm:inline">Play Padel</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard" active={pathname === "/dashboard"}>Inicio</NavLink>
          <NavLink href="/matches" active={pathname.startsWith("/matches") && pathname !== "/matches/new"}>Partidos</NavLink>
          <NavLink href="/matches/new" active={pathname === "/matches/new"}>Crear</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <User size={16} />
            <span className="hidden sm:inline max-w-24 truncate">{userName ?? "Perfil"}</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition",
        active ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      {children}
    </Link>
  );
}
