"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "lucide-react";

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Software & SaaS");
  const [website, setWebsite] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

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
      const res = await fetch("/api/company-vendors", {
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

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await initialize();
      await fetchVendors();
      setLoading(false);
    };
    run();
  }, []);

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
      const res = await fetch("/api/company-vendors", {
        method: "POST",
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

      setName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setWebsite("");
      setOpen(false);
      setToast({ message: "Vendor saved successfully!", type: "success" });
      fetchVendors();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to add vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vendor from the registry?")) return;
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/company-vendors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setToast({ message: "Vendor deleted!", type: "success" });
        fetchVendors();
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete vendor", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  // Filter vendors by search
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.contactName?.toLowerCase() || "").includes(q) ||
      (v.category?.toLowerCase() || "").includes(q)
    );
  });

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
          onClick: () => setOpen(true),
        }}
      />

      {/* SEARCH BAR */}
      <Card className="crm-card p-4 bg-card/60 backdrop-blur-md shadow-sm rounded-2xl">
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors by name, category, or contact person..."
            className="h-11 rounded-2xl pl-10 text-xs font-semibold"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </Card>

      {/* VENDORS LIST */}
      {filteredVendors.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {filteredVendors.map((vendor) => (
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

                  {["admin", "owner", "hr manager"].includes(userRole) && (
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Remove vendor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
              Register Corporate Vendor
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
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Software & SaaS, Office Utilities, Rent"
                className="h-11 rounded-2xl"
              />
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
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-11 rounded-2xl"
                />
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
                    Saving...
                  </>
                ) : (
                  "Register Vendor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
