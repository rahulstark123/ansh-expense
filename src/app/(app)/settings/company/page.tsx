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
  Home,
  ChevronDown,
  Briefcase,
  Globe,
  Mail,
  Phone,
  FileText,
  Calendar,
  Hash,
  Pencil
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
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [companyEntityType, setCompanyEntityType] = useState("Private Limited");
  const [companyIncorporationDate, setCompanyIncorporationDate] = useState("");
  const [companyDunsNumber, setCompanyDunsNumber] = useState("");
  const [companyFiscalYearStart, setCompanyFiscalYearStart] = useState("April");
  const [companyRegisteredAddress, setCompanyRegisteredAddress] = useState("");
  const [sameAsHq, setSameAsHq] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

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

  const isAuthorized =
    currentUser?.role === "Admin" ||
    currentUser?.role === "Manager" ||
    currentUser?.role === "Owner" ||
    currentUser?.role === "HR Manager" ||
    currentUser?.role === "HR";

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
          setCompanyIndustry(profile.industry || "");
          setCompanyTaxId(profile.taxId || "");
          setCompanyWebsite(profile.website || "");
          setCompanyEmail(profile.email || "");
          setCompanyPhone(profile.phone || "");
          setCompanyLegalName(profile.legalName || "");
          setCompanyEntityType(profile.entityType || "Private Limited");
          setCompanyIncorporationDate(profile.incorporationDate || "");
          setCompanyDunsNumber(profile.dunsNumber || "");
          setCompanyFiscalYearStart(profile.fiscalYearStart || "April");
          setCompanyRegisteredAddress(profile.registeredAddress || "");
          setSameAsHq(profile.sameAsHq ?? false);
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
            industry: companyIndustry.trim(),
            taxId: companyTaxId.trim(),
            website: companyWebsite.trim(),
            email: companyEmail.trim(),
            phone: companyPhone.trim(),
            legalName: companyLegalName.trim(),
            entityType: companyEntityType,
            incorporationDate: companyIncorporationDate.trim(),
            dunsNumber: companyDunsNumber.trim(),
            fiscalYearStart: companyFiscalYearStart,
            registeredAddress: sameAsHq ? companyAddress.trim() : companyRegisteredAddress.trim(),
            sameAsHq,
          },
          branches // Save branches registry as well
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save company settings profile");
      }

      await initialize();
      setCompanyModalOpen(false);
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
        {/* Read-Only Organization Identity Card */}
        <Card className="crm-card lg:col-span-2">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-primary" />
              Organization Identity
            </CardTitle>
             {isAuthorized && (
              <Button
                onClick={() => setCompanyModalOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 text-[11px] font-bold gap-1 rounded-xl cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {!isAuthorized && (
              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs font-bold text-amber-550 mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-550" />
                Only Administrators, Managers, HR, and Owners can edit company configuration details.
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Corporate Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  Basic Corporate Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Company Name (Display)</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyName || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Legal Registered Name</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyLegalName || "N/A"}</span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Legal Entity Type</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyEntityType || "Private Limited"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Industry / Sector</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyIndustry || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Employee Size</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{employeeCount || "1-10"}</span>
                  </div>
                </div>
              </div>

              {/* Compliance & Legal Credentials */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Compliance & Legal Credentials
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Tax ID / Registration Number</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyTaxId || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">DUNS Number</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyDunsNumber || "N/A"}</span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Date of Incorporation</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyIncorporationDate || "Not specified"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Fiscal Year Cycle Start Month</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyFiscalYearStart || "April"}</span>
                  </div>
                </div>
              </div>

              {/* Primary Contact Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Primary Contact Info
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Company Website</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block truncate" title={companyWebsite}>{companyWebsite || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Contact Email</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block truncate" title={companyEmail}>{companyEmail || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Contact Phone</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{companyPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Locations */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Corporate Locations
                </h4>
                <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Headquarters Address</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1.5 block leading-relaxed">{companyAddress || "N/A"}</span>
                </div>
                <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Registered Office Address</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1.5 block leading-relaxed">
                    {sameAsHq ? "Same as Headquarters Address" : (companyRegisteredAddress || "N/A")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIALOG MODAL: EDIT COMPANY PROFILE */}
        <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
          <DialogContent className="sm:max-w-[700px] w-[90vw] max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
            <DialogHeader className="pb-3 border-b border-border/40">
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-550" />
                Edit Company Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Update your organization's legal identity parameters, tax attributes, contact details, and locations.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-6 pt-4 text-xs text-left">
              {/* SECTION 1: BASIC DETAILS */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/30 pb-2 mb-4 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  Basic Corporate Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* COMPANY NAME */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Company Name (Display)
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. ANSH Solutions"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>

                  {/* LEGAL/REGISTERED NAME */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Legal Registered Name
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={companyLegalName}
                        onChange={(e) => setCompanyLegalName(e.target.value)}
                        placeholder="e.g. ANSH Technologies Private Limited"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* ENTITY TYPE */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Legal Entity Type
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                        <Building className="h-4 w-4" />
                      </div>
                      <select
                        value={companyEntityType}
                        onChange={(e) => setCompanyEntityType(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 cursor-pointer appearance-none h-11"
                      >
                        <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                        <option value="Public Limited">Public Limited (Ltd)</option>
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Corporation">C-Corp / S-Corp</option>
                        <option value="Partnership">Partnership Firm</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Non-Profit">Non-Profit / NGO</option>
                        <option value="Other">Other Entity Type</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* INDUSTRY TYPE */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Industry Type / Sector
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={companyIndustry}
                        onChange={(e) => setCompanyIndustry(e.target.value)}
                        placeholder="e.g. Technology, Retail, Finance"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
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
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 cursor-pointer appearance-none h-11"
                      >
                        <option value="1-10">1 - 10 employees</option>
                        <option value="11-50">11 - 50 employees</option>
                        <option value="51-200">51 - 200 employees</option>
                        <option value="200+">200+ employees</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: REGISTRATION & COMPLIANCE */}
              <div className="pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/30 pb-2 mb-4 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Compliance & Legal Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TAX ID / REGISTRATION NUMBER */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Tax ID / Registration Number
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <FileText className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={companyTaxId}
                        onChange={(e) => setCompanyTaxId(e.target.value)}
                        placeholder="e.g. GSTIN / EIN / VAT Number"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>

                  {/* DUNS NUMBER */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      DUNS Number (9-Digit Business ID)
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Hash className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={9}
                        value={companyDunsNumber}
                        onChange={(e) => setCompanyDunsNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456789"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* DATE OF INCORPORATION */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Incorporation / Founded Date
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        value={companyIncorporationDate}
                        onChange={(e) => setCompanyIncorporationDate(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11 [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* FISCAL YEAR START MONTH */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Fiscal Year Cycle Start Month
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <select
                        value={companyFiscalYearStart}
                        onChange={(e) => setCompanyFiscalYearStart(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 cursor-pointer appearance-none h-11"
                      >
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April (Standard India/UK)</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: CONTACT INFORMATION */}
              <div className="pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/30 pb-2 mb-4 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Primary Contact Info
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* WEBSITE URL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Company Website
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. www.anshsolutions.com"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>

                  {/* PRIMARY CONTACT EMAIL */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Contact Email
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="e.g. contact@company.com"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>

                  {/* PRIMARY CONTACT PHONE */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Contact Phone
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                        <Phone className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: OFFICE ADDRESSES */}
              <div className="pt-2 pb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-border/30 pb-2 mb-4 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Corporate Locations
                </h4>
                
                {/* HEADQUARTERS ADDRESS */}
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
                      rows={2}
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="e.g. 123 Business Park, Mumbai, India"
                      className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-medium text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* REGISTERED ADDRESS */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Registered / Legal Office Address
                    </label>
                    <div className="flex items-center gap-1.5 select-none">
                      <input
                        type="checkbox"
                        id="same-hq-chk"
                        checked={sameAsHq}
                        onChange={(e) => setSameAsHq(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-350 accent-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="same-hq-chk" className="text-[10px] font-bold text-slate-500 cursor-pointer select-none">
                        Same as Headquarters Address
                      </label>
                    </div>
                  </div>
                  <div className="mt-2 relative">
                    <div className="absolute top-3.5 left-3.5 text-slate-555">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <textarea
                      required={!sameAsHq}
                      disabled={sameAsHq}
                      rows={2}
                      value={sameAsHq ? companyAddress : companyRegisteredAddress}
                      onChange={(e) => setCompanyRegisteredAddress(e.target.value)}
                      placeholder={sameAsHq ? "Same as HQ Address" : "Registered/Legal address for compliance filings..."}
                      className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-medium text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/40 gap-2 flex flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCompanyModalOpen(false)}
                  className="h-11 px-6 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary h-11 px-6 rounded-2xl font-black gap-2 border-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                className="h-11 px-6 rounded-2xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary h-11 px-6 rounded-2xl font-black gap-2 border-0 cursor-pointer"
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
              className="h-11 px-6 rounded-2xl font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBranch}
              disabled={loading}
              className="h-11 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs gap-2 border-0 w-full sm:w-auto cursor-pointer flex items-center justify-center"
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
