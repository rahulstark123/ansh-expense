import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";

interface ActivityFeedItem {
  id: string;
  category: "expenses" | "projects" | "team" | "announcements";
  action: "created" | "updated" | "commented" | "joined" | "posted";
  title: string;
  description: string;
  actorName: string;
  actorInitials: string;
  timestamp: string;
  link: string;
}

export async function GET(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wid = employee.wid ?? 1;
    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get("category"); // expenses, projects, team, announcements
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20")));

    // Gather all members of this workspace for name-mapping of approvedBy id to name
    const workspaceEmployees = await prisma.employee.findMany({
      where: { wid },
      select: { id: true, name: true },
    });
    const employeeMap = new Map(workspaceEmployees.map((e) => [e.id, e.name]));

    const items: ActivityFeedItem[] = [];

    // Parallel fetch from the 5 entity sources in the workspace
    const [claims, comments, projects, teamMembers, announcements] = await Promise.all([
      // 1. Claims: created or status updated
      (!categoryFilter || categoryFilter === "expenses")
        ? prisma.expenseClaim.findMany({
            where: { wid },
            include: { employee: true },
            orderBy: { appliedAt: "desc" },
            take: 50,
          })
        : Promise.resolve([]),

      // 2. Comments on claims in this workspace
      (!categoryFilter || categoryFilter === "expenses")
        ? prisma.expenseComment.findMany({
            where: { claim: { wid } },
            include: { claim: true },
            orderBy: { createdAt: "desc" },
            take: 50,
          })
        : Promise.resolve([]),

      // 3. Projects created in this workspace
      (!categoryFilter || categoryFilter === "projects")
        ? prisma.workspaceProject.findMany({
            where: { wid },
            orderBy: { createdAt: "desc" },
            take: 30,
          })
        : Promise.resolve([]),

      // 4. Team members joined
      (!categoryFilter || categoryFilter === "team")
        ? prisma.employee.findMany({
            where: { wid },
            orderBy: { createdAt: "desc" },
            take: 30,
          })
        : Promise.resolve([]),

      // 5. Announcements posted
      (!categoryFilter || categoryFilter === "announcements")
        ? prisma.announcement.findMany({
            where: { wid, archived: false },
            orderBy: { createdAt: "desc" },
            take: 30,
          })
        : Promise.resolve([]),
    ]);

    // Map Claims to Activity Items
    claims.forEach((claim) => {
      // Created event
      items.push({
        id: `claim-create-${claim.id}`,
        category: "expenses",
        action: "created",
        title: "Expense claim submitted",
        description: `${claim.employee.name} submitted: "${claim.title}" for ₹${claim.amount.toLocaleString()}`,
        actorName: claim.employee.name,
        actorInitials: claim.employee.avatarInitials,
        timestamp: claim.appliedAt.toISOString(),
        link: `/expenses`,
      });

      // Status change event (if not pending)
      if (claim.status !== "Pending") {
        const approverName = claim.approvedBy ? (employeeMap.get(claim.approvedBy) || "Management") : "Management";
        let title = "Expense claim approved";
        if (claim.status === "Rejected") title = "Expense claim rejected";
        if (claim.status === "NeedsInfo") title = "Expense claim needs info";

        items.push({
          id: `claim-update-${claim.id}`,
          category: "expenses",
          action: "updated",
          title,
          description: `Claim "${claim.title}" was marked as ${claim.status.toLowerCase()} by ${approverName}`,
          actorName: approverName,
          actorInitials: approverName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase(),
          // Shift the timestamp slightly later than appliedAt to prevent exact overlap
          timestamp: new Date(claim.appliedAt.getTime() + 1000).toISOString(),
          link: `/expenses`,
        });
      }
    });

    // Map Comments to Activity Items
    comments.forEach((comment) => {
      items.push({
        id: `comment-${comment.id}`,
        category: "expenses",
        action: "commented",
        title: "New comment on expense claim",
        description: `${comment.authorName} commented: "${comment.content}" on claim "${comment.claim.title}"`,
        actorName: comment.authorName,
        actorInitials: comment.authorName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase(),
        timestamp: comment.createdAt.toISOString(),
        link: `/expenses`,
      });
    });

    // Map Projects to Activity Items
    projects.forEach((proj) => {
      items.push({
        id: `project-${proj.id}`,
        category: "projects",
        action: "created",
        title: "New project created",
        description: `Project "${proj.name}" was created ${proj.clientName ? `for client ${proj.clientName}` : ""}`,
        actorName: "System",
        actorInitials: "SY",
        timestamp: proj.createdAt.toISOString(),
        link: `/expenses/projects`,
      });
    });

    // Map Team to Activity Items
    teamMembers.forEach((member) => {
      items.push({
        id: `member-${member.id}`,
        category: "team",
        action: "joined",
        title: "Team member joined",
        description: `${member.name} joined as a ${member.designation || member.role} in ${member.department}`,
        actorName: member.name,
        actorInitials: member.avatarInitials,
        timestamp: member.createdAt.toISOString(),
        link: `/team`,
      });
    });

    // Map Announcements to Activity Items
    announcements.forEach((ann) => {
      items.push({
        id: `announcement-${ann.id}`,
        category: "announcements",
        action: "posted",
        title: "Announcement published",
        description: `"${ann.title}" was published by ${ann.authorName}`,
        actorName: ann.authorName,
        actorInitials: ann.authorName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase(),
        timestamp: ann.createdAt.toISOString(),
        link: `/announcements`,
      });
    });

    // Sort all by timestamp descending
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const totalItems = items.length;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      activity: paginatedItems,
      page,
      limit,
      totalCount: totalItems,
      hasMore: page * limit < totalItems,
    });
  } catch (error) {
    console.error("GET /api/activity error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
