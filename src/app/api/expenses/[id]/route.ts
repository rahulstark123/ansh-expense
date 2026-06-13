import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const claim = await prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      return NextResponse.json({ error: "Expense claim not found" }, { status: 404 });
    }

    // Authorization check: 
    // - Owner of the claim can delete it if it is still Pending
    // - Admins/Managers can delete any claim within the workspace
    const isOwner = claim.employeeId === employee.id;
    const isAdminOrManager = ["admin", "manager", "owner"].includes(employee.role.toLowerCase());
    
    if (!isAdminOrManager && !(isOwner && claim.status === "Pending")) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own pending claims." },
        { status: 403 }
      );
    }

    await prisma.expenseClaim.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const claim = await prisma.expenseClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      return NextResponse.json({ error: "Expense claim not found" }, { status: 404 });
    }

    if (claim.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Unauthorized workspace" }, { status: 403 });
    }

    const isOwner = claim.employeeId === employee.id;
    const isAdminOrManager = ["admin", "manager", "owner", "hr", "hr manager"].includes(employee.role.toLowerCase());

    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Employees can only edit if Pending or NeedsInfo
    if (!isAdminOrManager && !["Pending", "NeedsInfo"].includes(claim.status)) {
      return NextResponse.json({ error: "Forbidden: Cannot edit an approved or rejected claim." }, { status: 403 });
    }

    const body = await req.json();
    const {
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
      status,
    } = body;

    const dataToUpdate: any = {};

    if (title !== undefined) dataToUpdate.title = title.trim();
    if (category !== undefined) dataToUpdate.category = category;
    if (date !== undefined) dataToUpdate.date = date;
    if (reason !== undefined) dataToUpdate.reason = reason.trim();
    if (receiptUrl !== undefined) dataToUpdate.receiptUrl = receiptUrl;
    if (isMileage !== undefined) dataToUpdate.isMileage = Boolean(isMileage);
    if (mileageRate !== undefined) dataToUpdate.mileageRate = mileageRate !== null ? Number(mileageRate) : null;
    if (distanceKm !== undefined) dataToUpdate.distanceKm = distanceKm !== null ? Number(distanceKm) : null;
    if (taxPercent !== undefined) dataToUpdate.taxPercent = Number(taxPercent || 0);
    if (projectId !== undefined) dataToUpdate.projectId = projectId || null;

    // Currency and Amount conversion
    if (amount !== undefined) {
      let targetCurrency = claim.currency;
      const workspace = await prisma.workspace.findUnique({
        where: { id: employee.wid ?? 1 },
      });
      if (workspace?.settingsJson) {
        try {
          const parsed = JSON.parse(workspace.settingsJson);
          if (parsed.workspaceSettings?.currency) {
            targetCurrency = parsed.workspaceSettings.currency;
          }
        } catch (e) {}
      }

      const sourceCurrency = currency || claim.currency || "USD";
      let finalAmount = amount;
      let finalTaxAmount = Number(taxAmount || 0);

      if (sourceCurrency.toUpperCase() !== targetCurrency.toUpperCase()) {
        const { convertToWorkspaceCurrency } = require("@/lib/currency");
        finalAmount = convertToWorkspaceCurrency(amount, sourceCurrency, targetCurrency);
        if (finalTaxAmount > 0) {
          finalTaxAmount = convertToWorkspaceCurrency(finalTaxAmount, sourceCurrency, targetCurrency);
        }
      }

      dataToUpdate.amount = finalAmount;
      dataToUpdate.currency = targetCurrency;
      if (taxAmount !== undefined) {
        dataToUpdate.taxAmount = finalTaxAmount;
      }
    }

    if (status !== undefined) {
      if (status === "Pending") {
        if (claim.status === "NeedsInfo") {
          dataToUpdate.status = "Pending";
          dataToUpdate.approvedBy = null;
        } else if (isAdminOrManager) {
          dataToUpdate.status = "Pending";
          dataToUpdate.approvedBy = null;
        }
      } else if (isAdminOrManager) {
        dataToUpdate.status = status;
      }
    }

    const updated = await prisma.expenseClaim.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ claim: updated });
  } catch (error) {
    console.error("PATCH /api/expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

