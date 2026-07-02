"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import Link from "next/link";

export function CustomersPageHeader({ role }: { role?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.customers.title}</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t.customers.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {(role === "ADMIN" || role === "SUPER_ADMIN") && (
          <Link href="/dashboard/upload">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow gap-2">
              {t.customers.addCustomer}
            </Button>
          </Link>
        )}
        <Button variant="outline" className="glass-card rounded-full gap-2">
          <Filter className="h-4 w-4" /> {t.customers.filter}
        </Button>
        <Button variant="outline" className="glass-card rounded-full gap-2">
          <Download className="h-4 w-4" /> {t.customers.export}
        </Button>
      </div>
    </div>
  );
}
