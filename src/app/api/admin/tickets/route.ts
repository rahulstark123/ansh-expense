import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const tickets = await prisma.supportTicket.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/admin/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
