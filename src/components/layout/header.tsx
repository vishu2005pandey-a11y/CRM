"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

export function Header({ user }: { user: any }) {
  return (
    <header className="h-20 glass sticky top-0 z-30 px-8 flex items-center justify-between border-b-0 border-white/5 shadow-sm">
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Global search..."
            className="pl-9 bg-background/30 border-none focus-visible:ring-1 shadow-none rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{user?.role?.toLowerCase().replace("_", " ")}</p>
              </div>
              <Avatar className="h-9 w-9 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-white/10">
            <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-destructive focus:bg-destructive/10">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
