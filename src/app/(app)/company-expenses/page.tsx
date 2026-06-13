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
  DialogDescription,
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

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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
  const [registeredVendors, setRegisteredVendors] = useState<{ id: string; name: string }[]>([]);

  // Workspace settings lists
  const [companyCategories, setCompanyCategories] = useState<string[]>([
    "Rent & Utilities",
    "SaaS & Software",
    "Marketing & Advertising",
    "Office Operations & Equipment",
    "Salaries & Payroll",
    "Other"
  ]);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([
    "Paid",
    "Unpaid",
    "Scheduled"
  ]);

  // Filters State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

  // Sub-Dialog triggers and states
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryVal, setNewCategoryVal] = useState("");

  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorContactName, setNewVendorContactName] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState("Software & SaaS");
  const [newVendorWebsite, setNewVendorWebsite] = useState("");

  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const [newStatusVal, setNewStatusVal] = useState("");

  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [billingCycles, setBillingCycles] = useState<string[]>([]);

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

  const fetchExpenseSettings = async () => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.companyCategories?.length) {
          setCompanyCategories(data.companyCategories);
          setCategory(data.companyCategories[0]);
        }
        if (data.paymentStatuses?.length) {
          setPaymentStatuses(data.paymentStatuses);
          setPaymentStatus(data.paymentStatuses[0]);
        }
        if (data.vendorCategories) {
          setVendorCategories(data.vendorCategories);
          if (data.vendorCategories.length) {
            setNewVendorCategory(data.vendorCategories[0]);
          }
        }
        if (data.billingCycles) {
          setBillingCycles(data.billingCycles);
        }
      }
    } catch (e) {
      console.error("Failed to load custom expense settings:", e);
    }
  };

  const handleSaveCategoryInline = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = newCategoryVal.trim();
    if (!val) return;
    if (companyCategories.includes(val)) {
      setToast({ message: "Category already exists.", type: "error" });
      return;
    }
    const updated = [...companyCategories, val];
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyCategories: updated,
          vendorCategories,
          billingCycles,
          paymentStatuses
        })
      });
      if (res.ok) {
        setCompanyCategories(updated);
        setCategory(val);
        setNewCategoryVal("");
        setAddCategoryOpen(false);
        setOpen(true);
        setToast({ message: `Category "${val}" added!`, type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveStatusInline = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = newStatusVal.trim();
    if (!val) return;
    if (paymentStatuses.includes(val)) {
      setToast({ message: "Status already exists.", type: "error" });
      return;
    }
    const updated = [...paymentStatuses, val];
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyCategories,
          vendorCategories,
          billingCycles,
          paymentStatuses: updated
        })
      });
      if (res.ok) {
        setPaymentStatuses(updated);
        setPaymentStatus(val);
        setNewStatusVal("");
        setAddStatusOpen(false);
        setOpen(true);
        setToast({ message: `Payment Status "${val}" added!`, type: "success" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveVendorInline = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = newVendorName.trim();
    if (!val) return;
    if (registeredVendors.some(v => v.name.toLowerCase() === val.toLowerCase())) {
      setToast({ message: "Vendor already exists.", type: "error" });
      return;
    }
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: val,
          contactName: newVendorContactName.trim() || null,
          email: newVendorEmail.trim() || null,
          phone: newVendorPhone.trim() || null,
          category: newVendorCategory,
          website: newVendorWebsite.trim() || null,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vendor) {
          setRegisteredVendors(prev => [...prev, data.vendor]);
          setVendor(data.vendor.name);
          setNewVendorName("");
          setNewVendorContactName("");
          setNewVendorEmail("");
          setNewVendorPhone("");
          setNewVendorCategory(vendorCategories[0] || "Software & SaaS");
          setNewVendorWebsite("");
          setAddVendorOpen(false);
          setOpen(true);
          setToast({ message: `Vendor "${val}" registered!`, type: "success" });
        }
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to save vendor", type: "error" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = sessionStorage.getItem("ansh_auth_token");
        const res = await fetch("/api/company-vendors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRegisteredVendors(data.vendors || []);
        }
      } catch (e) {
        console.error("Failed to load vendors:", e);
      }
    };

    const runInit = async () => {
      setLoading(true);
      await initialize();
      await Promise.all([loadSettings(), fetchVendors(), fetchExpenseSettings()]);
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
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/company-expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: "Expense entry deleted!", type: "success" });
        setDeleteConfirmOpen(false);
        setDetailOpen(false);
        setExpenseToDeleteId(null);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete expense", type: "error" });
    }
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

        {/* Metric Tiles Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-75">
              <CardContent className="p-4 space-y-3">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ledger Registry Skeleton */}
        <Card className="crm-card border border-border/40 opacity-75 p-5 w-full">
          <CardContent className="p-0 space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            {/* Table skeleton */}
            <div className="border border-border/40 rounded-2xl overflow-hidden bg-card">
              <div className="h-10 bg-slate-50 dark:bg-slate-900 border-b border-border/40 flex items-center px-4 justify-between">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="divide-y divide-border/30">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-12 flex items-center px-4 justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mr-16" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
        toolbar={
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer shadow-sm relative"
            >
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Filters</span>
              {(search.trim() !== "" || categoryFilter !== "All" || statusFilter !== "All") && (
                <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-200">
                  {
                    [search.trim() !== "", categoryFilter !== "All", statusFilter !== "All"].filter(Boolean).length
                  }
                </span>
              )}
            </Button>

            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute right-0 mt-2 z-40 w-72 sm:w-80 rounded-2xl border border-border bg-card/95 dark:bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 select-none">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                      Filter Ledger
                    </span>
                    {(search.trim() !== "" || categoryFilter !== "All" || statusFilter !== "All") && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setCategoryFilter("All");
                          setStatusFilter("All");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Search Query
                    </label>
                    <div className="relative">
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Merchant, title..."
                        className="h-10 rounded-xl pl-8 text-xs bg-card dark:bg-slate-900 border border-border"
                      />
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Categories</option>
                        {companyCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Payment Status
                    </label>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Statuses</option>
                        {paymentStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        }
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

      {/* LEDGER INDEX LIST */}
      <Card className="crm-card p-5 bg-card/60 backdrop-blur-md shadow-sm rounded-3xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">General Ledger Registry</h3>
        </div>

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
                        <span className="text-[10px] text-slate-450">
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

      {/* DIALOG: LOG COMPANY EXPENSE */}
      {/* DIALOG: LOG COMPANY EXPENSE */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh] relative">
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
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</label>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setAddCategoryOpen(true);
                      }}
                      className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    {companyCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
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
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Vendor / Merchant</label>
                  {isAuthorized && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setAddVendorOpen(true);
                      }}
                      className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    <option value="">Select Vendor...</option>
                    {registeredVendors.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
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
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Status</label>
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setAddStatusOpen(true);
                    }}
                    className="text-[10px] font-extrabold text-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                >
                  {paymentStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
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
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Category</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.category}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Billing Date</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(selectedExpense.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Vendor / Merchant</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.vendor || "N/A"}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Payment Method</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedExpense.paymentMethod}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Auditor Logged By</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedExpense.loggedBy?.name} ({selectedExpense.loggedBy?.role})
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-0.5">Logged Time</span>
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
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1">General Ledger Notes</span>
                  <p className="p-3.5 bg-card border border-border/80 rounded-2xl text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {selectedExpense.notes || "No additional description provided."}
                  </p>
                </div>

                {/* Attachments */}
                {selectedExpense.receiptUrl && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-2">Attached Invoices</span>
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
                      onClick={() => {
                        setExpenseToDeleteId(selectedExpense.id);
                        setDeleteConfirmOpen(true);
                        setDetailOpen(false);
                      }}
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

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              Remove General Ledger Entry?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-450 leading-relaxed mt-1 text-left">
              Are you sure you want to permanently delete this corporate general ledger expenditure entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setExpenseToDeleteId(null);
                setDetailOpen(true);
              }}
              className="h-11 px-6 rounded-2xl font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (expenseToDeleteId) {
                  await handleDeleteExpense(expenseToDeleteId);
                }
              }}
              className="h-11 px-6 rounded-2xl bg-rose-600 hover:bg-rose-750 text-white font-black text-xs gap-2 border-0 w-full sm:w-auto cursor-pointer flex items-center justify-center"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD CUSTOM CATEGORY */}
      <Dialog open={addCategoryOpen} onOpenChange={(val) => {
        setAddCategoryOpen(val);
        if (!val) setOpen(true);
      }}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              Add Custom Category
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Register a new expenditure category tag for ledger mapping.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCategoryInline} className="space-y-4 pt-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category Name</label>
              <Input
                required
                type="text"
                placeholder="e.g. Legal & Compliance"
                value={newCategoryVal}
                onChange={(e) => setNewCategoryVal(e.target.value)}
                className="h-11 rounded-2xl text-xs bg-card dark:bg-slate-900 border border-border"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 gap-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAddCategoryOpen(false);
                  setOpen(true);
                }}
                className="h-10 px-4 rounded-xl font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary h-10 px-4 rounded-xl font-black border-0 w-full sm:w-auto"
              >
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: REGISTER CORPORATE VENDOR */}
      <Dialog open={addVendorOpen} onOpenChange={(val) => {
        setAddVendorOpen(val);
        if (!val) setOpen(true);
      }}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              Register Corporate Vendor
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Register a new vendor/merchant with contact information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVendorInline} className="space-y-4 pt-4 text-xs">
            {/* Vendor Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Vendor / Company Name</label>
              <Input
                required
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                placeholder="e.g. Amazon Web Services Inc."
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</label>
              <div className="relative">
                <select
                  value={newVendorCategory}
                  onChange={(e) => setNewVendorCategory(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                >
                  {vendorCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Contact Person Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Person Name</label>
              <Input
                value={newVendorContactName}
                onChange={(e) => setNewVendorContactName(e.target.value)}
                placeholder="e.g. John Doe (Account Executive)"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                <Input
                  type="email"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  placeholder="billing@vendor.com"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                <div className="phone-input-container">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={newVendorPhone}
                    onChange={(val) => setNewVendorPhone(val || "")}
                  />
                </div>
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Website URL</label>
              <Input
                value={newVendorWebsite}
                onChange={(e) => setNewVendorWebsite(e.target.value)}
                placeholder="e.g. aws.amazon.com"
                className="h-11 rounded-2xl"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 gap-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAddVendorOpen(false);
                  setOpen(true);
                }}
                className="h-11 px-6 rounded-2xl font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary h-11 px-6 rounded-2xl font-black border-0 gap-2 w-full sm:w-auto"
              >
                Register Vendor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADD CUSTOM PAYMENT STATUS */}
      <Dialog open={addStatusOpen} onOpenChange={(val) => {
        setAddStatusOpen(val);
        if (!val) setOpen(true);
      }}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" />
              Add Custom Payment Status
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Register a new custom payment status for ledger tracking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStatusInline} className="space-y-4 pt-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment Status Name</label>
              <Input
                required
                type="text"
                placeholder="e.g. Processing"
                value={newStatusVal}
                onChange={(e) => setNewStatusVal(e.target.value)}
                className="h-11 rounded-2xl text-xs bg-card dark:bg-slate-900 border border-border"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 gap-2 flex flex-col-reverse sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setAddStatusOpen(false);
                  setOpen(true);
                }}
                className="h-10 px-4 rounded-xl font-bold w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary h-10 px-4 rounded-xl font-black border-0 w-full sm:w-auto"
              >
                Add Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
