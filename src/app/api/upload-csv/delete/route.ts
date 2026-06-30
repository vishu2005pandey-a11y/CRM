import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    if (session.user.role === "ADMIN") {
      const history = await prisma.csvUploadHistory.findUnique({ where: { id } });
      if (!history || history.uploadedBy !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    await prisma.csvUploadHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete history error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
