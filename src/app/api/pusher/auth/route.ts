import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channelName = data.get("channel_name") as string;

    if (!socketId || !channelName) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Basic authorization: ensure user is only subscribing to their own channel
    if (
      channelName.startsWith("private-delivery-boy-") &&
      channelName !== `private-delivery-boy-${session.user.id}`
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const pusherServer = getPusherServer();
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: session.user.id,
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
