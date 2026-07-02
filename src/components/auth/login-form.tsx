"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, UserCog, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher";
import { useLanguage } from "@/contexts/language-context";
import type { Language } from "@/lib/i18n";

type RoleType = "SUPER_ADMIN" | "ADMIN";
type AuthMode = "LOGIN";

export function LoginForm() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [role, setRole] = useState<RoleType>("SUPER_ADMIN");
  const [mode, setMode] = useState<AuthMode>("LOGIN");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const userId = searchParams.get("userId");

  const [error, setError] = useState(
    urlError === "ACCOUNT_SUSPENDED" ? t.login.suspended : ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `user-${userId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("account-activated", () => {
      setError("");
      toast.success(t.login.activated);
      router.replace("/login");
    });

    return () => {
      channel.unbind("account-activated");
      pusher.unsubscribe(channelName);
    };
  }, [userId, router, t.login.activated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("ACCOUNT_SUSPENDED")) {
          setError(t.login.suspended);
          toast.error(t.login.suspended);
        } else {
          setError(t.login.invalidCreds);
          toast.error(t.login.invalidCreds);
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(t.login.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* ── Language Toggle ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-center bg-white/5 border border-white/10 rounded-full p-1.5 gap-2"
      >
        {/* English */}
        <button
          type="button"
          onClick={() => setLang("en")}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
            lang === "en"
              ? "text-white shadow-lg shadow-primary/30 scale-105"
              : "text-muted-foreground hover:text-white"
          }`}
          style={{ minWidth: "110px" }}
        >
          {lang === "en" && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-xl leading-none">🇬🇧</span>
            English
          </span>
        </button>

        {/* Turkish */}
        <button
          type="button"
          onClick={() => setLang("tr")}
          className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden ${
            lang === "tr"
              ? "text-white shadow-lg shadow-purple-500/30 scale-105"
              : "text-muted-foreground hover:text-white"
          }`}
          style={{ minWidth: "110px" }}
        >
          {lang === "tr" && (
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-purple-500" />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-xl leading-none">🇹🇷</span>
            Türkçe
          </span>
        </button>
      </motion.div>

      {/* ── Login Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full p-8 glass-card border border-white/10"
      >
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            <AnimatePresence mode="wait">
              <motion.span
                key={lang + "-welcome"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {t.login.welcome}
              </motion.span>
            </AnimatePresence>
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={lang + "-subtitle"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {t.login.subtitle}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Role Selector */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setRole("SUPER_ADMIN")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all rounded-lg ${
              role === "SUPER_ADMIN"
                ? "bg-primary/20 text-primary shadow-glow"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <UserCog className="h-5 w-5" />
            {t.login.superAdmin}
          </button>
          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all rounded-lg ${
              role === "ADMIN"
                ? "bg-primary/20 text-primary shadow-glow"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <UserCheck className="h-5 w-5" />
            {t.login.admin}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={`${role}-${mode}-${lang}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div className="space-y-2 relative">
              <Label htmlFor="email">{t.login.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">{t.login.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full relative overflow-hidden group"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t.login.signIn}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-500/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
