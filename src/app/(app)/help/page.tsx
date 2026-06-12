"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Calendar,
  Camera,
  MapPin,
  Laptop,
  User,
  FileText,
  HelpCircle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  ShieldAlert,
  Loader2,
  Trash2,
} from "lucide-react";

type ActiveTab = "guides" | "tickets";
type GuideKey = "leaves" | "checkin" | "regularize" | "wfh" | "face" | "holidays";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  category: "IT Support" | "HR Support" | "Finance & Payouts" | "General Inquiry";
  status: "Open" | "In Progress" | "Resolved";
  resolution: string | null;
  employeeId: string;
  createdAt: string;
  employee: {
    name: string;
    email: string;
    avatarInitials: string;
    role: string;
    department: string;
  };
}

const GUIDE_CARDS = [
  {
    key: "leaves" as GuideKey,
    title: "How to Apply for Leaves",
    description: "Follow the standard procedure to request and schedule leaves.",
    icon: Calendar,
    iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
  },
  {
    key: "checkin" as GuideKey,
    title: "Selfie Check-in & Location Verification",
    description: "Verify attendance daily using your camera and GPS.",
    icon: Camera,
    iconColor: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20",
  },
  {
    key: "regularize" as GuideKey,
    title: "Regularizing Attendance Logs",
    description: "Request correction for missing punches or incorrect hours.",
    icon: MapPin,
    iconColor: "text-sky-500 bg-sky-50 dark:bg-sky-950/20",
  },
  {
    key: "wfh" as GuideKey,
    title: "Work From Home (WFH) Requests",
    description: "Submit remote work requests according to company branch policy.",
    icon: Laptop,
    iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
  },
  {
    key: "face" as GuideKey,
    title: "Setting Up Face Enrollment",
    description: "Register your face photo to enable biometric selfie attendance check-in.",
    icon: User,
    iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
  },
  {
    key: "holidays" as GuideKey,
    title: "Viewing Holidays & Policies",
    description: "Check upcoming company holidays and policy files.",
    icon: FileText,
    iconColor: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
  },
];

