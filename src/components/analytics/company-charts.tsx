"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface ChartDataPoint {
  month: string;
  amount: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
}

interface CompanyChartsProps {
  trendData: ChartDataPoint[];
  categoryData: CategoryDataPoint[];
  paymentMethodData: { name: string; value: number }[];
  currencySymbol: string;
}

// Curated harmonious color palette
const COLORS = ["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#64748b"];

export default function CompanyCharts({
  trendData,
  categoryData,
  paymentMethodData,
  currencySymbol,
}: CompanyChartsProps) {
  
  const customTooltipFormatter = (value: any) => {
    const amount = Number(value || 0);
    return [`${currencySymbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, "Spend"];
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* RUNWAY TREND AREA CHART */}
        <div className="lg:col-span-2 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/60">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Runway Capital Spending Curve</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Aggregated general ledger expenditures over the last 6 months.</p>
          </div>
          <div className="h-[220px] w-full text-[10px] font-semibold">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-slate-400 italic">No spending records compiled.</span>
              </div>
            )}
          </div>
        </div>

        {/* DONUT CATEGORY MIX CHART */}
        <div className="lg:col-span-1 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/60 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Capital Allocation Chart</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Allocation share by category accounts.</p>
          </div>
          <div className="h-[200px] w-full text-[10px] font-semibold flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", color: "#64748b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400 italic">No category allocation mix.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* PAYMENT CHANNELS BAR CHART */}
        <div className="lg:col-span-1 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/60">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Outflow Channels</h3>
          <p className="text-[11px] text-slate-450 mt-0.5">Spending aggregates grouped by payment channel.</p>
          <div className="h-[180px] w-full text-[10px] font-semibold mt-4">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currencySymbol}${val.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={customTooltipFormatter}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xs text-slate-400 italic">No channels logged.</span>
              </div>
            )}
          </div>
        </div>

        {/* AUDITING INSIGHTS SUMMARY CARD */}
        <div className="lg:col-span-2 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/60 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">General Ledger Breakdowns</h3>
            <p className="text-[11px] text-slate-450 mt-0.5">Consolidated account sums for dynamic audits.</p>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs border-b border-border/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-extrabold text-slate-700 dark:text-slate-350">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white">
                  {currencySymbol}{item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
            {categoryData.length === 0 && (
              <div className="text-center py-8">
                <span className="text-xs text-slate-450 italic">No records to audit.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
