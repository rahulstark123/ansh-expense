"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Loader2,
  Lock,
  Mail,
  LogOut,
  Send,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Building,
  Paperclip
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  category: "IT Support" | "HR Support" | "Finance & Payouts" | "General Inquiry";
  status: "Open" | "In Progress" | "Resolved";
  resolution: string | null;
  attachmentUrl: string | null;
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

export default function AdminPanelPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Reply form state
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"Open" | "In Progress" | "Resolved">("Resolved");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState("");

  const adminToken = "Rahul@123";

  // Check login session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("ansh_admin_token");
    if (savedToken === adminToken) {
      setIsLoggedIn(true);
      fetchTickets();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (email === "expense@anshapps.com" && password === "Rahul@123") {
      sessionStorage.setItem("ansh_admin_token", adminToken);
      setIsLoggedIn(true);
      fetchTickets();
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ansh_admin_token");
    setIsLoggedIn(false);
    setTickets([]);
    setSelectedTicket(null);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        headers: {
          "X-Admin-Auth": adminToken,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      } else {
        console.error("Failed to load tickets");
      }
    } catch (err) {
      console.error("Error fetching admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Auth": adminToken,
        },
        body: JSON.stringify({
          status: replyStatus,
          resolution: replyText.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedTicket = data.ticket;

        // Update list
        setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
        setSelectedTicket(updatedTicket);
        setSuccessToast("Ticket updated & resolution saved successfully!");
        setTimeout(() => setSuccessToast(""), 4000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this support ticket?")) return;

    setDeletingTicketId(id);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "DELETE",
        headers: {
          "X-Admin-Auth": adminToken,
        },
      });

      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        if (selectedTicket?.id === id) {
          setSelectedTicket(null);
          setReplyText("");
        }
        setSuccessToast("Ticket deleted successfully!");
        setTimeout(() => setSuccessToast(""), 4000);
      } else {
        alert("Failed to delete ticket");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Sync reply state when selecting a new ticket
  const selectTicketAndSync = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.resolution || "");
    setReplyStatus(ticket.status === "Resolved" ? "Resolved" : ticket.status);
  };

  // Filters logic
  const filteredTickets = tickets.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      t.subject.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower) ||
      t.employee.name.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;
    if (statusFilter !== "All" && t.status !== statusFilter) return false;

    return true;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === "High") return "bg-rose-500/10 text-rose-400 border border-rose-500/25";
    if (priority === "Medium") return "bg-amber-500/10 text-amber-400 border border-amber-500/25";
    return "bg-sky-500/10 text-sky-400 border border-sky-500/25";
  };

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20";
    if (status === "In Progress") return "bg-amber-500/10 text-amber-450 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-450 border border-rose-500/20";
  };

  const getCategoryColor = (category: string) => {
    if (category === "IT Support") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (category === "HR Support") return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    if (category === "Finance & Payouts") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  // 1. LOGIN SCREEN UI
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020408] font-sans text-slate-100 flex items-center justify-center relative px-4 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute left-[30%] top-[25%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute right-[30%] top-[40%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md bg-[#0A0F18]/85 border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-indigo-400" />
            </div>
            <h1 className="text-xl font-black tracking-widest text-white uppercase">ANSH SUPPORT</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Administrative Reply Center</p>
          </div>

          {loginError && (
            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 text-xs font-bold text-rose-455 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="expense@anshapps.com"
                  className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-indigo-500"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 bg-slate-950/85 border border-slate-800 rounded-2xl px-4 pl-10 text-xs text-white outline-none focus:border-indigo-500"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-indigo-500 text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Sign In to Support Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN SPLIT-PANE UI
  return (
    <div className="min-h-screen bg-[#020408] font-sans text-slate-100 flex flex-col h-screen overflow-hidden">
      <title>ANSH Admin Support Desk</title>

      {/* TOP HEADER */}
      <header className="h-16 border-b border-white/5 bg-[#060A10]/95 flex items-center justify-between px-6 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-8.5 w-8.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white block">ANSH EXPENSE</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Support Response Desk</span>
          </div>
        </div>

        {/* Global Toast */}
        {successToast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-2xl animate-in zoom-in duration-200">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            {successToast}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 hover:text-rose-455 text-xs font-bold text-slate-300 px-3.5 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </header>

      {/* SPLIT PANE GRID */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT PANE - Ticket list */}
        <aside className="w-80 md:w-96 border-r border-white/5 bg-[#04080F] flex flex-col shrink-0 min-w-0 h-full overflow-hidden">
          
          {/* List Toolbar */}
          <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID..."
                  className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl px-3 pl-8 text-xs text-white outline-none focus:border-indigo-500"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-850 bg-slate-950 text-xs px-2.5 py-1.5 outline-none appearance-none cursor-pointer pr-6"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none rotate-90" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Support Tickets ({filteredTickets.length})</span>
              <button
                onClick={fetchTickets}
                className="hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Refresh ticket queue"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading tickets...</span>
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => selectTicketAndSync(ticket)}
                  className={`p-4 text-left cursor-pointer transition-colors border-l-2 ${
                    selectedTicket?.id === ticket.id
                      ? "bg-indigo-500/5 border-l-indigo-500"
                      : "border-l-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] text-slate-450 font-bold font-mono">
                      #{ticket.id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <span className="block text-xs font-bold text-slate-200 mt-2 truncate">
                    {ticket.subject}
                  </span>
                  
                  <p className="text-[11px] text-slate-450 mt-1 line-clamp-1">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-3 text-[9.5px] text-slate-500 font-semibold uppercase">
                    <span>{ticket.employee?.name || "Workspace Employee"}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 flex flex-col items-center justify-center gap-2">
                <HelpCircle className="h-8 w-8 text-slate-700" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No tickets matching filters.</span>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE - Reply center */}
        <main className="flex-1 bg-[#020407] overflow-y-auto p-6 flex flex-col min-w-0 h-full">
          {selectedTicket ? (
            <div className="max-w-4xl w-full mx-auto space-y-6 flex flex-col justify-between min-h-full">
              
              {/* Ticket details card */}
              <div className="bg-[#070D14] border border-white/5 rounded-3xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4.5 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getCategoryColor(selectedTicket.category)}`}>
                        {selectedTicket.category}
                      </span>
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono font-bold">
                        TICKET ID: #{selectedTicket.id.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base font-black text-white pt-1.5">{selectedTicket.subject}</h2>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    disabled={deletingTicketId === selectedTicket.id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12070D] border border-rose-500/10 text-rose-455 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete Support Ticket"
                  >
                    {deletingTicketId === selectedTicket.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>

                {/* Submitter details */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 bg-[#020408]/60">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-slate-300 uppercase shrink-0">
                    {selectedTicket.employee.avatarInitials}
                  </div>
                  <div className="text-left text-xs min-w-0">
                    <span className="block font-bold text-slate-200 truncate">{selectedTicket.employee.name}</span>
                    <span className="block text-slate-500 font-semibold truncate">
                      {selectedTicket.employee.email} · {selectedTicket.employee.role} ({selectedTicket.employee.department})
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-1.5 text-xs">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Question / Issue Description</span>
                  <p className="bg-[#020408]/40 border border-white/5 p-4.5 rounded-2xl text-slate-300 leading-relaxed font-semibold whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Attachments */}
                {selectedTicket.attachmentUrl && selectedTicket.attachmentUrl.split(",").filter(Boolean).length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attached Files</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTicket.attachmentUrl.split(",").filter(Boolean).map((url, idx) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 font-bold text-indigo-400 hover:bg-indigo-500/15 transition-all text-xs"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Attachment #{idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical resolution message */}
                {selectedTicket.resolution && (
                  <div className="space-y-1.5 text-xs">
                    <span className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest">✦ Saved Resolution Notes</span>
                    <p className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-emerald-450 leading-relaxed font-semibold">
                      {selectedTicket.resolution}
                    </p>
                  </div>
                )}
              </div>

              {/* Reply / Resolution Center Card */}
              <div className="bg-[#070D14] border border-white/5 rounded-3xl p-6 mt-6 space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Send className="h-4 w-4" />
                  Reply Center
                </h3>

                <form onSubmit={handleSendReply} className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Update Ticket Status</label>
                      <div className="relative">
                        <select
                          value={replyStatus}
                          onChange={(e) => setReplyStatus(e.target.value as any)}
                          className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 pr-8 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer appearance-none"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resolution Message / Admin Reply</label>
                    <textarea
                      required
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type ticket resolution reply details here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="w-full h-11 bg-indigo-500 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingReply ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Reply...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Post Reply & Save Status
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <HelpCircle className="h-16 w-16 text-slate-800 animate-pulse mb-4" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Ticket Selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a support ticket from the left panel listing to inspect its details, change status, and submit a resolution reply.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
