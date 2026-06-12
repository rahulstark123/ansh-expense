import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Checking/Updating claim status requires Admin or Manager permissions
    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, reason } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Claim ID and status are required" }, { status: 400 });
    }

    // Verify claim exists in the same workspace
    const claim = await prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      return NextResponse.json({ error: "Expense claim not found" }, { status: 404 });
    }

    if (claim.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Unauthorized workspace claim update" }, { status: 403 });
    }

    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status,
        reason: reason?.trim() || claim.reason,
        approvedBy: employee.id,
      },
    });

    return NextResponse.json({ claim: updated });
  } catch (error) {
    console.error("POST /api/expenses/status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
