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

export type Order = {
  id: string;
  orderId: string; // The MongoDB ObjectID
  customerName: string;
  phone: string;

  status: "PENDING" | "ASSIGNED" | "DELIVERED" | "CANCELLED" | "REJECTED";
  state: string;
  createdAt: string;
};

const statusColors = {
  PENDING: "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
  ASSIGNED: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  DELIVERED: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  CANCELLED: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  REJECTED: "bg-destructive/20 text-destructive hover:bg-destructive/30",
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge
          variant="secondary"
          className={statusColors[status] || ""}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Order Date",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(order.id);
              toast.success("Order ID copied");
            }}>
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />

            <DropdownMenuItem onClick={() => window.location.href = "/dashboard/customers"}>
              View Customer
            </DropdownMenuItem>
            <DeleteAction id={order.orderId} endpoint="/api/orders/delete" entityName="Order" />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
