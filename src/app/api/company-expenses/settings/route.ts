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
    const workspace = await prisma.workspace.findUnique({
      where: { id: wid },
    });

    let settings: any = {};
    if (workspace?.settingsJson) {
      try {
        const parsed = JSON.parse(workspace.settingsJson);
        settings = parsed.companyExpensesSettings || {};
      } catch (e) {
        console.error("Failed to parse settingsJson:", e);
      }
    }

    // Default fallbacks
    const companyCategories = settings.companyCategories || [
      "Rent & Utilities",
      "SaaS & Software",
      "Marketing & Advertising",
      "Office Operations & Equipment",
      "Salaries & Payroll",
      "Other"
    ];

    const vendorCategories = settings.vendorCategories || [
      "Software & SaaS",
      "Office Utilities",
      "Rent",
      "Marketing",
      "Operations",
      "Other"
    ];

    const billingCycles = settings.billingCycles || [
      "Monthly",
      "Quarterly",
      "Yearly"
    ];

    const paymentStatuses = settings.paymentStatuses || [
      "Paid",
      "Unpaid",
      "Scheduled"
    ];

    return NextResponse.json({
      companyCategories,
      vendorCategories,
      billingCycles,
      paymentStatuses
    });
  } catch (error) {
    console.error("GET /api/company-expenses/settings error:", error);
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
    const { companyCategories, vendorCategories, billingCycles, paymentStatuses } = body;

    if (!Array.isArray(companyCategories) || !Array.isArray(vendorCategories) || !Array.isArray(billingCycles) || !Array.isArray(paymentStatuses)) {
      return NextResponse.json({ error: "Invalid parameters: lists must be arrays" }, { status: 400 });
    }

    // Filter out empty strings and clean them
    const cleanCompanyCategories = companyCategories.map(c => String(c).trim()).filter(Boolean);
    const cleanVendorCategories = vendorCategories.map(c => String(c).trim()).filter(Boolean);
    const cleanBillingCycles = billingCycles.map(c => String(c).trim()).filter(Boolean);
    const cleanPaymentStatuses = paymentStatuses.map(c => String(c).trim()).filter(Boolean);

    const wid = employee.wid ?? 1;
    const workspace = await prisma.workspace.findUnique({
      where: { id: wid },
    });

    let parsed: any = {};
    if (workspace?.settingsJson) {
      try {
        parsed = JSON.parse(workspace.settingsJson);
      } catch (e) {
        console.error("Failed to parse settingsJson on POST:", e);
      }
    }

    parsed.companyExpensesSettings = {
      companyCategories: cleanCompanyCategories,
      vendorCategories: cleanVendorCategories,
      billingCycles: cleanBillingCycles,
      paymentStatuses: cleanPaymentStatuses
    };

    await prisma.workspace.update({
      where: { id: wid },
      data: {
        settingsJson: JSON.stringify(parsed)
      }
    });

    return NextResponse.json({
      success: true,
      settings: parsed.companyExpensesSettings
    });
  } catch (error) {
    console.error("POST /api/company-expenses/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
