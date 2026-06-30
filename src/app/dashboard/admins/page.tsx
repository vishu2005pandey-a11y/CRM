import { Admin, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { AddAdminDialog } from "./add-admin-dialog";

import { prisma } from "@/lib/db";

async function getAdmins(): Promise<Admin[]> {
  const users = await prisma.user.findMany({
    where: { role: "ADMIN" },
    include: { adminProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map(user => ({
    id: user.id,
    name: user.name || "Unknown",
    email: user.email,
    profileImage: user.profileImage,
    states: user.adminProfile?.assignedStates || [],
    status: (user.adminProfile?.status as any) || "ACTIVE",
    createdAt: user.createdAt.toISOString().split("T")[0],
  }));
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export default async function AdminsPage() {
  const session = await getServerSession(authOptions);
  const data = await getAdmins();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Admins</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your administrators and their assigned states.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {session?.user?.role === "SUPER_ADMIN" && (
            <Link href="/dashboard/upload">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow">
                Upload CSV
              </Button>
            </Link>
          )}
          <Suspense fallback={<Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow">Add Admin</Button>}>
            <AddAdminDialog />
          </Suspense>
        </div>
      </div>

      <div className="glass-card p-4 md:p-6 rounded-2xl">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
