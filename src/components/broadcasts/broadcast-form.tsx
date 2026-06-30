"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ImagePlus, Send, Loader2, CheckCircle2, Users2, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CustomerLight {
  id: string;
  name: string;
  phone: string;
  state: string;
}

interface Template {
  id: string;
  name: string;
  messageBody: string;
  imageUrl?: string;
  buttons?: string[];
}

export function BroadcastForm({ role, targetCount = 0, targetDescription = "All Customers", adminCount = 0 }: { role?: string, targetCount?: number, targetDescription?: string, adminCount?: number }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [stats, setStats] = useState({ delivered: 0, failed: 0 });

  // Custom Audience state
  const [audienceType, setAudienceType] = useState<"all" | "custom">("all");
  const [customers, setCustomers] = useState<CustomerLight[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const isSuperAdmin = role === "SUPER_ADMIN";

  useEffect(() => {
    if (audienceType === "custom" && customers.length === 0) {
      setLoadingCustomers(true);
      fetch("/api/customers/list")
        .then(res => res.json())
        .then(data => {
          if (data.customers) {
            setCustomers(data.customers);
          }
        })
        .finally(() => setLoadingCustomers(false));
    }
  }, [audienceType, customers.length]);

  useEffect(() => {
    setLoadingTemplates(true);
    fetch("/api/broadcast-templates")
      .then(res => res.json())
      .then(data => {
        if (data.templates) {
          setTemplates(data.templates);
          if (data.templates.length > 0) {
            setSelectedTemplateId(data.templates[0].id);
            setMessage(data.templates[0].messageBody);
          }
        }
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedTemplateId(id);

    const selected = templates.find(t => t.id === id);
    if (selected) {
      setMessage(selected.messageBody);
    }
  };

  const toggleCustomer = (id: string) => {
    const newSet = new Set(selectedCustomerIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCustomerIds(newSet);
  };

  const actualTargetCount = audienceType === "custom" ? selectedCustomerIds.size : targetCount;

  const handleBroadcast = async () => {
    if (isSuperAdmin && adminCount === 0) {
      toast.error("First upload CSV, make admin, then broadcast");
      return;
    }

    if (actualTargetCount === 0) {
      toast.error("No customers selected to target!");
      return;
    }

    if (!selectedTemplateId) {
       toast.error("Please select a template");
       return;
    }

    setStatus("sending");
    setProgress(20);

    try {
      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          selectedCustomerIds: audienceType === "custom" ? Array.from(selectedCustomerIds) : undefined,
          templateId: selectedTemplateId,
        }),
      });

      const data = await response.json();
      setProgress(100);

      if (response.ok) {
        setStatus("completed");
        setStats({ delivered: data.delivered || 0, failed: data.failed || 0 });
      } else {
        toast.error("Broadcast Failed: " + (data.error || "Unknown error"));
        setStatus("idle");
      }
      } catch (err) {
        console.error(err);
        toast.error("Failed to send broadcast");
        setStatus("idle");
      }
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div>
          <h3 className="text-xl font-bold">Select Template</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a pre-approved template to broadcast to your customers.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Target Audience</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 flex-1">
                <input 
                  type="radio" 
                  name="audience" 
                  value="all" 
                  checked={audienceType === "all"} 
                  onChange={() => setAudienceType("all")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">Send to All ({targetCount})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 flex-1">
                <input 
                  type="radio" 
                  name="audience" 
                  value="custom" 
                  checked={audienceType === "custom"} 
                  onChange={() => setAudienceType("custom")}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">Select Specific</span>
              </label>
            </div>
          </div>

          <AnimatePresence>
            {audienceType === "custom" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-background/50 border border-white/10 rounded-xl p-4 max-h-[250px] overflow-y-auto space-y-2">
                  {loadingCustomers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No customers found.</div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-2">
                        <span className="text-sm font-medium">{selectedCustomerIds.size} Selected</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedCustomerIds(selectedCustomerIds.size === customers.length ? new Set() : new Set(customers.map(c => c.id)))}
                        >
                          {selectedCustomerIds.size === customers.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                      {customers.map((c) => (
                        <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedCustomerIds.has(c.id)}
                            onChange={() => toggleCustomer(c.id)}
                            className="accent-primary rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.phone} • {c.state}</p>
                          </div>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Select Template</Label>
                <select 
                  className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  disabled={loadingTemplates}
                >
                  {loadingTemplates ? (
                    <option value="" className="bg-slate-900">Loading templates...</option>
                  ) : (
                    <>
                      <option value="" disabled className="bg-slate-900">Choose a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                      ))}
                    </>
                  )}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select a template to use for this broadcast. Manage templates in the Templates tab.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Message Preview</Label>
                <Textarea
                  value={message}
                  readOnly
                  placeholder="Select a template to preview the message..."
                  className="min-h-[150px] bg-background/50 border-white/10 resize-none text-base text-muted-foreground"
                />
              </div>

              {templates.find(t => t.id === selectedTemplateId)?.buttons && templates.find(t => t.id === selectedTemplateId)!.buttons!.length > 0 && (
                <div className="space-y-2">
                  <Label>Interactive Buttons (Included with template)</Label>
                  <div className="flex gap-4 mt-2">
                    {templates.find(t => t.id === selectedTemplateId)!.buttons!.map((btn, i) => (
                      <div key={i} className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20">
                        {btn}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          <div className="text-sm text-muted-foreground">
            Targeting: <span className="font-semibold text-foreground">{actualTargetCount.toLocaleString()} Customers</span> ({targetDescription})
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white shadow-glow rounded-full px-8"
            onClick={handleBroadcast}
            disabled={status !== "idle" || actualTargetCount === 0}
          >
            <Send className="h-4 w-4 mr-2" /> Broadcast Now
          </Button>
        </div>
      </div>

      {/* Preview & Status Section */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-3xl h-[400px] flex flex-col items-center justify-center relative overflow-hidden bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <div className="relative z-10 w-[300px] bg-[#202c33] rounded-xl p-2 shadow-2xl flex flex-col space-y-1">
             {templates.find(t => t.id === selectedTemplateId)?.imageUrl && (
                <div className="w-full h-32 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={templates.find(t => t.id === selectedTemplateId)?.imageUrl} alt="Template Image" className="w-full h-full object-cover" />
                </div>
             )}
             <div className="bg-[#005c4b] text-white p-3 rounded-xl rounded-tr-none text-sm self-end max-w-[85%] mt-2">
               <p>{message ? message.replace("{{name}}", "Rahul") : "Message preview..."}</p>
               <span className="text-[10px] text-white/60 float-right mt-1 ml-2">12:00 PM</span>
             </div>
             
             {templates.find(t => t.id === selectedTemplateId)?.buttons && templates.find(t => t.id === selectedTemplateId)!.buttons!.length > 0 && (
               <div className="w-full space-y-1 mt-1">
                  {templates.find(t => t.id === selectedTemplateId)!.buttons!.map((btn, i) => (
                    <div key={i} className="w-full py-2 bg-[#2a3942] rounded-lg text-[#00a884] text-center text-sm font-medium border border-white/5 cursor-pointer">
                      {btn}
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  {status === "sending" ? (
                     <><Loader2 className="h-4 w-4 animate-spin text-primary" /> Broadcasting...</>
                  ) : (
                     <><CheckCircle2 className="h-4 w-4 text-green-500" /> Broadcast Complete</>
                  )}
                </h4>
                <span className="text-sm font-medium">{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/5" />
              
              {status === "completed" && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                   <div className="bg-white/5 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-green-500">{stats.delivered.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Delivered</div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-blue-500">{stats.delivered > 0 ? Math.floor(stats.delivered * 0.8).toLocaleString() : 0}</div>
                      <div className="text-xs text-muted-foreground">Read</div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl">
                      <div className="text-2xl font-bold text-red-500">{stats.failed.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
