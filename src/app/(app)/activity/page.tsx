"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/crm/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/stores/expense-store";
import {
  Wallet,
  FolderOpen,
  UsersRound,
  Megaphone,
  History,
  MessageSquare,
  ChevronRight,
  Loader2,
  CalendarCheck2
} from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  category: "expenses" | "projects" | "team" | "announcements";
  action: "created" | "updated" | "commented" | "joined" | "posted";
  title: string;
  description: string;
  actorName: string;
  actorInitials: string;
  timestamp: string;
  link: string;
}

export default function ActivityFeedPage() {
  const { currentUser } = useExpenseStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchActivity = async (cat: string, pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const token = sessionStorage.getItem("ansh_auth_token");
      const impersonateId = sessionStorage.getItem("ansh_impersonate_user_id");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
        ...(impersonateId ? { "X-Impersonate-User": impersonateId } : {}),
      };

      const categoryQuery = cat !== "all" ? `&category=${cat}` : "";
      const url = `/api/activity?page=${pageNum}&limit=15${categoryQuery}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = await res.json();

      if (append) {
        setActivities((prev) => [...prev, ...data.activity]);
      } else {
        setActivities(data.activity);
      }
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchActivity(category, 1, false);
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, currentUser.id]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivity(category, nextPage, true);
  };

  function formatRelativeTime(dateString: string) {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case "expenses":
        return {
          color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          icon: Wallet,
          label: "Expense Tracking",
        };
      case "projects":
        return {
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: FolderOpen,
          label: "Project Mapping",
        };
      case "team":
        return {
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: UsersRound,
          label: "Team Directory",
        };
      case "announcements":
        return {
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: Megaphone,
          label: "Announcements",
        };
      default:
        return {
          color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          icon: History,
          label: "Activity",
        };
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "commented":
        return MessageSquare;
      case "joined":
        return UsersRound;
      case "posted":
        return Megaphone;
      case "created":
        return CalendarCheck2;
      default:
        return History;
    }
  };

  const filterTabs = [
    { id: "all", label: "All Activity", icon: History },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "team", label: "Team", icon: UsersRound },
    { id: "announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <title>Activity Feed | Ansh Expense</title>
      <meta name="description" content="View the real-time activity log of your workspace including expense approvals, new project mapping, team signups, and announcements." />

      <PageHeader
        eyebrow="Timeline"
        title="Activity Feed"
        description="A live record of actions and updates happening across your workspace."
      />

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/40">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TIMELINE LIST */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx} className="crm-card border border-border/40 opacity-70 animate-pulse">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-5 pl-8 space-y-6">
          {activities.map((item) => {
            const config = getCategoryConfig(item.category);
            const CategoryIcon = config.icon;
            const ActionIcon = getActionIcon(item.action);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[45px] top-1 bg-white dark:bg-[#0b0c0e] rounded-full p-1.5 border-2 border-slate-200 dark:border-slate-800 group-hover:border-primary transition-colors duration-200">
                  <CategoryIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
                </div>

                <Card className="crm-card hover:-translate-y-0.5 transition-all duration-300 border border-border/40 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm hover:shadow-md">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-300 text-xs border border-border/40">
                        {item.actorInitials || "SY"}
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">
                            {item.title}
                          </span>
                          <Badge variant="outline" className={`h-5 px-2 text-[9px] font-bold rounded-full ${config.color}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                          {item.description}
                        </p>
                        <div className="text-[10px] font-semibold text-slate-450 dark:text-slate-500 flex items-center gap-1.5">
                          <span>By {item.actorName}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Deep link button */}
                    <div className="shrink-0 flex items-center justify-end">
                      <Link href={item.link}>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 gap-1.5 cursor-pointer">
                          Inspect
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 flex justify-center">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={loadMore}
                className="h-10 px-6 rounded-xl border-slate-200 hover:border-slate-300 dark:border-slate-800 text-xs font-bold uppercase tracking-wider gap-2 cursor-pointer"
              >
                {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Load More Activities
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="crm-card border border-dashed border-border/60">
          <CardContent className="py-16 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
              <History className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              No activity matching filters
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              When updates are registered in your workspace, they will be logged chronologically here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
