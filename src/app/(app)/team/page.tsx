"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useExpenseStore, type Employee } from "@/stores/expense-store";
import { usePlanStore } from "@/stores/plan-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  UserCheck,
  Tag,
  Phone,
  CalendarDays,
  Briefcase,
  Layers,
  MapPin,
  Cake,
  ShieldAlert,
  UsersRound,
  Building,
  Check,
  MoreVertical,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  CreditCard,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const BLOOD_GROUP_OPTIONS: CustomSelectOption[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function TeamPage() {
  const { employees, expenses, currentUser, initialize } = useExpenseStore();
  const planStore = usePlanStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState<"All" | "My Team">("All");

  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  // Fetch branch and designation configurations on mount
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const token = sessionStorage.getItem("ansh_auth_token");
        const [settingsRes, designationRes] = await Promise.all([
          fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/settings/designation", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.settings?.branches) {
            setBranches(data.settings.branches);
            if (!branch && data.settings.branches.length > 0) {
              setBranch(data.settings.branches[0].name);
            }
          }
        }
        if (designationRes.ok) {
          const designationData = await designationRes.json();
          const list = designationData.designations || [];
          setDesignations(list);
          if (!designation && list.length > 0) {
            setDesignation(list[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load dropdown directories:", err);
      }
    };
    loadDropdowns();
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailActionsOpen, setIsDetailActionsOpen] = useState(false);
  const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState(false);
  const [addOptionField, setAddOptionField] = useState<
    "designation" | "employmentType" | "department" | "role" | "status" | "workLocation" | "branch" | null
  >(null);

  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [editCurrentStep, setEditCurrentStep] = useState(1);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("Employee");
  const [status, setStatus] = useState("Active");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Detailed fields
  const [employeeCode, setEmployeeCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [designation, setDesignation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [employmentTypeItems, setEmploymentTypeItems] = useState<string[]>([
    "Full-time",
    "Part-time",
    "Contract",
    "Intern",
  ]);

  const [reportingManager, setReportingManager] = useState("");
  const [reportingHR, setReportingHR] = useState("");
  const [workLocation, setWorkLocation] = useState("Remote");
  const [workLocationItems, setWorkLocationItems] = useState<string[]>([
    "Remote",
    "On-site",
    "Hybrid",
  ]);
  const [personalEmail, setPersonalEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [deletingEmpId, setDeletingEmpId] = useState("");
  const [deleteConfirmEmailInput, setDeleteConfirmEmailInput] = useState("");
  const [deleteEmailCopied, setDeleteEmailCopied] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionLoading, setNewOptionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Drawer / details state
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "claims" | "spending">("profile");

  const [departmentItems, setDepartmentItems] = useState<string[]>([
    "Engineering",
    "Human Resources",
    "Product Design",
    "Data Analytics",
    "Executive",
    "Marketing",
    "Finance"
  ]);
  const [roleItems, setRoleItems] = useState<string[]>([
    "Employee",
    "Manager",
    "Admin",
  ]);
  const [statusItems, setStatusItems] = useState<string[]>([
    "Active",
    "Inactive"
  ]);

  const isAuthorized = currentUser.role === "Admin" || currentUser.role === "Manager";

  const validateStep1 = (requirePassword = false) => {
    if (!name.trim()) return "Full Name is required.";
    if (!email.trim()) return "Work Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return "Please enter a valid work email address.";
    if (personalEmail.trim() && !emailRegex.test(personalEmail.trim())) {
      return "Please enter a valid personal email address.";
    }
    if (requirePassword) {
      if (!password) return "Login password is required.";
      if (password.length < 6) return "Password must be at least 6 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleNextStep1 = () => {
    setErrorMsg("");
    const err = validateStep1(true);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setCurrentStep(2);
  };

  const handleEditNextStep1 = () => {
    setErrorMsg("");
    const err = validateStep1();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setEditCurrentStep(2);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setDepartment("Engineering");
    setRole("Employee");
    setStatus("Active");
    setEmployeeCode("");
    setPhoneNumber("");
    setJoiningDate("");
    setDesignation(designations[0]?.name || "");
    setEmploymentType("Full-time");
    setReportingManager("");
    setReportingHR("");
    setWorkLocation("Remote");
    setBranch(branches.length > 0 ? branches[0].name : "");
    setPersonalEmail("");
    setDateOfBirth("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setBloodGroup("");
    setErrorMsg("");
    setCurrentStep(1);
    setEditCurrentStep(1);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const openEditMemberModal = (emp: any) => {
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setDepartment(emp.department);
    setRole(emp.role);
    setStatus(emp.status);
    setEmployeeCode(emp.employeeCode || "");
    setPhoneNumber(emp.phoneNumber || "");
    setJoiningDate(emp.joiningDate || "");
    setDesignation(emp.designation || "");
    setEmploymentType(emp.employmentType || "Full-time");
    setReportingManager(emp.reportingManager || "");
    setReportingHR(emp.reportingHR || "");
    setWorkLocation(emp.workLocation || "Remote");
    setBranch(emp.branch || "");
    setPersonalEmail(emp.personalEmail || "");
    setDateOfBirth(emp.dateOfBirth || "");
    setEmergencyContactName(emp.emergencyContactName || "");
    setEmergencyContactPhone(emp.emergencyContactPhone || "");
    setBloodGroup(emp.bloodGroup || "");
    setEditCurrentStep(1);
    setIsEditModalOpen(true);
    setIsDetailActionsOpen(false);
  };

  const openDeleteMemberModal = (empId: string) => {
    setDeletingEmpId(empId);
    setDeleteConfirmEmailInput("");
    setDeleteEmailCopied(false);
    setIsDeleteConfirmOpen(true);
    setIsDetailActionsOpen(false);
  };

  const openAddOptionModal = (
    field: "designation" | "employmentType" | "department" | "role" | "status" | "workLocation" | "branch"
  ) => {
    setAddOptionField(field);
    setNewOptionName("");
    setIsAddOptionModalOpen(true);
  };

  const handleCreateOption = async () => {
    const nameToCreate = newOptionName.trim();
    if (!nameToCreate) return;

    try {
      setNewOptionLoading(true);
      setErrorMsg("");
      if (addOptionField === "designation") {
        const token = sessionStorage.getItem("ansh_auth_token");
        const res = await fetch("/api/settings/designation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: nameToCreate }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create designation");
        setDesignations((prev) => [...prev, data.designation].sort((a, b) => a.name.localeCompare(b.name)));
        setDesignation(data.designation.name);
      } else if (addOptionField === "employmentType") {
        setEmploymentTypeItems((prev) => Array.from(new Set([...prev, nameToCreate])));
        setEmploymentType(nameToCreate);
      } else if (addOptionField === "department") {
        setDepartmentItems((prev) => Array.from(new Set([...prev, nameToCreate])));
        setDepartment(nameToCreate);
      } else if (addOptionField === "role") {
        setRoleItems((prev) => Array.from(new Set([...prev, nameToCreate])));
        setRole(nameToCreate);
      } else if (addOptionField === "status") {
        setStatusItems((prev) => Array.from(new Set([...prev, nameToCreate])));
        setStatus(nameToCreate);
      } else if (addOptionField === "workLocation") {
        setWorkLocationItems((prev) => Array.from(new Set([...prev, nameToCreate])));
        setWorkLocation(nameToCreate);
      } else if (addOptionField === "branch") {
        setBranches((prev) => [...prev, { id: `custom-branch-${Date.now()}`, name: nameToCreate, address: "Added from team form" }]);
        setBranch(nameToCreate);
      }

      setIsAddOptionModalOpen(false);
      setNewOptionName("");
      setAddOptionField(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create option");
    } finally {
      setNewOptionLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (currentStep !== 3) return;
    setErrorMsg("");
    const stepErr = validateStep1(true);
    if (stepErr) {
      setErrorMsg(stepErr);
      setCurrentStep(1);
      return;
    }
    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          department,
          role,
          status,
          employeeCode: employeeCode.trim(),
          phoneNumber: phoneNumber ? phoneNumber.trim() : "",
          joiningDate,
          designation: designation.trim(),
          employmentType,
          reportingManager: reportingManager.trim(),
          reportingHR: reportingHR.trim(),
          workLocation,
          branch,
          personalEmail: personalEmail.trim().toLowerCase(),
          dateOfBirth,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          bloodGroup: bloodGroup || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add employee");
      }

      await initialize();
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to add employee to registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (editCurrentStep !== 3) return;
    if (!selectedEmp) return;
    setErrorMsg("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/employees/${selectedEmp.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          department,
          role,
          status,
          employeeCode: employeeCode.trim(),
          phoneNumber: phoneNumber ? phoneNumber.trim() : "",
          joiningDate,
          designation: designation.trim(),
          employmentType,
          reportingManager: reportingManager.trim(),
          reportingHR: reportingHR.trim(),
          workLocation,
          branch,
          personalEmail: personalEmail.trim().toLowerCase(),
          dateOfBirth,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          bloodGroup: bloodGroup || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update employee details");
      }

      await initialize();
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update employee registry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingEmpId) return;
    setErrorMsg("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/employees/${deletingEmpId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete employee");
      }

      await initialize();
      setIsDeleteConfirmOpen(false);
      setDeletingEmpId("");
      setDeleteConfirmEmailInput("");
      setDeleteEmailCopied(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete employee from registry.");
    } finally {
      setLoading(false);
    }
  };

  // Teammates Filtering
  const filteredTeam = employees.filter((emp: any) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.employeeCode && emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || emp.status === statusFilter;

    const matchesScope =
      scopeFilter === "All" ||
      (emp.reportingManager && emp.reportingManager.toLowerCase() === currentUser?.name.toLowerCase()) ||
      (emp.reportingHR && emp.reportingHR.toLowerCase() === currentUser?.name.toLowerCase());

    return matchesSearch && matchesStatus && matchesScope;
  });

  const departmentOptions: CustomSelectOption[] = departmentItems.map((item) => ({ value: item, label: item }));
  const roleOptions: CustomSelectOption[] = roleItems.map((item) => ({ value: item, label: item }));
  const statusOptions: CustomSelectOption[] = statusItems.map((item) => ({ value: item, label: item }));
  const employmentTypeOptions: CustomSelectOption[] = employmentTypeItems.map((item) => ({ value: item, label: item }));
  const workLocationOptions: CustomSelectOption[] = workLocationItems.map((item) => ({ value: item, label: item }));
  const designationOptions: CustomSelectOption[] = designations.map((d: any) => ({ value: d.name, label: d.name }));
  
  const managerOptions: CustomSelectOption[] = employees
    .filter((emp: any) => emp.name !== name && emp.id !== selectedEmp?.id)
    .map((emp: any) => ({ value: emp.name, label: emp.name, description: emp.designation || emp.role }));

  const hrOptions: CustomSelectOption[] = employees
    .filter((emp: any) => (emp.role === "Admin" || emp.role === "Manager") && emp.name !== name && emp.id !== selectedEmp?.id)
    .map((emp: any) => ({ value: emp.name, label: emp.name, description: emp.designation || emp.role }));

  const branchOptions: CustomSelectOption[] = branches.map((b) => ({ value: b.name, label: b.name, description: b.address }));

  const deletingEmployee = employees.find((emp: any) => emp.id === deletingEmpId) || null;
  const isDeleteEmailMatched =
    !!deletingEmployee &&
    deleteConfirmEmailInput.trim().toLowerCase() === deletingEmployee.email.toLowerCase();

  // Helper: Get financial summaries for a specific employee
  const getEmployeeClaimsSummary = (empId: string) => {
    const empClaims = expenses.filter((c) => c.employeeId === empId);
    const approved = empClaims.filter((c) => c.status === "Approved").reduce((sum, c) => sum + c.amount, 0);
    const pending = empClaims.filter((c) => c.status === "Pending").length;
    return {
      totalClaimsCount: empClaims.length,
      approvedAmount: approved,
      pendingCount: pending,
      claims: empClaims,
    };
  };

  const formatInr = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Stepper Header Component
  const renderStepper = (step: number) => {
    const steps = [
      { num: 1, label: "Identity" },
      { num: 2, label: "Job Details" },
      { num: 3, label: "Emergency contact" }
    ];
    return (
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/40 flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/20 ring-offset-2 dark:ring-offset-slate-900"
                    : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-105 dark:bg-slate-800/80 text-slate-400"
                )}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <span className={cn(
                  "text-[10px] font-extrabold uppercase tracking-wider transition-colors duration-300",
                  isActive ? "text-primary" : isCompleted ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400"
                )}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="h-0.5 flex-1 mx-4 bg-slate-100 dark:bg-slate-800/80 relative">
                  <div className={cn(
                    "absolute inset-y-0 left-0 bg-primary transition-all duration-500",
                    isCompleted ? "w-full" : "w-0"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Categorize claims for the detailed drawer
  const getTeammateCategoryBreakdown = (claims: any[]) => {
    const categories = ["Travel", "Meals", "Software", "Office Supplies", "Mileage", "Other"];
    const approvedClaims = claims.filter(c => c.status === "Approved");
    const totalApproved = approvedClaims.reduce((sum, c) => sum + c.amount, 0);

    return categories.map((cat) => {
      const catAmount = approvedClaims.filter(c => c.category === cat).reduce((sum, c) => sum + c.amount, 0);
      const percent = totalApproved > 0 ? Math.round((catAmount / totalApproved) * 100) : 0;
      return { category: cat, amount: catAmount, percent };
    }).sort((a, b) => b.amount - a.amount);
  };

  // Details drawer calculations
  const drawerSummary = selectedMemberForDetail ? getEmployeeClaimsSummary(selectedMemberForDetail.id) : null;
  const categoryBreakdown = drawerSummary ? getTeammateCategoryBreakdown(drawerSummary.claims) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Team Directory | Ansh Expense</title>
      <meta name="description" content="View status registries, department allocations, and client spending reimbursements logs for all active workspace teammates." />
      <PageHeader
        eyebrow="Organization Registry"
        title="Team Directory"
        description="View status registries, department allocations, and client spending reimbursements logs for all active workspace teammates."
      />

      {/* FILTER & SEARCH CONTROL BLOCK */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search employees, ID, titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card rounded-xl border border-slate-200 focus-visible:border-primary shadow-sm"
            />
          </div>
          {isAuthorized && (
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn-primary h-11 px-5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-2 cursor-pointer border-0"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scope Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 gap-0.5 border border-slate-200/50 dark:border-slate-800/50">
            {(["All", "My Team"] as const).map((scope) => {
              const active = scopeFilter === scope;
              return (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setScopeFilter(scope)}
                  className={cn(
                    "rounded-lg px-4.5 py-1.5 text-xs font-extrabold transition-all outline-none cursor-pointer border-0",
                    active
                      ? "bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
                  )}
                >
                  {scope}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Active", "Inactive"].map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-xs font-bold transition-all outline-none cursor-pointer border-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-805 dark:hover:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CARDS LIST GRID */}
      {filteredTeam.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center select-none">
          <UsersRound className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4 animate-float" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-250">No teammates found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            No employee registry records match your active search filters or reporting scopes.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeam.map((emp: any) => {
            const stats = getEmployeeClaimsSummary(emp.id);
            const isManagerOrAdmin = emp.role === "Admin" || emp.role === "Manager";
            
            return (
              <Card
                key={emp.id}
                onClick={() => setSelectedMemberForDetail(emp)}
                className="crm-card cursor-pointer relative group overflow-hidden select-none"
              >
                <CardContent className="p-6 space-y-5">
                  {/* Top Header info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-base shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {emp.avatarInitials}
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-slate-800 dark:text-white group-hover:text-primary transition-colors leading-tight">
                          {emp.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wide">
                          {emp.designation || emp.role}
                        </span>
                      </div>
                    </div>

                    <Badge className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                      emp.status === "Active"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-500/10 border-slate-500/20 text-slate-500"
                    )}>
                      {emp.status}
                    </Badge>
                  </div>

                  {/* Personal Parameters Info */}
                  <div className="border-t border-border/40 pt-4 grid grid-cols-2 gap-3 text-xs text-left">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">{emp.department}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Work Location</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">{emp.workLocation || "Remote"}</span>
                    </div>
                  </div>

                  {/* Expense Reimbursement Mini Stats */}
                  <div className="border-t border-border/40 pt-4 grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-border/30 text-left">
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <Wallet className="h-3 w-3 text-emerald-500" /> Reimbursed (Approved)
                      </span>
                      <span className="font-black text-slate-800 dark:text-white mt-0.5 block">{formatInr(stats.approvedAmount)}</span>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <Clock className="h-3 w-3 text-amber-500" /> Pending Claims
                      </span>
                      <span className="font-bold text-slate-750 dark:text-slate-200 mt-0.5 block">{stats.pendingCount} reviews</span>
                    </div>
                  </div>

                  {/* View Details Action Link indicator */}
                  <div className="flex justify-end items-center text-[10px] font-extrabold text-primary uppercase tracking-widest pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Teammate Logs</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1 animate-in slide-in-from-left-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL DIALOG: DETAILED TEAMMATE DRAWER */}
      <Dialog open={!!selectedMemberForDetail} onOpenChange={(open) => !open && setSelectedMemberForDetail(null)}>
        <DialogContent className="sm:max-w-[650px] p-0 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col gap-0 select-none">
          {selectedMemberForDetail && drawerSummary && (
            <>
              {/* Profile Header Block */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-xl shadow-inner">
                    {selectedMemberForDetail.avatarInitials}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMemberForDetail.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {selectedMemberForDetail.designation || selectedMemberForDetail.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAuthorized && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditMemberModal(selectedMemberForDetail)}
                        className="h-9 rounded-xl text-xs font-bold gap-1 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteMemberModal(selectedMemberForDetail.id)}
                        className="h-9 rounded-xl text-xs font-bold text-rose-500 border-rose-500/10 hover:bg-rose-500/5 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedMemberForDetail(null)}
                    className="p-2 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border-0 bg-transparent"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Sub tabs switcher */}
              <div className="flex border-b border-border/40 bg-slate-50/20 dark:bg-slate-900/10 px-4 py-2">
                {[
                  { id: "profile", label: "Registry Details", icon: UserCheck },
                  { id: "claims", label: "Reimbursements Log", icon: Wallet },
                  { id: "spending", label: "Spend breakdown", icon: CreditCard },
                ].map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border-0 bg-transparent cursor-pointer",
                        active
                          ? "text-primary bg-primary/5"
                          : "text-slate-450 hover:text-slate-700 dark:hover:text-slate-200"
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Tab Content Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[55dvh]">
                {activeTab === "profile" && (
                  <div className="space-y-6 text-xs text-left">
                    {/* Job Settings Info */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Briefcase className="h-3.5 w-3.5" /> Job Profile Parameters
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Teammate Code</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block uppercase">
                            {selectedMemberForDetail.employeeCode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.department}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Office Branch</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block uppercase">
                            {selectedMemberForDetail.branch || "Not assigned"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Employment Contract</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.employmentType || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Line Manager</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.reportingManager || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Onboarding Date</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.joiningDate ? new Date(selectedMemberForDetail.joiningDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 border-t border-border/40 pt-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Mail className="h-3.5 w-3.5" /> Contact Coordinates
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Work Email</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.email}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Personal Email</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.personalEmail || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Number</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.phoneNumber || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.dateOfBirth ? new Date(selectedMemberForDetail.dateOfBirth).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Coordinates */}
                    <div className="space-y-3 border-t border-border/40 pt-5">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Phone className="h-3.5 w-3.5" /> Emergency Contacts
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Name</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.emergencyContactName || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                            {selectedMemberForDetail.emergencyContactPhone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "claims" && (
                  <div className="space-y-4 text-xs text-left">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                      <Wallet className="h-3.5 w-3.5" /> Submitted Reimbursement Claims ({drawerSummary.claims.length})
                    </h4>
                    {drawerSummary.claims.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 font-semibold">
                        No claims logged by this teammate yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {drawerSummary.claims.map((claim) => (
                          <div key={claim.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-border/40 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                              <span className="block font-bold text-slate-800 dark:text-white leading-tight">{claim.title}</span>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-semibold">
                                <span>{claim.category}</span>
                                <span>·</span>
                                <span>{new Date(claim.date).toLocaleDateString()}</span>
                                {claim.projectName && (
                                  <>
                                    <span>·</span>
                                    <span className="text-primary/90 flex items-center gap-0.5">
                                      <FolderOpen className="h-3 w-3" /> {claim.projectName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="block font-black text-slate-800 dark:text-white">{formatInr(claim.amount)}</span>
                              <Badge className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider mt-1.5 border",
                                claim.status === "Approved"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                  : claim.status === "Rejected"
                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                    : claim.status === "NeedsInfo"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                              )}>
                                {claim.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "spending" && (
                  <div className="space-y-6 text-xs text-left">
                    {/* Spend Metrics Cards */}
                    <div className="grid gap-4 grid-cols-2">
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Reimbursed</span>
                        <span className="text-lg font-black text-emerald-500">{formatInr(drawerSummary.approvedAmount)}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Awaiting Review</span>
                        <span className="text-lg font-black text-primary">{drawerSummary.pendingCount} claims</span>
                      </div>
                    </div>

                    {/* Spend Category Breakdown Progress Bars */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <CreditCard className="h-3.5 w-3.5" /> Category Spending Breakdown
                      </h4>
                      {drawerSummary.approvedAmount === 0 ? (
                        <div className="py-8 text-center text-slate-400 font-semibold">
                          No approved claims to show spending distributions.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {categoryBreakdown.map((item) => (
                            <div key={item.category} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-600 dark:text-slate-350">{item.category}</span>
                                <span className="text-slate-800 dark:text-white font-bold">
                                  {formatInr(item.amount)} ({item.percent}%)
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-300"
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL DIALOG: WIZARD ADD TEAM MEMBER */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && setIsAddModalOpen(false)}>
        <DialogContent className="sm:max-w-[550px] p-0 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col gap-0 select-none">
          <DialogHeader className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/40">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <UsersRound className="h-4.5 w-4.5 text-primary" />
              Add Teammate Record
            </DialogTitle>
          </DialogHeader>

          {/* Stepper horizontal tracker */}
          {renderStepper(currentStep)}

          {errorMsg && (
            <div className="px-6 pt-4">
              <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3.5 text-xs font-bold text-rose-500">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Stepper Forms content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[45dvh] text-left text-xs">
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Raj"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Work Email Address</label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@ansh.com"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Password and Confirm Password */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer bg-transparent border-0"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="h-11 rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer bg-transparent border-0"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date of birth */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        placeholder="Teammate phone number"
                        value={phoneNumber}
                        onChange={(val) => setPhoneNumber(val || "")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="block w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark] h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                {/* Employee Code & Joining Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Teammate Code</label>
                    <Input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="e.g. ANSH-005"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Joining Date</label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="block w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark] h-11"
                    />
                  </div>
                </div>

                {/* Designation & Department */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Designation</label>
                      <button type="button" onClick={() => openAddOptionModal("designation")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={designationOptions}
                      value={designation}
                      onChange={(val) => setDesignation(val)}
                      placeholder="Select designation"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</label>
                      <button type="button" onClick={() => openAddOptionModal("department")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={departmentOptions}
                      value={department}
                      onChange={(val) => setDepartment(val)}
                      placeholder="Select department"
                    />
                  </div>
                </div>

                {/* Role & status */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Access Role</label>
                    <CustomSelect
                      options={roleOptions}
                      value={role}
                      onChange={(val) => setRole(val)}
                      placeholder="Select role"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Employment Status</label>
                    <CustomSelect
                      options={statusOptions}
                      value={status}
                      onChange={(val) => setStatus(val)}
                      placeholder="Select status"
                    />
                  </div>
                </div>

                {/* Office branch and Work Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Office Branch</label>
                      <button type="button" onClick={() => openAddOptionModal("branch")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={branchOptions}
                      value={branch}
                      onChange={(val) => setBranch(val)}
                      placeholder="Select branch"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Work Location</label>
                      <button type="button" onClick={() => openAddOptionModal("workLocation")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={workLocationOptions}
                      value={workLocation}
                      onChange={(val) => setWorkLocation(val)}
                      placeholder="Select location"
                    />
                  </div>
                </div>

                {/* Managers */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Reporting Manager</label>
                    <CustomSelect
                      options={managerOptions}
                      value={reportingManager}
                      onChange={(val) => setReportingManager(val)}
                      placeholder="Select manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Reporting HR</label>
                    <CustomSelect
                      options={hrOptions}
                      value={reportingHR}
                      onChange={(val) => setReportingHR(val)}
                      placeholder="Select HR manager"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Personal Email & Blood group */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Personal Email Address</label>
                    <Input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="rahul.personal@gmail.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Blood Group</label>
                    <CustomSelect
                      options={BLOOD_GROUP_OPTIONS}
                      value={bloodGroup}
                      onChange={(val) => setBloodGroup(val)}
                      placeholder="Select blood group"
                    />
                  </div>
                </div>

                {/* Emergency Contact info */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Phone className="h-3.5 w-3.5" /> Emergency Contacts Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Name</label>
                      <Input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Sibling or Parent Name"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Phone</label>
                      <div className="phone-input-container">
                        <PhoneInput
                          international
                          defaultCountry="IN"
                          placeholder="Emergency contact phone"
                          value={emergencyContactPhone}
                          onChange={(val) => setEmergencyContactPhone(val || "")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Action Buttons */}
          <div className="p-6 bg-slate-550/5 border-t border-border/40 flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                if (currentStep === 1) setIsAddModalOpen(false);
                else setCurrentStep((prev) => prev - 1);
              }}
              className="h-11 rounded-xl font-bold px-6"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={currentStep === 3 ? handleAddSubmit : handleNextStep1}
              className="h-11 rounded-xl btn-primary font-black px-6 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                </>
              ) : currentStep === 3 ? (
                "Save Member Details"
              ) : (
                <>
                  Next Step <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DIALOG: WIZARD EDIT TEAM MEMBER */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && setIsEditModalOpen(false)}>
        <DialogContent className="sm:max-w-[550px] p-0 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col gap-0 select-none">
          <DialogHeader className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/40">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Pencil className="h-4.5 w-4.5 text-primary" />
              Edit Teammate details
            </DialogTitle>
          </DialogHeader>

          {/* Stepper horizontal tracker */}
          {renderStepper(editCurrentStep)}

          {errorMsg && (
            <div className="px-6 pt-4">
              <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3.5 text-xs font-bold text-rose-500">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Stepper Forms content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[45dvh] text-left text-xs">
            {editCurrentStep === 1 && (
              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Raj"
                    className="h-11 rounded-xl"
                  />
                </div>

                {/* Email address (readonly in edit) */}
                <div className="opacity-60">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Work Email Address</label>
                  <Input
                    type="email"
                    disabled
                    value={email}
                    className="h-11 rounded-xl cursor-not-allowed bg-slate-50"
                  />
                </div>

                {/* Phone & DOB */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Phone Number</label>
                    <div className="phone-input-container">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        placeholder="Teammate phone number"
                        value={phoneNumber}
                        onChange={(val) => setPhoneNumber(val || "")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="block w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark] h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {editCurrentStep === 2 && (
              <div className="space-y-4">
                {/* Employee Code & Joining Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Teammate Code</label>
                    <Input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="e.g. ANSH-005"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Joining Date</label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="block w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary [color-scheme:light] dark:[color-scheme:dark] h-11"
                    />
                  </div>
                </div>

                {/* Designation & Department */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Designation</label>
                      <button type="button" onClick={() => openAddOptionModal("designation")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={designationOptions}
                      value={designation}
                      onChange={(val) => setDesignation(val)}
                      placeholder="Select designation"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</label>
                      <button type="button" onClick={() => openAddOptionModal("department")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={departmentOptions}
                      value={department}
                      onChange={(val) => setDepartment(val)}
                      placeholder="Select department"
                    />
                  </div>
                </div>

                {/* Role & status */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Access Role</label>
                    <CustomSelect
                      options={roleOptions}
                      value={role}
                      onChange={(val) => setRole(val)}
                      placeholder="Select role"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Employment Status</label>
                    <CustomSelect
                      options={statusOptions}
                      value={status}
                      onChange={(val) => setStatus(val)}
                      placeholder="Select status"
                    />
                  </div>
                </div>

                {/* Office branch and Work Location */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Office Branch</label>
                      <button type="button" onClick={() => openAddOptionModal("branch")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={branchOptions}
                      value={branch}
                      onChange={(val) => setBranch(val)}
                      placeholder="Select branch"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Work Location</label>
                      <button type="button" onClick={() => openAddOptionModal("workLocation")} className="text-[10px] font-extrabold text-primary uppercase bg-transparent border-0 cursor-pointer">+ Add</button>
                    </div>
                    <CustomSelect
                      options={workLocationOptions}
                      value={workLocation}
                      onChange={(val) => setWorkLocation(val)}
                      placeholder="Select location"
                    />
                  </div>
                </div>

                {/* Managers */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Reporting Manager</label>
                    <CustomSelect
                      options={managerOptions}
                      value={reportingManager}
                      onChange={(val) => setReportingManager(val)}
                      placeholder="Select manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Reporting HR</label>
                    <CustomSelect
                      options={hrOptions}
                      value={reportingHR}
                      onChange={(val) => setReportingHR(val)}
                      placeholder="Select HR manager"
                    />
                  </div>
                </div>
              </div>
            )}

            {editCurrentStep === 3 && (
              <div className="space-y-4">
                {/* Personal Email & Blood group */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Personal Email Address</label>
                    <Input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="rahul.personal@gmail.com"
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Blood Group</label>
                    <CustomSelect
                      options={BLOOD_GROUP_OPTIONS}
                      value={bloodGroup}
                      onChange={(val) => setBloodGroup(val)}
                      placeholder="Select blood group"
                    />
                  </div>
                </div>

                {/* Emergency Contact info */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <Phone className="h-3.5 w-3.5" /> Emergency Contacts Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Name</label>
                      <Input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Sibling or Parent Name"
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Contact Phone</label>
                      <div className="phone-input-container">
                        <PhoneInput
                          international
                          defaultCountry="IN"
                          placeholder="Emergency contact phone"
                          value={emergencyContactPhone}
                          onChange={(val) => setEmergencyContactPhone(val || "")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Footer Action Buttons */}
          <div className="p-6 bg-slate-550/5 border-t border-border/40 flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                if (editCurrentStep === 1) setIsEditModalOpen(false);
                else setEditCurrentStep((prev) => prev - 1);
              }}
              className="h-11 rounded-xl font-bold px-6"
            >
              {editCurrentStep === 1 ? "Cancel" : "Back"}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={editCurrentStep === 3 ? handleEditSubmit : handleEditNextStep1}
              className="h-11 rounded-xl btn-primary font-black px-6 border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                </>
              ) : editCurrentStep === 3 ? (
                "Update Member Details"
              ) : (
                <>
                  Next Step <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* NESTED DIALOG: DYNAMICALLY ADD VALUE OPTIONS (designations, department, etc) */}
      <Dialog open={isAddOptionModalOpen} onOpenChange={setIsAddOptionModalOpen}>
        <DialogContent className="max-w-xs p-6 rounded-2xl border border-border/60 bg-card shadow-lg select-none text-xs text-left">
          <DialogHeader>
            <DialogTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Create New {addOptionField ? addOptionField.charAt(0).toUpperCase() + addOptionField.slice(1) : "Option"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Value Name</label>
              <Input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Type dynamic entry..."
                className="h-10 text-xs rounded-lg"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setIsAddOptionModalOpen(false)} className="rounded-lg h-9 px-4">
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateOption} disabled={newOptionLoading || !newOptionName.trim()} className="rounded-lg h-9 bg-primary text-primary-foreground border-0 font-bold px-4">
                {newOptionLoading ? <Loader2 className="h-3 animate-spin" /> : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NESTED DIALOG: DELETE TEAM MEMBER DESTRUCTIVE CONFIRMATION */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border border-border/70 bg-card shadow-2xl select-none text-xs text-left">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-rose-500 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Remove Teammate Account
            </DialogTitle>
          </DialogHeader>

          {deletingEmployee && (
            <div className="space-y-5 pt-4">
              <p className="text-slate-500 leading-relaxed">
                You are about to delete <span className="font-bold text-slate-800 dark:text-white">{deletingEmployee.name}</span> from the active workspace directory. This will:
              </p>
              <ul className="space-y-2.5 text-slate-500 list-disc pl-4">
                <li>Permanently delete their local profile and employment records.</li>
                <li>Remove their login credentials and authentication record from Supabase Auth.</li>
                <li>Free up one seat license slot in your active workspace limits.</li>
              </ul>

              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1.5">
                <span className="block text-[9px] font-bold text-rose-500 uppercase tracking-widest">Type teammate's email to confirm:</span>
                <div className="flex items-center justify-between gap-3 text-slate-650 font-mono text-[11px] font-bold select-all bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-border/40">
                  <span className="truncate">{deletingEmployee.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(deletingEmployee.email);
                      setDeleteEmailCopied(true);
                      setTimeout(() => setDeleteEmailCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded text-slate-400 border-0 bg-transparent cursor-pointer shrink-0"
                  >
                    {deleteEmailCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <Input
                  type="text"
                  value={deleteConfirmEmailInput}
                  onChange={(e) => setDeleteConfirmEmailInput(e.target.value)}
                  placeholder="Paste email address here"
                  className="h-10 text-xs rounded-lg mt-2 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-bold"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={loading || !isDeleteEmailMatched}
                  className={cn(
                    "flex-1 h-11 rounded-xl border-0 font-black",
                    isDeleteEmailMatched
                      ? "bg-rose-500 hover:bg-rose-450 text-white shadow-lg shadow-rose-500/15"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                  onClick={handleDeleteSubmit}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete Account"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