const GUIDE_STEPS: Record<GuideKey, { title: string; description: string; element: string }[]> = {
  leaves: [
    {
      title: "Navigate to Leaves Dashboard",
      description: "Go to your sidebar menu, click on Settings, and then select 'Company Settings' or check your employee dashboard parameters to locate the leave manager portal.",
      element: "Sidebar -> Profile Settings -> Leave Allocation Panel",
    },
    {
      title: "Click 'Request Leave'",
      description: "Click the primary blue button labeled 'Request Leave' or 'Apply for Time Off' to open the leave request drawer application.",
      element: "Button: Apply Leave",
    },
    {
      title: "Choose Type & Date Range",
      description: "Select from Casual Leave, Sick Leave, or Earned Leave. Pick start and end dates. Add notes explaining your absence request.",
      element: "Form Fields: Leave Type, Dates, Details",
    },
    {
      title: "Submit and Track Status",
      description: "Click submit. Your manager will receive an immediate notification, and your request will list under 'Pending Leaves' until resolved.",
      element: "Success State: Status is Pending Approval",
    },
  ],
  checkin: [
    {
      title: "Open Check-In Application",
      description: "Open the workspace check-in screen on your browser or native mobile device dashboard.",
      element: "Attendance Dashboard -> Daily Punch-In",
    },
    {
      title: "Grant Device Permissions",
      description: "Make sure you grant the application permission to access your device's Camera and GPS location services when requested.",
      element: "Prompt: Allow Camera & Location access",
    },
    {
      title: "Snap Attendance Selfie",
      description: "Align your face inside the circle frame and snap a clear selfie photo to register biometric confirmation.",
      element: "Camera View -> Snap Selfie",
    },
    {
      title: "Click Punch-In Log",
      description: "Click the primary check-in log button. Your GPS coordinate and photo will be synced to the workspace attendance sheet.",
      element: "Success State: Punched In at 09:30 AM",
    },
  ],
  regularize: [
    {
      title: "Go to Attendance Logs",
      description: "Access your monthly attendance record sheet inside the system settings or time sheets view.",
      element: "Settings -> Attendance Registry",
    },
    {
      title: "Select Missing Log Day",
      description: "Find any day labeled with a warning icon (missing punch or insufficient work hours) and click the 'Regularize' button.",
      element: "Log Day: Warning missing punch-out",
    },
    {
      title: "Enter Actual Working Hours",
      description: "Specify the exact times you checked-in and out, and choose a valid regularization reason (e.g. client visit, power issue).",
      element: "Form: Regularization Reason & Timings",
    },
    {
      title: "Submit for HR Approval",
      description: "Submit the request. Your reporting HR manager will receive the verification claim to update your daily timesheet.",
      element: "Status: Awaiting HR Approval",
    },
  ],
  wfh: [
    {
      title: "Check Branch Policies",
      description: "Verify your assigned office branch's WFH policy to check maximum allowed remote days per week.",
      element: "Settings -> Company Profile -> Branch WFH Policy",
    },
    {
      title: "Open WFH Request Portal",
      description: "Navigate to the attendance requests panel and select 'Apply for Work From Home'.",
      element: "Attendance Portal -> Apply WFH",
    },
    {
      title: "Enter Request Parameters",
      description: "Specify the date ranges for WFH and add key project deliverables you will be handling from your remote location.",
      element: "Form Fields: Dates, Work Agenda",
    },
    {
      title: "Submit for Manager Review",
      description: "Submit the request. Your reporting manager will review the workload agenda and authorize the remote status log.",
      element: "Status: Pending Manager Approval",
    },
  ],
  face: [
    {
      title: "Access Face Enrollment Panel",
      description: "Go to your Profile settings, and scroll down to the security credentials and face enrollment tab.",
      element: "Profile Settings -> Biometric Settings",
    },
    {
      title: "Initiate Face Scanning",
      description: "Click the 'Setup Face Check-in' button. A secure web camera framework overlay will appear.",
      element: "Camera Portal: Align your face inside the guidelines",
    },
    {
      title: "Register Facial Coordinates",
      description: "Slowly rotate your head as indicated by the screen guidelines to scan facial points securely.",
      element: "Progress Bar: Enrolling face 100% complete",
    },
    {
      title: "Save Profile Credentials",
      description: "Save credentials. Your face ID registry is now securely set up to let you check-in using the mobile camera app.",
      element: "Success State: Face enrolled successfully",
    },
  ],
  holidays: [
    {
      title: "Navigate to Holidays Widget",
      description: "Find the holidays calendar block on your dashboard overview or organizational wiki workspace.",
      element: "Dashboard Overview -> Holidays Tab",
    },
    {
      title: "Filter by Office Branch",
      description: "Filter holidays using your assigned branch (e.g., Delhi, Mumbai, or Remote HQ) since schedules vary by location.",
      element: "Dropdown: Select Assigned Branch",
    },
    {
      title: "View Upcoming Holidays",
      description: "Review lists of upcoming paid holidays, dry days, and corporate shut-downs for the current calendar year.",
      element: "Wiki View: Holidays List",
    },
    {
      title: "Download Policy Handbooks",
      description: "Download PDFs of official HR policies, leave handbooks, and standard guidelines from the attachment log.",
      element: "Download Link: Corporate Policy Handbook PDF",
    },
  ],
};

