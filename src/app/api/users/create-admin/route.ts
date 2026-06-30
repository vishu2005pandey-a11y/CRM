import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createAdminSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = createAdminSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.errors }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { name, email, password, states, csvId } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse("User with this email already exists", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const assignedStatesArray = states.split(",").map((s: string) => s.trim()).filter(Boolean);
    const assignedCsvIdsArray = csvId ? [csvId] : [];

    // Create the user and their admin profile in a transaction
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        adminProfile: {
          create: {
            assignedStates: assignedStatesArray,
            assignedCsvIds: assignedCsvIdsArray,
            status: "ACTIVE",
          },
        },
      },
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (error) {
    console.error("Create admin error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
