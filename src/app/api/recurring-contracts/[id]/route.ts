import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

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
    const contract = await prisma.recurringContract.findUnique({
      where: { id },
    });

    if (!contract || contract.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Contract not found" }, { status: 444 });
    }

    const body = await req.json();
    const { title, vendor, amount, currency, billingCycle, startDate, nextRenewalDate, status } = body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (vendor !== undefined) updateData.vendor = vendor.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (currency !== undefined) updateData.currency = currency;
    if (billingCycle !== undefined) {
      const validCycles = ["Monthly", "Quarterly", "Yearly"];
      if (!validCycles.includes(billingCycle)) {
        return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
      }
      updateData.billingCycle = billingCycle;
    }
    if (startDate !== undefined) updateData.startDate = startDate;
    if (nextRenewalDate !== undefined) updateData.nextRenewalDate = nextRenewalDate;
    if (status !== undefined) {
      const validStatuses = ["Active", "Paused", "Expired"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = status;
    }

    const updated = await prisma.recurringContract.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error("PATCH /api/recurring-contracts/[id] error:", error);
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
    const contract = await prisma.recurringContract.findUnique({
      where: { id },
    });

    if (!contract || contract.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Contract not found" }, { status: 444 });
    }

    await prisma.recurringContract.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/recurring-contracts/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