export default function HelpCenterPage() {
  const { currentUser, initialize } = useExpenseStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("guides");
  const [loading, setLoading] = useState(true);

  // Tickets states
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [fetchingTickets, setFetchingTickets] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("IT Support");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketFilter, setTicketFilter] = useState("All");
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketListTab, setTicketListTab] = useState<"my" | "workspace">("my");

  // Ticket Detail Dialog states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [adminStatus, setAdminStatus] = useState<"Open" | "In Progress" | "Resolved">("Open");
  const [adminResolution, setAdminResolution] = useState("");

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Guides Interactive Tour states
  const [activeGuide, setActiveGuide] = useState<GuideKey | null>(null);
  const [guideStepIdx, setGuideStepIdx] = useState(0);

  const getHeaders = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("ansh_auth_token") : null;
    const impersonateId = typeof window !== "undefined" ? sessionStorage.getItem("ansh_impersonate_user_id") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(impersonateId ? { "X-Impersonate-User": impersonateId } : {}),
    };
  };

  const loadInitialData = async () => {
    try {
      await initialize();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [initialize]);

  const loadTickets = async () => {
    setFetchingTickets(true);
    try {
      const res = await fetch("/api/tickets", {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setFetchingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === "tickets") {
      loadTickets();
    }
  }, [activeTab]);

  const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
    currentUser?.role?.toLowerCase() || ""
  );

  useEffect(() => {
    if (isManagement) {
      setTicketListTab("workspace");
    } else {
      setTicketListTab("my");
    }
  }, [currentUser, isManagement]);

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      setErrorMsg("Subject and description cannot be empty.");
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          description: ticketDescription.trim(),
          priority: ticketPriority,
          category: ticketCategory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit ticket");
      }

      setTicketSubject("");
      setTicketDescription("");
      setTicketPriority("Medium");
      setTicketCategory("IT Support");
      setSuccessMsg("Support ticket raised successfully!");
      loadTickets();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to create support ticket.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setUpdatingTicketId(id);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          status: adminStatus,
          resolution: adminResolution,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local list
        setTickets(prev => prev.map(t => (t.id === id ? data.ticket : t)));
        setSelectedTicket(data.ticket);
        setSuccessMsg("Ticket updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to update ticket status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this support ticket?")) return;

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedTicket(null);
        setSuccessMsg("Ticket deleted successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to delete ticket");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAdminStatus(ticket.status);
    setAdminResolution(ticket.resolution || "");
  };

  const startGuide = (guide: GuideKey) => {
    setActiveGuide(guide);
    setGuideStepIdx(0);
  };

  const currentGuideData = activeGuide ? GUIDE_STEPS[activeGuide] : [];
  const currentStep = activeGuide ? currentGuideData[guideStepIdx] : null;

  // Filtered tickets logic
  const filteredTickets = tickets.filter(t => {
    // Tab list filters
    if (ticketListTab === "my" && t.employeeId !== currentUser?.id) return false;

    // Search query check
    const searchLower = ticketSearch.toLowerCase();
    const matchesSearch =
      t.subject.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower) ||
      t.employee.name.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status filter dropdown check
    if (ticketFilter !== "All" && t.status !== ticketFilter) return false;

    return true;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    if (priority === "Medium") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    return "bg-sky-500/10 text-sky-600 dark:text-sky-400";
  };

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (status === "In Progress") return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  };

  const getCategoryColor = (category: string) => {
    if (category === "IT Support") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (category === "HR Support") return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    if (category === "Finance & Payouts") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-80 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="crm-card border border-border/40 opacity-70">
              <CardContent className="p-6 space-y-4">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Help Center Support | Ansh Expense</title>
      <meta
        name="description"
        content="Access tutorial logs and guides, or raise and track support tickets with our administration department."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Help Center Support"
          title="Support & Guides Desk"
          description="Access tutorial logs and guides, or raise and track support tickets with our administration department."
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => setActiveTab("guides")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "guides"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <FileText className="h-4 w-4" />
          Interactive Guides
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === "tickets"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Support Ticket Desk
        </button>
      </div>

      {/* SUCCESS/ERROR POPUPS */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-xs font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4 text-xs font-bold text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* 1. INTERACTIVE GUIDES TAB */}
      {activeTab === "guides" && (
        <div className="grid gap-6 md:grid-cols-2">
          {GUIDE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.key}
                className="crm-card border border-border/40 hover:border-primary/20 transition-all hover:scale-[1.01] duration-300 flex flex-col justify-between"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-2xl h-11 w-11 flex items-center justify-center shrink-0 ${card.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <button
                      onClick={() => startGuide(card.key)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                    >
                      Launch Interactive Guide
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 2. SUPPORT TICKET DESK TAB */}
      {activeTab === "tickets" && (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Left Side */}
          <div className="lg:col-span-1">
            <Card className="crm-card h-fit sticky top-6">
              <CardHeader>
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Raise a Support Ticket
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  Log issues with IT infrastructure, workspace payout logs, or HR claims parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <form onSubmit={handleRaiseTicket} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Scanner not reading PDFs"
                      className="mt-2 block w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Category
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="mt-2 block w-full rounded-2xl border border-border bg-card dark:bg-slate-900/60 px-4.5 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        <option value="IT Support">IT Support</option>
                        <option value="HR Support">HR Support</option>
                        <option value="Finance & Payouts">Finance & Payouts</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Priority
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="mt-2 block w-full rounded-2xl border border-border bg-card dark:bg-slate-900/60 px-4.5 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Please provide full details of the issue..."
                      className="mt-2 block w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingTicket}
                    className="btn-primary w-full h-11 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submittingTicket ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Submit Support Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Listing Right Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="crm-card">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-border/50 max-w-fit">
                    <button
                      onClick={() => setTicketListTab("my")}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all uppercase cursor-pointer ${
                        ticketListTab === "my"
                          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      My Tickets
                    </button>
                    {isManagement && (
                      <button
                        onClick={() => setTicketListTab("workspace")}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all uppercase cursor-pointer ${
                          ticketListTab === "workspace"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                      >
                        Workspace Tickets
                      </button>
                    )}
                  </div>

                  <div className="flex flex-1 max-w-sm gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={ticketSearch}
                        onChange={(e) => setTicketSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="block w-full rounded-xl border border-border bg-transparent pl-9 pr-3 py-1.5 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                      />
                    </div>

                    <select
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="rounded-xl border border-border bg-card text-xs px-2.5 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                {fetchingTickets ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Loading tickets...
                    </span>
                  </div>
                ) : filteredTickets.length > 0 ? (
                  <div className="divide-y divide-border/40 px-6">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => openTicketDetails(ticket)}
                        className="py-4.5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 rounded-xl px-3 -mx-3 transition-colors group"
                      >
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`text-[9px] font-extrabold px-2 py-0.5 border-0 hover:bg-transparent uppercase ${getCategoryColor(ticket.category)}`}>
                              {ticket.category}
                            </Badge>
                            <Badge className={`text-[9px] font-extrabold px-2 py-0.5 border-0 hover:bg-transparent uppercase ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              #{ticket.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <span className="block text-sm font-bold text-slate-850 dark:text-slate-200 group-hover:text-primary transition-colors">
                            {ticket.subject}
                          </span>
                          <span className="block text-xs text-slate-400 line-clamp-1">
                            {ticket.description}
                          </span>
                          <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-semibold pt-1">
                            Raised by {ticket.employee?.name} ({ticket.employee?.role}) · {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className={`text-[10px] font-bold border-0 hover:bg-transparent uppercase ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-xs text-slate-400 italic">No tickets found matching current filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================
          1. INTERACTIVE GUIDES TOUR MODAL
          ======================================================== */}
      {activeGuide && currentStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border/80 shadow-2xl p-6.5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                  Interactive Guide Walkthrough
                </span>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white mt-2">
                  {GUIDE_CARDS.find((c) => c.key === activeGuide)?.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveGuide(null)}
                className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Step Progress Tracker */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{currentStep.title}</span>
                <span>
                  Step {guideStepIdx + 1} of {currentGuideData.length}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${((guideStepIdx + 1) / currentGuideData.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="mt-8 space-y-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Mock Screen Component representation for Premium Feel */}
              <div className="rounded-2xl border border-border/70 bg-slate-50/50 dark:bg-slate-900/40 p-4.5">
                <span className="block text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                  CRM Screen Highlight
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs font-bold text-primary">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{currentStep.element}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-8.5 pt-4.5 border-t border-border/40 flex justify-between">
              <Button
                variant="ghost"
                disabled={guideStepIdx === 0}
                onClick={() => setGuideStepIdx((prev) => prev - 1)}
                className="h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={() => {
                  if (guideStepIdx === currentGuideData.length - 1) {
                    setActiveGuide(null);
                  } else {
                    setGuideStepIdx((prev) => prev + 1);
                  }
                }}
                className="btn-primary h-10 rounded-xl px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                {guideStepIdx === currentGuideData.length - 1 ? (
                  <>
                    Finish Tour
                    <CheckCircle className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. SUPPORT TICKET DETAILS DRAWER / MODAL
          ======================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative h-full w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6.5 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Ticket Details #{selectedTicket.id.slice(-6).toUpperCase()}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Badges Info */}
              <div className="flex flex-wrap gap-2.5">
                <Badge className={`text-[10px] font-bold px-2.5 py-0.5 border-0 hover:bg-transparent uppercase ${getStatusColor(selectedTicket.status)}`}>
                  Status: {selectedTicket.status}
                </Badge>
                <Badge className={`text-[10px] font-bold px-2.5 py-0.5 border-0 hover:bg-transparent uppercase ${getCategoryColor(selectedTicket.category)}`}>
                  Category: {selectedTicket.category}
                </Badge>
                <Badge className={`text-[10px] font-bold px-2.5 py-0.5 border-0 hover:bg-transparent uppercase ${getPriorityColor(selectedTicket.priority)}`}>
                  Priority: {selectedTicket.priority}
                </Badge>
              </div>

              {/* Creator Coordinates */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-755 dark:bg-slate-800 dark:text-slate-350">
                  {selectedTicket.employee.avatarInitials}
                </div>
                <div className="text-left text-xs min-w-0">
                  <span className="block font-bold text-slate-800 dark:text-white truncate">
                    {selectedTicket.employee.name}
                  </span>
                  <span className="block text-slate-400 font-semibold truncate">
                    {selectedTicket.employee.email} · {selectedTicket.employee.department}
                  </span>
                </div>
              </div>

              {/* Ticket Description */}
              <div className="space-y-2.5 text-xs">
                <span className="block font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Issue Description
                </span>
                <p className="text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-border/40 whitespace-pre-wrap leading-relaxed font-medium">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Resolution Notes Log (If resolved or has comment) */}
              {selectedTicket.resolution && (
                <div className="space-y-2.5 text-xs">
                  <span className="block font-black text-[10px] uppercase tracking-widest text-emerald-500">
                    ✦ Resolution Update
                  </span>
                  <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
                    {selectedTicket.resolution}
                  </div>
                </div>
              )}

              {/* Management Admin Status controls */}
              {isManagement && (
                <form
                  onSubmit={(e) => handleUpdateTicket(e, selectedTicket.id)}
                  className="space-y-4 pt-4 border-t border-border/40"
                >
                  <span className="block font-black text-[10px] uppercase tracking-widest text-primary">
                    Support Desk Actions (Admin/HR)
                  </span>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        Update Ticket Status
                      </label>
                      <select
                        value={adminStatus}
                        onChange={(e) => setAdminStatus(e.target.value as any)}
                        className="mt-2 block w-full rounded-xl border border-border bg-card dark:bg-slate-900/60 px-3.5 py-2.5 text-xs text-foreground outline-none cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Resolution Message / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminResolution}
                      onChange={(e) => setAdminResolution(e.target.value)}
                      placeholder="e.g. Restarted IT server nodes. The claim is now verified."
                      className="mt-2 block w-full rounded-xl border border-border bg-transparent px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updatingTicketId === selectedTicket.id}
                    className="btn-primary w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {updatingTicketId === selectedTicket.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Status...
                      </>
                    ) : (
                      "Save Ticket Status Log"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Bottom Actions - Delete ticket */}
            <div className="pt-4 border-t border-border/40 mt-8 flex gap-3">
              {(currentUser?.role === "Admin" ||
                currentUser?.role === "Owner" ||
                selectedTicket.employeeId === currentUser?.id) && (
                <Button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  variant="ghost"
                  className="h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 w-full rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                  Delete Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
