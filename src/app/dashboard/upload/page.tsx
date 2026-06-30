import { CsvUploader } from "@/components/upload/csv-uploader";
import { Download, Info, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { HistoryTable } from "./history-table";
import { Badge } from "@/components/ui/badge";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  let historyQuery = {};
  if (session?.user?.role === "ADMIN") {
    historyQuery = { uploadedBy: session?.user?.id };
  }

  const history = await prisma.csvUploadHistory.findMany({
    where: historyQuery,
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upload Leads</h2>
          <p className="text-muted-foreground mt-1">
            Import customers via CSV to start broadcasting promotional messages.
          </p>
        </div>
        <Button variant="outline" className="glass-card gap-2 rounded-full">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-3 text-blue-500">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">CSV Formatting Rules:</p>
          <ul className="list-disc ml-5 mt-1 opacity-80">
            <li>Required columns: <strong>Name, Phone Number, State</strong></li>
            <li>Optional columns: District, City, Address, Product</li>
            <li>Duplicate phone numbers will be automatically skipped or updated.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <CsvUploader userRole={session?.user?.role} />
      </div>

      <div className="mt-12 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Upload History
        </h3>
        <HistoryTable history={history} />
      </div>
    </div>
  );
}
