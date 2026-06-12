import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wid = employee.wid ?? 1;
    const userRole = employee.role.toLowerCase();
    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(userRole);

    let tickets;
    if (isManagement) {
      // Management sees all tickets in this workspace
      tickets = await prisma.supportTicket.findMany({
        where: { wid },
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
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Employees only see their own tickets
      tickets = await prisma.supportTicket.findMany({
        where: {
          wid,
          employeeId: employee.id,
        },
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
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subject, description, priority, category } = body;

    if (!subject?.trim() || !description?.trim() || !priority || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validPriorities = ["Low", "Medium", "High"];
    const validCategories = ["IT Support", "HR Support", "Finance & Payouts", "General Inquiry"];

    if (!validPriorities.includes(priority) || !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid priority or category" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: subject.trim(),
        description: description.trim(),
        priority,
        category,
        status: "Open",
        employeeId: employee.id,
        wid: employee.wid ?? 1,
      },
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

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("POST /api/tickets error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
