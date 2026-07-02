"use client";

import { useLanguage } from "@/contexts/language-context";

export function DashboardPageHeader({ userName }: { userName?: string }) {
  const { t } = useLanguage();
  const welcomeMsg = t.dashboard.welcome.replace("{name}", userName || "Admin");

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
      <p className="text-muted-foreground mt-1">{welcomeMsg}</p>
    </div>
  );
}

export function DashboardStatLabels() {
  const { t } = useLanguage();
  return {
    totalAdmins: t.dashboard.totalAdmins,
    totalCustomers: t.dashboard.totalCustomers,
    totalBroadcasts: t.dashboard.totalBroadcasts,
    pendingOrders: t.dashboard.pendingOrders,
    activeAdmins: t.dashboard.activeAdmins,
    importedLeads: t.dashboard.importedLeads,
    campaignsSent: t.dashboard.campaignsSent,
    requiresAttention: t.dashboard.requiresAttention,
    broadcastOverview: t.dashboard.broadcastOverview,
    recentActivity: t.dashboard.recentActivity,
  };
}
