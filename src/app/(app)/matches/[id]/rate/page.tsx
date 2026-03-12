"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";

interface Player {
  user: { id: string; name: string | null };
}

export default function RatePage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/matches/${matchId}`).then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
    ]).then(([matchData, profileData]) => {
      setPlayers(matchData.match?.players ?? []);
      setCurrentUserId(profileData.user?.id ?? "");
      setLoading(false);
    });
  }, [matchId]);

  function setRating(userId: string, score: number) {
    setRatings((prev) => ({ ...prev, [userId]: score }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const ratingsList = Object.entries(ratings).map(([receiverId, score]) => ({ receiverId, score }));

    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, ratings: ratingsList }),
    });

    setSubmitting(false);
    if (res.ok) {
      router.push(`/matches/${matchId}`);
    } else {
      const j = await res.json();
      setError(j.error ?? "Error al enviar puntuaciones");
    }
  }

  const otherPlayers = players.filter((p) => p.user.id !== currentUserId);

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>;

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Puntuar compañeros</h1>
        <p className="text-gray-500 text-sm mt-1">¿Cómo jugaron tus compañeros de partido?</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {otherPlayers.map(({ user }) => (
          <div key={user.id}>
            <p className="text-sm font-medium text-gray-800 mb-2">{user.name ?? "Jugador"}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRating(user.id, score)}
                  className="focus:outline-none"
                >
                  <Star
                    size={28}
                    className={
                      (ratings[user.id] ?? 0) >= score
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-400 self-center">
                {ratings[user.id] ? `${ratings[user.id]}/5` : "Sin puntuar"}
              </span>
            </div>
          </div>
        ))}

        {otherPlayers.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No hay compañeros para puntuar</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || Object.keys(ratings).length === 0}
            className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {submitting ? "Enviando..." : "Enviar puntuaciones"}
          </button>
        </div>
      </form>
    </div>
  );
}
