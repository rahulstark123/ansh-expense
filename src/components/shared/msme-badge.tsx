"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRUST_COMPLIANCE_SECTION_ID } from "@/components/shared/trust-compliance";

type MsmeBadgeProps = {
  isDark?: boolean;
  compact?: boolean;
  href?: string;
  className?: string;
  /** Use "app" on auth and product pages that rely on system dark mode */
  variant?: "landing" | "app";
};

export function MsmeBadge({
  isDark,
  compact = true,
  href = `/#${TRUST_COMPLIANCE_SECTION_ID}`,
  className,
  variant = "landing",
}: MsmeBadgeProps) {
  const landingStyles =
    isDark === true
      ? "border-white/5 bg-zinc-900/60 text-zinc-400 hover:border-violet-500/20 hover:text-violet-400"
      : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-blue-500/30 hover:text-blue-600";

  const appStyles =
    "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-blue-500/30 hover:text-blue-600 dark:border-white/5 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:border-violet-500/20 dark:hover:text-violet-400";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
        compact ? "text-[10px] font-semibold leading-tight" : "text-[11px] font-semibold leading-snug",
        variant === "landing" ? landingStyles : appStyles,
        className,
      )}
      title="View Trust & Compliance details"
    >
      <BadgeCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
      {compact ? (
        <span className="text-left">
          <span className="block">MSME Registered Enterprise</span>
          <span className="block opacity-80">Government of India Udyam Registered</span>
        </span>
      ) : (
        <span className="text-left">
          <span className="block font-bold">MSME Registered Enterprise</span>
          <span className="block font-medium opacity-80">Government of India Udyam Registered</span>
        </span>
      )}
    </Link>
  );
}
