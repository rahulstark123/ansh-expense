"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Building2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

type TimeRange = "30days" | "6months" | "12months" | "all";

export default function TeamAnalyticsPage() {
  const router = useRouter();
  const { currentUser, expenses, employees, initialize } = useExpenseStore();
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

  // Auth gate check
  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAllowed = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Compiling team analytics...
          </span>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <Card className="crm-card max-w-md p-8 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800">
          <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            Access Denied
          </h2>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
            You do not have the required permissions to view team analytics. This section is restricted to Owners, Admins, Managers, and HR Managers.
          </p>
          <div className="mt-6 w-full">
            <Link href="/reports" className="w-full">
              <Button className="btn-primary w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                View My Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 1. Scoping Filter depending on user role
  let scopedEmployeeIds: string[] = [];
  const currentUserNameLower = currentUser.name.toLowerCase();

  if (["admin", "owner"].includes(userRole)) {
    // Admins and Owners see all workspace data
    scopedEmployeeIds = employees.map(e => e.id);
  } else if (userRole === "manager") {
    // Managers only see themselves + reportees
    scopedEmployeeIds = employees
      .filter(e => e.reportingManager?.toLowerCase() === currentUserNameLower || e.id === currentUser.id)
      .map(e => e.id);
  } else if (["hr", "hr manager"].includes(userRole)) {
    // HR only sees themselves + assigned employees
    scopedEmployeeIds = employees
      .filter(e => e.reportingHR?.toLowerCase() === currentUserNameLower || e.id === currentUser.id)
      .map(e => e.id);
  }

  // Filter expenses based on Scoped Employees
  const teamExpenses = expenses.filter(exp => scopedEmployeeIds.includes(exp.employeeId));

  // 2. Time Range Filter
  const now = new Date();
  const filteredExpenses = teamExpenses.filter(e => {
    if (timeRange === "all") return true;
    const claimDate = new Date(e.date);
    const diffTime = Math.abs(now.getTime() - claimDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeRange === "30days") return diffDays <= 30;
    if (timeRange === "6months") return diffDays <= 180;
    if (timeRange === "12months") return diffDays <= 365;
    return true;
  });

  // Calculations
  const approvedClaims = filteredExpenses.filter(e => e.status === "Approved");
  const pendingClaims = filteredExpenses.filter(e => e.status === "Pending");

  const totalSpend = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalApproved = approvedClaims.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = pendingClaims.reduce((acc, curr) => acc + curr.amount, 0);

  // Top Spender (Approved)
  const spenderTotals: Record<string, { name: string; amount: number; initials: string }> = {};
  approvedClaims.forEach(e => {
    if (!spenderTotals[e.employeeId]) {
      spenderTotals[e.employeeId] = { name: e.employeeName, amount: 0, initials: e.avatarInitials };
    }
    spenderTotals[e.employeeId].amount += e.amount;
  });

  const sortedSpenders = Object.values(spenderTotals).sort((a, b) => b.amount - a.amount);
  const topSpender = sortedSpenders[0] || null;

  // Category distributions
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

  // Monthly Trajectory (last 6 / 12 months)
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

  // Department totals
  const departmentTotals: Record<string, number> = {};
  approvedClaims.forEach(claim => {
    const emp = employees.find(e => e.id === claim.employeeId);
    const dept = emp?.department || "Unassigned";
    departmentTotals[dept] = (departmentTotals[dept] || 0) + claim.amount;
  });

  const departmentSummary = Object.entries(departmentTotals).map(([name, cost]) => ({
    name,
    cost,
  })).sort((a, b) => b.cost - a.cost);

  const totalDeptCost = departmentSummary.reduce((acc, curr) => acc + curr.cost, 0) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Team Analytics | Ansh Expense</title>
      <meta name="description" content="View company-wide expense analytics, department-wise breakdowns, and aggregate organization spending trends." />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Organization Analytics"
          title="Team Analytics"
          description={
            userRole === "admin" || userRole === "owner"
              ? "Comprehensive analytics of expense budgets and claims for the entire workspace."
              : `Spending analytics for employees reporting to ${currentUser.name}.`
          }
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
        {/* Total Spend */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Team Total Spend
            </CardTitle>
            <UsersRound className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalSpend)}
            </div>
            <p className="mt-1 text-xs text-slate-400 font-semibold">
              Across {filteredExpenses.length} scoped employee claims
            </p>
          </CardContent>
        </Card>

        {/* Total Approved */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Total Payouts Paid
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

        {/* Pending Payouts */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Awaiting Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {formatInr(totalPending)}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {pendingClaims.length} pending claims review
            </p>
          </CardContent>
        </Card>

        {/* Top Spender */}
        <Card className="crm-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Top Claiming Profile
            </CardTitle>
            <Users className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            {topSpender ? (
              <>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white truncate">
                  {topSpender.name}
                </div>
                <p className="mt-1 text-xs text-slate-400 font-semibold">
                  Claimed total of {formatInr(topSpender.amount)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-extrabold text-slate-400">
                  None
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  No approved claims in range
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SPENDING BY CATEGORY DONUT */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Team Spend Category Mix
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Distribution of approved costs across expense types.
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
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

              {/* Legends list */}
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

        {/* TEAM SPEND TREND (LINE CHART) */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Team Reimbursement Trajectory
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Aggregated monthly trajectory of approved payouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative h-48 w-full pt-4">
              {trendData.length > 0 ? (
                <>
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full border-t border-dashed border-border/30" />
                    ))}
                  </div>

                  <svg className="h-40 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="teamAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const points = trendData.map((d, idx) => {
                        const x = (idx / (trendData.length - 1)) * 100;
                        const y = 100 - (d.amount / maxTrendAmount) * 80;
                        return `${x},${y}`;
                      });
                      
                      if (points.length === 0) return null;
                      const pathStr = `M0,100 L${points.join(" L")} L100,100 Z`;
                      const lineStr = `M${points.join(" L")}`;

                      return (
                        <>
                          <path d={pathStr} fill="url(#teamAreaGrad)" />
                          <path d={lineStr} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                        </>
                      );
                    })()}
                  </svg>

                  <div className="absolute inset-0 flex justify-between pb-8 pt-2">
                    {trendData.map((d, idx) => {
                      const bottomVal = `${(d.amount / maxTrendAmount) * 80}%`;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end relative group/node"
                          style={{ width: `${100 / trendData.length}%` }}
                        >
                          <div className="absolute bottom-[calc(100%+8px)] z-10 opacity-0 group-hover/node:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] whitespace-nowrap shadow pointer-events-none">
                            {formatInr(d.amount)}
                          </div>
                          
                          <div 
                            className="absolute h-3 w-3 rounded-full border-2 border-purple-500 bg-card transition-transform duration-200 group-hover/node:scale-125 cursor-pointer shadow-sm"
                            style={{ bottom: `calc(${bottomVal} + 12px)` }}
                          />
                        </div>
                      );
                    })}
                  </div>

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

      {/* DEPARTMENT SPEND & TEAM LEADERBOARD */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* DEPARTMENT BENCHMARKS */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Department Spend Benchmarks
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Aggregated approved costs mapped by business departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {departmentSummary.length > 0 ? (
              departmentSummary.map((dept, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {dept.name}
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {formatInr(dept.cost)} ({Math.round((dept.cost / totalDeptCost) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${(dept.cost / totalDeptCost) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400 italic">No department claim records to benchmark.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TEAM MEMBER LEADERBOARD */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Teammate Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Ranking of team members by total approved expense claims.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {sortedSpenders.length > 0 ? (
                sortedSpenders.slice(0, 5).map((spender, idx) => {
                  const maxSpenderAmount = sortedSpenders[0].amount || 1;
                  return (
                    <div key={idx} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {spender.initials}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-800 dark:text-white truncate">
                            {spender.name}
                          </span>
                          <div className="w-24 mt-1 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full" 
                              style={{ width: `${(spender.amount / maxSpenderAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-200">
                        {formatInr(spender.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400 italic">No teammate spending records registered.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DETAILED SCOPED CLAIMS LIST */}
      <Card className="crm-card">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Team Log Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Recent expense submissions within your visibility scope.
              </CardDescription>
            </div>
            {["admin", "owner"].includes(userRole) && (
              <Link href="/expenses/approvals" className="text-xs font-bold text-primary hover:underline">
                Manage Approvals
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          <div className="divide-y divide-border/40 px-6">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.slice(0, 5).map((claim) => (
                <div key={claim.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {claim.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
                        {claim.title}
                      </span>
                      <span className="block text-[11px] text-slate-450 dark:text-slate-400 font-medium truncate mt-0.5">
                        {claim.employeeName} · {claim.category} · {formatInr(claim.amount)}
                      </span>
                    </div>
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
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {claim.date}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-xs text-slate-400 italic">No claims registered under your visibility scope.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
