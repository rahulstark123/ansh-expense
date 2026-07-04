import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const authError = requireAdminAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const { ticketId, content } = body;

    if (!ticketId || !content?.trim()) {
      return NextResponse.json({ error: "Ticket ID and comment content are required" }, { status: 400 });
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        employeeId: "admin", // Identifier for admin reply
        authorName: "Support Team",
        content: content.trim(),
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("POST /api/admin/tickets/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
