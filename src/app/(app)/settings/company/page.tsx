"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Building,
  MapPin,
  Users,
  CheckCircle,
  ShieldAlert,
  Plus,
  Trash2,
  Lock,
  Archive,
  Home
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  allowWFH: boolean;
}

export default function CompanySettingPage() {
  const { currentUser, initialize, employees } = useExpenseStore();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [employeeCount, setEmployeeCount] = useState("1-10");
  const [branches, setBranches] = useState<Branch[]>([]);

  // Page states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Branch Modal states
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchState, setBranchState] = useState("");
  const [branchPincode, setBranchPincode] = useState("");
  const [branchAllowWfh, setBranchAllowWfh] = useState(true);
  const [branchError, setBranchError] = useState("");

  // Branch delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const isAuthorized = currentUser?.role === "Admin" || currentUser?.role === "Manager";

  const loadCompanyData = async () => {
    try {
      await initialize();
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.companyProfile) {
          const profile = data.settings.companyProfile;
          setCompanyName(profile.name || "");
          setCompanyAddress(profile.address || "");
          setEmployeeCount(profile.employeeCount || "1-10");
        }
        if (data.settings?.branches) {
          setBranches(data.settings.branches);
        }
      }
    } catch (error) {
      console.error("Failed to load company data:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isAuthorized) {
      setErrorMsg("You do not have permission to edit company settings.");
      return;
    }

    if (!companyName.trim()) {
      setErrorMsg("Company Name is required.");
      return;
    }

    if (!companyAddress.trim()) {
      setErrorMsg("Company Address is required.");
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyProfile: {
            name: companyName.trim(),
            address: companyAddress.trim(),
            employeeCount,
          },
          branches // Save branches registry as well
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save company settings profile");
      }

      await initialize();
      setSuccessMsg("Company settings profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while saving company settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError("");

    if (!branchName.trim() || !branchAddress.trim() || !branchCity.trim() || !branchState.trim() || !branchPincode.trim()) {
      setBranchError("All required fields (*) must be filled.");
      return;
    }

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name: branchName.trim(),
      address: branchAddress.trim(),
      city: branchCity.trim(),
      state: branchState.trim(),
      pincode: branchPincode.trim(),
      allowWFH: branchAllowWfh,
    };

    const updatedBranches = [...branches, newBranch];
    
    // Save updated branches list directly to API
    setLoading(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branches: updatedBranches
        }),
      });

      if (!res.ok) throw new Error("Failed to save branch");

      setBranches(updatedBranches);
      setBranchModalOpen(false);
      
      // Reset form
      setBranchName("");
      setBranchAddress("");
      setBranchCity("");
      setBranchState("");
      setBranchPincode("");
      setBranchAllowWfh(true);
      
      setSuccessMsg("New office branch registered successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setBranchError("Failed to save the branch on the server.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteBranch = (branch: Branch) => {
    if (branches.length <= 1) {
      setErrorMsg("You must keep at least one office branch registered.");
      setTimeout(() => setErrorMsg(""), 4000);
      return;
    }
    setBranchToDelete(branch);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    setLoading(true);

    const updatedBranches = branches.filter((b) => b.id !== branchToDelete.id);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branches: updatedBranches
        }),
      });

      if (!res.ok) throw new Error("Failed to delete branch");

      setBranches(updatedBranches);
      setDeleteConfirmOpen(false);
      setBranchToDelete(null);
      setSuccessMsg("Office branch removed successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete branch from server settings.");
    } finally {
      setLoading(false);
    }
  };

  const getBranchHeadcount = (branchName: string) => {
    return employees.filter((emp) => emp.branch?.toLowerCase() === branchName.toLowerCase()).length;
  };

  if (fetching) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Header */}
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="crm-card lg:col-span-2 border border-border/40 opacity-70">
            <CardContent className="p-6 space-y-6">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="space-y-4">
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="crm-card border border-border/40 opacity-70">
            <CardContent className="p-6 space-y-4">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="space-y-3">
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Company Profile Settings | Ansh Expense</title>
      <meta
        name="description"
        content="Manage your company's organizational profile, headquarter address, employee count, and office branches registry."
      />
      <PageHeader
        eyebrow="Organization Settings"
        title="Company Settings"
        description="Configure your organization's legal identity, headquarters address, and office branches parameter registries."
      />

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-450 dark:text-emerald-400 flex items-center gap-2 max-w-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-450 dark:text-rose-405 max-w-xl animate-in fade-in slide-in-from-top-2">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Organization Identity Form */}
        <Card className="crm-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-primary" />
              Organization Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isAuthorized && (
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs font-bold text-amber-500 mb-6 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
                Only Administrators and Managers can edit company configuration details.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* COMPANY NAME */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Company Name
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={!isAuthorized}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ANSH Solutions"
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* EMPLOYEE SIZE */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Company Employee Size
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                    <Users className="h-4 w-4" />
                  </div>
                  <select
                    disabled={!isAuthorized}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-4 py-3.5 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="1-10">1 - 10 employees</option>
                    <option value="11-50">11 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                </div>
              </div>

              {/* COMPANY ADDRESS */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Headquarters Address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute top-3.5 left-3.5 text-slate-555">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    required
                    disabled={!isAuthorized}
                    rows={3}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. 123 Business Park, Mumbai, India"
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-xs font-medium text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed resize-none leading-relaxed"
                  />
                </div>
              </div>

              {isAuthorized && (
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full md:w-auto font-black text-xs uppercase tracking-wider h-11 px-8 rounded-2xl border-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      "Save Company Details"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Office Branches Settings Card */}
        <Card className="crm-card">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Home className="h-4.5 w-4.5 text-primary" />
                Office Branches
              </CardTitle>
              {isAuthorized && (
                <Button
                  onClick={() => {
                    setBranchError("");
                    setBranchModalOpen(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="h-8 text-[11px] font-bold gap-1 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Branch
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <div className="divide-y divide-border/40 px-6">
              {branches.length > 0 ? (
                branches.map((b) => {
                  const headcount = getBranchHeadcount(b.name);
                  return (
                    <div key={b.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 text-left space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                            {b.name}
                          </span>
                          {b.allowWFH ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 hover:bg-emerald-500/10">
                              WFH OK
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/10 text-rose-600 border-0 text-[8px] font-black uppercase tracking-wider h-4 hover:bg-rose-500/10">
                              No WFH
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 font-medium truncate max-w-[200px]" title={b.address}>
                          {b.address}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {headcount} {headcount === 1 ? "teammate" : "teammates"} mapped
                        </span>
                      </div>

                      {isAuthorized && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDeleteBranch(b)}
                          className="h-8 rounded-lg text-xs font-bold transition-all border-0 shadow-none hover:bg-rose-500/10 hover:text-rose-500 bg-transparent text-slate-400 p-2 cursor-pointer shrink-0"
                          title="Delete branch mapping"
                        >
                          <Trash2 className="h-3.8 w-3.8" />
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 italic">No office branch accounts registered.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL: ADD BRANCH */}
      <Dialog open={branchModalOpen} onOpenChange={setBranchModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-500" />
              Register Office Branch
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Configure a physical office location parameters for attendance checks.
            </DialogDescription>
          </DialogHeader>

          {branchError && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs font-bold text-rose-400">
              {branchError}
            </div>
          )}

          <form onSubmit={handleAddBranch} className="space-y-4 pt-4 text-xs text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Branch Name *
              </label>
              <Input
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Mumbai HQ, Bengaluru Tech Park"
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Detailed Address *
              </label>
              <textarea
                required
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                placeholder="Full address of the branch..."
                rows={2}
                className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  City *
                </label>
                <Input
                  required
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  State *
                </label>
                <Input
                  required
                  value={branchState}
                  onChange={(e) => setBranchState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Pincode *
              </label>
              <Input
                required
                value={branchPincode}
                onChange={(e) => setBranchPincode(e.target.value)}
                placeholder="e.g. 400001"
                className="h-11 rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="wfh-chk"
                checked={branchAllowWfh}
                onChange={(e) => setBranchAllowWfh(e.target.checked)}
                className="h-4 w-4 rounded border-slate-350 accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="wfh-chk" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                Allow WFH (Work From Home) for teammates at this branch
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBranchModalOpen(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-2xl gap-2 border-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Branch"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              Remove Office Branch?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-450 leading-relaxed mt-1 text-left">
              Are you sure you want to remove the branch "{branchToDelete?.name}"? Teammates associated with this branch will still exist but their branch mapping will be reset.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBranch}
              disabled={loading}
              className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-2 border-0 w-full sm:w-auto cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Branch"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
