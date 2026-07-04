"use client";

import { useEffect, useState } from "react";
import {
  HelpCircle,
  Search,
  CheckCircle,
  Trash2,
  Loader2,
  Send,
  ChevronRight,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import { ADMIN_SESSION_TOKEN } from "@/lib/admin/auth";

interface TicketComment {
  id: string;
  ticketId: string;
  employeeId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

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
  comments: TicketComment[];
}

export function SupportTicketsView() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"Open" | "In Progress" | "Resolved">("Resolved");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        headers: { "X-Admin-Auth": ADMIN_SESSION_TOKEN },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Error fetching admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Auth": ADMIN_SESSION_TOKEN,
        },
        body: JSON.stringify({
          status: replyStatus,
          resolution: replyText.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let updatedTicket = data.ticket;

        if (replyText.trim()) {
          try {
            const commentRes = await fetch("/api/admin/tickets/comments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Admin-Auth": ADMIN_SESSION_TOKEN,
              },
              body: JSON.stringify({
                ticketId: selectedTicket.id,
                content: replyText.trim(),
              }),
            });
            if (commentRes.ok) {
              const commentData = await commentRes.json();
              updatedTicket = {
                ...updatedTicket,
                comments: [...(updatedTicket.comments || []), commentData.comment],
              };
            }
          } catch (commErr) {
            console.error("Error saving ticket comment reply:", commErr);
          }
        }

        setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
        setSelectedTicket(updatedTicket);
        setReplyText("");
        setSuccessToast("Ticket updated and reply posted!");
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
        headers: { "X-Admin-Auth": ADMIN_SESSION_TOKEN },
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

  const selectTicketAndSync = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setReplyStatus(ticket.status === "Resolved" ? "Resolved" : ticket.status);
  };

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
    if (status === "Resolved") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (status === "In Progress") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  };

  const getCategoryColor = (category: string) => {
    if (category === "IT Support") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (category === "HR Support") return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    if (category === "Finance & Payouts") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  return (
    <div className="flex flex-1 overflow-hidden min-h-0 relative">
      {successToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-2xl">
          <CheckCircle className="h-4 w-4" />
          {successToast}
        </div>
      )}

      <aside className="w-80 md:w-96 border-r border-white/5 bg-[#04080F] flex flex-col shrink-0 min-w-0 h-full overflow-hidden">
        <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Support Tickets</h2>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Manage employee support requests</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID..."
                className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl px-3 pl-8 text-xs text-white outline-none focus:border-violet-500"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 text-xs px-2.5 py-1.5 outline-none appearance-none cursor-pointer pr-6"
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
            <span>Tickets ({filteredTickets.length})</span>
            <button
              onClick={fetchTickets}
              className="hover:text-violet-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Loading...</span>
            </div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => selectTicketAndSync(ticket)}
                className={`p-4 text-left cursor-pointer transition-colors border-l-2 ${
                  selectedTicket?.id === ticket.id
                    ? "bg-violet-500/5 border-l-violet-500"
                    : "border-l-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    #{ticket.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <span className="block text-xs font-bold text-slate-200 mt-2 truncate">{ticket.subject}</span>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ticket.description}</p>
                <div className="flex items-center justify-between gap-2 pt-3 text-[9.5px] text-slate-500 font-semibold uppercase">
                  <span>{ticket.employee?.name || "Employee"}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 flex flex-col items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-slate-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No tickets found.</span>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-[#020407] overflow-y-auto p-6 flex flex-col min-w-0">
        {selectedTicket ? (
          <div className="max-w-4xl w-full mx-auto space-y-6">
            <div className="bg-[#070D14] border border-white/5 rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getCategoryColor(selectedTicket.category)}`}>
                      {selectedTicket.category}
                    </span>
                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono font-bold">
                      #{selectedTicket.id.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-white pt-1.5">{selectedTicket.subject}</h2>
                </div>

                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  disabled={deletingTicketId === selectedTicket.id}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#12070D] border border-rose-500/10 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingTicketId === selectedTicket.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 bg-[#020408]/60">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-slate-300 uppercase shrink-0">
                  {selectedTicket.employee.avatarInitials}
                </div>
                <div className="text-left text-xs min-w-0">
                  <span className="block font-bold text-slate-200 truncate">{selectedTicket.employee.name}</span>
                  <span className="block text-slate-500 font-semibold truncate">
                    {selectedTicket.employee.email} · {selectedTicket.employee.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description</span>
                <p className="bg-[#020408]/40 border border-white/5 p-4 rounded-2xl text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {selectedTicket.attachmentUrl && selectedTicket.attachmentUrl.split(",").filter(Boolean).length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attachments</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachmentUrl.split(",").filter(Boolean).map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3.5 py-2 font-bold text-violet-400 hover:bg-violet-500/15 text-xs"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Attachment #{idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedTicket.resolution && (
                <div className="space-y-1.5 text-xs">
                  <span className="block text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Saved Resolution</span>
                  <p className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl text-emerald-400 leading-relaxed">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}

              {/* Discussion History */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Discussion History ({selectedTicket.comments?.length || 0})
                </span>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((comm) => {
                      const isSupport = comm.employeeId === "admin";
                      return (
                        <div
                          key={comm.id}
                          className={`p-3 rounded-2xl border text-xs space-y-1 ${
                            isSupport
                              ? "bg-violet-500/5 border-violet-500/10"
                              : "bg-[#020408]/60 border-white/5"
                          }`}
                        >
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span className={isSupport ? "text-violet-400 font-extrabold" : "text-slate-350"}>
                              {comm.authorName} {isSupport && " (Support Team)"}
                            </span>
                            <span>
                              {new Date(comm.createdAt).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-medium whitespace-pre-wrap mt-1 break-all">
                            {comm.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-550 italic text-center py-4">
                      No discussion history yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#070D14] border border-white/5 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                <Send className="h-4 w-4" />
                Reply Center
              </h3>

              <form onSubmit={handleSendReply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value as typeof replyStatus)}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Resolution Reply</label>
                  <textarea
                    required
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type resolution details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReply}
                  className="w-full h-11 bg-violet-500 text-white font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingReply ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
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
            <HelpCircle className="h-16 w-16 text-slate-800 mb-4" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Ticket Selected</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Select a ticket from the list to view details and reply.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
