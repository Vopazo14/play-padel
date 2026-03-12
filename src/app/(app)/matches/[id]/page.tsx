import { auth } from "@/lib/auth";
import { getMatchById } from "@/server/queries/match.queries";
import { notFound } from "next/navigation";
import { formatMatchDate, isMatchPast } from "@/lib/utils/dates";
import { getSkillLabel, getSkillColor } from "@/lib/utils/skillLevel";
import PlayerSlots from "@/components/matches/PlayerSlots";
import JoinLeaveButton from "@/components/matches/JoinLeaveButton";
import CancelMatchButton from "@/components/matches/CancelMatchButton";
import { MapPin, Clock, Calendar, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const FORMAT_LABELS: Record<string, string> = {
  DOUBLES: "Dobles",
  AMERICANO: "Americano",
  THREE_PLAYERS: "3 Jugadores",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierto",
  FULL: "Completo",
  IN_PROGRESS: "En curso",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700",
  FULL: "bg-orange-100 text-orange-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match, session] = await Promise.all([getMatchById(id), auth()]);

  if (!match) notFound();

  const userId = session?.user?.id;
  const isParticipant = userId ? match.players.some((p) => p.user.id === userId) : false;
  const isOrganizer = userId === match.organizer.id;
  const isPast = isMatchPast(match.scheduledAt, match.durationMinutes);
  const canRate = isPast && match.status === "COMPLETED" && isParticipant;
  const hasChat = !!match.chatRoom;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[match.status])}>
                {STATUS_LABELS[match.status]}
              </span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getSkillColor(match.skillLevelMin))}>
                {getSkillLabel(match.skillLevelMin)}
                {match.skillLevelMax !== match.skillLevelMin && ` – ${getSkillLabel(match.skillLevelMax)}`}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{match.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organizado por {match.organizer.name ?? "Anónimo"}</p>
          </div>
        </div>

        {match.description && (
          <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">{match.description}</p>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Calendar size={16} className="text-emerald-500 shrink-0" />
            <span className="capitalize font-medium">{formatMatchDate(match.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock size={16} className="text-emerald-500 shrink-0" />
            <span>{match.durationMinutes} min · {FORMAT_LABELS[match.format] ?? match.format}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <MapPin size={16} className="text-emerald-500 shrink-0" />
            <span>{match.location}{match.city ? `, ${match.city}` : ""}</span>
          </div>
        </div>

        {match.courtBookingUrl && (
          <a
            href={match.courtBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline"
          >
            <ExternalLink size={14} />
            Reservar cancha
          </a>
        )}
      </div>

      {/* Players */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Jugadores</h2>
          <span className="text-sm text-gray-500">{match.currentPlayers}/{match.maxPlayers}</span>
        </div>
        <PlayerSlots
          current={match.currentPlayers}
          max={match.maxPlayers}
          players={match.players}
        />
      </div>

      {/* Actions */}
      {userId && !isPast && match.status !== "CANCELLED" && (
        <JoinLeaveButton
          matchId={id}
          isParticipant={isParticipant}
          isOrganizer={isOrganizer}
          isFull={match.currentPlayers >= match.maxPlayers}
          status={match.status}
        />
      )}

      {/* Chat */}
      {isParticipant && (
        <Link
          href={`/matches/${id}/chat`}
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <MessageSquare size={16} />
          Chat del partido
          {!hasChat && <span className="text-xs text-gray-400">(aún sin mensajes)</span>}
        </Link>
      )}

      {/* Rate */}
      {canRate && (
        <Link
          href={`/matches/${id}/rate`}
          className="flex items-center justify-center gap-2 w-full bg-amber-50 border border-amber-200 text-amber-700 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition"
        >
          ⭐ Puntúa a tus compañeros
        </Link>
      )}

      {/* Cancel (organizer only) */}
      {isOrganizer && !isPast && match.status !== "CANCELLED" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-3">Zona del organizador</p>
          <CancelMatchButton matchId={id} />
        </div>
      )}
    </div>
  );
}
