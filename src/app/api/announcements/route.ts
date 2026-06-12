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
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
      employee.role.toLowerCase()
    );

    // Fetch announcements in this workspace
    const announcements = await prisma.announcement.findMany({
      where: {
        wid,
        ...(includeArchived && isManagement ? {} : { archived: false }),
      },
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isManagement = ["admin", "manager", "owner", "hr", "hr manager"].includes(
      employee.role.toLowerCase()
    );

    if (!isManagement) {
      return NextResponse.json({ error: "Forbidden: Management privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, body: text, pinned } = body;

    if (!title?.trim() || !text?.trim()) {
      return NextResponse.json({ error: "Missing title or body content" }, { status: 400 });
    }

    const created = await prisma.announcement.create({
      data: {
        title: title.trim(),
        body: text.trim(),
        pinned: Boolean(pinned),
        archived: false,
        wid: employee.wid ?? 1,
        authorId: employee.id,
        authorName: employee.name,
      },
    });

    return NextResponse.json({ announcement: created });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
