"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenseStore } from "@/stores/expense-store";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Building2,
  MapPin,
  Plus,
  Trash2,
  ShieldAlert,
  CheckCircle,
  Briefcase,
  X,
  ChevronDown
} from "lucide-react";

interface Designation {
  id: string;
  name: string;
}

export default function WorkspaceSettingPage() {
  const { currentUser, initialize } = useExpenseStore();

  const [departments, setDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [workLocations, setWorkLocations] = useState<string[]>([]);

  // Workspace configuration states
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceCurrency, setWorkspaceCurrency] = useState("USD");
  const [mileageRate, setMileageRate] = useState(8);
  const [wfhAllowed, setWfhAllowed] = useState(true);

  // Form states
  const [newDept, setNewDept] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Page states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isAuthorized =
    currentUser?.role === "Admin" ||
    currentUser?.role === "Manager" ||
    currentUser?.role === "Owner" ||
    currentUser?.role === "HR" ||
    currentUser?.role === "HR Manager";

  const loadWorkspaceData = async () => {
    try {
      await initialize();
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setDepartments(data.settings.departments || []);
          setDesignations(data.settings.designations || []);
          setWorkLocations(data.settings.workLocations || []);
          if (data.settings.workspaceSettings) {
            const ws = data.settings.workspaceSettings;
            setWorkspaceName(ws.name || "");
            setWorkspaceCurrency(ws.currency || "USD");
            setMileageRate(ws.mileageRate ?? 8);
            setWfhAllowed(ws.wfhAllowed ?? true);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load workspace settings data:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast automatic dismiss effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const saveSettings = async (
    updatedData: {
      departments?: string[];
      designations?: Designation[];
      workLocations?: string[];
      workspaceSettings?: {
        name: string;
        currency: string;
        mileageRate: number;
        wfhAllowed: boolean;
      };
    },
    successMessage: string
  ) => {
    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save workspace settings");
      }

      const data = await res.json();
      if (data.settings) {
        setDepartments(data.settings.departments || []);
        setDesignations(data.settings.designations || []);
        setWorkLocations(data.settings.workLocations || []);
        if (data.settings.workspaceSettings) {
          const ws = data.settings.workspaceSettings;
          setWorkspaceName(ws.name || "");
          setWorkspaceCurrency(ws.currency || "USD");
          setMileageRate(ws.mileageRate ?? 8);
          setWfhAllowed(ws.wfhAllowed ?? true);
        }
        setToast({ message: successMessage, type: "success" });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "An error occurred while saving workspace settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspaceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setToast({ message: "Workspace Name is required.", type: "error" });
      return;
    }
    await saveSettings(
      {
        workspaceSettings: {
          name: workspaceName.trim(),
          currency: workspaceCurrency,
          mileageRate: Number(mileageRate),
          wfhAllowed,
        },
      },
      "Universal workspace configuration saved successfully!"
    );
  };

  // Add Handlers
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newDept.trim();
    if (!val) return;
    if (departments.some((d) => d.toLowerCase() === val.toLowerCase())) {
      setToast({ message: `Department "${val}" already exists.`, type: "error" });
      return;
    }
    const updated = [...departments, val];
    setNewDept("");
    await saveSettings({ departments: updated }, `Department "${val}" added successfully!`);
  };

  const handleAddDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newDesignation.trim();
    if (!val) return;
    if (designations.some((d) => d.name.toLowerCase() === val.toLowerCase())) {
      setToast({ message: `Designation "${val}" already exists.`, type: "error" });
      return;
    }
    const updated = [...designations, { id: `des-${Date.now()}`, name: val }];
    setNewDesignation("");
    await saveSettings({ designations: updated }, `Designation "${val}" added successfully!`);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newLocation.trim();
    if (!val) return;
    if (workLocations.some((l) => l.toLowerCase() === val.toLowerCase())) {
      setToast({ message: `Work location "${val}" already exists.`, type: "error" });
      return;
    }
    const updated = [...workLocations, val];
    setNewLocation("");
    await saveSettings({ workLocations: updated }, `Work location "${val}" added successfully!`);
  };

  // Delete Handlers
  const handleDeleteDept = async (deptName: string) => {
    const updated = departments.filter((d) => d !== deptName);
    await saveSettings({ departments: updated }, `Department "${deptName}" removed.`);
  };

  const handleDeleteDesignation = async (id: string, name: string) => {
    const updated = designations.filter((d) => d.id !== id);
    await saveSettings({ designations: updated }, `Designation "${name}" removed.`);
  };

  const handleDeleteLocation = async (locName: string) => {
    const updated = workLocations.filter((l) => l !== locName);
    await saveSettings({ workLocations: updated }, `Work location "${locName}" removed.`);
  };

  if (fetching) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-70">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative min-h-[80vh]">
      <title>Workspace Settings | Ansh Expense</title>
      <meta
        name="description"
        content="Manage your workspace directories, including department options, job designations, and work locations."
      />
      <PageHeader
        eyebrow="Organization Settings"
        title="Workspace Settings"
        description="Configure your workspace registries, active departments, employee designations, and work locations options."
      />

      {!isAuthorized && (
        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs font-bold text-amber-500 flex items-center gap-2 max-w-xl">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0" />
          Only Administrators, Managers, HR, and Owners can modify workspace options.
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* UNIVERSAL CURRENCY CARD */}
        <Card className="crm-card h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-primary" />
              Universal Currency Settings
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-400">
              Configure default corporate currency for all team members, ledger registry totals, and analytics dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col justify-between min-h-0">
            <form onSubmit={handleSaveWorkspaceSettings} className="space-y-4 text-xs text-left flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Universal Default Currency
                </label>
                <div className="relative">
                  <select
                    disabled={!isAuthorized || loading}
                    value={workspaceCurrency}
                    onChange={(e) => setWorkspaceCurrency(e.target.value)}
                    className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-4 pr-10 py-3 text-xs font-semibold outline-none hover:bg-slate-50/50 cursor-pointer appearance-none disabled:opacity-60"
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
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  * Foreign claims logged in other currencies will be automatically converted to this workspace default.
                </p>
              </div>

              {isAuthorized && (
                <div className="pt-2 shrink-0">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full font-black text-xs uppercase tracking-wider h-11 px-8 rounded-2xl border-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin animate-pulse" />
                        Saving Currency...
                      </>
                    ) : (
                      "Save Universal Currency"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* DEPARTMENT CARD */}
        <Card className="crm-card h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-primary" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col min-h-0">
            {isAuthorized && (
              <form onSubmit={handleAddDept} className="flex gap-2 shrink-0">
                <Input
                  type="text"
                  required
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Sales, Operations"
                  className="h-10 text-xs rounded-xl"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !newDept.trim()}
                  className="h-10 px-4 rounded-xl btn-primary border-0 font-bold text-xs shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <div
                    key={dept}
                    className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/40 border border-border/40 rounded-xl"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {dept}
                    </span>
                    {isAuthorized && (
                      <button
                        onClick={() => handleDeleteDept(dept)}
                        disabled={loading}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer shrink-0"
                        title={`Delete ${dept}`}
                      >
                        <Trash2 className="h-3.8 w-3.8" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center py-8">
                  <p className="text-xs text-slate-400 italic text-center">No departments found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* DESIGNATION CARD */}
        <Card className="crm-card h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-primary" />
              Designations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col min-h-0">
            {isAuthorized && (
              <form onSubmit={handleAddDesignation} className="flex gap-2 shrink-0">
                <Input
                  type="text"
                  required
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="e.g. Project Manager"
                  className="h-10 text-xs rounded-xl"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !newDesignation.trim()}
                  className="h-10 px-4 rounded-xl btn-primary border-0 font-bold text-xs shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {designations.length > 0 ? (
                designations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-905 border border-border/40 rounded-xl"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {d.name}
                    </span>
                    {isAuthorized && (
                      <button
                        onClick={() => handleDeleteDesignation(d.id, d.name)}
                        disabled={loading}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer shrink-0"
                        title={`Delete ${d.name}`}
                      >
                        <Trash2 className="h-3.8 w-3.8" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center py-8">
                  <p className="text-xs text-slate-400 italic text-center">No designations found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WORK LOCATION CARD */}
        <Card className="crm-card h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" />
              Work Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-1 flex flex-col min-h-0">
            {isAuthorized && (
              <form onSubmit={handleAddLocation} className="flex gap-2 shrink-0">
                <Input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Hybrid, WFH"
                  className="h-10 text-xs rounded-xl"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !newLocation.trim()}
                  className="h-10 px-4 rounded-xl btn-primary border-0 font-bold text-xs shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {workLocations.length > 0 ? (
                workLocations.map((loc) => (
                  <div
                    key={loc}
                    className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-905 border border-border/40 rounded-xl"
                  >
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {loc}
                    </span>
                    {isAuthorized && (
                      <button
                        onClick={() => handleDeleteLocation(loc)}
                        disabled={loading}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer shrink-0"
                        title={`Delete ${loc}`}
                      >
                        <Trash2 className="h-3.8 w-3.8" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center py-8">
                  <p className="text-xs text-slate-400 italic text-center">No locations found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Toast Notification overlay */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300",
          toast.type === "success" ? "border-emerald-550/20 bg-card/90" : "border-rose-550/20 bg-card/90"
        )}>
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              {toast.type === "success" ? "Success" : "Error"}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-slate-400 hover:text-slate-650 cursor-pointer bg-transparent border-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
