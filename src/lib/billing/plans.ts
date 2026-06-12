export const FREE_MAX_USERS = 5;
export const PRO_MAX_USERS = 500;

export const FREE_PLAN_NAME = "ANSH Expense Free Edition";
export const PRO_PLAN_NAME = "ANSH Expense Pro Edition";
export const TRIAL_PLAN_NAME = "ANSH Expense Pro Trial";

export type BillingCycle = "monthly" | "yearly";

export function isProPlan(plan: string | null | undefined): boolean {
  return plan === "pro";
}

export function planDisplayName(plan: string | null | undefined): string {
  return isProPlan(plan) ? PRO_PLAN_NAME : FREE_PLAN_NAME;
}
