"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Monitor, Moon, ArrowLeft, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
      <title>Privacy Policy | Ansh Expense</title>
      <meta name="description" content="Privacy Policy for Ansh Expense — how we collect, use, and protect your data." />

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
              Privacy Policy
            </h1>
            <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${themeTextMutedLighter}`}>
              Last updated: 16 April 2026
            </p>
          </header>

          <div className="space-y-8 text-[14px] leading-relaxed">
            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                1. Introduction
              </h2>
              <p className={themeTextMuted}>
                This Privacy Policy explains how ANSH Expense collects, uses, stores, and protects personal data when you use our website and services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                2. Information We Collect
              </h2>
              <ul className={`list-disc space-y-2 pl-5 ${themeTextMuted}`}>
                <li>
                  <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Account information:</span> name, email address, profile details.
                </li>
                <li>
                  <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Workspace information:</span> expense claims, receipt attachments, project mapping details, team directories, comments, support tickets, and audit trails.
                </li>
                <li>
                  <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Payment metadata:</span> transaction IDs, subscription status, billing timestamps.
                </li>
                <li>
                  <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Technical data:</span> device/browser data, IP-derived region, logs, and diagnostics.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                3. How We Use Data
              </h2>
              <ul className={`list-disc space-y-2 pl-5 ${themeTextMuted}`}>
                <li>To provide expense tracking, auditing, team collaboration, and account management features.</li>
                <li>To process subscriptions, billing transactions, and seat license provisioning.</li>
                <li>To send transaction confirmations, policy alerts, and support communications.</li>
                <li>To optimize reliability, system security, and user experience.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                4. Legal Basis and Consent
              </h2>
              <p className={themeTextMuted}>
                Where required, we process personal data based on consent, contractual necessity, legal obligations, or legitimate business interests. You may withdraw consent where applicable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                5. Data Sharing
              </h2>
              <p className={themeTextMuted}>
                We may share data with trusted service providers required to deliver core features (for example, secure database hosting, payment processing, file storage, and email delivery), subject to contractual safeguards.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                6. Data Retention
              </h2>
              <p className={themeTextMuted}>
                We retain personal data only as long as necessary for service delivery, legal compliance, dispute resolution, and security. Data may be deleted or anonymized when no longer required.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                7. Your Rights
              </h2>
              <p className={themeTextMuted}>
                Subject to applicable law, you may request access, correction, or deletion of your personal data.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:support@anshapps.com"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-450 hover:underline hover:text-emerald-400"
                >
                  <Mail className="h-4 w-4" />
                  support@anshapps.com
                </a>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                8. Security
              </h2>
              <p className={themeTextMuted}>
                We implement robust technical and organizational safeguards (including database isolation, encryption, and secure session management) to protect personal data from unauthorized access, loss, misuse, or alteration.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                9. India-Specific Compliance Note
              </h2>
              <p className={themeTextMuted}>
                We aim to align privacy operations with applicable Indian law, including relevant requirements under the Information Technology Act, 2000 and India's digital personal data protection framework.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                10. Billing and Refund Clarification
              </h2>
              <p className={themeTextMuted}>
                Payment and subscription terms (including cancellation and refund position) are described in our{" "}
                <Link href="/terms" className="font-bold text-[#00D8A5] hover:underline">
                  Terms & Conditions
                </Link>
                . For clarity, ANSH Expense does not provide refunds for user-initiated subscription cancellation or account deletion.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-black uppercase tracking-wider ${isDark ? "text-white" : "text-slate-850"}`}>
                11. Policy Updates
              </h2>
              <p className={themeTextMuted}>
                We may update this policy from time to time. Material updates will be reflected on this page with a revised "Last updated" date.
              </p>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}
