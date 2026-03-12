import { z } from "zod";

export const createMatchSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(60).max(180).default(90),
  location: z.string().min(3, "Indica la ubicación del partido").max(200),
  city: z.string().min(2).max(100).optional(),
  courtBookingUrl: z.preprocess((val) => (val === "" ? undefined : val), z.string().url("URL inválida").optional()),
  skillLevelMin: z.number().min(1.0).max(7.0).default(1.0),
  skillLevelMax: z.number().min(1.0).max(7.0).default(7.0),
  maxPlayers: z.number().int().min(2).max(4).default(4),
  format: z.enum(["DOUBLES", "AMERICANO", "THREE_PLAYERS"]).default("DOUBLES"),
  isPrivate: z.boolean().default(false),
});

export const updateMatchSchema = createMatchSchema.partial().omit({ scheduledAt: true });

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
