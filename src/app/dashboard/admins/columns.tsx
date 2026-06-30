"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleStatusAction } from "@/components/dashboard/toggle-status-action";
import { DeleteAction } from "@/components/dashboard/delete-action";
import { toast } from "sonner";
import Link from "next/link";

export type Admin = {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  states: string[];
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

export const columns: ColumnDef<Admin>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const profileImage = row.original.profileImage;
      const initials = name ? name.substring(0, 2).toUpperCase() : "AD";
      return (
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img src={profileImage} alt={name} className="w-10 h-10 rounded-full object-cover border border-primary/20 shadow-soft" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-soft">
              {initials}
            </div>
          )}
          <span className="font-medium">{name}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "states",
    header: "Assigned States",
    cell: ({ row }) => {
      const states = row.getValue("states") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {states.map((state) => (
            <Badge key={state} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
              {state}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "ACTIVE" ? "default" : "destructive"}
          className={status === "ACTIVE" ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" : ""}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Added",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(admin.id);
              toast.success("Admin ID copied to clipboard");
            }}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            
            {/* TODO: Add Edit Dialog if needed, for now redirect or just show UI placeholder. We'll skip complex edit forms and rely on Delete/Add */}
            <ToggleStatusAction userId={admin.id} currentStatus={admin.status} type="ADMIN" />
            <DeleteAction id={admin.id} endpoint="/api/users/delete" entityName="Admin" />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
