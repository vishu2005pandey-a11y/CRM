import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, imageBase64, selectedCustomerIds, templateId } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (session.user.role === "ADMIN" && !templateId) {
      return NextResponse.json({ error: "Admins must select a template" }, { status: 400 });
    }

    // Determine target based on role
    let customerCount = 0;
    let targetStateDesc = "ALL_CUSTOMERS";
    let baseWhereClause: any = {};

    if (session.user.role === "SUPER_ADMIN") {
      baseWhereClause = {};
    } else if (session.user.role === "ADMIN") {
      const admin = await prisma.adminProfile.findUnique({
        where: { userId: session.user.id },
      });
      
      if (admin?.assignedCsvIds?.length) {
        baseWhereClause = { csvUploadId: { in: admin.assignedCsvIds } };
        targetStateDesc = `CSV_IDs: ${admin.assignedCsvIds.join(", ")}`;
      } else if (admin?.assignedStates?.length) {
        baseWhereClause = { state: { in: admin.assignedStates } };
        targetStateDesc = admin.assignedStates.join(", ");
      }
    }

    // Apply custom selection if provided
    if (selectedCustomerIds && Array.isArray(selectedCustomerIds) && selectedCustomerIds.length > 0) {
      baseWhereClause.id = { in: selectedCustomerIds };
      targetStateDesc += " (Custom Selection)";
    }

    const customers = await prisma.customer.findMany({
      where: baseWhereClause,
      select: { id: true, name: true, phone: true }
    });

    customerCount = customers.length;

    if (customerCount === 0) {
      return NextResponse.json({ error: "No target customers found." }, { status: 400 });
    }
    
    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required." }, { status: 400 });
    }

    const template = await prisma.broadcastTemplate.findUnique({
      where: { id: templateId }
    });

    const templateImageUrl = template?.imageUrl;

    // REAL WHATSAPP BROADCAST EXECUTION
    
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    let deliveredCount = 0;
    let failedCount = 0;

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      // Fallback to simulated if keys are somehow missing at runtime
      console.warn("WhatsApp API credentials missing in .env. Running in SIMULATED mode.");
      deliveredCount = customerCount;
    } else {
      // Execute real API calls
      const url = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      
      const promises = customers.map(async (customer) => {
        try {
          // Clean phone number (remove spaces, '+', etc)
          let phone = customer.phone.replace(/[\s\+\-]/g, "");
          // Prefix '91' for India if it's 10 digits
          if (phone.length === 10) {
            phone = "91" + phone;
          }
          
          // Replace placeholders
          const personalizedMessage = message.replace(/\{\{name\}\}/gi, customer.name);
          
          // Extract custom buttons (if any) or fallback to simple text
          let interactivePayload: any = null;
          
          // @ts-ignore - Prisma JSON typing workaround
          const customButtons: string[] = Array.isArray(template?.buttons) ? template.buttons : [];

          let payload: any = {
            messaging_product: "whatsapp",
            to: phone,
          };

          if (customButtons.length > 0) {
            interactivePayload = {
              type: "button",
              body: { text: personalizedMessage },
              action: {
                buttons: customButtons.slice(0, 3).map((btnText, idx) => ({
                  type: "reply",
                  reply: { id: `btn_${idx}`, title: btnText.substring(0, 20) }
                }))
              }
            };

            if (templateImageUrl) {
              interactivePayload.header = { type: "image", image: { link: templateImageUrl } };
            }

            payload.type = "interactive";
            payload.interactive = interactivePayload;
          } else if (templateImageUrl) {
            payload.type = "image";
            payload.image = {
              link: templateImageUrl,
              caption: personalizedMessage
            };
          } else {
            payload.type = "text";
            payload.text = { body: personalizedMessage };
          }
          
          
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          
          const data = await response.json();
          if (response.ok) {
            deliveredCount++;
          } else {
            console.error(`Meta API Error for ${phone}:`, data);
            failedCount++;
          }
        } catch (err) {
          console.error(`Failed to send to ${customer.phone}`, err);
          failedCount++;
        }
      });
      
      // Wait for all messages to be processed
      await Promise.all(promises);
    }

    // Save the Broadcast Record
    const finalStatus = failedCount === customerCount ? "FAILED" : "COMPLETED";

    await prisma.broadcast.create({
      data: {
        templateId: templateId,
        senderId: session.user.id,
        targetState: targetStateDesc,
        status: finalStatus,
        totalSent: customerCount,
        totalDelivered: deliveredCount,
        totalFailed: failedCount,
      }
    });

    return NextResponse.json({ 
      success: true, 
      total: customerCount,
      delivered: deliveredCount, 
      failed: failedCount 
    });
  } catch (error) {
    console.error("Broadcast API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
