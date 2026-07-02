"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { Users, UserPlus, MessageSquare, Truck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentActivityItem {
  id: string;
  name: string;
  state: string | null;
  createdAt: string;
}

interface DashboardClientProps {
  userName?: string;
  adminsCount: number;
  customersCount: number;
  broadcastsCount: number;
  pendingOrdersCount: number;
  monthlyData: { name: string; total: number }[];
  recentActivity: RecentActivityItem[];
}

export function DashboardClient({
  userName,
  adminsCount,
  customersCount,
  broadcastsCount,
  pendingOrdersCount,
  monthlyData,
  recentActivity,
}: DashboardClientProps) {
  const { t } = useLanguage();

  const welcomeMsg = t.dashboard.welcome.replace("{name}", userName || "Admin");

  const stats = [
    {
      title: t.dashboard.totalAdmins,
      value: adminsCount.toString(),
      icon: Users,
      trend: t.dashboard.activeAdmins,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: t.dashboard.totalCustomers,
      value: customersCount.toString(),
      icon: UserPlus,
      trend: t.dashboard.importedLeads,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: t.dashboard.totalBroadcasts,
      value: broadcastsCount.toString(),
      icon: MessageSquare,
      trend: t.dashboard.campaignsSent,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: t.dashboard.pendingOrders,
      value: pendingOrdersCount.toString(),
      icon: Truck,
      trend: t.dashboard.requiresAttention,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
          <p className="text-muted-foreground mt-1">{welcomeMsg}</p>
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
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="glass-card border-none lg:col-span-4">
          <CardHeader>
            <CardTitle>{t.dashboard.broadcastOverview}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={monthlyData} />
          </CardContent>
        </Card>

        <Card className="glass-card border-none lg:col-span-3">
          <CardHeader>
            <CardTitle>{t.dashboard.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recent activity found.</div>
            ) : (
              <div className="space-y-8">
                {recentActivity.map((customer) => (
                  <div key={customer.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://avatar.vercel.sh/${customer.name}.png`} alt="Avatar" />
                      <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        New customer added from {customer.state}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {customer.createdAt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
