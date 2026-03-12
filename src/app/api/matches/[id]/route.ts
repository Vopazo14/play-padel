import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMatchById } from "@/server/queries/match.queries";
import { createNotification } from "@/server/queries/notification.queries";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  return NextResponse.json({ match });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: { players: { select: { userId: true } } },
  });

  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (match.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  await prisma.match.update({ where: { id }, data: { status: "CANCELLED" } });

  // Notify all players
  for (const player of match.players) {
    if (player.userId !== session.user.id) {
      await createNotification({
        userId: player.userId,
        type: "MATCH_CANCELLED",
        title: "Partido cancelado",
        body: `El partido "${match.title}" fue cancelado por el organizador`,
        actionUrl: `/matches`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
