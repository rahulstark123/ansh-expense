"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useExpenseStore, type ExpenseClaim, type ClaimStatus } from "@/stores/expense-store";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FolderOpen,
  Paperclip,
  Loader2,
  Send,
  ShieldAlert,
  User,
  Search,
  Check,
  Filter,
  ChevronDown,
} from "lucide-react";

export default function ApprovalsPage() {
  const { currentUser, expenses, employees, projects, initialize, updateExpenseStatus, addComment } = useExpenseStore();

  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);

  // Manager action state
  const [actionReason, setActionReason] = useState("");
  const [actingStatus, setActingStatus] = useState<ClaimStatus | null>(null);
  const [actionError, setActionError] = useState("");
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");

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
            setWorkspaceCurrency(data.settings.workspaceSettings.currency || "USD");
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  // Review comment state
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Filters State
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Pending"); // Default to pending reviews
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const run = async () => {
      await initialize();
      setLoading(false);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check Role Authorization
  const isAuthorized = currentUser.role === "Admin" || currentUser.role === "Manager" || currentUser.role === "Owner";

  // Handle Approve/Reject/NeedsInfo
  const handleStatusUpdate = async (status: ClaimStatus) => {
    if (!selectedClaim) return;
    setActionError("");

    if ((status === "Rejected" || status === "NeedsInfo") && !actionReason.trim()) {
      setActionError(`Please provide a reason or comment for marking this claim as ${status}.`);
      return;
    }

    try {
      await updateExpenseStatus(selectedClaim.id, status, actionReason.trim());
      
      // Post comment automatically summarizing the action
      const commentContent = `Marked claim as ${status}.${actionReason.trim() ? ` Note: ${actionReason.trim()}` : ""}`;
      await addComment(selectedClaim.id, commentContent);
      
      setActionReason("");
      setDetailOpen(false);
      setSelectedClaim(null);
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || "Failed to update claim status.");
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
  const filteredClaims = expenses.filter(c => {
    const matchEmp = employeeFilter === "All" || c.employeeName === employeeFilter;
    const matchCat = categoryFilter === "All" || 
      c.category === categoryFilter ||
      (categoryFilter === "Other" && c.category.startsWith("Other"));
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchEmp && matchCat && matchStatus;
  });

  // Derived Stats
  const pendingCount = expenses.filter(c => c.status === "Pending").length;
  const needsInfoCount = expenses.filter(c => c.status === "NeedsInfo").length;
  const approvedThisMonth = expenses.filter(c => c.status === "Approved").reduce((a, b) => a + b.amount, 0);

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
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Skeleton Stats Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-70">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
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
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/6 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
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

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8 select-none animate-in fade-in duration-300">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl shadow-rose-500/5">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Manager Access Required
        </h2>
        <p className="mt-3 max-w-sm text-xs leading-relaxed text-slate-400">
          This approval pipeline and expense audits interface are locked. Only workspace Admins and Managers can review submitted claims.
        </p>
        <Link href="/dashboard" className="mt-6">
          <Button className="btn-primary rounded-xl text-xs font-bold px-4 py-2 border-0 cursor-pointer">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Workspace Approvals | Ansh Expense</title>
      <meta name="description" content="Review, audit, approve, or reject workspace expense reimbursement submissions and manage review pipelines." />
      <PageHeader
        eyebrow="Review Pipelines"
        title="Workspace Approvals"
        description="Verify team claims, audit mileage logs, reject outliers, or flag entries requesting clarification."
        toolbar={
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer shadow-sm relative"
            >
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Filters</span>
              {(employeeFilter !== "All" || categoryFilter !== "All" || statusFilter !== "Pending") && (
                <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-200">
                  {
                    [employeeFilter !== "All", categoryFilter !== "All", statusFilter !== "Pending"].filter(Boolean).length
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
                      Filter Approvals
                    </span>
                    {(employeeFilter !== "All" || categoryFilter !== "All" || statusFilter !== "Pending") && (
                      <button
                        onClick={() => {
                          setEmployeeFilter("All");
                          setCategoryFilter("All");
                          setStatusFilter("Pending");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>

                  {/* Employee Filter */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Employee
                    </label>
                    <div className="relative">
                      <select
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Employees</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Categories</option>
                        {["Travel", "Meals", "Software", "Office Supplies", "Other"].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                        className="flex h-10 w-full items-center rounded-xl border border-border bg-card dark:bg-slate-900 pl-3.5 pr-9 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none hover:bg-slate-50/50 cursor-pointer appearance-none"
                      >
                        <option value="All">All Statuses</option>
                        {["Pending", "Approved", "Rejected", "NeedsInfo"].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />

      {/* PIPELINE STATS */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="crm-card border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Reviews</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{pendingCount} claims</span>
            </div>
            <Clock className="h-8 w-8 text-indigo-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Awaiting Info / Query</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{needsInfoCount} claims</span>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Approved Payouts</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{formatInr(approvedThisMonth)}</span>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* AUDIT LIST CARD */}
      <Card className="crm-card">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Workspace Claims Review Log ({filteredClaims.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle className="h-10 w-10 text-slate-350 mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Clean pipeline</p>
              <p className="text-xs text-slate-400 mt-1">No claims match the active status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Claim Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Tax Details</th>
                    <th className="px-6 py-4">Logged Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {claim.avatarInitials}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 dark:text-white leading-tight">{claim.employeeName}</span>
                            <span className="block text-[10px] text-slate-400 uppercase tracking-wide font-bold">{claim.employeeRole}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-slate-800 dark:text-white">{claim.title}</span>
                        {claim.isMileage && (
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            {claim.distanceKm} Km @ ₹{claim.mileageRate}/Km
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{claim.category}</td>
                      <td className="px-6 py-4">
                        {claim.projectName ? (
                          <span className="flex items-center gap-1 font-bold text-indigo-400">
                            <FolderOpen className="h-3.5 w-3.5" />
                            {claim.projectName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-450 dark:text-slate-400">
                        {claim.taxPercent > 0 ? (
                          <span>{claim.taxPercent}% ({formatCurrency(claim.taxAmount, claim.currency || "USD")})</span>
                        ) : (
                          <span className="text-slate-455 italic">0%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 dark:text-white">
                        {formatCurrency(claim.amount, claim.currency || "USD")}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setDetailOpen(true);
                          }}
                          className="h-8 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Audit & Review
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

      {/* DIALOG: AUDIT DETAILS, COMMENTS & ACTION INPUTS */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[550px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[95dvh]">
          {selectedClaim && (
            <>
              <DialogHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {selectedClaim.title}
                    </DialogTitle>
                    <span className="text-[10px] text-slate-450 mt-1 block">Logged by {selectedClaim.employeeName}</span>
                  </div>
                  <div className="shrink-0">{getStatusBadge(selectedClaim.status)}</div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-4 text-xs">
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-550/5 p-4 rounded-2xl border border-border/30">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Category</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.category}</span>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Submission Date</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {new Date(selectedClaim.appliedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Project Mapping</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {selectedClaim.projectName || "Unassigned"}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Base Amount</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(selectedClaim.amount, selectedClaim.currency || "USD")}</span>
                  </div>

                  {selectedClaim.taxPercent > 0 && (
                    <>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">GST Rate</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.taxPercent}%</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Tax Amount</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(selectedClaim.taxAmount, selectedClaim.currency || "USD")}</span>
                      </div>
                    </>
                  )}

                  {selectedClaim.isMileage && (
                    <>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Distance Travelled</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{selectedClaim.distanceKm} Km/Miles</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-450 mb-0.5">Mileage Rate</span>
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
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Submitting Notes / Reason</span>
                  <p className="p-3 bg-card border border-border rounded-xl text-slate-650 dark:text-slate-350 leading-relaxed">
                    {selectedClaim.reason || "No description provided."}
                  </p>
                </div>

                {/* Receipt attachment link */}
                {selectedClaim.receiptUrl && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-1.5">Attached Receipts</span>
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

                {/* Action Form for Reviews */}
                {selectedClaim.status === "Pending" && (
                  <div className="border-t border-border/40 pt-4 space-y-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-450">Review Actions Pipeline</span>
                    
                    {actionError && (
                      <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] font-bold text-rose-400">
                        {actionError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-450">
                        Review Notes / Explanation (Required for Rejections/NeedsInfo)
                      </label>
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Write a reason for approving, rejecting or requesting details..."
                        rows={2}
                        className="block w-full rounded-xl border border-border bg-card dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        onClick={() => handleStatusUpdate("Approved")}
                        className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs h-10 rounded-xl border-0 cursor-pointer"
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleStatusUpdate("NeedsInfo")}
                        className="bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-xs h-10 rounded-xl border-0 cursor-pointer"
                      >
                        Needs Info
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleStatusUpdate("Rejected")}
                        className="bg-rose-500 hover:bg-rose-450 text-slate-950 font-bold text-xs h-10 rounded-xl border-0 cursor-pointer"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* COMMENTS SECTION */}
                <div className="border-t border-border/40 pt-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 mb-2.5">Review Notes / Comments ({selectedClaim.comments.length})</span>
                  
                  {/* Comments list */}
                  <div className="space-y-2.5 max-h-36 overflow-y-auto mb-3 pr-1">
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
                      <p className="text-[10px] text-slate-450 italic text-center py-3">No comments posted yet.</p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Post a reply or follow-up note..."
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
                  className="h-11 px-6 rounded-xl font-bold"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
