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

    // Fetch all employees in this workspace
    const employees = await prisma.employee.findMany({
      where: { wid },
      orderBy: { name: "asc" },
    });

    // Fetch all workspace projects
    const projects = await prisma.workspaceProject.findMany({
      where: { wid },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all claims in this workspace
    const claims = await prisma.expenseClaim.findMany({
      where: { wid },
      include: {
        employee: true,
        project: true,
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    // Map database records to the frontend ExpenseClaim structure
    const mappedExpenses = claims.map((c) => ({
      id: c.id,
      employeeId: c.employeeId,
      employeeName: c.employee.name,
      employeeRole: c.employee.role,
      avatarInitials: c.employee.avatarInitials,
      title: c.title,
      category: c.category,
      amount: c.amount,
      currency: c.currency,
      date: c.date,
      status: c.status,
      reason: c.reason,
      receiptUrl: c.receiptUrl,
      isMileage: c.isMileage,
      mileageRate: c.mileageRate,
      distanceKm: c.distanceKm,
      taxPercent: c.taxPercent,
      taxAmount: c.taxAmount,
      projectId: c.projectId,
      projectName: c.project?.name || null,
      approvedBy: c.approvedBy,
      appliedAt: c.appliedAt.toISOString(),
      comments: c.comments.map((comm) => ({
        id: comm.id,
        claimId: comm.claimId,
        employeeId: comm.employeeId,
        authorName: comm.authorName,
        content: comm.content,
        createdAt: comm.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      currentUser: employee,
      employees,
      projects,
      expenses: mappedExpenses,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
