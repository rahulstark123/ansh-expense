import { NextResponse } from "next/server";
import { getBillingAuthorizedEmployee, getEmployeeWorkspaceId } from "@/lib/billing/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const employee = await getBillingAuthorizedEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = getEmployeeWorkspaceId(employee);

    const receipts = await prisma.receipt.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        receiptNumber: true,
        invoiceNumber: true,
        amountPaisa: true,
        currency: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ receipts });
  } catch (error) {
    console.error("GET /api/billing/receipts error:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}
