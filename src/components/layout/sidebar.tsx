"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useLanguage } from "@/contexts/language-context";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { isOpen, setIsOpen } = useSidebar();
  const { t } = useLanguage();

  const navItems = [
    { key: "dashboard", name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { key: "admins", name: t.nav.admins, href: "/dashboard/admins", icon: Users, roles: ["SUPER_ADMIN"] },
    { key: "customers", name: t.nav.customers, href: "/dashboard/customers", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
    { key: "broadcasts", name: t.nav.broadcasts, href: "/dashboard/broadcasts", icon: MessageSquare, roles: ["SUPER_ADMIN", "ADMIN"] },
    { key: "adminBroadcasts", name: t.nav.adminBroadcasts, href: "/dashboard/admin-broadcasts", icon: MessageSquare, roles: ["SUPER_ADMIN"] },
    { key: "settings", name: t.nav.settings, href: "/dashboard/settings", icon: Settings },
  ];

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="h-screen w-64 glass-card border-r-0 rounded-none rounded-r-3xl fixed left-0 top-0 z-50 flex flex-col justify-between shadow-2xl lg:shadow-none"
            >
              <div>
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                  <h1
                    className={cn(
                      "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                      role === "ADMIN"
                        ? "from-emerald-400 to-teal-500"
                        : "from-primary to-purple-400"
                    )}
                  >
                    {role === "ADMIN" ? t.nav.adminPanel : t.nav.crmPro}
                  </h1>
                </div>

                <nav className="p-4 space-y-2 mt-4">
                  {visibleNavItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.key}
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
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <item.icon className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 mb-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 min-h-[44px]"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
