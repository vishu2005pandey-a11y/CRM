"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AddAdminDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    states: "",
    csvId: "",
  });

  useEffect(() => {
    // If URL has create=true, auto open and set states/csvId
    if (searchParams.get("create") === "true") {
      setOpen(true);
      const urlStates = searchParams.get("states");
      const urlCsvId = searchParams.get("csvId");
      if (urlStates) {
        setFormData(prev => ({ ...prev, states: urlStates.toLowerCase() }));
      }
      if (urlCsvId) {
        setFormData(prev => ({ ...prev, csvId: urlCsvId }));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (open) {
      const urlStates = searchParams.get("states");
      if (urlStates) {
        setAvailableStates(urlStates.split(",").map(s => s.toLowerCase().trim()));
      } else {
        fetch("/api/states")
          .then(res => res.json())
          .then(data => setAvailableStates(data.map((s: string) => s.toLowerCase().trim())))
          .catch(() => console.error("Failed to load states"));
      }
    }
  }, [open, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate states
    const requestedStates = formData.states.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    for (const state of requestedStates) {
      if (!availableStates.includes(state)) {
        toast.error(`Upload CSV first for state: ${state.toUpperCase()}`);
        return;
      }
    }

    setLoading(true);
    
    try {
      const res = await fetch("/api/users/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Admin created successfully!");
        setOpen(false);
        setFormData({ name: "", email: "", password: "", states: "", csvId: "" });
        router.refresh();
      } else {
        toast.error("Failed to create admin");
      }
    } catch (err) {
      toast.error("Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-glow" />
        }
      >
        <Plus className="mr-2 h-4 w-4" /> Add Admin
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
          <DialogDescription>
            Generate credentials and assign specific states to this admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background/50 border-white/10"
              placeholder="Admin Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background/50 border-white/10"
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="text"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-background/50 border-white/10"
              placeholder="Auto-generated or custom"
            />
          </div>
          <div className="space-y-2">
            <Label>Assigned States</Label>
            {availableStates.length === 0 ? (
              <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg">
                No states available. Please upload a CSV first.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto p-2 bg-background/50 rounded-md border border-white/10">
                {availableStates.map((state) => {
                  const isSelected = formData.states.includes(state);
                  return (
                    <label key={state} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentStates = formData.states.split(",").map(s => s.trim()).filter(Boolean);
                          if (e.target.checked) {
                            setFormData({ ...formData, states: [...currentStates, state].join(",") });
                          } else {
                            setFormData({ ...formData, states: currentStates.filter(s => s !== state).join(",") });
                          }
                        }}
                        className="rounded border-white/20 bg-background accent-primary"
                      />
                      <span className="text-sm capitalize">{state}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Select the states this admin will manage.
            </p>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading || availableStates.length === 0} className="w-full bg-primary hover:bg-primary/90 text-white rounded-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Admin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
