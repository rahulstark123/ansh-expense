import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

function formatPaisa(paisa: number) {
  return `₹${(paisa / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function GET(req: Request) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const transactions = await prisma.transaction.findMany({
      include: {
        workspace: { select: { id: true, name: true } },
        subscription: { select: { plan: true, billingCycle: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const success = transactions.filter((t) => t.status === "SUCCESS");
    const failed = transactions.filter((t) => t.status === "FAILED");
    const totalRevenuePaisa = success.reduce((sum, t) => sum + t.amountPaisa, 0);

    return NextResponse.json({
      stats: {
        totalCount: transactions.length,
        successCount: success.length,
        failedCount: failed.length,
        totalRevenuePaisa,
        totalRevenue: formatPaisa(totalRevenuePaisa),
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        workspaceId: t.workspaceId,
        workspaceName: t.workspace?.name || `Workspace ${t.workspaceId}`,
        subscriptionId: t.subscriptionId,
        plan: t.subscription?.plan || "—",
        status: t.status,
        amountPaisa: t.amountPaisa,
        amount: formatPaisa(t.amountPaisa),
        razorpayOrderId: t.razorpayOrderId,
        razorpayPaymentId: t.razorpayPaymentId,
        description: t.description,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
