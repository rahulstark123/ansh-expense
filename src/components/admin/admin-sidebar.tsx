"use client";

import {
  MessageSquare,
  LayoutDashboard,
  CreditCard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export type AdminView = "tickets" | "dashboard" | "subscriptions";

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
}

const navItems: { id: AdminView; label: string; icon: typeof MessageSquare }[] = [
  { id: "tickets", label: "Support Tickets", icon: MessageSquare },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
];

export function AdminSidebar({ activeView, onNavigate, onLogout }: AdminSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/5 bg-[#04080F] flex flex-col h-full">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center">
            <ShieldCheck className="h-4.5 w-4.5 text-violet-400" />
          </div>
          <div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white block">
              ANSH Admin
            </span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              Support Desk
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeView === id
                ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
