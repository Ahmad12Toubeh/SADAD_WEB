"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/Providers";
import { Bell, Search, UserCircle, Moon, Sun, Globe, LogOut } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { getSettingsProfile, getSettingsStore, logout } from "@/lib/api";

export function Header() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [storeName, setStoreName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, store] = await Promise.all([getSettingsProfile(), getSettingsStore()]);
        if (cancelled) return;
        setStoreName((store?.storeName ?? "").trim());
        setUserRole((profile?.role ?? "").trim());
      } catch {
        if (cancelled) return;
        setStoreName("");
        setUserRole("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/dashboard/customers?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = i18n.dir(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem("i18nextLng", newLang);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const formatRole = (role: string) => {
    const normalized = role.toLowerCase();
    if (normalized === "owner" || normalized === "admin") return t("header.role");
    return role;
  };

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 justify-between transition-colors">
      {/* Search */}
      <div className="w-96 relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={t("header.searchPlaceholder")}
          className="pe-10 bg-slate-50 border-transparent focus-visible:bg-white dark:bg-slate-800 dark:focus-visible:bg-slate-700"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* Modern Toggles */}
        <div className="flex items-center gap-2 mr-2 rtl:ml-2 rtl:mr-0">
          <button
            onClick={toggleTheme}
            title={theme === "light" ? t("sidebar.darkMode") : t("sidebar.lightMode")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>

          <button
            onClick={toggleLanguage}
            title={t("sidebar.language")}
            className="h-10 px-4 flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-blue-400 transition-all font-bold text-sm shadow-sm border border-primary/20 dark:border-primary/30"
          >
            <Globe size={18} />
            <span className="uppercase tracking-wider">{i18n.language === "ar" ? "EN" : "AR"}</span>
          </button>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <Bell size={22} />
          <span className="absolute top-1 end-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* Profile & Logout */}
        <div className="flex items-center gap-4 ps-4 border-s border-slate-200 dark:border-slate-700">
          <Link href="/dashboard/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-end hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{storeName || t("header.storeName")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userRole ? formatRole(userRole) : t("header.role")}</p>
            </div>
            <UserCircle size={38} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
          </Link>

          <button
            onClick={handleLogout}
            title={t("sidebar.logout")}
            className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ms-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
