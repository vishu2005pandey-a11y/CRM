"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function ForceLogout() {
  useEffect(() => {
    signOut({ callbackUrl: "/login?error=ACCOUNT_SUSPENDED" });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Your account has been suspended. Logging out...</p>
    </div>
  );
}
