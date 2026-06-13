import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

function buildAvatarInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function GET(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      profile: employee,
    });
  } catch (error) {
    console.error("API /api/profile GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updateData: Record<string, string | null> = {};

    if (body.name !== undefined) {
      const trimmed = String(body.name).trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = trimmed;
      updateData.avatarInitials = buildAvatarInitials(trimmed);
    }

    if (body.phoneNumber !== undefined) {
      updateData.phoneNumber = body.phoneNumber || null;
    }
    if (body.personalEmail !== undefined) {
      updateData.personalEmail = body.personalEmail
        ? String(body.personalEmail).trim().toLowerCase()
        : null;
    }
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth || null;
    }
    if (body.emergencyContactName !== undefined) {
      updateData.emergencyContactName = body.emergencyContactName
        ? String(body.emergencyContactName).trim()
        : null;
    }
    if (body.emergencyContactPhone !== undefined) {
      updateData.emergencyContactPhone = body.emergencyContactPhone || null;
    }
    if (body.bloodGroup !== undefined) {
      updateData.bloodGroup = body.bloodGroup || null;
    }

    // Role-based verification for professional details
    const isAuthorized =
      employee.role === "Admin" ||
      employee.role === "Manager" ||
      employee.role === "Owner" ||
      employee.role === "HR Manager" ||
      employee.role === "HR";

    if (isAuthorized) {
      if (body.employeeCode !== undefined) {
        updateData.employeeCode = body.employeeCode ? String(body.employeeCode).trim() : null;
      }
      if (body.designation !== undefined) {
        updateData.designation = body.designation ? String(body.designation).trim() : null;
      }
      if (body.branch !== undefined) {
        updateData.branch = body.branch ? String(body.branch).trim() : null;
      }
      if (body.reportingManager !== undefined) {
        updateData.reportingManager = body.reportingManager ? String(body.reportingManager).trim() : null;
      }
      if (body.reportingHR !== undefined) {
        updateData.reportingHR = body.reportingHR ? String(body.reportingHR).trim() : null;
      }
      if (body.employmentType !== undefined) {
        updateData.employmentType = body.employmentType ? String(body.employmentType).trim() : null;
      }
      if (body.workLocation !== undefined) {
        updateData.workLocation = body.workLocation ? String(body.workLocation).trim() : null;
      }
      if (body.joiningDate !== undefined) {
        updateData.joiningDate = body.joiningDate || null;
      }
      if (body.department !== undefined) {
        updateData.department = body.department ? String(body.department).trim() : null;
      }
      if (body.role !== undefined) {
        const roleStr = String(body.role).trim();
        if (roleStr) {
          updateData.role = roleStr;
        }
      }
    }

    const hasUpdate = Object.keys(updateData).length > 0;
    if (!hasUpdate) {
      return NextResponse.json({ error: "No profile fields to update" }, { status: 400 });
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: updateData,
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("API /api/profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
