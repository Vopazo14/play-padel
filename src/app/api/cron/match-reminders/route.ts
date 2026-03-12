import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/queries/notification.queries";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const twoHoursAndFiveMin = new Date(twoHoursFromNow.getTime() + 5 * 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ["OPEN", "FULL"] },
      scheduledAt: { gte: twoHoursFromNow, lte: twoHoursAndFiveMin },
    },
    include: {
      players: { select: { userId: true } },
    },
  });

  let notified = 0;
  for (const match of matches) {
    for (const player of match.players) {
      await createNotification({
        userId: player.userId,
        type: "MATCH_REMINDER",
        title: "Tu partido es en 2 horas",
        body: `"${match.title}" en ${match.location}`,
        actionUrl: `/matches/${match.id}`,
      });
      notified++;
    }
  }

  return NextResponse.json({ matches: matches.length, notified });
}
