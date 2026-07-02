"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { History, LayoutTemplate } from "lucide-react";
import Link from "next/link";

export function BroadcastsPageHeader({ role }: { role?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.broadcasts.title}</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t.broadcasts.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {["SUPER_ADMIN", "ADMIN"].includes(role || "") && (
          <Link href="/dashboard/broadcasts/templates" className="w-full sm:w-auto">
            <Button variant="outline" className="glass-card rounded-full gap-2 w-full sm:w-auto">
              <LayoutTemplate className="h-4 w-4" /> {t.broadcasts.manageTemplates}
            </Button>
          </Link>
        )}
        <Link href="/dashboard/broadcasts/history" className="w-full sm:w-auto">
          <Button variant="outline" className="glass-card rounded-full gap-2 w-full sm:w-auto">
            <History className="h-4 w-4" /> {t.broadcasts.history}
          </Button>
        </Link>
      </div>
    </div>
  );
}
