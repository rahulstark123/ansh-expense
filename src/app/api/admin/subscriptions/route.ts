import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

function formatPaisa(paisa: number) {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthlyEquivalentPaisa(amountPaisa: number, cycle: string) {
  return cycle === "yearly" ? Math.round(amountPaisa / 12) : amountPaisa;
}

export async function GET(req: Request) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const subscriptions = await prisma.subscription.findMany({
      include: {
        workspace: { select: { id: true, name: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const active = subscriptions.filter((s) => s.status === "ACTIVE");
    const pending = subscriptions.filter((s) => s.status === "PENDING" || s.status === "SCHEDULED");
    const cancelledOrExpired = subscriptions.filter(
      (s) => s.status === "CANCELLED" || (s.expiresAt && s.expiresAt < now)
    );
    const newThisMonth = subscriptions.filter((s) => s.createdAt >= monthStart);

    const monthlyRecurringPaisa = active.reduce(
      (sum, s) => sum + monthlyEquivalentPaisa(s.amountPaisa, s.billingCycle),
      0
    );

    const activeWorkspaceIds = new Set(active.map((s) => s.workspaceId));
    const avgSeats =
      active.length > 0
        ? active.reduce((sum, s) => sum + s.seatsCount, 0) / active.length
        : 0;

    return NextResponse.json({
      stats: {
        activeCount: active.length,
        totalCount: subscriptions.length,
        pendingCount: pending.length,
        monthlyRecurringPaisa,
        monthlyRecurring: formatPaisa(monthlyRecurringPaisa),
        newThisMonth: newThisMonth.length,
        cancelledOrExpired: cancelledOrExpired.length,
        avgSeats: Math.round(avgSeats * 10) / 10,
        activeWorkspaces: activeWorkspaceIds.size,
      },
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        workspaceId: s.workspaceId,
        workspaceName: s.workspace?.name || `Workspace ${s.workspaceId}`,
        plan: s.plan,
        status: s.status,
        seatsCount: s.seatsCount,
        amountPaisa: s.amountPaisa,
        amount: formatPaisa(s.amountPaisa),
        billingCycle: s.billingCycle,
        startsAt: s.startsAt,
        expiresAt: s.expiresAt,
        transactionCount: s._count.transactions,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/subscriptions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
