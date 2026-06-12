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

    return NextResponse.json({
      settings: {
        companyProfile: {
          name: workspace?.name || employee.companyName || "",
          address: employee.companyAddress || "",
          employeeCount: employee.employeeCount || "1-10",
        },
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
    const { companyProfile } = body;

    if (!companyProfile) {
      return NextResponse.json({ error: "Company profile details are required" }, { status: 400 });
    }

    const wid = employee.wid ?? 1;

    // Update Workspace name
    await prisma.workspace.update({
      where: { id: wid },
      data: {
        name: companyProfile.name?.trim() || null,
      },
    });

    // Update Employee details
    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        companyName: companyProfile.name?.trim() || null,
        companyAddress: companyProfile.address?.trim() || null,
        employeeCount: companyProfile.employeeCount || null,
      },
    });

    return NextResponse.json({
      settings: {
        companyProfile: {
          name: companyProfile.name?.trim() || "",
          address: companyProfile.address?.trim() || "",
          employeeCount: companyProfile.employeeCount || "1-10",
        },
      },
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
