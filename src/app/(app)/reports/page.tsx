"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Wallet,
  Clock,
  TrendingUp,
  FolderOpen,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

type TimeRange = "30days" | "6months" | "12months" | "all";

export default function MyAnalyticsPage() {
  const { currentUser, expenses, initialize } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("6months");

  useEffect(() => {
    const run = async () => {
      await initialize();
      setLoading(false);
    };
    run();
  }, [initialize]);

  // Format currency helper
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
            Compiling your analytics...
          </span>
        </div>
      </div>
    );
  }

  // 1. Filter claims for current user only
  const personalExpenses = expenses.filter(e => e.employeeId === currentUser.id);

  // 2. Filter based on Time Range
  const now = new Date();
  const filteredExpenses = personalExpenses.filter(e => {
    if (timeRange === "all") return true;
    const claimDate = new Date(e.date);
    const diffTime = Math.abs(now.getTime() - claimDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeRange === "30days") return diffDays <= 30;
    if (timeRange === "6months") return diffDays <= 180;
    if (timeRange === "12months") return diffDays <= 365;
    return true;
  });

  // Calculate Personal Stats
  const approvedClaims = filteredExpenses.filter(e => e.status === "Approved");
  const pendingClaims = filteredExpenses.filter(e => e.status === "Pending");
  const rejectedClaims = filteredExpenses.filter(e => e.status === "Rejected" || e.status === "NeedsInfo");

  const totalClaimed = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalApproved = approvedClaims.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = pendingClaims.reduce((acc, curr) => acc + curr.amount, 0);
  
  const avgClaimSize = approvedClaims.length > 0 
    ? Math.round(totalApproved / approvedClaims.length) 
    : 0;

  // Category distributions (for approved only)
  const categoryTotals: Record<string, number> = {};
  approvedClaims.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
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

  const totalApprovedForCategories = categoriesData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Monthly trends (mock last 6 months or based on range)
  const monthlyTotals: Record<string, number> = {};
  approvedClaims.forEach(e => {
    const month = e.date.substring(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
  });

  const monthCount = timeRange === "30days" ? 3 : timeRange === "6months" ? 6 : 12;
  const trendMonths = Array.from({ length: monthCount }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  }).reverse();

  const trendData = trendMonths.map(month => {
    const dateObj = new Date(month + "-02");
    const label = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return {
      month: label,
      amount: monthlyTotals[month] || 0,
    };
  });

  const maxTrendAmount = Math.max(...trendData.map(d => d.amount), 1000);

  // Projects allocations
  const projectTotals: Record<string, number> = {};
  approvedClaims.forEach(e => {
    if (e.projectName) {
      projectTotals[e.projectName] = (projectTotals[e.projectName] || 0) + e.amount;
    }
  });

  const projectsSummary = Object.entries(projectTotals).map(([name, cost]) => ({
    name,
    cost,
  })).sort((a, b) => b.cost - a.cost);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>My Analytics | Ansh Expense</title>
      <meta name="description" content="Analyze your logged business expenses, reimbursement cycles, and category allocations on Ansh Expense." />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Personal Spend Reports"
          title="My Analytics"
          description="Analyze your logged business expenses, reimbursement cycles, and category allocations."
        />
        
        {/* Time Filter Tabs */}
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-border/50 max-w-fit">
          {(["30days", "6months", "12months", "all"] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all uppercase cursor-pointer ${
                timeRange === tab
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab === "30days" ? "30 Days" : tab === "6months" ? "6 Months" : tab === "12months" ? "1 Year" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Claimed */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Logged Spend
            </CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalClaimed)}
            </div>
            <p className="mt-1 text-xs text-slate-400 font-semibold">
              Across {filteredExpenses.length} claims in this period
            </p>
          </CardContent>
        </Card>

        {/* Total Reimbursed */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Reimbursed to Date
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalApproved)}
            </div>
            <p className="mt-1 text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{approvedClaims.length} approved payouts</span>
            </p>
          </CardContent>
        </Card>

        {/* Awaiting Approval */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Awaiting Approval
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalPending)}
            </div>
            <p className="mt-1 text-xs text-amber-555 text-slate-400">
              {pendingClaims.length} requests under review
            </p>
          </CardContent>
        </Card>

        {/* Average Claim Size */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Average Claim Payout
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(avgClaimSize)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Mean value of approved requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VISUAL ANALYTICS GRID */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SPENDING BY CATEGORY DONUT & LIST */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Spending by Category
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Category distribution for your approved reimbursements.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-around gap-8 sm:flex-row">
              {categoriesData.length > 0 ? (
                <div className="relative h-36 w-36 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="var(--border)"
                      strokeWidth="2.5"
                      className="opacity-20"
                    />
                    {(() => {
                      let accumulatedPercent = 0;
                      return categoriesData.map((cat, idx) => {
                        const percent = (cat.value / totalApprovedForCategories) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = 100 - accumulatedPercent + 25;
                        accumulatedPercent += percent;

                        return (
                          <circle
                            key={idx}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={cat.color}
                            strokeWidth="3.5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-300 hover:stroke-[4.5]"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Approved</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {formatInr(totalApproved)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-dashed border-border/60">
                  <span className="text-[10px] font-bold text-slate-400 text-center px-4">No approved claims in range</span>
                </div>
              )}

              {/* Legend & Progress List */}
              <div className="flex-1 space-y-3 w-full">
                {categoriesData.length > 0 ? (
                  categoriesData.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-bold text-slate-650 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {formatInr(cat.value)} ({Math.round((cat.value / totalApprovedForCategories) * 100)}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-550"
                          style={{
                            width: `${(cat.value / totalApprovedForCategories) * 100}%`,
                            backgroundColor: cat.color,
                          }}
                        />
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

        {/* MONTHLY SPEND TRAJECTORY (LINE/AREA CHART) */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Reimbursement Trajectory
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Trajectory of your approved expense payouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative h-48 w-full pt-4">
              {trendData.length > 0 ? (
                <>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full border-t border-dashed border-border/30" />
                    ))}
                  </div>

                  {/* SVG Area and Line */}
                  <svg className="h-40 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area Path */}
                    {(() => {
                      const points = trendData.map((d, idx) => {
                        const x = (idx / (trendData.length - 1)) * 100;
                        const y = 100 - (d.amount / maxTrendAmount) * 80; // keep bottom padding
                        return `${x},${y}`;
                      });
                      
                      if (points.length === 0) return null;
                      const pathStr = `M0,100 L${points.join(" L")} L100,100 Z`;
                      const lineStr = `M${points.join(" L")}`;

                      return (
                        <>
                          <path d={pathStr} fill="url(#areaGrad)" />
                          <path d={lineStr} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Intersecting Circles/Labels */}
                  <div className="absolute inset-0 flex justify-between pb-8 pt-2">
                    {trendData.map((d, idx) => {
                      const bottomVal = `${(d.amount / maxTrendAmount) * 80}%`;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end relative group/node"
                          style={{ width: `${100 / trendData.length}%` }}
                        >
                          {/* Value Tooltip */}
                          <div className="absolute bottom-[calc(100%+8px)] z-10 opacity-0 group-hover/node:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap shadow pointer-events-none">
                            {formatInr(d.amount)}
                          </div>
                          
                          {/* Circle node positioned absolutely at its height */}
                          <div 
                            className="absolute h-3 w-3 rounded-full border-2 border-primary bg-card transition-transform duration-200 group-hover/node:scale-125 cursor-pointer shadow-sm"
                            style={{ bottom: `calc(${bottomVal} + 12px)` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal Labels */}
                  <div className="absolute bottom-0 inset-x-0 h-6 flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                    {trendData.map((d, i) => (
                      <span key={i} className="text-center w-full truncate">
                        {d.month}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-slate-400 italic">No historical trend data.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLES AND DETAILS ROW */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* RECENT PERSONAL LOG */}
        <Card className="crm-card md:col-span-2">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                My Claims Log
              </CardTitle>
              <Link href="/expenses" className="text-xs font-bold text-primary hover:underline">
                Manage Claims
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.slice(0, 5).map((claim) => (
                  <div key={claim.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
                        {claim.title}
                      </span>
                      <span className="block text-[11px] text-slate-450 dark:text-slate-400 font-medium truncate mt-0.5">
                        {claim.date} · {claim.category} · {formatInr(claim.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {claim.status === "Approved" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-0 hover:bg-emerald-500/10 text-[10px] font-bold">
                          Approved
                        </Badge>
                      ) : claim.status === "Rejected" ? (
                        <Badge className="bg-rose-500/10 text-rose-600 border-0 hover:bg-rose-500/10 text-[10px] font-bold">
                          Rejected
                        </Badge>
                      ) : claim.status === "NeedsInfo" ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 hover:bg-amber-500/10 text-[10px] font-bold">
                          Needs Info
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-500/10 text-indigo-600 border-0 hover:bg-indigo-500/10 text-[10px] font-bold">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400 italic">No claims logged during this period.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PROJECTS SPENDING BREAKDOWN */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Project Allocations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {projectsSummary.length > 0 ? (
                projectsSummary.slice(0, 5).map((proj, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-500">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                          {proj.name}
                        </span>
                        <span className="block text-[10px] text-slate-450 dark:text-slate-500">Reimbursed amount</span>
                      </div>
                    </div>
                    <div className="shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-200">
                      {formatInr(proj.cost)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400 italic">No project mapping distributions.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK LOG ANALYTICS INSIGHTS */}
      <Card className="crm-card">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Personal Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3 text-xs leading-relaxed">
            <div className="space-y-1">
              <span className="block font-bold text-slate-750 dark:text-slate-300">
                ✦ Category Concentration
              </span>
              <p className="text-slate-500 leading-relaxed">
                {categoriesData.length > 0 ? (
                  <>
                    Your highest spending concentration is in <strong>{categoriesData[0].name}</strong>, representing <strong>{Math.round((categoriesData[0].value / totalApprovedForCategories) * 100)}%</strong> of your total approved payouts. Consider batch-filing recurring software licenses or flight plans.
                  </>
                ) : (
                  "Your category-specific approved payouts breakdown will display here once claim records are updated and approved by your manager."
                )}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-slate-750 dark:text-slate-300">
                ✦ Average Payout Lifecycle
              </span>
              <p className="text-slate-500 leading-relaxed">
                Claims average a payout size of <strong>{formatInr(avgClaimSize)}</strong>. Submitting claims within the same work week as payments assists with faster approvals and automated workspace accounting sweeps.
              </p>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-slate-750 dark:text-slate-300">
                ✦ Project budget mapping
              </span>
              <p className="text-slate-500 leading-relaxed">
                {projectsSummary.length > 0 ? (
                  <>
                    You mapped expenses to <strong>{projectsSummary.length}</strong> active client/workspace projects. Ensure all receipts are scanned clearly to attach to client invoice reports.
                  </>
                ) : (
                  "Map your expenses to specific projects (e.g., Acme Web Portal) when submitting claims to distribute budget logs and billing records accurately."
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
