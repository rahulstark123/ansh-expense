"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useExpenseStore } from "@/stores/expense-store";
import {
  Plus,
  Loader2,
  Trash2,
  Lock,
  Building,
  ShieldAlert,
  Search,
  ExternalLink,
  Mail,
  Phone,
  Paperclip,
  CheckCircle,
  ChevronDown,
  Filter,
  MoreVertical,
  Pencil,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface CompanyVendor {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  website: string | null;
  wid: number;
  createdAt: string;
}

export default function CompanyVendorsPage() {
  const { currentUser, initialize } = useExpenseStore();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<CompanyVendor[]>([]);
  
  // Modals state
  const [open, setOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDeleteId, setVendorToDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Software & SaaS");
  const [website, setWebsite] = useState("");

  const [vendorCategories, setVendorCategories] = useState<string[]>([
    "Software & SaaS",
    "Office Utilities",
    "Rent",
    "Marketing",
    "Operations",
    "Other"
  ]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const userRole = currentUser?.role?.toLowerCase() || "";
  const isAuthorized = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchVendors = async () => {
    if (!isAuthorized) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const url = new URL("/api/company-vendors", window.location.origin);
      if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());
      if (categoryFilter !== "All") url.searchParams.set("category", categoryFilter);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (e) {
      console.error("Failed to load vendors:", e);
    }
  };

  const fetchVendorSettings = async () => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/company-expenses/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vendorCategories?.length) {
          setVendorCategories(data.vendorCategories);
          setCategory(data.vendorCategories[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load vendor settings:", e);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await initialize();
      await Promise.all([fetchVendors(), fetchVendorSettings()]);
      setLoading(false);
    };
    run();
  }, []);

  useEffect(() => {
    if (!loading && isAuthorized) {
      fetchVendors();
    }
  }, [searchQuery, categoryFilter]);

  const handleAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Vendor name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const url = editingVendorId ? `/api/company-vendors/${editingVendorId}` : "/api/company-vendors";
      const method = editingVendorId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          contactName: contactName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          category,
          website: website.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save vendor.");
      }

      setEditingVendorId(null);
      setName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setOpen(false);
      setToast({ message: editingVendorId ? "Vendor updated successfully!" : "Vendor saved successfully!", type: "success" });
      fetchVendors();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to save vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    setDeleting(true);
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/company-vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast({ message: "Vendor deleted!", type: "success" });
        setDeleteConfirmOpen(false);
        setVendorToDeleteId(null);
        fetchVendors();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete vendor", type: "error" });
    } finally {
      setDeleting(false);
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

        {/* Search Bar Skeleton */}
        <Card className="crm-card border border-border/40 opacity-75 p-4">
          <div className="h-11 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full" />
        </Card>

        {/* Grid of Vendor Cards Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-75 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
              </div>
              <div className="border-t border-border/40 pt-3 space-y-2">
                <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh] px-4">
        <Card className="max-w-md w-full p-6 border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            The Vendor Registry displays details of business suppliers and contracts, and is restricted to HR, Management, and Workspace Admins.
          </p>
          <Button onClick={() => window.location.replace("/dashboard")} className="w-full h-11 rounded-2xl font-bold">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

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
        title="Vendor Registry Desk"
        description="Register and manage general suppliers, landlord metrics, and software SaaS vendor contact pipelines."
        eyebrow="Corporate Finance"
         action={{
          label: "Register New Vendor",
          icon: Plus,
          onClick: () => {
            setEditingVendorId(null);
            setName("");
            setContactName("");
            setEmail("");
            setPhone("");
            setWebsite("");
            setCategory("Software & SaaS");
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
              {(searchQuery.trim() !== "" || categoryFilter !== "All") && (
                <span className="ml-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground animate-in zoom-in duration-200">
                  {
                    [searchQuery.trim() !== "", categoryFilter !== "All"].filter(Boolean).length
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
                      Filter Vendors
                    </span>
                    {(searchQuery.trim() !== "" || categoryFilter !== "All") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("All");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search Query */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Search Query
                    </label>
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search vendors..."
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
                        {vendorCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
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

      {/* VENDORS LIST */}
      {vendors.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="crm-card bg-card/60 backdrop-blur-md shadow-sm rounded-3xl p-5 border border-border/80 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black text-sm uppercase">
                      {vendor.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]" title={vendor.name}>
                        {vendor.name}
                      </h4>
                      <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5 rounded-full text-[9px] mt-1 shrink-0">
                        {vendor.category || "General"}
                      </Badge>
                    </div>
                  </div>

                  {isAuthorized && (
                    <div className="shrink-0 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full border border-border/40 bg-card hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer animate-in fade-in"
                            >
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-36 rounded-xl border border-border bg-card shadow-lg p-1">
                          <DropdownMenuItem
                            onClick={() => {
                              // Populate Edit Form and Open
                              setEditingVendorId(vendor.id);
                              setName(vendor.name);
                              setContactName(vendor.contactName || "");
                              setEmail(vendor.email || "");
                              setPhone(vendor.phone || "");
                              setCategory(vendor.category || "Software & SaaS");
                              setWebsite(vendor.website || "");
                              setOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setVendorToDeleteId(vendor.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-455 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove vendor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350 border-t border-border/50 pt-3">
                  {vendor.contactName && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Contact:</span>
                      <span className="text-slate-800 dark:text-slate-200">{vendor.contactName}</span>
                    </div>
                  )}

                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.email}</span>
                    </a>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {vendor.website && (
                <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between">
                  <a
                    href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-500/5 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
          <Building className="h-10 w-10 text-slate-300" />
          <span className="text-xs font-bold text-slate-450">No partners registered in the Vendor Registry.</span>
        </div>
      )}

      {/* DIALOG: REGISTER NEW VENDOR */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90dvh]">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingVendorId ? "Edit Corporate Vendor" : "Register Corporate Vendor"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddVendorSubmit} className="space-y-4 pt-4 text-xs">
            {formError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 font-bold text-rose-500">
                {formError}
              </div>
            )}

            {/* Vendor Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Vendor / Company Name</label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amazon Web Services Inc."
                className="h-11 rounded-2xl"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={phone}
                    onChange={(val) => setPhone(val || "")}
                  />
                </div>
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Website URL</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. aws.amazon.com"
                className="h-11 rounded-2xl"
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
                    {editingVendorId ? "Saving..." : "Registering..."}
                  </>
                ) : (
                  editingVendorId ? "Save Changes" : "Register Vendor"
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
              Remove Vendor from Registry?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-455 leading-relaxed mt-1 text-left">
              Are you sure you want to permanently delete this vendor from the registry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setVendorToDeleteId(null);
              }}
              className="h-11 px-6 rounded-2xl font-bold w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              disabled={deleting}
              onClick={async () => {
                if (vendorToDeleteId) {
                  await handleDeleteVendor(vendorToDeleteId);
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
    </div>
  );
}
