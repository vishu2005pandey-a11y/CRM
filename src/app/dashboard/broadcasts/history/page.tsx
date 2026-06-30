import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryClient } from "./history-client";

export default async function BroadcastHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return <HistoryClient role={session.user.role} />;
}
