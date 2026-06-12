"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "lucide-react";

export default function ExpensesPage() {
  const { currentUser, employees, expenses, projects, initialize, addExpense, addComment } = useExpenseStore();
  const planStore = usePlanStore();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [reason, setReason] = useState("");
  
  // Mileage Form State
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [mileageRate, setMileageRate] = useState<number>(8); // Default 8 INR/Km

  // Tax State
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);

  // Receipt File State
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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

    setUploadingReceipt(true);
    const token = sessionStorage.getItem("ansh_auth_token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setReceiptUrl(data.url);
      setReceiptFileName(file.name);
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt file.");
    } finally {
      setUploadingReceipt(false);
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
      await addExpense({
        title: title.trim(),
        category,
        amount,
        date: date || new Date().toISOString().slice(0, 10),
        reason: reason.trim(),
        receiptUrl,
        isMileage,
        mileageRate: isMileage ? mileageRate : null,
        distanceKm: isMileage ? distanceKm : null,
        taxPercent,
        taxAmount,
        projectId: projectId || null,
        employeeId: selectedEmployeeId || currentUser.id,
      });

      // Clear Form & Close
      setTitle("");
      setCategory("Travel");
      setAmount(0);
      setDistanceKm(0);
      setTaxPercent(0);
      setTaxAmount(0);
      setProjectId("");
      setReason("");
      setReceiptUrl(null);
      setReceiptFileName(null);
      setOpen(false);
      setToast({ message: "Expense claim logged successfully!", type: "success" });
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

  // Filters logic
  // Only display user's own claims on this page
  const myClaims = expenses.filter(c => c.employeeId === currentUser.id);

  const filteredClaims = myClaims.filter(c => {
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchProject = projectFilter === "All" || c.projectName === projectFilter;
    return matchCat && matchStatus && matchProject;
  });

  // Derived Stats
  const approvedTotal = filteredClaims.filter(c => c.status === "Approved").reduce((a, b) => a + b.amount, 0);
  const pendingTotal = filteredClaims.filter(c => c.status === "Pending").reduce((a, b) => a + b.amount, 0);
  const rejectedTotal = filteredClaims.filter(c => c.status === "Rejected").reduce((a, b) => a + b.amount, 0);

  const formatInr = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
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
            setSelectedEmployeeId(currentUser?.id || "");
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
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer"
                    >
                      <option value="All">All Projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {["Travel", "Meals", "Software", "Office Supplies", "Mileage", "Other"].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      {["Pending", "Approved", "Rejected", "NeedsInfo"].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
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
                      <td className="px-6 py-4 text-xs text-slate-450 dark:text-slate-400 font-semibold">
                        {claim.taxPercent > 0 ? (
                          <span>{claim.taxPercent}% ({formatInr(claim.taxAmount)})</span>
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
                        {formatInr(claim.amount)}
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
              Log Workspace Expense Claim
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
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.id === currentUser?.id ? "(You)" : ""}
                  </option>
                ))}
              </select>
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
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer"
                >
                  {["Travel", "Meals", "Software", "Office Supplies", "Mileage", "Other"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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

            {/* If Mileage is selected */}
            {isMileage ? (
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-indigo-500/5 p-4 border border-indigo-500/10">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Distance Travelled (Km)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={distanceKm || ""}
                    onChange={(e) => setDistanceKm(Math.max(0, Number(e.target.value)))}
                    placeholder="400"
                    className="h-11 rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Mileage Rate (₹/Km)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={mileageRate}
                    onChange={(e) => setMileageRate(Math.max(0, Number(e.target.value)))}
                    className="h-11 rounded-2xl"
                  />
                </div>
              </div>
            ) : (
              /* If Normal Claim: Amount and Tax */
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Base Amount (INR)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="15000"
                    className="h-11 rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Tax Percent / GST
                  </label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="flex h-11 w-full items-center rounded-2xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (GST)</option>
                    <option value="12">12% (GST)</option>
                    <option value="18">18% (GST)</option>
                    <option value="28">28% (GST)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Calculations display */}
            <div className="flex items-center justify-between text-xs bg-slate-550/5 dark:bg-slate-900/40 p-3 rounded-xl border border-border/40">
              <span className="font-semibold text-slate-400">
                {isMileage ? "Distance x Rate" : `GST Tax Amount (${taxPercent}%):`}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {isMileage ? `${distanceKm} Km x ₹${mileageRate}` : formatInr(taxAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-primary/10 p-3.5 rounded-xl">
              <span className="font-bold text-primary">Total Claimable Amount:</span>
              <span className="font-black text-sm text-primary">{formatInr(amount + (isMileage ? 0 : taxAmount))}</span>
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

              <select
                value={projectId}
                disabled={!planStore.hasProAccess}
                onChange={(e) => setProjectId(e.target.value)}
                className={`flex h-11 w-full items-center rounded-2xl border bg-card dark:bg-slate-900 px-3 py-2 text-xs font-semibold outline-none transition-all ${
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
                Receipt Attachment Proof
              </label>

              <div className="flex items-center gap-3">
                <label className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 text-xs font-semibold hover:bg-slate-550/5 cursor-pointer shrink-0">
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
                <div className="min-w-0 flex-1">
                  {receiptFileName ? (
                    <span className="text-xs font-bold text-indigo-400 block truncate" title={receiptFileName}>
                      ✓ {receiptFileName}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 block truncate">
                      No receipt attached. Optional but recommended.
                    </span>
                  )}
                </div>
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
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingClaim}
                className="btn-primary rounded-2xl gap-2"
              >
                {submittingClaim ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
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
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedClaim.title}
                  </DialogTitle>
                  <div className="shrink-0">{getStatusBadge(selectedClaim.status)}</div>
                </div>
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
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatInr(selectedClaim.amount)}</span>
                  </div>

                  {selectedClaim.taxPercent > 0 && (
                    <>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">GST Rate</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.taxPercent}%</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Tax Amount</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatInr(selectedClaim.taxAmount)}</span>
                      </div>
                    </>
                  )}

                  {selectedClaim.isMileage && (
                    <>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Distance Travelled</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.distanceKm} Km</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Mileage Rate</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">₹{selectedClaim.mileageRate}/Km</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Total amount header */}
                <div className="flex items-center justify-between bg-primary/10 p-3.5 rounded-2xl">
                  <span className="font-bold text-primary">Claim Total Amount:</span>
                  <span className="font-black text-sm text-primary">
                    {formatInr(selectedClaim.amount + (selectedClaim.isMileage ? 0 : selectedClaim.taxAmount))}
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
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Attached Receipt</span>
                    <a
                      href={selectedClaim.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 font-bold text-indigo-400 hover:bg-indigo-500/15 transition-all"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      View Receipt File
                    </a>
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

              <DialogFooter className="pt-2 border-t border-border/40">
                <Button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-xl"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
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
