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

    const defaultBranches = [
      {
        id: "branch-hq",
        name: "Main HQ",
        address: "123 Corporate Tower, New Delhi, India",
        pincode: "110001",
        city: "New Delhi",
        state: "Delhi",
        latitude: 28.6139,
        longitude: 77.2090,
        allowWFH: true
      }
    ];

    return NextResponse.json({
      settings: {
        branches: parsed.branches || defaultBranches,
        companyProfile: parsed.companyProfile || {
          name: workspace?.name || employee.companyName || "",
          address: employee.companyAddress || "",
          employeeCount: employee.employeeCount || "1-10",
        },
        leaveSettings: parsed.leaveSettings || {},
        attendanceSettings: parsed.attendanceSettings || {},
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { companyProfile, branches } = body;

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

    if (companyProfile) {
      parsed.companyProfile = {
        name: companyProfile.name?.trim() || "",
        address: companyProfile.address?.trim() || "",
        employeeCount: companyProfile.employeeCount || "1-10",
      };

      // Update Workspace name
      await prisma.workspace.update({
        where: { id: wid },
        data: {
          name: companyProfile.name?.trim() || null,
        },
      });

      // Update Employee details
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          companyName: companyProfile.name?.trim() || null,
          companyAddress: companyProfile.address?.trim() || null,
          employeeCount: companyProfile.employeeCount || null,
        },
      });
    }

    if (branches) {
      parsed.branches = branches;
    }

    // Save updated settingsJson back to workspace
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: wid },
      data: {
        settingsJson: JSON.stringify(parsed),
      },
    });

    return NextResponse.json({
      settings: {
        branches: parsed.branches || [],
        companyProfile: parsed.companyProfile || {
          name: updatedWorkspace.name || "",
          address: employee.companyAddress || "",
          employeeCount: employee.employeeCount || "1-10",
        },
        leaveSettings: parsed.leaveSettings || {},
        attendanceSettings: parsed.attendanceSettings || {},
      },
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
