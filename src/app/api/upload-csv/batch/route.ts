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

    const { uploadId, rows } = await req.json();

    if (!uploadId || !rows || !Array.isArray(rows)) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Verify upload belongs to user (or user is super admin)
    const history = await prisma.csvUploadHistory.findUnique({
      where: { id: uploadId },
    });

    if (!history) {
      return new NextResponse("Upload history not found", { status: 404 });
    }

    if (session.user.role === "ADMIN" && history.uploadedBy !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let duplicatesSkipped = 0;
    let validRecords = 0;
    const statesFound = new Set<string>();

    for (const row of rows) {
      let phone = "";
      let name = "";
      let state = "";
      let city = "";
      let address = "";
      
      for (const [key, value] of Object.entries(row)) {
        const k = key.toLowerCase().trim();
        const v = String(value).trim();
        if (k.includes("phone") || k.includes("mobile") || k.includes("contact")) phone = v;
        if ((k === "name" || k.includes("name")) && !k.includes("file")) name = v;
        if (k === "state" || k.includes("state")) state = v.toLowerCase();
        if (k === "city" || k.includes("city")) city = v;
        if (k === "address" || k.includes("address")) address = v;
      }

      if (!phone || !name || !state) continue; // Skip invalid rows

      if (state) statesFound.add(state.toLowerCase());

      // Check if a customer with this phone already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existingCustomer) {
        // We found a customer with the same phone.
        const isExactDuplicate = 
          existingCustomer.name === name &&
          existingCustomer.state.toLowerCase() === state &&
          (existingCustomer.city || "") === city &&
          (existingCustomer.address || "") === address;

        if (isExactDuplicate) {
          // Exact duplicate -> Skip it entirely
          duplicatesSkipped++;
        } else {
          // Phone matches, update existing record and attach to this new CSV upload
          await prisma.customer.update({
            where: { phone },
            data: {
              name,
              state,
              city,
              address,
              csvUploadId: history.id
            }
          });
          validRecords++;
        }
      } else {
        // Completely new phone -> Insert new record
        await prisma.customer.create({
          data: {
            phone,
            name,
            state,
            city,
            address,
            status: "NEW ADDED",
            csvUploadId: history.id
          }
        });
        validRecords++;
      }
    }

    // Update history with running stats
    await prisma.csvUploadHistory.update({
      where: { id: uploadId },
      data: {
        totalRows: { increment: rows.length },
        validRecords: { increment: validRecords },
        duplicatesSkipped: { increment: duplicatesSkipped },
        // Append new states efficiently. We could use push, but it only pushes elements.
        // It's safer to just fetch and union them in finalize, or push them here.
        statesUploaded: { push: Array.from(statesFound) }
      }
    });

    return NextResponse.json({
      success: true,
      processed: rows.length,
      validRecords,
      duplicatesSkipped
    });

  } catch (error) {
    console.error("CSV Upload Batch API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
