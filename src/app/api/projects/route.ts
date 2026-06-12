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

    const projects = await prisma.workspaceProject.findMany({
      where: { wid },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Creating/editing projects requires Admin or Manager permissions
    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, clientName, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const wid = employee.wid ?? 1;

    if (id) {
      // Update existing project
      const updated = await prisma.workspaceProject.update({
        where: { id },
        data: {
          name: name.trim(),
          clientName: clientName?.trim() || null,
          description: description?.trim() || null,
        },
      });
      return NextResponse.json({ project: updated });
    } else {
      // Create new project
      // Check for unique name in this workspace
      const existing = await prisma.workspaceProject.findUnique({
        where: {
          name_wid: {
            name: name.trim(),
            wid,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "A project with this name already exists" }, { status: 400 });
      }

      const created = await prisma.workspaceProject.create({
        data: {
          name: name.trim(),
          clientName: clientName?.trim() || null,
          description: description?.trim() || null,
          wid,
        },
      });
      return NextResponse.json({ project: created });
    }
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    await prisma.workspaceProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
