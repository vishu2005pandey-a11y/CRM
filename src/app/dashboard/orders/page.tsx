import { Order, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/db";

async function getOrders(role?: string, userId?: string): Promise<Order[]> {
  let whereClause = {};

  if (role === "ADMIN" && userId) {
    const admin = await prisma.adminProfile.findUnique({ where: { userId } });
    if (admin && admin.assignedCsvIds && admin.assignedCsvIds.length > 0) {
      whereClause = { customer: { csvUploadId: { in: admin.assignedCsvIds } } };
    } else if (admin && admin.assignedStates && admin.assignedStates.length > 0) {
      whereClause = { state: { in: admin.assignedStates } };
    } else {
      return [];
    }
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      customer: true
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return orders.map(o => ({
    id: o.orderNumber,
    orderId: o.id,
    customerName: o.customer?.name || "Unknown",
    phone: o.customer?.phone || "N/A",

    status: o.status as any,
    state: o.state,
    createdAt: o.createdAt.toLocaleString(),
  }));
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const data = await getOrders(session?.user?.role, session?.user?.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass-card rounded-full gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <DataTable columns={columns} data={data} searchKey="id" />
      </div>
    </div>
  );
}
