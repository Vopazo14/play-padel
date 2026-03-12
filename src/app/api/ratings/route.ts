import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/server/queries/notification.queries";

const ratingSchema = z.object({
  matchId: z.string(),
  ratings: z.array(z.object({
    receiverId: z.string(),
    score: z.number().int().min(1).max(5),
    comment: z.string().max(300).optional(),
  })),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = ratingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { matchId, ratings } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "COMPLETED") {
    return NextResponse.json({ error: "Solo puedes puntuar partidos completados" }, { status: 400 });
  }

  for (const rating of ratings) {
    if (rating.receiverId === session.user.id) continue;

    await prisma.playerRating.upsert({
      where: { matchId_giverId_receiverId: { matchId, giverId: session.user.id, receiverId: rating.receiverId } },
      create: { matchId, giverId: session.user.id, receiverId: rating.receiverId, score: rating.score, comment: rating.comment },
      update: { score: rating.score, comment: rating.comment },
    });

    // Recalculate receiver's rating score
    const avg = await prisma.playerRating.aggregate({
      where: { receiverId: rating.receiverId },
      _avg: { score: true },
    });

    await prisma.profile.update({
      where: { userId: rating.receiverId },
      data: { ratingScore: avg._avg.score ?? 3.0 },
    });

    await createNotification({
      userId: rating.receiverId,
      type: "RATING_RECEIVED",
      title: "Recibiste una puntuación",
      body: `Alguien te puntuó ${rating.score}/5 tras el partido`,
      actionUrl: `/profile/stats`,
    });
  }

  return NextResponse.json({ success: true });
}
