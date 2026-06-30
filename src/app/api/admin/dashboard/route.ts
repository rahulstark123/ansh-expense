import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const [
      ticketCounts,
      workspaceCount,
      activeSubscriptions,
      successfulTransactions,
      recentTickets,
    ] = await Promise.all([
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.workspace.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amountPaisa: true },
        _count: true,
      }),
      prisma.supportTicket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          employee: { select: { name: true } },
        },
      }),
    ]);

    const ticketsByStatus = Object.fromEntries(
      ticketCounts.map((row) => [row.status, row._count.status])
    );

    const openTickets =
      (ticketsByStatus["Open"] || 0) + (ticketsByStatus["In Progress"] || 0);

    return NextResponse.json({
      stats: {
        workspaces: workspaceCount,
        activeSubscriptions,
        openTickets,
        totalTickets: Object.values(ticketsByStatus).reduce((a, b) => a + b, 0),
        totalRevenuePaisa: successfulTransactions._sum.amountPaisa || 0,
        successfulPayments: successfulTransactions._count,
        ticketsByStatus,
      },
      recentTickets: recentTickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        employeeName: t.employee?.name || "Unknown",
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
