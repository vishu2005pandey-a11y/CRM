import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initCsvSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const result = initCsvSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid input", details: result.error.issues }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { fileName, totalSize } = result.data;

    const history = await prisma.csvUploadHistory.create({
      data: {
        fileName: fileName || ("Uploaded_CSV_" + new Date().toISOString().split("T")[0]),
        statesUploaded: [],
        totalRows: 0,
        validRecords: 0,
        duplicatesSkipped: 0,
        uploadedBy: session.user.id,
      }
    });

    return NextResponse.json({ uploadId: history.id });
  } catch (error) {
    console.error("CSV Upload Init API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
