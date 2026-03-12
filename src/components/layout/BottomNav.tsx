"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BottomNavProps {
  unreadCount?: number;
}

export default function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: Home, label: "Inicio" },
    { href: "/matches", icon: Search, label: "Partidos" },
    { href: "/matches/new", icon: Plus, label: "Crear" },
    { href: "/notifications", icon: Bell, label: "Avisos", badge: unreadCount },
    { href: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex">
        {links.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition relative",
                isActive ? "text-emerald-600" : "text-gray-400"
              )}
            >
              {href === "/matches/new" ? (
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center -mt-4 shadow-lg">
                  <Icon size={20} className="text-white" />
                </div>
              ) : (
                <div className="relative">
                  <Icon size={22} />
                  {badge && badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
              )}
              <span>{href === "/matches/new" ? "" : label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
