import { NextResponse } from "next/server";
import { ADMIN_SESSION_TOKEN } from "./auth";

export function requireAdminAuth(req: Request) {
  const authHeader = req.headers.get("X-Admin-Auth");
  if (authHeader !== ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
