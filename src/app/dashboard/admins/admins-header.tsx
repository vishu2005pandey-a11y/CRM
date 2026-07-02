"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminsPageHeader({ role }: { role?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.admins.title}</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">{t.admins.subtitle}</p>
      </div>
    </div>
  );
}
