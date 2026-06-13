"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Loader2,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Repeat,
  Store,
  Wallet,
  ShieldAlert,
} from "lucide-react";

export default function CompanyExpensesSettingsPage() {
  const { currentUser, initialize } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Configuration Lists
  const [companyCategories, setCompanyCategories] = useState<string[]>([]);
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [billingCycles, setBillingCycles] = useState<string[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([]);

  // Input states
  const [newCompanyCategory, setNewCompanyCategory] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState("");
  const [newBillingCycle, setNewBillingCycle] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSettings = async () => {
    if (!isAuthorized) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyCategories(data.companyCategories || []);
        setVendorCategories(data.vendorCategories || []);
        setBillingCycles(data.billingCycles || []);
        setPaymentStatuses(data.paymentStatuses || []);
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
      setToast({ message: "Failed to load settings from server.", type: "error" });
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await initialize();
      await fetchSettings();
      setLoading(false);
    };
    run();
  }, []);

  const saveSettings = async (
    updatedCompany: string[],
    updatedVendors: string[],
    updatedCycles: string[],
    updatedStatuses: string[]
  ) => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyCategories: updatedCompany,
          vendorCategories: updatedVendors,
          billingCycles: updatedCycles,
          paymentStatuses: updatedStatuses,
        }),
      });

      if (res.ok) {
        setToast({ message: "Settings synced successfully!", type: "success" });
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to sync settings.");
      }
    } catch (e: any) {
      console.error(e);
      setToast({ message: e.message || "Failed to sync settings", type: "error" });
    }
  };

  // Helper additions
  const addCompanyCategory = () => {
    const val = newCompanyCategory.trim();
    if (val && !companyCategories.includes(val)) {
      const updated = [...companyCategories, val];
      setCompanyCategories(updated);
      setNewCompanyCategory("");
      saveSettings(updated, vendorCategories, billingCycles, paymentStatuses);
    }
  };

  const addVendorCategory = () => {
    const val = newVendorCategory.trim();
    if (val && !vendorCategories.includes(val)) {
      const updated = [...vendorCategories, val];
      setVendorCategories(updated);
      setNewVendorCategory("");
      saveSettings(companyCategories, updated, billingCycles, paymentStatuses);
    }
  };

  const addBillingCycle = () => {
    const val = newBillingCycle.trim();
    if (val && !billingCycles.includes(val)) {
      const updated = [...billingCycles, val];
      setBillingCycles(updated);
      setNewBillingCycle("");
      saveSettings(companyCategories, vendorCategories, updated, paymentStatuses);
    }
  };

  const addPaymentStatus = () => {
    const val = newPaymentStatus.trim();
    if (val && !paymentStatuses.includes(val)) {
      const updated = [...paymentStatuses, val];
      setPaymentStatuses(updated);
      setNewPaymentStatus("");
      saveSettings(companyCategories, vendorCategories, billingCycles, updated);
    }
  };

  // Helper deletions
  const removeCompanyCategory = (item: string) => {
    const updated = companyCategories.filter((c) => c !== item);
    setCompanyCategories(updated);
    saveSettings(updated, vendorCategories, billingCycles, paymentStatuses);
  };

  const removeVendorCategory = (item: string) => {
    const updated = vendorCategories.filter((c) => c !== item);
    setVendorCategories(updated);
    saveSettings(companyCategories, updated, billingCycles, paymentStatuses);
  };

  const removeBillingCycle = (item: string) => {
    const updated = billingCycles.filter((c) => c !== item);
    setBillingCycles(updated);
    saveSettings(companyCategories, vendorCategories, updated, paymentStatuses);
  };

  const removePaymentStatus = (item: string) => {
    const updated = paymentStatuses.filter((c) => c !== item);
    setPaymentStatuses(updated);
    saveSettings(companyCategories, vendorCategories, billingCycles, updated);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* PageHeader Skeleton */}
        <div className="space-y-3">
          <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-3.5 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>

        {/* Grid of Settings sections Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-75 p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-border/40 pb-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-2 w-52 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 py-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                ))}
              </div>
              <div className="pt-4 border-t border-border/40 mt-4 flex gap-2">
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex-1" />
                <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
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
            The Company Settings page allows configuring balance sheet accounting properties and is restricted to HR, Management, and Workspace Admins.
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
          <Card className={`p-4 shadow-xl border border-border/40 border-l-4 rounded-2xl bg-card ${
            toast.type === "success" ? "border-l-emerald-500" : "border-l-rose-500"
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-500" />
              )}
              <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{toast.message}</span>
            </div>
          </Card>
        </div>
      )}

      <PageHeader
        title="Expenditure Desk Settings"
        description="Configure accounting parameters, billing schedules, vendor categorization, and settlement statuses."
        eyebrow="Workspace Setup"
      />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Company Expenditure Categories */}
        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Expenditure Categories</h3>
                <span className="text-[10px] text-slate-400">Ledger account categories (e.g. SaaS, Office Rents)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2">
              {companyCategories.length > 0 ? (
                companyCategories.map((cat) => (
                  <Badge key={cat} className="bg-indigo-500/10 text-indigo-650 hover:bg-indigo-500/15 border-indigo-500/20 font-bold px-3 py-1.5 rounded-2xl text-[11px] gap-1.5 flex items-center">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCompanyCategory(cat)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                    >
                      &times;
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No categories defined. Add one below.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4 flex gap-2">
            <Input
              value={newCompanyCategory}
              onChange={(e) => setNewCompanyCategory(e.target.value)}
              placeholder="Add category name..."
              className="h-10 rounded-xl text-xs font-semibold"
              onKeyDown={(e) => e.key === "Enter" && addCompanyCategory()}
            />
            <Button onClick={addCompanyCategory} className="h-10 px-4 rounded-xl gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>

        {/* Vendor Categories */}
        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Vendor Categories</h3>
                <span className="text-[10px] text-slate-400">Supplier registry tags (e.g. Hosting Providers)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2">
              {vendorCategories.length > 0 ? (
                vendorCategories.map((cat) => (
                  <Badge key={cat} className="bg-indigo-500/10 text-indigo-650 hover:bg-indigo-500/15 border-indigo-500/20 font-bold px-3 py-1.5 rounded-2xl text-[11px] gap-1.5 flex items-center">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeVendorCategory(cat)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                    >
                      &times;
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No supplier tags defined. Add one below.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4 flex gap-2">
            <Input
              value={newVendorCategory}
              onChange={(e) => setNewVendorCategory(e.target.value)}
              placeholder="Add supplier tag..."
              className="h-10 rounded-xl text-xs font-semibold"
              onKeyDown={(e) => e.key === "Enter" && addVendorCategory()}
            />
            <Button onClick={addVendorCategory} className="h-10 px-4 rounded-xl gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>

        {/* Billing Cycles */}
        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Repeat className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Billing Cycle Options</h3>
                <span className="text-[10px] text-slate-400">SaaS subscription intervals (e.g. Monthly, Quarterly)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2">
              {billingCycles.length > 0 ? (
                billingCycles.map((cycle) => (
                  <Badge key={cycle} className="bg-indigo-500/10 text-indigo-650 hover:bg-indigo-500/15 border-indigo-500/20 font-bold px-3 py-1.5 rounded-2xl text-[11px] gap-1.5 flex items-center">
                    {cycle}
                    <button
                      type="button"
                      onClick={() => removeBillingCycle(cycle)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                    >
                      &times;
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No cycles defined. Add one below.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4 flex gap-2">
            <Input
              value={newBillingCycle}
              onChange={(e) => setNewBillingCycle(e.target.value)}
              placeholder="Add billing interval..."
              className="h-10 rounded-xl text-xs font-semibold"
              onKeyDown={(e) => e.key === "Enter" && addBillingCycle()}
            />
            <Button onClick={addBillingCycle} className="h-10 px-4 rounded-xl gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>

        {/* Payment Statuses */}
        <Card className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl border border-border/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Payment Statuses</h3>
                <span className="text-[10px] text-slate-400">Settlement configurations (e.g. Paid, Scheduled)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 py-2">
              {paymentStatuses.length > 0 ? (
                paymentStatuses.map((status) => (
                  <Badge key={status} className="bg-indigo-500/10 text-indigo-650 hover:bg-indigo-500/15 border-indigo-500/20 font-bold px-3 py-1.5 rounded-2xl text-[11px] gap-1.5 flex items-center">
                    {status}
                    <button
                      type="button"
                      onClick={() => removePaymentStatus(status)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                    >
                      &times;
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No statuses defined. Add one below.</span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 mt-4 flex gap-2">
            <Input
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              placeholder="Add payment status..."
              className="h-10 rounded-xl text-xs font-semibold"
              onKeyDown={(e) => e.key === "Enter" && addPaymentStatus()}
            />
            <Button onClick={addPaymentStatus} className="h-10 px-4 rounded-xl gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>
      </div>

      <div className="h-6" />
    </div>
  );
}
