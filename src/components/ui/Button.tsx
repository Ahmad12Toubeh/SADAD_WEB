import React, { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  /**
   * Render the button styles onto the child element (e.g. Next.js <Link />),
   * avoiding invalid interactive nesting like <a><button/></a>.
   */
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "min-h-10 px-3 text-sm",
    md: "min-h-11 px-4 py-2 text-sm sm:text-base",
    lg: "min-h-12 px-6 text-base sm:px-8 sm:text-lg",
  };

  const mergedClassName = cn(baseStyles, variants[variant], sizes[size], className);

  if (asChild) {
    const { children, ...rest } = props;
    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;

    // Avoid passing <button>-specific props like `type` onto anchors/links.
    const { type: _ignoredType, ...safeRest } = rest as Omit<typeof rest, "type"> & { type?: unknown };
    void _ignoredType;

    return React.cloneElement(child, {
      ...(safeRest as unknown as React.HTMLAttributes<HTMLElement>),
      className: cn(mergedClassName, child.props.className),
    });
  }

  return (
    <button
      className={mergedClassName}
      {...props}
    />
  );
}
