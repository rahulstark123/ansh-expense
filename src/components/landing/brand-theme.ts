/** Ansh Apps brand tokens — landing page only */

export function brandGradientText(isDark: boolean) {
  return isDark
    ? "bg-gradient-to-r from-[#4dc4ff] via-[#8b5cf6] to-[#e879f9] bg-clip-text text-transparent"
    : "bg-gradient-to-r from-[#00c6ff] via-[#7000ff] to-[#e040fb] bg-clip-text text-transparent";
}

export const BRAND_BTN_PRIMARY =
  "bg-gradient-to-r from-blue-600 to-[#9333EA] text-white shadow-lg shadow-purple-500/25 hover:from-blue-700 hover:to-violet-700";

export const BRAND_BTN_CTA =
  "bg-gradient-to-r from-[#00C6FF] to-[#9333EA] text-white shadow-lg shadow-violet-500/25 hover:from-[#00B4EA] hover:to-[#7C22D4]";

export function landingSurfaces(isDark: boolean) {
  return {
    bg: isDark ? "bg-zinc-950" : "bg-zinc-50",
    text: isDark ? "text-zinc-100" : "text-zinc-900",
    textMuted: isDark ? "text-zinc-300" : "text-zinc-600",
    textMutedLighter: isDark ? "text-zinc-400" : "text-zinc-500",
    border: isDark ? "border-white/5" : "border-zinc-200",
    cardBg: isDark
      ? "bg-zinc-900/80 border border-white/5"
      : "bg-white border border-zinc-200/60 shadow-sm",
    cardBgMuted: isDark
      ? "bg-zinc-900/60 border border-white/5"
      : "bg-white border border-zinc-200/80 shadow-sm hover:border-zinc-300",
    headerBg: isDark ? "bg-zinc-950/90" : "bg-white/85",
    navbarLinks: isDark
      ? "text-zinc-400 hover:text-violet-400"
      : "text-zinc-600 hover:text-blue-600",
    sectionAlt: isDark ? "bg-zinc-900/90" : "bg-zinc-100/80",
    footerBg: isDark ? "bg-zinc-950" : "bg-white",
    selection: isDark
      ? "selection:bg-violet-500/20 selection:text-violet-400"
      : "selection:bg-violet-500/20 selection:text-blue-700",
    cardSurface: isDark ? "border-white/5 bg-zinc-900/40" : "border-zinc-200 bg-white shadow-sm hover:shadow-md",
    cardSurfaceHover: isDark
      ? "border-white/5 bg-zinc-900/60 hover:border-white/10"
      : "border-zinc-200 bg-white/70 shadow-sm hover:border-zinc-300 hover:shadow",
    widgetBg: isDark ? "border-zinc-800 bg-zinc-900/90" : "border-zinc-200 bg-white",
    marqueeBg: isDark ? "bg-zinc-950/95" : "bg-zinc-50/90",
    marqueeFade: isDark ? "from-zinc-950" : "from-zinc-50",
    ctaOverlay: isDark
      ? "bg-gradient-to-b from-transparent to-zinc-950/30"
      : "bg-gradient-to-b from-transparent to-zinc-100/50",
  };
}

export function landingAccent(isDark: boolean) {
  return {
    text: isDark ? "text-violet-400" : "text-blue-600",
    textHover: isDark ? "hover:text-violet-400" : "hover:text-blue-600",
    link: isDark ? "text-violet-400 hover:text-violet-300" : "text-blue-600 hover:text-blue-700",
    check: isDark ? "text-violet-400" : "text-blue-600",
    iconCircle: isDark
      ? "bg-blue-500/10 text-violet-400 border border-violet-500/20 group-hover:bg-blue-500/15"
      : "bg-blue-500/10 text-blue-600 border border-violet-500/20 group-hover:bg-blue-500/15",
    badge: isDark
      ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
      : "bg-blue-500/10 border border-violet-500/20 text-blue-700",
    badgeSoft: isDark
      ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
      : "bg-blue-500/10 border border-violet-500/20 text-blue-700",
    cardHover: isDark ? "hover:border-violet-500/20" : "hover:border-blue-500/30",
    proBorder: isDark ? "border-violet-500/25" : "border-blue-500/45",
    proBorderHover: isDark ? "hover:border-violet-500/50" : "hover:border-blue-500/50",
    faqOpen: isDark
      ? "bg-zinc-950 border-violet-500/30 shadow-lg shadow-violet-500/10"
      : "bg-white border-blue-500/35 shadow-sm",
    faqIconOpen: "bg-blue-500/10 border-violet-500/30 text-violet-400",
    themeToggleActive: isDark ? "text-violet-400" : "text-blue-600",
    slogan: isDark ? "text-violet-400" : "text-blue-600",
    mail: isDark ? "text-violet-400 hover:text-violet-300" : "text-blue-600 hover:text-blue-700",
    comparisonHighlight: isDark
      ? "border-violet-500/20 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-transparent"
      : "border-blue-500/35 bg-gradient-to-r from-blue-500/10 via-violet-500/5 to-transparent",
    feedIcon: isDark
      ? "bg-blue-500/10 border-violet-500/20 text-violet-400"
      : "bg-blue-500/10 border-violet-500/20 text-blue-600",
    liveBadge: isDark
      ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
      : "border-violet-500/30 bg-violet-500/10 text-[#9333EA]",
  };
}

export function glowOpacity(isDark: boolean) {
  return isDark ? 0.05 : 0.1;
}
