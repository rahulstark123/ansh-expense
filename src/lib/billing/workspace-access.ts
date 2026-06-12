import { prisma } from "@/lib/db";
import { ensureWorkspaceBilling } from "./workspace-billing";
import { resolveWorkspaceAccess } from "./access";

export const FREE_MAX_CLAIMS_PER_MONTH = 20;

export async function getWorkspaceAccess(workspaceId: number) {
  const workspace = await ensureWorkspaceBilling(workspaceId);
  return resolveWorkspaceAccess({
    plan: workspace.plan,
    planExpiresAt: workspace.planExpiresAt,
    trialEndsAt: workspace.trialEndsAt,
    maxUsers: workspace.maxUsers,
  });
}

export async function getWorkspaceClaimCountThisMonth(workspaceId: number): Promise<number> {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return prisma.expenseClaim.count({
    where: {
      wid: workspaceId,
      date: { startsWith: monthPrefix },
    },
  });
}

export async function canWorkspaceLogClaim(workspaceId: number): Promise<{
  allowed: boolean;
  used: number;
  limit: number | null;
  reason?: string;
}> {
  const access = await getWorkspaceAccess(workspaceId);

  if (access.hasProAccess) {
    return { allowed: true, used: 0, limit: null };
  }

  const used = await getWorkspaceClaimCountThisMonth(workspaceId);
  const limit = FREE_MAX_CLAIMS_PER_MONTH;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      reason: `Free plan allows ${limit} claims per month. Upgrade to Pro for unlimited expense tracking.`,
    };
  }

  return { allowed: true, used, limit };
}
