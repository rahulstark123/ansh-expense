"use client";

import { ArrowUpRight } from "lucide-react";

const ANSH_APPS = [
  {
    name: "ANSH Tasks",
    tagline: "Team task & project tracker",
    description: "Assign, track and close tasks across teams",
    href: "https://tasks.anshapps.com",
    image: "/Ansh Task.jpg",
    dotColor: "bg-blue-500",
    status: "LIVE" as const,
  },
  {
    name: "ANSH HR",
    tagline: "Human resource management",
    description: "Employee records, leaves, payroll & more",
    href: "https://hr.anshapps.com",
    image: "/ANSH HR.jpg",
    dotColor: "bg-purple-500",
    status: "LIVE" as const,
  },
  {
    name: "ANSH Expense",
    tagline: "Expense & reimbursement tracking",
    description: "Submit, approve and audit business expenses",
    href: "https://expense.anshapps.com",
    image: "/ANSH Expense.jpg",
    dotColor: "bg-orange-500",
    status: "LIVE" as const,
  },
  {
    name: "ANSH Visitor",
    tagline: "Smart lobby & guest management",
    description: "QR passes, ID verification, check-in logs",
    href: "https://visitor.anshapps.com",
    image: "/ANSH Visitor.jpg",
    dotColor: "bg-cyan-400",
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
}: {
  app: (typeof ANSH_APPS)[number];
  isDark: boolean;
  themeBorder: string;
}) {
  return (
    <a
      href={app.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border sm:w-[300px] lg:w-[320px] ${
        isDark
          ? "border-white/8 bg-[#0A1018]/80 hover:border-violet-500/30"
          : "border-slate-200 bg-white shadow-sm hover:border-violet-300 hover:shadow-md"
      } transition-all duration-300`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={app.image}
          alt={`${app.name} preview`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute right-3 top-3 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-400">
          {app.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${app.dotColor}`} />
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              {app.name}
            </span>
          </div>
          <ArrowUpRight
            className={`h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:opacity-100 ${
              isDark ? "text-cyan-400" : "text-cyan-600"
            }`}
          />
        </div>
        <h3
          className={`text-sm font-extrabold leading-snug ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {app.tagline}
        </h3>
        <p
          className={`text-[11px] leading-relaxed font-semibold ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
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

  return (
    <section
      className={`relative z-10 overflow-hidden border-t py-20 ${themeBorder} ${
        isDark ? "bg-[#060C14]/95" : "bg-slate-50/90"
      }`}
    >
      <div className={`${containerClass} space-y-10`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
              Ecosystem
            </span>
            <h2
              className={`text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              The full{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
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
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 ${
            isDark
              ? "bg-gradient-to-r from-[#060C14] to-transparent"
              : "bg-gradient-to-r from-slate-50 to-transparent"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 ${
            isDark
              ? "bg-gradient-to-l from-[#060C14] to-transparent"
              : "bg-gradient-to-l from-slate-50 to-transparent"
          }`}
        />

        <div className="apps-marquee-track flex w-max gap-5 px-6 sm:px-8">
          {marqueeItems.map((app, index) => (
            <AppCard
              key={`${app.name}-${index}`}
              app={app}
              isDark={isDark}
              themeBorder={themeBorder}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
