import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, MessageSquare, Truck, IndianRupee } from "lucide-react";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  let customerFilter = {};
  let orderFilter = {};
  
  if (session?.user?.role === "ADMIN") {
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (adminProfile?.assignedCsvIds?.length) {
      customerFilter = { csvUploadId: { in: adminProfile.assignedCsvIds } };
      orderFilter = { customer: { csvUploadId: { in: adminProfile.assignedCsvIds } } };
    } else if (adminProfile?.assignedStates?.length) {
      // Legacy fallback
      customerFilter = { state: { in: adminProfile.assignedStates } };
      orderFilter = { state: { in: adminProfile.assignedStates } };
    } else {
      customerFilter = { id: { in: [] } }; // matches nothing
      orderFilter = { id: { in: [] } };
    }
  }

  const adminsCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const customersCount = await prisma.customer.count({ where: customerFilter });
  const broadcastsCount = await prisma.broadcast.count(
    Object.keys(customerFilter).length && (customerFilter as any).state ? { where: { targetState: { in: (customerFilter as any).state.in } } } : undefined
  );
  const pendingOrdersCount = await prisma.order.count({ 
    where: { status: "PENDING", ...orderFilter } 
  });

  const stats = [
    {
      title: "Total Admins",
      value: adminsCount.toString(),
      icon: Users,
      trend: "Active admins",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Customers",
      value: customersCount.toString(),
      icon: UserPlus,
      trend: "Imported leads",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Total Broadcasts",
      value: broadcastsCount.toString(),
      icon: MessageSquare,
      trend: "Campaigns sent",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Pending Orders",
      value: pendingOrdersCount.toString(),
      icon: Truck,
      trend: "Requires attention",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  // Generate chart data for broadcasts in the current year
  const currentYear = new Date().getFullYear();
  const allBroadcasts = await prisma.broadcast.findMany({
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
      },
      ...(Object.keys(customerFilter).length && (customerFilter as any).state ? { targetState: { in: (customerFilter as any).state.in } } : {})
    },
    select: { createdAt: true }
  });

  const monthlyData = [
    { name: "Jan", total: 0 }, { name: "Feb", total: 0 }, { name: "Mar", total: 0 },
    { name: "Apr", total: 0 }, { name: "May", total: 0 }, { name: "Jun", total: 0 },
    { name: "Jul", total: 0 }, { name: "Aug", total: 0 }, { name: "Sep", total: 0 },
    { name: "Oct", total: 0 }, { name: "Nov", total: 0 }, { name: "Dec", total: 0 },
  ];

  allBroadcasts.forEach((b) => {
    const monthIndex = b.createdAt.getMonth();
    monthlyData[monthIndex].total += 1;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name || "Admin"}. Here's what's happening.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card border-none hover:-translate-y-1 transition-transform duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-heading">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="glass-card border-none col-span-4">
          <CardHeader>
            <CardTitle>Broadcast Overview (This Year)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={monthlyData} />
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
