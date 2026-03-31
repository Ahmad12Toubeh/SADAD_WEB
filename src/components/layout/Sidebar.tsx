"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, Users, PlusCircle, Bell, 
  PieChart, UsersRound, Settings, ShieldCheck, UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationConfig = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "customers", href: "/dashboard/customers", icon: Users },
  { key: "addDebt", href: "/dashboard/debts/new", icon: PlusCircle },
  { key: "analytics", href: "/dashboard/analytics", icon: PieChart },
  { key: "associations", href: "/dashboard/associations", icon: UsersRound },
  { key: "guarantors", href: "/dashboard/guarantors", icon: UserCheck },
  { key: "reminders", href: "/dashboard/reminders", icon: Bell },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 min-h-screen shrink-0 border-l border-slate-200 dark:border-white/5 rtl:border-l rtl:border-r-0 ltr:border-r ltr:border-l-0 shadow-sm transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-slate-100 dark:border-white/10 shrink-0">
        <Link href="/" className="text-2xl font-bold text-secondary dark:text-white flex items-center gap-2">
          <div className="bg-primary/10 dark:bg-primary p-1.5 rounded-lg">
            <ShieldCheck size={24} className="text-primary dark:text-white" />
          </div>
          SADAD
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navigationConfig.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "hover:bg-slate-50 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white"
              )}
            >
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
              {t(`sidebar.${item.key}`)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
