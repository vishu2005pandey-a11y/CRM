import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const filterRole = url.searchParams.get("filterRole");

    let whereClause: any = {};
    if (session.user.role === "ADMIN") {
      whereClause = { senderId: session.user.id };
    } else if (session.user.role === "SUPER_ADMIN" && filterRole) {
      whereClause = { sender: { role: filterRole } };
    }

    const broadcasts = await prisma.broadcast.findMany({
      where: whereClause,
      include: {
        template: {
          select: { name: true, messageBody: true }
        },
        sender: {
          select: { name: true, email: true, profileImage: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    console.error("Fetch broadcast history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
