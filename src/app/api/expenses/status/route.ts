import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { convertToWorkspaceCurrency } from "@/lib/currency";

// Maps personal expense claim categories → company expense categories
function mapClaimCategoryToCompany(claimCategory: string): string {
  if (claimCategory.startsWith("Other")) {
    return "Other";
  }
  const map: Record<string, string> = {
    Travel: "Office Operations",
    Meals: "Office Operations",
    Software: "SaaS & Software",
    "Office Supplies": "Office Operations",
    Mileage: "Office Operations",
    Other: "Other",
  };
  return map[claimCategory] || "Other";
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Checking/Updating claim status requires Admin or Manager permissions
    const isAuthorized =
      employee.role === "Admin" ||
      employee.role === "Manager" ||
      employee.role === "Owner" ||
      employee.role === "HR Manager";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Claim ID and status are required" },
        { status: 400 }
      );
    }

    // Verify claim exists in the same workspace
    const claim = await prisma.expenseClaim.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Expense claim not found" },
        { status: 404 }
      );
    }

    if (claim.wid !== (employee.wid ?? 1)) {
      return NextResponse.json(
        { error: "Unauthorized workspace claim update" },
        { status: 403 }
      );
    }

    const wid = employee.wid ?? 1;

    // --- Determine workspace currency ---
    let workspaceCurrency = "USD";
    try {
      const workspace = await prisma.workspace.findUnique({ where: { id: wid } });
      if (workspace?.settingsJson) {
        const parsed = JSON.parse(workspace.settingsJson);
        workspaceCurrency = parsed?.workspaceSettings?.currency || "USD";
      }
    } catch {
      // fall back to USD
    }

    // --- Update claim status ---
    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: {
        status,
        reason: reason?.trim() || claim.reason,
        approvedBy: employee.id,
      },
    });

    // --- Sync to CompanyExpense ---
    if (status === "Approved") {
      // Convert the claim amount to the workspace currency
      const convertedAmount = convertToWorkspaceCurrency(
        claim.amount,
        claim.currency,
        workspaceCurrency
      );

      // Upsert based on the unique claimId to avoid duplicates
      await prisma.companyExpense.upsert({
        where: { claimId: claim.id },
        update: {
          // If re-approved after a status change, refresh the values
          amount: convertedAmount,
          currency: workspaceCurrency,
          date: claim.date,
          title: claim.title,
          category: mapClaimCategoryToCompany(claim.category),
        },
        create: {
          title: `[Claim] ${claim.title}`,
          amount: convertedAmount,
          currency: workspaceCurrency,
          category: mapClaimCategoryToCompany(claim.category),
          date: claim.date,
          paymentMethod: "Bank Transfer",
          paymentStatus: "Paid",
          receiptUrl: claim.receiptUrl || undefined,
          vendor: undefined,
          notes: `Auto-generated from approved expense claim by ${claim.employee.name}.`,
          wid,
          loggedById: employee.id,
          claimId: claim.id,
        },
      });
    } else {
      // If status moves away from Approved, remove the synced CompanyExpense
      try {
        await prisma.companyExpense.delete({
          where: { claimId: claim.id },
        });
      } catch {
        // Record didn't exist — that's fine, ignore
      }
    }

    return NextResponse.json({ claim: updated });
  } catch (error) {
    console.error("POST /api/expenses/status error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
