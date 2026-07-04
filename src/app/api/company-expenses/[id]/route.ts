import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { INCOME_CATEGORIES } from "../route";

const isAuthorized = (role: string) => {
  const r = role.toLowerCase();
  return ["admin", "manager", "owner", "hr", "hr manager"].includes(r);
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAuthorized(employee.role)) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const expense = await prisma.companyExpense.findUnique({
      where: { id },
    });

    if (!expense || expense.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Expense not found" }, { status: 444 });
    }

    const body = await req.json();
    const {
      title,
      amount,
      currency,
      category,
      customer,
      date,
      paymentMethod,
      paymentStatus,
      receiptUrl,
      vendor,
      notes,
    } = body;

    const updateData: Record<string, any> = {};

    if (title !== undefined) updateData.title = String(title).trim();
    if (customer !== undefined) updateData.customer = customer ? String(customer).trim() : null;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (currency !== undefined) updateData.currency = currency;
    const wid = employee.wid ?? 1;
    const workspaceObj = await prisma.workspace.findUnique({
      where: { id: wid },
    });

    let validCategories = [
      "Rent & Utilities",
      "SaaS & Software",
      "Marketing & Advertising",
      "Office Operations & Equipment",
      "Salaries & Payroll",
      "Other",
    ];
    let validStatuses = ["Paid", "Unpaid", "Scheduled"];

    if (workspaceObj?.settingsJson) {
      try {
        const parsed = JSON.parse(workspaceObj.settingsJson);
        if (parsed.companyExpensesSettings?.companyCategories) {
          validCategories = parsed.companyExpensesSettings.companyCategories;
        }
        if (parsed.companyExpensesSettings?.paymentStatuses) {
          validStatuses = parsed.companyExpensesSettings.paymentStatuses;
        }
      } catch (e) {
        console.error("Failed to parse settingsJson in PATCH validation:", e);
      }
    }

    if (category !== undefined) {
      const allowedCategories = expense.direction === "in" ? INCOME_CATEGORIES : validCategories;
      if (!allowedCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid category selection" }, { status: 400 });
      }
      updateData.category = category;
    }
    if (date !== undefined) updateData.date = date;
    if (paymentMethod !== undefined) {
      const validMethods = ["Cash", "Company Card", "Bank Transfer", "Cheque", "Other"];
      if (!validMethods.includes(paymentMethod)) {
        return NextResponse.json({ error: "Invalid payment method selection" }, { status: 400 });
      }
      updateData.paymentMethod = paymentMethod;
    }
    if (paymentStatus !== undefined) {
      if (!validStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status selection" }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl ? String(receiptUrl).trim() : null;
    if (vendor !== undefined) updateData.vendor = vendor ? String(vendor).trim() : null;
    if (notes !== undefined) updateData.notes = notes ? String(notes).trim() : "";

    const updated = await prisma.companyExpense.update({
      where: { id },
      data: updateData,
      include: {
        loggedBy: {
          select: {
            name: true,
            email: true,
            avatarInitials: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ expense: updated });
  } catch (error) {
    console.error("PATCH /api/company-expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAuthorized(employee.role)) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const expense = await prisma.companyExpense.findUnique({
      where: { id },
    });

    if (!expense || expense.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Expense not found" }, { status: 444 });
    }

    await prisma.companyExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/company-expenses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
