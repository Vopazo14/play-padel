import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import { formatMatchDate } from "@/lib/utils/dates";
import { getSkillLabel, getSkillColor } from "@/lib/utils/skillLevel";
import PlayerSlots from "./PlayerSlots";
import { cn } from "@/lib/utils/cn";

interface MatchCardProps {
  match: {
    id: string;
    title: string;
    scheduledAt: Date;
    location: string;
    city?: string | null;
    skillLevelMin: number;
    skillLevelMax: number;
    currentPlayers: number;
    maxPlayers: number;
    status: string;
    format: string;
    durationMinutes: number;
    organizer: { id: string; name?: string | null };
    players: Array<{ user: { name?: string | null; image?: string | null } }>;
  };
}

const FORMAT_LABELS: Record<string, string> = {
  DOUBLES: "Dobles",
  AMERICANO: "Americano",
  THREE_PLAYERS: "3 Jugadores",
};

export default function MatchCard({ match }: MatchCardProps) {
  const isFull = match.currentPlayers >= match.maxPlayers;
  const spotsLeft = match.maxPlayers - match.currentPlayers;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition">
              {match.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">por {match.organizer.name ?? "Anónimo"}</p>
          </div>
          <span
            className={cn(
              "shrink-0 text-xs font-medium px-2 py-1 rounded-full",
              isFull ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
            )}
          >
            {isFull ? "Completo" : `${spotsLeft} lugar${spotsLeft > 1 ? "es" : ""}`}
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar size={14} className="shrink-0 text-emerald-500" />
            <span className="capitalize">{formatMatchDate(match.scheduledAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} className="shrink-0 text-emerald-500" />
            <span className="truncate">{match.location}{match.city ? `, ${match.city}` : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} className="shrink-0 text-emerald-500" />
            <span>{match.durationMinutes} min · {FORMAT_LABELS[match.format] ?? match.format}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getSkillColor(match.skillLevelMin))}>
            {getSkillLabel(match.skillLevelMin)}
            {match.skillLevelMax !== match.skillLevelMin && ` – ${getSkillLabel(match.skillLevelMax)}`}
          </span>
          <PlayerSlots current={match.currentPlayers} max={match.maxPlayers} compact />
        </div>
      </div>
    </Link>
  );
}
