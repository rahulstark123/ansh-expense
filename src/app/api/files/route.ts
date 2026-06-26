import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import {
  getObjectBytes,
  isAllowedObjectKey,
  isS3Configured,
} from "@/lib/s3";

export async function GET(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "Object storage is not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key")?.trim();
    const download = searchParams.get("download") === "1";

    if (!key || !isAllowedObjectKey(key)) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
    }

    const { bytes, contentType } = await getObjectBytes(key);
    const filename = key.split("/").pop() || "file";
    const disposition = download ? "attachment" : "inline";

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/files error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
