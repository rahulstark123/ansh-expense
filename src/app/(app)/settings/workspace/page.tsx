"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Loader2,
  Settings,
  Coins,
  Globe,
  CheckCircle,
  ShieldAlert,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export default function WorkspaceSettingPage() {
  const { currentUser, initialize } = useExpenseStore();
  const isAuthorized =
    currentUser?.role === "Admin" ||
    currentUser?.role === "Manager" ||
    currentUser?.role === "Owner" ||
    currentUser?.role === "HR Manager";

  const [workspaceName, setWorkspaceName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [mileageRate, setMileageRate] = useState<number>(8);
  const [wfhAllowed, setWfhAllowed] = useState(true);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadWorkspaceSettings = async () => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings?.workspaceSettings) {
          const ws = data.settings.workspaceSettings;
          setWorkspaceName(ws.name || "");
          setCurrency(ws.currency || "USD");
          setMileageRate(ws.mileageRate ?? 8);
          setWfhAllowed(ws.wfhAllowed ?? true);
        }
      }
    } catch (error) {
      console.error("Failed to load workspace settings:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadWorkspaceSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isAuthorized) {
      setErrorMsg("You do not have permission to edit workspace settings.");
      return;
    }

    if (!workspaceName.trim()) {
      setErrorMsg("Workspace Name is required.");
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
          workspaceSettings: {
            name: workspaceName.trim(),
            currency,
            mileageRate,
            wfhAllowed,
          }
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save workspace settings");
      }

      await initialize();
      setSuccessMsg("Workspace configuration updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while saving workspace settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <Card className="crm-card border border-border/40 opacity-70">
          <CardContent className="p-6 space-y-6">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Workspace Settings | Ansh Expense</title>
      <meta
        name="description"
        content="Manage workspace defaults, currency formats, mileage rate logs, and global policies."
      />
      <PageHeader
        eyebrow="System Administration"
        title="Workspace Settings"
        description="Configure your workspace's default currency formats, mileage conversion rates, and global remote policies."
      />

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-450 dark:text-emerald-400 flex items-center gap-2 max-w-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-4 w-4 text-emerald-450 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-450 dark:text-rose-405 max-w-xl animate-in fade-in slide-in-from-top-2">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="crm-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-primary" />
              Global Workspace Configurations
            </CardTitle>
            <CardDescription className="text-xs text-slate-450">
              Set policies and system defaults used across the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAuthorized && (
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs font-bold text-amber-500 mb-6 flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
                Only Workspace Administrators can modify system configuration profiles.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* WORKSPACE NAME */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAuthorized}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. My Global Workspace"
                  className="mt-2 block w-full rounded-2xl border border-border bg-transparent px-4 py-3.5 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              {/* DEFAULT CURRENCY */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Default Currency Code
                  </label>
                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                    <Globe className="h-3 w-3 text-slate-400" /> Used for new claims fallback
                  </span>
                </div>
                <div className="mt-2 relative">
                  <select
                    disabled={!isAuthorized}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-4 pr-10 py-3.5 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer appearance-none"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="SGD">SGD ($) - Singapore Dollar</option>
                    <option value="AED">AED (د.إ) - UAE Dirham</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* DEFAULT MILEAGE RATE */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Default Mileage Reimbursement Rate (per Unit)
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Coins className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    disabled={!isAuthorized}
                    value={mileageRate}
                    onChange={(e) => setMileageRate(Number(e.target.value))}
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* GLOBAL WFH POLICY */}
              <div className="flex items-center justify-between p-4 bg-slate-500/5 dark:bg-slate-900/50 rounded-2xl border border-border/40">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Allow Remote Office Check-ins
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Permits employees to submit punch-in reports outside branch physical bounds.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isAuthorized}
                    checked={wfhAllowed}
                    onChange={(e) => setWfhAllowed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {isAuthorized && (
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-11 px-6 rounded-2xl font-black gap-2 border-0 cursor-pointer w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Workspace Defaults"
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sidebar Help Card */}
        <Card className="crm-card h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              Global Settings Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <p>
              These defaults are applied automatically when regular teammates log their business expense claims.
            </p>
            <p>
              Setting a default currency ensures regular users have pre-selected inputs, while downscale geolocations detect user IPs for travel claims.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
