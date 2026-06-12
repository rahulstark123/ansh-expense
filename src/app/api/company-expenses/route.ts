import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

// Helper to verify role access
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "All";
    const paymentStatus = searchParams.get("paymentStatus") || "All";

    const wid = employee.wid ?? 1;

    const whereClause: any = {
      wid,
    };

    if (category !== "All") {
      whereClause.category = category;
    }

    if (paymentStatus !== "All") {
      whereClause.paymentStatus = paymentStatus;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { vendor: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const expenses = await prisma.companyExpense.findMany({
      where: whereClause,
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
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("GET /api/company-expenses error:", error);
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
    const {
      title,
      amount,
      currency,
      category,
      date,
      paymentMethod,
      paymentStatus,
      receiptUrl,
      vendor,
      notes,
    } = body;

    if (!title?.trim() || amount === undefined || amount <= 0 || !category || !date || !paymentMethod || !paymentStatus) {
      return NextResponse.json({ error: "Missing required fields or invalid values" }, { status: 400 });
    }

    const wid = employee.wid ?? 1;
    const workspace = await prisma.workspace.findUnique({
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

    if (workspace?.settingsJson) {
      try {
        const parsed = JSON.parse(workspace.settingsJson);
        if (parsed.companyExpensesSettings?.companyCategories) {
          validCategories = parsed.companyExpensesSettings.companyCategories;
        }
        if (parsed.companyExpensesSettings?.paymentStatuses) {
          validStatuses = parsed.companyExpensesSettings.paymentStatuses;
        }
      } catch (e) {
        console.error("Failed to parse settingsJson in route validation:", e);
      }
    }

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category selection" }, { status: 400 });
    }

    const validMethods = ["Cash", "Company Card", "Bank Transfer", "Cheque", "Other"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method selection" }, { status: 400 });
    }

    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status selection" }, { status: 400 });
    }

    const expense = await prisma.companyExpense.create({
      data: {
        title: title.trim(),
        amount: Number(amount),
        currency: currency || "USD",
        category,
        date,
        paymentMethod,
        paymentStatus,
        receiptUrl: receiptUrl ? String(receiptUrl).trim() : null,
        vendor: vendor ? String(vendor).trim() : null,
        notes: notes ? String(notes).trim() : "",
        wid,
        loggedById: employee.id,
      },
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

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("POST /api/company-expenses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
