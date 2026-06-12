"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Plus,
  Loader2,
  Trash2,
  Lock,
  Building,
  ShieldAlert,
  Calendar,
  Clock,
  Repeat,
  DollarSign,
  PlayCircle,
  PauseCircle,
  ChevronDown,
} from "lucide-react";

interface RecurringContract {
  id: string;
  title: string;
  vendor: string;
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  nextRenewalDate: string;
  status: string;
  wid: number;
  createdAt: string;
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export default function CompanyRecurringPage() {
  const { currentUser, initialize } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<RecurringContract[]>([]);

  // Modals state
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [startDate, setStartDate] = useState("");
  const [nextRenewalDate, setNextRenewalDate] = useState("");

  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchContracts = async () => {
    if (!isAuthorized) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/recurring-contracts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await initialize();
      await fetchContracts();
      setLoading(false);
    };
    run();
  }, []);

  const handleAddContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !vendor.trim()) {
      setFormError("Title and Vendor are required fields.");
      return;
    }
    if (amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }
    if (!startDate) {
      setFormError("Start date is required.");
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/recurring-contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          vendor: vendor.trim(),
          amount,
          currency,
          billingCycle,
          startDate,
          nextRenewalDate: nextRenewalDate || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create contract.");
      }

      setTitle("");
      setVendor("");
      setAmount(0);
      setStartDate("");
      setNextRenewalDate("");
      setOpen(false);
      setToast({ message: "Subscription logged successfully!", type: "success" });
      fetchContracts();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to create contract.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleContractStatus = async (id: string, currentStatus: string) => {
    const targetStatus = currentStatus === "Active" ? "Paused" : "Active";
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/recurring-contracts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        setToast({ message: `Subscription marked as ${targetStatus}!`, type: "success" });
        fetchContracts();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscription contract?")) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/recurring-contracts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast({ message: "Contract deleted!", type: "success" });
        fetchContracts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRenewalDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = new Date(dateStr);
    renewal.setHours(0, 0, 0, 0);
    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
            The Recurring Contracts dashboard compiles recurring utility and software expenditures, and is restricted to HR, Management, and Workspace Admins.
          </p>
          <Button onClick={() => window.location.replace("/dashboard")} className="w-full h-11 rounded-2xl font-bold">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-55 animate-in fade-in slide-in-from-top-4 duration-300">
          <Card className={`p-4 shadow-xl border-l-4 rounded-2xl ${
            toast.type === "success" ? "border-l-emerald-500 bg-emerald-500/5" : "border-l-rose-500 bg-rose-500/5"
          }`}>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{toast.message}</span>
          </Card>
        </div>
      )}

      <PageHeader
        title="Recurring Subscriptions Desk"
        description="Monitor ongoing SaaS agreements, recurring lease frameworks, and domain renewals with upcoming date trackers."
        eyebrow="Corporate Finance"
        action={{
          label: "Add Subscription / Lease",
          icon: Plus,
          onClick: () => setOpen(true),
        }}
      />

      {/* CONTRACT CARDS GRID */}
      {contracts.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {contracts.map((contract) => {
            const daysLeft = getRenewalDays(contract.nextRenewalDate);
            const statusBadgeColor =
              contract.status === "Paused"
                ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                : daysLeft <= 3
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : daysLeft <= 10
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

            return (
              <Card key={contract.id} className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl p-5 border border-border/80 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 font-black text-sm">
                        <Repeat className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]" title={contract.title}>
                          {contract.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{contract.vendor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleContractStatus(contract.id, contract.status)}
                        className="text-slate-400 hover:text-primary transition-colors p-1"
                        title={contract.status === "Active" ? "Pause Contract" : "Resume Contract"}
                      >
                        {contract.status === "Active" ? (
                          <PauseCircle className="h-4.5 w-4.5" />
                        ) : (
                          <PlayCircle className="h-4.5 w-4.5" />
                        )}
                      </button>

                      {["admin", "owner", "hr manager"].includes(userRole) && (
                        <button
                          onClick={() => handleDeleteContract(contract.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove contract"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pricing / Cycle */}
                  <div className="bg-slate-500/5 p-3.5 rounded-2xl border border-border/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-550">Billing Cycle Cost:</span>
                    <div className="text-right">
                      <span className="text-sm font-black text-primary block">
                        {formatCurrency(contract.amount, contract.currency)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        {contract.billingCycle}
                      </span>
                    </div>
                  </div>

                  {/* Renewal Alerts */}
                  <div className="space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Status Check:</span>
                      <Badge className={`${statusBadgeColor} hover:${statusBadgeColor} font-bold px-2 py-0.5 rounded-full text-[9px]`}>
                        {contract.status === "Paused"
                          ? "Paused"
                          : daysLeft < 0
                          ? "Overdue / Pending"
                          : daysLeft === 0
                          ? "Renews Today"
                          : `Renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Next Renewal:</span>
                      <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(contract.nextRenewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-500/5 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
          <Repeat className="h-10 w-10 text-slate-300 animate-pulse" />
          <span className="text-xs font-bold text-slate-450">No recurring software or office contracts configured.</span>
        </div>
      )}

      {/* DIALOG: ADD CONTRACT */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Log Recurring Contract
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddContractSubmit} className="space-y-4 pt-4 text-xs">
            {formError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 font-bold text-rose-500">
                {formError}
              </div>
            )}

            {/* Contract Title */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Contract / SaaS Name</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google Workspace Suite, Office Rent Lease"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Vendor */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Partner Vendor / Provider</label>
              <Input
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Google Cloud India"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Cycle Amount Cost</label>
                <Input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="120"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Currency</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Billing Cycle Interval</label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Start Date & Custom next renewal date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Start Billing Date</label>
                <Input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Next Renewal (Optional)</label>
                <Input
                  type="date"
                  value={nextRenewalDate}
                  onChange={(e) => setNextRenewalDate(e.target.value)}
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                className="h-11 px-6 rounded-2xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="btn-primary h-11 px-6 rounded-2xl font-black border-0 gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Contract"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
