export type SkillLabel = "Principiante" | "Intermedio" | "Avanzado" | "Profesional";

export function getSkillLabel(level: number): SkillLabel {
  if (level <= 2.0) return "Principiante";
  if (level <= 3.5) return "Intermedio";
  if (level <= 5.0) return "Avanzado";
  return "Profesional";
}

export function getSkillColor(level: number): string {
  if (level <= 2.0) return "bg-green-100 text-green-800";
  if (level <= 3.5) return "bg-yellow-100 text-yellow-800";
  if (level <= 5.0) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

export const SKILL_LEVELS = [
  { value: 1.0, label: "1.0 - Principiante" },
  { value: 1.5, label: "1.5" },
  { value: 2.0, label: "2.0" },
  { value: 2.5, label: "2.5 - Intermedio" },
  { value: 3.0, label: "3.0" },
  { value: 3.5, label: "3.5" },
  { value: 4.0, label: "4.0 - Avanzado" },
  { value: 4.5, label: "4.5" },
  { value: 5.0, label: "5.0" },
  { value: 5.5, label: "5.5 - Profesional" },
  { value: 6.0, label: "6.0" },
  { value: 6.5, label: "6.5" },
  { value: 7.0, label: "7.0 - WPT" },
];
