"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function HistoryTable({ history }: { history: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this upload history record? (This will not delete the customers, only the log)")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch("/api/upload-csv/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("History deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete history");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  if (history.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center text-muted-foreground">
        No CSV files uploaded yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-white/5 border-b border-white/10 text-muted-foreground whitespace-nowrap">
          <tr>
            <th className="px-6 py-4 font-medium">Date</th>
            <th className="px-6 py-4 font-medium">File Name</th>
            <th className="px-6 py-4 font-medium">Uploaded By</th>
            <th className="px-6 py-4 font-medium">Records</th>
            <th className="px-6 py-4 font-medium">States</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {history.map((h) => (
            <tr key={h.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(h.createdAt).toISOString().split('T')[0]}
              </td>
              <td className="px-6 py-4 font-medium text-primary">
                {h.fileName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {h.user?.name || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col text-xs">
                  <span className="text-green-500">{h.validRecords} imported</span>
                  <span className="text-muted-foreground">{h.duplicatesSkipped} skipped</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {h.statesUploaded.slice(0, 3).map((s: string) => (
                    <Badge key={s} variant="outline" className="text-[10px] bg-white/5">
                      {s}
                    </Badge>
                  ))}
                  {h.statesUploaded.length > 3 && (
                    <Badge variant="outline" className="text-[10px] bg-white/5">
                      +{h.statesUploaded.length - 3} more
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  {h.statesUploaded.length > 0 && (
                    <Link href={`/dashboard/admins?create=true&states=${encodeURIComponent(h.statesUploaded.join(","))}&csvId=${h.id}`}>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 border-blue-400/20" title="Assign Admin for this CSV data">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button 
                    onClick={() => handleDelete(h.id)}
                    disabled={deletingId === h.id}
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/20"
                    title="Delete History Record"
                  >
                    {deletingId === h.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
