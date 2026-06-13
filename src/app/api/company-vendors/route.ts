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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "All";

    const wid = employee.wid ?? 1;

    const whereClause: any = {
      wid,
    };

    if (category !== "All") {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { website: { contains: search, mode: "insensitive" } },
      ];
    }

    const vendors = await prisma.companyVendor.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("GET /api/company-vendors error:", error);
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
    const { name, contactName, email, phone, category, website } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Vendor name is required" }, { status: 400 });
    }

    const wid = employee.wid ?? 1;

    // Check unique vendor name in workspace
    const existing = await prisma.companyVendor.findFirst({
      where: { name: name.trim(), wid },
    });

    if (existing) {
      return NextResponse.json({ error: "Vendor with this name already exists in the registry" }, { status: 400 });
    }

    const vendor = await prisma.companyVendor.create({
      data: {
        name: name.trim(),
        contactName: contactName?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        category: category?.trim() || null,
        website: website?.trim() || null,
        wid,
      },
    });

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("POST /api/company-vendors error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
