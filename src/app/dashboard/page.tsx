import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  let customerFilter: any = {};
  let orderFilter: any = {};

  if (session?.user?.role === "ADMIN") {
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (adminProfile?.assignedCsvIds?.length) {
      customerFilter = { csvUploadId: { in: adminProfile.assignedCsvIds } };
      orderFilter = { customer: { csvUploadId: { in: adminProfile.assignedCsvIds } } };
    } else if (adminProfile?.assignedStates?.length) {
      customerFilter = { state: { in: adminProfile.assignedStates } };
      orderFilter = { state: { in: adminProfile.assignedStates } };
    } else {
      customerFilter = { id: { in: [] } };
      orderFilter = { id: { in: [] } };
    }
  }

  const adminsCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const customersCount = await prisma.customer.count({ where: customerFilter });
  const broadcastsCount = await prisma.broadcast.count(
    Object.keys(customerFilter).length && (customerFilter as any).state
      ? { where: { targetState: { in: (customerFilter as any).state.in } } }
      : undefined
  );
  const pendingOrdersCount = await prisma.order.count({
    where: { status: "PENDING", ...orderFilter },
  });

  // Monthly broadcast chart data
  const currentYear = new Date().getFullYear();
  const allBroadcasts = await prisma.broadcast.findMany({
    where: {
      createdAt: { gte: new Date(`${currentYear}-01-01`) },
      ...(Object.keys(customerFilter).length && (customerFilter as any).state
        ? { targetState: { in: (customerFilter as any).state.in } }
        : {}),
    },
    select: { createdAt: true },
  });

  const monthlyData = [
    { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
    { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
    { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
    { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
  ];

  allBroadcasts.forEach((b) => {
    monthlyData[b.createdAt.getMonth()].total += 1;
  });

  // Recent activity — latest 5 customers
  const latestCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, state: true, createdAt: true },
  });

  const recentActivity = latestCustomers.map((c) => ({
    id: c.id,
    name: c.name,
    state: c.state,
    createdAt: c.createdAt.toLocaleDateString(),
  }));

  return (
    <DashboardClient
      userName={session?.user?.name || "Admin"}
      adminsCount={adminsCount}
      customersCount={customersCount}
      broadcastsCount={broadcastsCount}
      pendingOrdersCount={pendingOrdersCount}
      monthlyData={monthlyData}
      recentActivity={recentActivity}
    />
  );
}
