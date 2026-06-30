"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2, MessageSquare, CreditCard, IndianRupee } from "lucide-react";
import { ADMIN_SESSION_TOKEN } from "@/lib/admin/auth";

interface DashboardData {
  stats: {
    workspaces: number;
    activeSubscriptions: number;
    openTickets: number;
    totalTickets: number;
    totalRevenuePaisa: number;
    successfulPayments: number;
    ticketsByStatus: Record<string, number>;
  };
  recentTickets: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    employeeName: string;
    createdAt: string;
  }[];
}

function formatPaisa(paisa: number) {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", {
      headers: { "X-Admin-Auth": ADMIN_SESSION_TOKEN },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  const cards = [
    {
      label: "Workspaces",
      value: data.stats.workspaces,
      sub: "Total registered",
      icon: Building2,
    },
    {
      label: "Active Subscriptions",
      value: data.stats.activeSubscriptions,
      sub: "Pro plans active",
      icon: CreditCard,
    },
    {
      label: "Open Tickets",
      value: data.stats.openTickets,
      sub: `${data.stats.totalTickets} total tickets`,
      icon: MessageSquare,
    },
    {
      label: "Total Revenue",
      value: formatPaisa(data.stats.totalRevenuePaisa),
      sub: `${data.stats.successfulPayments} successful payments`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-lg font-black text-white uppercase tracking-wider">Dashboard</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            className="bg-[#070D14] border border-white/5 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
              <Icon className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-2xl font-black text-white">{value}</div>
            <p className="text-[10px] text-slate-500 font-semibold">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#070D14] border border-white/5 rounded-2xl p-5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Support Tickets</h2>
        {data.recentTickets.length > 0 ? (
          <div className="divide-y divide-white/5">
            {data.recentTickets.map((ticket) => (
              <div key={ticket.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{ticket.subject}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {ticket.employeeName} · {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-8">No tickets yet.</p>
        )}
      </div>
    </div>
  );
}
