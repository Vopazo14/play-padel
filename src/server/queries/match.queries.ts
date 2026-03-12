import { prisma } from "@/lib/prisma";
import { MatchStatus } from "@prisma/client";

export interface MatchFilters {
  city?: string;
  status?: MatchStatus;
  skillLevel?: number;
  dateFrom?: Date;
  dateTo?: Date;
  excludeUserId?: string;
}

const matchPlayerSelect = {
  id: true,
  role: true,
  team: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { skillLevel: true, preferredSide: true, avatarUrl: true } },
    },
  },
};

export const matchSelect = {
  id: true,
  title: true,
  description: true,
  scheduledAt: true,
  durationMinutes: true,
  location: true,
  city: true,
  courtBookingUrl: true,
  skillLevelMin: true,
  skillLevelMax: true,
  maxPlayers: true,
  currentPlayers: true,
  status: true,
  format: true,
  isPrivate: true,
  createdAt: true,
  organizer: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { skillLevel: true, avatarUrl: true } },
    },
  },
  players: { select: matchPlayerSelect },
};

export async function getMatches(filters: MatchFilters = {}, page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isPrivate: false,
    status: filters.status ?? { in: [MatchStatus.OPEN, MatchStatus.FULL] },
  };

  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }

  if (filters.skillLevel !== undefined) {
    where.skillLevelMin = { lte: filters.skillLevel };
    where.skillLevelMax = { gte: filters.skillLevel };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.scheduledAt = {};
    if (filters.dateFrom) where.scheduledAt.gte = filters.dateFrom;
    if (filters.dateTo) where.scheduledAt.lte = filters.dateTo;
  } else {
    // Default: only future matches
    where.scheduledAt = { gte: new Date() };
  }

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      select: matchSelect,
      orderBy: { scheduledAt: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.match.count({ where }),
  ]);

  return { matches, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    select: {
      ...matchSelect,
      chatRoom: { select: { id: true } },
      ratings: { select: { giverId: true, receiverId: true, score: true } },
    },
  });
}

export async function getUserMatches(userId: string) {
  return prisma.match.findMany({
    where: {
      OR: [
        { organizerId: userId },
        { players: { some: { userId } } },
      ],
      scheduledAt: { gte: new Date() },
    },
    select: matchSelect,
    orderBy: { scheduledAt: "asc" },
  });
}
