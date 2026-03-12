import { auth } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getUserMatches, getMatches } from "@/server/queries/match.queries";
import MatchCard from "@/components/matches/MatchCard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [userMatches, suggestedData, profile] = await Promise.all([
    getUserMatches(userId),
    getMatches({}, 1, 5),
    prisma.profile.findUnique({ where: { userId }, select: { city: true, skillLevel: true } }),
  ]);

  const myMatchIds = new Set(userMatches.map((m) => m.id));
  const suggested = suggestedData.matches.filter((m) => !myMatchIds.has(m.id)).slice(0, 3);

  const firstName = session?.user?.name?.split(" ")[0] ?? "jugador";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¡Hola, {firstName}!</h1>
          <p className="text-gray-500 text-sm mt-0.5">¿Listo para jugar hoy?</p>
        </div>
        <Link
          href="/matches/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Crear partido</span>
          <span className="sm:hidden">Crear</span>
        </Link>
      </div>

      {/* Profile incomplete banner */}
      {!profile?.city && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-800">Completa tu perfil</p>
            <p className="text-xs text-amber-600 mt-0.5">Agrega tu ciudad y nivel para encontrar mejores partidos</p>
          </div>
          <Link href="/profile" className="shrink-0 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition">
            Completar
          </Link>
        </div>
      )}

      {/* My upcoming matches */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Mis próximos partidos</h2>
        {userMatches.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">No tienes partidos próximos</p>
            <Link href="/matches" className="mt-3 inline-block text-emerald-600 text-sm font-medium hover:underline">
              Busca uno para unirte
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      {/* Suggested matches */}
      {suggested.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Partidos abiertos</h2>
            <Link href="/matches" className="text-sm text-emerald-600 font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggested.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
