"use client";

import { BadgeCheck, Building2, ShieldCheck, Receipt } from "lucide-react";
import { landingAccent, landingSurfaces } from "@/components/landing/brand-theme";

export const UDYAM_REGISTRATION_NUMBER = "UDYAM-BR-23-0127857";
export const GSTIN_NUMBER = "10DIUPR1358M1ZP";
export const TRUST_COMPLIANCE_SECTION_ID = "trust-compliance";

type TrustComplianceProps = {
  isDark: boolean;
  containerClass?: string;
  showDescription?: boolean;
  compact?: boolean;
  id?: string;
};

export function TrustCompliance({
  isDark,
  containerClass = "mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12",
  showDescription = true,
  compact = false,
  id = TRUST_COMPLIANCE_SECTION_ID,
}: TrustComplianceProps) {
  const s = landingSurfaces(isDark);
  const a = landingAccent(isDark);
  const themeBorder = s.border;
  const themeTextMuted = s.textMuted;
  const themeTextMutedLighter = s.textMutedLighter;

  return (
    <section
      id={id}
      className={`relative z-10 border-t ${themeBorder} ${s.sectionAlt} ${compact ? "py-16" : "py-24"}`}
    >
      <div className={`${containerClass} ${compact ? "space-y-10" : "space-y-16"}`}>
        <div className={`text-center space-y-4 ${compact ? "max-w-2xl" : "max-w-3xl"} mx-auto`}>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full ${a.badgeSoft} px-3.5 py-1.5 text-[10px] font-black ${a.text} uppercase tracking-widest`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Trust & Compliance
          </div>
          <h2
            className={`${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"} font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}
          >
            Credibility you can verify
          </h2>
          {!compact && (
            <p className={`text-sm sm:text-base font-semibold ${themeTextMuted} leading-relaxed`}>
              Registered, accountable, and building business software from India for teams worldwide.
            </p>
          )}
        </div>

        <div className={`grid gap-6 grid-cols-1 ${compact ? "md:grid-cols-3" : "md:grid-cols-3 lg:gap-8"}`}>
          <div
            className={`rounded-3xl border ${s.cardSurface} p-6 sm:p-8 space-y-5 transition-all duration-300 ${a.cardHover}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                MSME Registered Enterprise
              </h3>
              <p className={`text-xs sm:text-sm font-semibold ${themeTextMuted}`}>
                Government of India Udyam Registered
              </p>
            </div>
            <div
              className={`rounded-2xl border ${themeBorder} ${isDark ? "bg-zinc-950/50" : "bg-zinc-50/80"} px-4 py-3 text-left`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest ${themeTextMutedLighter}`}>
                Udyam Registration Number
              </p>
              <p
                className={`mt-1 font-mono text-sm sm:text-base font-bold tracking-wide ${isDark ? "text-zinc-100" : "text-zinc-800"}`}
              >
                {UDYAM_REGISTRATION_NUMBER}
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border ${s.cardSurface} p-6 sm:p-8 space-y-5 transition-all duration-300 ${a.cardHover}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
              <Receipt className="h-5 w-5" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                GSTIN Registered
              </h3>
              <p className={`text-xs sm:text-sm font-semibold ${themeTextMuted}`}>
                Goods and Services Tax Identification Number
              </p>
            </div>
            <div
              className={`rounded-2xl border ${themeBorder} ${isDark ? "bg-zinc-950/50" : "bg-zinc-50/80"} px-4 py-3 text-left`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest ${themeTextMutedLighter}`}>
                GSTIN Number
              </p>
              <p
                className={`mt-1 font-mono text-sm sm:text-base font-bold tracking-wide ${isDark ? "text-zinc-100" : "text-zinc-800"}`}
              >
                {GSTIN_NUMBER}
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border ${s.cardSurface} p-6 sm:p-8 space-y-5 transition-all duration-300 ${a.cardHover}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconCircle}`}>
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2 text-left">
              <h3 className={`text-base font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                Built from Bharat, Ready for the World
              </h3>
              {showDescription && (
                <p className={`text-xs sm:text-sm font-semibold ${themeTextMuted} leading-relaxed`}>
                  ANSH Apps is a Government of India MSME-registered software company building simple,
                  affordable, and modern business software for teams, startups, and growing businesses.
                </p>
              )}
            </div>
            <div className={`flex items-center gap-2 pt-1 text-left`}>
              <ShieldCheck className={`h-4 w-4 shrink-0 ${a.check}`} strokeWidth={2.5} />
              <p className={`text-[11px] sm:text-xs font-semibold ${themeTextMutedLighter}`}>
                Trusted by startups, MSMEs, schools, PGs, and growing businesses across India.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
