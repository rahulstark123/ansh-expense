"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useExpenseStore, type ExpenseClaim, type ClaimStatus } from "@/stores/expense-store";
import { usePlanStore } from "@/stores/plan-store";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  Paperclip,
  TrendingUp,
  FolderOpen,
  Calendar,
  Send,
  Loader2,
  Trash2,
  Lock,
  Filter,
  ChevronDown,
  ShieldAlert,
  MoreVertical,
  Pencil,
} from "lucide-react";

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
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export default function ExpensesPage() {
  const { currentUser, employees, expenses, projects, initialize, addExpense, addComment, updateExpense } = useExpenseStore();
  const planStore = usePlanStore();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel");
  const [otherCategory, setOtherCategory] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [reason, setReason] = useState("");
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");
  const [workspaceMileageRate, setWorkspaceMileageRate] = useState(8);
  const [claimCurrency, setClaimCurrency] = useState("USD");
  
  // Mileage Form State
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [mileageRate, setMileageRate] = useState<number>(8); // Default 8 INR/Km

  // Tax State
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);

  // Receipt File State
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);

  // Comments State
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Filters State
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [claimToDeleteId, setClaimToDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchSettings = async () => {
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
            setWorkspaceMileageRate(ws.mileageRate ?? 8);
            setMileageRate(ws.mileageRate ?? 8);
            setClaimCurrency(ws.currency || "USD");
          }
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    fetchSettings();
  }, []);
  useEffect(() => {
    const run = async () => {
      await Promise.all([initialize(), planStore.fetchPlan()]);
      setLoading(false);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync mileage amount dynamically
  const isMileage = category === "Mileage";
  useEffect(() => {
    if (isMileage) {
      setAmount(distanceKm * mileageRate);
      setTaxPercent(0);
      setTaxAmount(0);
    }
  }, [distanceKm, mileageRate, isMileage]);

  // Sync tax calculations dynamically
  useEffect(() => {
    if (!isMileage && amount > 0) {
      const calculatedTax = (amount * taxPercent) / 100;
      setTaxAmount(Number(calculatedTax.toFixed(2)));
    } else {
      setTaxAmount(0);
    }
  }, [amount, taxPercent, isMileage]);

  // Handle uploader
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (attachments.length >= 3) {
      alert("Maximum 3 files are allowed.");
      return;
    }

    setUploadingReceipt(true);
    try {
      const processedFile = await compressImage(file);
      const token = sessionStorage.getItem("ansh_auth_token");
      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachments((prev) => [...prev, { name: file.name, url: data.url }]);
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt file.");
    } finally {
      setUploadingReceipt(false);
      e.target.value = "";
    }
  };

  // Handle new claim submission
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmitClaim = async (e: React.FormEvent) => {
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

    setSubmittingClaim(true);
    try {
      const mergedUrls = attachments.map((att) => att.url).join(",");
      const finalCategory = category === "Other" && otherCategory.trim() 
        ? `Other: ${otherCategory.trim()}` 
        : category;

      const payload: any = {
        title: title.trim(),
        category: finalCategory,
        amount,
        currency: claimCurrency,
        date: date || new Date().toISOString().slice(0, 10),
        reason: reason.trim(),
        receiptUrl: mergedUrls || null,
        isMileage,
        mileageRate: isMileage ? mileageRate : null,
        distanceKm: isMileage ? distanceKm : null,
        taxPercent: 0,
        taxAmount: 0,
        projectId: projectId || null,
      };

      if (editingClaimId) {
        // If editing a NeedsInfo claim, set its status back to Pending for re-approval
        const originalClaim = expenses.find((c) => c.id === editingClaimId);
        if (originalClaim?.status === "NeedsInfo") {
          payload.status = "Pending";
        }
        await updateExpense(editingClaimId, payload);
        setToast({ message: "Expense claim updated successfully!", type: "success" });
      } else {
        await addExpense({
          ...payload,
          employeeId: selectedEmployeeId || currentUser.id,
        });
        setToast({ message: "Expense claim logged successfully!", type: "success" });
      }

      // Clear Form & Close
      setEditingClaimId(null);
      setTitle("");
      setCategory("Travel");
      setOtherCategory("");
      setAmount(0);
      setDistanceKm(0);
      setTaxPercent(0);
      setTaxAmount(0);
      setProjectId("");
      setReason("");
      setClaimCurrency(workspaceCurrency);
      setAttachments([]);
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to submit claim.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Add Comment on Detail view
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedClaim) return;

    setPostingComment(true);
    try {
      await addComment(selectedClaim.id, commentText.trim());
      setCommentText("");
      
      // Update selected claim reference in modal to display the new comment
      const updatedClaims = useExpenseStore.getState().expenses;
      const found = updatedClaims.find(c => c.id === selectedClaim.id);
      if (found) setSelectedClaim(found);
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  // Handle Delete Claim
  const handleDeleteClaim = async (id: string) => {
    setDeleting(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: "Expense claim deleted successfully!", type: "success" });
        setDeleteConfirmOpen(false);
        setDetailOpen(false);
        setClaimToDeleteId(null);
        await initialize(); // Refresh data in store
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete claim");
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to delete claim.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // Filters logic
  // Only display user's own claims on this page
  const myClaims = expenses.filter(c => c.employeeId === currentUser.id);

  const filteredClaims = myClaims.filter(c => {
    const matchCat = categoryFilter === "All" || 
      c.category === categoryFilter ||
      (categoryFilter === "Other" && c.category.startsWith("Other"));
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchProject = projectFilter === "All" || c.projectName === projectFilter;
    return matchCat && matchStatus && matchProject;
  });

  // Derived Stats
  const approvedTotal = filteredClaims.filter(c => c.status === "Approved").reduce((a, b) => a + b.amount, 0);
  const pendingTotal = filteredClaims.filter(c => c.status === "Pending").reduce((a, b) => a + b.amount, 0);
  const rejectedTotal = filteredClaims.filter(c => c.status === "Rejected").reduce((a, b) => a + b.amount, 0);

  const formatCurrency = (val: number, currencyCode: string = "USD") => {
    let locale = "en-US";
    if (currencyCode === "INR") locale = "en-IN";
    else if (currencyCode === "EUR") locale = "de-DE";
    else if (currencyCode === "GBP") locale = "en-GB";
    else if (currencyCode === "JPY") locale = "ja-JP";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatInr = (val: number) => {
    return formatCurrency(val, workspaceCurrency);
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-rose-500/10 text-rose-600 border-0">Rejected</Badge>;
      case "NeedsInfo":
        return <Badge className="bg-amber-500/10 text-amber-600 border-0">Needs Info</Badge>;
      default:
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-0">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
        </div>

        {/* Skeleton Summary tiles */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-70">
              <CardContent className="p-6 space-y-3">
                <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton Table */}
        <Card className="crm-card border border-border/40 opacity-70">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40">
              <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="divide-y divide-border/40 px-6 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-4 flex items-center justify-between">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3.5 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>My Claims Tracker | Ansh Expense</title>
      <meta name="description" content="Monitor your submitted expense requests, log mileage, calculate taxes, and attach receipt proofs for verification." />
      <PageHeader
        eyebrow="Expense Reports"
        title="My Claims Tracker"
        description="Monitor your submitted expense requests, log mileage, calculate taxes, and attach receipt proofs."
        action={{
          label: "Log Expense Claim",
          icon: Plus,
          onClick: () => {
            setEditingClaimId(null);
            setSelectedEmployeeId(currentUser?.id || "");
            setTitle("");
            setCategory("Travel");
            setOtherCategory("");
            setAmount(0);
            setDistanceKm(0);
            setTaxPercent(0);
            setTaxAmount(0);
            setProjectId("");
            setReason("");
            setClaimCurrency(workspaceCurrency);
            setAttachments([]);
            setOpen(true);
          },
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
              {(projectFilter !== "All" || categoryFilter !== "All" || statusFilter !== "All") && (
                <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-200">
                  {
                    [projectFilter !== "All", categoryFilter !== "All", statusFilter !== "All"].filter(Boolean).length
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
                      Filter Claims
                    </span>
                    {(projectFilter !== "All" || categoryFilter !== "All" || statusFilter !== "All") && (
                      <button
                        onClick={() => {
                          setProjectFilter("All");
                          setCategoryFilter("All");
                          setStatusFilter("All");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Project Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Project Mapping
                    </label>
                    <div className="relative">
                      <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Projects</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                        {["Travel", "Meals", "Software", "Office Supplies", "Other"].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Statuses</option>
                        {["Pending", "Approved", "Rejected", "NeedsInfo"].map((st) => (
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

      {/* CLIMBED SUMMARY TILES */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="crm-card border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved Reimbursement</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
              {formatInr(approvedTotal)}
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Reimbursements</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
              {formatInr(pendingTotal)}
            </span>
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rejected Total</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
              {formatInr(rejectedTotal)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* CLAIMS LIST */}
      <Card className="crm-card">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
            My Logged Expense Claims
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-10 w-10 text-slate-350 mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No expense claims found</p>
              <p className="text-xs text-slate-400 mt-1">Submit a new claim using the "Log Expense Claim" button.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Title / Purpose</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Project Mapping</th>
                    <th className="px-6 py-4">Tax Mapping</th>
                    <th className="px-6 py-4">Claim Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all">
                      <td className="px-6 py-4">
                        <span className="block font-bold text-slate-800 dark:text-white">{claim.title}</span>
                        {claim.isMileage && (
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            {claim.distanceKm} Km @ ₹{claim.mileageRate}/Km
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{claim.category}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                        {claim.projectName ? (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3.5 w-3.5 text-indigo-400" />
                            {claim.projectName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-450 dark:text-slate-400 font-semibold">
                        {claim.taxPercent > 0 ? (
                          <span>{claim.taxPercent}% ({formatCurrency(claim.taxAmount, claim.currency || "USD")})</span>
                        ) : (
                          <span className="text-slate-400 italic">0%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-450 font-semibold">
                        {new Date(claim.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 dark:text-white">
                        {formatCurrency(claim.amount, claim.currency || "USD")}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setDetailOpen(true);
                          }}
                          className="h-8 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG: LOG NEW EXPENSE */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              {editingClaimId ? "Edit Expense Claim" : "Log Workspace Expense Claim"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitClaim} className="space-y-4 pt-4">
            {/* Claimant (Who spent it) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Claimant / Person
              </label>
              <div className="relative">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.id === currentUser?.id ? "(You)" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Claim Title / Purpose
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sketch Licensing, Client Lunch"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                  >
                    {["Travel", "Meals", "Software", "Office Supplies", "Other"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Date of Cost
                </label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            {/* Specify Category Input if Other selected */}
            {category === "Other" && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Specify Category / Purpose
                </label>
                <Input
                  required
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  placeholder="e.g. Client Gift, Marketing Agency"
                  className="h-11 rounded-2xl"
                />
              </div>
            )}

            {/* Currency selector (Visible for both Mileage and Regular claims) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Claim Currency
              </label>
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

            {/* Claim Amount */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Claim Amount
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                required
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                placeholder="150"
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Calculations display */}
            <div className="flex items-center justify-between text-xs bg-primary/10 p-3.5 rounded-xl">
              <span className="font-bold text-primary">Total Claimable Amount:</span>
              <span className="font-black text-sm text-primary">
                {formatCurrency(amount, claimCurrency)}
              </span>
            </div>

            {/* Project Mapping (Pro Feature check) */}
            <div className="space-y-1 relative">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Project Cost Mapping
                </label>
                {!planStore.hasProAccess && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                    <Lock className="h-2.5 w-2.5" /> Pro Feature
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={projectId}
                  disabled={!planStore.hasProAccess}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`flex h-11 w-full items-center rounded-2xl border bg-card dark:bg-slate-900 pl-3 pr-10 py-2 text-xs font-semibold outline-none transition-all appearance-none ${
                    !planStore.hasProAccess
                      ? "border-border bg-slate-50 cursor-not-allowed opacity-60 dark:bg-slate-950"
                      : "border-border hover:bg-slate-50/50 cursor-pointer"
                  }`}
                >
                  <option value="">Unassigned / No Project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.clientName || "Internal"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {!planStore.hasProAccess && (
                <div
                  onClick={() => planStore.requestUpgrade("projects")}
                  className="absolute inset-0 cursor-pointer"
                  title="Upgrade to Pro to assign expenses to projects"
                />
              )}
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Receipt Attachment Proof (Max 3)
              </label>

              <div className="space-y-2">
                {attachments.length < 3 && (
                  <label className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 text-xs font-semibold hover:bg-slate-500/5 dark:hover:bg-slate-900/50 cursor-pointer w-full transition-colors">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    {uploadingReceipt ? "Uploading..." : "Attach File"}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleReceiptUpload}
                      disabled={uploadingReceipt}
                      className="hidden"
                    />
                  </label>
                )}

                {attachments.length > 0 ? (
                  <div className="space-y-1.5">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate" title={att.name}>
                            {att.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachments((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  !uploadingReceipt && (
                    <span className="text-[11px] text-slate-400 block italic">
                      No receipt attached. Optional but recommended.
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Description / Business Justification
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe what these items were bought for..."
                rows={2}
                className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-900 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none"
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
                disabled={submittingClaim}
                className="btn-primary h-11 px-6 rounded-2xl font-black border-0 gap-2"
              >
                {submittingClaim ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingClaimId ? "Saving..." : "Submitting..."}
                  </>
                ) : (
                  editingClaimId ? "Save Changes" : "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: CLAIM DETAILS & COMMENTS */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          {selectedClaim && (
            <>
              <DialogHeader className="pb-3 border-b border-border/40 relative pr-12">
                <div className="flex flex-col items-start gap-1.5 w-full">
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[85%]">
                    {selectedClaim.title}
                  </DialogTitle>
                  <div>{getStatusBadge(selectedClaim.status)}</div>
                </div>

                {/* 3-dots actions menu next to close button */}
                {["Pending", "NeedsInfo"].includes(selectedClaim.status) && (
                  <div className="absolute right-8 top-1 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full border border-border/40 bg-card hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-555" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-36 rounded-xl border border-border bg-card shadow-lg p-1">
                        <DropdownMenuItem
                          onClick={() => {
                            // Populate Edit Form and Open
                            setEditingClaimId(selectedClaim.id);
                            setSelectedEmployeeId(selectedClaim.employeeId);
                            setTitle(selectedClaim.title);
                            
                            const standardCategories = ["Travel", "Meals", "Software", "Office Supplies", "Mileage"];
                            const isStandard = standardCategories.includes(selectedClaim.category);
                            if (isStandard) {
                              setCategory(selectedClaim.category);
                              setOtherCategory("");
                            } else {
                              setCategory("Other");
                              if (selectedClaim.category.startsWith("Other: ")) {
                                setOtherCategory(selectedClaim.category.slice(7));
                              } else {
                                setOtherCategory(selectedClaim.category);
                              }
                            }
                            
                            setAmount(selectedClaim.amount);
                            setDate(selectedClaim.date);
                            setProjectId(selectedClaim.projectId || "");
                            setReason(selectedClaim.reason || "");
                            setClaimCurrency(selectedClaim.currency || workspaceCurrency);
                            if (selectedClaim.isMileage) {
                              setDistanceKm(selectedClaim.distanceKm || 0);
                              setMileageRate(selectedClaim.mileageRate || workspaceMileageRate);
                            } else {
                              setDistanceKm(0);
                              setMileageRate(workspaceMileageRate);
                            }
                            // For attachments:
                            if (selectedClaim.receiptUrl) {
                              const urls = selectedClaim.receiptUrl.split(",").filter(Boolean);
                              setAttachments(urls.map((url, idx) => ({ name: `Receipt #${idx + 1}`, url })));
                            } else {
                              setAttachments([]);
                            }
                            setDetailOpen(false);
                            setOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setClaimToDeleteId(selectedClaim.id);
                            setDeleteConfirmOpen(true);
                            setDetailOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-455 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Claim
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </DialogHeader>

              <div className="space-y-5 pt-4 text-xs">
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-550/5 p-4 rounded-2xl border border-border/30">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Category</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.category}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Date Submitted</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(selectedClaim.appliedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Project Mapping</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedClaim.projectName || "Unassigned"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Base Amount</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(selectedClaim.amount, selectedClaim.currency || "USD")}</span>
                  </div>

                  {selectedClaim.taxPercent > 0 && (
                    <>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">GST Rate</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.taxPercent}%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Tax Amount</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(selectedClaim.taxAmount, selectedClaim.currency || "USD")}</span>
                      </div>
                    </>
                  )}

                  {selectedClaim.isMileage && (
                    <>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Distance Travelled</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.distanceKm} Km/Miles</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Mileage Rate</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(selectedClaim.mileageRate || 0, selectedClaim.currency || "USD")}/Unit</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Total amount header */}
                <div className="flex items-center justify-between bg-primary/10 p-3.5 rounded-2xl">
                  <span className="font-bold text-primary">Claim Total Amount:</span>
                  <span className="font-black text-sm text-primary">
                    {formatCurrency(selectedClaim.amount + (selectedClaim.isMileage ? 0 : selectedClaim.taxAmount), selectedClaim.currency || "USD")}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Business Justification</span>
                  <p className="p-3 bg-card border border-border rounded-xl text-slate-650 dark:text-slate-300 leading-relaxed">
                    {selectedClaim.reason || "No description provided."}
                  </p>
                </div>

                {/* Receipt attachment link */}
                {selectedClaim.receiptUrl && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Attached Receipts</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClaim.receiptUrl.split(",").filter(Boolean).map((url, idx) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 font-bold text-indigo-400 hover:bg-indigo-500/15 transition-all text-xs"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Receipt #{idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manager Reject Reason / Feedback */}
                {selectedClaim.status === "NeedsInfo" && selectedClaim.reason && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Reviewer Action Reason:</span>
                      <span className="mt-0.5 block">{selectedClaim.reason}</span>
                    </div>
                  </div>
                )}

                {/* COMMENTS SECTION */}
                <div className="border-t border-border/40 pt-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-3">Review Notes / Comments ({selectedClaim.comments.length})</span>
                  
                  {/* Comments list */}
                  <div className="space-y-3 max-h-40 overflow-y-auto mb-4 pr-1">
                    {selectedClaim.comments.length > 0 ? (
                      selectedClaim.comments.map((comm) => (
                        <div key={comm.id} className="p-2.5 bg-slate-550/5 border border-border/20 rounded-xl space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>{comm.authorName}</span>
                            <span>
                              {new Date(comm.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-slate-650 dark:text-slate-200 leading-snug">{comm.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic text-center py-4">No comments posted yet.</p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add review feedback, response, or note..."
                      className="flex-1 rounded-xl h-10 text-xs"
                    />
                    <Button
                      type="submit"
                      disabled={postingComment || !commentText.trim()}
                      className="btn-primary rounded-xl h-10 px-3 cursor-pointer shrink-0"
                    >
                      {postingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-border/40 flex flex-row items-center justify-end gap-3 w-full">
                {/* Resubmit button if NeedsInfo */}
                {selectedClaim.status === "NeedsInfo" && (
                  <Button
                    onClick={async () => {
                      try {
                        setPostingComment(true);
                        
                        // If there's content in comment box, send it first
                        if (commentText.trim()) {
                          await addComment(selectedClaim.id, commentText.trim());
                          setCommentText("");
                        } else {
                          // Otherwise, add a default system comment
                          await addComment(selectedClaim.id, "Claim resubmitted for re-approval.");
                        }

                        // Resubmit the claim status to Pending
                        await updateExpense(selectedClaim.id, { status: "Pending" });
                        setToast({ message: "Claim resubmitted for re-approval!", type: "success" });
                        setDetailOpen(false);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setPostingComment(false);
                      }
                    }}
                    className="btn-primary h-10 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-md shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Resubmit for Approval
                  </Button>
                )}
                <Button
                  onClick={() => setDetailOpen(false)}
                  variant="secondary"
                  className="h-10 px-5 rounded-xl font-bold text-xs"
                >
                  Close
                </Button>
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
              Remove Expense Claim?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-455 leading-relaxed mt-1 text-left">
              Are you sure you want to permanently delete this pending expense claim? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setClaimToDeleteId(null);
                setDetailOpen(true);
              }}
              className="h-11 px-6 rounded-2xl font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              disabled={deleting}
              onClick={async () => {
                if (claimToDeleteId) {
                  await handleDeleteClaim(claimToDeleteId);
                }
              }}
              className="h-11 px-6 rounded-2xl bg-rose-600 hover:bg-rose-750 text-white font-black text-xs gap-2 border-0 w-full sm:w-auto cursor-pointer flex items-center justify-center"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-card/90 px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Success
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
