// ─────────────────────────────────────────────────────────────────────────────
// All app translations  (EN / TR)
// ─────────────────────────────────────────────────────────────────────────────

export type Language = "en" | "tr";

// Derive the structural shape from the English object — values are widened to string
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, string> ? Record<keyof T[K], string> : string;
};
export const translations = {
  en: {
    // ── Login ──────────────────────────────────────────────────────────────
    login: {
      welcome: "Welcome Back",
      subtitle: "Enter your credentials to access the CRM",
      superAdmin: "Super Admin",
      admin: "Admin",
      email: "Email",
      emailPlaceholder: "user@example.com",
      password: "Password",
      signIn: "Sign In",
      suspended: "Your account has been suspended by the Super Admin.",
      activated: "Your account has been activated! Please log in.",
      invalidCreds: "Invalid email or password",
      unexpectedError: "An unexpected error occurred",
    },

    // ── Sidebar ────────────────────────────────────────────────────────────
    nav: {
      dashboard: "Dashboard",
      admins: "Admins",
      customers: "Customers",
      broadcasts: "Broadcasts",
      adminBroadcasts: "Admin Broadcasts",
      settings: "Settings",
      logout: "Logout",
      adminPanel: "Admin Panel",
      crmPro: "CRM Pro",
    },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
      searchPlaceholder: "Global search...",
      myAccount: "My Account",
      profile: "Profile",
      settings: "Settings",
      logOut: "Log out",
    },

    // ── Dashboard page ─────────────────────────────────────────────────────
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back, {name}. Here's what's happening.",
      totalAdmins: "Total Admins",
      totalCustomers: "Total Customers",
      totalBroadcasts: "Total Broadcasts",
      pendingOrders: "Pending Orders",
      activeAdmins: "Active admins",
      importedLeads: "Imported leads",
      campaignsSent: "Campaigns sent",
      requiresAttention: "Requires attention",
      broadcastOverview: "Broadcast Overview (This Year)",
      recentActivity: "Recent Activity",
    },

    // ── Customers page ─────────────────────────────────────────────────────
    customers: {
      title: "Customers",
      subtitle: "Manage your leads and their statuses.",
      addCustomer: "Add Customer",
      filter: "Filter",
      export: "Export",
    },

    // ── Admins page ────────────────────────────────────────────────────────
    admins: {
      title: "Admins",
      subtitle: "Manage your administrators and their assigned states.",
      uploadCsv: "Upload CSV",
      addAdmin: "Add Admin",
    },

    // ── Broadcasts page ────────────────────────────────────────────────────
    broadcasts: {
      title: "WhatsApp Broadcast",
      subtitle: "Send bulk messages to your targeted customer segments.",
      manageTemplates: "Manage Templates",
      history: "History",
    },

    // ── Admin Broadcasts page ──────────────────────────────────────────────
    adminBroadcasts: {
      title: "Admin Broadcasts",
      subtitle: "Monitor WhatsApp broadcasts sent by Admins.",
    },

    // ── Settings page ──────────────────────────────────────────────────────
    settings: {
      title: "Settings",
      subtitle: "Manage your account settings and API integrations.",
      profileDetails: "Profile Details",
      profileDetailsSubtitle: "Update your personal information and profile picture.",
      profilePicture: "Profile Picture",
      changePicture: "Change Picture",
      uploadPicture: "Upload Picture",
      removePhoto: "Remove Photo",
      pictureHint: "Recommended: Square image, max 2MB (JPG/PNG).",
      fullName: "Full Name",
      namePlaceholder: "Enter your name",
      emailAddress: "Email Address",
      emailPlaceholder: "Enter your email",
      emailAdminNote: "Email cannot be changed by administrators.",
      updateProfile: "Update Profile",
      updating: "Updating...",
      securitySettings: "Security Settings",
      securitySubtitle: "Change your super admin password securely.",
      currentPassword: "Current Password",
      currentPasswordPlaceholder: "Enter current password",
      newPassword: "New Password",
      newPasswordPlaceholder: "Enter new password",
      confirmNewPassword: "Confirm New Password",
      confirmPasswordPlaceholder: "Confirm new password",
      changePassword: "Change Password",
      changing: "Changing...",
    },

    // ── Upload page ────────────────────────────────────────────────────────
    upload: {
      title: "Upload CSV",
      subtitle: "Import customer data from a CSV file.",
    },

    // ── Orders page ────────────────────────────────────────────────────────
    orders: {
      title: "Orders",
      subtitle: "Manage and track customer orders.",
    },
  },

  tr: {
    // ── Login ──────────────────────────────────────────────────────────────
    login: {
      welcome: "Tekrar Hoşgeldiniz",
      subtitle: "CRM'e erişmek için kimlik bilgilerinizi girin",
      superAdmin: "Süper Admin",
      admin: "Yönetici",
      email: "E-posta",
      emailPlaceholder: "kullanici@ornek.com",
      password: "Şifre",
      signIn: "Giriş Yap",
      suspended: "Hesabınız Süper Admin tarafından askıya alınmıştır.",
      activated: "Hesabınız etkinleştirildi! Lütfen giriş yapın.",
      invalidCreds: "Geçersiz e-posta veya şifre",
      unexpectedError: "Beklenmeyen bir hata oluştu",
    },

    // ── Sidebar ────────────────────────────────────────────────────────────
    nav: {
      dashboard: "Panel",
      admins: "Yöneticiler",
      customers: "Müşteriler",
      broadcasts: "Yayınlar",
      adminBroadcasts: "Admin Yayınları",
      settings: "Ayarlar",
      logout: "Çıkış Yap",
      adminPanel: "Yönetici Paneli",
      crmPro: "CRM Pro",
    },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
      searchPlaceholder: "Genel arama...",
      myAccount: "Hesabım",
      profile: "Profil",
      settings: "Ayarlar",
      logOut: "Çıkış Yap",
    },

    // ── Dashboard page ─────────────────────────────────────────────────────
    dashboard: {
      title: "Panel",
      welcome: "Tekrar hoşgeldiniz, {name}. İşte son durumlar.",
      totalAdmins: "Toplam Yönetici",
      totalCustomers: "Toplam Müşteri",
      totalBroadcasts: "Toplam Yayın",
      pendingOrders: "Bekleyen Siparişler",
      activeAdmins: "Aktif yöneticiler",
      importedLeads: "İçe aktarılan kayıtlar",
      campaignsSent: "Gönderilen kampanyalar",
      requiresAttention: "Dikkat gerekiyor",
      broadcastOverview: "Yayın Genel Bakışı (Bu Yıl)",
      recentActivity: "Son Aktiviteler",
    },

    // ── Customers page ─────────────────────────────────────────────────────
    customers: {
      title: "Müşteriler",
      subtitle: "Kayıtlarınızı ve durumlarını yönetin.",
      addCustomer: "Müşteri Ekle",
      filter: "Filtrele",
      export: "Dışa Aktar",
    },

    // ── Admins page ────────────────────────────────────────────────────────
    admins: {
      title: "Yöneticiler",
      subtitle: "Yöneticilerinizi ve atanan durumlarını yönetin.",
      uploadCsv: "CSV Yükle",
      addAdmin: "Yönetici Ekle",
    },

    // ── Broadcasts page ────────────────────────────────────────────────────
    broadcasts: {
      title: "WhatsApp Yayını",
      subtitle: "Hedeflenen müşteri segmentlerinize toplu mesaj gönderin.",
      manageTemplates: "Şablonları Yönet",
      history: "Geçmiş",
    },

    // ── Admin Broadcasts page ──────────────────────────────────────────────
    adminBroadcasts: {
      title: "Admin Yayınları",
      subtitle: "Adminler tarafından gönderilen WhatsApp yayınlarını izleyin.",
    },

    // ── Settings page ──────────────────────────────────────────────────────
    settings: {
      title: "Ayarlar",
      subtitle: "Hesap ayarlarınızı ve API entegrasyonlarınızı yönetin.",
      profileDetails: "Profil Bilgileri",
      profileDetailsSubtitle: "Kişisel bilgilerinizi ve profil fotoğrafınızı güncelleyin.",
      profilePicture: "Profil Fotoğrafı",
      changePicture: "Fotoğrafı Değiştir",
      uploadPicture: "Fotoğraf Yükle",
      removePhoto: "Fotoğrafı Kaldır",
      pictureHint: "Önerilen: Kare görüntü, maks 2 MB (JPG/PNG).",
      fullName: "Tam Ad",
      namePlaceholder: "Adınızı girin",
      emailAddress: "E-posta Adresi",
      emailPlaceholder: "E-postanızı girin",
      emailAdminNote: "E-posta adresi yöneticiler tarafından değiştirilemez.",
      updateProfile: "Profili Güncelle",
      updating: "Güncelleniyor...",
      securitySettings: "Güvenlik Ayarları",
      securitySubtitle: "Süper admin şifrenizi güvenli şekilde değiştirin.",
      currentPassword: "Mevcut Şifre",
      currentPasswordPlaceholder: "Mevcut şifreyi girin",
      newPassword: "Yeni Şifre",
      newPasswordPlaceholder: "Yeni şifreyi girin",
      confirmNewPassword: "Yeni Şifreyi Onayla",
      confirmPasswordPlaceholder: "Yeni şifreyi onaylayın",
      changePassword: "Şifreyi Değiştir",
      changing: "Değiştiriliyor...",
    },

    // ── Upload page ────────────────────────────────────────────────────────
    upload: {
      title: "CSV Yükle",
      subtitle: "Bir CSV dosyasından müşteri verilerini içe aktarın.",
    },

    // ── Orders page ────────────────────────────────────────────────────────
    orders: {
      title: "Siparişler",
      subtitle: "Müşteri siparişlerini yönetin ve takip edin.",
    },
  },
} as const;

export type Translations = DeepStringify<typeof translations.en>;
