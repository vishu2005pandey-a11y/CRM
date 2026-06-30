import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/contexts/sidebar-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
        {/* Background blobs for spatial UI */}
        {session.user.role === "ADMIN" ? (
          <>
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/15 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/15 blur-[150px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
          </>
        )}

        <Sidebar />
        
        <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative z-10 w-full max-w-full">
          <Header user={session.user} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden smooth-scroll">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
