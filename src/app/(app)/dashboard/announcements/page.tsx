"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Megaphone,
  Pin,
  Archive,
  Trash2,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  FolderOpen
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  archived: boolean;
  wid: number;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const { currentUser } = useExpenseStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Selected announcement for edit / delete
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Role helper
  const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
    currentUser?.role?.toLowerCase() || ""
  );

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("ansh_auth_token");
      const impersonateId = sessionStorage.getItem("ansh_impersonate_user_id");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
        ...(impersonateId ? { "X-Impersonate-User": impersonateId } : {}),
      };

      const url = `/api/announcements?includeArchived=true`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch announcements");
      const data = await res.json();
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error(err);
      showToast("Error loading announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle CRUD submissions
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError("Title and body are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ title, body, pinned }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create announcement");
      }

      showToast("Announcement published successfully!");
      setCreateOpen(false);
      setTitle("");
      setBody("");
      setPinned(false);
      fetchAnnouncements();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;
    if (!title.trim() || !body.trim()) {
      setFormError("Title and body are required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/announcements/${selectedAnnouncement.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ title, body, pinned }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update announcement");
      }

      showToast("Announcement updated successfully!");
      setEditOpen(false);
      setSelectedAnnouncement(null);
      setTitle("");
      setBody("");
      setPinned(false);
      fetchAnnouncements();
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (ann: Announcement) => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ pinned: !ann.pinned }),
      });

      if (!res.ok) throw new Error("Pin toggle failed");
      showToast(ann.pinned ? "Announcement unpinned" : "Announcement pinned to top!");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle pin state", "error");
    }
  };

  const handleToggleArchive = async (ann: Announcement) => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/announcements/${ann.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ archived: !ann.archived }),
      });

      if (!res.ok) throw new Error("Archive toggle failed");
      showToast(ann.archived ? "Notice restored successfully" : "Notice archived successfully");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to archive/restore announcement", "error");
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    setSubmitting(true);

    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      const res = await fetch(`/api/announcements/${selectedAnnouncement.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      showToast("Announcement permanently deleted");
      setDeleteOpen(false);
      setSelectedAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setTitle("");
    setBody("");
    setPinned(false);
    setFormError("");
    setCreateOpen(true);
  };

  const openEditModal = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setTitle(ann.title);
    setBody(ann.body);
    setPinned(ann.pinned);
    setFormError("");
    setEditOpen(true);
  };

  const openDeleteModal = (ann: Announcement) => {
    setSelectedAnnouncement(ann);
    setDeleteOpen(true);
  };

  // Filter lists based on tab choice
  const displayedAnnouncements = announcements.filter((ann) => {
    if (activeTab === "archived") return ann.archived;
    return !ann.archived;
  });

  const pinnedNotices = displayedAnnouncements.filter((ann) => ann.pinned);
  const generalNotices = displayedAnnouncements.filter((ann) => !ann.pinned);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Company Announcements | Ansh Expense</title>
      <meta name="description" content="View company announcements, pin guidelines, archive updates, and notify team members in your workspace." />

      <PageHeader
        eyebrow="Notice Board"
        title="Workspace Announcements"
        description="Official updates, policies, and notices broadcasted by workspace administrators."
        action={
          isManagement
            ? {
                label: "Publish Notice",
                icon: Plus,
                onClick: openCreateModal,
              }
            : undefined
        }
      />

      {/* TABS (For managers only, to toggle archive view) */}
      {isManagement && (
        <div className="flex items-center gap-4 border-b border-border/40 pb-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === "active"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Active Notices
            {activeTab === "active" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === "archived"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Archived Notices ({announcements.filter((a) => a.archived).length})
            {activeTab === "archived" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded" />
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="crm-card border border-border/45 opacity-60 animate-pulse h-48">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayedAnnouncements.length > 0 ? (
        <div className="space-y-8">
          {/* PINNED SECTION */}
          {pinnedNotices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-450">
                <Pin className="h-3.5 w-3.5 rotate-45 text-primary" />
                <span>Pinned Broadcasts</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {pinnedNotices.map((ann) => (
                  <Card
                    key={ann.id}
                    className="crm-card relative border border-primary/20 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Badge className="bg-primary/10 text-primary border-0 hover:bg-primary/10 text-[9px] font-black uppercase tracking-wider mb-2">
                          Pinned Notice
                        </Badge>
                        <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                          {ann.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {isManagement && (
                          <>
                            <button
                              onClick={() => handleTogglePin(ann)}
                              title="Unpin notice"
                              className="p-1 text-primary hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Pin className="h-3.5 w-3.5 rotate-45" />
                            </button>
                            <button
                              onClick={() => openEditModal(ann)}
                              title="Edit notice"
                              className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleArchive(ann)}
                              title={ann.archived ? "Restore Notice" : "Archive Notice"}
                              className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(ann)}
                              title="Permanently Delete"
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-wrap">
                        {ann.body}
                      </p>
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>Broadcasted by {ann.authorName}</span>
                        <span>
                          {new Date(ann.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* GENERAL SECTION */}
          {generalNotices.length > 0 && (
            <div className="space-y-4">
              {pinnedNotices.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-450 border-t border-border/40 pt-6">
                  <span>General Updates</span>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {generalNotices.map((ann) => (
                  <Card key={ann.id} className="crm-card border border-border/45 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                      <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {ann.title}
                      </CardTitle>
                      <div className="flex items-center gap-0.5">
                        {isManagement && (
                          <>
                            <button
                              onClick={() => handleTogglePin(ann)}
                              title="Pin notice to top"
                              className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(ann)}
                              title="Edit notice"
                              className="p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleArchive(ann)}
                              title={ann.archived ? "Restore Notice" : "Archive Notice"}
                              className="p-1 text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(ann)}
                              title="Permanently Delete"
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">
                        {ann.body}
                      </p>
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>By {ann.authorName}</span>
                        <span>
                          {new Date(ann.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="crm-card border border-dashed border-border/60">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              No updates broadcasted
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              {activeTab === "archived"
                ? "No archived notices were found."
                : "Your bulletin board is currently clear of broadcasts."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CREATE MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Publish Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Broadcast a new message to all employees in your workspace.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-450 dark:text-rose-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-550">
                Notice Title / Topic
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Server Maintenance, Office Closed on Monday"
                className="h-11 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-550">
                Announcement Content
              </label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write description here..."
                rows={5}
                className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-900 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pin-chk"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 accent-primary cursor-pointer"
              />
              <label htmlFor="pin-chk" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                Pin this notice to top of feed
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="btn-primary rounded-2xl gap-2 border-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Broadcast"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Announcement
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-450 dark:text-rose-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-550">
                Notice Title / Topic
              </label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-550">
                Announcement Content
              </label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="block w-full rounded-2xl border border-border bg-card dark:bg-slate-900 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none hover:bg-slate-50/50 resize-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pin-chk-edit"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 accent-primary cursor-pointer"
              />
              <label htmlFor="pin-chk-edit" className="text-xs font-bold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                Pin this notice to top of feed
              </label>
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="btn-primary rounded-2xl gap-2 border-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] p-6 rounded-3xl border border-border bg-card backdrop-blur-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Delete Announcement?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-450 leading-relaxed mt-1">
              Are you sure you want to permanently delete this announcement? This action cannot be undone and it will be removed from all employee feeds.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2 flex flex-col-reverse sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-2 border-0 w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TOAST FEEDBACK */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card/90 px-4 py-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />
          )}
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
              {toast.type === "success" ? "Notification" : "Error"}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-4 text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
