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
  Info,
  Briefcase,
  MessageSquare,
  Zap,
  Mail,
  ExternalLink,
  X,
  Shield,
  ArrowUpRight,
  Sun,
  Monitor,
  Moon
} from "lucide-react";
import { AppsMarquee } from "@/components/landing/apps-marquee";
import {
  BRAND_BTN_CTA,
  BRAND_BTN_PRIMARY,
  brandGradientText,
  glowOpacity,
  landingAccent,
  landingSurfaces,
} from "@/components/landing/brand-theme";
import "./landing-brand.css";

type MockTab = "submit" | "analytics" | "approvals";
type AccentTheme = "indigo" | "emerald" | "sapphire" | "graphite";

const LANDING_CONTAINER =
  "mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12";

export default function LandingPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTab, setActiveTab] = useState<MockTab>("submit");
  const [activeAccent, setActiveAccent] = useState<AccentTheme>("emerald");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTheme, setActiveTheme] = useState<"light" | "system" | "dark">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const session = sessionStorage.getItem("ansh_auth_session");
    if (session === "true") {
      setSessionActive(true);
    }
  }, []);

  useEffect(() => {
    if (activeTheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(media.matches ? "dark" : "light");

      const listener = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      setResolvedTheme(activeTheme);
    }
  }, [activeTheme]);

  const isDark = resolvedTheme === "dark";
  const s = landingSurfaces(isDark);
  const a = landingAccent(isDark);
  const glow = glowOpacity(isDark);

  const themeBg = s.bg;
  const themeText = s.text;
  const themeTextMuted = s.textMuted;
  const themeTextMutedLighter = s.textMutedLighter;
  const themeBorder = s.border;
  const themeCardBg = s.cardBg;
  const themeCardBgMuted = s.cardBgMuted;
  const themeHeaderBg = s.headerBg;
  const themeNavbarLinks = s.navbarLinks;

  const accentTextClass = isDark
    ? {
        indigo: "text-[#4dc4ff]",
        emerald: "text-[#8b5cf6]",
        sapphire: "text-[#e879f9]",
        graphite: "text-zinc-400",
      }[activeAccent]
    : {
        indigo: "text-[#0078FF]",
        emerald: "text-[#7000FF]",
        sapphire: "text-[#E040FB]",
        graphite: "text-zinc-700",
      }[activeAccent];

  const accentBgClass = {
    indigo: "bg-[#00C6FF]",
    emerald: "bg-gradient-to-r from-[#00C6FF] to-[#7000FF]",
    sapphire: "bg-[#E040FB]",
    graphite: "bg-zinc-500",
  }[activeAccent];

  const accentBadgeClass = isDark
    ? {
        indigo: "bg-blue-500/10 text-violet-400 border-violet-500/20",
        emerald: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        sapphire: "bg-violet-500/10 text-violet-400 border-violet-500/30",
        graphite: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
      }[activeAccent]
    : {
        indigo: "bg-blue-500/10 text-blue-700 border-violet-500/20",
        emerald: "bg-violet-500/10 text-blue-700 border-violet-500/20",
        sapphire: "bg-violet-500/10 text-[#9333EA] border-violet-500/30",
        graphite: "bg-zinc-100 text-zinc-700 border-zinc-200",
      }[activeAccent];

  const accentGlowClass = {
    indigo: "shadow-blue-500/20",
    emerald: "shadow-violet-500/25",
    sapphire: "shadow-purple-500/20",
    graphite: "shadow-zinc-500/20",
  }[activeAccent];

  return (
    <div className={`landing-page min-h-screen ${themeBg} font-sans ${themeText} ${s.selection} transition-colors duration-300 ${isDark ? "landing-dark" : ""}`}>
      <title>Ansh Expense - Automated Team Expense & Reimbursement Tracker</title>
      <meta name="description" content="ANSH Expense streamlines receipt logging, tax/VAT calculations, project costing, and multi-stage manager approvals into a premium, blazing-fast dashboard." />
      {/* Symmetrical Background Glow Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full blur-[120px]"
          style={{ background: `rgba(0, 198, 255, ${glow})` }}
        />
        <div
          className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] rounded-full blur-[100px]"
          style={{ background: `rgba(112, 0, 255, ${glow})` }}
        />
        <div
          className="absolute left-1/3 top-2/3 h-[550px] w-[550px] rounded-full blur-[130px]"
          style={{ background: `rgba(224, 64, 251, ${glow})` }}
        />
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: isDark
              ? "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
              : "linear-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 border-b ${themeBorder} backdrop-blur-md ${themeHeaderBg} transition-colors duration-300`}>
        <div className={`${LANDING_CONTAINER} h-16 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <img src="/logoAnshapps.png" alt="Ansh Expense Logo" className="h-10.5 w-10.5 object-contain" />
            <div>
              <span className={`font-black text-sm sm:text-base tracking-widest uppercase ${isDark ? "text-white" : "text-zinc-900"} block`}>
                ANSH EXPENSE
              </span>
            </div>
          </div>

          <nav className={`hidden md:flex items-center gap-8 text-[13px] font-black uppercase tracking-widest ${themeNavbarLinks} transition-colors duration-300`}>
            <a href="#features" className={`${a.textHover} transition-colors`}>Features</a>
            <a href="#pricing" className={`${a.textHover} transition-colors`}>Pricing</a>
            <a href="#comparison" className={`${a.textHover} transition-colors`}>Why ANSH</a>
            <a href="#faq" className={`${a.textHover} transition-colors`}>FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Switcher Toggle */}
            <div className={`flex items-center gap-1 ${isDark ? "bg-zinc-900/80 border-white/5" : "bg-zinc-200/55 border-zinc-300/70"} border p-1 rounded-xl shadow-sm transition-colors duration-300`}>
              <button
                onClick={() => setActiveTheme("light")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "light"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} ${a.themeToggleActive}`
                    : `${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-800"}`
                }`}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTheme("system")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "system"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} ${a.themeToggleActive}`
                    : `${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-800"}`
                }`}
                title="System Preference"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTheme("dark")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "dark"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} ${a.themeToggleActive}`
                    : `${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-500 hover:text-zinc-800"}`
                }`}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>

            {sessionActive ? (
              <Link href="/dashboard">
                <button className={`inline-flex h-10 items-center justify-center rounded-xl ${BRAND_BTN_PRIMARY} px-6 text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}>
                  Go to Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-white" strokeWidth={3} />
                </button>
              </Link>
            ) : (
              <Link href="/login">
                <button className={`inline-flex h-10 items-center justify-center rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"} px-6 text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer`}>
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative z-10 ${LANDING_CONTAINER} pt-16 pb-24`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <h1 className={`font-sans text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
              Run Your Entire Team's{" "}
              <span className={brandGradientText(isDark)}>
                Expense & Spend Operations
              </span>{" "}
              in One Simple Workspace
            </h1>

            <p className={`text-sm sm:text-base ${themeTextMuted} leading-relaxed max-w-xl font-semibold`}>
              ANSH Expense combines receipt logging, project costing, approval pipelines, activity feeds, and workspace announcements into a unified, high-performance workspace.
            </p>

            {/* Feature Highlights Grid Container */}
            <div className={`rounded-3xl border ${themeBorder} ${themeCardBg} p-6 grid gap-6 sm:grid-cols-2 text-left`}>
              {/* Feature 1 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Automated Expense Claims</h4>
                </div>
                <p className={`text-[10px] ${themeTextMutedLighter} leading-relaxed font-semibold pl-6`}>
                  Log travel, meals, software subscriptions, office supplies, and calculate tax/VAT rates automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Project & Client Mapping</h4>
                </div>
                <p className={`text-[10px] ${themeTextMutedLighter} leading-relaxed font-semibold pl-6`}>
                  Connect claims to client contracts, track project budgets, and monitor workspace allocations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Real-time Activity Feed</h4>
                </div>
                <p className={`text-[10px] ${themeTextMutedLighter} leading-relaxed font-semibold pl-6`}>
                  Track every expense status update, project budget shift, and teammate action instantly.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Workspace Announcements</h4>
                </div>
                <p className={`text-[10px] ${themeTextMutedLighter} leading-relaxed font-semibold pl-6`}>
                  Broadcast expense deadlines, policy updates, and pinned workspace notices to all staff.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <h4 className={`text-xs font-bold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Integrated Help Desk</h4>
                </div>
                <p className={`text-[10px] ${themeTextMutedLighter} leading-relaxed font-semibold pl-6`}>
                  Raise support tickets, attach receipt photos, and resolve queries natively inside the portal.
                </p>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className={`inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl ${BRAND_BTN_CTA} px-8 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]`}>
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 text-white" strokeWidth={3} />
                </button>
              </Link>
              <a
                href="https://anshapps.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <button className={`inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-2xl border ${isDark ? "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"} px-8 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-[0.98]`}>
                  Visit ANSH
                  <ExternalLink className={`ml-2 h-3.5 w-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                </button>
              </a>
            </div>

            {/* Slogan Branding */}
            <div className={`pt-6 border-t ${themeBorder} space-y-1`}>
              <h5 className={`text-xs sm:text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-800"} tracking-wide uppercase`}>
                Built from Bharat Ready for the World
              </h5>
              <p className={`text-[10px] sm:text-xs font-extrabold ${a.slogan} tracking-widest uppercase`}>
                encouraging Vasudhaiva Kutumbakam
              </p>
            </div>
          </div>

          {/* Hero Right Widget Preview */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00C6FF]/10 via-[#7000FF]/10 to-[#E040FB]/10 rounded-3xl blur-2xl -z-10" />

            <div className={`rounded-3xl border ${s.widgetBg} shadow-2xl p-5 space-y-5 select-none relative overflow-hidden`}>
              <div className={`flex items-center justify-between border-b ${isDark ? "border-zinc-800/60" : "border-zinc-100"} pb-3`}>
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-[#00C6FF]/80" />
                </div>
                <div className={`text-[9px] font-mono ${isDark ? "text-slate-500 bg-slate-950/40 border-white/5" : "text-slate-555 bg-slate-50 border-slate-200/60"} px-3 py-1 rounded-md border`}>
                  ansh-expense.app/dashboard
                </div>
                <div className="w-9" />
              </div>

              {/* Sub tabs */}
              <div className={`flex gap-1 ${isDark ? "bg-zinc-950/60 border-white/5" : "bg-zinc-100 border-zinc-200/60"} p-1 rounded-xl border`}>
                {(["submit", "analytics", "approvals"] as MockTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === tab
                      ? `${accentBgClass} text-slate-950 font-black shadow-md`
                      : `${isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"}`
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
                      <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-650"} block mt-0.5`}>Sketch annual design licenses</span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${accentBadgeClass} px-2 py-0.5 rounded border`}>
                      Calculated
                    </span>
                  </div>

                  <div className={`border ${isDark ? "bg-slate-950/80 border-slate-800/60" : "bg-slate-50 border-slate-200"} rounded-2xl p-4 space-y-3`}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Base Amount</span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>₹12,288.14</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Tax/VAT (18%)</span>
                      <span className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>₹2,211.86</span>
                    </div>
                    <div className={`h-px ${isDark ? "bg-slate-800/60" : "bg-slate-200"}`} />
                    <div className={`flex justify-between text-sm font-black ${isDark ? "text-white" : "text-slate-850"}`}>
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
                        <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Software & Subscriptions</span>
                        <span className={`${isDark ? "text-[#4dc4ff]" : "text-blue-600"}`}>₹24,500 (52%)</span>
                      </div>
                      <div className={`h-2 w-full ${isDark ? "bg-zinc-950" : "bg-zinc-200"} rounded-full overflow-hidden`}>
                        <div className="h-full bg-[#00C6FF] rounded-full" style={{ width: "52%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Travel & Lodging</span>
                        <span className={`${isDark ? "text-[#8b5cf6]" : "text-[#7000FF]"}`}>₹14,200 (30%)</span>
                      </div>
                      <div className={`h-2 w-full ${isDark ? "bg-zinc-950" : "bg-zinc-200"} rounded-full overflow-hidden`}>
                        <div className="h-full bg-[#7000FF] rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Meals & Clients</span>
                        <span className={`${isDark ? "text-[#e879f9]" : "text-[#E040FB]"}`}>₹8,500 (18%)</span>
                      </div>
                      <div className={`h-2 w-full ${isDark ? "bg-zinc-950" : "bg-zinc-200"} rounded-full overflow-hidden`}>
                        <div className="h-full bg-[#E040FB] rounded-full" style={{ width: "18%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Approvals Queue */}
              {activeTab === "approvals" && (
                <div className="space-y-2.5 py-1 animate-in fade-in duration-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">PENDING TEAM CLAIMS</span>

                  <div className={`rounded-xl p-2.5 border ${isDark ? "bg-[#020408]/60 border-slate-800/50" : "bg-slate-50 border-slate-200/80"} flex justify-between items-center text-xs`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentBgClass} text-slate-950 font-black text-[10px]`}>
                        AP
                      </div>
                      <div>
                        <span className={`block font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Amit Patel</span>
                        <span className="block text-[9px] text-slate-550">Sketch Renewals · ₹14,500</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                      Pending
                    </span>
                  </div>

                  <div className={`rounded-xl p-2.5 border ${isDark ? "bg-[#020408]/60 border-slate-800/50" : "bg-slate-50 border-slate-200/80"} flex justify-between items-center text-xs`}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-slate-950 font-black text-[10px]">
                        RG
                      </div>
                      <div>
                        <span className={`block font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Rohan Gupta</span>
                        <span className="block text-[9px] text-slate-555">Client Travel · ₹3,200</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold ${a.check} bg-blue-500/10 px-2.5 py-0.5 rounded border border-violet-500/20`}>
                      Approved
                    </span>
                  </div>
                </div>
              )}

              {/* Theme Picker */}
              <div className={`pt-3 border-t ${isDark ? "border-zinc-800/60" : "border-zinc-200"} flex items-center justify-between`}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Dynamic themes:</span>
                <div className="flex gap-2.5">
                  {(["indigo", "emerald", "sapphire", "graphite"] as AccentTheme[]).map((theme) => {
                    const bgCircle = {
                      indigo: "bg-[#00C6FF]",
                      emerald: "bg-[#7000FF]",
                      sapphire: "bg-[#E040FB]",
                      graphite: "bg-zinc-400",
                    }[theme];

                    return (
                      <button
                        key={theme}
                        onClick={() => setActiveAccent(theme)}
                        className={`h-4.5 w-4.5 rounded-full ${bgCircle} cursor-pointer transition-all hover:scale-125 ${activeAccent === theme ? `ring-2 ring-white ring-offset-2 ${isDark ? "ring-offset-zinc-950" : "ring-offset-white"} scale-110` : "opacity-80"
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

      <AppsMarquee
        isDark={isDark}
        containerClass={LANDING_CONTAINER}
        themeBorder={themeBorder}
        themeTextMuted={themeTextMuted}
      />

      {/* Features Grid */}
      <section id="features" className={`relative z-10 border-t ${themeBorder} ${s.sectionAlt} py-24`}>
        <div className={`${LANDING_CONTAINER} space-y-16`}>
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"} tracking-tight sm:text-4xl`}>
              Simplify Reimbursements from Submission to Payout
            </h2>
            <p className={`text-sm ${themeTextMuted} leading-relaxed`}>
              Consolidate receipt photos, project cost mappings, workspace multi-tenancy, and manager audit histories inside a single, state-of-the-art web application.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-850"}`}>Interactive Expense Logger</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                Log travel, meals, software subscriptions, office supplies, and custom fields. Calculate tax/VAT rates on base totals automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-855"}`}>Tax & Compliance Tools</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                Calculate tax and GST percentages on base totals automatically, ensuring compliant tax logging for audits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-850"}`}>Project & Client Mapping</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                Connect and filter claims by specific workspace client projects. Keep budgets aligned and report client-billable receipts accurately.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-850"}`}>Multi-Stage Approval Flows</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                Review pipelines for managers to approve, reject, or request information with interactive comment threads directly on submissions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <Users className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-850"}`}>Multi-Tenant Workspaces</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                Separate corporate tenants cleanly. Configure plans, manage workspace employee directories, and assign approval roles securely.
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`rounded-2xl border ${s.cardSurface} p-6 space-y-4 ${a.cardHover} transition-all group`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle} transition-colors`}>
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className={`text-base font-black ${isDark ? "text-slate-200" : "text-slate-850"}`}>Interactive Mesh Aesthetics</h3>
              <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                High-fidelity OKLCH color palettes, smooth glassmorphism backing, ambient mesh gradients, and thin customizable scrollbars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`relative z-10 border-t ${themeBorder} py-24`}>
        <div className={`${LANDING_CONTAINER} space-y-16`}>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className={`inline-flex items-center gap-1.5 rounded-full ${a.badgeSoft} px-3.5 py-1.5`}>
              <span className={`text-[10px] font-black tracking-widest uppercase ${a.text}`}>Flexible Pricing</span>
            </div>
            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-zinc-900"} tracking-tight sm:text-4xl`}>
              Transparent, Scalable Pricing Plans
            </h2>
            <p className={`text-sm sm:text-base font-semibold ${themeTextMuted}`}>
              Start logging your personal expenses for free. Subscribe workspace seats to collaborate and run team manager reviews.
            </p>
          </div>

          <div className="grid gap-6 max-w-3xl mx-auto sm:grid-cols-2">
            {/* Free Plan */}
            <div className={`rounded-3xl border ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white shadow-sm"} p-8 flex flex-col justify-between space-y-6 relative ${a.cardHover} transition-all text-left`}>
              <div className="space-y-6">
                
                {/* Badge/Header */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"} flex items-center justify-center`}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">PLAN</span>
                    <span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"} leading-tight`}>Free</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className={`flex items-baseline ${isDark ? "text-white" : "text-slate-900"}`}>
                    <span className="text-4xl font-black tracking-tight">₹0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-extrabold leading-normal">Forever free · no credit card required.</p>
                </div>



                {/* Features List */}
                <ul className={`space-y-3.5 pt-2 text-[13px] font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Up to 5 teammates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>20 logged expense claims per month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Basic claims & category tracking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Workspace Announcements bulletin</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Standard receipt uploads</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Basic manager review comments</span>
                  </li>
                  <li className={`flex gap-2.5 items-start ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <X className={`h-4 w-4 ${isDark ? "text-slate-600" : "text-slate-400"} shrink-0 mt-0.5`} strokeWidth={3} />
                    <span>No Client mapping, advanced reports, or team analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className={`rounded-3xl border ${isDark ? `${a.proBorder} bg-zinc-900` : `${a.proBorder} bg-white`} p-8 flex flex-col justify-between space-y-6 relative ${a.proBorderHover} transition-all shadow-xl ${isDark ? "shadow-violet-950/10" : "shadow-md"} text-left`}>
              <div className="space-y-6">
                
                {/* Active Badge at Top Right */}
                <div className="absolute top-8 right-8">
                  <span className={`${a.liveBadge} text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded`}>
                    ACTIVE
                  </span>
                </div>

                {/* Badge/Header */}
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${a.badgeSoft} flex items-center justify-center ${a.text}`}>
                    <Zap className={`h-5 w-5 ${isDark ? "fill-violet-400/10" : "fill-blue-500/10"}`} />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">PLAN</span>
                    <span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"} leading-tight`}>Pro</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className={`flex items-baseline ${isDark ? "text-white" : "text-slate-900"}`}>
                    <span className="text-4xl font-black tracking-tight">₹199</span>
                    <span className="ml-1 text-[13px] font-semibold text-slate-500">/ user / month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-extrabold leading-normal">₹199/user/month. Switch to yearly to save 19%.</p>
                </div>



                {/* Features List */}
                <ul className={`space-y-3.5 pt-2 text-[13px] font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Per-user pricing — scales with your team size</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Unlimited expense claims logging</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Client & Project contract mapping</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Multiple manager review & approval chains</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Interactive query/needs-info discussions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Detailed category spending dashboards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Tax breakdown & compliance tools</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>CSV / Excel data logs exports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span>Priority billing & support assistance</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                    <span className="flex items-center gap-1.5">
                      Corporate card feeds integration
                      <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"} rounded`}>Soon</span>
                    </span>
              </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section id="comparison" className={`relative z-10 border-t ${themeBorder} ${s.sectionAlt} py-24`}>
        <div className={`${LANDING_CONTAINER} space-y-16`}>
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className={`inline-flex items-center gap-2.5 rounded-full ${a.badgeSoft} px-4.5 py-1.5 text-[10px] font-black ${a.text} uppercase tracking-widest`}>
              <Layers className="h-3.5 w-3.5" />
              Why Teams Switch
            </div>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-zinc-900"}`}>
              Why teams choose ANSH Expense over Zoho Expense, Concur, Expensify, and Excel
            </h2>
            <p className={`text-sm sm:text-base font-semibold ${themeTextMuted} leading-relaxed max-w-2xl mx-auto`}>
              We are built for scaling teams that want real expense automation, cleaner audit compliance, and zero setup friction in one product.
            </p>
          </div>

          {/* 3 Column Comparison */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Column 1: Zoho */}
            <div className={`rounded-3xl border ${s.cardSurfaceHover} p-8 space-y-6 flex flex-col justify-start transition-all duration-300`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>Compared to Zoho Expense</h3>
                <p className={`text-[11px] sm:text-xs ${isDark ? "text-slate-500" : "text-slate-550"} font-extrabold leading-normal`}>
                  Built for modern expense auditing, not rigid corporate suites.
                </p>
              </div>
              <ul className="space-y-4 pt-2 text-xs sm:text-[13px] font-semibold leading-relaxed">
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Zoho Expense has a stuffy enterprise interface with rigid, complex workflow setups.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-800"}`}>ANSH Expense is visual, lightweight, and combines claims, tax splits, and receipts natively.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: ClickUp & Monday */}
            <div className={`rounded-3xl border ${s.cardSurfaceHover} p-8 space-y-6 flex flex-col justify-start transition-all duration-300`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>Compared to Concur & Expensify</h3>
                <p className={`text-[11px] sm:text-xs ${isDark ? "text-slate-500" : "text-slate-555"} font-extrabold leading-normal`}>
                  Add paid seats as you scale without enterprise sales traps.
                </p>
              </div>
              <ul className="space-y-4 pt-2 text-xs sm:text-[13px] font-semibold leading-relaxed">
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Concur & Expensify are highly customizable but get expensive quickly and suffer from heavy loading lag.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-800"}`}>ANSH Expense is lightweight, highly performant, and packs claims tracking, project allocation, and reports under an affordable per-user tier.</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Trello & Slack */}
            <div className={`rounded-3xl border ${s.cardSurfaceHover} p-8 space-y-6 flex flex-col justify-start transition-all duration-300`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>Compared to Excel & Slack</h3>
                <p className={`text-[11px] sm:text-xs ${isDark ? "text-slate-500" : "text-slate-555"} font-extrabold leading-normal`}>
                  No more paying for multiple tools or manual entry.
                </p>
              </div>
              <ul className="space-y-4 pt-2 text-xs sm:text-[13px] font-semibold leading-relaxed">
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Excel is too manual (no receipt upload/auditing), while Slack is just messaging (no status tracking)—leading to lost receipts.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <Check className={`h-4 w-4 ${a.check} shrink-0 mt-0.5`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-800"}`}>ANSH Expense integrates receipt tracking, audit trails, and comment feeds in one unified workspace.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Models comparison */}
          <div className="grid gap-6 md:grid-cols-12 pt-6">
            {/* Card Left: ANSH model */}
            <div className={`md:col-span-7 rounded-3xl border ${a.comparisonHighlight} p-8 space-y-4 flex flex-col justify-center`}>
              <span className={`text-[11px] font-black uppercase tracking-wider ${a.text} block`}>THE ANSH EXPENSE MODEL FOR TEAMS</span>
              <p className={`text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-750"} leading-relaxed font-semibold`}>
                A unified tool that any employee can adopt in minutes. Expense claims, tax compliance tools, project budgets, and support desks all live together. No hidden setups or extra license costs.
              </p>
            </div>

            {/* Card Right: Bloated model */}
            <div className={`md:col-span-5 rounded-3xl border ${isDark ? "border-white/5 bg-zinc-900/40" : "border-zinc-200 bg-white/40 shadow-sm"} p-8 space-y-4 flex flex-col justify-center`}>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">THE BLOATED ENTERPRISE TOOL MODEL</span>
              <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-650"} leading-relaxed font-semibold`}>
                Steep learning curves, complicated configurations (e.g. Zoho setup / SAP Concur workflows), expensive per-user licenses, and separate bills for receipt tracking, project accounting, and support ticketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed & Announcements Section */}
      <section className={`relative z-10 border-t ${themeBorder} py-24`}>
        <div className={LANDING_CONTAINER}>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Left: Interactive Mockup Feed */}
            <div className={`border ${isDark ? "bg-zinc-900/90 border-white/5" : "bg-white border-zinc-200/80"} rounded-3xl p-6 relative overflow-hidden shadow-2xl`}>
              {/* Ambient background glow inside the window */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl" style={{ background: `rgba(0, 198, 255, ${glow})` }} />

              {/* Header row */}
              <div className={`flex justify-between items-center border-b ${themeBorder} pb-4`}>
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-violet-500/80" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity Feed</span>
              </div>

              {/* List items */}
              <div className="space-y-3 mt-4">
                {[
                  {
                    title: "Claim approved: Software Licenses",
                    desc: "Approved by Priya S. · Finance project",
                    time: "12m ago",
                    iconColor: a.feedIcon
                  },
                  {
                    title: "Announcement: Q3 Policy Updates",
                    desc: "Posted by Vikram M. · Pinned notice for all staff",
                    time: "1h ago",
                    iconColor: a.feedIcon
                  },
                  {
                    title: "Priya Sharma joined the workspace",
                    desc: "Role: Manager (Engineering)",
                    time: "2h ago",
                    iconColor: a.feedIcon
                  },
                  {
                    title: "Project created: Acme Web Portal",
                    desc: "Client: Acme Corp · Budget allocated",
                    time: "3h ago",
                    iconColor: a.feedIcon
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`border ${isDark ? "bg-[#020408]/60 border-white/5 hover:bg-[#020408]/80" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"} rounded-2xl p-4 flex gap-4 items-start transition-colors`}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${item.iconColor}`}>
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 text-left space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`text-xs font-black ${isDark ? "text-slate-200" : "text-slate-800"} block truncate`}>{item.title}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap shrink-0">{item.time}</span>
                      </div>
                      <span className={`block text-[11px] ${themeTextMutedLighter} leading-relaxed font-semibold truncate`}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Copy & Bullet Points */}
            <div className="space-y-6 text-left lg:pl-6">
              <div className={`inline-flex items-center gap-1.5 rounded-full ${a.badgeSoft} px-3.5 py-1.5 text-[10px] font-black ${a.text} uppercase tracking-widest`}>
                <Zap className="h-3.5 w-3.5" />
                Workspace Updates
              </div>

              <h2 className={`text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                Stay Aligned with Activity Feed & Announcements
              </h2>

              <p className={`text-sm sm:text-base ${themeTextMuted} leading-relaxed font-semibold`}>
                Replace scattered email threads with a clean workspace timeline. The activity feed logs what changed across expenses, projects, and support tickets, while announcements let administrators pin critical notices for the entire team.
              </p>

              <ul className="space-y-4 pt-4 text-xs sm:text-sm font-semibold leading-relaxed">
                <li className="flex gap-3 items-center">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Automatic timeline — expenses, projects, support tickets, and team joins</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Pinned announcements for expense deadlines, workspace policies, and updates</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Check className={`h-4 w-4 ${a.check} shrink-0`} strokeWidth={3} />
                  <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>Included on Pro — no extra tracking tool subscription required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`relative z-10 border-t ${themeBorder} ${s.sectionAlt} py-24`}>
        <div className={`${LANDING_CONTAINER} space-y-16`}>
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className={`inline-flex items-center gap-1.5 rounded-full ${a.badgeSoft} px-3.5 py-1.5 text-[10px] font-black ${a.text} uppercase tracking-widest`}>
              <HelpCircle className="h-3.5 w-3.5" />
              Support Center
            </div>
            <h2 className={`text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${isDark ? "text-white" : "text-zinc-900"}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? "text-slate-500" : "text-slate-550"} font-black tracking-widest leading-relaxed uppercase`}>
              Clear answers to help you navigate automated expense logging, audit compliance, and seat upgrades.
            </p>
          </div>

          {/* Accordion List (Full Centered Width) */}
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                category: "Features",
                q: "What core features does ANSH Expense offer?",
                a: "ANSH Expense is a premium tool offering multi-currency claim logging, automatic VAT calculations, tax & compliance tools, dynamic client/project cost allocation, interactive spend analytics, and a multi-role workspace audit system (Employee, Manager, Admin, Owner).",
                icon: Wallet
              },
              {
                category: "Security",
                q: "How secure is my financial data?",
                a: "Security is built in. All user sessions are authenticated securely via Supabase. Workspaces are strictly isolated at the database level using Prisma. Every action log is audited, and file uploads are handled with secure backend integrations.",
                icon: Lock
              },
              {
                category: "Billing",
                q: "How does the seat license checkout work?",
                a: "Upgrading to a Pro plan is managed securely via our integrated Razorpay subscription portal. Workspace owners can dynamically add or remove seat licenses monthly or yearly. Payment statuses are tracked in real-time with instant access provisioning.",
                icon: CheckCircle
              },
              {
                category: "Uploads",
                q: "Where are receipt images and attachments stored?",
                a: "Attachments are uploaded to Cloudflare R2 object storage via a secure server-side API. If storage keys are not set, the platform uses a base64 Data URL fallback. Uploaded images are compressed client-side to keep storage lightweight.",
                icon: FileText
              },
              {
                category: "Support",
                q: "How does the Help Center and Ticketing work?",
                a: "Users can raise tickets directly in the app's Help Center, attaching up to 3 compressed images. Support managers can manage, reply to, or delete tickets using the dedicated administrative Support Panel dashboard.",
                icon: HelpCircle
              }
            ].map((faq, idx) => {
              const Icon = faq.icon;
              const isCurrent = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${isCurrent
                    ? a.faqOpen
                    : `${isDark ? "bg-zinc-900/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/90" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"}`
                    }`}
                  onClick={() => setOpenFaq(isCurrent ? null : idx)}
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4.5 min-w-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isCurrent
                        ? `${a.badgeSoft} ${a.text}`
                        : `${isDark ? "bg-zinc-950/60 border-white/5" : "bg-zinc-100 border-zinc-200"} text-zinc-500`
                        }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-left space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? a.text : "text-zinc-500"
                          }`}>{faq.category}</span>
                        <h3 className={`text-xs sm:text-sm font-black tracking-wide leading-tight ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{faq.q}</h3>
                      </div>
                    </div>
                    <ChevronRight className={`h-4.5 w-4.5 text-zinc-500 shrink-0 transition-transform duration-300 ${isCurrent ? `rotate-90 ${a.text}` : ""
                      }`} />
                  </div>
                  {isCurrent && (
                    <div className="px-5 pb-5 pt-1 text-left pl-18 animate-in fade-in slide-in-from-top-1 duration-250">
                      <p className={`text-xs sm:text-[13px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Action CTA Section */}
      <section className={`relative z-10 border-t ${themeBorder} py-24 lp-cta-section ${s.ctaOverlay}`}>
        {/* Radial backing glow */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div
            className="h-[300px] w-[600px] rounded-full blur-[120px]"
            style={{ background: `rgba(112, 0, 255, ${glow})` }}
          />
        </div>

        <div className={`relative z-10 ${LANDING_CONTAINER} text-center space-y-6`}>
          {/* Centered Check Icon */}
          <div className={`h-10 w-10 ${a.badgeSoft} rounded-xl flex items-center justify-center mx-auto ${a.text}`}>
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>

          <h2 className={`text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            Ready to accelerate your team's workflow?
          </h2>

          <p className={`text-sm sm:text-base ${themeTextMuted} leading-relaxed font-semibold max-w-xl mx-auto`}>
            Create your free workspace in under two minutes. No credit card required. Experience automated receipt matching, tax calculations, and quick approvals.
          </p>

          <div className="pt-4">
            <Link
              href="/signup"
              className={`inline-flex items-center gap-2.5 ${BRAND_BTN_CTA} font-black uppercase text-xs sm:text-sm tracking-widest px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer`}
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4 text-white" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t ${themeBorder} ${s.footerBg} pt-20 pb-12 overflow-hidden`}>
        <div className={`${LANDING_CONTAINER} space-y-16`}>

          {/* Giant Logo Text Section */}
          <div className="text-center space-y-4 select-none">
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center justify-center gap-1.5">
              HANDLED BY
              <img src="/logoAnshapps.png" alt="Ansh Apps" className="h-4 w-4 object-contain" />
            </span>
            <h1 className={`text-[10vw] sm:text-[11vw] md:text-[10vw] lg:text-[11rem] xl:text-[13rem] font-black tracking-tighter leading-none whitespace-nowrap lp-gradient-text`}>
              Ansh Apps
            </h1>
          </div>

          {/* Footer Columns */}
          <div className={`grid gap-8 sm:grid-cols-2 md:grid-cols-4 pt-12 border-t ${themeBorder}`}>
            {/* Col 1 */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <img src="/logoAnshapps.png" alt="ANSH Expense" className="h-6 w-6 object-contain" />
                <span className={`font-extrabold text-xs tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>ANSH Expense</span>
              </div>
              <p className={`text-[11px] ${themeTextMutedLighter} leading-relaxed font-semibold`}>
                The ultimate expense tracking & auditing platform designed for teams who manage business spend and payouts daily.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-4 text-left">
              <span className={`block text-[10px] font-bold ${isDark ? "text-slate-500" : "text-slate-450"} uppercase tracking-widest`}>Product</span>
              <ul className={`space-y-2 text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Expense Claims</Link></li>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Tax Compliance</Link></li>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Project Mapping</Link></li>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Activity Feed</Link></li>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Announcements</Link></li>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Support Desk</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-4 text-left">
              <span className={`block text-[10px] font-bold ${isDark ? "text-slate-500" : "text-slate-450"} uppercase tracking-widest`}>Account</span>
              <ul className={`space-y-2 text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                <li><Link href="/login" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Sign In</Link></li>
                <li><Link href="/signup" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Sign Up</Link></li>
                <li><Link href="/adminpanel" className={`${isDark ? "hover:text-white" : "hover:text-slate-950"} transition-colors`}>Admin Desk</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-4 text-left">
              <span className={`block text-[10px] font-bold ${isDark ? "text-slate-500" : "text-slate-450"} uppercase tracking-widest`}>Get in touch</span>
              <p className={`text-[11px] ${themeTextMutedLighter} leading-relaxed font-semibold font-sans`}>
                Have questions or need custom business plans? Talk to our creators.
              </p>
              <a
                href="mailto:hello@anshapps.com"
                className={`inline-flex items-center gap-2 text-[11px] font-bold ${a.mail} transition-colors pt-1`}
              >
                <Mail className="h-3.5 w-3.5" />
                hello@anshapps.com
              </a>
            </div>
          </div>

          {/* Sub-footer bottom bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t ${themeBorder} text-[10px] font-semibold ${themeTextMutedLighter}`}>
            <span>© 2026 ANSH Expense. All rights reserved.</span>
            <div className="flex gap-6 uppercase tracking-wider">
              <Link href="/privacy" className={`${isDark ? "hover:text-slate-350" : "hover:text-slate-800"} transition-colors`}>Privacy Policy</Link>
              <Link href="/terms" className={`${isDark ? "hover:text-slate-350" : "hover:text-slate-800"} transition-colors`}>Terms of Service</Link>
              <Link href="/help" className={`${isDark ? "hover:text-slate-350" : "hover:text-slate-800"} transition-colors`}>Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
