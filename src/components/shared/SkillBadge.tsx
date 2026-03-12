import { getSkillLabel, getSkillColor } from "@/lib/utils/skillLevel";
import { cn } from "@/lib/utils/cn";

interface SkillBadgeProps {
  level: number;
  showLevel?: boolean;
  className?: string;
}

export default function SkillBadge({ level, showLevel = true, className }: SkillBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", getSkillColor(level), className)}>
      {getSkillLabel(level)}
      {showLevel && ` (${level})`}
    </span>
  );
}
