"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Monitor, Moon, ArrowLeft, Mail } from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeTheme, setActiveTheme] = useState<"light" | "system" | "dark">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

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

  const themeBg = isDark ? "bg-[#04080F]" : "bg-gradient-to-b from-[#f8fafc] via-[#edf6f2] to-[#e8ecef]";
  const themeText = isDark ? "text-slate-100" : "text-slate-900";
  const themeTextMuted = isDark ? "text-slate-400" : "text-slate-600";
  const themeTextMutedLighter = isDark ? "text-slate-450" : "text-slate-500";
  const themeBorder = isDark ? "border-white/5" : "border-slate-200";
  const themeCardBg = isDark ? "bg-[#070D14]/80" : "bg-white border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)]";
  const themeHeaderBg = isDark ? "bg-[#04080F]/85" : "bg-white/85";

  return (
    <div className={`min-h-screen ${themeBg} font-sans ${themeText} transition-colors duration-300 relative overflow-hidden`}>
      <title>Terms & Conditions | Ansh Expense</title>
      <meta name="description" content="Terms and Conditions for using Ansh Expense." />

      {/* Symmetrical Background Glow Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-[#00D8A5]/${isDark ? "5" : "3"} blur-[160px]`} />
        <div className={`absolute -right-1/4 top-1/4 h-[650px] w-[650px] rounded-full bg-teal-500/${isDark ? "5" : "3"} blur-[160px]`} />
      </div>

      {/* Navigation Header */}
      <header className={`sticky top-0 z-50 border-b ${themeBorder} backdrop-blur-md ${themeHeaderBg} transition-colors duration-300`}>
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90">
            <img src="/logoAnshapps.png" alt="Ansh Expense Logo" className="h-10.5 w-10.5 object-contain" />
            <div>
              <span className={`font-black text-sm sm:text-base tracking-widest uppercase ${isDark ? "text-white" : "text-slate-900"} block`}>
                ANSH EXPENSE
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Switcher Toggle */}
            <div className={`flex items-center gap-1 ${isDark ? "bg-[#070D14]/80 border-white/5" : "bg-slate-200/55 border-slate-300/70"} border p-1 rounded-xl shadow-sm transition-colors duration-300`}>
              <button
                onClick={() => setActiveTheme("light")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "light"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} text-[#00D8A5]`
                    : `${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-550 hover:text-slate-800"}`
                }`}
                title="Light Mode"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTheme("system")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "system"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} text-[#00D8A5]`
                    : `${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-550 hover:text-slate-800"}`
                }`}
                title="System Preference"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTheme("dark")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTheme === "dark"
                    ? `${isDark ? "bg-white/5" : "bg-white shadow-sm"} text-[#00D8A5]`
                    : `${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-550 hover:text-slate-800"}`
                }`}
                title="Dark Mode"
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>

            <Link href="/">
              <button className={`inline-flex h-10 items-center justify-center rounded-xl border ${isDark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"} px-6 text-xs font-black uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer gap-2`}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:py-16 space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00D8A5] hover:underline cursor-pointer mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to ANSH Expense
          </Link>
        </div>

        <article className={`rounded-2xl p-6 sm:p-10 border ${themeBorder} ${themeCardBg} text-left space-y-8`}>
          <header className={`border-b ${themeBorder} pb-6`}>
            <h1 className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"} sm:text-4xl`}>
              Terms & Conditions
            </h1>
            <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${themeTextMutedLighter}`}>
              Last updated: 16 April 2026
            </p>
          </header>

          <div className="space-y-8 text-[14px] leading-relaxed">
            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                1. Acceptance of Terms
              </h2>
              <p className={themeTextMuted}>
                These Terms & Conditions govern your use of ANSH Expense, including our website, web application, and related services. By using ANSH Expense, you agree to these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                2. Service Description
              </h2>
              <p className={themeTextMuted}>
                ANSH Expense is a premium business expense tracking and team auditing platform. Features may include multi-currency claim logging, digital receipt uploads, mileage distance calculation multipliers, client/project cost allocation, multi-stage manager approval reviews, real-time activity timelines, pinned workspace announcements, customer support ticketing, and analytics.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                3. Account Responsibility
              </h2>
              <p className={themeTextMuted}>
                You are responsible for all activity under your account, including the security of your credentials and the accuracy of information you provide. You must promptly report unauthorized access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                4. Subscription, Billing, and Renewal
              </h2>
              <p className={themeTextMuted}>
                Paid plans are billed in advance via our payment partner. You authorize us (and our payment processor) to charge applicable subscription fees, taxes, and related charges. Pricing, seat license thresholds, and plan terms may be updated with prior notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                5. Cancellation and No-Refund Policy
              </h2>
              <div className="space-y-2">
                <p className={themeTextMuted}>
                  You may cancel your subscription at any time. Your access to paid features continues until the end of the current billing cycle. However, all fees paid are non-refundable.
                </p>
                <p className={`font-bold ${isDark ? "text-slate-350" : "text-slate-800"}`}>
                  No refunds are provided for:
                </p>
                <ul className={`list-disc space-y-2 pl-5 ${themeTextMuted}`}>
                  <li>Subscription cancellation by the user.</li>
                  <li>Account deletion by the user.</li>
                  <li>Partial usage or non-usage during an active billing period.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                6. Acceptable Use
              </h2>
              <p className={themeTextMuted}>
                You must not misuse the service, attempt unauthorized access, reverse engineer critical components, distribute malware, or use the platform in violation of applicable law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                7. Data, Privacy, and Compliance
              </h2>
              <p className={themeTextMuted}>
                Your use of the service is also governed by our{" "}
                <Link href="/privacy" className="font-bold text-[#00D8A5] hover:underline">
                  Privacy Policy
                </Link>
                . We follow applicable Indian legal requirements, including relevant provisions under the Information Technology Act, 2000 and India's digital personal data protection framework.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                8. Service Availability
              </h2>
              <p className={themeTextMuted}>
                We aim for reliable availability but do not guarantee uninterrupted service. We may perform maintenance, updates, and emergency fixes that can temporarily affect access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                9. Limitation of Liability
              </h2>
              <p className={themeTextMuted}>
                To the maximum extent permitted by law, ANSH Expense is not liable for indirect, incidental, special, or consequential damages. Our aggregate liability for claims related to paid services is limited to the subscription fees paid by you for the affected billing cycle.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                10. Governing Law and Jurisdiction
              </h2>
              <p className={themeTextMuted}>
                These terms are governed by the laws of India. Courts with competent jurisdiction in India will have jurisdiction over disputes arising out of these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                11. Contact
              </h2>
              <p className={themeTextMuted}>
                For legal, billing, or policy questions, contact us at:
              </p>
              <div className="pt-1">
                <a
                  href="mailto:support@anshapps.com"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-450 hover:underline hover:text-emerald-400"
                >
                  <Mail className="h-4 w-4" />
                  support@anshapps.com
                </a>
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
