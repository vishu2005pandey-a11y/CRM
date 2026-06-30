import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TemplatesClient } from "./templates-client";

export default async function ManageTemplatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard/broadcasts");
  }

  return <TemplatesClient />;
}
