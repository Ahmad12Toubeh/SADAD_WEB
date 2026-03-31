"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, User, Store, Bell, Shield, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  changePassword,
  getSettingsNotifications,
  getSettingsProfile,
  getSettingsStore,
  patchSettingsNotifications,
  patchSettingsProfile,
  patchSettingsStore,
} from "@/lib/api";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState<any>({ fullName: "", phone: "", email: "" });
  const [store, setStore] = useState<any>({ storeName: "", businessType: "", address: "", cr: "", currency: "SAR" });
  const [notifications, setNotifications] = useState<any>({
    remindOnDelay: true,
    remindBeforeDue: true,
    weeklySummary: false,
    whatsappEnabled: true,
    customWhatsappNumber: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [p, s, n] = await Promise.all([
          getSettingsProfile(),
          getSettingsStore(),
          getSettingsNotifications(),
        ]);
        if (cancelled) return;
        setProfile(p ?? {});
        setStore(s ?? {});
        setNotifications({
          ...n,
          customWhatsappNumber: n?.customWhatsappNumber ?? "",
        });
      } catch (err: any) {
        const key = err?.messageKey as string | undefined;
        if (!cancelled) setError(key ? t(key) : err?.message ?? "Failed to load settings");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleSave = () => {
    // will be handled per-tab
  };

  const tabs = [
    { id: "profile", label: t("settings.tabs.profile"), icon: User },
    { id: "store", label: t("settings.tabs.store"), icon: Store },
    { id: "notifications", label: t("settings.tabs.notifications"), icon: Bell },
    { id: "security", label: t("settings.tabs.security"), icon: Shield },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t("settings.title")}</h1>
        <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">{t("settings.subtitle")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-56 shrink-0">
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 rounded-2xl p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-md shadow-primary/25 dark:shadow-primary/10"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {activeTab !== tab.id && (
                    i18n.dir() === "rtl" ? <ChevronLeft size={14} className="mr-auto text-slate-400 dark:text-slate-500" /> : <ChevronRight size={14} className="ml-auto text-slate-400 dark:text-slate-500" />
                  )}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="border-0 shadow-lg shadow-slate-200/50 dark:shadow-none dark:bg-slate-800 rounded-2xl">
            <CardContent className="p-8 space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </div>
              )}

              {activeTab === "profile" && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <User size={20} className="text-primary" /> {t("settings.profile.title")}
                    </CardTitle>
                  </CardHeader>
                  <div className="flex items-center gap-5 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-2xl">م</div>
                    <div className="text-start">
                      <p className="font-bold text-slate-900 dark:text-white">{profile?.fullName ?? t("settings.profile.name")}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t("settings.profile.role")}</p>
                      <button className="text-xs text-primary font-medium mt-1 hover:underline">{t("settings.profile.changePic")}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.profile.firstName")}</Label>
                      <Input
                        value={(profile?.fullName ?? "").split(" ")[0] ?? ""}
                        onChange={(e) => setProfile((p: any) => ({ ...p, fullName: `${e.target.value} ${(p?.fullName ?? "").split(" ").slice(1).join(" ")}`.trim() }))}
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.profile.lastName")}</Label>
                      <Input
                        value={(profile?.fullName ?? "").split(" ").slice(1).join(" ")}
                        onChange={(e) => setProfile((p: any) => ({ ...p, fullName: `${(p?.fullName ?? "").split(" ")[0] ?? ""} ${e.target.value}`.trim() }))}
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="dark:text-slate-300">{t("settings.profile.email")}</Label>
                      <Input value={profile?.email ?? ""} disabled dir="ltr" className="dark:bg-slate-900 dark:border-slate-700 text-start" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="dark:text-slate-300">{t("settings.profile.phone")}</Label>
                      <Input
                        value={profile?.phone ?? ""}
                        onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
                        dir="ltr"
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "store" && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Store size={20} className="text-primary" /> {t("settings.store.title")}
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.store.storeName")}</Label>
                      <Input
                        value={store?.storeName ?? ""}
                        onChange={(e) => setStore((s: any) => ({ ...s, storeName: e.target.value }))}
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.store.businessType")}</Label>
                      <select
                        value={store?.businessType ?? ""}
                        onChange={(e) => setStore((s: any) => ({ ...s, businessType: e.target.value }))}
                        className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-start"
                      >
                        <option value="food">{t("settings.store.types.food")}</option>
                        <option value="building">{t("settings.store.types.building")}</option>
                        <option value="electronics">{t("settings.store.types.electronics")}</option>
                        <option value="other">{t("settings.store.types.other")}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.store.address")}</Label>
                      <Input
                        value={store?.address ?? ""}
                        onChange={(e) => setStore((s: any) => ({ ...s, address: e.target.value }))}
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.store.cr")}</Label>
                      <Input
                        value={store?.cr ?? ""}
                        onChange={(e) => setStore((s: any) => ({ ...s, cr: e.target.value }))}
                        placeholder="1010XXXXXX"
                        dir="ltr"
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.store.currency")}</Label>
                      <select
                        value={store?.currency ?? "SAR"}
                        onChange={(e) => setStore((s: any) => ({ ...s, currency: e.target.value }))}
                        className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-start"
                      >
                        <option value="SAR">ريال سعودي (ر.س)</option>
                        <option value="USD">دولار أمريكي ($)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "notifications" && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell size={20} className="text-primary" /> {t("settings.notifications.title")}
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                    {[
                      { key: "remindOnDelay", label: t("settings.notifications.items.delay"), desc: t("settings.notifications.items.delayDesc") },
                      { key: "remindBeforeDue", label: t("settings.notifications.items.before"), desc: t("settings.notifications.items.beforeDesc") },
                      { key: "weeklySummary", label: t("settings.notifications.items.weekly"), desc: t("settings.notifications.items.weeklyDesc") },
                      { key: "whatsappEnabled", label: t("settings.notifications.items.wa"), desc: t("settings.notifications.items.waDesc") },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700/50 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="text-start">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mx-4">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={Boolean((notifications as any)?.[item.key])}
                            onChange={(e) => setNotifications((n: any) => ({ ...n, [item.key]: e.target.checked }))}
                          />
                          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                        </label>
                      </div>
                    ))}
                    <div className="space-y-2 pt-2">
                      <Label className="flex items-center gap-2 dark:text-slate-300"><Smartphone size={16} /> {t("settings.notifications.customWa")}</Label>
                      <Input
                        placeholder={t("settings.notifications.waPlaceholder")}
                        dir="ltr"
                        value={notifications?.customWhatsappNumber ?? ""}
                        onChange={(e) => setNotifications((n: any) => ({ ...n, customWhatsappNumber: e.target.value }))}
                        className="dark:bg-slate-900 dark:border-slate-700 text-start"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "security" && (
                <>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield size={20} className="text-primary" /> {t("settings.security.title")}
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.security.currentPass")}</Label>
                      <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="dark:bg-slate-900 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.security.newPass")}</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="dark:bg-slate-900 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">{t("settings.security.confirmPass")}</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="dark:bg-slate-900 dark:border-slate-700" />
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 text-start">
                      {t("settings.security.hint")}
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-start pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <Button
                  onClick={async () => {
                    setError(null);
                    try {
                      if (activeTab === "profile") await patchSettingsProfile({ fullName: profile.fullName, phone: profile.phone });
                      if (activeTab === "store") await patchSettingsStore(store);
                      if (activeTab === "notifications") await patchSettingsNotifications(notifications);
                      if (activeTab === "security") {
                        if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
                        await changePassword({ currentPassword, newPassword });
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    } catch (err: any) {
                      const key = err?.messageKey as string | undefined;
                      setError(key ? t(key) : err?.message ?? "Save failed");
                    }
                  }}
                  className="gap-2 px-8"
                  disabled={saved || isLoading}
                >
                  <Save size={18} />
                  {saved ? t("settings.savedBtn") : t("settings.saveBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
