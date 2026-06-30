"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft, ImagePlus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Template {
  id: string;
  name: string;
  messageBody: string;
  imageUrl?: string;
  buttons?: string[];
  createdAt: string;
}

export function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", messageBody: "", imageUrl: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [buttons, setButtons] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/broadcast-templates");
      const data = await res.json();
      if (data.templates) setTemplates(data.templates);
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Validate buttons
    const validButtons = buttons.filter(b => b.trim() !== "");
    
    try {
      const res = await fetch("/api/broadcast-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, buttons: validButtons }),
      });
      
      if (res.ok) {
        toast.success("Template created successfully");
        setFormData({ name: "", messageBody: "", imageUrl: "" });
        setImageFile(null);
        setButtons([]);
        fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create template");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    setDeletingId(id);
    
    try {
      const res = await fetch(`/api/broadcast-templates?id=${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        toast.success("Template deleted");
        fetchTemplates();
      } else {
        toast.error("Failed to delete template");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const updateButton = (index: number, val: string) => {
    const newButtons = [...buttons];
    newButtons[index] = val;
    setButtons(newButtons);
  };

  const removeButton = (index: number) => {
    const newButtons = buttons.filter((_, i) => i !== index);
    setButtons(newButtons);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/dashboard/broadcasts" className="shrink-0">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Templates</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Create pre-approved templates for Admins to use.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl h-fit">
          <h3 className="text-xl font-semibold mb-4">New Template</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Diwali Special"
                className="bg-background/50 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Promotional Image (Optional)</Label>
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleImageChange}
                />
                {imageFile ? (
                  <div className="text-center text-primary font-medium truncate max-w-[150px]">
                    {imageFile.name}
                  </div>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs text-muted-foreground mt-2 group-hover:text-foreground text-center">Click to upload image</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message Body</Label>
              <Textarea 
                required 
                value={formData.messageBody}
                onChange={e => setFormData({ ...formData, messageBody: e.target.value })}
                placeholder="Hello {{name}}, we have an offer..."
                className="min-h-[150px] bg-background/50 border-white/10 resize-none"
              />
              <p className="text-xs text-muted-foreground">Use {"{{name}}"} for customer name.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Label>Interactive Buttons (Max 3)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs px-2"
                  onClick={() => buttons.length < 3 && setButtons([...buttons, ""])}
                  disabled={buttons.length >= 3}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-2 mt-2">
                {buttons.map((btn, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input 
                      value={btn}
                      onChange={(e) => updateButton(i, e.target.value)}
                      placeholder="e.g. Buy Now"
                      className="bg-background/50 border-white/10 h-8 text-sm"
                      maxLength={20}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                      onClick={() => removeButton(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {buttons.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No buttons added.</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full rounded-full mt-4">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Template
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Existing Templates</h3>
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-3xl text-muted-foreground">
              No templates found. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(t => (
                <div key={t.id} className="glass-card p-5 rounded-2xl flex flex-col space-y-2 relative group transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(t.createdAt), "MMM d, yyyy")}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                    >
                      {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {t.imageUrl && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center my-2">
                      <img src={t.imageUrl} alt="Template visual" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="bg-black/20 p-3 rounded-lg text-sm flex-1">
                    {t.messageBody}
                  </div>

                  {t.buttons && t.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
                      {t.buttons.map((btn, i) => (
                        <div key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium border border-white/5">
                          {btn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
