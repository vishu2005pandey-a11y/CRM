"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, UserCircle, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("api");
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || "",
            email: data.email || "",
            profileImage: data.profileImage || "",
          });
        }
      } catch (e) {
        console.error("Failed to fetch profile");
      }
    };
    
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Profile updated successfully!");
        // Update local session to reflect the new name/image immediately without sending base64
        await update({ name: profile.name, profileImage: data.profileImage });
        // Refresh router so layout server component fetches the new session
        window.location.reload();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfile(prev => ({ ...prev, profileImage: "" }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
        }),
      });

      if (res.ok) {
        toast.success("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to change password. Check current password.");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Manage your account settings and API integrations.
        </p>
      </div>

        <div className="flex-1 glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl min-h-[400px]">
          <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div>
                <h3 className="text-xl font-bold">Profile Details</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your personal information and profile picture.
                </p>
              </div>
              <div className="space-y-6 pt-4 border-t border-white/5">
                
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-white/20">
                        <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                      <Label htmlFor="picture-upload" className="cursor-pointer block w-full sm:w-auto">
                        <div className="inline-flex w-full sm:w-auto items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 sm:h-10 px-4 py-2 gap-2">
                          <Upload className="h-4 w-4" />
                          {profile.profileImage ? "Change Picture" : "Upload Picture"}
                        </div>
                      </Label>
                      <Input 
                        id="picture-upload" 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                      {profile.profileImage && (
                        <Button 
                          variant="outline" 
                          onClick={handleRemovePhoto}
                          className="rounded-full h-11 sm:h-10 px-4 text-destructive hover:bg-destructive/10 border-destructive/20 w-full sm:w-auto"
                        >
                          Remove Photo
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 sm:mt-0">Recommended: Square image, max 2MB (JPG/PNG).</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name"
                    className="glass border-white/10" 
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email"
                    className="glass border-white/10"
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    disabled={session?.user?.role === "ADMIN"}
                  />
                  {session?.user?.role === "ADMIN" && (
                    <p className="text-xs text-muted-foreground">Email cannot be changed by administrators.</p>
                  )}
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-glow w-full sm:w-auto h-11 sm:h-10"
                >
                  {savingProfile ? "Updating..." : "Update Profile"}
                </Button>
          </div>
        </div>

        {session?.user?.role === "SUPER_ADMIN" && (
          <div className="flex-1 glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl mt-8">
            <div className="space-y-6 animate-in fade-in zoom-in-95 delay-150 fill-mode-both">
                <div>
                  <h3 className="text-xl font-bold text-red-400">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Change your super admin password securely.
                  </p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-6 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input 
                      type="password"
                      required
                      placeholder="Enter current password"
                      className="glass border-white/10" 
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password"
                      required
                      placeholder="Enter new password"
                      className="glass border-white/10" 
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password"
                      required
                      placeholder="Confirm new password"
                      className="glass border-white/10" 
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={savingPassword}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 shadow-glow w-full sm:w-auto h-11 sm:h-10"
                    >
                      {savingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
