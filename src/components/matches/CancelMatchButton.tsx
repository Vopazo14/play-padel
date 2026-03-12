"use client";

import { useRouter } from "next/navigation";

export default function CancelMatchButton({ matchId }: { matchId: string }) {
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("¿Cancelar el partido? Se notificará a todos los jugadores.")) return;
    const res = await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
    if (res.ok) router.push("/matches");
  }

  return (
    <button
      onClick={handleCancel}
      className="text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Cancelar partido
    </button>
  );
}
