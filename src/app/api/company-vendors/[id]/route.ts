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
    const vendor = await prisma.companyVendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 444 });
    }

    const body = await req.json();
    const { name, contactName, email, phone, category, website } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Vendor name cannot be empty" }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (contactName !== undefined) updateData.contactName = contactName?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;

    const updated = await prisma.companyVendor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ vendor: updated });
  } catch (error) {
    console.error("PATCH /api/company-vendors/[id] error:", error);
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
    const vendor = await prisma.companyVendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 444 });
    }

    await prisma.companyVendor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/company-vendors/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
