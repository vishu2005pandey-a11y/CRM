import { Customer, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

import { prisma } from "@/lib/db";

async function getCustomers(role?: string, userId?: string): Promise<Customer[]> {
  let whereClause = {};

  if (role === "ADMIN" && userId) {
    const admin = await prisma.adminProfile.findUnique({ where: { userId } });
    
    // Find all CSVs uploaded by this admin
    const adminUploads = await prisma.csvUploadHistory.findMany({
      where: { uploadedBy: userId },
      select: { id: true }
    });
    const adminUploadIds = adminUploads.map(u => u.id);
    
    const assignedCsvIds = admin?.assignedCsvIds || [];
    const allCsvIds = [...assignedCsvIds, ...adminUploadIds];
    const assignedStates = admin?.assignedStates || [];

    const conditions: any[] = [];
    if (allCsvIds.length > 0) {
      conditions.push({ csvUploadId: { in: allCsvIds } });
    }
    if (assignedStates.length > 0) {
      conditions.push({ state: { in: assignedStates } });
    }

    if (conditions.length > 0) {
      whereClause = { OR: conditions };
    } else {
      // If no states/csvs assigned and no uploads, show none
      return [];
    }
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 100, // limit for UI performance
    include: {
      csvUpload: {
        include: {
          user: {
            select: { name: true, role: true }
          }
        }
      }
    }
  });

  return customers.map(c => {
    let displayStatus = c.status;
    if (c.status === "NEW ADDED" || c.status === "NEW") {
      if (c.csvUpload?.user?.name) {
        displayStatus = `${c.csvUpload.user.name} - NEW ADDED`;
      } else {
        displayStatus = "NEW ADDED";
      }
    }

    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      state: c.state,
      status: displayStatus,
      createdAt: c.createdAt.toISOString().split("T")[0],
    };
  });
}

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  const data = await getCustomers(session?.user?.role, session?.user?.id);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your leads and their statuses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" ? (
              <Link href="/dashboard/upload">
               <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow gap-2">
                 Add Customer
               </Button>
             </Link>
          ) : null}
          <Button variant="outline" className="glass-card rounded-full gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="glass-card rounded-full gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="glass-card p-4 md:p-6 rounded-2xl">
        <DataTable columns={columns} data={data} searchKey="phone" />
      </div>
    </div>
  );
}
