import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new NextResponse("Missing customer ID", { status: 400 });
    }

    // Ensure Admin has permission to delete this customer
    if (session.user.role === "ADMIN") {
      const admin = await prisma.adminProfile.findUnique({ where: { userId: session.user.id } });
      const customer = await prisma.customer.findUnique({ where: { id } });
      
      if (!customer || !admin?.assignedStates.includes(customer.state)) {
         return new NextResponse("Forbidden", { status: 403 });
      }
    }
    
    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
