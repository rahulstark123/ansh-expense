import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Settings,
  User,
  type LucideIcon
} from "lucide-react";
import { useExpenseStore } from "@/stores/expense-store";

export interface GlobalSearchItem {
  id: string;
  group: "navigation" | "employees" | "expenses";
  label: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
}

export function buildGlobalSearchIndex(): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = [
    {
      id: "nav-dash",
      group: "navigation",
      label: "Navigation",
      title: "Dashboard",
      subtitle: "Overview statistics and monthly spending charts",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "nav-claims",
      group: "navigation",
      label: "Navigation",
      title: "My Claims",
      subtitle: "Submit claims, add mileage and projects",
      href: "/expenses",
      icon: Wallet,
    },
    {
      id: "nav-appr",
      group: "navigation",
      label: "Navigation",
      title: "Approvals",
      subtitle: "Review pending employee reimbursement claims",
      href: "/expenses/approvals",
      icon: CheckSquare,
    },
    {
      id: "nav-proj",
      group: "navigation",
      label: "Navigation",
      title: "Workspace Projects",
      subtitle: "Manage client contracts and mapping targets",
      href: "/expenses/projects",
      icon: FolderOpen,
    },
    {
      id: "nav-rep",
      group: "navigation",
      label: "Navigation",
      title: "Reports & Analytics",
      subtitle: "Review spending category distributions",
      href: "/reports",
      icon: BarChart3,
    },
    {
      id: "nav-set",
      group: "navigation",
      label: "Navigation",
      title: "Settings",
      subtitle: "Personalization, dynamic theme switcher, and billing details",
      href: "/settings/profile",
      icon: Settings,
    },
  ];

  try {
    const db = useExpenseStore.getState();
    db.employees.forEach(emp => {
      items.push({
        id: `emp-${emp.id}`,
        group: "employees",
        label: "Team Members",
        title: emp.name,
        subtitle: `${emp.department} · ${emp.role}`,
        href: `/expenses/approvals`,
        icon: User,
      });
    });

    db.expenses.forEach(claim => {
      items.push({
        id: `claim-${claim.id}`,
        group: "expenses",
        label: "Expense Claims",
        title: claim.title,
        subtitle: `₹${claim.amount.toLocaleString("en-IN")} · ${claim.category} (${claim.status})`,
        href: claim.status === "Pending" ? "/expenses/approvals" : "/expenses",
        icon: Wallet,
      });
    });
  } catch (e) {
    // SSR Safe
  }

  return items;
}

export function filterSearchItems(items: GlobalSearchItem[], query: string): GlobalSearchItem[] {
  if (!query) return items.slice(0, 6); // Default nav items
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q) ||
      item.label.toLowerCase().includes(q)
  );
}

export interface GroupedResults {
  group: "navigation" | "employees" | "expenses";
  label: string;
  items: GlobalSearchItem[];
}

export function groupSearchResults(items: GlobalSearchItem[]): GroupedResults[] {
  const groups: Record<string, { label: string; items: GlobalSearchItem[] }> = {
    navigation: { label: "Pages", items: [] },
    employees: { label: "Employees", items: [] },
    expenses: { label: "Claims Logs", items: [] },
  };

  items.forEach((item) => {
    if (groups[item.group]) {
      groups[item.group].items.push(item);
    }
  });

  return Object.keys(groups)
    .map((k) => ({
      group: k as any,
      label: groups[k].label,
      items: groups[k].items,
    }))
    .filter((g) => g.items.length > 0);
}
