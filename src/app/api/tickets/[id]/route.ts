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

    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket || ticket.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 444 });
    }

    const userRole = employee.role.toLowerCase();
    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);
    const isOwnerOfTicket = ticket.employeeId === employee.id;

    if (!isManagement && !isOwnerOfTicket) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { status, resolution } = body;

    const updateData: Record<string, any> = {};

    if (status !== undefined) {
      const validStatuses = ["Open", "In Progress", "Resolved"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = status;
    }

    if (resolution !== undefined) {
      updateData.resolution = resolution ? String(resolution).trim() : null;
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: {
            name: true,
            email: true,
            avatarInitials: true,
            role: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
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

    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket || ticket.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 444 });
    }

    const userRole = employee.role.toLowerCase();
    const isAdminOrOwner = ["admin", "owner"].includes(userRole);
    const isOwnerOfTicket = ticket.employeeId === employee.id;

    if (!isAdminOrOwner && !isOwnerOfTicket) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
