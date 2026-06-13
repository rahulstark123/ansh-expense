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
  Droplet, ChevronDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ProfileFields = Pick<
  Employee,
  | "name"
>;

export default function ProfileSettingPage() {
  const { currentUser, initialize, employees } = useExpenseStore();
  const currentUserAny = currentUser as any;

  // Personal Fields
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  // Professional Fields
  const [employeeCode, setEmployeeCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [branch, setBranch] = useState("");
  const [reportingManager, setReportingManager] = useState("");
  const [reportingHR, setReportingHR] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [workLocation, setWorkLocation] = useState("Remote");
  const [joiningDate, setJoiningDate] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("Employee");

  // Settings Lists
  const [branchesList, setBranchesList] = useState<any[]>([]);
  const [designationsList, setDesignationsList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [workLocationsList, setWorkLocationsList] = useState<string[]>([]);

  // Dialog state
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthorized =
    currentUser?.role === "Admin" ||
    currentUser?.role === "Manager" ||
    currentUser?.role === "Owner" ||
    currentUser?.role === "HR Manager" ||
    currentUser?.role === "HR";

  const applyProfileFields = useCallback((emp: any) => {
    setName(emp.name || "");
    setPhoneNumber(emp.phoneNumber || "");
    setPersonalEmail(emp.personalEmail || "");
    setDateOfBirth(emp.dateOfBirth || "");
    setEmergencyContactName(emp.emergencyContactName || "");
    setEmergencyContactPhone(emp.emergencyContactPhone || "");
    setBloodGroup(emp.bloodGroup || "");

    setEmployeeCode(emp.employeeCode || "");
    setDesignation(emp.designation || "");
    setBranch(emp.branch || "");
    setReportingManager(emp.reportingManager || "");
    setReportingHR(emp.reportingHR || "");
    setEmploymentType(emp.employmentType || "Full-time");
    setWorkLocation(emp.workLocation || "Remote");
    setJoiningDate(emp.joiningDate || "");
    setDepartment(emp.department || "Engineering");
    setRole(emp.role || "Employee");
  }, []);

  useEffect(() => {
    if (currentUser) {
      applyProfileFields(currentUser);
    }
  }, [currentUser, applyProfileFields]);

  useEffect(() => {
    const loadProfileAndSettings = async () => {
      try {
        await initialize();
        const token = sessionStorage.getItem("ansh_auth_token");
        const [profileRes, settingsRes] = await Promise.all([
          fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile) applyProfileFields(data.profile);
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.settings?.branches) setBranchesList(settingsData.settings.branches);
          if (settingsData.settings?.departments) setDepartmentsList(settingsData.settings.departments);
          if (settingsData.settings?.workLocations) setWorkLocationsList(settingsData.settings.workLocations);
          if (settingsData.settings?.designations) setDesignationsList(settingsData.settings.designations);
        }
      } catch (err) {
        console.error("Failed to load profile and settings list configurations:", err);
      } finally {
        setFetchingProfile(false);
      }
    };
    loadProfileAndSettings();
  }, [applyProfileFields, initialize]);



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
          ...(isAuthorized ? {
            employeeCode: employeeCode.trim() || null,
            designation: designation.trim() || null,
            branch: branch.trim() || null,
            reportingManager: reportingManager.trim() || null,
            reportingHR: reportingHR.trim() || null,
            employmentType: employmentType.trim() || null,
            workLocation: workLocation.trim() || null,
            joiningDate: joiningDate || null,
            department: department.trim() || null,
            role: role.trim() || null,
          } : {})
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      await initialize();
      setEditModalOpen(false);
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
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary font-black text-3xl shadow-xl shadow-primary/5 select-none">
                  {currentUserAny?.avatarInitials || "RR"}
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
        {/* Read-Only Profile Card */}
        <Card className="crm-card lg:col-span-2">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              Personal & Contact Information
            </CardTitle>
            <Button
              onClick={() => setEditModalOpen(true)}
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-bold gap-1 rounded-xl cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {fetchingProfile && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading profile...
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-450 dark:text-emerald-400 mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4 text-emerald-450 dark:text-emerald-400" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-450 dark:text-rose-405 mb-6">
                {errorMsg}
              </div>
            )}

            <div className="space-y-6">
              {/* Identity Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Identity Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Full Name</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{name || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Date of Birth</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{dateOfBirth || "Not specified"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Blood Group</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block uppercase">{bloodGroup || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Contact Coordinates
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Phone Number</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{phoneNumber || "Not specified"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Personal Email</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block truncate" title={personalEmail}>{personalEmail || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                  Emergency Contact Details
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Contact Name</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{emergencyContactName || "Not specified"}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-slate-50/20 dark:bg-slate-900/10 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">Contact Phone</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white mt-1 block">{emergencyContactPhone || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIALOG MODAL: EDIT PROFILE */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[700px] w-[90vw] max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
            <DialogHeader className="pb-3 border-b border-border/40">
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-550" />
                Edit Profile Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Update your account profile credentials. Note that job and role configuration changes are restricted to compliance/management roles.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-6 pt-4 text-xs text-left">
              {/* Personal Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Personal Information
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Full Name *
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
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
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
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11 [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
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
                        className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
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
                      <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="md:col-span-2">
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
                      className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <HeartHandshake className="h-3.5 w-3.5 text-primary" />
                  Emergency Contact Details
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Contact Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Emergency Contact Name
                    </label>
                    <div className="mt-2 relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Spouse, Parent Name"
                        className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                      />
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Emergency Contact Phone
                    </label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        placeholder="Enter contact number"
                        value={emergencyContactPhone}
                        onChange={(val) => setEmergencyContactPhone(val || "")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* JOB PROFILE SECTION: AUTHORIZED EDIT ONLY */}
              {isAuthorized && (
                <div className="space-y-4 pt-2 border-t border-border/40 mt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Shield className="h-3.5 w-3.5 text-rose-500" />
                    Job Profile Section (Manager / HR / Admin Edit Only)
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Employee Code */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Employee Code
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          value={employeeCode}
                          onChange={(e) => setEmployeeCode(e.target.value)}
                          placeholder="e.g. EMP-001"
                          className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11"
                        />
                      </div>
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Job Designation
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">Select Designation</option>
                          {designationsList.map((d) => (
                            <option key={d.id || d.name} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Branch */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Office Branch
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Building className="h-4 w-4" />
                        </div>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">Select Branch</option>
                          {branchesList.map((b) => (
                            <option key={b.id || b.name} value={b.name}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Department
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Building className="h-4 w-4" />
                        </div>
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">Select Department</option>
                          {departmentsList.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Work Location */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Work Location Arrangement
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <select
                          value={workLocation}
                          onChange={(e) => setWorkLocation(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">Select Location</option>
                          {workLocationsList.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Employment Contract Type
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Clock className="h-4 w-4" />
                        </div>
                        <select
                          value={employmentType}
                          onChange={(e) => setEmploymentType(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Joining Date */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Joining Date
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-550">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <input
                          type="date"
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-transparent pl-11 pr-4 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 h-11 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    {/* Security Access Role */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Security Access Role
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                          <Shield className="h-4 w-4" />
                        </div>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                          <option value="HR">HR Officer</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Owner">Owner</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Reporting Manager */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Reporting Manager
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <select
                          value={reportingManager}
                          onChange={(e) => setReportingManager(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">No manager assigned</option>
                          {employees
                            .filter((emp: any) => emp.id !== currentUser?.id)
                            .map((emp: any) => (
                              <option key={emp.id} value={emp.name}>
                                {emp.name} ({emp.designation || emp.role})
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Reporting HR */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Reporting HR Representative
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-555">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <select
                          value={reportingHR}
                          onChange={(e) => setReportingHR(e.target.value)}
                          className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-905 pl-11 pr-10 py-3 text-xs font-semibold text-foreground outline-none focus:border-primary/45 focus:ring-1 focus:ring-primary/45 appearance-none cursor-pointer h-11"
                        >
                          <option value="">No HR assigned</option>
                          {employees
                            .filter(
                              (emp: any) =>
                                (emp.role === "Admin" ||
                                  emp.role === "Manager" ||
                                  emp.role === "HR" ||
                                  emp.role === "HR Manager" ||
                                  emp.role === "Owner") &&
                                emp.id !== currentUser?.id
                            )
                            .map((emp: any) => (
                              <option key={emp.id} value={emp.name}>
                                {emp.name} ({emp.designation || emp.role})
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-border/40 gap-2 flex flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditModalOpen(false)}
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
                    "Save Settings"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
