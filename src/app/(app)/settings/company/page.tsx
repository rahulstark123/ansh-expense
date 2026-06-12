"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import { Loader2, Building, MapPin, Users, CheckCircle, ShieldAlert } from "lucide-react";

export default function CompanySettingPage() {
  const { currentUser, initialize } = useExpenseStore();

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [employeeCount, setEmployeeCount] = useState("1-10");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthorized = currentUser?.role === "Admin" || currentUser?.role === "Manager";

  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Failed to load company data:", error);
      } finally {
        setFetching(false);
      }
    };
    loadCompanyData();
  }, [initialize]);

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
          }
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

  if (fetching) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Loading company settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Company Profile Settings | Ansh Expense</title>
      <meta
        name="description"
        content="Manage your company's organizational profile, headquarter address, employee count, and organizational settings on Ansh Expense."
      />
      <PageHeader
        eyebrow="Organization Settings"
        title="Company Setting"
        description="Configure your organization's legal identity, headquarters address, and employee headcount parameters."
      />

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2 max-w-xl">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-400 max-w-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Organization Identity */}
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={!isAuthorized}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ANSH Solutions"
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* EMPLOYEE SIZE */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Company Employee Size
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <select
                    disabled={!isAuthorized}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed appearance-none cursor-pointer"
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
                  <div className="absolute top-3.5 left-3.5 text-slate-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    required
                    disabled={!isAuthorized}
                    rows={3}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. 123 Business Park, Mumbai, India"
                    className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3.5 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                  />
                </div>
              </div>

              {isAuthorized && (
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full md:w-auto font-bold text-xs uppercase tracking-wider h-11 px-8 rounded-2xl"
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
      </div>
    </div>
  );
}
