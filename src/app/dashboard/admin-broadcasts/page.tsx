import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryClient } from "../broadcasts/history/history-client";

export default async function AdminBroadcastsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return (
    <HistoryClient 
      role={session.user.role} 
      filterRole="ADMIN"
      title="Admin Broadcasts"
      subtitle="Monitor WhatsApp broadcasts sent by Admins."
    />
  );
}
