"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRelative } from "@/lib/utils/dates";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  MATCH_JOINED: "👤",
  MATCH_FULL: "✅",
  MATCH_CANCELLED: "❌",
  MATCH_REMINDER: "⏰",
  INVITATION_RECEIVED: "📩",
  INVITATION_ACCEPTED: "🤝",
  RATING_RECEIVED: "⭐",
  CHAT_MESSAGE: "💬",
  MATCH_SUGGESTION: "🎯",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((j) => {
        setNotifications(j.notifications ?? []);
        setLoading(false);
      });
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications?all=true", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:underline"
          >
            <CheckCheck size={14} />
            Marcar todo como leído
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-16" />
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <Bell size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No tienes notificaciones</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const content = (
            <div
              className={cn(
                "bg-white rounded-xl border p-4 transition",
                n.isRead ? "border-gray-100" : "border-emerald-200 bg-emerald-50/50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", n.isRead ? "text-gray-700" : "text-gray-900")}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1" />
                )}
              </div>
            </div>
          );

          return n.actionUrl ? (
            <Link key={n.id} href={n.actionUrl}>{content}</Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
