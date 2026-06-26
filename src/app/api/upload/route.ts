import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import {
  buildReceiptObjectKey,
  getPublicUrl,
  isS3Configured,
  putObject,
} from "@/lib/s3";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const employee = await getAuthEmployee(req);
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 2 MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isS3Configured()) {
      const wid = employee.wid ?? 1;
      const objectKey = buildReceiptObjectKey(wid, file.name);

      await putObject(objectKey, buffer, file.type || "application/octet-stream");

      return NextResponse.json({ url: getPublicUrl(objectKey) });
    }

    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Data}`;
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
