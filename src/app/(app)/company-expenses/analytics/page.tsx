"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Activity,
} from "lucide-react";

// Dynamic import of Recharts component with SSR disabled
const CompanyCharts = dynamic(() => import("@/components/analytics/company-charts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 animate-pulse text-left">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* RUNWAY TREND AREA CHART SKELETON */}
        <div className="lg:col-span-2 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70">
          <div className="mb-6 space-y-2">
            <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-80 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-[220px] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex-1 flex items-end gap-6 pt-4 px-2">
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "45%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "75%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "30%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "60%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "90%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "50%" }} />
            </div>
            <div className="h-4 w-full border-t border-border/40 mt-4 pt-2 flex justify-between">
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* DONUT CATEGORY MIX CHART SKELETON */}
        <div className="lg:col-span-1 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-[200px] flex items-center justify-center">
            <div className="h-28 w-28 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* PAYMENT CHANNELS BAR CHART SKELETON */}
        <div className="lg:col-span-1 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70">
          <div className="space-y-2">
            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-60 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-[180px] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-6 flex flex-col justify-between mt-4">
            <div className="flex-1 flex items-end gap-6 pt-4 px-2">
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "30%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "65%" }} />
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "85%" }} />
            </div>
            <div className="h-4 w-full border-t border-border/40 mt-4 pt-2 flex justify-between">
              <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        </div>

        {/* AUDITING INSIGHTS SUMMARY CARD SKELETON */}
        <div className="lg:col-span-2 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

interface CompanyExpenseEntry {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl: string | null;
  vendor: string | null;
  notes: string | null;
  wid: number;
  loggedById: string;
  createdAt: string;
}

