import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
      employee.role.toLowerCase()
    );

    if (!isManagement) {
      return NextResponse.json({ error: "Forbidden: Management privileges required" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing || existing.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 444 });
    }

    const body = await req.json();
    const { title, body: text, pinned, archived } = body;

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(text !== undefined ? { body: text.trim() } : {}),
        ...(pinned !== undefined ? { pinned: Boolean(pinned) } : {}),
        ...(archived !== undefined ? { archived: Boolean(archived) } : {}),
      },
    });

    return NextResponse.json({ announcement: updated });
  } catch (error) {
    console.error("PATCH /api/announcements/[id] error:", error);
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

    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
      employee.role.toLowerCase()
    );

    if (!isManagement) {
      return NextResponse.json({ error: "Forbidden: Management privileges required" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing || existing.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 444 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/announcements/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
