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
    const workspace = await prisma.workspace.findUnique({
      where: { id: wid },
    });

    let parsed: any = {};
    try {
      if (workspace?.settingsJson) {
        parsed = JSON.parse(workspace.settingsJson);
      }
    } catch (e) {
      console.error("Failed to parse settingsJson:", e);
    }

    const defaultDesignations = [
      { id: "des-1", name: "Managing Director" },
      { id: "des-2", name: "Engineering Lead" },
      { id: "des-3", name: "Senior UI Designer" },
      { id: "des-4", name: "Software Engineer" }
    ];

    const designations = parsed.designations || defaultDesignations;

    return NextResponse.json({ designations });
  } catch (error) {
    console.error("GET /api/settings/designation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager" || employee.role === "HR";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const wid = employee.wid ?? 1;
    const workspace = await prisma.workspace.findUnique({
      where: { id: wid },
    });

    let parsed: any = {};
    try {
      if (workspace?.settingsJson) {
        parsed = JSON.parse(workspace.settingsJson);
      }
    } catch (e) {
      console.error("Failed to parse settingsJson on POST:", e);
    }

    const defaultDesignations = [
      { id: "des-1", name: "Managing Director" },
      { id: "des-2", name: "Engineering Lead" },
      { id: "des-3", name: "Senior UI Designer" },
      { id: "des-4", name: "Software Engineer" }
    ];

    const designations = parsed.designations || defaultDesignations;
    const newDesignation = {
      id: `des-${Date.now()}`,
      name: name.trim()
    };

    designations.push(newDesignation);
    parsed.designations = designations;

    await prisma.workspace.update({
      where: { id: wid },
      data: {
        settingsJson: JSON.stringify(parsed)
      }
    });

    return NextResponse.json({ designation: newDesignation });
  } catch (error) {
    console.error("POST /api/settings/designation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
