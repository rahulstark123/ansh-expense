"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GatedNavLink } from "@/components/billing/gated-nav-link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft, HelpCircle, LayoutGrid, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ecosystemApps = [
  {
    name: "ANSH Booking",
    desc: "Meeting room & resource booking",
    url: "https://booking.anshapps.com",
    dotColor: "bg-rose-500",
    status: "SOON",
  },
  {
    name: "ANSH Visitor",
    desc: "Smart lobby & guest management",
    url: "https://visitor.anshapps.com",
    dotColor: "bg-violet-500",
    status: "LIVE",
  },
  {
    name: "ANSH Tasks",
    desc: "Team task & project tracker",
    url: "https://tasks.anshapps.com",
    dotColor: "bg-sky-500",
    status: "LIVE",
  },
  {
    name: "ANSH HR",
    desc: "Human resource management",
    url: "https://hr.anshapps.com",
    dotColor: "bg-violet-500",
    status: "LIVE",
  },
  {
    name: "ANSH Expense",
    desc: "Expense & reimbursement tracking",
    url: "https://expense.anshapps.com",
    dotColor: "bg-amber-500",
    status: "HERE",
  },
  {
    name: "ANSH Forms",
    desc: "Smart form builder",
    url: "https://forms.anshapps.com",
    dotColor: "bg-emerald-500",
    status: "LIVE",
  },
  {
    name: "ANSH Links",
    desc: "Link-in-bio profile builder",
    url: "https://links.anshapps.com",
    dotColor: "bg-pink-500",
    status: "LIVE",
  },
];
import { mainNav, getSectionFromPath } from "@/config/navigation";
import { useUiStore } from "@/stores/ui-store";
import { useExpenseStore } from "@/stores/expense-store";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

export function MainSidebar() {
  const pathname = usePathname();
  const activeSection = getSectionFromPath(pathname);
  const isHelpActive = pathname === "/help" || pathname.startsWith("/help/");
  const { mainSidebarCollapsed, setMainSidebarCollapsed, toggleMainSidebar } = useUiStore();
  const { currentUser } = useExpenseStore();

  const [appsOpen, setAppsOpen] = useState(false);

  useEffect(() => {
    if (!appsOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".ansh-apps-container")) {
        setAppsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [appsOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1499px)");

    const handleScreenSizeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        setMainSidebarCollapsed(true);
      } else {
        setMainSidebarCollapsed(false);
      }
    };

    handleScreenSizeChange(mediaQuery);

    mediaQuery.addEventListener("change", handleScreenSizeChange);
    return () => mediaQuery.removeEventListener("change", handleScreenSizeChange);
  }, [setMainSidebarCollapsed]);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-out shadow-sm",
        mainSidebarCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border/50">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <img src="/logoAnshapps.png" alt="Ansh Expense" className="h-10.5 w-10.5 object-contain" />
        </div>
        {!mainSidebarCollapsed && (
          <div className="min-w-0 animate-in fade-in duration-300">
            <p className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
              Ansh Expense
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {mainNav.map((item) => {
          if (item.id === "company-expenses") {
            const role = currentUser?.role?.toLowerCase() || "";
            const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(role);
            if (!isAuthorized) return null;
          }

          const isActive = activeSection === item.id;
          const Icon = item.icon;
          const linkClassName = cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          );
          const linkTitle = mainSidebarCollapsed ? item.label : undefined;
          const linkContent = (
            <>
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                )}
                aria-hidden
              />
              {!mainSidebarCollapsed && <span>{item.label}</span>}
            </>
          );

          if (item.id === "reports") {
            return (
              <GatedNavLink
                key={item.id}
                href={item.href}
                featureId="advanced-reports"
                className={linkClassName}
                title={linkTitle}
              >
                {linkContent}
              </GatedNavLink>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={linkClassName}
              title={linkTitle}
            >
              {linkContent}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/50 p-3">
        {/* ANSH Apps Dropdown */}
        <div className="ansh-apps-container relative w-full">
          <button
            type="button"
            onClick={() => setAppsOpen(!appsOpen)}
            className={cn(
              "group inline-flex h-10 w-full items-center justify-start gap-3 rounded-xl px-3 transition-all outline-none cursor-pointer",
              appsOpen
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
              mainSidebarCollapsed && "justify-center px-0"
            )}
          >
            <LayoutGrid className={cn("h-5 w-5 shrink-0", appsOpen ? "text-primary" : "text-slate-500")} />
            {!mainSidebarCollapsed && (
              <>
                <span className="text-xs font-bold uppercase tracking-widest text-left flex-1">Ansh Apps</span>
                {appsOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </>
            )}
          </button>

          {appsOpen && (
            <div
              className={cn(
                "absolute z-[100] w-[310px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-slate-900 dark:text-white select-none animate-in fade-in slide-in-from-bottom-2 duration-200",
                mainSidebarCollapsed
                  ? "bottom-0 left-full ml-3"
                  : "bottom-full left-0 mb-2"
              )}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">
                  ANSH Ecosystem
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Jump to your other ANSH apps
                </p>
              </div>
              
              <div className="my-3 border-t border-slate-100 dark:border-zinc-800/85" />

              <div className="space-y-1 max-h-[320px] overflow-y-auto pr-0.5 scrollbar-thin">
                {ecosystemApps.map((app) => {
                  const isHere = app.status === "HERE";
                  const isSoon = app.status === "SOON";
                  
                  const itemContent = (
                    <div className="flex items-center gap-3">
                      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", app.dotColor)} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black tracking-wide truncate">
                            {app.name}
                          </span>
                          {!isSoon && !isHere && (
                            <svg className="h-3 w-3 text-slate-400 group-hover/item:text-slate-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 truncate font-semibold leading-relaxed mt-0.5">
                          {app.desc}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider",
                          isHere
                            ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/25"
                            : isSoon
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        )}
                      >
                        {app.status}
                      </span>
                    </div>
                  );

                  if (isSoon) {
                    return (
                      <div
                        key={app.name}
                        className="w-full p-2.5 rounded-xl border border-transparent opacity-65 cursor-not-allowed"
                      >
                        {itemContent}
                      </div>
                    );
                  }

                  return (
                    <a
                      key={app.name}
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group/item block w-full p-2.5 rounded-xl border border-transparent transition-all",
                        isHere
                          ? "bg-emerald-50/70 border-emerald-100 text-slate-900 dark:bg-emerald-950/20 dark:border-emerald-900/30"
                          : "hover:bg-slate-50 hover:border-slate-100 dark:hover:bg-slate-900/40 dark:hover:border-zinc-800/50"
                      )}
                    >
                      {itemContent}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/help"
          className={cn(
            "group inline-flex h-10 w-full items-center justify-start gap-3 rounded-xl px-3 transition-all outline-none",
            isHelpActive
              ? "bg-primary/10 text-primary"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
            mainSidebarCollapsed && "justify-center px-0"
          )}
        >
          <HelpCircle className={cn("h-5 w-5 shrink-0", isHelpActive ? "text-primary" : "text-slate-500")} />
          {!mainSidebarCollapsed && (
            <span className="text-xs font-bold uppercase tracking-widest">Help Center</span>
          )}
        </Link>
        <ThemeSwitcher collapsed={mainSidebarCollapsed} />
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-full justify-start gap-3 rounded-xl px-3 text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          onClick={toggleMainSidebar}
        >
          {mainSidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Collapse Nav
              </span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
