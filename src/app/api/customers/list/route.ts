import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};

    if (session.user.role === "ADMIN") {
      const admin = await prisma.adminProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (admin?.assignedCsvIds?.length) {
        whereClause = { csvUploadId: { in: admin.assignedCsvIds } };
      } else if (admin?.assignedStates?.length) {
        whereClause = { state: { in: admin.assignedStates } };
      } else {
        return NextResponse.json({ customers: [] });
      }
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        state: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Customers list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
