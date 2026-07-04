"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenseStore, ClaimStatus } from "@/stores/expense-store";
import {
  Wallet,
  Clock,
  Car,
  FileSpreadsheet,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  TrendingDown,
  Loader2,
  CalendarCheck2,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";

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

const convertToWorkspaceCurrency = (amount: number, fromCurrency: string, targetCurrency: string) => {
  if (fromCurrency === targetCurrency) return amount;
  const fromInUsd = amount / (usdRates[fromCurrency] || 1.0);
  const result = fromInUsd * (usdRates[targetCurrency] || 1.0);
  return Number(result.toFixed(2));
};

interface CompanyEntry {
  id: string;
  direction: "in" | "out";
  amount: number;
  currency: string;
  date: string;
}

export default function DashboardPage() {
  const { currentUser, expenses, projects, initialize, employees } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [companyEntries, setCompanyEntries] = useState<CompanyEntry[]>([]);
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");

  useEffect(() => {
    const run = async () => {
      await initialize();
      setLoading(false);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Company money in/out is restricted to management roles
  const authorizedForCompany = ["admin", "manager", "owner", "hr", "hr manager"].includes(
    (currentUser.role || "").toLowerCase()
  );

  useEffect(() => {
    if (!authorizedForCompany) return;
    const token = typeof window !== "undefined" ? sessionStorage.getItem("ansh_auth_token") : null;
    if (!token) return;
    (async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/company-expenses", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (sRes.ok) {
          const d = await sRes.json();
          setWorkspaceCurrency(d.settings?.workspaceSettings?.currency || "USD");
        }
        if (cRes.ok) {
          const d = await cRes.json();
          setCompanyEntries(d.expenses || []);
        }
      } catch (e) {
        console.error("Failed to load company money in/out data:", e);
      }
    })();
  }, [authorizedForCompany]);

  // Filter expenses of the current user (if employee, or full workspace if Manager/Admin)
  const isManagement = currentUser.role === "Admin" || currentUser.role === "Manager" || currentUser.role === "Owner";
  
  // Calculate Stats
  const approvedClaims = expenses.filter(e => e.status === "Approved");
  const pendingClaims = expenses.filter(e => e.status === "Pending");
  
  const totalReimbursements = approvedClaims.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPendingAmount = pendingClaims.reduce((acc, curr) => acc + curr.amount, 0);
  
  const mileageClaims = approvedClaims.filter(e => e.isMileage);
  const totalMileageKm = mileageClaims.reduce((acc, curr) => acc + (curr.distanceKm || 0), 0);
  
  const claimsLoggedCount = expenses.length;

  // Category distributions
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    if (e.status === "Approved") {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });

  const categoryColors: Record<string, string> = {
    Travel: "#6366f1", // Indigo
    Meals: "#f59e0b", // Amber
    Software: "#3b82f6", // Blue
    "Office Supplies": "#ec4899", // Pink
    Mileage: "#10b981", // Emerald
    Other: "#64748b", // Slate
  };

  const categoriesData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || "#64748b",
  })).sort((a, b) => b.value - a.value);

  const totalApprovedAmount = categoriesData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Monthly trends (mock aggregate or simple date-based grouping)
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach(e => {
    if (e.status === "Approved") {
      const month = e.date.substring(0, 7); // YYYY-MM
      monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
    }
  });

  // Get last 6 months list
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  }).reverse();

  const trendData = last6Months.map(month => {
    const dateObj = new Date(month + "-02");
    const label = dateObj.toLocaleDateString("en-US", { month: "short" });
    return {
      month: label,
      amount: monthlyTotals[month] || 0,
    };
  });

  // Find max value for scaling trend graph
  const maxTrendAmount = Math.max(...trendData.map(d => d.amount), 1000);

  // Projects allocations
  const projectTotals: Record<string, number> = {};
  expenses.forEach(e => {
    if (e.status === "Approved" && e.projectName) {
      projectTotals[e.projectName] = (projectTotals[e.projectName] || 0) + e.amount;
    }
  });

  const projectsSummary = Object.entries(projectTotals).map(([name, cost]) => ({
    name,
    cost,
  })).sort((a, b) => b.cost - a.cost).slice(0, 4);

  // Format currencies
  const formatInr = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Company money in vs money out (already stored in workspace currency)
  const cbConvert = (amount: number, from: string) =>
    convertToWorkspaceCurrency(amount, from, workspaceCurrency);

  const cbTrend = last6Months.map((month) => {
    const monthEntries = companyEntries.filter((e) => e.date.startsWith(month));
    const inAmt = monthEntries
      .filter((e) => e.direction === "in")
      .reduce((s, e) => s + cbConvert(e.amount, e.currency), 0);
    const outAmt = monthEntries
      .filter((e) => e.direction !== "in")
      .reduce((s, e) => s + cbConvert(e.amount, e.currency), 0);
    const label = new Date(month + "-02").toLocaleDateString("en-US", { month: "short" });
    return { month: label, inAmt, outAmt };
  });

  const cbMax = Math.max(...cbTrend.flatMap((d) => [d.inAmt, d.outAmt]), 1);
  const cbTotalIn = companyEntries
    .filter((e) => e.direction === "in")
    .reduce((s, e) => s + cbConvert(e.amount, e.currency), 0);
  const cbTotalOut = companyEntries
    .filter((e) => e.direction !== "in")
    .reduce((s, e) => s + cbConvert(e.amount, e.currency), 0);
  const cbNet = cbTotalIn - cbTotalOut;

  const formatCur = (val: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: workspaceCurrency,
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      return `${workspaceCurrency} ${val.toFixed(0)}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Skeleton Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-70">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
                <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Spend Category Card */}
          <Card className="crm-card border border-border/40 opacity-70">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-72 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="flex items-center justify-around gap-6 py-4">
                <div className="h-32 w-32 rounded-full border-[12px] border-slate-200 dark:border-slate-800 flex items-center justify-center" />
                <div className="space-y-3 flex-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spend Trend Card */}
          <Card className="crm-card border border-border/40 opacity-70">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-72 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-32 w-full flex items-end justify-between gap-4 pt-4 px-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-md" style={{ height: `${20 + (j % 3) * 30}%` }} />
                    <div className="h-3 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Dashboard | Ansh Expense</title>
      <meta name="description" content="Access your workspace overview dashboard to track pending claims, submit mileage logs, view recent transactions, and approve team requests." />
      <PageHeader
        eyebrow="Workspace Overview"
        title={`Welcome back, ${currentUser.name}`}
        description={`Track, submit, and approve your team expense claims and mileage logs.`}
      />

      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reimbursements */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Approved Reimbursements
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalReimbursements)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
              <TrendingUp className="h-3 w-3" />
              <span>Paid to date in current workspace</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Pending Claims
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalPendingAmount)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span>{pendingClaims.length} requests awaiting reviews</span>
            </div>
          </CardContent>
        </Card>

        {/* Mileage Logged */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Approved Mileage
            </CardTitle>
            <Car className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {totalMileageKm.toLocaleString()} Km
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span>Mileage tracked in workspace</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Logged Claims */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Logged Claims
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {claimsLoggedCount}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span>All active and historical entries</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS: CATEGORY BREAKDOWN & MONTHLY TREND */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SPENDING BY CATEGORY */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Approved Costs by Category
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Distribution of your workspace reimbursable claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-around gap-6 sm:flex-row">
              {/* Pure SVG Donut Chart */}
              {categoriesData.length > 0 ? (
                <div className="relative h-36 w-36 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="var(--border)"
                      strokeWidth="2.5"
                      className="opacity-40"
                    />
                    {/* Pie Slices */}
                    {(() => {
                      let accumulatedPercent = 0;
                      return categoriesData.map((cat, idx) => {
                        const percent = (cat.value / totalApprovedAmount) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = 100 - accumulatedPercent + 25; // +25 to align top
                        accumulatedPercent += percent;

                        return (
                          <circle
                            key={idx}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={cat.color}
                            strokeWidth="3.2"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 hover:stroke-[4]"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {formatInr(totalReimbursements)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-dashed border-border/60">
                  <span className="text-[10px] font-bold text-slate-400 text-center px-4">No approved claims</span>
                </div>
              )}

              {/* Legends */}
              <div className="flex-1 space-y-3">
                {categoriesData.length > 0 ? (
                  categoriesData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block">
                          {formatInr(cat.value)}
                        </span>
                        <span className="text-[9px] text-slate-400 block -mt-0.5">
                          {Math.round((cat.value / totalApprovedAmount) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Approved claim records will compile category breakdowns automatically.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MONTHLY SPENDING TREND */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Monthly Spending Trends
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Summary of approved payouts over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Pure SVG Bar Chart */}
            <div className="h-36 w-full flex items-end justify-between gap-4 pt-4 px-2">
              {trendData.map((d, i) => {
                const heightPercent = Math.max(10, (d.amount / maxTrendAmount) * 100);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2 group/bar">
                    {/* Tooltip value */}
                    <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-7 pointer-events-none select-none dark:bg-white dark:text-slate-950 shadow">
                      {formatInr(d.amount)}
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-md dark:bg-slate-900/60 overflow-hidden flex items-end h-24">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-indigo-500 to-sky-400 group-hover/bar:brightness-110 transition-all duration-500 rounded-t-md"
                      />
                    </div>
                    {/* Month Label */}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* COMPANY MONEY IN vs MONEY OUT */}
      {authorizedForCompany && (
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  Money In vs Money Out
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Company cash movement over the last 6 months.
                </CardDescription>
              </div>
              <Link href="/company-expenses" className="text-xs font-bold text-primary hover:underline shrink-0">
                Open ledger
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Totals summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl border border-border/40 bg-emerald-500/5 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Money In</span>
                <div className="text-base sm:text-lg font-extrabold text-emerald-500 mt-0.5">
                  {formatCur(cbTotalIn)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/40 bg-rose-500/5 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Money Out</span>
                <div className="text-base sm:text-lg font-extrabold text-rose-500 mt-0.5">
                  {formatCur(cbTotalOut)}
                </div>
              </div>
              <div className={`rounded-2xl border border-border/40 p-3 ${cbNet >= 0 ? "bg-primary/5" : "bg-amber-500/5"}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Balance</span>
                <div className={`text-base sm:text-lg font-extrabold mt-0.5 ${cbNet >= 0 ? "text-primary" : "text-amber-500"}`}>
                  {cbNet < 0 ? "-" : ""}{formatCur(Math.abs(cbNet))}
                </div>
              </div>
            </div>

            {/* Grouped bar chart */}
            {companyEntries.length > 0 ? (
              <>
                <div className="h-40 w-full flex items-end justify-between gap-3 sm:gap-6 pt-2 px-2">
                  {cbTrend.map((d, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex items-end justify-center gap-1.5 w-full h-28">
                        <div
                          title={`In: ${formatCur(d.inAmt)}`}
                          className="flex-1 max-w-[16px] bg-slate-100 dark:bg-slate-900/60 rounded-t-md flex items-end h-full overflow-hidden"
                        >
                          <div
                            style={{ height: `${Math.max(3, (d.inAmt / cbMax) * 100)}%` }}
                            className="w-full bg-emerald-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                          />
                        </div>
                        <div
                          title={`Out: ${formatCur(d.outAmt)}`}
                          className="flex-1 max-w-[16px] bg-slate-100 dark:bg-slate-900/60 rounded-t-md flex items-end h-full overflow-hidden"
                        >
                          <div
                            style={{ height: `${Math.max(3, (d.outAmt / cbMax) * 100)}%` }}
                            className="w-full bg-rose-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {d.month}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Money In</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Money Out</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-slate-500/5 rounded-2xl border border-dashed border-border/60">
                <p className="text-xs text-slate-400 italic">
                  No company transactions logged yet. Log money in/out from Company Expenses.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TABLES: RECENT REQUESTS & PROJECTS SPENDING */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* RECENT EXPENSE CLAIMS */}
        <Card className="crm-card lg:col-span-2">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Recent Expense Claims
              </CardTitle>
              <Link href="/expenses" className="text-xs font-bold text-primary hover:underline">
                View all claims
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {expenses.length > 0 ? (
                expenses.slice(0, 4).map((claim) => (
                  <div key={claim.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {claim.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
                          {claim.title}
                        </span>
                        <span className="block text-[11px] text-slate-450 dark:text-slate-400 font-medium truncate">
                          {claim.employeeName} · {claim.category} · {formatInr(claim.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {claim.status === "Approved" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 hover:bg-emerald-500/10">
                          Approved
                        </Badge>
                      ) : claim.status === "Rejected" ? (
                        <Badge className="bg-rose-500/10 text-rose-600 border-0 hover:bg-rose-500/10">
                          Rejected
                        </Badge>
                      ) : claim.status === "NeedsInfo" ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 hover:bg-amber-500/10">
                          Needs Info
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-500/10 text-indigo-600 border-0 hover:bg-indigo-500/10">
                          Pending
                        </Badge>
                      )}
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(claim.appliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 italic">No claim entries registered yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PROJECTS BUDGET ALLOCATION */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Project Costs (Top)
              </CardTitle>
              <Link href="/expenses/projects" className="text-xs font-bold text-primary hover:underline">
                View details
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {projectsSummary.length > 0 ? (
                projectsSummary.map((proj, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-500">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                          {proj.name}
                        </span>
                        <span className="block text-[10px] text-slate-400">Approved Cost Mapping</span>
                      </div>
                    </div>
                    <div className="shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-200">
                      {formatInr(proj.cost)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 italic">No project mapping distributions.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
