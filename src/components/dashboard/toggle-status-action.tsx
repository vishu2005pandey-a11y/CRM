"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ToggleStatusAction({ userId, currentStatus, type }: { userId: string, currentStatus: string, type: "ADMIN" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isSuspended = currentStatus === "SUSPENDED" || currentStatus === "suspended";

  const handleToggle = async () => {
    setLoading(true);
    const newStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

    try {
      const res = await fetch("/api/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Account marked as ${newStatus}`);
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={(e) => {
        e.preventDefault();
        handleToggle();
      }}
      className={isSuspended ? "text-green-500 focus:bg-green-500/10" : "text-destructive focus:bg-destructive/10"}
      disabled={loading}
    >
      {loading ? "Updating..." : isSuspended ? "Activate Account" : "Suspend Account"}
    </DropdownMenuItem>
  );
}
