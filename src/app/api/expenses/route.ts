import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { canWorkspaceLogClaim } from "@/lib/billing/workspace-access";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wid = employee.wid ?? 1;

    // Check if the workspace is within its plan limits
    const check = await canWorkspaceLogClaim(wid);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason }, { status: 403 });
    }

    const body = await req.json();
    const {
      employeeId,
      title,
      category,
      amount,
      currency,
      date,
      reason,
      receiptUrl,
      isMileage,
      mileageRate,
      distanceKm,
      taxPercent,
      taxAmount,
      projectId,
    } = body;

    if (!title?.trim() || !category || typeof amount !== "number") {
      return NextResponse.json({ error: "Missing required fields or invalid amount" }, { status: 400 });
    }

    const created = await prisma.expenseClaim.create({
      data: {
        employeeId: employeeId || employee.id,
        title: title.trim(),
        category,
        amount,
        currency: currency || "USD",
        date: date || new Date().toISOString().slice(0, 10),
        status: "Pending",
        reason: reason?.trim() || "",
        receiptUrl: receiptUrl || null,
        isMileage: Boolean(isMileage),
        mileageRate: isMileage ? Number(mileageRate) : null,
        distanceKm: isMileage ? Number(distanceKm) : null,
        taxPercent: Number(taxPercent || 0),
        taxAmount: Number(taxAmount || 0),
        projectId: projectId || null,
        wid,
      },
    });

    return NextResponse.json({ claim: created });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
