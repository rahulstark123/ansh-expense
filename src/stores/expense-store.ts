import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { queuedLocalStorage } from "@/lib/safe-storage";

export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "NeedsInfo";
export type EmployeeRole = "Admin" | "Manager" | "Employee" | "Owner" | "HR" | "HR Manager";

export interface ExpenseComment {
  id: string;
  claimId: string;
  employeeId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  avatarInitials: string;
  title: string;
  category: string; // "Travel" | "Meals" | "Software" | "Office Supplies" | "Mileage" | "Other"
  amount: number;
  date: string; // YYYY-MM-DD
  status: ClaimStatus;
  reason: string;
  receiptUrl: string | null;
  isMileage: boolean;
  mileageRate: number | null;
  distanceKm: number | null;
  taxPercent: number;
  taxAmount: number;
  projectId: string | null;
  projectName: string | null;
  approvedBy: string | null;
  appliedAt: string;
  comments: ExpenseComment[];
}

export interface WorkspaceProject {
  id: string;
  name: string;
  clientName: string | null;
  description: string | null;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  avatarInitials: string;
  status: string;
  designation?: string;
  employeeCode?: string;
  phoneNumber?: string;
  reportingManager?: string | null;
  reportingHR?: string | null;
  workLocation?: string;
  branch?: string;
  bloodGroup?: string;
}

interface ExpenseState {
  employees: Employee[];
  expenses: ExpenseClaim[];
  projects: WorkspaceProject[];
  currentUser: Employee;
  initialize: () => Promise<void>;
  addExpense: (claim: Omit<ExpenseClaim, "id" | "employeeName" | "employeeRole" | "avatarInitials" | "appliedAt" | "status" | "projectName" | "approvedBy" | "comments"> & { employeeId?: string | null }) => Promise<void>;
  updateExpenseStatus: (id: string, status: ClaimStatus, reason?: string) => Promise<void>;
  addComment: (claimId: string, content: string) => Promise<void>;
  addProject: (name: string, clientName?: string, description?: string) => Promise<void>;
  switchUser: (id: string) => void;
}

const initialEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "Vikram Malhotra",
    email: "vikram@ansh.com",
    role: "Admin",
    department: "Executive",
    avatarInitials: "VM",
    status: "Active",
    designation: "Managing Director",
    employeeCode: "ANSH-001",
  },
  {
    id: "emp-2",
    name: "Priya Sharma",
    email: "priya.sharma@ansh.com",
    role: "Manager",
    department: "Engineering",
    avatarInitials: "PS",
    status: "Active",
    designation: "Engineering Lead",
    employeeCode: "ANSH-002",
  },
  {
    id: "emp-3",
    name: "Amit Patel",
    email: "amit.patel@ansh.com",
    role: "Employee",
    department: "Product Design",
    avatarInitials: "AP",
    status: "Active",
    designation: "Senior UI Designer",
    employeeCode: "ANSH-003",
  },
  {
    id: "emp-4",
    name: "Rohan Gupta",
    email: "rohan.gupta@ansh.com",
    role: "Employee",
    department: "Engineering",
    avatarInitials: "RG",
    status: "Active",
    designation: "Software Engineer",
    employeeCode: "ANSH-004",
  },
];

const initialProjects: WorkspaceProject[] = [
  { id: "proj-1", name: "Ansh HR Mobile", clientName: "Internal", description: "HR Portal React Native conversion" },
  { id: "proj-2", name: "Acme Web Portal", clientName: "Acme Corp", description: "Design system and SaaS deployment" },
];

const initialExpenses: ExpenseClaim[] = [
  {
    id: "exp-1",
    employeeId: "emp-3",
    employeeName: "Amit Patel",
    employeeRole: "Employee",
    avatarInitials: "AP",
    title: "Sketch and Figma Licenses",
    category: "Software",
    amount: 14500,
    date: "2026-06-08",
    status: "Pending",
    reason: "Annual subscription renewal for product design software.",
    receiptUrl: null,
    isMileage: false,
    mileageRate: null,
    distanceKm: null,
    taxPercent: 18,
    taxAmount: 2211.86,
    projectId: "proj-2",
    projectName: "Acme Web Portal",
    approvedBy: null,
    appliedAt: "2026-06-08T10:00:00.000Z",
    comments: [],
  },
  {
    id: "exp-2",
    employeeId: "emp-4",
    employeeName: "Rohan Gupta",
    employeeRole: "Employee",
    avatarInitials: "RG",
    title: "Client Site Visit to Bengaluru",
    category: "Mileage",
    amount: 3200,
    date: "2026-06-05",
    status: "Approved",
    reason: "Drove to Bengaluru office for team alignment.",
    receiptUrl: null,
    isMileage: true,
    mileageRate: 8,
    distanceKm: 400,
    taxPercent: 0,
    taxAmount: 0,
    projectId: "proj-1",
    projectName: "Ansh HR Mobile",
    approvedBy: "emp-2",
    appliedAt: "2026-06-05T15:30:00.000Z",
    comments: [
      {
        id: "comm-1",
        claimId: "exp-2",
        employeeId: "emp-2",
        authorName: "Priya Sharma",
        content: "Verified mileage calculation. Looks good.",
        createdAt: "2026-06-06T09:12:00.000Z",
      }
    ],
  },
];

