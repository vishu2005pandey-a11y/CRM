import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toggleStatusSchema } from "@/lib/validations";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized. Only Super Admin can suspend users.", { status: 401 });
    }

    const body = await req.json();
    const result = toggleStatusSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.issues }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { userId, type, status } = result.data;

    if (type === "ADMIN") {
      await prisma.adminProfile.update({
        where: { userId },
        data: { status }
      });
      
      // Fire real-time event so the specific admin is immediately logged out if suspended
      if (status === "SUSPENDED") {
        await pusherServer.trigger(`user-${userId}`, 'account-suspended', {});
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Toggle status error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
