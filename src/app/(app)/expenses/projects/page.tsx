"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useExpenseStore } from "@/stores/expense-store";
import { usePlanStore } from "@/stores/plan-store";
import {
  FolderOpen,
  Plus,
  Building,
  FileText,
  DollarSign,
  Briefcase,
  Loader2,
  Lock,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const { currentUser, projects, expenses, initialize, addProject } = useExpenseStore();
  const planStore = usePlanStore();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      await Promise.all([initialize(), planStore.fetchPlan()]);
      setLoading(false);
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthorized = currentUser.role === "Admin" || currentUser.role === "Manager";
  const hasProAccess = planStore.hasProAccess;

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await addProject(name.trim(), clientName.trim(), description.trim());
      
      // Clear Form & Close
      setName("");
      setClientName("");
      setDescription("");
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setDeleting(true);
    const token = sessionStorage.getItem("ansh_auth_token");
    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      await initialize();
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  };

  // Calculations
  const totalProjects = projects.length;
  const uniqueClients = new Set(projects.map(p => p.clientName).filter(Boolean)).size;
  
  // Calculate total costs mapped to any project
  const mappedApprovedClaims = expenses.filter(c => c.status === "Approved" && c.projectId);
  const totalMappedCost = mappedApprovedClaims.reduce((a, b) => a + b.amount, 0);

  // Map each project to its metrics
  const projectsWithMetrics = projects.map(p => {
    const projectClaims = expenses.filter(c => c.projectId === p.id);
    const approvedClaims = projectClaims.filter(c => c.status === "Approved");
    
    const totalClaimsCost = approvedClaims.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingClaimsCost = projectClaims.filter(c => c.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      ...p,
      claimsCount: projectClaims.length,
      approvedCost: totalClaimsCost,
      pendingCost: pendingClaimsCost,
    };
  });

  const formatInr = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
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

        {/* Skeleton Stats Tiles */}
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-1/6 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // local permission checks
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
          This panel is restricted. Only workspace Admins and Managers can configure projects registries.
        </p>
        <Link href="/dashboard" className="mt-6">
          <Button className="btn-primary rounded-xl text-xs font-bold px-4 py-2 border-0 cursor-pointer">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // billing check
  if (!hasProAccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8 select-none animate-in fade-in duration-300">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
          <Lock className="h-9 w-9 text-indigo-400" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Unlock Project Cost Mapping
        </h2>
        <p className="mt-3 max-w-md text-xs leading-relaxed text-slate-450 dark:text-slate-400">
          Map expense claims to client contracts, track project-wise budget totals, and audit team allocations. Upgrade your workspace to Pro to unlock collaborative features.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => planStore.openCheckoutModal()}
            className="btn-primary rounded-xl text-xs font-bold px-6 py-2.5 border-0 cursor-pointer"
          >
            Upgrade Workspace to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Project Mappings | Ansh Expense</title>
      <meta name="description" content="Register project accounts, associate client contracts, track cumulative claim expenses, and audit project-specific cost allocations." />
      <PageHeader
        eyebrow="Cost Center Centers"
        title="Project Cost Mapping"
        description="Register project accounts, client contracts, track cumulative claim expenses, and delete old mappings."
        action={{
          label: "Register Project",
          icon: Plus,
          onClick: () => setOpen(true),
        }}
      />

      {/* STATS TILES */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="crm-card border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspace Projects</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{totalProjects} active</span>
            </div>
            <FolderOpen className="h-8 w-8 text-indigo-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-pink-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Clients</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{uniqueClients} accounts</span>
            </div>
            <Building className="h-8 w-8 text-pink-400 opacity-60" />
          </CardContent>
        </Card>

        <Card className="crm-card border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Project Claims Mapped</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white">{formatInr(totalMappedCost)}</span>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* PROJECTS TABLE */}
      <Card className="crm-card">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Registered Cost Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {projectsWithMetrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FolderOpen className="h-10 w-10 text-slate-350 mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No projects registered</p>
              <p className="text-xs text-slate-400 mt-1">Click the "Register Project" button to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Claims Mapped</th>
                    <th className="px-6 py-4 text-right">Pending Cost</th>
                    <th className="px-6 py-4 text-right">Approved Cost</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {projectsWithMetrics.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <FolderOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                          {p.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                        {p.clientName || <span className="text-slate-400 italic">Internal</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-450 text-xs max-w-xs truncate" title={p.description || ""}>
                        {p.description || <span className="text-slate-400 italic">No description</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-500">{p.claimsCount} claims</td>
                      <td className="px-6 py-4 text-right font-semibold text-amber-500">{formatInr(p.pendingCost)}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-white">
                        {formatInr(p.approvedCost)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingId(p.id)}
                          className="h-8 rounded-lg text-xs font-bold transition-all border-0 shadow-none hover:bg-rose-500/10 hover:text-rose-500 bg-transparent text-slate-400 p-2 cursor-pointer shrink-0"
                          title="Delete Project mapping"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* DIALOG: CREATE NEW PROJECT */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-500" />
              Register Workspace Project
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs font-bold text-rose-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitProject} className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Project Name
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Redesign, internal-rnd"
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Client / Organization
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp, Internal"
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Description / Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the purpose of this project budget mapping code..."
                rows={3}
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
                disabled={submitting}
                className="btn-primary rounded-2xl gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: CONFIRM DELETE */}
      <Dialog open={deletingId !== null} onOpenChange={(o) => !o && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[380px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl text-center select-none">
          <div className="flex justify-center mb-4 text-rose-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <Trash2 className="h-6 w-6" />
            </div>
          </div>
          <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
            Confirm Project Deletion
          </DialogTitle>
          <p className="mt-2 text-xs text-slate-450 leading-relaxed">
            Are you sure you want to delete this project? Existing expense claims mapped to this project will be unassigned (set to None), but historical claims will NOT be deleted.
          </p>

          <DialogFooter className="mt-5 grid grid-cols-2 gap-3 pb-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletingId(null)}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting}
              onClick={() => deletingId && handleDeleteProject(deletingId)}
              className="bg-rose-500 hover:bg-rose-400 text-white font-bold h-11 rounded-2xl border-0 shadow-lg shadow-rose-500/25 cursor-pointer shrink-0"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete Mapping"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