const convertToWorkspaceCurrency = (amount: number, fromCurrency: string, targetCurrency: string) => {
  if (fromCurrency === targetCurrency) return amount;
  const usdRates: Record<string, number> = {
    USD: 1.0,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.51,
    CAD: 1.37,
    SGD: 1.35,
    AED: 3.67,
    JPY: 156.8,
  };
  
  const fromInUsd = amount / (usdRates[fromCurrency] || 1.0);
  const result = fromInUsd * (usdRates[targetCurrency] || 1.0);
  return Number(result.toFixed(2));
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(0)}`;
  }
};

export default function CompanyExpensesAnalyticsPage() {
  const { currentUser, initialize } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<CompanyExpenseEntry[]>([]);
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");

  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  const fetchExpenses = async () => {
    if (!isAuthorized) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (e) {
      console.error("Failed to load expenses:", e);
    }
  };

  const loadSettings = async () => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.workspaceSettings) {
          setWorkspaceCurrency(data.settings.workspaceSettings.currency || "USD");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await initialize();
      await Promise.all([loadSettings(), fetchExpenses()]);
      setLoading(false);
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* PageHeader Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-3.5 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* KPI Summaries Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-75">
              <CardContent className="p-4 space-y-3">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Container Skeleton */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* RUNWAY TREND AREA CHART SKELETON */}
          <div className="lg:col-span-2 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70">
            <div className="mb-6 space-y-2">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-80 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-[220px] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex-1 flex items-end gap-6 pt-4 px-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "45%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "75%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "30%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "60%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "90%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "50%" }} />
              </div>
              <div className="h-4 w-full border-t border-border/40 mt-4 pt-2 flex justify-between">
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>

          {/* DONUT CATEGORY MIX CHART SKELETON */}
          <div className="lg:col-span-1 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-8 border-slate-200 dark:border-slate-800 flex items-center justify-center" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* PAYMENT CHANNELS BAR CHART SKELETON */}
          <div className="lg:col-span-1 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-60 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-[180px] bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-6 flex flex-col justify-between mt-4">
              <div className="flex-1 flex items-end gap-6 pt-4 px-2">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "30%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "65%" }} />
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-lg" style={{ height: "85%" }} />
              </div>
              <div className="h-4 w-full border-t border-border/40 mt-4 pt-2 flex justify-between">
                <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-2 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          </div>

          {/* AUDITING INSIGHTS SUMMARY CARD SKELETON */}
          <div className="lg:col-span-2 p-5 bg-card/60 border border-border/40 rounded-3xl opacity-70 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Optimization Insights Skeleton */}
        <Card className="crm-card border border-border/40 opacity-75 p-5">
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-72 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-14 bg-slate-100 dark:bg-slate-900/60 border border-border/40 rounded-2xl flex items-center px-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh] px-4">
        <Card className="max-w-md w-full p-6 border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            The Company Analytics board displays sensitive general ledger cost analyses and is restricted to HR, Management, and Workspace Admins.
          </p>
          <Button onClick={() => window.location.replace("/dashboard")} className="w-full h-11 rounded-2xl font-bold">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // 1. Process 6-Month Trend Data
  const getRecentMonths = () => {
    const months = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const target = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(target.toISOString().slice(0, 7)); // "YYYY-MM"
    }
    return months;
  };

  const recentMonths = getRecentMonths();
  const trendData = recentMonths.map((m) => {
    const mExpenses = expenses.filter((e) => e.date.startsWith(m));
    const total = mExpenses.reduce((sum, e) => {
      return sum + convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
    }, 0);
    
    const dateObj = new Date(m + "-02");
    const name = dateObj.toLocaleDateString("en-US", { month: "short" });
    return { month: name, amount: total };
  });

  // 2. Process Categories Allocation Mix
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const amt = convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
    categoryMap[e.category] = (categoryMap[e.category] || 0) + amt;
  });

  const totalAllTime = Object.values(categoryMap).reduce((a, b) => a + b, 0);
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percent: totalAllTime > 0 ? (value / totalAllTime) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Payment Method mix
  const paymentMethodMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const amt = convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
    paymentMethodMap[e.paymentMethod] = (paymentMethodMap[e.paymentMethod] || 0) + amt;
  });

  const paymentMethodData = Object.entries(paymentMethodMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculations for KPI Cards
  const currentMonthValue = trendData[trendData.length - 1].amount;
  const previousMonthValue = trendData[trendData.length - 2].amount;
  
  let growthRate = 0;
  if (previousMonthValue > 0) {
    growthRate = Math.round(((currentMonthValue - previousMonthValue) / previousMonthValue) * 100);
  }

  // Cost optimization triggers
  const alerts = [];
  if (growthRate > 15) {
    alerts.push({
      type: "warning",
      message: `General expenditures jumped by ${growthRate}% this month. SaaS or operational bills require review.`,
    });
  }
  const saasAllocation = categoryData.find(c => c.name === "SaaS & Software");
  if (saasAllocation && saasAllocation.percent > 40) {
    alerts.push({
      type: "info",
      message: `Software SaaS licenses account for ${Math.round(saasAllocation.percent)}% of aggregate corporate burn. Consider auditing inactive users.`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      type: "success",
      message: "Monthly spending is consolidated and matches projected cash flow parameters. Nice work!",
    });
  }

  const getCurrencySymbol = (cur: string) => {
    switch (cur) {
      case "INR": return "₹";
      case "EUR": return "€";
      case "GBP": return "£";
      default: return "$";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenditure Analytics Desk"
        description="Comprehensive general ledger visualizations, SaaS subscription trends, and monthly burn breakdowns."
        eyebrow="Corporate Finance"
      />

      {/* KPI SUMMARIES */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-4">
        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Runway Burn (Active Month)</span>
            <span className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(currentMonthValue, workspaceCurrency)}
            </span>
            <span className="text-[10px] text-slate-450 mt-1">
              General ledger cash outflow
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Month-over-Month Growth</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xl font-black ${growthRate > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
              </span>
              {growthRate > 0 ? (
                <TrendingUp className="h-4 w-4 text-rose-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <span className="text-[10px] text-slate-450 mt-1">
              vs {formatCurrency(previousMonthValue, workspaceCurrency)} last month
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dominant cost driver</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1 truncate">
              {categoryData[0]?.name || "N/A"}
            </span>
            <span className="text-[10px] text-slate-450 mt-1">
              Accounted for {categoryData[0] ? Math.round(categoryData[0].percent) : 0}% of global costs
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Workspace base currency</span>
            <span className="text-xl font-black text-primary mt-1">
              {workspaceCurrency}
            </span>
            <span className="text-[10px] text-slate-450 mt-1">
              All metrics converted dynamically
            </span>
          </CardContent>
        </Card>
      </div>

      <CompanyCharts
        trendData={trendData}
        categoryData={categoryData.map(c => ({ name: c.name, value: c.value, percent: c.percent }))}
        paymentMethodData={paymentMethodData}
        currencySymbol={getCurrencySymbol(workspaceCurrency)}
      />

      {/* OPTIMIZATION INSIGHTS */}
      <Card className="crm-card p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/60">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ledger Optimizations & Insights</h3>
        <p className="text-[11px] text-slate-450 mt-0.5">System flagged points to improve company runway management.</p>
        <div className="space-y-3 mt-4">
          {alerts.map((al, idx) => (
            <div
              key={idx}
              className={`flex gap-3 p-4 rounded-2xl border text-xs leading-relaxed font-semibold ${
                al.type === "warning"
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  : al.type === "success"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                <Activity className="h-4 w-4" />
              </div>
              <div>{al.message}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
