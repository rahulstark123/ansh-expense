"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useExpenseStore, type Employee } from "@/stores/expense-store";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { 
  Loader2, User, Mail, Shield, Briefcase, CheckCircle, 
  Phone, Calendar, Building, UserCheck, CreditCard, Clock, HeartHandshake, Pencil, MapPin,
  Droplet
} from "lucide-react";

type ProfileFields = Pick<
  Employee,
  | "name"
>;

export default function ProfileSettingPage() {
  const { currentUser, initialize } = useExpenseStore();
  const currentUserAny = currentUser as any;

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const applyProfileFields = useCallback((emp: any) => {
    setName(emp.name || "");
    setPhoneNumber(emp.phoneNumber || "");
    setPersonalEmail(emp.personalEmail || "");
    setDateOfBirth(emp.dateOfBirth || "");
    setEmergencyContactName(emp.emergencyContactName || "");
    setEmergencyContactPhone(emp.emergencyContactPhone || "");
    setBloodGroup(emp.bloodGroup || "");
  }, []);

  useEffect(() => {
    if (currentUser) {
      applyProfileFields(currentUser);
    }
  }, [currentUser, applyProfileFields]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await initialize();
        const token = sessionStorage.getItem("ansh_auth_token");
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) applyProfileFields(data.profile);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    loadProfile();
  }, [applyProfileFields, initialize]);

  const scrollToEditForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const nameInput = formRef.current?.querySelector<HTMLInputElement>('input[type="text"]');
    nameInput?.focus();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Name cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber || null,
          personalEmail: personalEmail.trim() || null,
          dateOfBirth: dateOfBirth || null,
          emergencyContactName: emergencyContactName.trim() || null,
          emergencyContactPhone: emergencyContactPhone || null,
          bloodGroup: bloodGroup || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      await initialize();
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Profile Settings | Ansh Expense</title>
      <meta name="description" content="Configure your profile details, contact information, emergency contacts, and professional details on Ansh Expense." />
      <PageHeader
        eyebrow="Account Settings"
        title="Profile Setting"
        description="Manage your account profile details, contact info, emergency contacts, and view your professional workspace parameters."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-1">
          {/* Profile Card Summary */}
          <Card className="crm-card h-fit w-full">
            <CardContent className="pt-8 text-center space-y-5">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden bg-primary/10 text-primary font-black text-3xl shadow-xl shadow-primary/5">
                    <img src="/logoAnshapps.png" alt={currentUser?.name} className="h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={scrollToEditForm}
                    title="Edit profile details"
                    className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {currentUserAny?.name}
                </h3>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                  {currentUserAny?.designation || currentUserAny?.role}
                </p>
              </div>
              
              <div className="border-t border-border/45 pt-4 space-y-3.5 text-xs text-slate-500 font-medium text-left">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Department</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350">{currentUserAny?.department || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> Office Branch</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350 uppercase">{currentUserAny?.branch || "Not assigned"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Employee Code</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350 uppercase">{currentUserAny?.employeeCode || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5" /> Blood Group</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350 uppercase">{currentUserAny?.bloodGroup || "Not specified"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <Card className="crm-card lg:col-span-2" id="profile-edit-section">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Personal & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingProfile && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading profile...
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-400 mb-6 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-400 mb-6">
                {errorMsg}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSave} className="space-y-6">
              {/* Personal Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Identity Details
                </h4>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Full Name
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Raj"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  {/* Date of birth */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Date of Birth
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Blood Group
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Droplet className="h-4 w-4" />
                      </div>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-900/50 pl-11 pr-10 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 appearance-none cursor-pointer"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Contact Coordinates
                </h4>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Phone Number
                    </label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(val) => setPhoneNumber(val || "")}
                      />
                    </div>
                  </div>

                  {/* Personal Email */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Personal Email Address
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={personalEmail}
                        onChange={(e) => setPersonalEmail(e.target.value)}
                        placeholder="e.g. personal@email.com"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                  Emergency Contact Details
                </h4>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Contact Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Contact Name
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Spouse, Parent, Sibling name"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Contact Phone
                    </label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        placeholder="Enter emergency contact number"
                        value={emergencyContactPhone}
                        onChange={(val) => setEmergencyContactPhone(val || "")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Login Email (Read-only) */}
              <div className="border-t border-border/40 pt-4 opacity-60">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Workspace Login Email
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email}
                    className="block w-full rounded-2xl border border-border bg-slate-100/50 dark:bg-slate-900/40 pl-11 pr-4 py-3.5 text-sm text-foreground cursor-not-allowed"
                  />
                </div>
              </div>

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
                    "Save Profile Details"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Readonly Professional Details Card */}
        <Card className="crm-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-primary" />
              Professional Details & Employment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Employee Code</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block uppercase">{currentUserAny?.employeeCode || "N/A"}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Designation</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.designation || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Building className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Assigned Branch</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block uppercase">{currentUserAny?.branch || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Reporting Manager</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.reportingManager || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Reporting HR</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.reportingHR || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Employment Type</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.employmentType || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Work Location</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.workLocation || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Joining Date</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block">{currentUserAny?.joiningDate || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Security Access Role</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block uppercase tracking-wider">{currentUserAny?.role}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                <Droplet className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Blood Group</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white mt-1 block uppercase">{currentUserAny?.bloodGroup || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
