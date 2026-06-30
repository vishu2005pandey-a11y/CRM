"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteActionProps {
  id: string;
  endpoint: string;
  entityName: string;
}

export function DeleteAction({ id, endpoint, entityName }: DeleteActionProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this ${entityName}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`${entityName} deleted successfully`);
        router.refresh();
      } else {
        const errorMsg = await res.text();
        toast.error(`Failed to delete ${entityName.toLowerCase()}: ${errorMsg || "Unknown error"}`);
      }
    } catch (err) {
      toast.error(`Error deleting ${entityName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      className="text-destructive focus:bg-destructive/10"
      disabled={loading}
    >
      {loading ? "Deleting..." : `Delete ${entityName}`}
    </DropdownMenuItem>
  );
}
