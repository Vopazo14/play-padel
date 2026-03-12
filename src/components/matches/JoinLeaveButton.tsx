"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface JoinLeaveButtonProps {
  matchId: string;
  isParticipant: boolean;
  isOrganizer: boolean;
  isFull: boolean;
  status: string;
}

export default function JoinLeaveButton({
  matchId,
  isParticipant,
  isOrganizer,
  isFull,
  status,
}: JoinLeaveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isOrganizer) return null;

  async function handleJoin() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/matches/${matchId}/join`, { method: "POST" });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Error al unirse");
      return;
    }
    router.refresh();
  }

  async function handleLeave() {
    if (!confirm("¿Seguro que quieres abandonar este partido?")) return;
    setError("");
    setLoading(true);
    const res = await fetch(`/api/matches/${matchId}/leave`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Error al abandonar");
      return;
    }
    router.refresh();
  }

  if (isParticipant) {
    return (
      <div>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button
          onClick={handleLeave}
          disabled={loading}
          className="w-full border-2 border-red-200 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition"
        >
          {loading ? "..." : "Abandonar partido"}
        </button>
      </div>
    );
  }

  if (isFull || status === "FULL") {
    return (
      <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl text-sm font-medium text-center cursor-not-allowed">
        Partido completo
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className={cn(
          "w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm",
        )}
      >
        {loading ? "Uniéndose..." : "Unirme al partido"}
      </button>
    </div>
  );
}
