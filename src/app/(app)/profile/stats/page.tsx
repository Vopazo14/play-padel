import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSkillLabel, getSkillColor } from "@/lib/utils/skillLevel";
import { formatMatchDate } from "@/lib/utils/dates";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import MatchCard from "@/components/matches/MatchCard";

export default async function StatsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, matchHistory] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.match.findMany({
      where: {
        OR: [{ organizerId: userId }, { players: { some: { userId } } }],
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { scheduledAt: "desc" },
      take: 10,
      include: {
        organizer: { select: { id: true, name: true, image: true, profile: { select: { skillLevel: true, avatarUrl: true } } } },
        players: { include: { user: { select: { id: true, name: true, image: true, profile: { select: { skillLevel: true, preferredSide: true, avatarUrl: true } } } } } },
      },
    }),
  ]);

  const winRate = profile && profile.totalMatches > 0
    ? Math.round((profile.wins / profile.totalMatches) * 100)
    : 0;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis Estadísticas</h1>
        <Link href="/profile" className="text-sm text-emerald-600 hover:underline">← Perfil</Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{profile?.totalMatches ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Partidos jugados</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{winRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Tasa de victoria</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{profile?.ratingScore?.toFixed(1) ?? "—"}</p>
          <p className="text-xs text-gray-500 mt-1">Reputación (1-5)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <span className={cn("text-sm font-medium px-3 py-1.5 rounded-full", getSkillColor(profile?.skillLevel ?? 1.5))}>
            {getSkillLabel(profile?.skillLevel ?? 1.5)}
          </span>
          <p className="text-xs text-gray-500 mt-2">Nivel actual</p>
        </div>
      </div>

      {/* Match history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Historial de partidos</h2>
        {matchHistory.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">Aún no jugaste ningún partido</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchHistory.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
