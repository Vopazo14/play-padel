import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, PUSHER_CHANNELS } from "@/lib/pusher";

export async function GET(_: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Check user is a participant
  const participant = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId: session.user.id } },
  });
  if (!participant) return NextResponse.json({ error: "No eres participante de este partido" }, { status: 403 });

  const room = await prisma.chatRoom.findUnique({
    where: { matchId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json({ room });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const participant = await prisma.matchPlayer.findUnique({
    where: { matchId_userId: { matchId, userId: session.user.id } },
  });
  if (!participant) return NextResponse.json({ error: "No eres participante" }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

  // Ensure chat room exists
  const room = await prisma.chatRoom.upsert({
    where: { matchId },
    create: { matchId },
    update: {},
  });

  const message = await prisma.chatMessage.create({
    data: { roomId: room.id, authorId: session.user.id, content: content.trim(), readBy: [session.user.id] },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  try {
    await pusherServer.trigger(PUSHER_CHANNELS.matchChat(matchId), "message", message);
  } catch {
    // Pusher not configured
  }

  return NextResponse.json({ message }, { status: 201 });
}
