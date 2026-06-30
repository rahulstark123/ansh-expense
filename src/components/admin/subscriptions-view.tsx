"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ADMIN_SESSION_TOKEN } from "@/lib/admin/auth";

interface SubscriptionRow {
  id: string;
  workspaceName: string;
  plan: string;
  status: string;
  seatsCount: number;
  amount: string;
  billingCycle: string;
  startsAt: string | null;
  expiresAt: string | null;
  transactionCount: number;
}

interface TransactionRow {
  id: string;
  workspaceName: string;
  plan: string;
  status: string;
  amount: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
}

interface SubStats {
  activeCount: number;
  totalCount: number;
  pendingCount: number;
  monthlyRecurring: string;
  newThisMonth: number;
  cancelledOrExpired: number;
  avgSeats: number;
  activeWorkspaces: number;
}

interface TxnStats {
  totalCount: number;
  successCount: number;
  failedCount: number;
  totalRevenue: string;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getStatusStyle(status: string) {
  if (status === "ACTIVE" || status === "SUCCESS") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  }
  if (status === "PENDING" || status === "SCHEDULED" || status === "CREATED") {
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
  return "bg-rose-500/10 text-rose-400 border-rose-500/20";
}

export function SubscriptionsView() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "transactions">("subscriptions");
  const [loading, setLoading] = useState(true);
  const [subStats, setSubStats] = useState<SubStats | null>(null);
  const [txnStats, setTxnStats] = useState<TxnStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/subscriptions", { headers: { "X-Admin-Auth": ADMIN_SESSION_TOKEN } }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch("/api/admin/transactions", { headers: { "X-Admin-Auth": ADMIN_SESSION_TOKEN } }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([subData, txnData]) => {
        if (subData) {
          setSubStats(subData.stats);
          setSubscriptions(subData.subscriptions);
        }
        if (txnData) {
          setTxnStats(txnData.stats);
          setTransactions(txnData.transactions);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metricCards = [
    {
      label: "Active Subscriptions",
      value: subStats?.activeCount ?? 0,
      sub: `${subStats?.totalCount ?? 0} total · ${subStats?.pendingCount ?? 0} pending`,
    },
    {
      label: "Monthly Recurring",
      value: subStats?.monthlyRecurring ?? "₹0.00",
      sub: "From active plans (monthly equiv.)",
    },
    {
      label: "New This Month",
      value: subStats?.newThisMonth ?? 0,
      sub: `${subStats?.cancelledOrExpired ?? 0} cancelled / expired`,
    },
    {
      label: "Avg Seats / Plan",
      value: subStats?.avgSeats ?? 0,
      sub: `${subStats?.activeWorkspaces ?? 0} active workspaces`,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-lg font-black text-white uppercase tracking-wider">Subscriptions & Transactions</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">All workspace billing activity</p>
      </div>

      <div className="flex gap-6 border-b border-white/5">
        {(["subscriptions", "transactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer capitalize ${
              activeTab === tab
                ? "text-violet-400 border-b-2 border-violet-500"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "subscriptions" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricCards.map(({ label, value, sub }) => (
              <div key={label} className="bg-[#070D14] border border-white/5 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                <div className="text-2xl font-black text-white">{value}</div>
                <p className="text-[10px] text-slate-500 font-semibold">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#070D14] border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-4 py-3">Workspace</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Seats</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Cycle</th>
                      <th className="px-4 py-3">Starts</th>
                      <th className="px-4 py-3">Expires</th>
                      <th className="px-4 py-3">Txns</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-slate-200">{row.workspaceName}</td>
                        <td className="px-4 py-3 text-slate-400 uppercase">{row.plan}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusStyle(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{row.seatsCount}</td>
                        <td className="px-4 py-3 text-slate-200 font-semibold">{row.amount}</td>
                        <td className="px-4 py-3 text-slate-400 capitalize">{row.billingCycle}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.startsAt)}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.expiresAt)}</td>
                        <td className="px-4 py-3 text-slate-400">{row.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-20 text-sm text-slate-500 font-semibold">No subscriptions found.</p>
            )}
          </div>
        </>
      )}

      {activeTab === "transactions" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total Transactions", value: txnStats?.totalCount ?? 0, sub: "All payment attempts" },
              { label: "Successful", value: txnStats?.successCount ?? 0, sub: "Completed payments" },
              { label: "Failed", value: txnStats?.failedCount ?? 0, sub: "Unsuccessful attempts" },
              { label: "Total Revenue", value: txnStats?.totalRevenue ?? "₹0.00", sub: "From successful payments" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-[#070D14] border border-white/5 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                <div className="text-2xl font-black text-white">{value}</div>
                <p className="text-[10px] text-slate-500 font-semibold">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#070D14] border border-white/5 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-4 py-3">Workspace</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Payment ID</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-semibold text-slate-200">{row.workspaceName}</td>
                        <td className="px-4 py-3 text-slate-400 uppercase">{row.plan}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusStyle(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-200 font-semibold">{row.amount}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{row.razorpayOrderId}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{row.razorpayPaymentId || "—"}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-20 text-sm text-slate-500 font-semibold">No transactions found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
