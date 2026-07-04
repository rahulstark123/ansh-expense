import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const { id } = await params;
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
        comments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("PATCH /api/admin/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const { id } = await params;

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/tickets/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
