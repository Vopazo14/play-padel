import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/queries/notification.queries";
import { pusherServer, PUSHER_CHANNELS } from "@/lib/pusher";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: {
          players: { select: { userId: true } },
          organizer: { select: { id: true, name: true } },
        },
      });

      if (!match) throw new Error("NOT_FOUND");
      if (match.status === "CANCELLED") throw new Error("CANCELLED");
      if (match.status === "COMPLETED") throw new Error("COMPLETED");
      if (match.currentPlayers >= match.maxPlayers) throw new Error("FULL");
      if (match.players.some((p) => p.userId === userId)) throw new Error("ALREADY_JOINED");

      // Validate skill level
      const profile = await tx.profile.findUnique({ where: { userId } });
      if (profile) {
        if (
          profile.skillLevel < match.skillLevelMin ||
          profile.skillLevel > match.skillLevelMax
        ) {
          throw new Error("SKILL_MISMATCH");
        }
      }

      const newCount = match.currentPlayers + 1;
      const newStatus = newCount >= match.maxPlayers ? "FULL" : "OPEN";

      await tx.matchPlayer.create({
        data: { matchId, userId, role: "PLAYER", status: "CONFIRMED" },
      });

      const updated = await tx.match.update({
        where: { id: matchId },
        data: { currentPlayers: newCount, status: newStatus },
        select: { currentPlayers: true, maxPlayers: true, status: true, title: true },
      });

      return { match, updated, newCount, newStatus };
    });

    const { match, updated } = result;

    // Notify organizer
    await createNotification({
      userId: match.organizerId,
      type: "MATCH_JOINED",
      title: "Nuevo jugador en tu partido",
      body: `${session.user.name ?? "Alguien"} se unió a "${match.title}"`,
      actionUrl: `/matches/${matchId}`,
    });

    // If match is now full, notify all players
    if (updated.status === "FULL") {
      for (const player of match.players) {
        await createNotification({
          userId: player.userId,
          type: "MATCH_FULL",
          title: "¡Partido completo!",
          body: `"${match.title}" ya tiene todos sus jugadores`,
          actionUrl: `/matches/${matchId}`,
        });
      }
    }

    // Pusher real-time update to match page viewers
    try {
      await pusherServer.trigger(`match-${matchId}`, "player-joined", {
        currentPlayers: updated.currentPlayers,
        status: updated.status,
      });
    } catch {
      // Pusher not configured — ignore
    }

    return NextResponse.json({ match: updated });
  } catch (err) {
    const msg = (err as Error).message;
    const errorMap: Record<string, [string, number]> = {
      NOT_FOUND: ["Partido no encontrado", 404],
      CANCELLED: ["El partido fue cancelado", 400],
      COMPLETED: ["El partido ya terminó", 400],
      FULL: ["El partido está completo", 400],
      ALREADY_JOINED: ["Ya estás inscrito en este partido", 400],
      SKILL_MISMATCH: ["Tu nivel no es compatible con este partido", 400],
    };
    const [error, status] = errorMap[msg] ?? ["Error al unirse al partido", 500];
    return NextResponse.json({ error }, { status });
  }
}
