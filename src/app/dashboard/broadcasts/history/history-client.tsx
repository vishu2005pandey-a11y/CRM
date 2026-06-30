"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Broadcast {
  id: string;
  template: { name: string, messageBody: string };
  sender: { name: string, email: string };
  targetState: string;
  status: string;
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  createdAt: string;
}

export function HistoryClient({ 
  role, 
  filterRole,
  title = "Broadcast History",
  subtitle = "View the status and reach of your past broadcasts."
}: { 
  role: string, 
  filterRole?: string,
  title?: string,
  subtitle?: string
}) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = role === "SUPER_ADMIN";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const url = filterRole ? `/api/broadcast-history?filterRole=${filterRole}` : "/api/broadcast-history";
      const res = await fetch(url);
      const data = await res.json();
      if (data.broadcasts) setBroadcasts(data.broadcasts);
    } catch (error) {
      toast.error("Failed to load broadcast history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/broadcasts">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Template</th>
                {isSuperAdmin && <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Sender</th>}
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Target</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Stats</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : broadcasts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No broadcasts found in your history.
                  </td>
                </tr>
              ) : (
                broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{format(new Date(b.createdAt), "MMM d, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(b.createdAt), "h:mm a")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{b.template.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{b.template.messageBody}</div>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4">
                        <div className="text-sm">{b.sender.name}</div>
                        <div className="text-xs text-muted-foreground">{b.sender.email}</div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-white/5 font-normal text-xs">{b.targetState}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs">
                         <div className="flex flex-col items-center">
                            <span className="font-semibold text-foreground">{b.totalSent}</span>
                            <span className="text-muted-foreground">Total</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="font-semibold text-green-500">{b.totalDelivered}</span>
                            <span className="text-muted-foreground">Delivered</span>
                         </div>
                         <div className="flex flex-col items-center">
                            <span className="font-semibold text-red-500">{b.totalFailed}</span>
                            <span className="text-muted-foreground">Failed</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status === "COMPLETED" ? (
                        <div className="flex items-center justify-end gap-1 text-green-500 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" /> Completed
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-red-500 text-sm font-medium">
                          <XCircle className="h-4 w-4" /> {b.status}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
