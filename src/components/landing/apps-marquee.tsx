"use client";

import { ArrowUpRight } from "lucide-react";
import { brandGradientText, landingAccent, landingSurfaces } from "@/components/landing/brand-theme";

const ANSH_APPS = [
  {
    name: "ANSH Tasks",
    tagline: "Team task & project tracker",
    description: "Assign, track and close tasks across teams",
    href: "https://tasks.anshapps.com",
    image: "/Ansh Task.jpg",
    dotColor: "bg-[#0078FF]",
    status: "LIVE" as const,
  },
  {
    name: "ANSH HR",
    tagline: "Human resource management",
    description: "Employee records, leaves, payroll & more",
    href: "https://hr.anshapps.com",
    image: "/ANSH HR.jpg",
    dotColor: "bg-[#7000FF]",
    status: "LIVE" as const,
  },
  {
    name: "ANSH Expense",
    tagline: "Expense & reimbursement tracking",
    description: "Submit, approve and audit business expenses",
    href: "https://expense.anshapps.com",
    image: "/ANSH Expense.jpg",
    dotColor: "bg-[#9333EA]",
    status: "LIVE" as const,
  },
  {
    name: "ANSH Visitor",
    tagline: "Smart lobby & guest management",
    description: "QR passes, ID verification, check-in logs",
    href: "https://visitor.anshapps.com",
    image: "/ANSH Visitor.jpg",
    dotColor: "bg-[#00C6FF]",
    status: "LIVE" as const,
  },
];

type AppsMarqueeProps = {
  isDark: boolean;
  containerClass: string;
  themeBorder: string;
  themeTextMuted: string;
};

function AppCard({
  app,
  isDark,
  themeBorder,
  accent,
}: {
  app: (typeof ANSH_APPS)[number];
  isDark: boolean;
  themeBorder: string;
  accent: ReturnType<typeof landingAccent>;
}) {
  return (
    <a
      href={app.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border sm:w-[300px] lg:w-[320px] ${
        isDark
          ? "border-white/8 bg-zinc-900/80 hover:border-violet-500/30"
          : "border-zinc-200 bg-white shadow-sm hover:border-blue-500/30 hover:shadow-md"
      } transition-all duration-300`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={app.image}
          alt={`${app.name} preview`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute right-3 top-3 rounded-md ${accent.liveBadge} px-2 py-0.5 text-[9px] font-black uppercase tracking-wider`}>
          {app.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${app.dotColor}`} />
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              {app.name}
            </span>
          </div>
          <ArrowUpRight
            className={`h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:opacity-100 ${accent.text}`}
          />
        </div>
        <h3
          className={`text-sm font-extrabold leading-snug ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {app.tagline}
        </h3>
        <p className="text-[11px] leading-relaxed font-semibold text-zinc-500">
          {app.description}
        </p>
      </div>

      <div className={`h-px ${themeBorder}`} />
    </a>
  );
}

export function AppsMarquee({
  isDark,
  containerClass,
  themeBorder,
  themeTextMuted,
}: AppsMarqueeProps) {
  const marqueeItems = [...ANSH_APPS, ...ANSH_APPS];
  const s = landingSurfaces(isDark);
  const accent = landingAccent(isDark);

  return (
    <section
      className={`relative z-10 overflow-hidden border-t py-20 ${themeBorder} ${s.marqueeBg}`}
    >
      <div className={`${containerClass} space-y-10`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className={`inline-block text-[10px] font-black uppercase tracking-[0.2em] ${accent.text}`}>
              Ecosystem
            </span>
            <h2
              className={`text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              The full{" "}
              <span className={brandGradientText(isDark)}>
                Ansh Apps
              </span>{" "}
              suite
            </h2>
          </div>
          <p
            className={`max-w-sm text-xs leading-relaxed font-semibold sm:text-sm ${themeTextMuted}`}
          >
            One ecosystem, every business operation — manage tasks, HR, expenses,
            bookings and visitors from connected apps.
          </p>
        </div>
      </div>

      <div className="relative mt-10">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r ${s.marqueeFade} to-transparent`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l ${s.marqueeFade} to-transparent`}
        />

        <div className="apps-marquee-track flex w-max gap-5 px-6 sm:px-8">
          {marqueeItems.map((app, index) => (
            <AppCard
              key={`${app.name}-${index}`}
              app={app}
              isDark={isDark}
              themeBorder={themeBorder}
              accent={accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
