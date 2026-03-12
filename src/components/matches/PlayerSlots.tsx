import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PlayerSlotsProps {
  current: number;
  max: number;
  players?: Array<{ user: { name?: string | null; image?: string | null } }>;
  compact?: boolean;
}

export default function PlayerSlots({ current, max, players = [], compact = false }: PlayerSlotsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <div className="flex">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center -ml-1 first:ml-0",
                i < current ? "bg-emerald-500" : "bg-gray-200"
              )}
            >
              <User size={10} className={i < current ? "text-white" : "text-gray-400"} />
            </div>
          ))}
        </div>
        <span className={cn("font-medium", current >= max ? "text-emerald-600" : "text-gray-500")}>
          {current}/{max}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: max }).map((_, i) => {
        const player = players[i];
        return (
          <div key={i} className={cn(
            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-xs gap-1",
            player ? "border-emerald-300 bg-emerald-50" : "border-dashed border-gray-200 bg-white"
          )}>
            {player ? (
              <>
                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                  <User size={16} className="text-emerald-700" />
                </div>
                <span className="text-emerald-700 font-medium truncate w-full text-center px-1">
                  {player.user.name?.split(" ")[0] ?? "?"}
                </span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={16} className="text-gray-300" />
                </div>
                <span className="text-gray-300">Libre</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