const getHeaders = () => {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("ansh_auth_token") : null;
  const impersonateId = typeof window !== "undefined" ? sessionStorage.getItem("ansh_impersonate_user_id") : null;
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(impersonateId ? { "X-Impersonate-User": impersonateId } : {}),
  };
};

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      employees: initialEmployees,
      expenses: initialExpenses,
      projects: initialProjects,
      currentUser: initialEmployees[0],

      initialize: async () => {
        try {
          const headers = getHeaders();
          const res = await fetch("/api/dashboard", { headers });
          if (!res.ok) return;
          const data = await res.json();

          set({
            currentUser: data.currentUser ? {
              id: data.currentUser.id,
              name: data.currentUser.name,
              email: data.currentUser.email,
              role: data.currentUser.role as EmployeeRole,
              department: data.currentUser.department,
              avatarInitials: data.currentUser.avatarInitials,
              status: data.currentUser.status,
              designation: data.currentUser.designation || undefined,
              employeeCode: data.currentUser.employeeCode || undefined,
              phoneNumber: data.currentUser.phoneNumber || undefined,
              reportingManager: data.currentUser.reportingManager || undefined,
              reportingHR: data.currentUser.reportingHR || undefined,
              workLocation: data.currentUser.workLocation || undefined,
              branch: data.currentUser.branch || undefined,
              bloodGroup: data.currentUser.bloodGroup || undefined,
            } : get().currentUser,
            employees: data.employees || get().employees,
            expenses: data.expenses || get().expenses,
            projects: data.projects || get().projects,
          });
        } catch (error) {
          console.error("Store initialization failed:", error);
        }
      },

      addExpense: async (claim) => {
        try {
          const headers = getHeaders();
          const res = await fetch("/api/expenses", {
            method: "POST",
            headers,
            body: JSON.stringify(claim),
          });
          if (!res.ok) throw new Error("Failed to submit expense claim");
          await get().initialize();
        } catch (error) {
          console.error(error);
        }
      },

      updateExpenseStatus: async (id, status, reason = "") => {
        try {
          const headers = getHeaders();
          const res = await fetch("/api/expenses/status", {
            method: "POST",
            headers,
            body: JSON.stringify({ id, status, reason }),
          });
          if (!res.ok) throw new Error("Failed to update status");
          await get().initialize();
        } catch (error) {
          console.error(error);
        }
      },

      addComment: async (claimId, content) => {
        try {
          const headers = getHeaders();
          const res = await fetch("/api/expenses/comments", {
            method: "POST",
            headers,
            body: JSON.stringify({ claimId, content }),
          });
          if (!res.ok) throw new Error("Failed to add comment");
          await get().initialize();
        } catch (error) {
          console.error(error);
        }
      },

      addProject: async (name, clientName = "", description = "") => {
        try {
          const headers = getHeaders();
          const res = await fetch("/api/projects", {
            method: "POST",
            headers,
            body: JSON.stringify({ name, clientName, description }),
          });
          if (!res.ok) throw new Error("Failed to create project");
          await get().initialize();
        } catch (error) {
          console.error(error);
        }
      },

      switchUser: (id) => {
        if (typeof window !== "undefined") {
          if (id === get().employees[0].id) {
            sessionStorage.removeItem("ansh_impersonate_user_id");
          } else {
            sessionStorage.setItem("ansh_impersonate_user_id", id);
          }
        }
        set((state) => {
          const user = state.employees.find((e) => e.id === id) || state.currentUser;
          return { currentUser: user };
        });
        get().initialize();
      },
    }),
    {
      name: "ansh-expense-database",
      version: 1,
      storage: createJSONStorage(() => queuedLocalStorage),
    }
  )
);
