import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { createWorkspaceWithTrial } from "@/lib/billing/workspace-billing";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, department, role, phoneNumber, companyName, companyAddress, employeeCount, country } = body;

    if (!name || !department || !role || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isManagerOrAdmin = role === "Admin" || role === "Manager" || role === "Owner";

    // Check if an employee record already exists for this email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: user.email! },
    });

    let newWid: number;
    if (existingEmployee && existingEmployee.wid) {
      newWid = existingEmployee.wid;
    } else {
      const workspace = await createWorkspaceWithTrial(
        companyName?.trim() || `${name}'s Workspace`
      );
      newWid = workspace.id;

      // Determine default currency from country
      const countryToCurrency: Record<string, string> = {
        US: "USD",
        IN: "INR",
        GB: "GBP",
        DE: "EUR",
        FR: "EUR",
        AU: "AUD",
        CA: "CAD",
        SG: "SGD",
        AE: "AED",
        JP: "JPY"
      };
      const defaultCurrency = countryToCurrency[country?.toUpperCase()] || "USD";
      const defaultMileageRate = defaultCurrency === "INR" ? 8 : 0.5;

      const initialSettingsJson = JSON.stringify({
        companyProfile: {
          name: companyName?.trim() || `${name}'s Workspace`,
          address: companyAddress?.trim() || "",
          employeeCount: employeeCount || "1-10",
        },
        workspaceSettings: {
          name: companyName?.trim() || `${name}'s Workspace`,
          currency: defaultCurrency,
          mileageRate: defaultMileageRate,
          wfhAllowed: true,
        }
      });

      await prisma.workspace.update({
        where: { id: newWid },
        data: {
          settingsJson: initialSettingsJson
        }
      });
    }

    let employee;
    const avatarInitials = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (existingEmployee) {
      // Migrate relations to new Supabase ID transactionally
      employee = await prisma.$transaction(async (tx) => {
        const newEmp = await tx.employee.create({
          data: {
            id: user.id,
            name: name,
            email: user.email!,
            role: role,
            department: department,
            avatarInitials: avatarInitials,
            phoneNumber: phoneNumber,
            status: existingEmployee.status || "Active",
            companyName: isManagerOrAdmin ? companyName : null,
            companyAddress: isManagerOrAdmin ? companyAddress : null,
            employeeCount: isManagerOrAdmin ? employeeCount : null,
            wid: newWid,
          },
        });

        // Update related records
        await tx.expenseClaim.updateMany({
          where: { employeeId: existingEmployee.id },
          data: { employeeId: user.id },
        });

        await tx.expenseClaim.updateMany({
          where: { approvedBy: existingEmployee.id },
          data: { approvedBy: user.id },
        });

        await tx.expenseComment.updateMany({
          where: { employeeId: existingEmployee.id },
          data: { employeeId: user.id },
        });

        // Delete old seed employee record
        await tx.employee.delete({
          where: { id: existingEmployee.id },
        });

        return newEmp;
      });
    } else {
      // Create brand new employee profile
      employee = await prisma.employee.create({
        data: {
          id: user.id,
          name: name,
          email: user.email!,
          role: role,
          department: department,
          avatarInitials: avatarInitials,
          phoneNumber: phoneNumber,
          status: "Active",
          companyName: isManagerOrAdmin ? companyName : null,
          companyAddress: isManagerOrAdmin ? companyAddress : null,
          employeeCount: isManagerOrAdmin ? employeeCount : null,
          wid: newWid,
        },
      });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error("API /api/auth/onboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
