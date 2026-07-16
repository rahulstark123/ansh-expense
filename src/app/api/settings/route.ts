import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

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

const defaultDepartments = [
  "Engineering",
  "Human Resources",
  "Product Design",
  "Data Analytics",
  "Executive",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Legal & Compliance",
  "Customer Support",
  "IT Support"
];

const defaultWorkLocations = [
  "Remote",
  "On-site",
  "Hybrid"
];

const defaultDesignations = [
  { id: "des-1", name: "Managing Director" },
  { id: "des-2", name: "Engineering Lead" },
  { id: "des-3", name: "Senior UI Designer" },
  { id: "des-4", name: "Software Engineer" }
];

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

    return NextResponse.json({
      settings: {
        branches: parsed.branches || defaultBranches,
        companyProfile: {
          name: parsed.companyProfile?.name || workspace?.name || employee.companyName || "",
          address: parsed.companyProfile?.address || employee.companyAddress || "",
          employeeCount: parsed.companyProfile?.employeeCount || employee.employeeCount || "1-10",
          industry: parsed.companyProfile?.industry || "",
          taxId: parsed.companyProfile?.taxId || "",
          website: parsed.companyProfile?.website || "",
          email: parsed.companyProfile?.email || "",
          phone: parsed.companyProfile?.phone || "",
          legalName: parsed.companyProfile?.legalName || parsed.companyProfile?.name || workspace?.name || employee.companyName || "",
          entityType: parsed.companyProfile?.entityType || "Private Limited",
          incorporationDate: parsed.companyProfile?.incorporationDate || "",
          dunsNumber: parsed.companyProfile?.dunsNumber || "",
          fiscalYearStart: parsed.companyProfile?.fiscalYearStart || "April",
          registeredAddress: parsed.companyProfile?.registeredAddress || parsed.companyProfile?.address || employee.companyAddress || "",
          sameAsHq: parsed.companyProfile?.sameAsHq ?? false,
        },
        workspaceSettings: parsed.workspaceSettings || {
          name: workspace?.name || employee.companyName || "",
          currency: "USD",
          mileageRate: 8,
          wfhAllowed: true,
        },
        departments: parsed.departments || defaultDepartments,
        workLocations: parsed.workLocations || defaultWorkLocations,
        designations: parsed.designations || defaultDesignations,
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

    const isAuthorized = employee.role === "Admin" || employee.role === "Manager" || employee.role === "Owner" || employee.role === "HR Manager" || employee.role === "HR";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { companyProfile, branches, workspaceSettings, departments, workLocations, designations } = body;

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
        industry: companyProfile.industry?.trim() || "",
        taxId: companyProfile.taxId?.trim() || "",
        website: companyProfile.website?.trim() || "",
        email: companyProfile.email?.trim() || "",
        phone: companyProfile.phone?.trim() || "",
        legalName: companyProfile.legalName?.trim() || "",
        entityType: companyProfile.entityType || "Private Limited",
        incorporationDate: companyProfile.incorporationDate?.trim() || "",
        dunsNumber: companyProfile.dunsNumber?.trim() || "",
        fiscalYearStart: companyProfile.fiscalYearStart || "April",
        registeredAddress: companyProfile.registeredAddress?.trim() || "",
        sameAsHq: companyProfile.sameAsHq ?? false,
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

    if (workspaceSettings) {
      parsed.workspaceSettings = {
        name: workspaceSettings.name?.trim() || parsed.companyProfile?.name || "",
        currency: workspaceSettings.currency || "USD",
        mileageRate: Number(workspaceSettings.mileageRate ?? 8),
        wfhAllowed: Boolean(workspaceSettings.wfhAllowed ?? true),
      };

      // Update Workspace name
      await prisma.workspace.update({
        where: { id: wid },
        data: {
          name: parsed.workspaceSettings.name || null,
        },
      });
    }

    if (branches) {
      parsed.branches = branches;
    }

    if (departments) {
      parsed.departments = departments;
    }

    if (workLocations) {
      parsed.workLocations = workLocations;
    }

    if (designations) {
      parsed.designations = designations;
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
        branches: parsed.branches || defaultBranches,
        companyProfile: {
          name: parsed.companyProfile?.name || updatedWorkspace.name || "",
          address: parsed.companyProfile?.address || employee.companyAddress || "",
          employeeCount: parsed.companyProfile?.employeeCount || employee.employeeCount || "1-10",
          industry: parsed.companyProfile?.industry || "",
          taxId: parsed.companyProfile?.taxId || "",
          website: parsed.companyProfile?.website || "",
          email: parsed.companyProfile?.email || "",
          phone: parsed.companyProfile?.phone || "",
          legalName: parsed.companyProfile?.legalName || parsed.companyProfile?.name || updatedWorkspace.name || "",
          entityType: parsed.companyProfile?.entityType || "Private Limited",
          incorporationDate: parsed.companyProfile?.incorporationDate || "",
          dunsNumber: parsed.companyProfile?.dunsNumber || "",
          fiscalYearStart: parsed.companyProfile?.fiscalYearStart || "April",
          registeredAddress: parsed.companyProfile?.registeredAddress || parsed.companyProfile?.address || employee.companyAddress || "",
          sameAsHq: parsed.companyProfile?.sameAsHq ?? false,
        },
        workspaceSettings: parsed.workspaceSettings || {
          name: updatedWorkspace.name || "",
          currency: "USD",
          mileageRate: 8,
          wfhAllowed: true,
        },
        departments: parsed.departments || defaultDepartments,
        workLocations: parsed.workLocations || defaultWorkLocations,
        designations: parsed.designations || defaultDesignations,
        leaveSettings: parsed.leaveSettings || {},
        attendanceSettings: parsed.attendanceSettings || {},
      },
    });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
