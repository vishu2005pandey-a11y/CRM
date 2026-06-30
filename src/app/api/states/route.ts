import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch unique states from the Customer table
    const uniqueStates = await prisma.customer.findMany({
      distinct: ['state'],
      select: { state: true },
    });

    const states = uniqueStates.map(s => s.state).filter(Boolean);

    return NextResponse.json(states);
  } catch (error) {
    console.error("Fetch states error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
