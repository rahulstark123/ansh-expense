"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SubSidebar } from "./sub-sidebar";
import { MainSidebar } from "./main-sidebar";
import { AppHeader } from "./app-header";
import { GlobalSearchModal } from "./global-search-modal";
import { useGlobalSearchShortcut } from "@/hooks/use-global-search-shortcut";
import { useUiStore } from "@/stores/ui-store";
import { Loader2 } from "lucide-react";

import { useExpenseStore } from "@/stores/expense-store";
import { usePlanStore } from "@/stores/plan-store";
import { PlanUpgradeModal } from "@/components/billing/plan-upgrade-modal";
import { ProCheckoutModal } from "@/components/billing/pro-checkout-modal";
import { TrialBanner } from "@/components/billing/trial-banner";
import { usePlanRouteGuard } from "@/hooks/use-plan-route-guard";

export function AppShell({ children }: { children: React.ReactNode }) {
  useGlobalSearchShortcut();
  usePlanRouteGuard();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSize, setIsMobileSize] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("ansh_auth_token");
  });
  const initialize = useExpenseStore((s) => s.initialize);
  const fetchPlan = usePlanStore((s) => s.fetchPlan);
  const checkoutModalOpen = usePlanStore((s) => s.checkoutModalOpen);
  const checkoutOnSuccess = usePlanStore((s) => s.checkoutOnSuccess);
  const closeCheckoutModal = usePlanStore((s) => s.closeCheckoutModal);
  const employees = useExpenseStore((s) => s.employees);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      const session = sessionStorage.getItem("ansh_auth_session");
      const token = sessionStorage.getItem("ansh_auth_token");

      if (!session || !token) {
        router.push("/login");
        return;
      }

      setCheckingAuth(false);

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          sessionStorage.removeItem("ansh_auth_session");
          sessionStorage.removeItem("ansh_auth_token");
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.onboardingRequired) {
          router.push("/onboarding");
          return;
        }

        await Promise.all([initialize(), fetchPlan()]);
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const handleMobileChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileSize(e.matches);
    };

    handleMobileChange(mobileQuery);
    mobileQuery.addEventListener("change", handleMobileChange);
    return () => mobileQuery.removeEventListener("change", handleMobileChange);
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070809]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Validating secure session...
          </span>
        </div>
      </div>
    );
  }

  if (isMobileSize) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 py-16 text-center dark:bg-slate-950 animate-in fade-in duration-300">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-500/10 dark:bg-indigo-950/30 dark:text-indigo-400">
          <svg className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute -right-1 -top-1 flex h-7 w-7 animate-bounce items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25">
            ★
          </div>
        </div>

        <h2 className="max-w-xs text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Best on Desktop
        </h2>

        <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Ansh Expense is optimised for desktop use. Please open it on a larger screen for the full experience.
        </p>
      </div>
    );
  }

  const isWorkspace = pathname === "/workspace";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <MainSidebar />
      <SubSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TrialBanner />
        <AppHeader />
        <main
          className={
            isWorkspace
              ? "mesh-gradient flex min-h-0 flex-1 flex-col overflow-hidden"
              : "mesh-gradient min-h-0 flex-1 overflow-y-auto overscroll-contain"
          }
        >
          {isWorkspace ? (
            <div className="flex h-full min-h-0 w-full flex-1 flex-col">
              {children}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-7xl p-6 md:p-10 lg:p-12">
              {children}
            </div>
          )}
        </main>
        <GlobalSearchModal />
        <PlanUpgradeModal />
        <ProCheckoutModal
          open={checkoutModalOpen}
          onOpenChange={(open) => !open && closeCheckoutModal()}
          minSeats={Math.max(employees.length, 1)}
          onSuccess={async () => {
            await Promise.all([initialize(), fetchPlan(), checkoutOnSuccess?.()]);
          }}
        />
      </div>
    </div>
  );
}
