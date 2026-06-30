import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteUserSchema } from "@/lib/validations";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = deleteUserSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.issues }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { id } = result.data;

    // Prisma cascades deletes if set up, but let's delete explicitly if needed
    // In our schema, User deletion cascades to adminProfile and deliveryBoyProfile (onDelete: Cascade)
    
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
