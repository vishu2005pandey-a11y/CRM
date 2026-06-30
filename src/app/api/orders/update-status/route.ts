import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOrderStatusSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = updateOrderStatusSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.errors }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { orderId, status } = result.data;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }



    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // We could trigger another Pusher event here to notify admins, but keeping it simple for now

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
