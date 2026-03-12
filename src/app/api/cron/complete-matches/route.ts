import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Mark matches as COMPLETED if their end time has passed
  const result = await prisma.match.updateMany({
    where: {
      status: { in: ["OPEN", "FULL", "IN_PROGRESS"] },
      scheduledAt: {
        lte: new Date(now.getTime() - 90 * 60 * 1000), // at least 90min ago
      },
    },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ updated: result.count });
}
