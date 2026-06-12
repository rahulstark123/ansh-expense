import { NextResponse } from "next/server";
import { getAuthEmployee } from "@/lib/auth-helper";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const keyId = process.env.S3_ACCESS_KEY_ID || "";
    const keySecret = process.env.S3_SECRET_ACCESS_KEY || "";

    if (keyId && keySecret) {
      // S3 is configured, perform upload
      const wid = employee.wid ?? 1;
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const s3Key = `receipts/${wid}/${Date.now()}_${cleanName}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(uploadCommand);

      // Return the public S3 URL
      const endpoint = process.env.S3_ENDPOINT || "https://hjnqlybokoljhxyzsqqi.storage.supabase.co/storage/v1/s3";
      // Ensure clean URL structure
      const baseUrl = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
      const publicUrl = `${baseUrl}${BUCKET_NAME}/${s3Key}`;

      return NextResponse.json({ url: publicUrl });
    } else {
      // Fallback: convert file to a base64 Data URL
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({ url: dataUrl });
    }
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
