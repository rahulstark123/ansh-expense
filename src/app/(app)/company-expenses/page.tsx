"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Paperclip,
  TrendingUp,
  FolderOpen,
  Calendar,
  Loader2,
  Trash2,
  Lock,
  Filter,
  ChevronDown,
  Building,
  ShieldAlert,
  Search,
  Landmark,
} from "lucide-react";

// Image compression utility
const compressImage = (file: File): Promise<Blob | File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.6
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// FX currency aggregation rates
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
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

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
  loggedBy: {
    name: string;
    email: string;
    avatarInitials: string;
    role: string;
  };
}

export default function CompanyExpensesPage() {
  const { currentUser, initialize } = useExpenseStore();

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<CompanyExpenseEntry[]>([]);
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");

  // Form & Modals State
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<CompanyExpenseEntry | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [claimCurrency, setClaimCurrency] = useState("USD");
  const [category, setCategory] = useState("Rent & Utilities");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Company Card");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auth roles validation
  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  const fetchExpenses = async () => {
    if (!isAuthorized) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const url = new URL("/api/company-expenses", window.location.origin);
      if (search.trim()) url.searchParams.set("search", search.trim());
      if (categoryFilter !== "All") url.searchParams.set("category", categoryFilter);
      if (statusFilter !== "All") url.searchParams.set("paymentStatus", statusFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
      }
    } catch (e) {
      console.error("Failed to load company expenses:", e);
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
          const ws = data.settings.workspaceSettings;
          setWorkspaceCurrency(ws.currency || "USD");
          setClaimCurrency(ws.currency || "USD");
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  };

  const detectIPCurrency = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.currency) {
          setClaimCurrency(data.currency);
        }
      }
    } catch (err) {
      console.error("IP currency detection failed:", err);
    }
  };

  useEffect(() => {
    const runInit = async () => {
      setLoading(true);
      await initialize();
      await Promise.all([loadSettings(), detectIPCurrency()]);
      setLoading(false);
    };
    runInit();
  }, []);

  useEffect(() => {
    if (!loading && isAuthorized) {
      fetchExpenses();
    }
  }, [loading, search, categoryFilter, statusFilter]);

  // Handle Uploader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (attachments.length >= 3) {
      alert("Maximum 3 files are allowed.");
      return;
    }

    setUploading(true);
    try {
      const processedFile = await compressImage(file);
      const token = sessionStorage.getItem("ansh_auth_token");
      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachments((prev) => [...prev, { name: file.name, url: data.url }]);
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Handle Log Submit
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const mergedUrls = attachments.map((att) => att.url).join(",");
      const res = await fetch("/api/company-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          amount,
          currency: claimCurrency,
          category,
          date: date || new Date().toISOString().slice(0, 10),
          paymentMethod,
          paymentStatus,
          vendor: vendor.trim() || null,
          notes: notes.trim() || null,
          receiptUrl: mergedUrls || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit company expense");
      }

      setTitle("");
      setAmount(0);
      setVendor("");
      setNotes("");
      setAttachments([]);
      setOpen(false);
      setToast({ message: "Company expense logged successfully!", type: "success" });
      fetchExpenses();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to submit expense.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark Unpaid as Paid
  const handleMarkAsPaid = async (id: string) => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/company-expenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: "Paid" }),
      });
      if (res.ok) {
        setToast({ message: "Expense updated as Paid!", type: "success" });
        setDetailOpen(false);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to update payment status", type: "error" });
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this general ledger entry?")) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/company-expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: "Expense entry deleted!", type: "success" });
        setDetailOpen(false);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete expense", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access check fallback screen
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh] px-4">
        <Card className="max-w-md w-full p-6 border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            The Company Expenses dashboard compiles sensitive balance sheet general ledger entries (SaaS, Rent, and Operations) and is restricted to HR, Management, and Workspace Admins.
          </p>
          <Button onClick={() => window.location.replace("/dashboard")} className="w-full h-11 rounded-2xl font-bold">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Statistics Computations
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));
  
  // Total aggregate spend in workspace currency
  const totalMonthlySpend = currentMonthExpenses.reduce((sum, e) => {
    return sum + convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
  }, 0);

  // Unpaid invoices stats
  const unpaidExpenses = expenses.filter(e => e.paymentStatus !== "Paid");
  const unpaidCount = unpaidExpenses.length;
  const unpaidSum = unpaidExpenses.reduce((sum, e) => {
    return sum + convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
  }, 0);

  // SaaS and software categories aggregate
  const saasExpenses = currentMonthExpenses.filter(e => e.category === "SaaS & Software");
  const saasSum = saasExpenses.reduce((sum, e) => {
    return sum + convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
  }, 0);

  // Category percentage breakdown calculations
  const categorySummary: Record<string, number> = {};
  expenses.forEach(e => {
    const amt = convertToWorkspaceCurrency(e.amount, e.currency, workspaceCurrency);
    categorySummary[e.category] = (categorySummary[e.category] || 0) + amt;
  });
  
  const totalAllTime = Object.values(categorySummary).reduce((a, b) => a + b, 0);
  const categoriesData = Object.entries(categorySummary).map(([name, value]) => ({
    name,
    value,
    percent: totalAllTime > 0 ? Math.round((value / totalAllTime) * 100) : 0,
  })).sort((a, b) => b.value - a.value);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Paid</Badge>;
      case "Unpaid":
        return <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Unpaid</Badge>;
      case "Scheduled":
        return <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Scheduled</Badge>;
      default:
        return <Badge className="bg-slate-500/10 hover:bg-slate-500/10 text-slate-500 font-bold px-2.5 py-0.5 rounded-full text-[10px]">{status}</Badge>;
    }
  };

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
        title="Company General Ledger"
        description="Track and log corporate expenditures, software SaaS licenses, marketing billing, and office rents."
        eyebrow="Finance desk"
        action={{
          label: "Log General Expense",
          icon: Plus,
          onClick: () => setOpen(true),
        }}
      />

      {/* METRIC TILES */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="crm-card border-l-4 border-l-primary bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">This Month's Spend</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalMonthlySpend, workspaceCurrency)}
            </span>
            <span className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary shrink-0" />
              Aggregated & converted in {workspaceCurrency}
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-rose-500 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unpaid & Scheduled Bills</span>
            <span className="text-2xl font-black text-rose-500 mt-1">
              {formatCurrency(unpaidSum, workspaceCurrency)}
            </span>
            <span className="text-[10px] text-slate-450 mt-1">
              {unpaidCount} invoice{unpaidCount === 1 ? "" : "s"} outstanding
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-indigo-500 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly SaaS Cost</span>
            <span className="text-2xl font-black text-indigo-500 mt-1">
              {formatCurrency(saasSum, workspaceCurrency)}
            </span>
            <span className="text-[10px] text-slate-450 mt-1">
              Dedicated cloud & utility software bills
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* SPENDING BY CATEGORY BREAKDOWN */}
        <Card className="crm-card lg:col-span-1 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Category Allocation Mix</h3>
            <p className="text-[11px] text-slate-450 mt-1 mb-6">Distribution across workspace general ledger accounts.</p>

            {categoriesData.length > 0 ? (
              <div className="space-y-4">
                {categoriesData.slice(0, 5).map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{cat.name}</span>
                      <span>{formatCurrency(cat.value, workspaceCurrency)} ({cat.percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-xs text-slate-400 italic">No expenditures logged yet.</span>
              </div>
            )}
          </div>
        </Card>

        {/* LEDGER INDEX LIST & FILTERS */}
        <Card className="crm-card lg:col-span-2 p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">General Ledger Registry</h3>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 px-3 rounded-xl gap-2 font-bold text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Collapsible filters panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-500/5 border border-border mb-6 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Search</label>
                <div className="relative">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Merchant, title..."
                    className="h-9 rounded-xl pl-8 text-xs"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Category</label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-9 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="SaaS & Software">SaaS & Software</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Office Operations & Equipment">Office Operations & Equipment</option>
                    <option value="Salaries & Payroll">Salaries & Payroll</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Payment Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-9 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* LEDGER TABLE */}
          {expenses.length > 0 ? (
            <div className="overflow-x-auto border border-border/60 rounded-2xl bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-slate-500/5 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Vendor/Merchant</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      onClick={() => {
                        setSelectedExpense(exp);
                        setDetailOpen(true);
                      }}
                      className="hover:bg-slate-500/5 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{exp.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500">{exp.category}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-350">{exp.vendor || "N/A"}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(exp.amount, exp.currency)}
                      </td>
                      <td className="p-3.5">{getStatusBadge(exp.paymentStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-14 bg-slate-500/5 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
              <FolderOpen className="h-8 w-8 text-slate-300" />
              <span className="text-xs font-bold text-slate-450">No company expenses logged matching criteria.</span>
            </div>
          )}
        </Card>
      </div>

      {/* DIALOG: LOG COMPANY EXPENSE */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Log Company Expenditure
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogSubmit} className="space-y-4 pt-4 text-xs">
            {formError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 font-bold text-rose-500">
                {formError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Expense Title / Item</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AWS SaaS Bill May 2026, Office Rent Q2"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="SaaS & Software">SaaS & Software</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Office Operations & Equipment">Office Operations & Equipment</option>
                    <option value="Salaries & Payroll">Salaries & Payroll</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Date of Cost</label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</label>
                <Input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="2500"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Currency</label>
                <div className="relative">
                  <select
                    value={claimCurrency}
                    onChange={(e) => setClaimCurrency(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="SGD">SGD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Merchant/Vendor & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Vendor / Merchant</label>
                <Input
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Method</label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="Company Card">Company Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Status</label>
              <div className="relative">
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Upload Invoices */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Invoice / Billing Attachments (Max 3)
              </label>

              <div className="space-y-2">
                {attachments.length < 3 && (
                  <label className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 text-xs font-semibold hover:bg-slate-500/5 dark:hover:bg-slate-900/50 cursor-pointer w-full transition-colors">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    {uploading ? "Compressing & Uploading..." : "Attach Invoice File"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}

                {attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-3.5 py-2 font-semibold"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[200px]" title={att.name}>{att.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Internal Audit Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Business justification or line-item description..."
                rows={2}
                className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-900 px-4 py-3 text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none"
              />
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
                  "Log Expenditure"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: VIEW DETAILS */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          {selectedExpense && (
            <>
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedExpense.title}
                  </DialogTitle>
                  <div className="shrink-0">{getStatusBadge(selectedExpense.paymentStatus)}</div>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-4 text-xs">
                {/* Details layout */}
                <div className="grid grid-cols-2 gap-4 bg-slate-500/5 p-4 rounded-2xl border border-border/30">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Category</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.category}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Billing Date</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(selectedExpense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Vendor / Merchant</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.vendor || "N/A"}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Payment Method</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.paymentMethod}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Auditor Logged By</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedExpense.loggedBy?.name} ({selectedExpense.loggedBy?.role})
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Logged Time</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(selectedExpense.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="flex items-center justify-between bg-primary/10 p-3.5 rounded-2xl">
                  <span className="font-bold text-primary">Ledger Cost:</span>
                  <span className="font-black text-sm text-primary">
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                  </span>
                </div>

                {/* Description Notes */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">General Ledger Notes</span>
                  <p className="p-3.5 bg-card border border-border/80 rounded-2xl text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {selectedExpense.notes || "No additional description provided."}
                  </p>
                </div>

                {/* Attachments */}
                {selectedExpense.receiptUrl && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-2">Attached Invoices</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.receiptUrl.split(",").filter(Boolean).map((url, idx) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2 font-bold text-primary hover:bg-primary/15 transition-all"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Invoice #{idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status updates / delete buttons */}
                <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4">
                  {selectedExpense.paymentStatus !== "Paid" ? (
                    <Button
                      onClick={() => handleMarkAsPaid(selectedExpense.id)}
                      className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl border-0 shrink-0 cursor-pointer"
                    >
                      Mark as Paid
                    </Button>
                  ) : (
                    <div />
                  )}

                  {["admin", "owner", "hr manager"].includes(userRole) && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteExpense(selectedExpense.id)}
                      className="h-10 px-4 rounded-xl text-xs gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Entry
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
