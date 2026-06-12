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
  CalendarCheck2
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { currentUser, expenses, projects, initialize, employees } = useExpenseStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      await initialize();
      setLoading(false);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter expenses of the current user (if employee, or full workspace if Manager/Admin)
  const isManagement = currentUser.role === "Admin" || currentUser.role === "Manager";
  
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

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Loading dashboard data...
          </span>
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
