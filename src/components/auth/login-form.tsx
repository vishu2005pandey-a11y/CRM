"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, UserCog, UserCheck, Bike, UserPlus } from "lucide-react";
import { toast } from "sonner";

type RoleType = "SUPER_ADMIN" | "ADMIN";
type AuthMode = "LOGIN";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<RoleType>("SUPER_ADMIN");
  const [mode, setMode] = useState<AuthMode>("LOGIN");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
  };

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
        if (res.error === "ACCOUNT_SUSPENDED") {
          setError("Your account has been suspended by the Super Admin.");
          toast.error("Your account has been suspended by the Super Admin.");
        } else {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md p-8 glass-card border border-white/10"
    >
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the CRM
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/10 overflow-hidden">
        <button
          onClick={() => handleRoleChange("SUPER_ADMIN")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all rounded-lg ${
            role === "SUPER_ADMIN" ? "bg-primary/20 text-primary shadow-glow" : "text-muted-foreground hover:text-white"
          }`}
        >
          <UserCog className="h-5 w-5" />
          Super Admin
        </button>
        <button
          onClick={() => handleRoleChange("ADMIN")}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all rounded-lg ${
            role === "ADMIN" ? "bg-primary/20 text-primary shadow-glow" : "text-muted-foreground hover:text-white"
          }`}
        >
          <UserCheck className="h-5 w-5" />
          Admin
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.form 
          key={`${role}-${mode}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div className="space-y-2 relative">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-background/50 border-border/50 focus:border-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
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
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-500/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.form>


      </AnimatePresence>
    </motion.div>
  );
}
