import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Settings,
  User,
  Building,
  CreditCard,
  FileText,
  UsersRound,
  History,
  Megaphone,
  Store,
  Repeat
} from "lucide-react";

export type NavSectionId =
  | "dashboard"
  | "company-expenses"
  | "activity"
  | "announcements"
  | "expenses"
  | "team"
  | "reports"
  | "settings";

export interface SubNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface MainNavItem {
  id: NavSectionId;
  label: string;
  href: string;
  icon: LucideIcon;
  subNav?: SubNavItem[];
}

export const mainNav: MainNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "company-expenses",
    label: "Company Expenses",
    href: "/company-expenses",
    icon: Building,
    subNav: [
      { id: "company-ledger", label: "General Ledger", href: "/company-expenses", icon: FileText },
      { id: "company-analytics", label: "Analytics Desk", href: "/company-expenses/analytics", icon: BarChart3 },
      { id: "company-vendors", label: "Vendor Registry", href: "/company-expenses/vendors", icon: Store },
      { id: "company-recurring", label: "Recurring Contracts", href: "/company-expenses/recurring", icon: Repeat },
      { id: "company-settings", label: "Settings", href: "/company-expenses/settings", icon: Settings },
    ],
  },
  {
    id: "expenses",
    label: "Expense Tracker",
    href: "/expenses",
    icon: Wallet,
    subNav: [
      { id: "my-expenses", label: "My Claims", href: "/expenses", icon: FileText },
      { id: "approvals", label: "Approvals", href: "/expenses/approvals", icon: CheckSquare, badge: "0" },
      { id: "projects", label: "Projects", href: "/expenses/projects", icon: FolderOpen },
    ],
  },
  {
    id: "team",
    label: "Team Directory",
    href: "/team",
    icon: UsersRound,
  },
  {
    id: "activity",
    label: "Activity Feed",
    href: "/activity",
    icon: History,
  },
  {
    id: "announcements",
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    subNav: [
      { id: "my-analytics", label: "My Analytics", href: "/reports", icon: User },
      { id: "team-analytics", label: "Team Analytics", href: "/reports/team", icon: UsersRound },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings/profile",
    icon: Settings,
    subNav: [
      { id: "profile", label: "Profile Settings", href: "/settings/profile", icon: User },
      { id: "company", label: "Company Settings", href: "/settings/company", icon: Building },
      { id: "billing", label: "Billing & Plans", href: "/settings/billing", icon: CreditCard },
    ],
  },
];

export function getSectionFromPath(pathname: string): NavSectionId {
  if (pathname === "/dashboard" || pathname === "/") return "dashboard";
  const segment = pathname.split("/")[1] as NavSectionId;
  const match = mainNav.find((item) => item.id === segment);
  return match?.id ?? "dashboard";
}

export function getSubNavForSection(sectionId: NavSectionId): SubNavItem[] | undefined {
  return mainNav.find((item) => item.id === sectionId)?.subNav;
}

export function getSectionMeta(sectionId: NavSectionId) {
  return mainNav.find((item) => item.id === sectionId);
}
