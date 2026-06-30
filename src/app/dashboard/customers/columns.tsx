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
import { DeleteAction } from "@/components/dashboard/delete-action";
import { toast } from "sonner";
import Link from "next/link";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  state: string;
  status: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  "NEW": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "NEW ADDED": "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30",
  "CONTACTED": "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
  "CONVERTED": "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  "REJECTED": "bg-destructive/20 text-destructive hover:bg-destructive/30",
};

export const columns: ColumnDef<Customer>[] = [
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
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="glass">
          {row.getValue("state")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let colorClass = statusColors[status];
      if (!colorClass && status.includes("NEW ADDED")) {
        colorClass = statusColors["NEW ADDED"];
      }
      return (
        <Badge
          variant="secondary"
          className={colorClass || "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"}
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
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(customer.phone);
              toast.success("Phone number copied");
            }}>
              Copy Phone
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => window.location.href = "/dashboard/broadcasts"}>
              Send Message
            </DropdownMenuItem>
            <DeleteAction id={customer.id} endpoint="/api/customers/delete" entityName="Customer" />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
