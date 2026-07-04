import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, content } = body;

    if (!ticketId || !content?.trim()) {
      return NextResponse.json({ error: "Ticket ID and comment content are required" }, { status: 400 });
    }

    // Verify ticket exists in the same workspace
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    if (ticket.wid !== (employee.wid ?? 1)) {
      return NextResponse.json({ error: "Unauthorized workspace comment" }, { status: 403 });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        employeeId: employee.id,
        authorName: employee.name,
        content: content.trim(),
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("POST /api/tickets/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
