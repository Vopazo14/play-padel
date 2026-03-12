import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (match.organizerId === userId) {
    return NextResponse.json({ error: "El organizador no puede abandonar. Cancela el partido." }, { status: 400 });
  }

  const player = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId } },
  });
  if (!player) return NextResponse.json({ error: "No estás inscrito en este partido" }, { status: 400 });

  await prisma.$transaction([
    prisma.matchPlayer.delete({ where: { matchId_userId: { matchId, userId } } }),
    prisma.match.update({
      where: { id: matchId },
      data: {
        currentPlayers: { decrement: 1 },
        status: match.status === "FULL" ? "OPEN" : match.status,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
