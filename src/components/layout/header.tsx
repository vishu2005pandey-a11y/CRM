"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/contexts/sidebar-context";
import { getPusherClient } from "@/lib/pusher";
import { useLanguage } from "@/contexts/language-context";

export function Header({ user }: { user: any }) {
  const { toggle } = useSidebar();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user?.id) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `user-${user.id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("account-suspended", () => {
      signOut({ callbackUrl: `/login?error=ACCOUNT_SUSPENDED&userId=${user.id}` });
    });

    return () => {
      channel.unbind("account-suspended");
      pusher.unsubscribe(channelName);
    };
  }, [user?.id]);

  return (
    <header className="h-16 md:h-20 glass sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between border-b-0 border-white/5 shadow-sm">
      <div className="flex items-center gap-4 w-full max-w-md">
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.header.searchPlaceholder}
            className="pl-9 bg-background/30 border-none focus-visible:ring-1 shadow-none rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <Avatar className="h-9 w-9 border border-primary/20">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-white/10">
            <div className="px-2 py-1.5 text-sm font-semibold">{t.header.myAccount}</div>
            <DropdownMenuSeparator className="bg-white/10" />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="cursor-pointer">{t.header.profile}</DropdownMenuItem>
            </Link>
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="cursor-pointer">{t.header.settings}</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-destructive focus:bg-destructive/10"
            >
              {t.header.logOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
