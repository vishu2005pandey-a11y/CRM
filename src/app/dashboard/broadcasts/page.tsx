import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { BroadcastForm } from "@/components/broadcasts/broadcast-form";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BroadcastsPageHeader } from "./broadcasts-header";

export default async function BroadcastsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  let targetCount = 0;
  let targetDescription = "All Customers";
  let adminCount = 0;

  if (session.user.role === "SUPER_ADMIN") {
    targetCount = await prisma.customer.count();
    adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  } else if (session.user.role === "ADMIN") {
    const admin = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (admin?.assignedCsvIds?.length) {
      targetCount = await prisma.customer.count({
        where: { csvUploadId: { in: admin.assignedCsvIds } },
      });
      targetDescription = `CSV IDs: ${admin.assignedCsvIds.join(", ")}`;
    } else if (admin?.assignedStates?.length) {
      targetCount = await prisma.customer.count({
        where: { state: { in: admin.assignedStates } },
      });
      targetDescription = `Customers in ${admin.assignedStates.join(", ")}`;
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <BroadcastsPageHeader role={session.user.role} />
      <BroadcastForm role={session.user.role} targetCount={targetCount} targetDescription={targetDescription} adminCount={adminCount} />
    </div>
  );
}
