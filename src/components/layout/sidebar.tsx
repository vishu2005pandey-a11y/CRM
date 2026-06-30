"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Truck,
  Settings,
  LogOut,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Admins", href: "/dashboard/admins", icon: Users, roles: ["SUPER_ADMIN"] },
  { name: "Customers", href: "/dashboard/customers", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Broadcasts", href: "/dashboard/broadcasts", icon: MessageSquare, roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Admin Broadcasts", href: "/dashboard/admin-broadcasts", icon: MessageSquare, roles: ["SUPER_ADMIN"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="h-screen w-64 glass-card border-r-0 rounded-none rounded-r-3xl fixed left-0 top-0 z-40 flex flex-col justify-between"
    >
      <div>
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <h1 className={cn(
            "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
            role === "ADMIN" ? "from-emerald-400 to-teal-500" : "from-primary to-purple-400"
          )}>
            {role === "ADMIN" ? "Admin Panel" : "CRM Pro"}
          </h1>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
