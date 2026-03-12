import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { pusherServer, PUSHER_CHANNELS } from "@/lib/pusher";

export async function createNotification({
  userId,
  type,
  title,
  body,
  actionUrl,
  metadata,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, body, actionUrl, metadata },
  });

  // Push real-time notification via Pusher
  try {
    await pusherServer.trigger(
      PUSHER_CHANNELS.userNotifications(userId),
      "notification",
      notification
    );
  } catch {
    // Pusher not configured — silently ignore in dev
  }

  return notification;
}

export async function getUserNotifications(userId: string, page = 1) {
  const pageSize = 20;
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
