"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/Providers";
import { Search, Moon, Sun, Globe, LogOut, Menu } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { getSettingsProfile, getSettingsStore, logout } from "@/lib/api";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";

type HeaderProps = {
  onMenuClick?: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [storeName, setStoreName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadHeaderProfile = async () => {
      try {
        const [profile, store] = await Promise.all([getSettingsProfile(), getSettingsStore()]);
        if (cancelled) return;
        setStoreName((store?.storeName ?? "").trim());
        setUserRole((profile?.role ?? "").trim());
        setUserFullName((profile?.fullName ?? "").trim());
        setAvatarUrl((profile?.avatarUrl ?? "").trim());
      } catch {
        if (cancelled) return;
        setStoreName("");
        setUserRole("");
        setUserFullName("");
        setAvatarUrl("");
      }
    };

    loadHeaderProfile();

    const handleProfileRefresh = () => {
      void loadHeaderProfile();
    };

    window.addEventListener("sadad-profile-updated", handleProfileRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("sadad-profile-updated", handleProfileRefresh);
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

  const userInitial = (userFullName || storeName || "S").trim().charAt(0).toUpperCase();

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-3 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative min-w-0 flex-1 lg:w-96 lg:flex-none">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t("header.searchPlaceholder")}
              className="pe-10 bg-slate-50 border-transparent focus-visible:bg-white dark:bg-slate-800 dark:focus-visible:bg-slate-700"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4 md:gap-5">
        {/* Modern Toggles */}
        <div className="flex items-center gap-2 rtl:ml-2 rtl:mr-0">
          <button
            onClick={toggleTheme}
            title={theme === "light" ? t("sidebar.darkMode") : t("sidebar.lightMode")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 shadow-sm transition-all hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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

        <HeaderNotifications />

        {/* Profile & Logout */}
        <div className="flex min-w-0 items-center gap-3 border-s border-slate-200 ps-3 dark:border-slate-700 sm:gap-4 sm:ps-4">
          <Link href="/dashboard/settings" className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="min-w-0 text-end hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{storeName || t("header.storeName")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{userRole ? formatRole(userRole) : t("header.role")}</p>
            </div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary font-bold">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={userFullName || "Avatar"} fill className="object-cover" unoptimized />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title={t("sidebar.logout")}
            className="ms-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 sm:ms-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      </div>
    </header>
  );
}
