import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMatchSchema } from "@/lib/validations/match";
import { getMatches } from "@/server/queries/match.queries";
import { MatchStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const city = searchParams.get("city") ?? undefined;
  const status = (searchParams.get("status") as MatchStatus) ?? undefined;
  const skillLevel = searchParams.get("skillLevel")
    ? parseFloat(searchParams.get("skillLevel")!)
    : undefined;
  const page = parseInt(searchParams.get("page") ?? "1");

  const data = await getMatches({ city, status, skillLevel }, page);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const match = await prisma.match.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        courtBookingUrl: data.courtBookingUrl || null,
        organizerId: session.user.id,
        currentPlayers: 1,
        players: {
          create: {
            userId: session.user.id,
            role: "ORGANIZER",
            status: "CONFIRMED",
          },
        },
      },
      select: { id: true, title: true, scheduledAt: true, status: true },
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear el partido" }, { status: 500 });
  }
}
