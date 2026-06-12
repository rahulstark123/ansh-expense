import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, content } = body;

    if (!claimId || !content?.trim()) {
      return NextResponse.json({ error: "Claim ID and comment content are required" }, { status: 400 });
    }

    // Verify claim exists in the same workspace
    const claim = await prisma.expenseClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Expense claim not found" }, { status: 404 });
    }

    if (claim.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Unauthorized workspace comment" }, { status: 403 });
    }

    const comment = await prisma.expenseComment.create({
      data: {
        claimId,
        employeeId: employee.id,
        authorName: employee.name,
        content: content.trim(),
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("POST /api/expenses/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
