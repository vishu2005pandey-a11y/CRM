import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.errors }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { name, email, profileImage } = result.data;

    let finalImageUrl = profileImage;

    // If profileImage is a base64 string, upload to Cloudinary
    if (profileImage && profileImage.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profileImage, {
          folder: "pemium_profiles",
          format: "jpg", 
        });
        finalImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return new NextResponse("Failed to upload image", { status: 500 });
      }
    }

    const dataToUpdate: any = {
      name,
      email,
    };

    if (finalImageUrl !== undefined) {
      dataToUpdate.profileImage = finalImageUrl;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
