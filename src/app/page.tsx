"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle,
  FileText,
  Users,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Play,
  Layers,
  Search,
  Check,
  Lock,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Info
} from "lucide-react";

type MockTab = "submit" | "analytics" | "approvals";
type AccentTheme = "indigo" | "emerald" | "sapphire" | "graphite";

export default function LandingPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTab, setActiveTab] = useState<MockTab>("submit");
  const [activeAccent, setActiveAccent] = useState<AccentTheme>("indigo");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem("ansh_auth_session");
    if (session === "true") {
      setSessionActive(true);
    }
  }, []);

  const accentTextClass = {
    indigo: "text-indigo-400",
    emerald: "text-emerald-400",
    sapphire: "text-sky-400",
    graphite: "text-slate-350"
  }[activeAccent];

  const accentBgClass = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    sapphire: "bg-sky-500",
    graphite: "bg-slate-500"
  }[activeAccent];

  const accentBadgeClass = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    sapphire: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    graphite: "bg-slate-500/10 text-slate-300 border-slate-500/20"
  }[activeAccent];

  const accentGlowClass = {
    indigo: "shadow-indigo-500/20",
    emerald: "shadow-emerald-500/20",
    sapphire: "shadow-sky-500/20",
    graphite: "shadow-slate-500/20"
  }[activeAccent];

  return (
    <div className="min-h-screen bg-[#04080F] font-sans text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-400">
      <title>Ansh Expense - Automated Team Expense & Reimbursement Tracker</title>
      <meta name="description" content="ANSH Expense streamlines receipt logging, tax/VAT calculations, mileage tracking, project costing, and multi-stage manager approvals into a premium, blazing-fast dashboard." />
      {/* Symmetrical Background Glow Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[160px]" />
        <div className="absolute -right-1/4 top-1/4 h-[650px] w-[650px] rounded-full bg-sky-500/5 blur-[160px]" />
        <div className="absolute left-1/3 top-2/3 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-[#04080F]/85">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logoAnshapps.png" alt="Ansh Expense Logo" className="h-10.5 w-10.5 object-contain" />
            <div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-white block">
                ANSH EXPENSE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#comparison" className="hover:text-white transition-colors">Why ANSH</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {sessionActive ? (
              <Link href="/dashboard">
                <button className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-500 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                  Go to Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all cursor-pointer">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-7 text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-50/5 px-4.5 py-1.5 backdrop-blur-md">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
                Next-Gen Expense & Reimbursement Logs
              </span>
            </div>

            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
              Automated Expense Management for{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Scaling Teams
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              ANSH Expense streamlines receipt logging, tax/VAT calculations, mileage tracking, project costing, and multi-stage manager approvals into a premium, blazing-fast dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Interactive Expense Logger</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Select category, tax rates, project, and attach receipts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Mileage Tracker</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Compute mileage cost instantly using distances and rates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Team Approval Workflows</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Review, approve, reject, or comment on claims.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Razorpay Seat Billing</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Multi-tenant seat licenses with secure checkouts.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl bg-indigo-500 px-8 text-sm font-bold text-slate-950 shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                  Launch ANSH Expense
                  <Play className="ml-2 h-4 w-4 fill-current" />
                </button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <button className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                  Explore Features
                </button>
              </a>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Engineered for High-Performance Teams — designed with <span className="text-indigo-400">Electric Indigo Aesthetics</span>
              </p>
            </div>
          </div>

          {/* Hero Right Widget Preview */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-3xl blur-2xl -z-10" />

            <div className="rounded-3xl border border-slate-800 bg-[#0A1118]/90 shadow-2xl p-5 space-y-5 select-none relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[9px] text-slate-500 font-mono bg-slate-950/40 px-3 py-1 rounded-md border border-white/5">
                  ansh-expense.app/dashboard
                </div>
                <div className="w-9" />
              </div>

              {/* Sub tabs */}
              <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                {(["submit", "analytics", "approvals"] as MockTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeTab === tab
                        ? `${accentBgClass} text-slate-950 font-black shadow-md`
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab === "submit" ? "Submit Claim" : tab === "analytics" ? "Spending View" : "Approvals"}
                  </button>
                ))}
              </div>

              {/* Tab 1: Submit Claim */}
              {activeTab === "submit" && (
                <div className="space-y-4 py-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">LOG CLAIM</span>
                      <span className="text-xs font-semibold text-slate-400 block mt-0.5">Sketch annual design licenses</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${accentBadgeClass} px-2 py-0.5 rounded border`}>
                      Calculated
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Base Amount</span>
                      <span className="text-white font-bold">₹12,288.14</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Tax/VAT (18%)</span>
                      <span className="text-white font-bold">₹2,211.86</span>
                    </div>
                    <div className="h-px bg-slate-800/60" />
                    <div className="flex justify-between text-sm font-black text-white">
                      <span>Total Claim</span>
                      <span className={accentTextClass}>₹14,500.00</span>
                    </div>
                  </div>

                  <button className={`w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer text-white shadow-lg ${accentGlowClass} ${accentBgClass} !text-slate-950 font-black hover:opacity-90`}>
                    Submit Reimbursement
                  </button>
                </div>
              )}

              {/* Tab 2: Spending Analytics */}
              {activeTab === "analytics" && (
                <div className="space-y-4 py-2 animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">CATEGORY DISTRIBUTION</span>
                  
                  {/* Custom SVG/CSS Bar Chart */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-300">Software & Subscriptions</span>
                        <span className="text-indigo-400">₹24,500 (52%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "52%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-300">Travel & Mileage</span>
                        <span className="text-emerald-400">₹14,200 (30%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-300">Meals & Clients</span>
                        <span className="text-sky-400">₹8,500 (18%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: "18%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Approvals Queue */}
              {activeTab === "approvals" && (
                <div className="space-y-2.5 py-1 animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">PENDING TEAM CLAIMS</span>
                  
                  <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBgClass} text-slate-950 font-black text-[10px]`}>
                        AP
                      </div>
                      <div>
                        <span className="block font-bold text-slate-200">Amit Patel</span>
                        <span className="block text-[9px] text-slate-500">Sketch Renewals · ₹14,500</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                      Pending
                    </span>
                  </div>

                  <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-black text-[10px]">
                        RG
                      </div>
                      <div>
                        <span className="block font-bold text-slate-200">Rohan Gupta</span>
                        <span className="block text-[9px] text-slate-500">Client Travel · ₹3,200</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10">
                      Approved
                    </span>
                  </div>
                </div>
              )}

              {/* Theme Picker */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Dynamic themes:</span>
                <div className="flex gap-2.5">
                  {(["indigo", "emerald", "sapphire", "graphite"] as AccentTheme[]).map((theme) => {
                    const bgCircle = {
                      indigo: "bg-indigo-500",
                      emerald: "bg-emerald-500",
                      sapphire: "bg-sky-500",
                      graphite: "bg-slate-400"
                    }[theme];

                    return (
                      <button
                        key={theme}
                        onClick={() => setActiveAccent(theme)}
                        className={`h-4.5 w-4.5 rounded-full ${bgCircle} cursor-pointer transition-all hover:scale-125 ${
                          activeAccent === theme ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110" : "opacity-80"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 border-t border-white/5 bg-[#03060C]/60 py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Simplify Reimbursements from Submission to Payout
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Consolidate receipt photos, mileage expense rates, workspace multi-tenancy, and manager audit histories inside a single, state-of-the-art web application.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Interactive Expense Logger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log travel, meals, software subscriptions, office supplies, and custom fields. Calculate tax/VAT rates on base totals automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Mileage Tracker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drove client visits? Input your distance in Km and target mileage rate to calculate reimbursement amounts immediately.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Project & Client Mapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect and filter claims by specific workspace client projects. Keep budgets aligned and report client-billable receipts accurately.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Multi-Stage Approval Flows</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review pipelines for managers to approve, reject, or request information with interactive comment threads directly on submissions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Multi-Tenant Workspaces</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separate corporate tenants cleanly. Configure plans, manage workspace employee directories, and assign approval roles securely.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4 hover:border-indigo-500/25 transition-all group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Interactive Mesh Aesthetics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-fidelity OKLCH color palettes, smooth glassmorphism backing, ambient mesh gradients, and thin customizable scrollbars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 border-t border-white/5 bg-[#03060C]/60 py-24">
        <div className="mx-auto max-w-7xl px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-505/5 px-3 py-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-400">Flexible Pricing</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Transparent, Scalable Pricing Plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Start logging your personal expenses for free. Subscribe workspace seats to collaborate and run team manager reviews.
            </p>
          </div>

          <div className="grid gap-6 max-w-3xl mx-auto sm:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-3xl border border-slate-800 bg-[#070D14] p-8 flex flex-col justify-between space-y-6 relative hover:border-indigo-500/20 transition-all">
              <div className="space-y-4">
                <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  For Solo / Small Teams
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Free Plan</h3>
                  <p className="text-[10px] text-slate-500 leading-normal">Ideal for small workspaces and startup teams.</p>
                </div>
                <div className="flex items-baseline text-white">
                  <span className="text-3xl font-black tracking-tight">₹0</span>
                  <span className="ml-1 text-[11px] font-semibold text-slate-500">/ workspace</span>
                </div>
                <ul className="space-y-3.5 pt-4 text-xs font-medium text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Up to 5 teammates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Basic expense logging</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Calculations (Base + Tax/VAT)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Default expense categories</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Personal claims logs registry</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="rounded-3xl border border-indigo-500/25 bg-[#070D14] p-8 flex flex-col justify-between space-y-6 relative hover:border-indigo-500/40 transition-all shadow-xl shadow-indigo-950/20">
              <div className="space-y-4">
                <div className="inline-flex rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                  Best for Scaling Teams
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                  <p className="text-[10px] text-slate-500 leading-normal">Invite your entire workforce. Empower department heads to approve.</p>
                </div>
                <div className="flex items-baseline text-white">
                  <span className="text-3xl font-black tracking-tight">₹199</span>
                  <span className="ml-1 text-[11px] font-semibold text-slate-500">/ user / month</span>
                </div>
                <ul className="space-y-3.5 pt-4 text-xs font-medium text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Unlimited seats / team scale</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Map expenses to Projects & Clients</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Manager reviews and comment pipelines</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Secure AWS S3 receipt photo uploads</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Advanced spending reports & CSV exports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" strokeWidth={3} />
                    <span>Customizable accent colors & styles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className="relative z-10 mx-auto max-w-7xl px-6 py-24 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-500/25 bg-sky-500/5 px-4.5 py-1.5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-sky-400">
              Why Teams Switch
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Why Teams choose ANSH Expense over bloated platforms
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            ANSH Expense is built for founders who value speed, responsive views, clean tax calculations, and seat monetization that handles payouts transparently.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">SaaS Project Mappings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tag claims directly to workspace project scopes. Avoid disjointed client accounting registers and spreadsheets.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Wallet className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Calculated VAT & Mileage</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No manual calculations. Select your base rate or mileage multiplier, and let our logger handle percentages.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0A1016]/40 p-6 space-y-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Comment Feed Audits</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review submission logs. Leave comments requesting clarification, keeping communications isolated inside specific claims.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-4xl px-6 py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Got questions about ANSH Expense? Find quick answers below.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "What is included in the Free plan?",
              a: "Free workspaces support up to 5 users. You can log expenses with custom categories, calculate tax amounts, and review your personal claim submission registry."
            },
            {
              q: "How does the seat license checkout work?",
              a: "When you upgrade, you subscribe to a Pro plan using our Razorpay integration. You can configure monthly or yearly billing and increase your workspace seats dynamically."
            },
            {
              q: "How are attachments stored?",
              a: "S3 integrations are configured in your backend. In case S3 keys are left empty, the application falls back to local and mock files smoothly."
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-[#070D14]/80 p-5 space-y-2.5 cursor-pointer"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">{faq.q}</h3>
                <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${openFaq === idx ? "rotate-90 text-indigo-400" : ""}`} />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-400 leading-relaxed animate-in fade-in duration-200">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#03060C] py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-slate-500">
            © 2026 ANSH Expense. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <Link href="/terms" className="hover:text-slate-350">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-350">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
