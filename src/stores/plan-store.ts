import { create } from "zustand";

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
}

export type PlanFeatureId = "multi-user" | "unlimited-claims" | "advanced-reports" | "projects";

export const planFeatures: Record<PlanFeatureId, PlanFeature> = {
  "multi-user": {
    id: "multi-user",
    name: "Collaborative Team Workspaces",
    description: "Invite unlimited employees, assign managers, and run approval workflows.",
  },
  "unlimited-claims": {
    id: "unlimited-claims",
    name: "Unlimited Expense Tracking",
    description: "File and store unlimited expense receipts, mileage, and client projects.",
  },
  "advanced-reports": {
    id: "advanced-reports",
    name: "Advanced Spending Reports",
    description: "Export high-fidelity spreadsheet CSV logs, category breakdowns, and audit trails.",
  },
  "projects": {
    id: "projects",
    name: "Project Mapping",
    description: "Map expense claims to client contracts and workspace projects.",
  },
};

interface PlanState {
  loaded: boolean;
  hasProAccess: boolean;
  isTrialActive: boolean;
  hasScheduledPro: boolean;
  scheduledProStartsAt: string | null;
  trialDaysRemaining: number | null;
  trialEndsAt: string | null;
  plan: string;
  planName: string;
  modalOpen: boolean;
  checkoutModalOpen: boolean;
  checkoutOnSuccess: (() => void | Promise<void>) | null;
  blockedFeature: PlanFeature | null;
  fetchPlan: () => Promise<void>;
  requestUpgrade: (featureId: PlanFeatureId) => void;
  closeModal: () => void;
  openCheckoutModal: (onSuccess?: () => void | Promise<void>) => void;
  closeCheckoutModal: () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  loaded: false,
  hasProAccess: true, // Default to true, then check DB
  isTrialActive: false,
  hasScheduledPro: false,
  scheduledProStartsAt: null,
  trialDaysRemaining: null,
  trialEndsAt: null,
  plan: "free",
  planName: "ANSH Expense Free Edition",
  modalOpen: false,
  checkoutModalOpen: false,
  checkoutOnSuccess: null,
  blockedFeature: null,

  fetchPlan: async () => {
    try {
      const token = sessionStorage.getItem("ansh_auth_token");
      if (!token) return;

      const res = await fetch("/api/billing/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      set({
        loaded: true,
        hasProAccess: Boolean(data.hasProAccess),
        isTrialActive: Boolean(data.isTrialActive),
        hasScheduledPro: Boolean(data.hasScheduledPro),
        scheduledProStartsAt: data.scheduledProStartsAt ?? null,
        trialDaysRemaining: data.trialDaysRemaining ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
        plan: data.plan ?? "free",
        planName: data.planName ?? "ANSH Expense Free Edition",
      });
    } catch (err) {
      console.error("Failed to load plan status:", err);
      set({ loaded: true });
    }
  },

  requestUpgrade: (featureId) => {
    set({
      modalOpen: true,
      blockedFeature: planFeatures[featureId] || null,
    });
  },

  closeModal: () => {
    set({ modalOpen: false, blockedFeature: null });
  },

  openCheckoutModal: (onSuccess) => {
    set({
      checkoutModalOpen: true,
      checkoutOnSuccess: onSuccess ?? null,
      modalOpen: false,
      blockedFeature: null,
    });
  },

  closeCheckoutModal: () => {
    set({ checkoutModalOpen: false, checkoutOnSuccess: null });
  },
}));
