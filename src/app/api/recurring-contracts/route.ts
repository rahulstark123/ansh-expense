import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

const isAuthorized = (role: string) => {
  const r = role.toLowerCase();
  return ["admin", "manager", "owner", "hr", "hr manager"].includes(r);
};

export async function GET(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAuthorized(employee.role)) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const wid = employee.wid ?? 1;
    const contracts = await prisma.recurringContract.findMany({
      where: { wid },
      orderBy: { nextRenewalDate: "asc" },
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error("GET /api/recurring-contracts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAuthorized(employee.role)) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { title, vendor, amount, currency, billingCycle, startDate, nextRenewalDate, status } = body;

    if (!title?.trim() || !vendor?.trim() || amount === undefined || amount <= 0 || !billingCycle || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validCycles = ["Monthly", "Quarterly", "Yearly"];
    if (!validCycles.includes(billingCycle)) {
      return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
    }

    // Dynamic nextRenewalDate computation helper if not provided
    let renewal = nextRenewalDate;
    if (!renewal) {
      const start = new Date(startDate);
      if (billingCycle === "Monthly") {
        start.setMonth(start.getMonth() + 1);
      } else if (billingCycle === "Quarterly") {
        start.setMonth(start.getMonth() + 3);
      } else if (billingCycle === "Yearly") {
        start.setFullYear(start.getFullYear() + 1);
      }
      renewal = start.toISOString().slice(0, 10);
    }

    const wid = employee.wid ?? 1;
    const contract = await prisma.recurringContract.create({
      data: {
        title: title.trim(),
        vendor: vendor.trim(),
        amount: Number(amount),
        currency: currency || "USD",
        billingCycle,
        startDate,
        nextRenewalDate: renewal,
        status: status || "Active",
        wid,
      },
    });

    return NextResponse.json({ contract });
  } catch (error) {
    console.error("POST /api/recurring-contracts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
