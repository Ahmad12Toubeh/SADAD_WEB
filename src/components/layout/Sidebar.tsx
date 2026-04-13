"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, Users, PlusCircle, Bell,
  PieChart, UsersRound, Settings, UserCheck, X
} from "lucide-react";
import { BrandLogo, BrandName } from "@/components/layout/BrandLogo";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationConfig = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "customers", href: "/dashboard/customers", icon: Users },
  { key: "debts", href: "/dashboard/debts", icon: CreditCard },
  { key: "addDebt", href: "/dashboard/debts/new", icon: PlusCircle },
  { key: "analytics", href: "/dashboard/analytics", icon: PieChart },
  // { key: "associations", href: "/dashboard/associations", icon: UsersRound },
  { key: "guarantors", href: "/dashboard/guarantors", icon: UserCheck },
  { key: "reminders", href: "/dashboard/reminders", icon: Bell },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    onClose?.();
  }, [pathname]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[84vw] max-w-72 flex-col bg-white text-slate-600 shadow-2xl transition-transform duration-300 dark:bg-slate-950 dark:text-slate-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:min-h-screen lg:shrink-0 lg:border-l lg:border-slate-200 lg:shadow-sm lg:dark:border-white/5 rtl:lg:border-l rtl:lg:border-r-0 ltr:lg:border-r ltr:lg:border-l-0",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between h-20 border-b border-slate-100 px-5 dark:border-white/10 shrink-0 lg:justify-center">
          <Link
            href="/dashboard"
            className="text-secondary dark:text-white flex items-center gap-2"
          >
            <BrandLogo size="sm" className="dark:bg-primary" />
            <BrandName size="sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {navigationConfig.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "hover:bg-slate-50 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white"
                )}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="truncate">{t(`sidebar.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
