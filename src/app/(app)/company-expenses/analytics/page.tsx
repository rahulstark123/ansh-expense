"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Calendar,
  DollarSign,
  PieChart,
  Activity,
  Layers,
  Percent,
} from "lucide-react";

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
  const [hoveredMonth, setHoveredMonth] = useState<{ month: string; amount: number } | null>(null);
  const [activeCategorySlice, setActiveCategorySlice] = useState<string | null>(null);

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
      <div className="flex h-[60dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    
    // Label as "Jan", "Feb" etc
    const dateObj = new Date(m + "-02");
    const name = dateObj.toLocaleDateString("en-US", { month: "short" });
    return { month: name, rawMonth: m, amount: total };
  });

  const maxTrendAmount = Math.max(...trendData.map((t) => t.amount), 1000);

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

  // Colors mapping for donut chart slices
  const categoryColors: Record<string, string> = {
    "Rent & Utilities": "#3b82f6", // Blue
    "SaaS & Software": "#6366f1", // Indigo
    "Marketing & Advertising": "#ec4899", // Pink
    "Office Operations & Equipment": "#f59e0b", // Orange
    "Salaries & Payroll": "#10b981", // Emerald
    "Other": "#64748b", // Slate
  };

  // 3. Payment Method mix
  const paymentMethodMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const amt = convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
    paymentMethodMap[e.paymentMethod] = (paymentMethodMap[e.paymentMethod] || 0) + amt;
  });

  const maxMethodAmount = Math.max(...Object.values(paymentMethodMap), 1000);

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

  // Draw Area chart curve SVG
  const width = 500;
  const height = 180;
  const padding = 35;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = trendData.map((d, i) => {
    const x = padding + (i / (trendData.length - 1)) * chartW;
    const y = padding + chartH - (d.amount / maxTrendAmount) * chartH;
    return { x, y, label: d.month, amount: d.amount };
  });

  let dPath = "";
  let dArea = "";
  if (points.length > 0) {
    dPath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, idx) => {
      if (idx > 0) {
        // Curve construction using bezier control points
        const cpX1 = points[idx - 1].x + chartW / 12;
        const cpY1 = points[idx - 1].y;
        const cpX2 = p.x - chartW / 12;
        const cpY2 = p.y;
        dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
      }
    });

    dArea = `${dPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  // Donut chart calculations
  let accumulatedAngle = 0;
  const donutCenter = 75;
  const donutRadius = 55;
  const donutCircumference = 2 * Math.PI * donutRadius;

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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* SPENDING TREND AREA GRAPH */}
        <Card className="crm-card lg:col-span-2 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Runway Capital Spending Curve</h3>
              <p className="text-[11px] text-slate-450 mt-0.5">Estimated general ledger payments aggregated over 6 months.</p>
            </div>
            {hoveredMonth && (
              <div className="text-right animate-in fade-in duration-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">{hoveredMonth.month} spend</span>
                <span className="text-xs font-black text-primary">{formatCurrency(hoveredMonth.amount, workspaceCurrency)}</span>
              </div>
            )}
          </div>

          <div className="relative w-full h-[200px] flex items-center justify-center">
            {points.length > 0 ? (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <defs>
                  <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                  const y = padding + chartH * ratio;
                  return (
                    <line
                      key={ratio}
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Filled Area */}
                <path d={dArea} fill="url(#chart-grad)" />

                {/* Path Outline */}
                <path d={dPath} fill="none" stroke="var(--color-primary, #6366f1)" strokeWidth="2.5" />

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="var(--color-primary, #6366f1)"
                      className="cursor-pointer stroke-white dark:stroke-slate-900 hover:scale-125 transition-transform"
                      strokeWidth="1.5"
                      onMouseEnter={() => setHoveredMonth({ month: p.label, amount: p.amount })}
                      onMouseLeave={() => setHoveredMonth(null)}
                    />
                    <text
                      x={p.x}
                      y={height - 10}
                      textAnchor="middle"
                      className="fill-slate-400 dark:fill-slate-650 text-[10px] font-bold"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <span className="text-xs text-slate-400 italic">No trend data compiled. Log some company expenses.</span>
            )}
          </div>
        </Card>

        {/* DONUT MIX CHART */}
        <Card className="crm-card lg:col-span-1 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Capital Allocation Chart</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Allocation by ledger category accounts.</p>

            <div className="relative flex items-center justify-center h-[160px] mt-4">
              {categoryData.length > 0 ? (
                <>
                  <svg width="150" height="150" className="transform -rotate-90">
                    {categoryData.map((slice) => {
                      const strokeDash = donutCircumference;
                      const strokeOffset = donutCircumference - (slice.percent / 100) * donutCircumference;
                      const currentAngle = accumulatedAngle;
                      accumulatedAngle += (slice.percent / 100) * 360;

                      const col = categoryColors[slice.name] || "#64748b";
                      const isHovered = activeCategorySlice === slice.name;

                      return (
                        <circle
                          key={slice.name}
                          cx={donutCenter}
                          cy={donutCenter}
                          r={donutRadius}
                          fill="transparent"
                          stroke={col}
                          strokeWidth={isHovered ? "16" : "12"}
                          strokeDasharray={strokeDash}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 cursor-pointer origin-center"
                          style={{
                            transform: `rotate(${currentAngle}deg)`,
                          }}
                          onMouseEnter={() => setActiveCategorySlice(slice.name)}
                          onMouseLeave={() => setActiveCategorySlice(null)}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      {activeCategorySlice ? activeCategorySlice : "Total Spend"}
                    </span>
                    <span className="text-sm font-black text-slate-950 dark:text-white mt-0.5">
                      {activeCategorySlice
                        ? formatCurrency(categoryMap[activeCategorySlice] || 0, workspaceCurrency)
                        : formatCurrency(totalAllTime, workspaceCurrency)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">No breakdown available.</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* PAYMENT METHOD BAR CHART */}
        <Card className="crm-card lg:col-span-1 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Outflow Channels</h3>
          <p className="text-[11px] text-slate-450 mt-0.5">Spending aggregates grouped by payment channel.</p>

          <div className="space-y-4 mt-6">
            {Object.entries(paymentMethodMap).map(([method, val]) => {
              const pct = maxMethodAmount > 0 ? (val / maxMethodAmount) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                    <span>{method}</span>
                    <span>{formatCurrency(val, workspaceCurrency)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* AUDITING ALERTS & INSIGHTS */}
        <Card className="crm-card lg:col-span-2 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ledger Optimizations & Insights</h3>
          <p className="text-[11px] text-slate-450 mt-0.5">System flagged points to improve company runway management.</p>

          <div className="space-y-3.5 mt-6">
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
    </div>
  );
}
