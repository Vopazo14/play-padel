import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id")!;
  const channelName = params.get("channel_name")!;

  // Only allow users to subscribe to their own private channel or match channels they're in
  if (channelName.startsWith(`private-user-`) && !channelName.endsWith(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userData = {
    user_id: session.user.id,
    user_info: { name: session.user.name, image: session.user.image },
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, userData);
  return NextResponse.json(authResponse);
}
