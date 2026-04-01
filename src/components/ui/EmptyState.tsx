"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
        <span className="text-lg font-bold">!</span>
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <div className="mt-5">
          <Link href={actionHref}>
            <Button className="h-10 px-5">{actionLabel}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
