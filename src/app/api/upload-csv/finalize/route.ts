import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { uploadId } = await req.json();

    if (!uploadId) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const history = await prisma.csvUploadHistory.findUnique({
      where: { id: uploadId },
    });

    if (!history) {
      return new NextResponse("Upload history not found", { status: 404 });
    }

    if (session.user.role === "ADMIN" && history.uploadedBy !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Clean up states (remove duplicates)
    const uniqueStates = Array.from(new Set(history.statesUploaded.map(s => s.toLowerCase())));
    
    // Update the history record with cleaned states
    await prisma.csvUploadHistory.update({
      where: { id: uploadId },
      data: {
        statesUploaded: uniqueStates,
      }
    });

    return NextResponse.json({
      success: true,
      total: history.totalRows,
      duplicates: history.duplicatesSkipped,
      validRecords: history.validRecords,
      states: uniqueStates.slice(0, 5),
    });

  } catch (error) {
    console.error("CSV Upload Finalize API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
