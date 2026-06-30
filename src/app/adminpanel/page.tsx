"use client";

import { useEffect, useState } from "react";
import { ADMIN_SESSION_KEY, ADMIN_SESSION_TOKEN, isAdminSessionToken } from "@/lib/admin/auth";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminSidebar, type AdminView } from "@/components/admin/admin-sidebar";
import { SupportTicketsView } from "@/components/admin/support-tickets-view";
import { DashboardView } from "@/components/admin/dashboard-view";
import { SubscriptionsView } from "@/components/admin/subscriptions-view";

export default function AdminPanelPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("subscriptions");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const savedToken = sessionStorage.getItem(ADMIN_SESSION_KEY);
    setIsLoggedIn(isAdminSessionToken(savedToken));
    setCheckingSession(false);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_SESSION_TOKEN);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsLoggedIn(false);
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-[#020408]" />;
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#020408] font-sans text-slate-100 flex h-screen overflow-hidden">
      <title>ANSH Admin Panel</title>

      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeView === "tickets" && <SupportTicketsView />}
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "subscriptions" && <SubscriptionsView />}
      </div>
    </div>
  );
}
