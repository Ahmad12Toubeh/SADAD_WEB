"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Visual size of the logo mark */
  size?: "md" | "sm";
};

const sizeClasses = {
  md: { wrap: "p-0 rounded-none", h: 44, w: 44 },
  sm: { wrap: "p-0 rounded-none", h: 32, w: 32 },
} as const;

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const { wrap, h, w } = sizeClasses[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-visible",
        wrap,
        className,
      )}
    >
      <Image
        src="/logo.png?v=1"
        alt="SADAD"
        width={w}
        height={h}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}

type BrandNameProps = {
  className?: string;
  /** sm: sidebar, md: default, lg: landing / auth nav */
  size?: "sm" | "md" | "lg";
};

const brandNameText = {
  sm: "text-base",
  md: "text-lg md:text-xl",
  lg: "text-xl md:text-2xl",
} as const;

/** Wordmark: سداد in Arabic UI, SADAD in English */
export function BrandName({ className, size = "md" }: BrandNameProps) {
  const { i18n } = useTranslation();
  const isAr = (i18n.language ?? "ar").startsWith("ar");

  return (
    <span
      dir={isAr ? "rtl" : "ltr"}
      className={cn(
        "font-bold text-secondary dark:text-white",
        !isAr && "tracking-wide",
        brandNameText[size],
        className,
      )}
    >
      {isAr ? "سداد" : "SADAD"}
    </span>
  );
}
