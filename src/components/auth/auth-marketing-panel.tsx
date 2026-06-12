"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  FolderOpen,
  TrendingUp,
} from "lucide-react";

interface SlideData {
  id: number;
  badge: string;
  badgeIcon: typeof Wallet;
  badgeColor: string;
  badgeBg: string;
  title: React.ReactNode;
  copy: string;
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    badge: "Interactive Expense Logger",
    badgeIcon: Wallet,
    badgeColor: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/20",
    title: (
      <>
        Submit team
        <br />
        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Expense Claims
        </span>
        <br />
        <span className="text-slate-200">in seconds</span>
      </>
    ),
    copy: "Log business trips, meals, subscriptions, or mileage costs. Calculate tax amounts instantly and attach receipt photos securely.",
  },
  {
    id: 1,
    badge: "Approval Workflows",
    badgeIcon: CheckCircle2,
    badgeColor: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/20",
    title: (
      <>
        Review and
        <br />
        <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Approve Submissions
        </span>
        <br />
        <span className="text-indigo-400">transparently</span>
      </>
    ),
    copy: "Review pending employee claims, request more info, or approve reimbursements with comments inside isolated claim details.",
  },
  {
    id: 2,
    badge: "Project Costing",
    badgeIcon: FolderOpen,
    badgeColor: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/20",
    title: (
      <>
        Track budgets by
        <br />
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Client Projects
        </span>
        <br />
        <span className="text-pink-500">natively</span>
      </>
    ),
    copy: "Map expenses directly to active projects and client contracts to prevent budget leakage and streamline spreadsheet exports.",
  },
];

export function AuthMarketingPanel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#070809] lg:flex border-r border-slate-900/50 min-h-screen">
      {/* Sleek matrix grid background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow point */}
        <div
          className="absolute -left-20 top-1/4 h-[350px] w-[350px] rounded-full blur-[140px] opacity-25 transition-all duration-1000"
          style={{
            backgroundColor:
              currentSlide === 0
                ? "#6366f1"
                : currentSlide === 1
                ? "#0ea5e9"
                : "#a855f7",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col p-12 xl:p-20 justify-between">
        {/* Slide Copy */}
        <div className="space-y-6">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-md transition-all duration-500 ${slide.badgeBg}`}
          >
            <BadgeIcon className={`h-4 w-4 ${slide.badgeColor}`} />
            <span className="text-xs font-bold tracking-wide text-slate-300">
              {slide.badge}
            </span>
          </div>

          <h1 className="mt-8 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {slide.title}
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400 transition-all duration-500 animate-in fade-in delay-150">
            {slide.copy}
          </p>
        </div>

        {/* Visual Mockups */}
        <div className="relative w-full h-[280px] flex items-center justify-center my-6">
          {/* Slide 0: Submit Claim Card */}
          {currentSlide === 0 && (
            <div className="absolute w-[320px] rounded-2xl border border-white/5 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sketch Renwal</span>
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                  Calculated
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Cost</span>
                  <span className="text-slate-200">₹12,288.14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax/VAT (18%)</span>
                  <span className="text-slate-200">₹2,211.86</span>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="flex justify-between font-black text-white text-sm">
                  <span>Reimbursement</span>
                  <span className="text-indigo-400">₹14,500.00</span>
                </div>
              </div>
            </div>
          )}

          {/* Slide 1: Review queue */}
          {currentSlide === 1 && (
            <div className="absolute w-[340px] rounded-2xl border border-white/5 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-xs font-extrabold text-white">
                  AP
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Amit Patel</span>
                    <span className="text-[9px] text-slate-500 font-semibold">Today</span>
                  </div>
                  <span className="block text-[10px] font-bold text-indigo-400">
                    Software · ₹14,500
                  </span>
                  <p className="text-xs text-slate-400 bg-white/5 p-2 rounded-xl italic">
                    "Annual Figma renewal for design sprints."
                  </p>
                  <div className="flex justify-end pt-1">
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Project Costing */}
          {currentSlide === 2 && (
            <div className="absolute w-[320px] rounded-2xl border border-white/5 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/5 pb-2.5">
                Active Client Projects (Weekly)
              </span>
              <div className="mt-3.5 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">Acme Web Portal</span>
                  <span className="font-black text-indigo-400">₹45,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">Ansh HR Mobile</span>
                  <span className="font-black text-slate-400">₹12,400</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {SLIDES.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentSlide === index
                  ? "w-8 bg-indigo-500"
                  : "w-4 bg-white/10 hover:bg-white/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
