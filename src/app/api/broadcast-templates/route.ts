import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from 'cloudinary';
import { broadcastTemplateSchema } from "@/lib/validations";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let whereClause = {};
    if (session.user.role === "ADMIN") {
      whereClause = {
        OR: [
          { createdBy: session.user.id },
          { creator: { role: "SUPER_ADMIN" } }
        ]
      };
    }

    const templates = await prisma.broadcastTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Fetch templates error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = broadcastTemplateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.errors }, { status: 400 });
    }

    const { name, messageBody, imageUrl, buttons } = result.data;

    let finalImageUrl = imageUrl;
    
    // If imageUrl is a base64 string, upload to Cloudinary
    if (imageUrl && imageUrl.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
          folder: "pemium_broadcasts",
          format: "jpg", // WhatsApp ONLY supports jpg/png, drops avif/webp silently
        });
        finalImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    const template = await prisma.broadcastTemplate.create({
      data: {
        name,
        messageBody,
        imageUrl: finalImageUrl,
        buttons: buttons || [],
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    if (session.user.role === "ADMIN") {
      const template = await prisma.broadcastTemplate.findUnique({ where: { id } });
      if (!template || template.createdBy !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Manual Cascade Delete due to Prisma relations
    const broadcasts = await prisma.broadcast.findMany({ where: { templateId: id } });
    const broadcastIds = broadcasts.map(b => b.id);
    
    if (broadcastIds.length > 0) {
      await prisma.message.deleteMany({
        where: { broadcastId: { in: broadcastIds } }
      });
      
      await prisma.broadcast.deleteMany({
        where: { templateId: id }
      });
    }

    await prisma.broadcastTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
