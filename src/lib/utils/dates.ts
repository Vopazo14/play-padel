import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { es } from "date-fns/locale";

export function formatMatchDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return `Hoy a las ${format(d, "HH:mm")}`;
  if (isTomorrow(d)) return `Mañana a las ${format(d, "HH:mm")}`;
  return format(d, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function isMatchPast(scheduledAt: Date | string, durationMinutes: number): boolean {
  const end = new Date(scheduledAt);
  end.setMinutes(end.getMinutes() + durationMinutes);
  return isPast(end);
}
